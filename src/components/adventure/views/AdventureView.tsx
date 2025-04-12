'use client';

import { memo } from 'react';
import type { Adventure, AdventureDecision, Character } from '@/lib/types';
import CharacterStats from '@/components/character/character-stats';
import AdventureTracker from '@/components/adventure/adventure-tracker';
import { useAdventure } from '../AdventureContext';
import { MAX_ADVENTURES_PER_DAY } from '@/lib/constants';

interface AdventureViewProps {
  adventure: Adventure;
  character: Character;
}

const AdventureView = memo(function AdventureView({ adventure, character }: AdventureViewProps) {
  const { state, selectDecision, completeAdventure } = useAdventure();
  const { selectedDecision } = state;
  
  const handleDecisionSelect = (decision: AdventureDecision) => {
    selectDecision(decision);
  };
  
  const handleCompleteAdventure = async () => {
    await completeAdventure();
  };
  
  return (
    <div className="bg-gray-900 bg-opacity-80 p-6 animate-fadeIn">
      <div className="flex flex-col gap-4 mb-6">
        <div>
          <CharacterStats character={character} />
        </div>
        
        <div>
          <AdventureTracker 
            totalAdventures={MAX_ADVENTURES_PER_DAY} 
            completedAdventures={character.daily_adventure_count} 
          />
          
          <h2 className="text-3xl mb-2 text-yellow-400">{adventure.title}</h2>
          <p className="text-xl mb-6">{adventure.description}</p>
          
          {/* Adventure image placeholder */}
          <div className="w-full h-48 bg-gray-700 mb-6 rounded-md flex items-center justify-center">
            <p className="text-gray-400">Adventure Image</p>
          </div>
        </div>
      </div>
      
      {/* Decisions */}
      <div className="mb-6">
        <h3 className="text-2xl mb-4">What will you do?</h3>
        
        <div className="space-y-4">
          {adventure.decisions?.map((decision: AdventureDecision) => (
            <div 
              key={decision.id}
              className={`p-4 border-2 rounded-md cursor-pointer transition-all ${
                selectedDecision?.id === decision.id
                  ? 'border-purple-500 bg-purple-900 bg-opacity-30'
                  : 'border-gray-600 bg-gray-800 hover:border-gray-400'
              }`}
              onClick={() => handleDecisionSelect(decision)}
            >
              <p className="text-lg">{decision.description}</p>
            </div>
          ))}
        </div>
      </div>
      
      <div className="flex justify-center">
        <button 
          onClick={handleCompleteAdventure}
          disabled={!selectedDecision}
          className="pixel-button text-xl disabled:opacity-50"
        >
          Proceed with Decision
        </button>
      </div>
    </div>
  );
});

export default AdventureView;
