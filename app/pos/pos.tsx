import Articles from "../../components/articles/articles";
import CartLayout from "../../components/cart/cart-layout";
import TypeToggler from "~/pos/type-toggler";
import { DepenseButton } from "../../components/depense";


export function POS() {


  return (
    <div className="h-full w-full p-4 flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-[#3b5461]">Point of Sale</h1>
        </div>
        <div className="flex space-x-3">
          <a href="/demandes" className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors">
            <svg className="inline-block mr-2" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M9.5 20v2a.75.75 0 0 0 1.5 0v-2zm5.5 0h-1.5v2a.75.75 0 0 0 1.5 0z"/><path fill="currentColor" fillRule="evenodd" d="m17.385 6.585l.256-.052a2.2 2.2 0 0 1 1.24.115c.69.277 1.446.328 2.165.148l.061-.015c.524-.131.893-.618.893-1.178v-2.13c0-.738-.664-1.282-1.355-1.109c-.396.1-.812.071-1.193-.081l-.073-.03a3.5 3.5 0 0 0-2-.185l-.449.09c-.54.108-.93.6-.93 1.17v6.953c0 .397.31.719.692.719a.706.706 0 0 0 .693-.72z" clipRule="evenodd"/><path fill="currentColor" d="M14.5 6v4.28c0 1.172.928 2.22 2.192 2.22s2.193-1.048 2.193-2.22V8.229c.76.205 1.56.23 2.335.067c.492.842.78 1.86.78 2.955v6.175C22 18.847 21.012 20 19.793 20H12.5v-8.75c0-2.03-.832-3.974-2.217-5.25z"/><path fill="currentColor" fillRule="evenodd" d="M2 11.25C2 8.35 4.015 6 6.5 6S11 8.35 11 11.25V20H4.233C3 20 2 18.834 2 17.395zM4.25 16a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 0 1.5H5a.75.75 0 0 1-.75-.75" clipRule="evenodd"/></svg>
            Demandes
          </a>
          <DepenseButton />
          <a href="/" className="px-4 py-2 bg-[#3b5461] text-white rounded-md hover:bg-[#2a3e48] transition-colors">
            Back
          </a>
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
    </div>
  );
}
