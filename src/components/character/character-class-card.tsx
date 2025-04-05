'use client';

import React from 'react';
import { CLASS_BASE_STATS } from '@/lib/utils';

interface CharacterClassCardProps {
  characterClass: string;
  isSelected: boolean;
  onSelect: () => void;
  onInfoClick: () => void;
}

export default function CharacterClassCard({
  characterClass,
  isSelected,
  onSelect,
  onInfoClick
}: CharacterClassCardProps) {
  return (
    <div
      className={`pixel-border p-4 cursor-pointer transition-all ${
        isSelected
          ? 'bg-purple-900 border-purple-400'
          : 'bg-gray-800 hover:bg-gray-700'
      }`}
      onClick={onSelect}
    >
      <div className="flex flex-col items-center">
        <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 mb-1 sm:mb-2 relative">
          {/* Placeholder for character class image */}
          <div className="absolute inset-0 bg-gray-600 rounded-full flex items-center justify-center text-xl sm:text-2xl md:text-3xl">
            {characterClass.charAt(0)}
          </div>
          
          {/* Info button */}
          <button 
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onInfoClick();
            }}
            className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs sm:text-sm hover:bg-blue-500 focus:outline-none"
          >
            i
          </button>
        </div>
        <h3 className="text-base sm:text-lg md:text-xl font-bold">{characterClass}</h3>
      </div>
    </div>
  );
}
