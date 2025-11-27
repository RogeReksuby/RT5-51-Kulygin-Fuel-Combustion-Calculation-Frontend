import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../store';
import { getCartData } from '../store/slices/applicationsSlice';
import { setAuthToken } from '../api';

const AppInitializer: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated } = useSelector((state: RootState) => state.user);

  useEffect(() => {
    // Проверяем, есть ли токен в localStorage при загрузке приложения
    const token = localStorage.getItem('token');
    if (token) {
      setAuthToken(token);
      // Токен есть, но нужно проверить его валидность через API
      // Пока просто загружаем корзину если пользователь авторизован
    }
  }, []);

  useEffect(() => {
    // При изменении статуса авторизации загружаем корзину
    if (isAuthenticated) {
      dispatch(getCartData());
    }
  }, [isAuthenticated, dispatch]);

  return null; // Этот компонент ничего не рендерит
};

export default AppInitializer;