import { type FC, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../Routes';
import './FuelHeader.css';

interface HeaderProps {
  title?: string;
  subtitle?: string;
}

export const Header: FC<HeaderProps> = ({ 
  title = "Расчет энергии сгорания топлива", 
  subtitle = "Расчет количества теплоты в кДж, выделившихся при полном сгорании топлива при н.у."
}) => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header>
      <div className="myHeader">
        <div className="myHeaderPanel">
          <div className="myHeaderPanelFrame">
            <div className="panelFrameServ1">
              <img className="logoImage" src="http://127.0.0.1:9000/ripimages/photo.png" alt="logo" />
            </div>
            
            {/* ТОЛЬКО ДЕСКТОПНЫЕ КНОПКИ */}
            <div className="desktop-nav-buttons">
              <button className="bButton" onClick={() => navigate(ROUTES.HOME)}>
                Домой
              </button>
              <button className="bButton" onClick={() => navigate(ROUTES.FUELS)}>
                Топливо
              </button>
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