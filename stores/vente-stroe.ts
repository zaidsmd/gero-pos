import {create} from "zustand";

interface VenteLigne {
    produit_id:number,
    quantite:number,
    prix_unitaire:number,
    reduction:number,
    reduction_type:"pourcentage" | "fixe",
    total:number,
    tva:number,
}

interface VentePaiement {
    montant:number,
    methode:string,
    compte:number,
    date_prevu:string|null,
    check_reference:string|null,
}

interface VenteStore {
    client_id:number|null,
    lignes:VenteLigne[],
    paiement:VentePaiement|null,
    isLoading:boolean,
    isError:boolean,
    error:string|null,
    setClient: (client_id:number) => void,
    setLignes: (lignes:VenteLigne[]) => void,
    setPaiement: (paiement:VentePaiement) => void,
    setIsLoading: (isLoading:boolean) => void,
    setIsError: (isError:boolean) => void,
    setError: (error:string|null) => void,
}

export const UseVenteStore = create<VenteStore>((set)=>({
    client_id:null,
    lignes:[],
    paiement:null,
    isLoading:false,
    isError:false,
    error:null,

    setClient: (client_id) => set({client_id}),
    setLignes: (lignes) => set({lignes}),
    setPaiement: (paiement) => set({paiement}),
    setIsLoading: (isLoading) => set({isLoading}),
    setIsError: (isError) => set({isError}),
    setError: (error) => set({error}),
}))