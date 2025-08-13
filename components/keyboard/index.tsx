import {keys} from "./keys";
import Button from "./button";
import useProductSearch from "../product-search/useProductSearch";

const Keyboard = () => {
    const { setSearchTerm }=useProductSearch()
    return (
        <div className="grid grid-cols-3 gap-2 ">
            {keys().map((key, index) => (
                <Button key={index} value={key.value} onclick={key.onclick} className={key.className}/>
            ))}
        </div>
    );
};

export default Keyboard;