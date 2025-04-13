'use client';

import { memo } from 'react';
import type { Adventure, AdventureDecision, Character } from '@/lib/types';
import { useAdventure } from '../AdventureContext';

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
    <div className="bg-amber-950 bg-opacity-80 p-4 md:p-6 animate-fadeIn rounded-lg border-2 border-amber-800 border-t-amber-700 border-l-amber-700">
      <div className="mb-4 md:mb-6">
        <h2 className="text-xl md:text-2xl mb-2 text-amber-300">{adventure.title}</h2>
        <p className="text-sm md:text-base mb-4 md:mb-6 text-amber-200">{adventure.description}</p>
        
        {/* Adventure image placeholder */}
        <div className="w-full h-36 md:h-48 bg-amber-900 mb-4 md:mb-6 rounded-md flex items-center justify-center">
          <p className="text-amber-400">Adventure Image</p>
        </div>
      </div>
      
      {/* Decisions */}
      <div className="mb-4 md:mb-6">
        <h3 className="text-lg md:text-xl mb-2 md:mb-4 text-amber-300">What will you do?</h3>
        
        <div className="space-y-2 md:space-y-4">
          {adventure.decisions?.map((decision: AdventureDecision) => (
            <div 
              key={decision.id}
              className={`p-3 md:p-4 border-2 rounded-md cursor-pointer transition-all ${
                selectedDecision?.id === decision.id
                  ? 'border-amber-500 bg-amber-900 bg-opacity-50'
                  : 'border-amber-800 bg-amber-900 bg-opacity-30 hover:border-amber-600'
              }`}
              onClick={() => handleDecisionSelect(decision)}
            >
              <p className="text-sm md:text-base text-amber-200">{decision.description}</p>
            </div>
          ))}
        </div>
      </div>
      
      <div className="flex justify-center">
        <button 
          onClick={handleCompleteAdventure}
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

export default AdventureView;
