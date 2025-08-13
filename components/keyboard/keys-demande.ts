import useDemandeProductSearch from "../demandes/useDemandeProductSearch";
import React, { type ReactNode } from "react";

interface Key {
  value: string | ReactNode;
  onclick?: (e: React.MouseEvent<HTMLDivElement>, value: string | ReactNode) => void;
  className?: string;
}

export const demandeKeys: () => Key[] = () => {
  const { setSearchTerm } = useDemandeProductSearch();
  // Numpad layout order: 7,8,9,4,5,6,1,2,3,0 plus P, SP, G
  const values = [7, 8, 9, 4, 5, 6, 1, 2, 3, 0, "P", "SP", "G"];

  const clearIcon: ReactNode = React.createElement(
    "svg",
    { xmlns: "http://www.w3.org/2000/svg", width: "2em", height: "2em", viewBox: "0 0 24 24" },
    React.createElement("path", {
      fill: "white",
      d: "m12 13.4l-4.9 4.9q-.275.275-.7.275t-.7-.275t-.275-.7t.275-.7l4.9-4.9l-4.9-4.9q-.275-.275-.275-.7t.275-.7t.7-.275t.7.275l4.9 4.9l4.9-4.9q.275-.275.7-.275t.7.275t.275.7t-.275.7L13.4 12l4.9 4.9q.275.275.275.7t-.275.7t-.7.275t-.7-.275z",
    })
  );

  const validateIcon: ReactNode = React.createElement(
    "svg",
    { xmlns: "http://www.w3.org/2000/svg", width: "2em", height: "2em", viewBox: "0 0 24 24" },
    React.createElement("path", {
      fill: "white",
      d: "M20.664 5.253a1 1 0 0 1 .083 1.411l-10.666 12a1 1 0 0 1-1.495 0l-5.333-6a1 1 0 0 1 1.494-1.328l4.586 5.159l9.92-11.16a1 1 0 0 1 1.411-.082",
    })
  );

  let keys: Key[] = values.map((v) => ({
    value: v.toString(),
    onclick: (e: React.MouseEvent<HTMLDivElement>, value: string | ReactNode) =>
      setSearchTerm((prev) => prev + value, false),
  }));

  keys = [
    ...keys.slice(0, 9),
    {
      value: clearIcon,
      onclick: () => setSearchTerm("", false),
      className: "bg-red-500 hover:bg-red-600 text-white fill-white",
    },
    ...keys.slice(9, 10),
    {
      value: validateIcon,
      onclick: () => setSearchTerm((prev) => prev),
      className: "bg-green-500 hover:bg-green-600 text-white fill-white",
    },
    ...keys.slice(10),
  ];

  return keys;
};
