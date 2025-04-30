'use client';

import { memo } from 'react';
import type { Adventure, AdventureDecision, Character } from '@/lib/types';
import { useDungeon, useDungeonState } from '../DungeonContext';
import AdventureDisplay from '../../adventure/views/AdventureDisplay';
import DecisionCard from '../../adventure/DecisionCard';

interface DungeonAdventureViewProps {
  adventure: Adventure;
  character: Character;
}

const DungeonAdventureView = memo(function DungeonAdventureView({ 
  adventure, 
  character 
}: DungeonAdventureViewProps) {
  const { state, dispatch } = useDungeon();
  const { setDungeonState } = useDungeonState();
  
  const { selectedDecision } = state;
  
  const handleDecisionSelect = (decision: AdventureDecision) => {
    dispatch({ type: 'SET_DECISION', payload: decision });
  };
  
  const handleProceed = async () => {
    if (!selectedDecision) return;
    
    // Move to the outcome view
    setDungeonState('outcome');
  };
  
  return (
    <div className="bg-gradient-to-b from-amber-950 to-black p-0 animate-fadeIn rounded-lg border-2 border-amber-900 border-t-amber-700 border-l-amber-700">
      <div className="relative">
        <div className="absolute top-0 left-0 bg-amber-800/80 text-white px-2 py-1 text-xs rounded-br-md z-10">
          Dungeon
        </div>
        <AdventureDisplay 
          title={adventure.title}
          description={adventure.description}
          imageUrl={adventure.image_url || "default"}
        />
      </div>
      
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
          onClick={handleProceed}
          disabled={!selectedDecision}
          className={`pixel-button text-sm md:text-base py-1 md:py-2 px-3 md:px-4 
            ${!selectedDecision
              ? 'bg-gray-600 cursor-not-allowed opacity-70' 
              : 'bg-amber-800 hover:bg-amber-700 active:bg-amber-900'
            } transition-all duration-200`}
        >
          Proceed with Decision
        </button>
      </div>
    </div>
  );
});

export default DungeonAdventureView;
