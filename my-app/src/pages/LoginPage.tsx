import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../store';
import { loginUser, clearError } from '../store/slices/userSlice';
import { Link, useNavigate } from 'react-router-dom';
import { Header } from '../components/FuelDetailsHeader';
import './LoginPage.css';
import { ROUTES } from '../../Routes';

const LoginPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  
  const { loading, error, isAuthenticated } = useSelector((state: RootState) => state.user);
  
  const [formData, setFormData] = useState({
    login: '',
    password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    
    if (error) {
      dispatch(clearError());
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.login || !formData.password) {
      return;
    }

    const result = await dispatch(loginUser(formData));
    
    if (loginUser.fulfilled.match(result)) {
      navigate('/');
    }
  };

  if (isAuthenticated) {
    return (
      <div className="login-container">
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
      
      <div className="login-container">
        <h1 className="login-title">Вход в систему</h1>
        
        <div className="login-card">
          <h2>Авторизация</h2>
          
          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="login">
                Логин
              </label>
              <input
                type="text"
                className="form-input"
                id="login"
                name="login"
                value={formData.login}
                onChange={handleChange}
                placeholder="Введите ваш логин"
                required
                disabled={loading}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="password">
                Пароль
              </label>
              <input
                type="password"
                className="form-input"
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
              className="login-button"
              disabled={loading || !formData.login || !formData.password}
            >
              {loading ? (
                <>
                  <span className="spinner" />
                  Вход...
                </>
              ) : (
                'Войти'
              )}
            </button>
            
            <div className="register-link">
              Нет аккаунта? <Link to={ROUTES.REGISTER}>Зарегистрироваться</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;