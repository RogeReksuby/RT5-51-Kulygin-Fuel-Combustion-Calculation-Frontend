export const ROUTES = {
  HOME: "/",
  FUELS: "/fuels",
};

export type RouteKeyType = keyof typeof ROUTES;

export const ROUTE_LABELS: {[key in RouteKeyType]: string} = {
  HOME: "Главная",
  FUELS: "Топливо",
};