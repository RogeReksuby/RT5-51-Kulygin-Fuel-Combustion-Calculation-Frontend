import { type FC } from 'react';
import './FuelFooter.css';

export const Footer: FC = () => {
  return (
    <div className="footer">
      <img className="logoImage" src="http://127.0.0.1:9000/ripimages/photo.png" alt="logo" />
      Расчет энергии сгорания топлива
    </div>
  );
};