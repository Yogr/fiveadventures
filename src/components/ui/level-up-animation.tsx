'use client';

import { useState, useEffect } from 'react';
import { getLevelFromExperience, getLevelUpRewards } from '@/lib/utils';

interface LevelUpAnimationProps {
  oldExperience: number;
  newExperience: number;
  characterClass: string;
  onComplete?: () => void;
}

export default function LevelUpAnimation({ 
  oldExperience, 
  newExperience,
  characterClass,
  onComplete 
}: LevelUpAnimationProps) {
  const [showAnimation, setShowAnimation] = useState(false);
  const [showStats, setShowStats] = useState(false);
  
  const oldLevel = getLevelFromExperience(oldExperience);
  const newLevel = getLevelFromExperience(newExperience);
  const leveledUp = newLevel > oldLevel;
  const levelsGained = newLevel - oldLevel;
  
  // Get real stat gains based on character class and levels gained
  const statGains = getLevelUpRewards(characterClass, levelsGained);
  
  // Stats gained per level
  const statsGained = [
    { name: 'Strength', value: `+${statGains.strength}` },
    { name: 'Intelligence', value: `+${statGains.intelligence}` },
    { name: 'Agility', value: `+${statGains.agility}` },
    { name: 'Luck', value: `+${statGains.luck}` },
    { name: 'Max HP', value: `+${statGains.max_hitpoints}` },
    { name: 'Max Energy', value: `+${statGains.max_energy}` }
  ];
  
  useEffect(() => {
    if (leveledUp) {
      // Start animation immediately
      setShowAnimation(true);
      
      // Show stats immediately as well
      setShowStats(true);
    } else if (onComplete) {
      // If no level up, just call onComplete
      onComplete();
    }
  }, [leveledUp, onComplete]);
  
  if (!leveledUp) return null;
  
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-70">
      <div className="text-center">
        {showAnimation && (
          <div className="animate-scaleIn">
            <h2 className="text-5xl font-bold text-yellow-400 mb-4">LEVEL UP!</h2>
            <p className="text-3xl text-white mb-8">
              Level {oldLevel} → Level {newLevel}
            </p>
            
            {showStats && (
              <div className="bg-gray-800 p-6 rounded-lg shadow-lg max-w-md mx-auto">
                <h3 className="text-2xl text-green-400 mb-4">Stats Increased</h3>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {statsGained
                    .filter(stat => !stat.value.includes('+0')) // Filter out stats with +0 value
                    .map((stat, index) => (
                      <div
                        key={stat.name}
                        className="bg-gray-700 p-3 rounded-md animate-fadeIn"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <p className="text-white">{stat.name}</p>
                        <p className="text-green-400 text-xl">{stat.value}</p>
                      </div>
                    ))
                  }
                </div>
                
                <button
                  onClick={onComplete}
                  className="pixel-button bg-green-600 hover:bg-green-500 active:bg-green-700 mt-4 w-full"
                >
                  Continue
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
