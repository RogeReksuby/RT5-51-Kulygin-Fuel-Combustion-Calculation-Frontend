import { type FC, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../store';
import { Header } from '../components/FuelDetailsHeader';
import { Footer } from '../components/FuelFooter';
import { ROUTES } from '../../Routes';
import { transformImageUrl } from '../target_config';
import DefaultImage from '../assets/DefaultImage.jpg';
import './FuelCombustionPage.css';

// Тип для топлива в заявке
interface ApplicationFuel {
  id: number;
  title: string;
  heat: number;
  card_image: string;
  volume?: number;
}

// Тип для заявки
interface Application {
  id: number;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  molar_volume?: number;
  fuels: ApplicationFuel[];
}

const ApplicationPage: FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  
  const { isAuthenticated } = useSelector((state: RootState) => state.user);
  
  // Состояние заявки
  const [application, setApplication] = useState<Application | null>(null);
  const [molarVolume, setMolarVolume] = useState<string>('22.4');
  const [loading, setLoading] = useState(true);

  // Загрузка данных заявки
  useEffect(() => {
    if (!isAuthenticated) {
      navigate(ROUTES.LOGIN);
      return;
    }

    if (!id) {
      console.error('ID заявки не указан');
      return;
    }

    loadApplicationData(Number(id));
  }, [id, isAuthenticated, navigate]);

  const loadApplicationData = async (applicationId: number) => {
    try {
      setLoading(true);
      // TODO: Заменить на реальный API вызов
      // const response = await api.api.combustionsDetail(applicationId);
      // setApplication(response.data);
      
      // Временные мок данные для демонстрации
      const mockApplication: Application = {
        id: applicationId,
        status: 'draft',
        molar_volume: 22.4,
        fuels: [
          {
            id: 1,
            title: "Метан",
            heat: 50.1,
            card_image: "methane.jpg",
            volume: 10
          },
          {
            id: 2, 
            title: "Пропан-бутан",
            heat: 43.8,
            card_image: "propane.jpg",
            volume: 15
          }
        ]
      };
      
      setApplication(mockApplication);
      setMolarVolume(mockApplication.molar_volume?.toString() || '22.4');
    } catch (error) {
      console.error('Ошибка загрузки заявки:', error);
    } finally {
      setLoading(false);
    }
  };

  // Обработчик изменения объема
  const handleVolumeChange = (fuelId: number, newVolume: string) => {
    if (!application) return;
    
    const updatedFuels = application.fuels.map(fuel =>
      fuel.id === fuelId 
        ? { ...fuel, volume: parseFloat(newVolume) || 0 }
        : fuel
    );
    
    setApplication({ ...application, fuels: updatedFuels });
  };

  // Обработчик изменения молярного объема
  const handleMolarVolumeChange = (value: string) => {
    setMolarVolume(value);
    // TODO: Сохранить на бэкенде
  };

  // Удаление заявки
  const handleDeleteApplication = async () => {
    if (!id || !application) return;
    
    if (window.confirm('Вы уверены, что хотите удалить эту заявку?')) {
      try {
        // TODO: Заменить на реальный API вызов
        // await api.api.combustionsDelete();
        console.log('Заявка удалена');
        navigate(ROUTES.FUELS);
      } catch (error) {
        console.error('Ошибка удаления заявки:', error);
      }
    }
  };

  // Отправка заявки
  const handleSubmitApplication = async () => {
    if (!id || !application) return;
    
    try {
      // TODO: Заменить на реальный API вызов
      // await api.api.combustionsFormUpdate(Number(id));
      console.log('Заявка отправлена на расчет');
      // Обновляем статус заявки
      setApplication({ ...application, status: 'submitted' });
    } catch (error) {
      console.error('Ошибка отправки заявки:', error);
    }
  };

  // Расчет энергии для одного топлива
  const calculateEnergy = (fuel: ApplicationFuel): number => {
    const volume = fuel.volume || 0;
    const molarVol = parseFloat(molarVolume) || 22.4;
    return (volume / molarVol) * fuel.heat * 1000; // кДж
  };

  // Суммарная энергия
  const totalEnergy = application?.fuels.reduce((sum, fuel) => 
    sum + calculateEnergy(fuel), 0
  ) || 0;

  if (loading) {
    return (
      <div>
        <Header />
        <div className="loading-container">Загрузка заявки...</div>
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
      
      <div className="titleReq">Состав заявки</div>

      {/* Кнопки управления */}
      <div className="buttonsReq">
        {application.status === 'draft' && (
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
        )}
        {application.status !== 'draft' && (
          <div className="application-status">
            Статус: {getStatusText(application.status)}
          </div>
        )}
      </div>

      {/* Молярный объем */}
      <div className="resFrameReq">
        Молярный объем (22.4 для н.у.):
        <input 
          className="volumeSpaceReq" 
          type="number"
          value={molarVolume}
          onChange={(e) => handleMolarVolumeChange(e.target.value)}
          placeholder="22.4"
          disabled={application.status !== 'draft'}
        />
      </div>

      {/* Таблица топлив */}
      <table className="fuels-table">
        <thead>
          <tr>
            <th>Топливо</th>
            <th>Объём (л)</th>
            <th>Выделение энергии (кДж)</th>
          </tr>
        </thead>
        <tbody>
          {application.fuels.map((fuel) => (
            <tr key={fuel.id} className="fuel-row">
              <td className="fuel-cell">
                <div 
                  className="cardReq" 
                  style={{
                    background: `linear-gradient(0deg, rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url(${transformImageUrl(fuel.card_image) || DefaultImage}) center/cover no-repeat`
                  }}
                >
                  <div className="titleButtonCardReq">
                    <div className="titleCardReq">{fuel.title}</div>
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
                  value={fuel.volume || ''}
                  onChange={(e) => handleVolumeChange(fuel.id, e.target.value)}
                  placeholder="Объём"
                  disabled={application.status !== 'draft'}
                />
              </td>
              <td className="result-cell">
                <div className="resCardReq">
                  {calculateEnergy(fuel).toFixed(2)} кДж
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Суммарная энергия */}
      <div className="resFrameReq">
        Суммарное выделение энергии (кДж):
        <div className="resReq">{totalEnergy.toFixed(2)}</div>
      </div>

      <Footer />
    </div>
  );
};

// Вспомогательная функция для отображения статуса
const getStatusText = (status: string): string => {
  const statusMap: { [key: string]: string } = {
    'draft': 'Черновик',
    'submitted': 'На расчёте', 
    'approved': 'Завершена',
    'rejected': 'Отклонена'
  };
  return statusMap[status] || status;
};

export default ApplicationPage;