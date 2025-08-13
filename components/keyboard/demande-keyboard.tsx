import { demandeKeys as keys } from "./keys-demande";
import Button from "./button";

const DemandeKeyboard = () => {
  return (
    <div className="grid grid-cols-3 gap-2 ">
      {keys().map((key, index) => (
        <Button key={index} value={key.value} onclick={key.onclick} className={key.className} />
      ))}
    </div>
  );
};

export default DemandeKeyboard;
