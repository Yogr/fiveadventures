'use client';

import React from 'react';
import Image from 'next/image';
import { useAudio } from '@/lib/audio-utils';

interface ActionButtonProps {
  icon: string;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  isSelected?: boolean;
  cost?: number;
  description?: string;
  isSkill?: boolean;
}

export default function ActionButton({
  icon,
  label,
  onClick,
  disabled = false,
  isSelected = false,
  cost,
  description,
  isSkill = false
}: ActionButtonProps) {
  // Get audio utilities
  const { playUISound, playCombatSound } = useAudio();
  
  // Handle button click with sound
  const handleClick = () => {
    // Play appropriate sound effect
    if (isSkill) {
      // For skills, we could use a specific skill sound in the future
      playCombatSound('attack');
    } else if (label === 'Attack') {
      // For attack button, play a different sound
      playCombatSound('attack');
    } else {
      // For regular buttons like attack or flee
      playUISound();
    }
    
    // Call the original onClick handler
    onClick();
  };
  
  // Uniform size for all buttons
  const buttonSize = 'w-16 h-16';
  const textSize = 'text-sm';
  
  return (
    <div className="flex items-center justify-center">
      <button 
        onClick={handleClick}
        disabled={disabled}
        className={`pixel-button relative flex flex-col items-center p-0 rounded-md
          ${isSelected 
            ? 'bg-blue-900 bg-opacity-70 border border-blue-500' 
            : isSkill 
              ? 'bg-gray-700 hover:bg-gray-600 active:bg-gray-800' 
              : 'bg-gray-800 hover:bg-gray-700 active:bg-gray-900'}
          disabled:opacity-50 ${buttonSize} overflow-hidden`}
        title={description}
      >
        {/* Background icon image */}
        <div className="absolute inset-0 flex items-center justify-center opacity-80">
          <Image
            src={`/image/${icon.includes('/') ? '' : 'ui/'}${icon}${icon.includes('.') ? '' : '.png'}`}
            alt=""
            width={45}
            height={45}
            className="object-contain"
          />
        </div>
        
        {/* Overlay with gradient for better text visibility */}
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-black/50 to-transparent"></div>
        
        {/* Cost indicator in top-right corner */}
        {cost !== undefined && (
          <div className="absolute top-0 right-0 px-1 py-0 z-10">
            <span className={`${textSize} text-blue-400 font-bold bg-black bg-opacity-50 rounded-bl px-1`}>
              {cost}
            </span>
          </div>
        )}
        
        {/* Text at bottom */}
        <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center pb-1">
          <span className={`${textSize} text-center text-white text-shadow whitespace-nowrap overflow-hidden text-ellipsis w-full px-1`}>
            {label}
          </span>
        </div>
      </button>
    </div>
  );
}
