'use client';

import { memo, useState } from 'react';
import Image from 'next/image';
import type { Area, Character } from '@/lib/types';
import { getLevelFromExperience } from '@/lib/utils';
import { useAdventure } from '../AdventureContext';
// Removed unused router import

interface AreaSelectionViewProps {
  areas: Area[];
  character: Character;
}

const AreaSelectionView = memo(function AreaSelectionView({ areas, character }: AreaSelectionViewProps) {
  const { selectArea, state } = useAdventure();
  const { loading } = state;
  const characterLevel = getLevelFromExperience(character.experience);
  const [preSelectedArea, setPreSelectedArea] = useState<Area | null>(null);
  
  // Removed debug logging useEffect to reduce unnecessary renders
  
  // Check if areas is empty
  if (!areas || areas.length === 0) {
    return (
      <div className="bg-amber-950 bg-opacity-80 p-3 md:p-4 animate-fadeIn text-center rounded-md">
        <h2 className="text-lg md:text-xl text-amber-300 font-bold">Loading Areas...</h2>
        <p className="text-sm md:text-base text-amber-200">
          Please wait while we load the available adventure areas.
        </p>
      </div>
    );
  }
  
  // Sort areas by level requirement
  const sortedAreas = [...areas].sort((a, b) => a.level_requirement - b.level_requirement);
  
  // Limit to 8 areas as specified
  const displayAreas = sortedAreas.slice(0, 8);
  
  const handleAreaPreSelect = (area: Area) => {
    if (characterLevel >= area.level_requirement) {
      setPreSelectedArea(area);
      console.log('Area pre-selected:', area.name);
    }
  };
  
  const handleConfirmSelection = async () => {
    if (preSelectedArea) {
      console.log('Area confirmed:', preSelectedArea.name, 'with ID:', preSelectedArea.id);
      console.log('Character ID:', character.id);
      await selectArea(preSelectedArea);
    }
  };
  
  return (
    <div className="bg-amber-950 bg-opacity-80 p-3 md:p-4 animate-fadeIn rounded-md">
      <h2 className="text-base md:text-lg text-amber-300 font-bold text-center mb-2">Choose Your Adventure Area</h2>
      
      {/* 2x4 Grid of Square Areas */}
      <div className="grid grid-cols-2 gap-2 md:gap-3 mb-4">
        {displayAreas.map((area) => {
          const isLocked = characterLevel < area.level_requirement;
          const isSelected = preSelectedArea?.id === area.id;
          
          return (
            <div 
              key={area.id}
              className={`
                relative aspect-square border-2 rounded-md cursor-pointer transition-all overflow-hidden
                ${isLocked ? 'border-amber-800 opacity-60 cursor-not-allowed' : 
                  isSelected ? 'border-amber-400 border-4' : 
                  'border-amber-700 hover:border-amber-500'}
              `}
              onClick={() => !isLocked && handleAreaPreSelect(area)}
            >
              {/* Area image (square) */}
              {area.image ? (
                <Image 
                  src={`/image/area/${area.image}.png`}
                  alt={area.name}
                  width={200}
                  height={200}
                  className="object-cover w-full h-full"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-amber-900">
                  <span className="text-amber-200">No Image</span>
                </div>
              )}
              
              {/* Lock overlay for locked areas */}
              {isLocked && (
                <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center">
                  <div className="text-amber-200 text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 md:h-10 md:w-10 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <p className="text-xs md:text-sm">Level {area.level_requirement}</p>
                  </div>
                </div>
              )}
              
              {/* Info popup for selected area */}
              {isSelected && (
                <div className={`absolute ${area.id % 2 === 0 ? 'top-0 left-0' : 'top-0 right-0'} 
                  bg-amber-900 bg-opacity-90 p-2 rounded-md shadow-lg max-w-[150px] md:max-w-[200px] text-left
                  ${area.id % 2 === 0 ? 'rounded-tl-none' : 'rounded-tr-none'}`}>
                  <h3 className="text-sm md:text-base font-medium text-amber-300">{area.name}</h3>
                  <p className="text-xs text-amber-400 mb-1">Level: {area.level_requirement}</p>
                  <p className="text-xs text-amber-200 line-clamp-3">{area.description}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {/* Confirm Button */}
      <div className="flex justify-center">
        <button 
          onClick={handleConfirmSelection}
          disabled={!preSelectedArea || loading}
          className={`pixel-button text-sm md:text-base py-1 md:py-2 px-3 md:px-4 
            ${!preSelectedArea || loading
              ? 'bg-gray-600 cursor-not-allowed opacity-70' 
              : 'bg-amber-800 hover:bg-amber-700 active:bg-amber-900'
            } transition-all duration-200`}
        >
          {loading ? 'Processing...' : 'Begin Adventures'}
        </button>
      </div>
    </div>
  );
});

export default AreaSelectionView;
