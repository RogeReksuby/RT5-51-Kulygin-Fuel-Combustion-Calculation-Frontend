import {type FC} from 'react'
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../Routes';

export const Header: FC = () => {
    const navigate = useNavigate();
    return (
    <div className="headerMore">
            <div className="headerMoreFrame">
              <div className="headerMoreLeftFrame">
                <img className="logoImage" src="http://127.0.0.1:9000/ripimages/photo.png" alt="logo" />
              </div>
              <div className="headerMoreRightFrame">
                <button className="bButton" onClick={() => navigate(ROUTES.FUELS)}>
                  Виды топлива
                </button>
                <button className="bButton" onClick={() => navigate(ROUTES.HOME)}>
                  Главная
                </button>
              </div>
            </div>
          </div>
)
}

