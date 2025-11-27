import { type FC } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../store';
import { addFuelToApplication, getCartData } from '../store/slices/applicationsSlice';
import './FuelCard.css';
import DefaultImage from '../assets/DefaultImage.jpg';
import { transformImageUrl } from '../target_config';

interface Props {
  id: number;
  title: string;
  heat: number;
  card_image: string;
  onDetailsClick: (id: number) => void;
}

export const FuelCard: FC<Props> = ({ 
  id, 
  title, 
  heat, 
  card_image, 
  onDetailsClick, 
}) => {
  const dispatch = useDispatch<AppDispatch>();
  
  // Получаем состояние авторизации и загрузки
  const { isAuthenticated } = useSelector((state: RootState) => state.user);
  const { loading } = useSelector((state: RootState) => state.applications);

  // Обработчик добавления в заявку
  const handleAddToApplication = async () => {
    if (!isAuthenticated) {
      alert('Для добавления в заявку необходимо авторизоваться');
      return;
    }

    try {
      // Добавляем топливо в заявку
      await dispatch(addFuelToApplication(id)).unwrap();
      
      // Обновляем данные корзины (чтобы обновился счетчик)
      await dispatch(getCartData()).unwrap();
      
      // Ждем немного и обновляем корзину
      setTimeout(() => {
        dispatch(getCartData());
        console.log("grgg")
      }, 5000);

      // Можно показать уведомление об успехе
      console.log(`Топливо "${title}" добавлено в заявку`);
    } catch (error) {
      console.error('Ошибка при добавлении в заявку:', error);
      alert('Не удалось добавить топливо в заявку');
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
              className={`addToApplicationBtn ${loading ? 'loading' : ''}`}
              onClick={handleAddToApplication}
              disabled={loading}
            >
              {loading ? '⏳ Добавляем...' : '➕ В заявку'}
            </button>
          ) : (
            <div className="loginPrompt">
              <small>Войдите, чтобы добавить в заявку</small>
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