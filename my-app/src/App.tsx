import { BrowserRouter, Route, Routes } from "react-router-dom";
import { HomePage } from "./pages/HomePage";
import FuelsPage from "./pages/FuelsPage";
import { FuelDetailPage } from "./pages/FuelDetailPage";
import LoginPage from "./pages/LoginPage";
import { ROUTES } from "../Routes";
import { BASE_PATH } from "./target_config";
import AppInitializer from "./components/AppInitializer";
import FuelCombustionPage from "./pages/FuelCombustionPage";
import FuelCombustionsList from "./pages/FuelCombustionsList";
import "./App.css";
import ProfilePage from "./pages/ProfilePge";
import RegisterPage from "./pages/RegisterPage";
import { useDispatch } from "react-redux";
import { useEffect } from "react";
import type { AppDispatch } from "./store";
import { resetFirstLoad } from "./store/slices/userSlice";



function App() {
    const dispatch = useDispatch<AppDispatch>();
  
  useEffect(() => {
    // При загрузке приложения проверяем авторизацию
    resetFirstLoad();
  }, []);
  return (
    <BrowserRouter basename={BASE_PATH}>
      <AppInitializer />
      <Routes>
        <Route path={ROUTES.HOME} element={<HomePage />} />
        <Route path={ROUTES.FUELS} element={<FuelsPage />} />
        <Route path={`${ROUTES.FUELS}/:id`} element={<FuelDetailPage />} />
        <Route path={ROUTES.LOGIN} element={<LoginPage />} />
        <Route path={ROUTES.APPLICATION_DETAIL} element={<FuelCombustionPage />} />
        <Route path={ROUTES.APPLICATIONS} element={<FuelCombustionsList />} />
        <Route path={ROUTES.PROFILE} element={<ProfilePage />} />
        <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;