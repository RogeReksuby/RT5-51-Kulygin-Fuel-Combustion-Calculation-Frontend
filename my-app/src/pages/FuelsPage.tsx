import { type FC, useState, useEffect } from 'react';
import { getFuels, getCombustionCartCount } from '../modules/Api';
import { type Fuel } from '../modules/types'
import InputField from '../components/InputField';
import { Breadcrumbs } from '../components/BreadCrumbs';
import { FuelCard } from '../components/FuelCard';
import { ROUTES } from '../../Routes';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  useSearchQuery,
  setSearchQuery,
} from '../store/slices/filtersSlice'
import type { RootState } from '../store';
import './FuelsPage.css';
import './universal.css';
import korzina from '../assets/korzinaGPORENIE.png'
import { Header } from '../components/FuelHeader';
import { Footer } from '../components/FuelFooter';

const FuelsPage: FC = () => {
  const dispatch = useDispatch();
  const searchQuery = useSearchQuery();
  const navigate = useNavigate();
  
  // Локальный state для корзины
  const [cartCount, setCartCount] = useState(0);
  const [cartAppId, setCartAppId] = useState<number | undefined>(undefined);

  const { isAuthenticated } = useSelector((state: RootState) => state.user);
  const [fuels, setFuels] = useState<Fuel[]>([]);

  useEffect(() => {
    loadFuels();
    loadCartCount();
  }, []);

  // Функция загрузки данных корзины
  const loadCartCount = async () => {
    try {
      const cartData = await getCombustionCartCount();
      setCartCount(cartData.count || 0);
      setCartAppId(cartData.app_id);
      console.log('Cart data loaded:', cartData);
    } catch (error) {
      console.error('Error loading cart count:', error);
      setCartCount(0);
    }
  };

  // ОБРАБОТЧИК КЛИКА НА КОРЗИНУ
  const handleCartClick = () => {
    if (cartAppId && cartCount > 0) {
      navigate(`${ROUTES.APPLICATIONS}/${cartAppId}`);
    } else {
      console.log('Корзина пуста или app_id отсутствует');
      alert('Корзина пуста или заявка не создана');
    }
  };

  // ФУНКЦИЯ ДЛЯ ОБНОВЛЕНИЯ КОРЗИНЫ ПОСЛЕ ДОБАВЛЕНИЯ ТОПЛИВА
  const refreshCart = async () => {
    await loadCartCount();
  };

  const loadFuels = async () => {
    try {
      const data = await getFuels({
        searchQuery: searchQuery
      });
      setFuels(data);
    } catch (error) {
      console.error('Error loading fuels:', error);
      setFuels([]);
    } 
  };

  const handleSearchChange = (value: string) => {
    dispatch(setSearchQuery(value));
  }

  const handleSearch = () => {
    loadFuels();
  };

  const handleDetailsClick = (id: number) => {
    navigate(`${ROUTES.FUELS}/${id}`);
  };

  return (
    <div>
      <Header 
        title="Расчет энергии сгорания топлива"
        subtitle="Расчет количества теплоты в кДж, выделившихся при полном сгорании топлива при н.у."
      />
      <Breadcrumbs/>
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
            {cartCount !== 0 && isAuthenticated && cartAppId ? (
              <button 
                className="buttonBuck" 
                onClick={handleCartClick}
              >
                <img src={korzina} alt="Корзина" />
                <div className="circleBuck">{cartCount}</div>
              </button>
            ) : (
              <button className="buttonBuck empty-cart" disabled>
                <img src={korzina} alt="Корзина" />
                {cartCount > 0 && (
                  <div className="circleBuck">{cartCount}</div>
                )}
              </button>
            )}
          </div>
        </div>

        <div className="content">
          {fuels.map((fuel) => (
            <FuelCard
              key={fuel.id}
              {...fuel}
              onDetailsClick={handleDetailsClick}
              onFuelAdded={refreshCart} // ← ПЕРЕДАЕМ ФУНКЦИЮ ОБНОВЛЕНИЯ
            />
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default FuelsPage;