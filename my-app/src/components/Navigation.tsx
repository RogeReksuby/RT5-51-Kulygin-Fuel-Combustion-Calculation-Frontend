import { type FC } from 'react';
import { Navbar, Nav, Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../Routes';

export const Navigation: FC = () => {
  return (
    <Navbar bg="light" expand="lg">
      <Container>
        <Navbar.Brand as={Link} to={ROUTES.HOME}>
          <img 
            src="http://127.0.0.1:9000/ripimages/photo.png" 
            alt="logo" 
            style={{ height: '40px', marginRight: '10px' }}
          />
          Расчет энергии сгорания
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to={ROUTES.HOME}>
              Домой
            </Nav.Link>
            <Nav.Link as={Link} to={ROUTES.FUELS}>
              Топливо
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};