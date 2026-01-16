import React from 'react';
import './ErrorPages.css';
import { Header } from '../components/FuelDetailsHeader';

const Error404Page: React.FC = () => {
  return (
    <div className="error-page-container">
        <Header />
      <div className="error-content">
        <h1 className="error-code">404</h1>
        <h2 className="error-title">Страница не найдена</h2>
        <p className="error-message">
          Запрашиваемая страница не существует или была перемещена.
          Проверьте правильность введенного адреса.
        </p>
        
      </div>
    </div>
  );
};

export default Error404Page;