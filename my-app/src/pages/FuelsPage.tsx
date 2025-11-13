import { type FC, useState, useEffect } from 'react';
import { getFuels, getCombustionCartCount } from '../modules/Api';
import {type Fuel} from '../modules/types'
import InputField  from '../components/InputField';
import { Breadcrumbs } from '../components/BreadCrumbs';
import { FuelCard } from '../components/FuelCard';
import { ROUTES } from '../../Routes';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux'; // Хук для отправки писем
import { 
  useSearchQuery,     // Хук для чтения поискового запроса
  setSearchQuery,     // Действие для изменения поиска
} from '../store/slices/filtersSlice'
import './FuelsPage.css';
import './universal.css';
import korzina from '../assets/korzinaGPORENIE.png'


import { Header } from '../components/FuelHeader';
import { Footer } from '../components/FuelFooter';


const FuelsPage: FC = () => {

  // 1. Получаем "почтальона" для отправки писем
  const dispatch = useDispatch();
  // 2. Читаем данные из почтового отделения
  const searchQuery = useSearchQuery()

  const [fuels, setFuels] = useState<Fuel[]>([]);
  const [cartCount, setCartCount] = useState(0);

  const navigate = useNavigate();

  useEffect(() => {
    loadFuels();
    loadCartCount();
  }, []);

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

  const loadCartCount = async () => {
    try {
      const count = await getCombustionCartCount();
      setCartCount(count);
    } catch (error) {
      console.error('Error loading cart count:', error);
      setCartCount(0);
    }
  };

  // 3. Отправляем "письмо" в почтовое отделение
  const handleSearchChange = (value: string) => {
    // "Отправляем письмо" с новым поисковым запросом
    dispatch(setSearchQuery(value));
  }

  const handleSearch = () => {
    loadFuels();
  };

  const handleDetailsClick = (id: number) => {
    navigate(`${ROUTES.FUELS}/${id}`);
  };

  /*const handleAddToCombustion = async (id: number) => {
    try {
      await loadCartCount();
    } catch (error) {
      console.error('Error adding fuel to combustion:', error);
    }
  };*/

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
            {cartCount !== 0 ? (
              //<a href={`/combustion/${reqID}`} className="cart-link">
                <button className="buttonBuck">
                  <img src={korzina} alt="Корзина" />
                  <div className="circleBuck">{cartCount}</div>
                </button>
              //</a>
            ) : (
              <button className="buttonBuck empty-cart" disabled>
                <img src={korzina} alt="Корзина" />
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
              //onAddToCombustion={handleAddToCombustion}
            />
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default FuelsPage;