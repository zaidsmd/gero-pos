import {Link, useMatch} from "react-router";
import React from "react";

export default function RapportsLayout({children}:{children:React.ReactNode}) {
    const  returnLink  =  useMatch('/rapports') ? '/pos' : '/rapports';
  return (
    <div className="p-4 md:p-6">
      <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3" >
              <Link to={returnLink} className=" text-primary">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="m4 12l6-6m-6 6l6 6m-6-6h10.5m5.5 0h-2.5"/></svg>
              </Link>
              <h1 className="text-2xl font-semibold text-[#3b5461]">Rapports</h1>
          </div>
      </div>
        {children}
    </div>
  );
}
