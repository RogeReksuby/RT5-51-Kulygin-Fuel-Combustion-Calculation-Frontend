import { type FC, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../store';
import { logoutUser } from '../store/slices/userSlice';
import { clearCart } from '../store/slices/applicationsSlice';
import { resetFilters } from '../store/slices/filtersSlice';
import { ROUTES } from '../../Routes';
import './FuelDetailsHeader.css';
import photo from '../assets/photo.png'

export const Header: FC = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // Получаем данные из Redux store
    const { user, isAuthenticated } = useSelector((state: RootState) => state.user);
    const { cart } = useSelector((state: RootState) => state.combustions);

    // Проверяем, является ли пользователь модератором
    const isModerator = user?.is_moderator;

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
        <div className="headerMore">
            <div className="headerMoreFrame">
                <div className="headerMoreLeftFrame">
                    <img className="logoImage" src={photo} alt="logo" />
                </div>
                
                {/* ДЕСКТОПНЫЕ КНОПКИ */}
                <div className="headerMoreDesktopNav">
                    <button className="bButton" onClick={() => navigate(ROUTES.HOME)}>
                        Домой
                    </button>
                    <button className="bButton" onClick={() => navigate(ROUTES.FUELS)}>
                        Топливо
                    </button>
                    
                    
                    {/* КНОПКИ ДЛЯ АВТОРИЗОВАННЫХ ПОЛЬЗОВАТЕЛЕЙ */}
                    {isAuthenticated ? (
                        <>
                            {/* ПАНЕЛЬ МОДЕРАТОРА - ТОЛЬКО ДЛЯ МОДЕРАТОРОВ */}
                            {isModerator && (
                                <button 
                                className="bButton moderator-button"
                                onClick={() => navigate(ROUTES.MODERATOR_SERVICES)}
                                >
                                Панель инженера
                                </button>
                            )}
                            
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
                
                {/* МОБИЛЬНОЕ МЕНЮ */}
                <div className="headerMoreMobileNav">
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
                                    navigate(ROUTES.FUELS);
                                    setIsMenuOpen(false);
                                }}
                            >
                                Виды топлива
                            </button>
                            <button 
                                className="dropdown-item"
                                onClick={() => {
                                    navigate(ROUTES.HOME);
                                    setIsMenuOpen(false);
                                }}
                            >
                                Главная
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
    );
};