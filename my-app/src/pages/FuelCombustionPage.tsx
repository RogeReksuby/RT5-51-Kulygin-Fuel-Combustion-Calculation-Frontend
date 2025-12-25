import { type FC, useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../store';
import { 
  getCombustionById,
  updateCombustionMolarVolume,
  deleteCurrentCombustion,
  formCombustion,
  updateFuelVolumeInCombustion,
  deleteFuelFromCombustion,
  selectCombustionDetails,
  selectCombustionsLoading,
  selectCombustionsError,
  clearError,
  clearCombustionDetails
} from '../store/slices/applicationsSlice';
import { Header } from '../components/FuelDetailsHeader';
import { Footer } from '../components/FuelFooter';
import { ROUTES } from '../../Routes';
import { transformImageUrl } from '../target_config';
import DefaultImage from '../assets/DefaultImage.jpg';
import './FuelCombustionPage.css';
import { Breadcrumbs } from '../components/BreadCrumbs';

// Типы данных от API
interface ApplicationFuel {
  id: number;
  title: string;
  heat: number;
  molar_mass?: number;
  density?: number;
  card_image?: string;
  short_desc?: string;
  full_desc?: string;
  is_gas?: boolean;
  volume?: number;
  fuel_volume?: number;
  calculation_result?: number;
}

interface ApplicationData {
  ID?: number;
  Status?: string;
  MolarVolume?: number;
  CreatorLogin?: string;
  ModeratorLogin?: string;
  DateCreate?: string;
  DateUpdate?: string;
  DateFinish?: string;
  FinalResult?: number;
  Fuels?: ApplicationFuel[];
}

const FuelCombustionPage: FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  
  const { isAuthenticated } = useSelector((state: RootState) => state.user);
  const combustionDetails = useSelector(selectCombustionDetails);
  const loading = useSelector(selectCombustionsLoading);
  const error = useSelector(selectCombustionsError);
  
  const [molarVolumeInput, setMolarVolumeInput] = useState<string>('22.4');
  const [fuelVolumeInputs, setFuelVolumeInputs] = useState<{[key: number]: string}>({});
  const [savingMolarVolume, setSavingMolarVolume] = useState(false);
  const [savingFuelVolumes, setSavingFuelVolumes] = useState<{[key: number]: boolean}>({});

  // Приводим данные к нужному интерфейсу
  const application: ApplicationData | null = combustionDetails?.data || null;

  // Загрузка данных заявки
  useEffect(() => {
    const checkAuthAndLoad = () => {
      if (!isAuthenticated) {
        navigate(ROUTES.LOGIN);
        return;
      }

      if (!id) {
        dispatch(clearError());
        navigate(ROUTES.FUELS);
        return;
      }

      dispatch(getCombustionById(Number(id)));
    };

    // Небольшая задержка для проверки авторизации
    const timer = setTimeout(checkAuthAndLoad, 1000);
    return () => {
      clearTimeout(timer);
      dispatch(clearCombustionDetails());
    };
  }, [id, isAuthenticated, navigate, dispatch]);

  // Инициализация значений при загрузке данных
  useEffect(() => {
    if (application) {
      // Инициализируем молярный объем
      if (application.MolarVolume) {
        setMolarVolumeInput(application.MolarVolume.toString());
      } else {
        setMolarVolumeInput('22.4');
      }
      
      // Инициализируем объемы топлива
      const initialVolumes: {[key: number]: string} = {};
      application.Fuels?.forEach(fuel => {
        initialVolumes[fuel.id] = (fuel.fuel_volume || fuel.volume || 0).toString();
      });
      setFuelVolumeInputs(initialVolumes);
    }
  }, [application]);

  // Обработчик изменения молярного объема
  const handleMolarVolumeChange = useCallback((value: string) => {
    setMolarVolumeInput(value);
  }, []);

  // Сохранение молярного объема
  const handleSaveMolarVolume = useCallback(async () => {
    if (!application || !id) return;
    
    const molarValue = parseFloat(molarVolumeInput) || 22.4;
    
    try {
      setSavingMolarVolume(true);
      await dispatch(updateCombustionMolarVolume({ 
        id: Number(id), 
        molarVolume: molarValue 
      })).unwrap();
      
      // Перезагружаем данные после успешного сохранения
      dispatch(getCombustionById(Number(id)));
      
    } catch (error: any) {
      console.error('Ошибка сохранения молярного объема:', error);
      alert(error.message || 'Не удалось сохранить молярный объем');
    } finally {
      setSavingMolarVolume(false);
    }
  }, [application, id, molarVolumeInput, dispatch]);

  // Обработчик изменения объема топлива
  const handleFuelVolumeChange = useCallback((fuelId: number, newVolume: string) => {
    setFuelVolumeInputs(prev => ({
      ...prev,
      [fuelId]: newVolume
    }));
  }, []);

  // Сохранение объема одного вида топлива
  const handleSaveFuelVolume = useCallback(async (fuelId: number) => {
    if (!application || !id) return;
    
    const volumeValue = parseFloat(fuelVolumeInputs[fuelId]) || 0;
    
    try {
      setSavingFuelVolumes(prev => ({ ...prev, [fuelId]: true }));
      
      await dispatch(updateFuelVolumeInCombustion({ 
        fuelId, 
        fuelVolume: volumeValue 
      })).unwrap();
      
      // Перезагружаем данные после успешного сохранения
      dispatch(getCombustionById(Number(id)));
      
    } catch (error: any) {
      console.error('Ошибка сохранения объема топлива:', error);
      alert(error.message || 'Не удалось сохранить объем топлива');
    } finally {
      setSavingFuelVolumes(prev => ({ ...prev, [fuelId]: false }));
    }
  }, [application, id, fuelVolumeInputs, dispatch]);

  // Удаление заявки
  const handleDeleteApplication = useCallback(async () => {
    if (!id || !application) return;
    
    if (window.confirm('Вы уверены, что хотите удалить этот расчет?')) {
      try {
        await dispatch(deleteCurrentCombustion()).unwrap();
        navigate(ROUTES.FUELS);
      } catch (error: any) {
        console.error('Ошибка удаления расчета:', error);
        alert(error.message || 'Не удалось удалить расчет');
      }
    }
  }, [id, application, dispatch, navigate]);

  // Отправка заявки на расчет
  const handleSubmitApplication = useCallback(async () => {
    if (!id || !application) return;
    
    try {
      await dispatch(formCombustion(Number(id))).unwrap();
      // Перезагружаем данные после отправки
      dispatch(getCombustionById(Number(id)));
      alert('Расчет успешно отправлен!');
    } catch (error: any) {
      console.error('Ошибка отправки расчета:', error);
      alert(error.message || 'Не удалось отправить расчет');
    }
  }, [id, application, dispatch]);

  // Удаление топлива из заявки
  const handleRemoveFuel = useCallback(async (fuelId: number) => {
    if (!application || !id) return;
    
    if (window.confirm('Удалить это топливо из расчета?')) {
      try {
        await dispatch(deleteFuelFromCombustion(fuelId)).unwrap();
        // Перезагружаем данные после удаления
        dispatch(getCombustionById(Number(id)));
      } catch (error: any) {
        console.error('Ошибка удаления топлива:', error);
        alert(error.message || 'Не удалось удалить топливо из расчета');
      }
    }
  }, [application, id, dispatch]);

  // Функция для отображения результата расчета
  const displayEnergyResult = useCallback((fuel: ApplicationFuel): string => {
    const isCompleted = application?.Status === 'approved' || application?.Status === 'завершён';
    if (isCompleted && fuel.calculation_result && fuel.calculation_result > 0) {
      return `${fuel.calculation_result.toFixed(2)} кДж`;
    }
    return "—";
  }, [application]);

  // Функция для отображения суммарной энергии
  const displayTotalEnergy = useCallback((): string => {
    const isCompleted = application?.Status === 'approved' || application?.Status === 'завершён';
    if (isCompleted && application?.FinalResult && application.FinalResult > 0) {
      return application.FinalResult.toFixed(2);
    }
    return "—";
  }, [application]);

  // Получение текста статуса
  const getStatusText = useCallback((status?: string): string => {
    const statusMap: { [key: string]: string } = {
      'draft': 'Черновик',
      'submitted': 'На расчёте', 
      'approved': 'Завершена',
      'rejected': 'Отклонена',
      'черновик': 'Черновик',
      'сформирован': 'На расчёте',
      'завершён': 'Завершена',
      'отклонён': 'Отклонена'
    };
    return statusMap[status || ''] || status || 'Неизвестно';
  }, []);

  const isDraft = application?.Status === 'draft' || application?.Status === 'черновик';

  if (loading) {
    return (
      <div>
        <Header />
        <div className="loading-container">Загрузка расчета...</div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Header />
        <Breadcrumbs />
        <div className="error-container">
          {error}
          <button 
            onClick={() => navigate(ROUTES.FUELS)}
            style={{marginTop: '20px', padding: '10px 20px'}}
            className="bButton"
          >
            Вернуться к топливу
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  if (!application) {
    return (
      <div>
        <Header />
        <Breadcrumbs />
        <div className="error-container">Расчет не найден</div>
        <Footer />
      </div>
    );
  }

  return (
    <div>
      <Header />
      <Breadcrumbs />
      <div className="titleReq">Состав расчета #{application.ID}</div>

      {/* Кнопки управления */}
      <div className="buttonsReq">
        {isDraft ? (
          <>
            <button 
              className="wButton" 
              onClick={handleSubmitApplication}
              style={{width: '100%'}}
              disabled={loading}
            >
              {loading ? 'Отправка...' : 'Отправить на расчет'}
            </button>
            <button 
              className="wButton" 
              onClick={handleDeleteApplication}
              style={{width: '100%', background: '#dc3545'}}
              disabled={loading}
            >
              Удалить расчет
            </button>
          </>
        ) : (
          <div className="application-status">
            Статус: {getStatusText(application.Status)}
            {(application.Status === 'approved' || application.Status === 'завершён') && 
             application.FinalResult && application.FinalResult > 0 && (
              <span style={{marginLeft: '20px'}}>
                Результат: {application.FinalResult} кДж
              </span>
            )}
          </div>
        )}
      </div>

      {/* Молярный объем с кнопкой сохранить */}
      {isDraft && (
        <div className="resFrameReq" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          Молярный объем (22.4 для н.у.):
          <input 
            className="volumeSpaceReq" 
            type="number"
            step="0.1"
            value={molarVolumeInput}
            onChange={(e) => handleMolarVolumeChange(e.target.value)}
            placeholder="22.4"
            disabled={savingMolarVolume}
          />
          <button 
            className="bButton"
            onClick={handleSaveMolarVolume}
            disabled={savingMolarVolume || loading}
          >
            {savingMolarVolume ? 'Сохранение...' : 'Сохранить'}
          </button>
        </div>
      )}

      {/* Таблица топлив */}
      <table className="fuels-table">
        <thead>
          <tr>
            <th>Топливо</th>
            <th>Объём (л)</th>
            <th>Выделение энергии (кДж)</th>
            {isDraft && <th>Действия</th>}
          </tr>
        </thead>
        <tbody>
          {application.Fuels && application.Fuels.length > 0 ? (
            application.Fuels.map((fuel, index) => (
              <tr key={`${fuel.id}-${index}`} className="fuel-row">
                <td className="fuel-cell">
                  <div 
                    className="cardReq" 
                    style={{
                      background: `linear-gradient(0deg, rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url(${transformImageUrl(fuel.card_image) || DefaultImage}) center/cover no-repeat`
                    }}
                  >
                    <div className="titleButtonCardReq">
                      <div className="titleCardReq">{fuel.title || 'Неизвестное топливо'}</div>
                      <div className="buttonFrameCardBox">
                        <button 
                          className="bButton"
                          onClick={() => navigate(`${ROUTES.FUELS}/${fuel.id}`)}
                          disabled={loading}
                        >
                          Подробнее &gt;
                        </button>
                      </div>
                    </div>
                  </div>
                </td>
                <td className="volume-cell">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <input 
                      className="volumeSpaceReq" 
                      type="number"
                      step="0.1"
                      value={fuelVolumeInputs[fuel.id] || (fuel.fuel_volume || fuel.volume || 0).toString()}
                      onChange={(e) => handleFuelVolumeChange(fuel.id, e.target.value)}
                      placeholder="0"
                      disabled={!isDraft || savingFuelVolumes[fuel.id] || loading}
                    />
                    {isDraft && (
                      <button 
                        className="bButton"
                        onClick={() => handleSaveFuelVolume(fuel.id)}
                        disabled={savingFuelVolumes[fuel.id] || loading}
                      >
                        {savingFuelVolumes[fuel.id] ? 'Сохранение...' : 'Сохранить'}
                      </button>
                    )}
                  </div>
                </td>
                <td className="result-cell">
                  <div className="resCardReq">
                    {displayEnergyResult(fuel)}
                  </div>
                </td>
                {isDraft && (
                  <td className="actions-cell">
                    <button 
                      className="wButton"
                      onClick={() => handleRemoveFuel(fuel.id)}
                      style={{background: '#dc3545', padding: '5px 10px', fontSize: '14px'}}
                      disabled={loading}
                    >
                      Удалить
                    </button>
                  </td>
                )}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={isDraft ? 4 : 3} style={{textAlign: 'center', padding: '40px'}}>
                В расчете нет топлива
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Суммарная энергия */}
      <div className="resFrameReq">
        Суммарное выделение энергии (кДж):
        <div className="resReq">{displayTotalEnergy()}</div>
      </div>

      <Footer />
    </div>
  );
};

export default FuelCombustionPage;