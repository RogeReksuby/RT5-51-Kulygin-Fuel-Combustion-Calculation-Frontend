import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../store';
import { loginUser, clearError } from '../store/slices/userSlice';
import { useNavigate, Link } from 'react-router-dom';
import { Header } from '../components/FuelDetailsHeader';
import { ROUTES } from '../../Routes';
import { api } from '../api';
import './RegisterPage.css';
//import { Breadcrumb } from 'react-bootstrap';
import { Breadcrumbs } from '../components/BreadCrumbs';

const RegisterPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  
  const { loading, error, isAuthenticated } = useSelector((state: RootState) => state.user);
  
  const [formData, setFormData] = useState({
    login: '',
    password: '',
    confirmPassword: '',
    name: '',
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    
    // Очищаем ошибки при вводе
    if (error) {
      dispatch(clearError());
    }
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.login.trim()) {
      errors.login = 'Логин обязателен';
    } else if (formData.login.length < 3) {
      errors.login = 'Логин должен содержать минимум 3 символа';
    }

    if (!formData.password) {
      errors.password = 'Пароль обязателен';
    } else if (formData.password.length < 4) {
      errors.password = 'Пароль должен содержать минимум 4 символа';
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Подтверждение пароля обязательно';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Пароли не совпадают';
    }

    if (!formData.name.trim()) {
      errors.name = 'Имя обязательно';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      // Вызываем метод регистрации из API
      const response = await api.api.usersRegisterCreate({
        login: formData.login,
        password: formData.password,
        name: formData.name,
        is_moderator: false, // Игнорируется на бэкенде, но отправляем для полноты
      });

      console.log('✅ Регистрация успешна:', response.data);

      // Автоматически логиним пользователя после успешной регистрации
      const loginResult = await dispatch(loginUser({
        login: formData.login,
        password: formData.password
      }));

      if (loginUser.fulfilled.match(loginResult)) {
        navigate('/');
      }
      
    } catch (error: any) {
      console.error('❌ Ошибка регистрации:', error);
      // Ошибка будет обработана в Redux состоянии
    }
  };

  // Если пользователь уже авторизован, показываем сообщение
  if (isAuthenticated) {
    return (
      <div className="register-container">
        <Header />
        <div className="alert alert-info">
          Вы уже авторизованы!
        </div>
        <button 
          className="home-button"
          onClick={() => navigate('/')}
        >
          На главную
        </button>
      </div>
    );
  }

  return (
    <div>
      <Header />
      <Breadcrumbs />
      <div className="register-container">
        <h1 className="register-title">Регистрация</h1>
        
        <div className="register-card">
          <h2>Создание аккаунта</h2>
          
          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="register-form">
            <div className="form-group">
              <label htmlFor="name">
                Полное имя *
              </label>
              <input
                type="text"
                className={`form-input ${validationErrors.name ? 'error' : ''}`}
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Введите ваше полное имя"
                required
                disabled={loading}
              />
              {validationErrors.name && (
                <span className="field-error">{validationErrors.name}</span>
              )}
            </div>
            
            <div className="form-group">
              <label htmlFor="login">
                Логин *
              </label>
              <input
                type="text"
                className={`form-input ${validationErrors.login ? 'error' : ''}`}
                id="login"
                name="login"
                value={formData.login}
                onChange={handleChange}
                placeholder="Придумайте логин"
                required
                disabled={loading}
              />
              {validationErrors.login && (
                <span className="field-error">{validationErrors.login}</span>
              )}
            </div>
            
            <div className="form-group">
              <label htmlFor="password">
                Пароль *
              </label>
              <input
                type="password"
                className={`form-input ${validationErrors.password ? 'error' : ''}`}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Придумайте пароль"
                required
                disabled={loading}
              />
              {validationErrors.password && (
                <span className="field-error">{validationErrors.password}</span>
              )}
            </div>
            
            <div className="form-group">
              <label htmlFor="confirmPassword">
                Подтверждение пароля *
              </label>
              <input
                type="password"
                className={`form-input ${validationErrors.confirmPassword ? 'error' : ''}`}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Повторите пароль"
                required
                disabled={loading}
              />
              {validationErrors.confirmPassword && (
                <span className="field-error">{validationErrors.confirmPassword}</span>
              )}
            </div>
            
            <button 
              type="submit" 
              className="register-button"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner" />
                  Регистрация...
                </>
              ) : (
                'Зарегистрироваться'
              )}
            </button>

            <div className="login-link">
              Уже есть аккаунт? <Link to={ROUTES.LOGIN}>Войти</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;