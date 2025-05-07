'use client';

import { useState } from 'react';

type SaveButtonProps = {
  onClick: () => void;
};

export default function SaveButton({ onClick }: SaveButtonProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="bg-amber-600 hover:bg-amber-700 text-white font-medium py-2 px-6 rounded-md 
                transition-all duration-200 focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 focus:outline-none
                shadow-md hover:shadow-lg transform hover:-translate-y-0.5 active:translate-y-0 
                flex items-center justify-center space-x-2 w-full sm:w-auto"
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className={`h-5 w-5 transition-transform duration-200 ${isHovered ? 'rotate-6' : ''}`} 
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
      <span>Save Changes</span>
    </button>
  );
}
