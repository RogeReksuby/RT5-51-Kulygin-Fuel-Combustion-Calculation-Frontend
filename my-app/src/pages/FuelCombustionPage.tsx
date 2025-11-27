import { type FC, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../store';
import { api } from '../api';
import { Header } from '../components/FuelDetailsHeader';
import { Footer } from '../components/FuelFooter';
import { ROUTES } from '../../Routes';
import { transformImageUrl } from '../target_config';
import DefaultImage from '../assets/DefaultImage.jpg';
import './FuelCombustionPage.css';


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
  const dispatch = useDispatch<AppDispatch>();
  
  const { isAuthenticated } = useSelector((state: RootState) => state.user);
  
  const [application, setApplication] = useState<ApplicationData | null>(null);
  const [molarVolume, setMolarVolume] = useState<string>('22.4');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Загрузка данных заявки с реального API
  useEffect(() => {
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
  }, [id, isAuthenticated, navigate]);

  const loadApplicationData = async (applicationId: number) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('📥 Загружаем заявку ID:', applicationId);
      
      const response = await api.api.combustionsDetail(applicationId);
      console.log('📦 Данные ответа:', response.data);
      
      const apiResponse = response.data as ApiResponse;
      const appData = apiResponse.data;
      
      console.log('📦 Данные заявки:', appData);
      
      setApplication(appData);
      
      if (appData.MolarVolume) {
        setMolarVolume(appData.MolarVolume.toString());
      } else {
        setMolarVolume('22.4');
      }
      
    } catch (error: any) {
      console.error('❌ Ошибка загрузки заявки:', error);
      setError('Не удалось загрузить данные заявки');
      setApplication(null);
    } finally {
      setLoading(false);
    }
  };

  // Обработчик изменения объема топлива
  const handleVolumeChange = async (fuelId: number, newVolume: string) => {
    if (!application || !id) return;
    
    const volumeValue = parseFloat(newVolume) || 0; // 0 по умолчанию
    
    try {
      console.log('📝 Обновляем объем топлива:', fuelId, volumeValue);
      
      await api.api.fuelCombustionsUpdate({
        fuel_id: fuelId,
        fuel_volume: volumeValue
      });
      
      const updatedFuels = application.Fuels?.map(fuel =>
        fuel.id === fuelId 
          ? { ...fuel, fuel_volume: volumeValue }
          : fuel
      ) || [];
      
      setApplication({ ...application, Fuels: updatedFuels });
      
      console.log('✅ Объем топлива обновлен');
    } catch (error: any) {
      console.error('❌ Ошибка обновления объема:', error);
      alert('Не удалось обновить объем топлива');
    }
  };

  // Обработчик изменения молярного объема
  const handleMolarVolumeChange = async (value: string) => {
    if (!application || !id) return;
    
    const molarValue = parseFloat(value) || 22.4;
    setMolarVolume(value);
    
    try {
      console.log('📝 Обновляем молярный объем:', molarValue);
      
      await api.api.combustionsUpdate(Number(id), { molar_volume: molarValue });
      
      console.log('✅ Молярный объем обновлен');
    } catch (error: any) {
      console.error('❌ Ошибка обновления молярного объема:', error);
      alert('Не удалось обновить молярный объем');
    }
  };

  // Удаление заявки
  const handleDeleteApplication = async () => {
    if (!id || !application) return;
    
    if (window.confirm('Вы уверены, что хотите удалить эту заявку?')) {
      try {
        console.log('🗑️ Удаляем заявку:', id);
        
        await api.api.combustionsDelete();
        
        console.log('✅ Заявка удалена');
        navigate(ROUTES.FUELS);
      } catch (error: any) {
        console.error('❌ Ошибка удаления заявки:', error);
        alert('Не удалось удалить заявку');
      }
    }
  };

  // Отправка заявки на расчет
  const handleSubmitApplication = async () => {
    if (!id || !application) return;
    
    try {
      console.log('📤 Отправляем заявку на расчет:', id);
      
      await api.api.combustionsFormUpdate(Number(id));
      
      console.log('✅ Заявка отправлена на расчет');
      
      await loadApplicationData(Number(id));
      
      alert('Заявка успешно отправлена на расчет!');
    } catch (error: any) {
      console.error('❌ Ошибка отправки заявки:', error);
      alert('Не удалось отправить заявку на расчет');
    }
  };

  // Удаление топлива из заявки
  const handleRemoveFuel = async (fuelId: number) => {
    if (!application || !id) return;
    
    if (window.confirm('Удалить это топливо из заявки?')) {
      try {
        console.log('🗑️ Удаляем топлива из заявки:', fuelId);
        
        await api.api.fuelCombustionsDelete({ fuel_id: fuelId });
        
        const updatedFuels = application.Fuels?.filter(fuel => fuel.id !== fuelId) || [];
        setApplication({ ...application, Fuels: updatedFuels });
        
        console.log('✅ Топливо удалено из заявки');
      } catch (error: any) {
        console.error('❌ Ошибка удаления топлива:', error);
        alert('Не удалось удалить топливо из заявки');
      }
    }
  };

  // Функция для отображения результата расчета
  const displayEnergyResult = (fuel: ApplicationFuel): string => {
    // В черновике и на расчете показываем прочерк
    // Результат будет только после расчета на бэкенде
    return "—";
  };

  // Функция для отображения суммарной энергии
  const displayTotalEnergy = (): string => {
    // В черновике и на расчете показываем прочерк
    // Результат будет только после расчета на бэкенде
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
  const isCompleted = application?.Status === 'approved' || application?.Status === 'завершён';

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
            {isCompleted && application.FinalResult && application.FinalResult > 0 && (
              <span style={{marginLeft: '20px'}}>
                Результат: {application.FinalResult} кДж
              </span>
            )}
          </div>
        )}
      </div>

      {/* Молярный объем */}
      {isDraft && (
        <div className="resFrameReq">
          Молярный объем (22.4 для н.у.):
          <input 
            className="volumeSpaceReq" 
            type="number"
            step="0.1"
            value={molarVolume}
            onChange={(e) => handleMolarVolumeChange(e.target.value)}
            placeholder="22.4"
          />
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
                  <input 
                    className="volumeSpaceReq" 
                    type="number"
                    step="0.1"
                    value={fuel.fuel_volume || fuel.volume || 0} //{/* 0 по умолчанию */}
                    onChange={(e) => handleVolumeChange(fuel.id, e.target.value)}
                    placeholder="0"
                    disabled={!isDraft}
                  />
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