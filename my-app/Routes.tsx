export const ROUTES = {
  HOME: "/",
  FUELS: "/fuels",
  LOGIN: "/login",
  REGISTER: "/register",
  APPLICATIONS: "/applications",
  APPLICATION_DETAIL: "/applications/:id",
  PROFILE: "/profile",
};

export type RouteKeyType = keyof typeof ROUTES;

export const ROUTE_LABELS: {[key in RouteKeyType]: string} = {
  HOME: "Главная",
  FUELS: "Топливо",
  LOGIN: "Вход",
  REGISTER: "Регистрация", 
  APPLICATIONS: "Мои заявки",
  APPLICATION_DETAIL: "Заявка",
  PROFILE: "Личный кабинет",
};