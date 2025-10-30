import { type FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../Routes';
import { Breadcrumbs } from '../components/BreadCrumbs';
import './HomePage.css';
import {Header} from '../components/FuelHeader'

export const HomePage: FC = () => {
  const navigate = useNavigate();

  return (
    <div>
      <header>
        <Header 
                title="Расчет энергии сгорания топлива"
                subtitle="Расчет количества теплоты в кДж, выделившихся при полном сгорании топлива при н.у."
              />
      </header>
      <Breadcrumbs/>
      <div className="contentAll">
        <div className="homeContent">
          <div className="homeDescription">
            <h1>Добро пожаловать в систему расчета энергии сгорания</h1>
            
            <div className="descriptionSection">
              <h2>О системе</h2>
              <p>
                Система предназначена для расчета количества тепловой энергии, 
                выделяющейся при полном сгорании различных видов топлива в нормальных условиях. 
                Система учитывает физико-химические свойства топлива и позволяет получить 
                точные расчеты для инженерных и научных целей.
              </p>
            </div>

            <div className="descriptionSection">
              <h2>Возможности системы</h2>
              <ul className="featuresList">
                <li>Расчет теплоты сгорания для различных видов топлива</li>
                <li>Поиск топлива</li>
                <li>Сравнение энергетической эффективности</li>
                <li>Сохранение расчетов для дальнейшего анализа</li>
              </ul>
            </div>

            <div className="actionSection">
              <button 
                className="bButton largeButton"
                onClick={() => navigate(ROUTES.FUELS)}
              >
                Начать расчет энергии
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="footer">
        <img className="logoImage" src="http://127.0.0.1:9000/ripimages/photo.png" alt="logo" />
        Расчет энергии сгорания топлива
      </div>
    </div>
  );
};