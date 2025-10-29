import { type FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../Routes';
import './HomePage.css';

export const HomePage: FC = () => {
  const navigate = useNavigate();

  return (
    <div>
      <header>
        <div className="myHeader">
          <div className="myHeaderPanel">
            <div className="myHeaderPanelFrame">
              <div className="panelFrameServ1">
                <img className="logoImage" src="http://127.0.0.1:9000/ripimages/photo.png" alt="logo" />
              </div>
              <div className="panelFrameServ2">
                <button className="bButton" onClick={() => navigate(ROUTES.FUELS)}>
                  К топливу
                </button>
              </div>
            </div>
          </div>
          <div className="headerServ1">
            Расчет энергии сгорания топлива
          </div>
          <div className="headerServ2">
            Расчет количества теплоты в кДж, выделившихся при полном сгорании топлива при н.у.
          </div>
        </div>
      </header>

      <div className="contentAll">
        <div className="homeContent">
          <div className="homeDescription">
            <h1>Добро пожаловать в систему расчета энергии сгорания</h1>
            
            <div className="descriptionSection">
              <h2>О системе</h2>
              <p>
                Наша система предназначена для расчета количества тепловой энергии, 
                выделяющейся при полном сгорании различных видов топлива в нормальных условиях. 
                Система учитывает физико-химические свойства топлива и позволяет получить 
                точные расчеты для инженерных и научных целей.
              </p>
            </div>

            <div className="descriptionSection">
              <h2>Возможности системы</h2>
              <ul className="featuresList">
                <li>📊 Расчет теплоты сгорания для различных видов топлива</li>
                <li>🔍 Поиск и фильтрация топлива по характеристикам</li>
                <li>📈 Сравнение энергетической эффективности</li>
                <li>💾 Сохранение расчетов для дальнейшего анализа</li>
                <li>📱 Удобный и интуитивно понятный интерфейс</li>
              </ul>
            </div>

            <div className="descriptionSection">
              <h2>Поддерживаемые виды топлива</h2>
              <div className="fuelTypes">
                <div className="fuelTypeItem">
                  <strong>Газообразное топливо:</strong>
                  <span>Природный газ, пропан, бутан</span>
                </div>
                <div className="fuelTypeItem">
                  <strong>Жидкое топливо:</strong>
                  <span>Бензин, дизельное топливо, мазут</span>
                </div>
                <div className="fuelTypeItem">
                  <strong>Твердое топливо:</strong>
                  <span>Уголь, древесина, торф</span>
                </div>
              </div>
            </div>

            <div className="descriptionSection">
              <h2>Как начать работу</h2>
              <ol className="instructionsList">
                <li>Перейдите в раздел "Топливо" для просмотра доступных видов топлива</li>
                <li>Используйте поиск для быстрого нахождения нужного топлива</li>
                <li>Нажмите "Подробнее" для просмотра детальной информации</li>
                <li>Добавьте топливо в расчет для получения энергетических показателей</li>
              </ol>
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