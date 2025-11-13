import { type FC } from 'react';
import './FuelFooter.css';
import photo from '../assets/photo.png'

export const Footer: FC = () => {
  return (
    <div className="footer">
      <img className="logoImage" src={photo} alt="logo" />
      Расчет энергии сгорания топлива
    </div>
  );
};