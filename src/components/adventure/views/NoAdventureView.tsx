'use client';

import { memo } from 'react';
import type { Character, Area } from '@/lib/types';
import { useAdventure } from '../AdventureContext';

interface NoAdventureViewProps {
  character: Character;
  selectedArea: Area;
}

const NoAdventureView = memo(function NoAdventureView({ 
  character, 
  selectedArea 
}: NoAdventureViewProps) {
  const { loadAdventureData } = useAdventure();
  
  const handleTryAgain = async () => {
    await loadAdventureData();
  };
  
  return (
    <div className="text-center animate-fadeIn">
      <p className="text-xl mb-4">No adventures available in {selectedArea.name}</p>
      <button 
        onClick={handleTryAgain} 
        className="pixel-button"
      >
        Try Again
      </button>
    </div>
  );
});

export default NoAdventureView;
