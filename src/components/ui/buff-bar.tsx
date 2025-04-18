'use client';

import React from 'react';
import Image from 'next/image';
import { categorizeEffect } from '@/lib/character-utils';

interface BuffEffect {
  name?: string;
  type?: string;
  image_url?: string;
  duration?: number;
  turn_applied?: number;
  strength_boost?: number;
  intelligence_boost?: number;
  agility_boost?: number;
  luck_boost?: number;
  defense_boost?: number;
  slow?: number;
  damage_over_time?: number;
  stun?: boolean;
  ability?: string;
  [key: string]: any;
}

interface BuffBarProps {
  effects: BuffEffect[];
  size?: 'sm' | 'md' | 'lg';
  maxBuffs?: number;
}

export default function BuffBar({ effects, size = 'md', maxBuffs = 4 }: BuffBarProps) {
  if (!effects || effects.length === 0) {
    return null;
  }

  // Calculate dimensions based on size
  const dimensions = {
    sm: { size: 24, borderWidth: 2 },
    md: { size: 32, borderWidth: 2 },
    lg: { size: 40, borderWidth: 3 }
  };
  
  const { size: boxSize, borderWidth } = dimensions[size];
  
  // Limit number of effects displayed
  const visibleEffects = effects.slice(0, maxBuffs);
  
  return (
    <div className="flex items-center gap-1 my-1">
      {visibleEffects.map((effect, index) => {
        // Determine if effect is a buff or debuff
        const effectType = categorizeEffect(effect);
        
        // Set border color based on effect type
        const borderColor = 
          effectType === 'buff' ? 'border-green-500' : 
          effectType === 'debuff' ? 'border-red-500' : 
          'border-gray-500';
        
        // Determine image URL for the effect
        let imageUrl = '/image/ui/attack.png'; // Default icon
        
        // Try to infer the image URL from the effect properties
        if (effect.image_url) {
          imageUrl = `/image/skill/${effect.image_url}.png`;
        } else if (effect.ability) {
          // For monster abilities, use a generic icon
          imageUrl = '/image/ui/attack.png';
        } else if (effect.strength_boost) {
          imageUrl = '/image/skill/rage.png';
        } else if (effect.slow) {
          imageUrl = '/image/skill/ice_spike.png';
        } else if (effect.stun) {
          imageUrl = '/image/skill/shield_bash.png';
        }
        
        return (
          <div 
            key={index}
            className={`relative flex items-center justify-center bg-gray-800 ${borderColor}`}
            style={{ 
              width: boxSize, 
              height: boxSize, 
              borderWidth,
              borderStyle: 'solid',
              borderRadius: '4px'
            }}
            title={effect.name || `${effectType === 'buff' ? 'Buff' : 'Debuff'} Effect`}
          >
            <div className="relative w-3/4 h-3/4">
              <Image
                src={imageUrl}
                alt={effect.name || "Effect"}
                fill
                className="object-contain"
              />
            </div>
            
            {/* Show duration if available */}
            {effect.duration && (
              <span 
                className="absolute bottom-0 right-0 bg-black bg-opacity-70 text-white text-xs rounded-sm px-0.5"
                style={{ fontSize: size === 'sm' ? '8px' : '10px' }}
              >
                {effect.duration}
              </span>
            )}
          </div>
        );
      })}
      
      {/* Show count of additional effects if there are more than maxBuffs */}
      {effects.length > maxBuffs && (
        <div 
          className="flex items-center justify-center bg-gray-700 text-white text-xs rounded-md"
          style={{ 
            width: boxSize, 
            height: boxSize,
            fontSize: size === 'sm' ? '8px' : '10px'
          }}
        >
          +{effects.length - maxBuffs}
        </div>
      )}
    </div>
  );
}
