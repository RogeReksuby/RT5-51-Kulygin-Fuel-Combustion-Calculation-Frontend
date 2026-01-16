import { type FC, useState, useEffect, useCallback, useMemo } from 'react';
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
interface Application extends DsCombustionResponse {
  calculation_status?: string;
  calculated_count?: number;
  total_count?: number;
  // Добавляем поля из ответа
  creator_login?: string;
  moderator_login?: string;
}

// Функция форматирования даты
const formatDateForBackend = (dateString: string): string => {
  if (!dateString) return '';
  
  const regex = /^\d{2}\.\d{2}\.\d{4}$/;
  if (regex.test(dateString)) {
    return dateString;
  }
  
  return '';
};

// Функция для получения сегодняшней даты в формате ДД.ММ.ГГГГ
const getTodayDate = (): string => {
  const today = new Date();
  const day = String(today.getDate()).padStart(2, '0');
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const year = today.getFullYear();
  return `${day}.${month}.${year}`;
};

const ApplicationsPage: FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isModerator } = useSelector((state: RootState) => state.user);
  
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Состояния для текущих значений фильтров
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [startDateFilter, setStartDateFilter] = useState<string>('');
  const [endDateFilter, setEndDateFilter] = useState<string>('');
  const [creatorFilter, setCreatorFilter] = useState<string>('');
  
  // Состояния для активных фильтров (которые применяются)
  const [activeStatusFilter, setActiveStatusFilter] = useState<string>('');
  const [activeStartDateFilter, setActiveStartDateFilter] = useState<string>('');
  const [activeEndDateFilter, setActiveEndDateFilter] = useState<string>('');
  const [activeCreatorFilter, setActiveCreatorFilter] = useState<string>('');

  // Устанавливаем сегодняшнюю дату в поля фильтров при первой загрузке
  useEffect(() => {
    const today = getTodayDate();
    setStartDateFilter(today);
    setEndDateFilter(today);
    // НЕ устанавливаем активные фильтры, чтобы не применять их автоматически
  }, []);

  // Список уникальных создателей для выпадающего списка
  const uniqueCreators = useMemo(() => {
    if (!isModerator) return [];
    
    const creators = new Set<string>();
    
    applications.forEach(app => {
      const creatorName = app.creator_login || 'Неизвестно';
      if (creatorName) {
        creators.add(creatorName);
      }
    });
    
    return ['Все создатели', ...Array.from(creators).sort()];
  }, [applications, isModerator]);

  // Функция для загрузки заявок с активными фильтрами
  const loadApplications = useCallback(async () => {
    try {
      const queryParams: any = {};

      if (activeStatusFilter) {
        queryParams.status = activeStatusFilter;
      }
      
      // Используем активные фильтры для начальной и конечной даты
      const formattedStartDate = formatDateForBackend(activeStartDateFilter);
      const formattedEndDate = formatDateForBackend(activeEndDateFilter);
      
      if (formattedStartDate) {
        queryParams.start_date = formattedStartDate;
      }
      
      if (formattedEndDate) {
        queryParams.end_date = formattedEndDate;
      }

      const response = await api.api.combustionsList(queryParams);
      
      // Обрабатываем ответ - он имеет структуру { "data": [...] }
      const responseData = response.data as { data: Application[] };
      const applicationsArray = responseData.data || [];
      
      setApplications(applicationsArray);
      setError(null);
      
    } catch (error: any) {
      console.error('Ошибка загрузки заявок:', error);
      setError('Не удалось загрузить список заявок');
    } finally {
      setLoading(false);
    }
  }, [activeStatusFilter, activeStartDateFilter, activeEndDateFilter]);

  // Фильтрация заявок на фронтенде (по создателю)
  const filteredApplications = useMemo(() => {
    if (!isModerator || !activeCreatorFilter || activeCreatorFilter === 'Все создатели') {
      return applications;
    }
    
    return applications.filter(app => {
      const creatorName = app.creator_login || '';
      return creatorName.toLowerCase().includes(activeCreatorFilter.toLowerCase());
    });
  }, [applications, activeCreatorFilter, isModerator]);

  // Первоначальная загрузка
  useEffect(() => {
    if (!isAuthenticated) {
      navigate(ROUTES.LOGIN);
      return;
    }

    // Загружаем данные без фильтров при первой загрузке
    loadApplications();

    // Настраиваем интервал опроса каждую секунду
    const intervalId = setInterval(loadApplications, 1000);

    // Очистка интервала при размонтировании
    return () => {
      clearInterval(intervalId);
    };
  }, [isAuthenticated, navigate, loadApplications]);

  // Применение фильтров
  const handleApplyFilters = () => {
    // Устанавливаем активные фильтры равными текущим значениям
    setActiveStatusFilter(statusFilter);
    setActiveStartDateFilter(startDateFilter);
    setActiveEndDateFilter(endDateFilter);
    setActiveCreatorFilter(creatorFilter);
    
    // Загружаем данные с новыми фильтрами
    loadApplications();
  };


  const handleViewApplication = (applicationId: number) => {
    navigate(`${ROUTES.APPLICATIONS}/${applicationId}`);
  };

  // Функция для модерации заявки
  const handleModerateApplication = async (applicationId: number, isComplete: boolean) => {
    try {
      const response = await api.api.combustionsModerateUpdate(applicationId, {
        is_complete: isComplete
      });
      
      const data = response.data as any;
      
      if (data.status === 'processing') {
        alert('✅ Расчёт запущен! Заявка завершится автоматически через 5-10 секунд.');
      } else {
        alert(`✅ Заявка ${isComplete ? 'одобрена' : 'отклонена'}`);
      }
      
      // Обновляем список заявок
      loadApplications();
      
    } catch (error: any) {
      console.error('Ошибка модерации:', error);
      
      if (error.response?.data?.description) {
        alert(`❌ Ошибка: ${error.response.data.description}`);
      } else {
        alert('❌ Произошла ошибка при модерации заявки');
      }
    }
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

  // Проверка, можно ли модерировать заявку
  const canModerate = (app: Application): boolean => {
    if (!isModerator) return false;
    return app.status === 'сформирован';
  };

  // Получение имени создателя
  const getCreatorName = (app: Application): string => {
    return app.creator_login || 'Неизвестно';
  };

  // Проверка, применены ли какие-либо фильтры
  const hasActiveFilters = useMemo(() => {
    return !!activeStatusFilter || !!activeStartDateFilter || 
           !!activeEndDateFilter || (!!activeCreatorFilter && activeCreatorFilter !== 'Все создатели');
  }, [activeStatusFilter, activeStartDateFilter, activeEndDateFilter, activeCreatorFilter]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div>
      <Header />
      <Breadcrumbs/>
      <div className="applications-container">
        <h1 className="applications-title">
          {isModerator ? 'Все заявки (панель модератора)' : 'Мои заявки'}
        </h1>

        {/* Информация о примененных фильтрах */}
        {hasActiveFilters && (
          <div className="active-filters">
            <strong>Примененные фильтры:</strong>
            {activeStatusFilter && (
              <span className="filter-tag">Статус: {getStatusText(activeStatusFilter)}</span>
            )}
            {activeStartDateFilter && (
              <span className="filter-tag">Дата с: {activeStartDateFilter}</span>
            )}
            {activeEndDateFilter && (
              <span className="filter-tag">Дата по: {activeEndDateFilter}</span>
            )}
            {activeCreatorFilter && activeCreatorFilter !== 'Все создатели' && (
              <span className="filter-tag">Создатель: {activeCreatorFilter}</span>
            )}
          </div>
        )}

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
            <label htmlFor="startDateFilter">Дата с:</label>
            <input 
              type="text"
              id="startDateFilter"
              value={startDateFilter}
              onChange={(e) => setStartDateFilter(e.target.value)}
              className="filter-input"
              placeholder="дд.мм.гггг"
              maxLength={10}
            />
          </div>

          <div className="filter-group">
            <label htmlFor="endDateFilter">Дата по:</label>
            <input 
              type="text"
              id="endDateFilter"
              value={endDateFilter}
              onChange={(e) => setEndDateFilter(e.target.value)}
              className="filter-input"
              placeholder="дд.мм.гггг"
              maxLength={10}
            />
          </div>

          {/* Фильтр по создателю (только для модератора) */}
          {isModerator && (
            <div className="filter-group">
              <label htmlFor="creatorFilter">Создатель:</label>
              <select 
                id="creatorFilter"
                value={creatorFilter}
                onChange={(e) => setCreatorFilter(e.target.value)}
                className="filter-select"
              >
                {uniqueCreators.map(creator => (
                  <option key={creator} value={creator}>
                    {creator}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="filter-actions">
            <button 
              onClick={handleApplyFilters}
              className="filter-button apply"
            >
              Применить фильтры
            </button>
            
          </div>
        </div>

        {/* Сообщения об ошибках валидации дат */}
        {startDateFilter && !formatDateForBackend(startDateFilter) && (
          <div className="validation-error">
            ⚠️ Введите начальную дату в формате ДД.ММ.ГГГГ
          </div>
        )}

        {endDateFilter && !formatDateForBackend(endDateFilter) && (
          <div className="validation-error">
            ⚠️ Введите конечную дату в формате ДД.ММ.ГГГГ
          </div>
        )}

        {/* Проверка, что начальная дата не позже конечной */}
        {formatDateForBackend(startDateFilter) && formatDateForBackend(endDateFilter) && 
          startDateFilter > endDateFilter && (
          <div className="validation-error">
            ⚠️ Начальная дата не может быть позже конечной
          </div>
        )}

        {/* Состояние загрузки/ошибки API */}
        {loading && (
          <div className="loading-message">Загрузка заявок...</div>
        )}

        {error && (
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
            {filteredApplications.length > 0 ? (
              <div className="applications-cards-single-column">
                {filteredApplications.map((app) => (
                  <div key={app.id} className="application-card-row">
                    {/* Верхняя часть карточки с ID и статусом */}
                    <div className="card-row-header">
                      <div className="card-id">Заявка #{app.id}</div>
                      <div className="card-status">
                        <span className={`status-badge ${getStatusClass(app.status)}`}>
                          {getStatusText(app.status)}
                        </span>
                        {app.status === 'сформирован' && isModerator && (
                          <span className="moderation-badge">⏳ Требует модерации</span>
                        )}
                      </div>
                    </div>
                    
                    {/* Содержимое карточки в одну строку */}
                    <div className="card-row-content">
                      {/* Колонка создателя (только для модератора) */}
                      {isModerator && (
                        <div className="card-column">
                          <div className="card-label">Создатель</div>
                          <div className="card-value">{getCreatorName(app)}</div>
                        </div>
                      )}
                      
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
                        {/* Кнопки для обычного пользователя */}
                        <button 
                          onClick={() => handleViewApplication(app.id!)}
                          className="view-button"
                        >
                          Подробнее
                        </button>
                        
                        {/* Кнопки для модератора */}
                        {isModerator && canModerate(app) && (
                          <div className="moderation-buttons">
                            <button 
                              onClick={() => handleModerateApplication(app.id!, true)}
                              className="moderate-button approve"
                            >
                              Одобрить
                            </button>
                            <button 
                              onClick={() => handleModerateApplication(app.id!, false)}
                              className="moderate-button reject"
                            >
                              Отклонить
                            </button>
                          </div>
                        )}
                        
                        {/* Сообщение о процессе расчета */}
                        {isModerator && app.status === 'сформирован' && 
                          app.calculation_status === 'processing' && (
                            <div className="calculation-info">
                              <span className="calculation-indicator">🔄 Расчёт в процессе...</span>
                            </div>
                          )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-applications">
                <p>Заявки не найдены</p>
                {hasActiveFilters && (
                  <p className="no-results-hint">
                    Попробуйте изменить параметры фильтрации
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Статистика */}
        {!loading && filteredApplications.length > 0 && (
          <div className="applications-stats">
            <div>
              Показано заявок: <strong>{filteredApplications.length}</strong> из {applications.length}
            </div>
            {isModerator && (
              <>
                <div className="moderator-stats">
                  Требуют модерации: <strong>
                    {filteredApplications.filter(app => app.status === 'сформирован').length}
                  </strong>
                </div>
                {activeCreatorFilter && activeCreatorFilter !== 'Все создатели' && (
                  <div className="creator-filter-info">
                    Фильтр по создателю: <strong>{activeCreatorFilter}</strong> (локальный)
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default ApplicationsPage;