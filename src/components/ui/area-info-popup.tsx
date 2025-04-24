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
    // Position the popup based on clicked position, but ensure it's visible
    // We use position.y from the click but adjust it to be above the clicked area
    
    // Make sure popup doesn't go too high (at least 60px from top)
    // and position it above the clicked area by 120px
    const minTop = 60; 
    const topPos = Math.max(minTop, position.y - 120);
    
    return {
      position: 'fixed' as const,
      top: `${topPos}px`,
      left: '50%', // Still centered horizontally
      transform: 'translateX(-50%)', // Center horizontally
      zIndex: 100,
    };
  };
  
  return (
    <div 
      className="fixed inset-0 z-50 pointer-events-none"
    >
      <div 
        ref={popupRef}
        style={getPopupStyle()}
        className="relative bg-gray-900 border-2 border-amber-600 rounded-md shadow-lg w-72 animate-fadeIn pointer-events-auto"
        onClick={(e) => e.stopPropagation()}
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
