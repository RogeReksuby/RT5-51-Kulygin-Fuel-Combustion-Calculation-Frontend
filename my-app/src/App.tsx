import { BrowserRouter, Route, Routes } from "react-router-dom";
import { HomePage } from "./pages/HomePage";
import FuelsPage from "./pages/FuelsPage";
import { FuelDetailPage } from "./pages/FuelDetailPage";
import { ROUTES } from "../Routes";
import { BASE_PATH } from "./target_config";
import "./App.css";

function App() {
  return (
    <BrowserRouter basename={BASE_PATH}>
      <Routes>
        <Route path={ROUTES.HOME} element={<HomePage />} />
        <Route path={ROUTES.FUELS} element={<FuelsPage />} />
        <Route path={`${ROUTES.FUELS}/:id`} element={<FuelDetailPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;