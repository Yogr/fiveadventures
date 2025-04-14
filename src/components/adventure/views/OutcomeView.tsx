'use client';

import { memo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { AdventureOutcome, Character } from '@/lib/types';
import { ROUTES, MAX_ADVENTURES_PER_DAY } from '@/lib/constants';
import AdventureTracker from '@/components/adventure/adventure-tracker';
import AnimatedText from '@/components/ui/animated-text';
import AnimatedReward from '@/components/ui/animated-reward';
import LevelUpAnimation from '@/components/ui/level-up-animation';
import { useAdventure } from '../AdventureContext';

interface OutcomeViewProps {
  outcome: AdventureOutcome;
  character: Character;
  oldExperience: number;
  showRewards: boolean;
  showLevelUp: boolean;
}

const OutcomeView = memo(function OutcomeView({ 
  outcome, 
  character, 
  oldExperience,
  showRewards,
  showLevelUp
}: OutcomeViewProps) {
  const router = useRouter();
  const { continueToNextAdventure, dispatch } = useAdventure();
  const [localShowRewards, setLocalShowRewards] = useState(false);
  
  // We no longer need to refresh the page on mount as we've optimized data flow
  // and removed redundant refreshes throughout the application
  
  // Check if this is a "ran away" outcome
  const ranAway = outcome.description.includes('ran away from');
  
  // Check if this was the final adventure (5th adventure)
  // We need to check if the character has completed 4 adventures and is now completing the 5th one
  const isFinalAdventure = character.daily_adventure_count === MAX_ADVENTURES_PER_DAY;
  
  const handleContinue = async () => {
    console.log('Continuing to next adventure');
    // No need to call router.refresh() here as state updates will trigger re-renders
    await continueToNextAdventure();
  };
  
  const handleAnimationComplete = () => {
    setLocalShowRewards(true);
  };
  
  // Use the local state or the prop, whichever is true
  const displayRewards = localShowRewards || showRewards;
  
  return (
    <div className="bg-gray-900 bg-opacity-80 p-6 animate-fadeIn">
      {/* Level Up Animation */}
      {showLevelUp && character && (
        <LevelUpAnimation 
          oldExperience={oldExperience}
          newExperience={character.experience}
          onComplete={() => dispatch({ type: 'SET_SHOW_LEVEL_UP', payload: false })}
        />
      )}
      
      <h2 className={`text-3xl mb-4 ${ranAway ? 'text-red-400' : 'text-green-400'}`}>
        {ranAway ? 'Defeat!' : 'Adventure Outcome'}
      </h2>
      
      <div className="mb-6">
        <AdventureTracker 
          totalAdventures={MAX_ADVENTURES_PER_DAY} 
          completedAdventures={character.daily_adventure_count} 
        />
      </div>
      
      <div className="mb-6 p-4 bg-gray-800 rounded-md">
        <AnimatedText 
          text={outcome.description} 
          className="text-xl mb-4"
          speed={80}
          onComplete={handleAnimationComplete}
        />
        
        {!ranAway && displayRewards && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            {/* Item reward */}
            {outcome.reward_table_id && (
              <AnimatedReward delay={0} isItem={true} className="col-span-full bg-gray-700 p-3 rounded-md">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-purple-900 rounded-md flex items-center justify-center mr-4">
                    <span className="text-xl">W</span>
                  </div>
                  <div>
                    <h4 className="text-lg font-medium text-purple-300">Enchanted Sword</h4>
                    <p className="text-sm text-gray-300">Weapon (Slashing) • +15 Damage • +3 Strength</p>
                  </div>
                </div>
              </AnimatedReward>
            )}
            
            {/* Other rewards */}
            <>
              <AnimatedReward delay={200} className="bg-gray-700 p-3 rounded-md">
                <p className="text-green-400">+{outcome.experience_bonus} Experience</p>
              </AnimatedReward>
              
              <AnimatedReward delay={400} className="bg-gray-700 p-3 rounded-md">
                <p className="text-yellow-400">+{outcome.gold_bonus} Gold</p>
              </AnimatedReward>
              
              {outcome.hitpoints_change !== 0 && (
                <AnimatedReward delay={600} className="bg-gray-700 p-3 rounded-md">
                  <p className={outcome.hitpoints_change > 0 ? "text-green-400" : "text-red-400"}>
                    {outcome.hitpoints_change > 0 ? "+" : ""}{outcome.hitpoints_change} HP
                  </p>
                </AnimatedReward>
              )}
              
              {outcome.energy_change !== 0 && (
                <AnimatedReward delay={800} className="bg-gray-700 p-3 rounded-md">
                  <p className={outcome.energy_change > 0 ? "text-green-400" : "text-red-400"}>
                    {outcome.energy_change > 0 ? "+" : ""}{outcome.energy_change} Energy
                  </p>
                </AnimatedReward>
              )}
            </>
          </div>
        )}
      </div>
      
      {/* Show "All Adventures Completed" content if this was the final adventure */}
      {isFinalAdventure && displayRewards && (
        <div className="mt-8 text-center animate-fadeIn">
          <h2 className="text-3xl mb-4 text-yellow-400">All Adventures Completed!</h2>
          <p className="text-xl mb-6">
            You've completed all {MAX_ADVENTURES_PER_DAY} adventures for today.
            Return tomorrow for new adventures!
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4 mt-6">
            <Link href={ROUTES.WORLD_BOSS} className="pixel-button bg-red-600 hover:bg-red-500 active:bg-red-700">
              Fight World Boss
            </Link>
            <Link href={ROUTES.INVENTORY} className="pixel-button bg-blue-600 hover:bg-blue-500 active:bg-blue-700">
              Inventory
            </Link>
            <Link href={ROUTES.SHOP} className="pixel-button bg-green-600 hover:bg-green-500 active:bg-green-700">
              Shop
            </Link>
          </div>
        </div>
      )}
      
      {/* Only show continue button if not the final adventure */}
      {(!isFinalAdventure || !displayRewards) && (
        <div className="flex justify-center">
          <button 
            onClick={handleContinue} 
            className="pixel-button text-xl"
          >
            Continue to Next Adventure
          </button>
        </div>
      )}
    </div>
  );
});

export default OutcomeView;
