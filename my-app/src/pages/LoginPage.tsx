import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../store';
import { loginUser, clearError } from '../store/slices/userSlice';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/FuelDetailsHeader'

const LoginPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  
  // Получаем состояние из Redux store
  const { loading, error, isAuthenticated } = useSelector((state: RootState) => state.user);
  
  // Локальное состояние для формы
  const [formData, setFormData] = useState({
    login: '',
    password: '',
  });

  // Обработчик изменения полей формы
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    
    // Очищаем ошибку при начале ввода
    if (error) {
      dispatch(clearError());
    }
  };

  // Обработчик отправки формы
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.login || !formData.password) {
      return;
    }

    // Отправляем запрос на авторизацию
    const result = await dispatch(loginUser(formData));
    
    // Если авторизация успешна, переходим на главную
    if (loginUser.fulfilled.match(result)) {
      navigate('/');
    }
  };

  // Если пользователь уже авторизован, показываем сообщение
  if (isAuthenticated) {
    return (
      <div className="container mt-5">
        <div className="alert alert-info">
          Вы уже авторизованы!
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => navigate('/')}
        >
          На главную
        </button>
      </div>
    );
  }

  return (
    <div className="container mt-5">
        <Header/>
      <div className="row justify-content-center">
        <div className="col-md-6">
          <h2 className="text-center mb-4">Вход в систему</h2>
          
          {/* Сообщение об ошибке */}
          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}
          
          {/* Форма логина */}
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="login" className="form-label">
                Логин
              </label>
              <input
                type="text"
                className="form-control"
                id="login"
                name="login"
                value={formData.login}
                onChange={handleChange}
                placeholder="Введите ваш логин"
                required
                disabled={loading}
              />
            </div>
            
            <div className="mb-3">
              <label htmlFor="password" className="form-label">
                Пароль
              </label>
              <input
                type="password"
                className="form-control"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Введите ваш пароль"
                required
                disabled={loading}
              />
            </div>
            
            <button 
              type="submit" 
              className="btn btn-primary w-100"
              disabled={loading || !formData.login || !formData.password}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" />
                  Вход...
                </>
              ) : (
                'Войти'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;