import {type RouteConfig, index, route} from "@react-router/dev/routes";

export default [
    index("routes/home.tsx"),
    route("auth/inject", "routes/auth/inject.tsx"),
    route("pos", "routes/pos.tsx"),
    route("demandes", "routes/demandes.tsx"),
    route("rapports", "routes/rapports.tsx", [
        index("rapports/index.tsx"),
        route("stock", "rapports/stock.tsx"),
        route("sale-by-product-client", "rapports/sale-by-product-client.tsx"),
        route("product-by-supplier", "rapports/product-by-supplier.tsx"),
        route("payments-and-credit", "rapports/payments-and-credit.tsx"),
        route("treasury", "rapports/treasury.tsx"),
        route("daily", "rapports/daily.tsx"),
    ])
] satisfies RouteConfig;
