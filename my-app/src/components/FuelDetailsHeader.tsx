import { type FC, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../Routes';
import './FuelDetailsHeader.css'; // Не забудьте создать этот CSS файл

export const Header: FC = () => {
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <div className="headerMore">
            <div className="headerMoreFrame">
                <div className="headerMoreLeftFrame">
                    <img className="logoImage" src="http://127.0.0.1:9000/ripimages/photo.png" alt="logo" />
                </div>
                
                {/* ДЕСКТОПНЫЕ КНОПКИ */}
                <div className="headerMoreDesktopNav">
                    <button className="bButton" onClick={() => navigate(ROUTES.FUELS)}>
                        Виды топлива
                    </button>
                    <button className="bButton" onClick={() => navigate(ROUTES.HOME)}>
                        Главная
                    </button>
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
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};