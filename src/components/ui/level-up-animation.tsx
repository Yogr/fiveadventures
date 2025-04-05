'use client';

import { useState, useEffect } from 'react';
import { getLevelFromExperience } from '@/lib/utils';

interface LevelUpAnimationProps {
  oldExperience: number;
  newExperience: number;
  onComplete?: () => void;
}

export default function LevelUpAnimation({ 
  oldExperience, 
  newExperience,
  onComplete 
}: LevelUpAnimationProps) {
  const [showAnimation, setShowAnimation] = useState(false);
  const [showStats, setShowStats] = useState(false);
  
  const oldLevel = getLevelFromExperience(oldExperience);
  const newLevel = getLevelFromExperience(newExperience);
  const leveledUp = newLevel > oldLevel;
  
  // Stats gained per level
  const statsGained = [
    { name: 'Strength', value: '+1' },
    { name: 'Intelligence', value: '+1' },
    { name: 'Agility', value: '+1' },
    { name: 'Luck', value: '+1' },
    { name: 'Max HP', value: '+5' },
    { name: 'Max Energy', value: '+3' }
  ];
  
  useEffect(() => {
    if (leveledUp) {
      // Start animation after a short delay
      const animationTimer = setTimeout(() => {
        setShowAnimation(true);
      }, 500);
      
      // Show stats after the level up animation
      const statsTimer = setTimeout(() => {
        setShowStats(true);
      }, 1500);
      
      // Call onComplete after all animations
      const completeTimer = setTimeout(() => {
        if (onComplete) onComplete();
      }, 4000);
      
      return () => {
        clearTimeout(animationTimer);
        clearTimeout(statsTimer);
        clearTimeout(completeTimer);
      };
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
                
                <div className="grid grid-cols-2 gap-4">
                  {statsGained.map((stat, index) => (
                    <div 
                      key={stat.name}
                      className="bg-gray-700 p-3 rounded-md animate-fadeIn"
                      style={{ animationDelay: `${index * 200}ms` }}
                    >
                      <p className="text-white">{stat.name}</p>
                      <p className="text-green-400 text-xl">{stat.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
