'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import type { AdventureOutcome, Character, Item, RewardItem } from '@/lib/types';
import { ROUTES, MAX_ADVENTURES_PER_DAY } from '@/lib/constants';
import AdventureTracker from '@/components/adventure/adventure-tracker';
import AnimatedText from '@/components/ui/animated-text';
import LevelUpAnimation from '@/components/ui/level-up-animation';
import ItemRewardView from '@/components/ui/item-reward-view';
import { useAdventure } from '../AdventureContext';
import { incrementAdventureNumber } from '@/app/actions/adventure-state';

// Animation states for the reward sequence - simplified
type AnimationState =
  | 'message'
  | 'item'
  | 'rewards'
  | 'complete';

// Reward item structure
interface Reward {
  id: string;
  label: string;
  value: string;
  color: string;
}

interface OutcomeViewProps {
  outcome: AdventureOutcome;
  character: Character;
  oldExperience: number;
  showRewards: boolean;
  showLevelUp: boolean;
  messageOverride?: string;
  rewardItem?: RewardItem | null;
}

const OutcomeView: React.FC<OutcomeViewProps> = ({
  outcome,
  character,
  oldExperience,
  showRewards,
  showLevelUp,
  messageOverride,
  rewardItem: initialRewardItem
}) => {
  const { continueToNextAdventure, dispatch } = useAdventure();
  const [adventureIncremented, setAdventureIncremented] = useState(false);
  
  // Animation state management - simplified
  const [animationState, setAnimationState] = useState<AnimationState>('message');
  const [messageComplete, setMessageComplete] = useState(false);
  const [itemComplete, setItemComplete] = useState(!outcome.reward_table_id); // Skip if no item
  const [rewardsComplete, setRewardsComplete] = useState(false);
  
  // State for the reward item - initialize with the passed rewardItem if available
  const [rewardItem, setRewardItem] = useState<RewardItem | null>(initialRewardItem || null);

  console.log('OutcomeView: messageOverride =', messageOverride);
  console.log('OutcomeView: outcome.description =', outcome.description);
  console.log('OutcomeView: Show level up:', showLevelUp);
  
  // Create rewards array
  const rewards: Reward[] = [];
  
  // Add experience reward if applicable
  if (outcome.experience_bonus > 0) {
    rewards.push({
      id: 'experience',
      label: 'Experience',
      value: `+${outcome.experience_bonus}`,
      color: 'text-green-400'
    });
  }
  
  // Add gold reward if applicable
  if (outcome.gold_bonus > 0) {
    rewards.push({
      id: 'gold',
      label: 'Gold',
      value: `+${outcome.gold_bonus}`,
      color: 'text-yellow-400'
    });
  }
  
  // Add hitpoints reward if applicable
  if (outcome.hitpoints_change !== 0) {
    rewards.push({
      id: 'hitpoints',
      label: 'HP',
      value: `${outcome.hitpoints_change > 0 ? '+' : ''}${outcome.hitpoints_change}`,
      color: outcome.hitpoints_change > 0 ? 'text-green-400' : 'text-red-400'
    });
  }
  
  // Add energy reward if applicable
  if (outcome.energy_change !== 0) {  
    rewards.push({
      id: 'energy',
      label: 'Energy',
      value: `${outcome.energy_change > 0 ? '+' : ''}${outcome.energy_change}`,
      color: outcome.energy_change > 0 ? 'text-green-400' : 'text-red-400'
    });
  }
  
  // Log outcome and reward details for debugging
  useEffect(() => {
    console.log('Outcome details:', {
      id: outcome.id,
      reward_table_id: outcome.reward_table_id,
      hasRewardTable: !!outcome.reward_table_id,
      currentRewardItem: rewardItem
    });
  }, [outcome.id, outcome.reward_table_id, rewardItem]);

  useEffect(() => {
    const incrementAdventure = async () => {
      if (!character) return;
      
      console.log('Incrementing adventure number for character:', character.id);
      
      try {
        const result = await incrementAdventureNumber(character.id);
        if (result.success) {
          console.log('Adventure number incremented successfully:', result.data);
          setAdventureIncremented(true);
        } else {
          console.error('Failed to increment adventure number:', result.error);
        }
      } catch (error) {
          console.error('Error incrementing adventure number:', error);
      }
    };
    
    if (!adventureIncremented) {
      setAdventureIncremented(true);
      console.log('Incrementing adventure number');
      incrementAdventure();
    }

  }, []); // Empty dependency array - only run once
  
  // Check if this was the final adventure (5th adventure)
  // We need to check if the character has completed 4 adventures and is now completing the 5th one
  const isFinalAdventure = character.daily_adventure_count === MAX_ADVENTURES_PER_DAY;
  
  const handleContinue = async () => {
    console.log('Continuing to next adventure');
    // No need to call router.refresh() here as state updates will trigger re-renders
    await continueToNextAdventure();
  };
  
  // Simplified animation handlers
  const handleMessageComplete = () => {
    if (messageComplete) return; // Prevent multiple executions
    console.log('Message animation complete');
    setMessageComplete(true);
    setAnimationState('item');
  };
  
  const handleItemComplete = () => {
    if (itemComplete) return; // Prevent multiple executions
    console.log('Item animation complete');
    setItemComplete(true);
    setAnimationState('rewards');
  };
  
  const handleRewardsComplete = () => {
    if (rewardsComplete) return; // Prevent multiple executions
    console.log('Rewards animation complete');
    setRewardsComplete(true);
    setAnimationState('complete');
  };
  
  // Determine if rewards should be displayed
  const displayRewards = messageComplete || showRewards;
  
  return (
    <div className="bg-gray-900 bg-opacity-80 p-6 animate-fadeIn">
      {/* Level Up Animation - shows after rewards are displayed */}
      <AnimatePresence>
        {showLevelUp && character && rewardsComplete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50"
          >
            <LevelUpAnimation
              oldExperience={oldExperience}
              newExperience={character.experience}
              onComplete={() => dispatch({ type: 'SET_SHOW_LEVEL_UP', payload: false })}
            />
          </motion.div>
        )}
      </AnimatePresence>
      
      <h2 className="text-3xl mb-4 text-green-400">
        Adventure Results
      </h2>
      
      <div className="mb-6">
        <AdventureTracker 
          totalAdventures={MAX_ADVENTURES_PER_DAY} 
          completedAdventures={character.daily_adventure_count} 
        />
      </div>
      
      <div className="mb-6 p-4 bg-gray-800 rounded-md">
        <AnimatedText
          text={messageOverride? messageOverride : outcome.description}
          className="text-xl mb-4"
          speed={80}
          onComplete={handleMessageComplete}
        />
        
        {/* Item reward - shows after message animation completes */}
        <AnimatePresence>
          {messageComplete && outcome.reward_table_id && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mb-4"
            >
              {animationState === 'item' ? (
                rewardItem ? (
                  <ItemRewardView
                    item={rewardItem.item}
                    onComplete={handleItemComplete}
                  />
                ) : (
                  // If no item was received, skip to rewards
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onAnimationComplete={handleItemComplete}
                    className="text-center p-4"
                  >  
                  </motion.div>
                )
              ) : (
                /* Show the revealed item after animation completes */
                <div className="flex justify-center mb-6">
                  <div className="text-center relative flex justify-center items-center">
                    {/* Background image - larger, rotating, and semi-transparent */}
                    <motion.div
                      className="absolute"
                      animate={{
                        rotate: 360
                      }}
                      transition={{
                        duration: 20,
                        repeat: Infinity,
                        ease: "linear"
                      }}
                    >
                      <Image
                        src="/image/ui/item_reward_bg.png"
                        alt="Item background"
                        width={360}
                        height={360}
                        className="object-contain opacity-60"
                      />
                    </motion.div>
                    
                    {/* Item icon in the center */}
                    <div className="relative z-10">
                      {rewardItem ? (
                        <>
                          <div className="w-16 h-16 rounded-md flex items-center justify-center mx-auto">
                            <Image
                              src={`/image/${rewardItem.item.type.toLowerCase()}/${rewardItem.item.image_url}.png`}
                              alt={rewardItem.item.name}
                              width={64}
                              height={64}
                              className="object-contain"
                            />
                          </div>
                          <div className="mt-1">
                            <h4 className="text-lg font-medium text-purple-300" style={{ textShadow: '0 0 4px rgba(0,0,0,0.8)' }}>{rewardItem.item.name}</h4>
                          </div>
                        </>
                      ) : (
                        ''
                      )}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Rewards - all animate in sequence with staggered delay */}
        {(itemComplete || !outcome.reward_table_id) && rewards.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <AnimatePresence>
              {rewards.map((reward, index) => (
                <motion.div
                  key={reward.id}
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    duration: 0.5,
                    delay: index * 0.3, // stagger each reward
                  }}
                  onAnimationComplete={() => {
                    // When the last reward completes, mark rewards as complete
                    if (index === rewards.length - 1) {
                      handleRewardsComplete();
                    }
                  }}
                  className="bg-gray-700 p-3 rounded-md"
                >
                  <p className={reward.color}>
                    {reward.value} {reward.label}
                  </p>
                </motion.div>
              ))}
            </AnimatePresence>
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
};

export default OutcomeView;
