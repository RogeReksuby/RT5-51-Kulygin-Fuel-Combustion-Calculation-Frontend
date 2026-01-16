// components/AppInitializer.tsx
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import type { AppDispatch, RootState } from '../store';
import { 
  checkInitialAuth, 
  setAppInitialized 
} from '../store/slices/userSlice';
import { getCombustionCartCount } from '../store/slices/applicationsSlice';
import { ROUTES } from '../../Routes';

// Пути, которые не требуют авторизации
const PUBLIC_ROUTES = [
  ROUTES.HOME,
  ROUTES.FUELS,
  ROUTES.LOGIN,
  ROUTES.REGISTER,
  ROUTES.ERROR_403,
  ROUTES.ERROR_404,
];

// Получаем все возможные маршруты из ROUTES
const getAllExistingRoutes = (): string[] => {
  const routes = Object.values(ROUTES);
  const allRoutes: string[] = [];
  
  routes.forEach(route => {
    allRoutes.push(route);
    
    // Для динамических маршрутов создаем паттерн
    if (route.includes('/:')) {
      // Заменяем :id, :param и т.д. на placeholder
      const pattern = route.replace(/\/:[^/]+/g, '/([^/]+)');
      allRoutes.push(pattern);
    }
  });
  
  return allRoutes;
};

// Проверяем, является ли маршрут одним из существующих
const isExistingRoute = (pathname: string): boolean => {
  const existingRoutes = getAllExistingRoutes();
  
  // Убираем базовый путь если есть
  let normalizedPath = pathname;
  const basePath = '/RT5-51-Kulygin-Fuel-Combustion-Calculation-Frontend';
  if (normalizedPath.startsWith(basePath)) {
    normalizedPath = normalizedPath.replace(basePath, '');
  }
  
  // Если путь пустой или только слэш - это главная
  if (normalizedPath === '' || normalizedPath === '/') {
    normalizedPath = ROUTES.HOME;
  }
  
  // Проверяем точное совпадение
  if (existingRoutes.some(route => normalizedPath === route)) {
    return true;
  }
  
  // Проверяем динамические маршруты
  for (const route of existingRoutes) {
    if (route.includes('(')) { // Это паттерн с regex группой
      const regexPattern = '^' + route.replace(/\//g, '\\/') + '$';
      const regex = new RegExp(regexPattern);
      if (regex.test(normalizedPath)) {
        return true;
      }
    }
  }
  
  return false;
};

// Проверяем, публичный ли маршрут
const isPublicRoute = (pathname: string): boolean => {
  console.log('🔍 Проверка маршрута:', pathname);
  
  // Убираем базовый путь если есть
  let normalizedPath = pathname;
  const basePath = '/RT5-51-Kulygin-Fuel-Combustion-Calculation-Frontend';
  if (normalizedPath.startsWith(basePath)) {
    normalizedPath = normalizedPath.replace(basePath, '');
  }
  
  // Если путь пустой или только слэш - это главная
  if (normalizedPath === '' || normalizedPath === '/') {
    normalizedPath = ROUTES.HOME;
  }
  
  // Для деталей топлива (/fuels/:id)
  if (normalizedPath.startsWith(`${ROUTES.FUELS}/`) && normalizedPath !== ROUTES.FUELS) {
    console.log('✅ Публичный маршрут: детальная страница топлива');
    return true;
  }
  
  // Страницы ошибок должны быть доступны всем
  if (normalizedPath === ROUTES.ERROR_403 || normalizedPath === ROUTES.ERROR_404) {
    console.log('✅ Публичный маршрут: страница ошибки');
    return true;
  }
  
  // Проверяем, является ли это существующим маршрутом
  const existing = isExistingRoute(pathname);
  console.log('📋 Существующий маршрут?', existing, 'для пути', normalizedPath);
  
  // Если это НЕ существующий маршрут - считаем его публичным (ведет на 404)
  if (!existing) {
    console.log('✅ Несуществующий маршрут, считаем публичным (покажет 404)');
    return true;
  }
  
  // Проверяем стандартные публичные маршруты
  const isStandardPublic = PUBLIC_ROUTES.some(route => 
    normalizedPath === route || 
    (route === ROUTES.HOME && normalizedPath === '/')
  );
  
  console.log('📋 Стандартный публичный маршрут?', isStandardPublic);
  return isStandardPublic;
};

const AppInitializer: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();
  
  const { 
    isAuthenticated, 
    user,
    loading: userLoading,
    isAppInitialized 
  } = useSelector((state: RootState) => state.user);

  // Отладочная информация
  useEffect(() => {
    console.log('👤 Состояние пользователя:', {
      isAuthenticated,
      user,
      isModerator: user?.is_moderator,
      token: localStorage.getItem('token'),
      pathname: location.pathname
    });
  }, [isAuthenticated, user, location.pathname]);

  // ИНИЦИАЛИЗАЦИЯ ПРИЛОЖЕНИЯ - только один раз при загрузке
  useEffect(() => {
    if (!isAppInitialized) {
      console.log('🚀 Инициализация приложения...');
      
      const initializeApp = async () => {
        await dispatch(checkInitialAuth());
        dispatch(setAppInitialized());
        console.log('✅ Приложение инициализировано');
      };

      initializeApp();
    }
  }, [dispatch, isAppInitialized]);

  // ПРОВЕРКА АВТОРИЗАЦИИ ПРИ ИЗМЕНЕНИИ МАРШРУТА
  useEffect(() => {
    if (isAppInitialized && !userLoading) {
      const currentPath = location.pathname;
      
      console.log('🔄 Проверка авторизации для пути:', currentPath);
      
      const publicRoute = isPublicRoute(currentPath);
      
      // Если пользователь не авторизован и находится на защищенной странице
      if (!isAuthenticated && !publicRoute) {
        console.log(`🔒 Пользователь не авторизован, перенаправляем с ${currentPath} на логин`);
        navigate(ROUTES.LOGIN, { replace: true });
        return;
      }
      
      // Если пользователь авторизован и находится на странице логина/регистрации
      if (isAuthenticated && (currentPath === ROUTES.LOGIN || currentPath === ROUTES.REGISTER)) {
        console.log(`✅ Пользователь уже авторизован, перенаправляем с ${currentPath} на главную`);
        navigate(ROUTES.FUELS, { replace: true });
      }
    }
  }, [location.pathname, isAuthenticated, isAppInitialized, userLoading, navigate]);

  // Загружаем данные корзины только если пользователь авторизован
  useEffect(() => {
    if (isAuthenticated) {
      console.log('🛒 Загружаем данные корзины (пользователь авторизован)');
      dispatch(getCombustionCartCount());
    }
  }, [dispatch, isAuthenticated]);

  // Показываем индикатор загрузки только если идет инициализация
  // и пользователь на защищенной странице
  if (userLoading && !isAppInitialized && !isPublicRoute(location.pathname)) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        zIndex: 9999
      }}>
        <div>Инициализация приложения...</div>
      </div>
    );
  }

  return null;
};

export default AppInitializer;