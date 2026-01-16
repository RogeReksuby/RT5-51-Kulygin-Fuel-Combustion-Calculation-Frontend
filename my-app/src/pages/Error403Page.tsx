import React from 'react';
import './ErrorPages.css';
import { Header } from '../components/FuelDetailsHeader';


const Error403Page: React.FC = () => {
  return (
    <div className="error-page-container">
    <Header />
      <div className="error-content">
        <h1 className="error-code">403</h1>
        <h2 className="error-title">Доступ запрещен</h2>
        <p className="error-message">
          У вас недостаточно прав для просмотра этой страницы.
        </p>
        
      </div>
      
    </div>
  );
};

export default Error403Page;