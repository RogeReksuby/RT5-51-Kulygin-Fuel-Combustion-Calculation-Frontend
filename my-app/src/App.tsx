import { BrowserRouter, Route, Routes } from "react-router-dom";
import { HomePage } from "./pages/HomePage";
import FuelsPage from "./pages/FuelsPage";
import { FuelDetailPage } from "./pages/FuelDetailPage";
import { ROUTES } from "../Routes";
import "./App.css";

const REPO_NAME = "web_rip_front"; 

function App() {
  return (
    <BrowserRouter basename={`/${REPO_NAME}`}>
      <Routes>
        <Route path={ROUTES.HOME} element={<HomePage />} />
        <Route path={ROUTES.FUELS} element={<FuelsPage />} />
        <Route path={`${ROUTES.FUELS}/:id`} element={<FuelDetailPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;


