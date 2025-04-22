'use client';

import { memo } from 'react';
import { useRouter } from 'next/navigation';
import type { Adventure, AdventureDecision, Area, Character } from '@/lib/types';
import { useAdventure } from '../AdventureContext';
import AdventureDisplay from './AdventureDisplay';
import DecisionCard from '../DecisionCard';

interface AdventureViewProps {
  adventure: Adventure;
  character: Character;
  area: Area;
}

const AdventureView = memo(function AdventureView({ adventure, character, area }: AdventureViewProps) {
  const router = useRouter();
  const { state, selectDecision, completeAdventure } = useAdventure();
  const { selectedDecision, loading } = state;
  
  const handleDecisionSelect = (decision: AdventureDecision) => {
    selectDecision(decision);
  };
  
  const handleCompleteAdventure = async () => {
    console.log('Completing adventure...');
    // Complete the adventure first
    await completeAdventure();
    
    // No need to call router.refresh() here as state updates will trigger re-renders
  };
  
  return (
    <div className="bg-yellow-950 p-0 animate-fadeIn rounded-lg border-2 border-amber-900 border-t-amber-700 border-l-amber-700">
      <AdventureDisplay 
        title={adventure.title}
        description={adventure.description}
        imageUrl={adventure.image_url || "default"}
        areaName={area.name}
      />
      
      {/* Decisions */}
      <div className="mx-2 mb-4 md:mb-6">
        <h3 className="text-lg md:text-xl mb-2 md:mb-4 text-amber-300">What will you do?</h3>
        
        <div className="space-y-2 md:space-y-4">
          {adventure.decisions?.map((decision: AdventureDecision) => (
            <DecisionCard
              key={decision.id}
              decision={decision}
              character={character}
              isSelected={selectedDecision?.id === decision.id}
              onSelect={() => handleDecisionSelect(decision)}
            />
          ))}
        </div>
      </div>
      
      <div className="flex justify-center mb-2">
        <button 
          onClick={handleCompleteAdventure}
          disabled={!selectedDecision || loading}
          className={`pixel-button text-sm md:text-base py-1 md:py-2 px-3 md:px-4 
            ${!selectedDecision || loading
              ? 'bg-gray-600 cursor-not-allowed opacity-70' 
              : 'bg-amber-800 hover:bg-amber-700 active:bg-amber-900'
            } transition-all duration-200`}
        >
          {loading ? 'Processing...' : 'Proceed with Decision'}
        </button>
      </div>
    </div>
  );
});

export default AdventureView;
