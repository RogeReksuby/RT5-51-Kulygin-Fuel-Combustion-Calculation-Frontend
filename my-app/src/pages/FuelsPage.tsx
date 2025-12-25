// pages/FuelsPage.tsx
import { type FC, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../store';
import { 
  getFuelsList,
  getFuelById 
} from '../store/slices/fuelsSlice';
import { 
  addFuelToCombustion,
  getCombustionCartCount 
} from '../store/slices/applicationsSlice';
import { 
  useSearchQuery,
  setSearchQuery,
} from '../store/slices/filtersSlice';
import { type Fuel } from '../modules/types';
import InputField from '../components/InputField';
import { Breadcrumbs } from '../components/BreadCrumbs';
import { FuelCard } from '../components/FuelCard';
import { ROUTES } from '../../Routes';
import './FuelsPage.css';
import './universal.css';
import korzina from '../assets/korzinaGPORENIE.png';
import { Header } from '../components/FuelHeader';
import { Footer } from '../components/FuelFooter';

const FuelsPage: FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  
  // Используем состояние из Redux store
  const searchQuery = useSearchQuery();
  const { isAuthenticated } = useSelector((state: RootState) => state.user);
  const { cart, loading: cartLoading } = useSelector((state: RootState) => state.combustions);
  const { fuels, loading: fuelsLoading } = useSelector((state: RootState) => state.fuels);

  // Загружаем данные при монтировании компонента
  useEffect(() => {
    // Загружаем список топлива
    dispatch(getFuelsList({ title: searchQuery }));
    
    // Если пользователь авторизован, загружаем данные корзины
    if (isAuthenticated) {
      dispatch(getCombustionCartCount());
    }
  }, [dispatch, isAuthenticated]);

  // Обработчик клика на корзину
  const handleCartClick = useCallback(() => {
    if (cart.app_id && cart.count && cart.count > 0) {
      navigate(`${ROUTES.APPLICATIONS}/${cart.app_id}`);
    } else {
      console.log('Корзина пуста или app_id отсутствует');
      alert('Корзина пуста или расчет не создан');
    }
  }, [cart.app_id, cart.count, navigate]);

  // Функция для обновления корзины после добавления топлива
  const refreshCart = useCallback(() => {
    if (isAuthenticated) {
      dispatch(getCombustionCartCount());
    }
  }, [dispatch, isAuthenticated]);

  // Загрузка топлива с фильтрацией
  const loadFuels = useCallback(() => {
    dispatch(getFuelsList({ title: searchQuery }));
  }, [dispatch, searchQuery]);

  const handleSearchChange = useCallback((value: string) => {
    dispatch(setSearchQuery(value));
  }, [dispatch]);

  const handleSearch = useCallback(() => {
    loadFuels();
  }, [loadFuels]);

  const handleDetailsClick = useCallback((id: number) => {
    navigate(`${ROUTES.FUELS}/${id}`);
  }, [navigate]);

  return (
    <div>
      <Header 
        title="Расчет энергии сгорания топлива"
        subtitle="Расчет количества теплоты в кДж, выделившихся при полном сгорании топлива при н.у."
      />
      <Breadcrumbs />
      
      <div className="contentAll">
        <div className="searchTitle">
          <div className="searchBlankFrame"></div>
          
          <div className="searchTitleFrame">
            Топливо
            <div className="searchContainer">
              <InputField
                value={searchQuery}
                setValue={handleSearchChange}
                onSubmit={handleSearch}
                placeholder="Введите название"
                buttonTitle="Найти"
              />
            </div>
          </div>
          
          <div className="buckFrame">
            {isAuthenticated && cart.count && cart.count > 0 ? (
              <button 
                className="buttonBuck" 
                onClick={handleCartClick}
                disabled={cartLoading}
              >
                <img src={korzina} alt="Корзина" />
                {!cartLoading && (
                  <div className="circleBuck">{cart.count}</div>
                )}
                {cartLoading && (
                  <div className="circleBuck loading">...</div>
                )}
              </button>
            ) : (
              <button className="buttonBuck empty-cart" disabled>
                <img src={korzina} alt="Корзина" />
                {isAuthenticated && cart.count && cart.count > 0 && !cartLoading && (
                  <div className="circleBuck">{cart.count}</div>
                )}
                {cartLoading && (
                  <div className="circleBuck loading">...</div>
                )}
              </button>
            )}
          </div>
        </div>

        <div className="content">
          {fuelsLoading ? (
            <div className="loading-indicator">Загрузка топлива...</div>
          ) : fuels.length === 0 ? (
            <div className="empty-state">
              {searchQuery ? 'По вашему запросу ничего не найдено' : 'Топливо не найдено'}
            </div>
          ) : (
            fuels.map((fuel: Fuel) => (
              <FuelCard
                key={fuel.id}
                {...fuel}
                onDetailsClick={handleDetailsClick}
                onFuelAdded={refreshCart}
              />
            ))
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default FuelsPage;