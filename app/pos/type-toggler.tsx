import {usePOSStore} from "~/pos/pos-store";

const TypeToggler = () => {
    const {orderType, toggleOrderType} = usePOSStore();
    return (
        <div className="flex flex-col items-center justify-center w-full">
            <div className="relative w-full h-12 bg-gray-200 rounded-2xl flex items-center  shadow-inner ">
                    <div
                        className={`absolute top-1 h-10 w-1/2 rounded-xl transition-all duration-700 ease-[cubic-bezier(0.77,0,0.175,1)] ${
                            orderType === 'retour'
                                ? 'left-[calc(50%-0.25rem)] bg-red-500'
                                : 'left-1 bg-green-500'
                        }`}
                    ></div>

                <button
                    onClick={() => orderType !== 'vente' && toggleOrderType()}
                    className={`z-10 w-1/2 text-center text-sm font-bold transition-colors ${
                        orderType === 'vente' ? 'text-white' : 'text-gray-700'
                    }`}
                >
                    Vente
                </button>
                <button
                    onClick={() => orderType !== 'retour' && toggleOrderType()}
                    className={`z-10 w-1/2 text-center text-sm font-bold transition-colors ${
                        orderType === 'retour' ? 'text-white' : 'text-gray-700'
                    }`}
                >
                    Retour
                </button>


            </div>
        </div>



    );
};

export default TypeToggler;