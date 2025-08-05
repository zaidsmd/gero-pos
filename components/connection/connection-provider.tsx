import React from 'react';
import { ConnectionToast } from './connection-toast';

interface ConnectionProviderProps {
  children: React.ReactNode;
}

export const ConnectionProvider: React.FC<ConnectionProviderProps> = ({ children }) => {
  return (
    <>
      {children}
      <ConnectionToast />
    </>
  );
};