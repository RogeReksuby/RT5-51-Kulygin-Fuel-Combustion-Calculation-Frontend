import { type FC } from 'react';
import { Card } from 'react-bootstrap';
import './FuelCard.css';
import DefaultImage from '../assets/DefaultImage.jpg';

interface Props {
  id: number;
  title: string;
  heat: number;
  card_image: string;
  onDetailsClick: (id: number) => void;
  onAddToCombustion: (id: number) => void;
}

export const FuelCard: FC<Props> = ({ 
  id, 
  title, 
  heat, 
  card_image, 
  onDetailsClick, 
  onAddToCombustion 
}) => (
  <div className="card" style={{
    background: `linear-gradient(0deg, rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url(${card_image || DefaultImage}) center/cover no-repeat`
  }}>
    <div className="cardTop">
      <div className="cardTitle">
        {title}
      </div>
      <div className="cardButton">
        <button 
          className="bButton" 
          style={{ width: '100%' }}
          onClick={() => onDetailsClick(id)}
        >
          Подробнее &gt;
        </button>

      </div>
    </div>
    <div className="cardBottom">
      {heat} МДж/кг
    </div>
  </div>
);