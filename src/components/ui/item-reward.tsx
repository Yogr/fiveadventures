'use client';

import { useState, useEffect } from 'react';
import AnimatedReward from './animated-reward';
import type { Item } from '@/lib/types';
import { ITEM_RARITY_COLORS } from '@/lib/constants';

interface ItemRewardProps {
  item: Item;
  delay?: number;
  onComplete?: () => void;
}

export default function ItemReward({ 
  item, 
  delay = 0,
  onComplete
}: ItemRewardProps) {
  const [animationComplete, setAnimationComplete] = useState(false);
  
  useEffect(() => {
    // Call onComplete after a delay to allow the animation to finish
    if (animationComplete && onComplete) {
      const timer = setTimeout(() => {
        onComplete();
      }, 500); // Wait 500ms after animation starts
      
      return () => clearTimeout(timer);
    }
  }, [animationComplete, onComplete]);
  
  const rarityColor = ITEM_RARITY_COLORS[item.rarity as keyof typeof ITEM_RARITY_COLORS] || 'text-gray-200';
  
  return (
    <AnimatedReward 
      delay={delay} 
      isItem={true} 
      className="col-span-full"
      onAnimationStart={() => setAnimationComplete(true)}
    >
      <div className="bg-gray-800 border-2 border-purple-500 p-4 rounded-md flex items-center">
        {/* Item icon placeholder */}
        <div className="w-12 h-12 bg-gray-700 rounded-md flex items-center justify-center mr-4">
          <span className="text-xl">{item.type.charAt(0)}</span>
        </div>
        
        <div className="flex-grow">
          <h4 className={`text-lg font-medium ${rarityColor}`}>{item.name}</h4>
          <p className="text-sm text-gray-300">{item.type} {item.weapon_type ? `(${item.weapon_type})` : ''}</p>
          
          {/* Item stats */}
          <div className="mt-1 text-sm">
            {item.base_damage && (
              <span className="text-red-400 mr-3">Damage: {item.base_damage}</span>
            )}
            {item.base_defense && (
              <span className="text-blue-400 mr-3">Defense: {item.base_defense}</span>
            )}
          </div>
        </div>
        
        <div className="text-lg text-yellow-300 font-medium">
          {item.value} Gold
        </div>
      </div>
    </AnimatedReward>
  );
}
