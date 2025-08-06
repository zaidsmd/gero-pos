import React, { useState } from 'react';
import DepenseModal from './depense-modal';

interface DepenseButtonProps {
  className?: string;
}

const DepenseButton: React.FC<DepenseButtonProps> = ({ className = '' }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const handleSuccess = () => {
    // You can add additional logic here if needed
    console.log('Depense created successfully');
  };

  return (
    <>
      <button
        onClick={openModal}
        className={`px-4 py-2 bg-pink-300 text-white rounded-md hover:bg-pink-400 focus:outline-none focus:ring-2 focus:ring-primary ${className}`}
      >
        Nouvelle Dépense
      </button>
      
      <DepenseModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSuccess={handleSuccess}
      />
    </>
  );
};

export default DepenseButton;