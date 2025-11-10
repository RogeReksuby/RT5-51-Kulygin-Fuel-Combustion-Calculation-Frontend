import { type FC } from 'react';
import './FuelCard.css';
import DefaultImage from '../assets/DefaultImage.jpg';

interface Props {
  id: number;
  title: string;
  heat: number;
  card_image: string;
  onDetailsClick: (id: number) => void;
  //onAddToCombustion: (id: number) => void;
}

export const FuelCard: FC<Props> = ({ 
  id, 
  title, 
  heat, 
  card_image, 
  onDetailsClick, 
}) => (
  <div className="card" style={{
    background: `linear-gradient(0deg, rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url(${card_image || DefaultImage}) center/cover no-repeat`
  }}>
    {/* ДЕСКТОПНАЯ СТРУКТУРА */}
    <div className="cardTop">
      <div className="cardTitle">
        {title}
      </div>
      {/* ДЕСКТОПНАЯ КНОПКА - справа */}
      <div className="cardButtonDesktop">
        <button 
          className="bButton" 
          onClick={() => onDetailsClick(id)}
        >
          Подробнее &gt;
        </button>
      </div>
    </div>
    
    
    
    <div className="cardBottom">
      {heat} МДж/кг
    </div>
    {/* МОБИЛЬНАЯ КНОПКА - внизу */}
    <div className="cardButtonMobile">
      <button 
        className="bButton" 
        onClick={() => onDetailsClick(id)}
      >
        Подробнее &gt;
      </button>
    </div>
  </div>
);