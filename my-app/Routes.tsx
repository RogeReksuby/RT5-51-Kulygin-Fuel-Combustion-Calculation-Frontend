export const ROUTES = {
  HOME: "/",
  FUELS: "/fuels",
  LOGIN: "/login",
  REGISTER: "/register",
  APPLICATIONS: "/combustions",
  APPLICATION_DETAIL: "/combustions/:id",
  PROFILE: "/profile",
  // Добавляем новые роуты для модератора
  MODERATOR_SERVICES: "/moderator/services",  // Управление услугами (топливом)
  // Статические страницы ошибок
  ERROR_403: "/403",
  ERROR_404: "/404",
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
  // Новые заголовки
  MODERATOR_SERVICES: "Управление услугами",
  ERROR_403: "Доступ запрещен",
  ERROR_404: "Страница не найдена",
};