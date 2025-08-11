import type { Route } from "./+types/rapports";
import { Outlet } from "react-router";
import RapportsLayout from "~/rapports/layout";

export function meta({}: Route.MetaArgs) {
    return [
        { title: "Rapports" },
        { name: "description", content: "Point of Sale System" },
    ];
}

export default function RapportsRoute() {
    return (
        <RapportsLayout>
           <Outlet />
        </RapportsLayout>
    );
}
