import type { Route } from "./+types/pos";
import { POS } from "~/pos/pos";
import { POSLayout } from "~/pos/pos-layout";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "POS System" },
    { name: "description", content: "Point of Sale System" },
  ];
}

export default function POSRoute() {
  return (
    <POSLayout>
      <POS />
    </POSLayout>
  );
}
