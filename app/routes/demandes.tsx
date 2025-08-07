import type { Route } from "./+types/demandes";
import {POSLayout} from "~/pos/pos-layout";
import Demandes from "~/demandes";


export function meta({}: Route.MetaArgs) {
    return [
        { title: "Demandes" },
        { name: "description", content: "Demandes" },
    ];
}

export default function DemandesRoute() {
    return (
       <POSLayout>
          <Demandes/>
       </POSLayout>
    );
}
