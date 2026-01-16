// components/AppInitializer.tsx
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import type { AppDispatch, RootState } from '../store';
import { 
  checkInitialAuth, 
  //verifyAuth,
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
];

// Проверяем, публичный ли маршрут
const isPublicRoute = (pathname: string): boolean => {
  // Для деталей топлива (/fuels/:id)
  if (pathname.startsWith(`${ROUTES.FUELS}/`) && pathname !== ROUTES.FUELS) {
    return true;
  }
  
  // Остальные проверки
  return PUBLIC_ROUTES.some(route => 
    pathname === route || 
    (route === ROUTES.HOME && pathname === '/')
  );
};

const AppInitializer: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();
  
  const { 
    isAuthenticated, 
    loading: userLoading,
    isAppInitialized 
  } = useSelector((state: RootState) => state.user);

  // ИНИЦИАЛИЗАЦИЯ ПРИЛОЖЕНИЯ - только один раз при загрузке
  useEffect(() => {
    if (!isAppInitialized) {
      console.log('🚀 Инициализация приложения...');
      
      const initializeApp = async () => {
        // Только ПРИ ЗАГРУЗКЕ ПРИЛОЖЕНИЯ вызываем checkInitialAuth
        // Он всегда вернет ошибку, что сбросит авторизацию при перезагрузке
        await dispatch(checkInitialAuth());
        
        // Устанавливаем флаг, что приложение инициализировано
        dispatch(setAppInitialized());
        
        console.log('✅ Приложение инициализировано, авторизация сброшена');
      };

      initializeApp();
    }
  }, [dispatch, isAppInitialized]);

  // ПРОВЕРКА АВТОРИЗАЦИИ ПРИ ИЗМЕНЕНИИ МАРШРУТА - только если приложение уже инициализировано
  useEffect(() => {
    if (isAppInitialized && !userLoading) {
      const currentPath = location.pathname;
      const token = localStorage.getItem('token');
      
      console.log('🔄 Проверка маршрута:', {
        currentPath,
        isAuthenticated,
        hasToken: !!token,
        isPublicRoute: isPublicRoute(currentPath)
      });
      
      // Если пользователь не авторизован и находится на защищенной странице
      // перенаправляем на страницу логина
      if (!isAuthenticated && !isPublicRoute(currentPath)) {
        console.log(`🔒 Пользователь не авторизован, перенаправляем с ${currentPath} на логин`);
        navigate(ROUTES.LOGIN, { replace: true });
      }
      
      // Если пользователь авторизован и находится на странице логина/регистрации
      // перенаправляем на главную
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