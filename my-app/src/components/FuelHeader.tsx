import { type FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../Routes';
//import './Header.css';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  showHomeButton?: boolean;
}

export const Header: FC<HeaderProps> = ({ 
  title = "Расчет энергии сгорания топлива", 
  subtitle = "Расчет количества теплоты в кДж, выделившихся при полном сгорании топлива при н.у."
}) => {
  const navigate = useNavigate();

  return (
    <header>
      <div className="myHeader">
        <div className="myHeaderPanel">
          <div className="myHeaderPanelFrame">
            <div className="panelFrameServ1">
              <img className="logoImage" src="http://127.0.0.1:9000/ripimages/photo.png" alt="logo" />
            </div>
              <div className="panelFrameServ2">
                <button className="bButton" onClick={() => navigate(ROUTES.HOME)}>
                  Домой
                </button>
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