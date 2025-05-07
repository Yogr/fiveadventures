'use client';

import { memo, useState } from 'react';
import Image from 'next/image';
import type { Area, Character } from '@/lib/types';
import { getLevelFromExperience } from '@/lib/utils';
import { useAdventure } from '../AdventureContext';
import AreaInfoPopup from '../../ui/area-info-popup';
import { ImageSource } from '@/lib/image-source';

interface AreaSelectionViewProps {
  areas: Area[];
  character: Character;
}

const AreaSelectionView = memo(function AreaSelectionView({ areas, character }: AreaSelectionViewProps) {
  const { selectArea, state } = useAdventure();
  const { loading } = state;
  const characterLevel = getLevelFromExperience(character.experience);
  const [preSelectedArea, setPreSelectedArea] = useState<Area | null>(null);
  const [popupArea, setPopupArea] = useState<Area | null>(null);
  const [popupPosition, setPopupPosition] = useState<{ x: number; y: number } | null>(null);
  
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
  
  const handleAreaClick = (area: Area, event: React.MouseEvent) => {
    if (characterLevel >= area.level_requirement) {
      // Show popup with area details
      setPopupArea(area);
      setPopupPosition({ x: event.clientX, y: event.clientY });
      
      // Also select the area
      setPreSelectedArea(area);
    }
  };
  
  const handleConfirmSelection = async (area: Area) => {
    await selectArea(area);
  };
  
  const closePopup = () => {
    setPopupArea(null);
    setPopupPosition(null);
  };
  
  return (
    <div className="bg-amber-950 bg-opacity-80 p-3 md:p-4 animate-fadeIn rounded-md">
      <h2 className="text-base md:text-lg text-amber-300 font-bold text-center mb-2">Choose Your Adventure Area</h2>
      
      {/* 2x4 Grid of Square Areas */}
      <div className="grid grid-cols-2 gap-2 md:gap-3">
        {displayAreas.map((area) => {
          const isLocked = characterLevel < area.level_requirement;
          const isSelected = preSelectedArea?.id === area.id;
          
          return (
            <div 
              key={area.id}
              className={`
                relative aspect-square border-2 rounded-md transition-all overflow-hidden
                ${isLocked ? 'border-amber-800 opacity-60 cursor-not-allowed' : 
                  isSelected ? 'border-amber-400 border-4' : 
                  'border-amber-700 hover:border-amber-500'}
              `}
            >
              {/* Area image with name overlay */}
              <div 
                className="relative w-full h-full cursor-pointer"
                onClick={(e) => !isLocked && handleAreaClick(area, e)}
              >
                {area.image ? (
                  <>
                    <Image 
                      src={ImageSource.getAreaImagePath(area)}
                      alt={area.name}
                      width={200}
                      height={200}
                      className="object-cover w-full h-full"
                    />
                    {/* Area name overlay at the top */}
                    <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black to-transparent p-1 text-center">
                      <h3 className="text-sm md:text-base font-medium text-amber-300">{area.name}</h3>
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-amber-900">
                    <span className="text-amber-200">{area.name}</span>
                  </div>
                )}
              </div>
              
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
              
              {/* Selected indicator */}
              {isSelected && (
                <div className="absolute top-2 right-2 bg-amber-500 rounded-full p-0.5 md:p-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
              
              {/* Button inside the selected area */}
              {isSelected && (
                <div className="absolute bottom-0 left-0 right-0 p-1 bg-black bg-opacity-70">
                  <button 
                    onClick={() => !loading && handleConfirmSelection(area)}
                    disabled={loading}
                    className="pixel-button py-1 w-full bg-amber-700 hover:bg-amber-600 active:bg-amber-800 transition-all duration-200"
                  >
                    {loading ? 'Processing...' : 'Begin Adventures'}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {/* Area Info Popup */}
      {popupArea && popupPosition && (
        <AreaInfoPopup
          area={popupArea}
          isOpen={true}
          onClose={closePopup}
          position={popupPosition}
        />
      )}
    </div>
  );
});

export default AreaSelectionView;
