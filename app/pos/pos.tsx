import React, { useState } from "react";
import Articles from "../../components/articles/articles";
import CartLayout from "../../components/cart/cart-layout";
import TypeToggler from "~/pos/type-toggler";
import { DepenseButton } from "../../components/depense";
import { HistoryOffcanvas } from "../../components/history";
import {Link} from "react-router";

export function POS() {
  const [isHistoryOpen, setHistoryOpen] = useState(false);

  return (
    <div className="h-full w-full p-4 flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-[#3b5461]">Point of Sale</h1>
        </div>
        <div className="flex space-x-3">
          <Link to="/rapports" className="px-4 py-2 rounded-md text-white bg-indigo-500 hover:bg-indigo-600" >
            <svg xmlns="http://www.w3.org/2000/svg" className="inline-block mr-2" width="1em" height="1em" viewBox="0 0 24 24"><path fill="currentColor" fillRule="evenodd" d="M14 20.5V4.25c0-.728-.002-1.2-.048-1.546c-.044-.325-.115-.427-.172-.484s-.159-.128-.484-.172C12.949 2.002 12.478 2 11.75 2s-1.2.002-1.546.048c-.325.044-.427.115-.484.172s-.128.159-.172.484c-.046.347-.048.818-.048 1.546V20.5z" clipRule="evenodd"/><path fill="currentColor" d="M8 8.75A.75.75 0 0 0 7.25 8h-3a.75.75 0 0 0-.75.75V20.5H8zm12 5a.75.75 0 0 0-.75-.75h-3a.75.75 0 0 0-.75.75v6.75H20z" opacity="0.7"/><path fill="currentColor" d="M1.75 20.5a.75.75 0 0 0 0 1.5h20a.75.75 0 0 0 0-1.5z" opacity="0.5"/></svg>
            <span>Rapports</span>
          </Link>
          <Link to="/demandes" className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors">
            <svg className="inline-block mr-2" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M9.5 20v2a.75.75 0 0 0 1.5 0v-2zm5.5 0h-1.5v2a.75.75 0 0 0 1.5 0z"/><path fill="currentColor" fillRule="evenodd" d="m17.385 6.585l.256-.052a2.2 2.2 0 0 1 1.24.115c.69.277 1.446.328 2.165.148l.061-.015c.524-.131.893-.618.893-1.178v-2.13c0-.738-.664-1.282-1.355-1.109c-.396.1-.812.071-1.193-.081l-.073-.03a3.5 3.5 0 0 0-2-.185l-.449.09c-.54.108-.93.6-.93 1.17v6.953c0 .397.31.719.692.719a.706.706 0 0 0 .693-.72z" clipRule="evenodd"/><path fill="currentColor" d="M14.5 6v4.28c0 1.172.928 2.22 2.192 2.22s2.193-1.048 2.193-2.22V8.229c.76.205 1.56.23 2.335.067c.492.842.78 1.86.78 2.955v6.175C22 18.847 21.012 20 19.793 20H12.5v-8.75c0-2.03-.832-3.974-2.217-5.25z"/><path fill="currentColor" fillRule="evenodd" d="M2 11.25C2 8.35 4.015 6 6.5 6S11 8.35 11 11.25V20H4.233C3 20 2 18.834 2 17.395zM4.25 16a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 0 1.5H5a.75.75 0 0 1-.75-.75" clipRule="evenodd"/></svg>
            Demandes
          </Link>
          <DepenseButton />
          <button
            onClick={() => setHistoryOpen(true)}
            className="px-4 py-2 bg-gray-200 text-[#3b5461] rounded-md hover:bg-gray-300 transition-colors"
          >
            <svg className="inline-block mr-2" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M11 7a1 1 0 0 1 1-1h5.5a1 1 0 1 1 0 2H12a1 1 0 0 1-1-1m0 10a1 1 0 0 1 1-1h5.5a1 1 0 1 1 0 2H12a1 1 0 0 1-1-1m1-5a1 1 0 0 0 0 2h9.5a1 1 0 1 0 0-2z"/><path fill="currentColor" d="M2 7a2 2 0 0 1 2-2h3.5a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2z"/></svg>
            Historique
          </button>
          <Link to="/" className="px-4 py-2 bg-[#3b5461] text-white rounded-md hover:bg-[#2a3e48] transition-colors">
            Back
          </Link>
        </div>
      </div>
      <div className="flex-1 flex flex-col md:flex-row gap-6 overflow-hidden pb-3">
        <div className="w-full md:w-2/3 bg-white rounded-lg shadow-sm flex">
          <CartLayout/>
        </div>

        <div className="w-full md:w-1/3 overflow-hidden flex flex-col   gap-4 ">
          <div className="bg-white rounded-lg shadow-sm p-4 w-full flex-none max-h-fit ">
            <TypeToggler/>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 w-full flex-grow  flex flex-col overflow-hidden">
            <Articles/>
          </div>
        </div>

      </div>

      <HistoryOffcanvas isOpen={isHistoryOpen} onClose={() => setHistoryOpen(false)} />
    </div>
  );
}
