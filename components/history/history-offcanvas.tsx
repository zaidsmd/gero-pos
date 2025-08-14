import React, { useEffect } from 'react';
import HistoryPanel from './history-panel';
import { useAuth } from '../auth/auth-provider';

interface HistoryOffcanvasProps {
  isOpen: boolean;
  onClose: () => void;
  sessionId?: string | number;
}

const HistoryOffcanvas: React.FC<HistoryOffcanvasProps> = ({ isOpen, onClose, sessionId }) => {
  const { sessionId: authSessionId } = useAuth();
  const effectiveSessionId = sessionId ?? authSessionId ?? undefined;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-stretch justify-end">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative h-full w-full sm:w-[520px] bg-white shadow-xl">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-[#3b5461]">Historique</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Fermer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><path fill="currentColor" d="M18.3 5.71a1 1 0 0 0-1.41 0L12 10.59L7.11 5.7A1 1 0 0 0 5.7 7.11L10.59 12l-4.9 4.89a1 1 0 1 0 1.41 1.42L12 13.41l4.89 4.9a1 1 0 0 0 1.42-1.41L13.41 12l4.9-4.89a1 1 0 0 0-.01-1.4"/></svg>
          </button>
        </div>
        <div className="p-4 h-[calc(100%-56px)] overflow-hidden">
          <HistoryPanel sessionId={effectiveSessionId} />
        </div>
      </div>
    </div>
  );
};

export default HistoryOffcanvas;
