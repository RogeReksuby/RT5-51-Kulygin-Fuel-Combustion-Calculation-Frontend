import { type FC, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { api } from '../api';
import type { DsCombustionResponse } from '../api/Api';
import { Header } from '../components/FuelDetailsHeader';
import { Footer } from '../components/FuelFooter';
import { ROUTES } from '../../Routes';
import type { RootState } from '../store';
import './FuelCombustionsList.css';
import { Breadcrumbs } from '../components/BreadCrumbs';

// Используем тип из сгенерированного API
interface Application extends DsCombustionResponse {}

// Самая простая версия - проверяем только формат
const formatDateForBackend = (dateString: string): string => {
  if (!dateString) return '';
  
  // Проверяем формат ДД.ММ.ГГГГ
  const regex = /^\d{2}\.\d{2}\.\d{4}$/;
  if (regex.test(dateString)) {
    return dateString; // Уже в правильном формате
  }
  
  // Если ввели что-то другое, возвращаем пустую строку
  console.warn('Некорректный формат даты. Используйте ДД.ММ.ГГГГ');
  return '';
};

const ApplicationsPage: FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state: RootState) => state.user);
  
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Фильтры
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');

  useEffect(() => {
    const checkAuthAndLoad = setTimeout(() => {
      if (!isAuthenticated) {
        navigate(ROUTES.LOGIN);
        return;
      }

      loadApplications();
    }, 1000);

    return () => clearTimeout(checkAuthAndLoad);
  }, [isAuthenticated, navigate]);

  const loadApplications = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const queryParams: any = {};

      if (statusFilter) {
        queryParams.status = statusFilter;
      }
      
      // Проверяем и форматируем дату
      if (selectedDate) {
        const formattedDate = formatDateForBackend(selectedDate);
        if (formattedDate) {
          queryParams.start_date = formattedDate;
          queryParams.end_date = formattedDate;
          console.log('Фильтруем по дате:', formattedDate);
        } else {
          // Если дата в неправильном формате, показываем ошибку
          setError('Введите дату в формате ДД.ММ.ГГГГ (например: 28.11.2025)');
          setLoading(false);
          return;
        }
      }

      const response = await api.api.combustionsList(queryParams);
      
      const responseData = response.data as Record<string, DsCombustionResponse[]>;
      const dataKey = Object.keys(responseData)[0];
      const applicationsArray = responseData[dataKey] || [];
      
      setApplications(applicationsArray);
      
      console.log('Заявки загружены:', applicationsArray.length);
    } catch (error: any) {
      console.error('Ошибка загрузки заявок:', error);
      setError('Не удалось загрузить список заявок');
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilters = () => {
    loadApplications();
  };

  const handleViewApplication = (applicationId: number) => {
    navigate(`${ROUTES.APPLICATIONS}/${applicationId}`);
  };

  const getStatusText = (status?: string): string => {
    const statusMap: { [key: string]: string } = {
      'draft': 'Черновик',
      'submitted': 'На расчёте', 
      'approved': 'Завершена',
      'rejected': 'Отклонена',
      'черновик': 'Черновик',
      'сформирован': 'На расчёте',
      'завершён': 'Завершена',
      'отклонён': 'Отклонена',
      'удалён': 'Удалена'
    };
    return statusMap[status || ''] || status || 'Неизвестно';
  };

  const getStatusClass = (status?: string): string => {
    const statusClassMap: { [key: string]: string } = {
      'черновик': 'status-draft',
      'сформирован': 'status-submitted',
      'завершён': 'status-completed',
      'отклонён': 'status-rejected',
      'удалён': 'status-deleted'
    };
    return statusClassMap[status || ''] || 'status-unknown';
  };

  // Обработчик изменения даты с подсказкой
  const handleDateChange = (value: string) => {
    setSelectedDate(value);
    // Очищаем ошибку если пользователь начал вводить заново
    if (error && error.includes('дату в формате')) {
      setError(null);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div>
      <Header />
      <Breadcrumbs/>
      <div className="applications-container">
        <h1 className="applications-title">Мои заявки</h1>

        {/* Фильтры */}
        <div className="filters-section">
          <div className="filter-group">
            <label htmlFor="statusFilter">Статус:</label>
            <select 
              id="statusFilter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="filter-select"
            >
              <option value="">Все статусы</option>
              <option value="черновик">Черновик</option>
              <option value="сформирован">На расчёте</option>
              <option value="завершён">Завершена</option>
              <option value="отклонён">Отклонена</option>
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="dateFilter">Дата:</label>
            <input 
              type="text"
              id="dateFilter"
              value={selectedDate}
              onChange={(e) => handleDateChange(e.target.value)}
              className="filter-input"
              placeholder="дд.мм.гггг"
              maxLength={10}
            />
            <small className="date-hint">Формат: ДД.ММ.ГГГГ (пример: 28.11.2025)</small>
          </div>

          <div className="filter-actions">
            <button 
              onClick={handleApplyFilters}
              className="filter-button apply"
            >
              Применить фильтры
            </button>
          </div>
        </div>

        {/* Сообщения об ошибках валидации */}
        {error && error.includes('дату в формате') && (
          <div className="validation-error">
            ⚠️ {error}
          </div>
        )}

        {/* Состояние загрузки/ошибки API */}
        {loading && (
          <div className="loading-message">Загрузка заявок...</div>
        )}

        {error && !error.includes('дату в формате') && (
          <div className="error-message">
            {error}
            <button onClick={loadApplications} className="retry-button">
              Попробовать снова
            </button>
          </div>
        )}

        {/* Список карточек заявок */}
        {!loading && !error && (
          <div className="applications-list">
            {applications.length > 0 ? (
              <div className="applications-cards-single-column">
                {applications.map((app) => (
                  <div key={app.id} className="application-card-row">
                    {/* Верхняя часть карточки с ID и статусом */}
                    <div className="card-row-header">
                      <div className="card-id">Заявка #{app.id}</div>
                      <div className="card-status">
                        <span className={`status-badge ${getStatusClass(app.status)}`}>
                          {getStatusText(app.status)}
                        </span>
                      </div>
                    </div>
                    
                    {/* Содержимое карточки в одну строку */}
                    <div className="card-row-content">
                      <div className="card-column">
                        <div className="card-label">Дата создания</div>
                        <div className="card-value">{app.date_create}</div>
                      </div>
                      
                      <div className="card-column">
                        <div className="card-label">Дата обновления</div>
                        <div className="card-value">{app.date_update || '—'}</div>
                      </div>
                      
                      <div className="card-column">
                        <div className="card-label">Молярный объем</div>
                        <div className="card-value">{app.molar_volume || '—'}</div>
                      </div>
                      
                      <div className="card-column">
                        <div className="card-label">Результат</div>
                        <div className="card-value result">
                          {app.final_result && app.final_result > 0 
                            ? `${app.final_result.toFixed(2)} кДж`
                            : '—'
                          }
                        </div>
                      </div>
                      
                      <div className="card-column actions-column">
                        <button 
                          onClick={() => handleViewApplication(app.id!)}
                          className="view-button"
                        >
                          Открыть
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-applications">
                <p>Заявки не найдены</p>
                <button onClick={() => {setStatusFilter(''); setSelectedDate(''); loadApplications();}} 
                        className="clear-filters-button">
                  Очистить фильтры
                </button>
              </div>
            )}
          </div>
        )}

        {/* Статистика */}
        {!loading && applications.length > 0 && (
          <div className="applications-stats">
            Найдено заявок: <strong>{applications.length}</strong>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default ApplicationsPage;