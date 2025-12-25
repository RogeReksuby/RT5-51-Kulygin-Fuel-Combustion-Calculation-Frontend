import { type FC, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../store';
import { logoutUser } from '../store/slices/userSlice';
import { clearCart } from '../store/slices/applicationsSlice';
import { resetFilters } from '../store/slices/filtersSlice';
import { ROUTES } from '../../Routes';
import './FuelHeader.css';
import photo from '../assets/photo.png'
import backimage from '../assets/backimage.jpg'

interface HeaderProps {
  title?: string;
  subtitle?: string;
}

export const Header: FC<HeaderProps> = ({ 
  title = "Расчет энергии сгорания топлива", 
  subtitle = "Расчет количества теплоты в кДж, выделившихся при полном сгорании топлива при н.у."
}) => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Получаем данные из Redux store
  const { /*user, */isAuthenticated } = useSelector((state: RootState) => state.user);
  const { cart } = useSelector((state: RootState) => state.combustions);

  // Обработчик выхода из системы
  const handleLogout = async () => {
    await dispatch(logoutUser());
    dispatch(clearCart()); // Очищаем корзину
    dispatch(resetFilters()); // Сбрасываем фильтры
    setIsMenuOpen(false); // Закрываем меню

    navigate('/');
  };

  // Обработчик перехода в корзину
  const handleCartClick = () => {
    if (cart.app_id) {
      navigate(`${ROUTES.APPLICATIONS}/${cart.app_id}`);
    }
    setIsMenuOpen(false);
  };

  return (
    <header>
      <div 
        className="myHeader" 
        style={{
          background: `linear-gradient(0deg, rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url(${backimage}) center/cover no-repeat`
        }}
      >
        <div className="myHeaderPanel">
          <div className="myHeaderPanelFrame">
            <div className="panelFrameServ1">
              <img className="logoImage" src={photo} alt="logo" />
            </div>
            
            {/* ТОЛЬКО ДЕСКТОПНЫЕ КНОПКИ */}
            <div className="desktop-nav-buttons">
              <button className="bButton" onClick={() => navigate(ROUTES.HOME)}>
                Домой
              </button>
              <button className="bButton" onClick={() => navigate(ROUTES.FUELS)}>
                Топливо
              </button>
              
              {/* КНОПКИ ДЛЯ АВТОРИЗОВАННЫХ ПОЛЬЗОВАТЕЛЕЙ */}
              {isAuthenticated ? (
                <>
                  
                  
                  {/* МОИ ЗАЯВКИ */}
                  <button 
                    className="bButton" 
                    onClick={() => navigate(ROUTES.APPLICATIONS)}
                  >
                    Мои заявки
                  </button>
                  
                  <button 
                    className="bButton"
                    onClick={() => navigate(ROUTES.PROFILE)}
                  >
                    Личный кабинет
                  </button>
                  <button 
                    className="bButton login-button"
                    onClick={handleLogout}
                  >
                      Выйти
                  </button>


                </>
              ) : (
                /* КНОПКА ВХОДА ДЛЯ НЕАВТОРИЗОВАННЫХ */
                <button 
                  className="bButton login-button"
                  onClick={() => navigate(ROUTES.LOGIN)}
                >
                  Войти
                </button>
              )}
            </div>
            
            {/* ТОЛЬКО МОБИЛЬНЫЙ БУРГЕР */}
            <div className="mobile-nav-burger">
              <button 
                className="burger-button"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                <span className="burger-line"></span>
                <span className="burger-line"></span>
                <span className="burger-line"></span>
              </button>
              
              {isMenuOpen && (
                <div className="burger-dropdown">
                  <button 
                    className="dropdown-item"
                    onClick={() => {
                      navigate(ROUTES.HOME);
                      setIsMenuOpen(false);
                    }}
                  >
                    Домой
                  </button>
                  <button 
                    className="dropdown-item"
                    onClick={() => {
                      navigate(ROUTES.FUELS);
                      setIsMenuOpen(false);
                    }}
                  >
                    Топливо
                  </button>
                  
                  {/* МОБИЛЬНЫЕ КНОПКИ АВТОРИЗАЦИИ */}
                  {isAuthenticated ? (
                    <>
                      {cart.app_id && (
                        <button 
                          className="dropdown-item"
                          onClick={handleCartClick}
                        >
                          🛒 Корзина ({cart.count || 0})
                        </button>
                      )}
                      <button 
                        className="dropdown-item"
                        onClick={() => {
                          navigate(ROUTES.APPLICATIONS);
                          setIsMenuOpen(false);
                        }}
                      >
                        Мои заявки
                      </button>
                      <button 
                        className="dropdown-item"
                        onClick={() => {
                          navigate(ROUTES.PROFILE);
                          setIsMenuOpen(false);
                        }}
                      >
                        Профиль
                      </button>
                      <button 
                        className="dropdown-item logout-button"
                        onClick={handleLogout}
                      >
                        Выйти
                      </button>
                    </>
                  ) : (
                    <button 
                      className="dropdown-item login-button"
                      onClick={() => {
                        navigate(ROUTES.LOGIN);
                        setIsMenuOpen(false);
                      }}
                    >
                      Войти
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="headerServ1">
          {title}
        </div>
        <div className="headerServ2">
          {subtitle}
        </div>
      </div>
    </header>
  );
};