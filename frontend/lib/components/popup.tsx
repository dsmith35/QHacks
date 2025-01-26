import React from 'react';

interface PopupProps {
  isVisible: boolean;
  onClose: () => void;
  onReport: () => void;
}

const Popup: React.FC<PopupProps> = ({ isVisible, onClose, onReport }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-4 rounded-lg shadow-lg">
        <h2 className="text-lg font-bold mb-4">Menu</h2>
        <button
          onClick={onReport}
          className="block w-full text-left py-2 px-4 rounded hover:bg-gray-100"
        >
          Report
        </button>
        <button
          onClick={onClose}
          className="block w-full text-left py-2 px-4 rounded hover:bg-gray-100 mt-2"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default Popup;
