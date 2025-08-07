import {type RouteConfig, index, route} from "@react-router/dev/routes";

export default [
    index("routes/home.tsx"),
    route("pos", "routes/pos.tsx"),
    route("demandes", "routes/demandes.tsx")
] satisfies RouteConfig;
