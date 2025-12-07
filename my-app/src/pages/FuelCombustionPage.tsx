import { type FC, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import { api } from '../api';
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

interface ApiResponse {
  data: ApplicationData;
}

const ApplicationPage: FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const { isAuthenticated } = useSelector((state: RootState) => state.user);
  
  const [application, setApplication] = useState<ApplicationData | null>(null);
  const [molarVolumeInput, setMolarVolumeInput] = useState<string>('22.4');
  const [fuelVolumeInputs, setFuelVolumeInputs] = useState<{[key: number]: string}>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingMolarVolume, setSavingMolarVolume] = useState(false);

  useEffect(() => {
    const checkAuthAndLoad = setTimeout(() => {
      if (!isAuthenticated) {
        navigate(ROUTES.LOGIN);
        return;
      }

      if (!id) {
        setError('ID заявки не указан');
        setLoading(false);
        return;
      }

      loadApplicationData(Number(id));
    }, 1000);

    return () => clearTimeout(checkAuthAndLoad);
  }, [id, isAuthenticated, navigate]);

  const loadApplicationData = async (applicationId: number) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.api.combustionsDetail(applicationId);
      const apiResponse = response.data as ApiResponse;
      const appData = apiResponse.data;
      
      setApplication(appData);
      
      // Инициализируем молярный объем
      if (appData.MolarVolume) {
        setMolarVolumeInput(appData.MolarVolume.toString());
      } else {
        setMolarVolumeInput('22.4');
      }
      
      // Инициализируем объемы топлива
      const initialVolumes: {[key: number]: string} = {};
      appData.Fuels?.forEach(fuel => {
        initialVolumes[fuel.id] = (fuel.fuel_volume || fuel.volume || 0).toString();
      });
      setFuelVolumeInputs(initialVolumes);
      
    } catch (error: any) {
      console.error('Ошибка загрузки заявки:', error);
      setError('Не удалось загрузить данные заявки');
      setApplication(null);
    } finally {
      setLoading(false);
    }
  };

  // Обработчик изменения молярного объема (только меняем локальное состояние)
  const handleMolarVolumeChange = (value: string) => {
    setMolarVolumeInput(value);
  };

  // Сохранение молярного объема
  const handleSaveMolarVolume = async () => {
    if (!application || !id) return;
    
    const molarValue = parseFloat(molarVolumeInput) || 22.4;
    
    try {
      setSavingMolarVolume(true);
      
      await api.api.combustionsUpdate(Number(id), { molar_volume: molarValue });
      
      // Обновляем данные в приложении
      setApplication({
        ...application,
        MolarVolume: molarValue
      });
      
      alert('Молярный объем сохранен!');
    } catch (error: any) {
      console.error('Ошибка сохранения молярного объема:', error);
      alert('Не удалось сохранить молярный объем');
    } finally {
      setSavingMolarVolume(false);
    }
  };

  // Обработчик изменения объема топлива (только меняем локальное состояние)
  const handleFuelVolumeChange = (fuelId: number, newVolume: string) => {
    setFuelVolumeInputs(prev => ({
      ...prev,
      [fuelId]: newVolume
    }));
  };

  // Сохранение объема одного вида топлива
  const handleSaveFuelVolume = async (fuelId: number) => {
    if (!application || !id) return;
    
    const volumeValue = parseFloat(fuelVolumeInputs[fuelId]) || 0;
    
    try {
      // Обновляем UI - показываем что идет сохранение
      const savingFuels = { ...fuelVolumeInputs };
      // Здесь можно добавить индикатор загрузки если нужно
      
      await api.api.fuelCombustionsUpdate({
        fuel_id: fuelId,
        fuel_volume: volumeValue
      });
      
      // Обновляем данные в приложении
      const updatedFuels = application.Fuels?.map(fuel =>
        fuel.id === fuelId 
          ? { ...fuel, fuel_volume: volumeValue }
          : fuel
      ) || [];
      
      setApplication({ ...application, Fuels: updatedFuels });
      
      alert('Объем топлива сохранен!');
    } catch (error: any) {
      console.error('Ошибка сохранения объема топлива:', error);
      alert('Не удалось сохранить объем топлива');
    }
  };

  // Удаление заявки
  const handleDeleteApplication = async () => {
    if (!id || !application) return;
    
    if (window.confirm('Вы уверены, что хотите удалить эту заявку?')) {
      try {
        await api.api.combustionsDelete();
        navigate(ROUTES.FUELS);
      } catch (error: any) {
        console.error('Ошибка удаления заявки:', error);
        alert('Не удалось удалить заявку');
      }
    }
  };

  // Отправка заявки на расчет
  const handleSubmitApplication = async () => {
    if (!id || !application) return;
    
    try {
      await api.api.combustionsFormUpdate(Number(id));
      await loadApplicationData(Number(id));
      alert('Заявка успешно отправлена на расчет!');
    } catch (error: any) {
      console.error('Ошибка отправки заявки:', error);
      alert('Не удалось отправить заявку на расчет');
    }
  };

  // Удаление топлива из заявки
  const handleRemoveFuel = async (fuelId: number) => {
    if (!application || !id) return;
    
    if (window.confirm('Удалить это топливо из заявки?')) {
      try {
        await api.api.fuelCombustionsDelete({ fuel_id: fuelId });
        
        const updatedFuels = application.Fuels?.filter(fuel => fuel.id !== fuelId) || [];
        setApplication({ ...application, Fuels: updatedFuels });
        
        // Удаляем из локальных состояний
        const { [fuelId]: removed, ...rest } = fuelVolumeInputs;
        setFuelVolumeInputs(rest);
      } catch (error: any) {
        console.error('Ошибка удаления топлива:', error);
        alert('Не удалось удалить топливо из заявки');
      }
    }
  };

  // Функция для отображения результата расчета
  const displayEnergyResult = (fuel: ApplicationFuel): string => {
    const isCompleted = application?.Status === 'approved' || application?.Status === 'завершён';
    if (isCompleted && fuel.calculation_result && fuel.calculation_result > 0) {
      return `${fuel.calculation_result.toFixed(2)} кДж`;
    }
    return "—";
  };

  // Функция для отображения суммарной энергии
  const displayTotalEnergy = (): string => {
    const isCompleted = application?.Status === 'approved' || application?.Status === 'завершён';
    if (isCompleted && application?.FinalResult && application.FinalResult > 0) {
      return application.FinalResult.toFixed(2);
    }
    return "—";
  };

  // Получение текста статуса
  const getStatusText = (status?: string): string => {
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
  };

  const isDraft = application?.Status === 'draft' || application?.Status === 'черновик';

  if (loading) {
    return (
      <div>
        <Header />
        <div className="loading-container">Загрузка заявки...</div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Header />
        <div className="error-container">
          {error}
          <button 
            onClick={() => navigate(ROUTES.FUELS)}
            style={{marginTop: '20px', padding: '10px 20px'}}
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
        <div className="error-container">Заявка не найдена</div>
        <Footer />
      </div>
    );
  }

  return (
    <div>
      <Header />
      <Breadcrumbs />
      <div className="titleReq">Состав заявки #{application.ID}</div>

      {/* Кнопки управления */}
      <div className="buttonsReq">
        {isDraft ? (
          <>
            <button 
              className="wButton" 
              onClick={handleSubmitApplication}
              style={{width: '100%'}}
            >
              Отправить на расчет
            </button>
            <button 
              className="wButton" 
              onClick={handleDeleteApplication}
              style={{width: '100%', background: '#dc3545'}}
            >
              Удалить заявку
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
          />
          <button 
            className="bButton"
            onClick={handleSaveMolarVolume}
            disabled={savingMolarVolume}
            
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
                      disabled={!isDraft}
                    />
                    {isDraft && (
                      <button 
                        className="bButton"
                        onClick={() => handleSaveFuelVolume(fuel.id)}
                        
                      >
                        Сохранить
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
                В заявке нет топлива
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

export default ApplicationPage;