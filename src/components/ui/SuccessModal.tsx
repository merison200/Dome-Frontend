import React from 'react';
import { Toaster } from 'react-hot-toast';

const SuccessModal: React.FC = () => {
  return (
    <Toaster
      position="top-center"
      reverseOrder={false}
      toastOptions={{
        style: {
          borderRadius: '8px',
          background: '#333',
          color: '#fff',
        },
      }}
    />
  );
};

export default SuccessModal;