'use client';

import { memo, useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useDungeon, useDungeonState } from '../DungeonContext';
import { ROUTES } from '@/lib/constants';
import type { AdventureOutcome, Item } from '@/lib/types';
import { formatNumber } from '@/lib/utils';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { exitDungeon } from '@/app/actions/dungeon';

interface DungeonOutcomeViewProps {
  outcome: AdventureOutcome;
  adventureCount: number;
}

const DungeonOutcomeView = memo(function DungeonOutcomeView({ 
  outcome, 
  adventureCount
}: DungeonOutcomeViewProps) {
  const [isExiting, setIsExiting] = useState(false);
  const [exitError, setExitError] = useState<string | null>(null);
  const { state, dispatch } = useDungeon();
  const { setDungeonState } = useDungeonState();
  
  const { character, dungeon } = state;
  
  const handleCombat = () => {
    if (!outcome.has_combat) return;
    
    setDungeonState('combat');
  };
  
  const handleContinue = () => {
    // Update adventure count
    dispatch({ 
      type: 'SET_ADVENTURE_COUNT', 
      payload: (adventureCount || 0) + 1 
    });
    
    // Reset current adventure, decision, outcome
    dispatch({ type: 'SET_ADVENTURE', payload: null });
    dispatch({ type: 'SET_DECISION', payload: null });
    dispatch({ type: 'SET_OUTCOME', payload: null });
    
    // Return to started state
    setDungeonState('started');
  };
  
  const handleExitDungeon = async () => {
    if (!character || !dungeon || isExiting) return;
    
    setIsExiting(true);
    setExitError(null);
    
    try {
      const response = await exitDungeon(character.id, dungeon.area_id);
      
      if (!response.success) {
        setExitError(response.error || 'Failed to exit dungeon');
        setIsExiting(false);
        return;
      }
      
      // Navigate to character page
      window.location.href = ROUTES.HOME;
    } catch (err) {
      console.error('Error exiting dungeon:', err);
      setExitError('An unexpected error occurred');
      setIsExiting(false);
    }
  };
  
  // Redirect to combat if outcome has combat
  useEffect(() => {
    if (outcome.has_combat) {
      handleCombat();
    }
  }, [outcome.has_combat]);
  
  // Determine outcome type and image
  const isSuccess = outcome.is_success || false;
  const outcomeImage = isSuccess ? 'success' : 'failure';
  const bgColorClass = isSuccess ? 'from-green-900/80' : 'from-red-900/80';
  
  const rewardGold = outcome.gold_bonus || 0;
  const rewardExp = outcome.experience_bonus || 0;
  const hasCombat = outcome.has_combat && outcome.monster_ids && outcome.monster_ids.length > 0;
  
  // If redirecting to combat, don't render this view
  if (hasCombat) {
    return (
      <div className="flex items-center justify-center p-8">
        <LoadingSpinner size="lg" />
      </div>
    );
  }
  
  return (
    <div className={`bg-gradient-to-b ${bgColorClass} to-black p-4 rounded-lg border-2 border-amber-900 border-t-amber-700 border-l-amber-700 overflow-hidden`}>
      <div className="relative mb-3">
        <div className="absolute top-0 left-0 bg-amber-800/80 text-white px-2 py-1 text-xs rounded-br-md z-10">
          Dungeon
        </div>
        <h2 className="text-xl font-semibold text-center text-amber-200 mb-2">
          {isSuccess ? 'Success!' : 'Failure!'}
        </h2>
        
        <div className="bg-amber-950/50 p-3 rounded-lg text-amber-100">
          <p>{outcome.description}</p>
        </div>
      </div>

      {rewardGold > 0 || rewardExp > 0 ? (
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-amber-300 mb-2">Rewards</h3>
          <div className="grid grid-cols-2 gap-2">
            {rewardGold > 0 && (
              <div className="bg-amber-900/50 p-2 rounded-lg flex items-center">
                <div className="w-8 h-8 rounded-full bg-amber-800 flex items-center justify-center mr-2">
                  <Image
                    src="/image/ui/coin.png"
                    alt="Gold"
                    width={24}
                    height={24}
                    className="object-contain"
                  />
                </div>
                <span className="text-yellow-300">
                  {formatNumber(rewardGold)} gold
                </span>
              </div>
            )}
            
            {rewardExp > 0 && (
              <div className="bg-amber-900/50 p-2 rounded-lg flex items-center">
                <div className="w-8 h-8 rounded-full bg-amber-800 flex items-center justify-center mr-2">
                  <span className="text-green-400 text-xl">✦</span>
                </div>
                <span className="text-green-300">
                  {formatNumber(rewardExp)} XP
                </span>
              </div>
            )}
          </div>
        </div>
      ) : null}
      
      {exitError && (
        <div className="p-3 bg-red-900/50 text-red-100 rounded-md mb-4">
          <p>{exitError}</p>
        </div>
      )}
      
      <div className="flex justify-between space-x-2 mt-4">
        <button
          onClick={handleExitDungeon}
          disabled={isExiting}
          className="flex-1 pixel-button bg-amber-800 hover:bg-amber-700 active:bg-amber-900 py-2 px-4 text-sm"
        >
          {isExiting ? 'Exiting...' : 'Exit Dungeon'}
        </button>
        
        <button
          onClick={handleContinue}
          className="flex-1 pixel-button bg-amber-700 hover:bg-amber-600 active:bg-amber-800 py-2 px-4 text-sm"
        >
          Continue Exploring
        </button>
      </div>
    </div>
  );
});

export default DungeonOutcomeView;
