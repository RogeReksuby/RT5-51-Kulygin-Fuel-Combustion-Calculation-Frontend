import { type FC, useState, useEffect } from 'react';
import { Spinner } from 'react-bootstrap';
import { getFuels, addFuelToCombustion, getCombustionCartCount } from '../modules/Api';
import {type Fuel} from '../modules/types'
import InputField  from '../components/InputField';
import { BreadCrumbs } from '../components/BreadCrumbs';
import { FuelCard } from '../components/FuelCard';
import { ROUTES, ROUTE_LABELS } from '../../Routes';
import { useNavigate } from 'react-router-dom';
import './FuelsPage.css';
import './universal.css';


import { Header } from '../components/FuelHeader';
import { Footer } from '../components/FuelFooter';


const FuelsPage: FC = () => {
  const [searchValue, setSearchValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [fuels, setFuels] = useState<Fuel[]>([]);
  const [cartCount, setCartCount] = useState(0);

  const navigate = useNavigate();

  useEffect(() => {
    loadFuels();
    loadCartCount();
  }, []);

  const loadFuels = async () => {
    setLoading(true);
    try {
      const filters = searchValue ? { searchQuery: searchValue } : undefined;
      const data = await getFuels(filters);
      setFuels(data);
    } catch (error) {
      console.error('Error loading fuels:', error);
      setFuels([]);
    } finally {
      setLoading(false);
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

  const handleSearch = () => {
    loadFuels();
  };

  const handleDetailsClick = (id: number) => {
    navigate(`${ROUTES.FUELS}/${id}`);
  };

  const handleAddToCombustion = async (id: number) => {
    try {
      await addFuelToCombustion(id);
      await loadCartCount();
    } catch (error) {
      console.error('Error adding fuel to combustion:', error);
    }
  };

  return (
    <div>
      <Header 
        title="Расчет энергии сгорания топлива"
        subtitle="Расчет количества теплоты в кДж, выделившихся при полном сгорании топлива при н.у."
      />

      <div className="contentAll">
        <div className="searchTitle">
          <div className="searchBlankFrame"></div>
          <div className="searchTitleFrame">
            Топливо

            <div className="searchContainer">
              <InputField
                value={searchValue}
                setValue={setSearchValue}
                loading={loading}
                onSubmit={handleSearch}
                placeholder="Введите название"
                buttonTitle="Найти"
              />
            </div>
          </div>
          <div className="buckFrame">
            {cartCount !== 0 && (
              <button 
                className={`buttonBuck ${cartCount === 0 ? 'empty-cart' : ''}`}
                disabled={cartCount === 0}
              >
                <img src="http://127.0.0.1:9000/ripimages/korzinaGPORENIE.png" alt="Корзина" />
                {cartCount !== 0 && (
                  <div className="circleBuck">{cartCount}</div>
                )}
              </button>
            )}
          </div>
        </div>

        {loading && (
          <div className="loadingBg">
            <Spinner animation="border" />
          </div>
        )}

        <div className="content">
          {fuels.map((fuel) => (
            <FuelCard
              key={fuel.id}
              {...fuel}
              onDetailsClick={handleDetailsClick}
              onAddToCombustion={handleAddToCombustion}
            />
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default FuelsPage;