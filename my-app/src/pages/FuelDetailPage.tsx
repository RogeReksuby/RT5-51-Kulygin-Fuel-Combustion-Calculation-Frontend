import { type FC, useEffect, useState } from 'react';
import { useParams /*, useNavigate */} from 'react-router-dom';
import { getFuelById } from '../modules/Api';
import { type Fuel } from '../modules/types'
import { Spinner /*, Container, Row, Col, Image */} from 'react-bootstrap';
import { Header } from '../components/FuelDetailsHeader'
import { Footer } from '../components/FuelFooter';
import { Breadcrumbs } from '../components/BreadCrumbs';
import './FuelDetailPage.css';
import DefaultImage from '../assets/DefaultImage.jpg';

export const FuelDetailPage: FC = () => {
  const [fuel, setFuel] = useState<Fuel | null>(null);
  const { id } = useParams();

  useEffect(() => {
    if (!id) return;
    getFuelById(Number(id))
      .then(setFuel);
  }, [id]);

  return (
    <div>
      <Header/>
      <Breadcrumbs/>
      {fuel ? (
        <div className="contentMore">
          <div className="contentMoreFrame">
            <img className="cardMoreImage" src={fuel.card_image || DefaultImage} alt="card image" />
            <div className="textsMore">
              <div className="titleHeatMore">
                <div className="titleMore">
                  {fuel.title}
                </div>
                <div className="heatMore">
                  {fuel.heat} МДж/кг
                </div>
              </div>
              <div className="shortTextMore">
                {fuel.short_desc}
              </div>
              <div className="fullTextMore">
                {fuel.full_desc}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="fuel-detail-loader">
          <Spinner animation="border" />
        </div>
      )}

      <Footer/>
    </div>
  );
};