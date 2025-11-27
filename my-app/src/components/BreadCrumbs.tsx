import { type FC } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { ROUTES, ROUTE_LABELS } from '../../Routes';
import './BreadCrumbs.css';

interface Crumb {
  label: string;
  path?: string;
}

export const Breadcrumbs: FC = () => {
  const location = useLocation();
  const params = useParams();
  
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
      
      // Определяем тип страницы по пути
      switch (pathname) {
        case 'fuels':
          if (index === pathnames.length - 1) {
            // Страница списка топлива
            crumbs.push({
              label: ROUTE_LABELS.FUELS,
              path: undefined
            });
          } else if (pathnames[index + 1] && !isNaN(Number(pathnames[index + 1]))) {
            // Переход к деталям топлива - добавляем список как кликабельную крошку
            crumbs.push({
              label: ROUTE_LABELS.FUELS,
              path: ROUTES.FUELS
            });
          }
          break;

        case 'login':
          crumbs.push({
            label: ROUTE_LABELS.LOGIN,
            path: undefined
          });
          break;

        case 'register':
          crumbs.push({
            label: ROUTE_LABELS.REGISTER,
            path: undefined
          });
          break;

        case 'combustions':
          if (index === pathnames.length - 1) {
            // Страница списка заявок
            crumbs.push({
              label: ROUTE_LABELS.APPLICATIONS,
              path: undefined
            });
          } else if (pathnames[index + 1] && pathnames[index + 1] !== ':id') {
            // Детальная страница заявки
            crumbs.push({
              label: ROUTE_LABELS.APPLICATIONS,
              path: ROUTES.APPLICATIONS
            });
          }
          break;

        case 'profile':
          crumbs.push({
            label: ROUTE_LABELS.PROFILE,
            path: undefined
          });
          break;

        default:
          // Обработка ID для детальных страниц
          if (!isNaN(Number(pathname))) {
            const previousPath = pathnames[index - 1];
            
            if (previousPath === 'fuels') {
              // Детальная страница топлива
              crumbs.push({
                label: 'Детали топлива',
                path: undefined
              });
            } else if (previousPath === 'combustions') {
              // Детальная страница заявки
              crumbs.push({
                label: ROUTE_LABELS.APPLICATION_DETAIL,
                path: undefined
              });
            }
          }
          break;
      }
    });

    return crumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  // Не показываем breadcrumbs на главной странице
  if (breadcrumbs.length <= 1) {
    return null;
  }

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