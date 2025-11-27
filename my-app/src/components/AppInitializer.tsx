import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../store';
//import { getCartData } from '../store/slices/applicationsSlice';
//import { setAuthToken } from '../api';
import { checkAuth } from '../store/slices/userSlice';

const AppInitializer: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated } = useSelector((state: RootState) => state.user);

  useEffect(() => {
    console.log('🚀 AppInitializer: проверка авторизации...');
    
    const token = localStorage.getItem('token');
    console.log('🔐 Токен в localStorage:', token);
    
    if (token) {
      console.log('✅ Токен найден, запускаем checkAuth...');
      dispatch(checkAuth());
    } else {
      console.log('❌ Токен не найден в localStorage');
    }
  }, [dispatch]);

  useEffect(() => {
    console.log('🔄 Статус авторизации изменился:', isAuthenticated);
  }, [isAuthenticated]);

  return null;
};

export default AppInitializer;