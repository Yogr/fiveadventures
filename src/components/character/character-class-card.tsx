'use client';

import React from 'react';
import { CLASS_BASE_STATS } from '@/lib/utils';
import Image from 'next/image';

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
      className={`rounded-lg p-2 cursor-pointer transition-all ${
        isSelected
          ? 'bg-amber-900 border border-amber-600'
          : 'bg-amber-950 hover:bg-amber-900 border border-amber-800'
      }`}
      onClick={onSelect}
    >
      <div className="grid grid-rows-[auto_1fr] h-full">
        <div className="flex justify-center">
          <div className="relative">
            <Image
              src={`/image/characters/${characterClass.toLowerCase()}.png`}
              alt={characterClass}
              width={64}
              height={64}
              className="w-12 h-12 md:w-14 md:h-14 object-cover"
            />
            
            {/* Info button */}
            <button 
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onInfoClick();
              }}
              className="absolute -top-1 -right-1 w-5 h-5 md:w-6 md:h-6 bg-amber-700 rounded-full flex items-center justify-center text-white text-xs hover:bg-amber-600 focus:outline-none"
            >
              i
            </button>
          </div>
        </div>
        <div className="flex items-center justify-center">
          <h3 className="text-sm md:text-base font-bold">{characterClass}</h3>
        </div>
      </div>
    </div>
  );
}
