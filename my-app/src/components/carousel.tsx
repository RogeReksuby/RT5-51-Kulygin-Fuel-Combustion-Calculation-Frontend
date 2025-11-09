import { type FC } from 'react';
import DefaultImage from '../assets/DefaultImage.jpg';
import CalculationImage from '../assets/Calculation.jpg';
import FuelsImage from '../assets/Fuels.jpg';
import EfficiencyImage from '../assets/Efficiency.jpg';
import SaveImage from '../assets/Save.jpg';
import './carousel.css';

export const Carousel: FC = () => {
  return (
    <div id="fuelCarousel" className="carousel slide mb-4" data-bs-ride="carousel">
      <div className="carousel-indicators">
        <button type="button" data-bs-target="#fuelCarousel" data-bs-slide-to="0" className="active" aria-current="true" aria-label="Slide 1"></button>
        <button type="button" data-bs-target="#fuelCarousel" data-bs-slide-to="1" aria-label="Slide 2"></button>
        <button type="button" data-bs-target="#fuelCarousel" data-bs-slide-to="2" aria-label="Slide 3"></button>
        <button type="button" data-bs-target="#fuelCarousel" data-bs-slide-to="3" aria-label="Slide 4"></button>
      </div>

      <div className="carousel-inner rounded shadow-sm">
        {/* Слайд 1 */}
        <div className="carousel-item active">
          <div className="carousel-content">
            <div className="carousel-image-container">
              <img src={CalculationImage} alt="Расчёт" className="carousel-image" />
            </div>
            <div className="carousel-text-container">
              <h4>Расчёт теплоты сгорания</h4>
              <p className="text-muted">
                Точный расчёт выделяемой энергии для различных видов топлива при нормальных условиях.
              </p>
            </div>
          </div>
        </div>

        {/* Слайд 2 */}
        <div className="carousel-item">
          <div className="carousel-content">
            <div className="carousel-image-container">
              <img src={FuelsImage} alt="Поиск" className="carousel-image" />
            </div>
            <div className="carousel-text-container">
              <h4>Поиск топлива</h4>
              <p className="text-muted">
                Быстро находите нужное топливо по названию.
              </p>
            </div>
          </div>
        </div>

        {/* Слайд 3 */}
        <div className="carousel-item">
          <div className="carousel-content">
            <div className="carousel-image-container">
              <img src={EfficiencyImage} alt="Сравнение" className="carousel-image" />
            </div>
            <div className="carousel-text-container">
              <h4>Сравнение эффективности</h4>
              <p className="text-muted">
                Сравнивайте энергетическую ценность и экологичность разных видов топлива.
              </p>
            </div>
          </div>
        </div>

        {/* Слайд 4 */}
        <div className="carousel-item">
          <div className="carousel-content">
            <div className="carousel-image-container">
              <img src={SaveImage} alt="Сохранение" className="carousel-image" />
            </div>
            <div className="carousel-text-container">
              <h4>Сохранение расчётов</h4>
              <p className="text-muted">
                Сохраняйте результаты для последующего анализа.
              </p>
            </div>
          </div>
        </div>
      </div>

      <button className="carousel-control-prev" type="button" data-bs-target="#fuelCarousel" data-bs-slide="prev">
        <span className="carousel-control-prev-icon" aria-hidden="true"></span>
        <span className="visually-hidden">Назад</span>
      </button>
      <button className="carousel-control-next" type="button" data-bs-target="#fuelCarousel" data-bs-slide="next">
        <span className="carousel-control-next-icon" aria-hidden="true"></span>
        <span className="visually-hidden">Вперёд</span>
      </button>
    </div>
  );
};