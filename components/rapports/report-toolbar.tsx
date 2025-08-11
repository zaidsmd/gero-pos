import React from "react";

interface ReportToolbarProps {
  title: string;
  onRefresh: () => void;
  onPrint: () => void;
  isLoading?: boolean;
  canPrint?: boolean;
  refreshLabel?: string;
  printLabel?: string;
  className?: string;
}

export default function ReportToolbar({
  title,
  onRefresh,
  onPrint,
  isLoading = false,
  canPrint = true,
  refreshLabel = "Actualiser",
  printLabel = "Imprimer",
  className = "",
}: ReportToolbarProps) {
  return (
    <div className={`flex items-center justify-between gap-3 mb-2 ${className}`}>
      <h2 className="text-lg font-medium m-0">{title}</h2>
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="px-4 py-2 bg-gray-200 text-sm text-[#3b5461] rounded-md hover:bg-gray-300 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          onClick={onRefresh}
          disabled={isLoading}
          aria-label={refreshLabel}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="inline-block mr-2 align-[-0.2em]" width="20" height="20" viewBox="0 0 24 24" aria-hidden>
            <path fill="currentColor" fillRule="evenodd" d="M9.53 2.47a.75.75 0 0 0-1.06 1.06l.72.72H9a7.75 7.75 0 1 0 0 15.5h.5a.75.75 0 0 0 0-1.5H9a6.25 6.25 0 0 1 0-12.5h2a.75.75 0 0 0 .53-1.28z" clipRule="evenodd"/>
            <path fill="currentColor" d="M14.5 4.25a.75.75 0 0 0 0 1.5h.5a6.25 6.25 0 1 1 0 12.5h-2a.75.75 0 0 0-.53 1.28l2 2a.75.75 0 0 0 1.06-1.06l-.72-.72H15a7.75 7.75 0 0 0 0-15.5z" opacity="0.5"/>
          </svg>
          {refreshLabel}
        </button>
        <button
          type="button"
          className="px-4 py-2 bg-gray-200 text-sm text-[#3b5461] rounded-md hover:bg-gray-300 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          onClick={onPrint}
          disabled={isLoading || !canPrint}
          aria-label={printLabel}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="inline-block mr-2 align-[-0.2em]" width="18" height="18" viewBox="0 0 24 24" aria-hidden>
            <path fill="currentColor" d="M17.121 2.879C16.242 2 14.828 2 12 2s-4.243 0-5.122.879c-.492.492-.708 1.153-.804 2.136C6.634 5 7.252 5 7.93 5h8.142c.677 0 1.295 0 1.854.015c-.095-.983-.312-1.644-.804-2.136"></path>
            <path fill="currentColor" fillRule="evenodd" d="M18 14.5c0 2.828 0 5.743-.879 6.621C16.243 22 14.828 22 12 22s-4.243 0-5.121-.879C6 20.243 6 17.328 6 14.5zm-2.25 2.25a.75.75 0 0 1-.75.75H9A.75.75 0 0 1 9 16h6a.75.75 0 0 1 .75.75m-2 3a.75.75 0 0 1-.75.75H9A.75.75 0 0 1 9 19h4a.75.75 0 0 1 .75.75" clipRule="evenodd"></path>
            <path fill="currentColor" d="M15 17.5a.75.75 0 0 0 0-1.5H9a.75.75 0 0 0 0 1.5zm-2 3a.75.75 0 0 0 0-1.5H9a.75.75 0 0 0 0 1.5z" opacity="0.5"></path>
            <path fill="currentColor" d="M16 6H8c-2.828 0-4.243 0-5.121.879C2 7.757 2 9.172 2 12s0 4.243.879 5.121c.494.495 1.158.711 2.149.806C5 17.204 5 15.352 5 14.5a.5.5 0 0 1 0-1h14a.5.5 0 0 1 0 1c0 .852 0 2.704-.028 3.427c.99-.095 1.655-.311 2.15-.806C22 16.243 22 14.828 22 12s0-4.243-.879-5.121C20.243 6 18.828 6 16 6" opacity="0.5"></path>
            <path fill="currentColor" d="M9 10.75a.75.75 0 0 0 0-1.5H6a.75.75 0 0 0 0 1.5zm9-.75a1 1 0 1 1-2 0a1 1 0 0 1 2 0"></path>
          </svg>
          {printLabel}
        </button>
      </div>
    </div>
  );
}
