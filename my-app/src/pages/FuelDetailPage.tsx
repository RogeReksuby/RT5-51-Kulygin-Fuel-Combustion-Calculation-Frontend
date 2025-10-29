import { type FC, useEffect, useState } from 'react';
import { BreadCrumbs } from '../components/BreadCrumbs';
import { ROUTES, ROUTE_LABELS } from '../../Routes';
import { useParams, useNavigate } from 'react-router-dom';
import { getFuelById } from '../modules/Api';
import { type Fuel } from '../modules/types'
import { Spinner, Container, Row, Col, Image } from 'react-bootstrap';
import './FuelDetailPage.css';
import DefaultImage from '../assets/DefaultImage.jpg';

export const FuelDetailPage: FC = () => {
  const [fuel, setFuel] = useState<Fuel | null>(null);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) return;
    getFuelById(Number(id))
      .then(setFuel);
  }, [id]);

  return (
    <div>
      <div className="headerMore">
        <div className="headerMoreFrame">
          <div className="headerMoreLeftFrame">
            <img className="logoImage" src="http://127.0.0.1:9000/ripimages/photo.png" alt="logo" />
          </div>
          <div className="headerMoreRightFrame">
            <button className="bButton" onClick={() => navigate(ROUTES.FUELS)}>
              Домой
            </button>
          </div>
        </div>
      </div>

      {fuel ? (
        <div className="contentMore">
          <div className="contentMoreFrame">
            <img className="cardMoreImage" src={fuel.card_image} alt="card image" />
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

      <div className="footer">
        <img className="logoImage" src="http://127.0.0.1:9000/ripimages/photo.png" alt="logo" />
        Расчет энергии сгорания топлива
      </div>
    </div>
  );
};