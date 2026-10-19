import { index, route, type RouteConfig } from "@react-router/dev/routes";
export default [
  index("routes/home.tsx"),
  route("zene", "routes/music.tsx"),
  route("koncertek", "routes/shows.tsx"),
  route("epk", "routes/epk.tsx"),
  route("shop", "routes/shop.tsx"),
  route("adatvedelem", "routes/privacy.tsx"),
  route("*", "routes/not-found.tsx"),
] satisfies RouteConfig;
