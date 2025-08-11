
import { useSettingsStore } from "../../stores/settings-store";
import {Link} from "react-router";

const rapportsList = [
  { key: "stock", title: "Stock", description: "Etat de stock des articles", to: "/rapports/stock", emoji: "📦" },
  { key: "saleByProductAndCLient", title: "Ventes par produit & client", description: "Ventes croisées", to: "/rapports/sale-by-product-client", emoji: "📊" },
  { key: "productBySupplier", title: "Produits par fournisseur", description: "Achat par fournisseur", to: "/rapports/product-by-supplier", emoji: "🏷️" },
  { key: "paymentsAndCredit", title: "Paiements & Crédits", description: "Suivi des créances", to: "/rapports/payments-and-credit", emoji: "💳" },
  { key: "treasury", title: "Trésorerie", description: "Synthèse des flux", to: "/rapports/treasury", emoji: "💰" },
  { key: "daily", title: "Journalier", description: "Rapport du jour", to: "/rapports/daily", emoji: "🗓️" },
] as const;

const Rapports = () => {
  const rapports = useSettingsStore((s) => s.rapports);
  const visible = rapportsList.filter((r) => (rapports as any)[r.key] !== false);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {visible.map((r) => (
        <Link
          key={r.key}
          to={r.to}
          className="block rounded-lg border border-gray-200 hover:border-gray-300 bg-white p-4 shadow-sm hover:shadow transition animate-scaleIn"
        >
          <div className="flex items-start gap-3">
            <div className="text-2xl" aria-hidden>{r.emoji}</div>
            <div>
              <h2 className="font-medium text-gray-900">{r.title}</h2>
              <p className="text-sm text-gray-500 mt-1">{r.description}</p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default Rapports;
