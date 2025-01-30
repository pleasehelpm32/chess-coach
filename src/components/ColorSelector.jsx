// src/components/ColorSelector.jsx
import React, { useState, useEffect } from 'react';

function ColorSelector({ onColorSelect, disabled }) {
  const [selectedColor, setSelectedColor] = useState('white');

  // Set white as default on component mount
  useEffect(() => {
    onColorSelect('white');
  }, []);

  const handleColorSelect = (color) => {
    setSelectedColor(color);
    onColorSelect(color);
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm text-center">
      <div className="flex justify-center gap-2">
        <button
          onClick={() => handleColorSelect('white')}
          disabled={disabled}
          className={`flex items-center px-3 py-2 rounded border ${
            selectedColor === 'white' 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-300 hover:border-blue-500'
          } transition-colors ${
            disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'
          }`}
        >
          <div className="w-6 h-6 rounded-full bg-white border border-gray-300" />
          <span className="ml-2 text-sm">White</span>
        </button>
        
        <button
          onClick={() => handleColorSelect('black')}
          disabled={disabled}
          className={`flex items-center px-3 py-2 rounded border ${
            selectedColor === 'black' 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-300 hover:border-blue-500'
          } transition-colors ${
            disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'
          }`}
        >
          <div className="w-6 h-6 rounded-full bg-gray-800 border border-gray-300" />
          <span className="ml-2 text-sm">Black</span>
        </button>
      </div>
    </div>
  );
}

export default ColorSelector;