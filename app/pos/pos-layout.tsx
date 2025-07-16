import React from 'react';

interface POSLayoutProps {
  children: React.ReactNode;
}

export function POSLayout({ children }: POSLayoutProps) {
  return (
    <div className="pos-layout w-screen h-screen bg-[#f5f7f8] overflow-hidden">
      {/* This div ensures full viewport width and height for the POS page */}
      {children}
    </div>
  );
}