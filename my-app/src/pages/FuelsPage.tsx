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
    const filters = searchValue ? { searchQuery: searchValue } : undefined;
    const data = await getFuels(filters);
    setFuels(data);
    setLoading(false);
  };

  const loadCartCount = async () => {
    const count = await getCombustionCartCount();
    setCartCount(count);
  };

  const handleSearch = () => {
    loadFuels();
  };

  const handleDetailsClick = (id: number) => {
    navigate(`${ROUTES.FUELS}/${id}`);
  };

  const handleAddToCombustion = async (id: number) => {
    await addFuelToCombustion(id);
    await loadCartCount();
  };

  return (
    <div>
      <header>
        <div className="myHeader">
          <div className="myHeaderPanel">
            <div className="myHeaderPanelFrame">
              <div className="panelFrameServ1">
                <img className="logoImage" src="http://127.0.0.1:9000/ripimages/photo.png" alt="logo" />
              </div>
              <div className="panelFrameServ2">
                <button className="bButton" onClick={() => navigate(ROUTES.HOME)}>
                  Домой
                </button>
              </div>
            </div>
          </div>
          <div className="headerServ1">
            Расчет энергии сгорания топлива
          </div>
          <div className="headerServ2">
            Расчет количества теплоты в кДж, выделившихся при полном сгорании топлива при н.у.
          </div>
        </div>
      </header>

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

      <div className="footer">
        <img className="logoImage" src="http://127.0.0.1:9000/ripimages/photo.png" alt="logo" />
        Расчет энергии сгорания топлива
      </div>
    </div>
  );
};

export default FuelsPage;