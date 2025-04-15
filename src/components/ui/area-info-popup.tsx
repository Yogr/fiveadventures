'use client';

import { useRef, useEffect } from 'react';
import type { Area } from '@/lib/types';

interface AreaInfoPopupProps {
  area: Area;
  isOpen: boolean;
  onClose: () => void;
  position: { x: number; y: number };
}

export default function AreaInfoPopup({ 
  area, 
  isOpen, 
  onClose, 
  position
}: AreaInfoPopupProps) {
  const popupRef = useRef<HTMLDivElement>(null);
  
  // Close popup when Escape key is pressed
  useEffect(() => {
    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleEscapeKey);
    return () => window.removeEventListener('keydown', handleEscapeKey);
  }, [isOpen, onClose]);
  
  // Close popup when clicking outside
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };
  
  if (!isOpen) return null;
  
  // Calculate position for popup
  const getPopupStyle = () => {
    // Get window dimensions
    const windowWidth = typeof window !== 'undefined' ? window.innerWidth : 900;
    
    // Calculate the horizontal center position
    const left = `${windowWidth / 2}px`;
    
    // Position the popup above the click point
    const top = `${position.y}px`;
    
    return {
      position: 'fixed' as const,
      top,
      left,
      transform: 'translate(-50%, -100%)', // Center horizontally and position above
      zIndex: 100,
    };
  };
  
  return (
    <div 
      className="fixed inset-0 z-50"
      onClick={handleBackdropClick}
    >
      <div 
        ref={popupRef}
        style={getPopupStyle()}
        className="relative bg-gray-900 border-2 border-amber-600 rounded-md shadow-lg w-72 animate-fadeIn"
      >
        {/* Area Name Header */}
        <div className="px-4 py-2 border-b border-amber-700 text-amber-300 font-semibold pr-8">
          {area.name}
        </div>
        
        {/* Area Details */}
        <div className="p-3 text-sm">
          {/* Level Requirement */}
          <div className="text-amber-400 mb-2">
            Required Level: {area.level_requirement}
          </div>
          
          {/* Description */}
          <div className="text-amber-200">
            {area.description}
          </div>
        </div>
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-1 right-1 text-amber-400 hover:text-white"
          aria-label="Close"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
