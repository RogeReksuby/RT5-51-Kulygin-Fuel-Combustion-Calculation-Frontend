import { type FC, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { api } from '../api';
import type { DsCombustionResponse } from '../api/Api'; // ← ИМПОРТИРУЕМ ТИП ИЗ СГЕНЕРИРОВАННОГО API
import { Header } from '../components/FuelDetailsHeader';
import { Footer } from '../components/FuelFooter';
import { ROUTES } from '../../Routes';
import type { RootState } from '../store';
import './FuelCombustionsList.css';
import { Breadcrumbs } from '../components/BreadCrumbs';

// Используем тип из сгенерированного API
interface Application extends DsCombustionResponse {
  // Дополнительные поля если нужны
}

const ApplicationsPage: FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state: RootState) => state.user);
  
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Фильтры
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

    useEffect(() => {
    // Даем время на проверку авторизации
    const checkAuthAndLoad = setTimeout(() => {
        if (!isAuthenticated) {
        navigate(ROUTES.LOGIN);
        return;
        }

        loadApplications();
    }, 1000); // Небольшая задержка

    return () => clearTimeout(checkAuthAndLoad);
    }, [isAuthenticated, navigate]);


//   useEffect(() => {
//     if (!isAuthenticated) {
//       navigate(ROUTES.LOGIN);
//       return;
//     }

//     loadApplications();
//   }, [isAuthenticated, navigate]);

  const loadApplications = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Создаем объект параметров
      const queryParams: any = {};

      if (statusFilter) {
        queryParams.status = statusFilter;
      }
      if (startDate) {
        queryParams.start_date = startDate;
      }
      if (endDate) {
        queryParams.end_date = endDate;
      }


      // РЕАЛЬНЫЙ API ВЫЗОВ
      const response = await api.api.combustionsList(queryParams);

      
      // API возвращает Record<string, DsCombustionResponse[]>
      // Нужно извлечь массив заявок
      const responseData = response.data as Record<string, DsCombustionResponse[]>;
      
      // Извлекаем первый ключ (обычно это "data" или что-то подобное)
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

  // Обработчик применения фильтров
  const handleApplyFilters = () => {
    loadApplications();
  };

  // Обработчик сброса фильтров
  const handleResetFilters = () => {
    setStatusFilter('');
    setStartDate('');
    setEndDate('');
    loadApplications();
  };

  // Переход к деталям заявки
  const handleViewApplication = (applicationId: number) => {
    navigate(`${ROUTES.APPLICATIONS}/${applicationId}`);
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
      'отклонён': 'Отклонена',
      'удалён': 'Удалена'
    };
    return statusMap[status || ''] || status || 'Неизвестно';
  };

  // Получение класса для статуса
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

          

          <div className="filter-actions">
            <button 
              onClick={handleApplyFilters}
              className="filter-button apply"
            >
              Применить
            </button>
            <button 
              onClick={handleResetFilters}
              className="filter-button reset"
            >
              Сбросить
            </button>
          </div>
        </div>

        {/* Состояние загрузки/ошибки */}
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

        {/* Таблица заявок */}
        {!loading && !error && (
          <div className="applications-table-container">
            {applications.length > 0 ? (
              <table className="applications-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Статус</th>
                    <th>Дата создания</th>
                    <th>Дата обновления</th>
                    <th>Молярный объем</th>
                    <th>Результат (кДж)</th>
                    <th>Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map((app) => (
                    <tr key={app.id} className="application-row">
                      <td className="application-id">#{app.id}</td>
                      <td className="application-status">
                        <span className={`status-badge ${getStatusClass(app.status)}`}>
                          {getStatusText(app.status)}
                        </span>
                      </td>
                      <td className="application-date">{app.date_create}</td>
                      <td className="application-date">{app.date_update}</td>
                      <td className="application-volume">{app.molar_volume}</td>
                      <td className="application-result">
                        {app.final_result && app.final_result > 0 ? app.final_result.toFixed(2) : '—'}
                      </td>
                      <td className="application-actions">
                        <button 
                          onClick={() => handleViewApplication(app.id!)}
                          className="view-button"
                        >
                          Просмотреть
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="no-applications">
                <p>Заявки не найдены</p>
                {(statusFilter || startDate || endDate) && (
                  <button onClick={handleResetFilters} className="clear-filters-button">
                    Очистить фильтры
                  </button>
                )}
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