'use client';

import { useState } from 'react';
import Image from 'next/image';
import type { Area, Character } from '@/lib/types';
import { getLevelFromExperience } from '@/lib/utils';

interface AreaSelectionProps {
  areas: Area[];
  character: Character;
  onSelectArea: (area: Area) => void;
}

export default function AreaSelection({ areas, character, onSelectArea }: AreaSelectionProps) {
  const [selectedArea, setSelectedArea] = useState<Area | null>(null);
  const characterLevel = getLevelFromExperience(character.experience);
  
  // Sort areas by level requirement
  const sortedAreas = [...areas].sort((a, b) => a.level_requirement - b.level_requirement);
  
  const handleAreaSelect = (area: Area) => {
    setSelectedArea(area);
  };
  
  const handleConfirmSelection = () => {
    if (selectedArea !== null) {
      onSelectArea(selectedArea);
    }
  };
  
  return (
    <div className="bg-amber-950 bg-opacity-80 p-3 md:p-6 animate-fadeIn rounded-md">
      <h2 className="text-lg md:text-2xl mb-2 md:mb-3 text-amber-300 font-bold">Choose Your Adventure Area</h2>
      <p className="text-sm md:text-base mb-3 md:mb-4 text-amber-200">
        Select an area to explore. Each offers different challenges and rewards.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-4 mb-4 md:mb-6">
        {sortedAreas.map((area) => {
          const isLocked = characterLevel < area.level_requirement;
          const isSelected = selectedArea === area;
          
          return (
            <div 
              key={area.id}
              className={`
                relative border rounded-md p-2 md:p-3 cursor-pointer transition-all
                ${isLocked ? 'border-amber-800 bg-amber-950 bg-opacity-60 cursor-not-allowed' : 
                  isSelected ? 'border-amber-500 bg-amber-900 bg-opacity-50' : 
                  'border-amber-800 bg-amber-950 bg-opacity-70 hover:border-amber-600'}
              `}
              onClick={() => !isLocked && handleAreaSelect(area)}
            >
              {/* Area image */}
              <div className="w-full h-24 md:h-32 bg-amber-950 bg-opacity-50 mb-2 rounded-md flex items-center justify-center overflow-hidden">
                {area.image ? (
                  <Image 
                    src={`/image/area/${area.image}.png`}
                    alt={area.name}
                    width={200}
                    height={128}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="text-amber-700">No Image</div>
                )}
                
                {/* Lock overlay for locked areas */}
                {isLocked && (
                  <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center">
                    <div className="text-amber-200 text-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 md:h-10 md:w-10 mx-auto mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      <p className="text-xs md:text-sm">Unlocks at Level {area.level_requirement}</p>
                    </div>
                  </div>
                )}
              </div>
              
              <h3 className="text-base md:text-lg font-medium mb-0.5 md:mb-1 text-amber-300">{area.name}</h3>
              <p className="text-xs md:text-sm text-amber-400 mb-1">Required Level: {area.level_requirement}</p>
              <p className="text-xs md:text-sm text-amber-200 line-clamp-2">{area.description}</p>
              
              {/* Selected indicator */}
              {isSelected && (
                <div className="absolute top-2 right-2 bg-amber-500 rounded-full p-0.5 md:p-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      <div className="flex justify-center">
        <button 
          onClick={handleConfirmSelection}
          disabled={selectedArea === null}
          className={`pixel-button text-sm md:text-base py-1 md:py-2 px-3 md:px-4 
            ${selectedArea === null 
              ? 'bg-gray-600 cursor-not-allowed opacity-70' 
              : 'bg-amber-800 hover:bg-amber-700 active:bg-amber-900'
            } transition-all duration-200`}
        >
          Begin Adventures
        </button>
      </div>
    </div>
  );
}
