// components/FuelCard.tsx
import { type FC } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../store';
import { addFuelToCombustion } from '../store/slices/applicationsSlice';
import './FuelCard.css';
import DefaultImage from '../assets/DefaultImage.jpg';
import { transformImageUrl } from '../target_config';

interface Props {
  id: number;
  title: string;
  heat: number;
  card_image: string;
  onDetailsClick: (id: number) => void;
  onFuelAdded?: () => void;
}

export const FuelCard: FC<Props> = ({ 
  id, 
  title, 
  heat, 
  card_image, 
  onDetailsClick, 
  onFuelAdded,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  
  const { isAuthenticated } = useSelector((state: RootState) => state.user);
  const { loading: combustionsLoading, error: combustionsError } = useSelector((state: RootState) => state.combustions);

  const handleAddToApplication = async () => {
    if (!isAuthenticated) {
      alert('Для добавления в расчет необходимо авторизоваться');
      return;
    }

    try {
      // Используем unwrap() для автоматической обработки ошибок
      await dispatch(addFuelToCombustion(id)).unwrap();
      
      // Успешно добавлено - обновляем корзину
      if (onFuelAdded) {
        onFuelAdded();
      }

      console.log(`Топливо "${title}" добавлено в расчет`);
    } catch (error: any) {
      console.error('Ошибка при добавлении в расчет:', error);
      alert(error.message || 'Не удалось добавить топливо в расчет');
    }
  };

  return (
    <div className="card" style={{
      background: `linear-gradient(0deg, rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url(${transformImageUrl(card_image) || DefaultImage}) center/cover no-repeat`
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
      
      {/* ОСНОВНОЙ КОНТЕНТ КАРТОЧКИ */}
      <div className="cardContent">
        {/* УДЕЛЬНАЯ ТЕПЛОТА СГОРАНИЯ */}
        <div className="cardBottom">
          {heat} МДж/кг
        </div>
        
        {/* СЕКЦИЯ ДОБАВЛЕНИЯ В ЗАЯВКУ */}
        <div className="cardApplicationSection">
          {isAuthenticated ? (
            <button 
              className={`addToApplicationBtn ${combustionsLoading ? 'loading' : ''}`}
              onClick={handleAddToApplication}
              disabled={combustionsLoading}
            >
              {combustionsLoading ? 'Добавление...' : 'В расчет'}
            </button>
          ) : (
            <div className="loginPrompt">
              <small>Войдите, чтобы добавить в расчет</small>
            </div>
          )}
        </div>
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
};