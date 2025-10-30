import { type FC } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ROUTES, ROUTE_LABELS } from '../../Routes';
import './Breadcrumbs.css';

interface Crumb {
  label: string;
  path?: string;
}

export const Breadcrumbs: FC = () => {
  const location = useLocation();
  
  // Функция для генерации хлебных крошек на основе текущего пути
  const generateBreadcrumbs = (): Crumb[] => {
    const pathnames = location.pathname.split('/').filter((x) => x);
    const crumbs: Crumb[] = [];

    // Всегда добавляем главную страницу как первую крошку
    crumbs.push({
      label: ROUTE_LABELS.HOME,
      path: ROUTES.HOME
    });

    // Обрабатываем остальные части пути
    let accumulatedPath = '';
    
    pathnames.forEach((pathname, index) => {
      accumulatedPath += `/${pathname}`;
      
      // Для страницы списка топлива
      if (pathname === 'fuels' && index === 0) {
        crumbs.push({
          label: ROUTE_LABELS.FUELS,
          path: index === pathnames.length - 1 ? undefined : accumulatedPath
        });
      }
      // Для страницы деталей топлива (fuels/:id)
      else if (pathname === 'fuels' && pathnames[index + 1]) {
        // Пропускаем, так как уже добавили fuels
        return;
      }
      // Для ID топлива (детальная страница)
      else if (!isNaN(Number(pathname)) && pathnames[index - 1] === 'fuels') {
        crumbs.push({
          label: 'Детали топлива', // Или можно получить название из состояния
          path: undefined // Последняя крошка не кликабельна
        });
      }
    });

    return crumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  return (
    <nav aria-label="Хлебные крошки" className="breadcrumbs">
      <ul className="breadcrumbs-list">
        {breadcrumbs.map((crumb, index) => (
          <li key={index} className="breadcrumbs-item">
            {index > 0 && <span className="breadcrumbs-separator">/</span>}
            
            {crumb.path ? (
              <Link to={crumb.path} className="breadcrumbs-link">
                {crumb.label}
              </Link>
            ) : (
              <span className="breadcrumbs-current">{crumb.label}</span>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
};