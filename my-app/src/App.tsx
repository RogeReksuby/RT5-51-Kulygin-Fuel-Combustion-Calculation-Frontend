import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
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
import Error403Page from "./pages/Error403Page";
import Error404Page from "./pages/Error404Page";
import ModeratorServicesPage from "./pages/ModeratorServicesPage";
import { useSelector } from 'react-redux';
import type { RootState } from './store';

const ModeratorRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.user);
  
  console.log('🔐 Проверка прав модератора:', {
    isAuthenticated,
    isModerator: user?.is_moderator,
    user
  });
  
  // Если не авторизован - на логин
  if (!isAuthenticated) {
    console.log('🚫 Не авторизован, редирект на логин');
    return <Navigate to={ROUTES.LOGIN} replace />;
  }
  
  // Если авторизован, но не модератор - на 403
  if (!user?.is_moderator) {
    console.log('🚫 Не модератор, редирект на 403');
    return <Navigate to={ROUTES.ERROR_403} replace />;
  }
  
  console.log('✅ Модератор, показываем страницу');
  return <>{children}</>;
};

function App() {
  return (
    <BrowserRouter basename={BASE_PATH}>
      <AppInitializer />
      <Routes>
        <Route path={ROUTES.HOME} element={<HomePage />} />
        <Route path={ROUTES.FUELS} element={<FuelsPage />} />
        <Route path={`${ROUTES.FUELS}/:id`} element={<FuelDetailPage />} />
        <Route path={ROUTES.LOGIN} element={<LoginPage />} />
        <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
        <Route path={ROUTES.APPLICATION_DETAIL} element={<FuelCombustionPage />} />
        <Route path={ROUTES.APPLICATIONS} element={<FuelCombustionsList />} />
        <Route path={ROUTES.PROFILE} element={<ProfilePage />} />
        
        <Route 
          path={ROUTES.MODERATOR_SERVICES} 
          element={
            <ModeratorRoute>
              <ModeratorServicesPage />
            </ModeratorRoute>
          } 
        />
        
        <Route path={ROUTES.ERROR_403} element={<Error403Page />} />
        <Route path={ROUTES.ERROR_404} element={<Error404Page />} />
        
        <Route path="*" element={<Error404Page />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;