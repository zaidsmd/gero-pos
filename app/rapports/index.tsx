
import { useSettingsStore } from "../../stores/settings-store";
import {Link} from "react-router";

const rapportsList = [
  { key: "stock", title: "Stock", description: "Etat de stock des articles", to: "/rapports/stock", emoji: <svg xmlns="http://www.w3.org/2000/svg" width="2em" height="2em" viewBox="0 0 24 24"><path fill="currentColor" d="M8.422 20.618C10.178 21.54 11.056 22 12 22V12L2.638 7.073l-.04.067C2 8.154 2 9.417 2 11.942v.117c0 2.524 0 3.787.597 4.801c.598 1.015 1.674 1.58 3.825 2.709z"/><path fill="currentColor" d="m17.577 4.432l-2-1.05C13.822 2.461 12.944 2 12 2c-.945 0-1.822.46-3.578 1.382l-2 1.05C4.318 5.536 3.242 6.1 2.638 7.072L12 12l9.362-4.927c-.606-.973-1.68-1.537-3.785-2.641" opacity="0.7"/><path fill="currentColor" d="m21.403 7.14l-.041-.067L12 12v10c.944 0 1.822-.46 3.578-1.382l2-1.05c2.151-1.129 3.227-1.693 3.825-2.708c.597-1.014.597-2.277.597-4.8v-.117c0-2.525 0-3.788-.597-4.802" opacity="0.5"/><path fill="currentColor" d="m6.323 4.484l.1-.052l1.493-.784l9.1 5.005l4.025-2.011q.205.232.362.498c.15.254.262.524.346.825L17.75 9.964V13a.75.75 0 0 1-1.5 0v-2.286l-3.5 1.75v9.44A3 3 0 0 1 12 22c-.248 0-.493-.032-.75-.096v-9.44l-8.998-4.5c.084-.3.196-.57.346-.824q.156-.266.362-.498l9.04 4.52l3.387-1.693z"/></svg> },
  { key: "saleByProductAndCLient", title: "Ventes par produit & client", description: "Ventes croisées", to: "/rapports/sale-by-product-client", emoji: <svg xmlns="http://www.w3.org/2000/svg" width="2em" height="2em" viewBox="0 0 24 24"><path fill="currentColor" d="M7 18a1 1 0 0 1-1-1v-4a1 1 0 0 1 2 0v4a1 1 0 0 1-1 1m5 0a1 1 0 0 1-1-1V7a1 1 0 0 1 2 0v10a1 1 0 0 1-1 1m5 0a1 1 0 0 1-1-1v-6a1 1 0 0 1 2 0v6a1 1 0 0 1-1 1"/><path fill="currentColor" d="M19 2H5a3 3 0 0 0-3 3v14a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3V5a3 3 0 0 0-3-3M8 17a1 1 0 0 1-2 0v-4a1 1 0 0 1 2 0Zm5 0a1 1 0 0 1-2 0V7a1 1 0 0 1 2 0Zm5 0a1 1 0 0 1-2 0v-6a1 1 0 0 1 2 0Z" opacity="0.5"/></svg> },
  { key: "productBySupplier", title: "Produits par fournisseur", description: "Achat par fournisseur", to: "/rapports/product-by-supplier", emoji: <svg xmlns="http://www.w3.org/2000/svg" width="2em" height="2em" viewBox="0 0 24 24"><path fill="currentColor" d="M4.728 16.137c-1.545-1.546-2.318-2.318-2.605-3.321c-.288-1.003-.042-2.068.45-4.197l.283-1.228c.413-1.792.62-2.688 1.233-3.302s1.51-.82 3.302-1.233l1.228-.284c2.13-.491 3.194-.737 4.197-.45c1.003.288 1.775 1.061 3.32 2.606l1.83 1.83C20.657 9.248 22 10.592 22 12.262c0 1.671-1.344 3.015-4.033 5.704c-2.69 2.69-4.034 4.034-5.705 4.034c-1.67 0-3.015-1.344-5.704-4.033z" opacity="0.5"/><path fill="currentColor" d="M10.124 7.271a2.017 2.017 0 1 1-2.853 2.852a2.017 2.017 0 0 1 2.853-2.852m8.927 4.78l-6.979 6.98a.75.75 0 1 1-1.06-1.06l6.979-6.98a.75.75 0 1 1 1.06 1.06"/></svg> },
  { key: "paymentsAndCredit", title: "Rapport des Paiements et Créances", description: "Suivi des créances", to: "/rapports/payments-and-credit", emoji: <svg xmlns="http://www.w3.org/2000/svg" width="2em" height="2em" viewBox="0 0 24 24"><path fill="currentColor" d="M10 20h4c3.771 0 5.657 0 6.828-1.172S22 15.771 22 12c0-.442-.002-1.608-.004-2H2c-.002.392 0 1.558 0 2c0 3.771 0 5.657 1.171 6.828S6.23 20 10 20" opacity="0.5"/><path fill="currentColor" d="M9.995 4h4.01c3.781 0 5.672 0 6.846 1.116c.846.803 1.083 1.96 1.149 3.884v1H2V9c.066-1.925.303-3.08 1.149-3.884C4.323 4 6.214 4 9.995 4M12.5 15.25a.75.75 0 0 0 0 1.5H14a.75.75 0 0 0 0-1.5zm-6.5 0a.75.75 0 0 0 0 1.5h4a.75.75 0 0 0 0-1.5z"/></svg> },
  { key: "treasury", title: "Trésorerie", description: "Synthèse des flux", to: "/rapports/treasury", emoji: <svg xmlns="http://www.w3.org/2000/svg" width="2em" height="2em" viewBox="0 0 24 24"><path fill="currentColor" d="M3.172 7.172c.843-.844 2.058-1.08 4.08-1.146l1.5-.024Q9.34 5.999 10 6h4q.662 0 1.248.002l1.5.024c2.022.066 3.237.302 4.08 1.146C22 8.343 22 10.229 22 14s0 5.657-1.172 6.828S17.771 22 14 22h-4c-3.771 0-5.657 0-6.828-1.172S2 17.771 2 14s0-5.657 1.172-6.828" opacity="0.5"/><path fill="currentColor" d="M12.75 10a.75.75 0 0 0-1.5 0v.01c-1.089.274-2 1.133-2 2.323c0 1.457 1.365 2.417 2.75 2.417c.824 0 1.25.533 1.25.917s-.426.916-1.25.916s-1.25-.532-1.25-.916a.75.75 0 0 0-1.5 0c0 1.19.911 2.048 2 2.323V18a.75.75 0 0 0 1.5 0v-.01c1.089-.274 2-1.133 2-2.323c0-1.457-1.365-2.417-2.75-2.417c-.824 0-1.25-.533-1.25-.917s.426-.916 1.25-.916s1.25.532 1.25.916a.75.75 0 0 0 1.5 0c0-1.19-.911-2.049-2-2.323zm-.698-8.75h-.104c-.898 0-1.648 0-2.242.08c-.628.084-1.195.27-1.65.725c-.456.456-.642 1.023-.726 1.65c-.057.427-.073 1.446-.078 2.32l1.5-.023c.005-.847.02-1.758.065-2.097c.062-.461.169-.659.3-.789s.327-.237.789-.3c.483-.064 1.13-.066 2.094-.066s1.612.002 2.095.067c.461.062.659.169.789.3s.238.327.3.788c.045.34.06 1.25.064 2.097l1.5.024c-.004-.875-.02-1.894-.078-2.32c-.084-.628-.27-1.195-.725-1.65c-.456-.456-1.023-.642-1.65-.726c-.595-.08-1.344-.08-2.243-.08"/></svg> },
  { key: "daily", title: "Journalier", description: "Rapport du jour", to: "/rapports/daily", emoji: <svg xmlns="http://www.w3.org/2000/svg" width="2em" height="2em" viewBox="0 0 24 24"><path fill="currentColor" d="M6.94 2c.416 0 .753.324.753.724v1.46c.668-.012 1.417-.012 2.26-.012h4.015c.842 0 1.591 0 2.259.013v-1.46c0-.4.337-.725.753-.725s.753.324.753.724V4.25c1.445.111 2.394.384 3.09 1.055c.698.67.982 1.582 1.097 2.972L22 9H2v-.724c.116-1.39.4-2.302 1.097-2.972s1.645-.944 3.09-1.055V2.724c0-.4.337-.724.753-.724"/><path fill="currentColor" d="M22 14v-2c0-.839-.004-2.335-.017-3H2.01c-.013.665-.01 2.161-.01 3v2c0 3.771 0 5.657 1.172 6.828S6.228 22 10 22h4c3.77 0 5.656 0 6.828-1.172S22 17.772 22 14" opacity="0.5"/><path fill="currentColor" d="M18 17a1 1 0 1 1-2 0a1 1 0 0 1 2 0m0-4a1 1 0 1 1-2 0a1 1 0 0 1 2 0m-5 4a1 1 0 1 1-2 0a1 1 0 0 1 2 0m0-4a1 1 0 1 1-2 0a1 1 0 0 1 2 0m-5 4a1 1 0 1 1-2 0a1 1 0 0 1 2 0m0-4a1 1 0 1 1-2 0a1 1 0 0 1 2 0"/></svg> },
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
            <div className="text-2xl text-primary" aria-hidden>{r.emoji}</div>
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
