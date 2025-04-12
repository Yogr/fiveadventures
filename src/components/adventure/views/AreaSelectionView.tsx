'use client';

import { memo, useEffect } from 'react';
import Image from 'next/image';
import type { Area, Character } from '@/lib/types';
import { getLevelFromExperience } from '@/lib/utils';
import { useAdventure } from '../AdventureContext';

interface AreaSelectionViewProps {
  areas: Area[];
  character: Character;
}

const AreaSelectionView = memo(function AreaSelectionView({ areas, character }: AreaSelectionViewProps) {
  const { selectArea, state } = useAdventure();
  const characterLevel = getLevelFromExperience(character.experience);
  
  // Log for debugging
  useEffect(() => {
    console.log('AreaSelectionView rendered with areas:', areas);
  }, [areas]);
  
  // Check if areas is empty
  if (!areas || areas.length === 0) {
    return (
      <div className="bg-gray-900 bg-opacity-80 p-6 animate-fadeIn text-center">
        <h2 className="text-3xl mb-4 text-yellow-400">Loading Areas...</h2>
        <p className="text-xl mb-6">
          Please wait while we load the available adventure areas.
        </p>
      </div>
    );
  }
  
  // Sort areas by level requirement
  const sortedAreas = [...areas].sort((a, b) => a.level_requirement - b.level_requirement);
  
  const handleAreaSelect = async (area: Area) => {
    console.log('Area selected:', area.name);
    await selectArea(area);
  };
  
  return (
    <div className="bg-gray-900 bg-opacity-80 p-6 animate-fadeIn">
      <h2 className="text-3xl mb-4 text-yellow-400">Choose Your Adventure Area</h2>
      <p className="text-xl mb-6">
        Select an area to explore for today's adventures. Each area offers different challenges and rewards.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {sortedAreas.map((area) => {
          const isLocked = characterLevel < area.level_requirement;
          
          return (
            <div 
              key={area.id}
              className={`
                relative border-2 rounded-md p-4 cursor-pointer transition-all
                ${isLocked ? 'border-gray-600 bg-gray-800 opacity-60 cursor-not-allowed' : 
                  'border-gray-600 bg-gray-800 hover:border-gray-400 hover:bg-gray-700'}
              `}
              onClick={() => !isLocked && handleAreaSelect(area)}
            >
              {/* Area image */}
              <div className="w-full h-32 bg-gray-700 mb-3 rounded-md flex items-center justify-center overflow-hidden">
                {area.image ? (
                  <Image 
                    src={`/image/area/${area.image}.png`}
                    alt={area.name}
                    width={200}
                    height={128}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="text-gray-500">No Image</div>
                )}
                
                {/* Lock overlay for locked areas */}
                {isLocked && (
                  <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
                    <div className="text-white text-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      <p>Unlocks at Level {area.level_requirement}</p>
                    </div>
                  </div>
                )}
              </div>
              
              <h3 className="text-xl font-medium mb-1">{area.name}</h3>
              <p className="text-sm text-gray-300 mb-2">Required Level: {area.level_requirement}</p>
              <p className="text-sm">{area.description}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
});

export default AreaSelectionView;
