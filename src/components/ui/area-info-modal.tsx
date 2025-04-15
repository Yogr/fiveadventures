'use client';

import { useState, useEffect, useRef } from 'react';
import type { Area } from '@/lib/types';

interface AreaInfoModalProps {
  area: Area | null;
  isOpen: boolean;
  onClose: () => void;
  position?: { x: number; y: number };
  onSelectArea?: () => void;
}

export default function AreaInfoModal({ 
  area, 
  isOpen, 
  onClose, 
  position,
  onSelectArea
}: AreaInfoModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  
  // Close modal when Escape key is pressed
  useEffect(() => {
    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleEscapeKey);
    return () => window.removeEventListener('keydown', handleEscapeKey);
  }, [isOpen, onClose]);
  
  // Close modal when clicking outside
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };
  
  if (!isOpen || !area) return null;
  
  // Calculate position for tooltip
  const getTooltipStyle = () => {
    if (!position) return {};
    
    // Get window dimensions
    const windowWidth = typeof window !== 'undefined' ? window.innerWidth : 900;
    
    // Calculate the horizontal center position
    const left = `${windowWidth / 2}px`;
    
    // Position the popup above the item
    const top = `${position.y}px`;
    
    return {
      position: 'fixed' as const,
      top,
      left,
      transform: 'translate(-50%, -100%)', // Center horizontally and position above
      maxHeight: '80vh',
      zIndex: 100,
    };
  };
  
  return (
    <div 
      className={position ? '' : 'fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4'}
      onClick={handleBackdropClick}
    >
      <div 
        ref={modalRef}
        style={position ? getTooltipStyle() : {}}
        className="relative bg-gray-900 border border-amber-700 rounded-md shadow-lg w-72 animate-fadeIn"
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
