'use client';

import React from 'react';
import Image from 'next/image';
import StatusBar from './status-bar';
import BuffBar from '@/components/ui/buff-bar';
import type { CombatEffect } from '@/lib/effect-utils';

interface FighterDisplayProps {
  name: string;
  image: string;
  imageAlt: string;
  currentHp: number;
  maxHp: number;
  scale?: number;
  isEnemy?: boolean;
  isElite?: boolean;
  effects?: CombatEffect[];
  width?: number;
  height?: number;
  className?: string;
  onInfoClick?: () => void;
  additionalHeader?: React.ReactNode;
}

export default function FighterDisplay({
  name,
  image,
  imageAlt,
  currentHp,
  maxHp,
  scale = 1.0,
  isEnemy = false,
  isElite = false,
  effects = [],
  width = 80,
  height = 80,
  className = "",
  onInfoClick,
  additionalHeader
}: FighterDisplayProps) {
  // Determine avatar CSS class for animations
  const avatarClass = isEnemy ? 'monster-avatar' : 'character-avatar';

  console.log('FighterDisplayy, effects:', effects, 'isEnemy:', isEnemy, 'isElite:', isElite, 'className:', className);

  return (
    <div className={`flex flex-col items-center ${className} relative`}>
      {/* Name and info header */}
      <div className="mb-2 px-3 py-1 bg-gray-900 bg-opacity-70 rounded-md">
        <div className="flex items-center">
          <h3 className="text-base md:text-lg">
            {name}
            {isElite && (
              <span className="ml-2 text-xs text-yellow-400 border border-yellow-400 rounded-md px-1 py-0.5">
                ELITE
              </span>
            )}
          </h3>
          
          {onInfoClick && (
            <button 
              onClick={onInfoClick}
              className="ml-2 bg-blue-700 hover:bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
              title="View details"
            >
              i
            </button>
          )}
          
          {additionalHeader}
        </div>
      </div>
      
      {/* Status Bar */}
      <div className="mb-8 w-32 md:w-40">
        <StatusBar 
          current={currentHp} 
          max={maxHp}
        />
      </div>
      
      {/* Effects display */}
      {effects.length > 0 && (
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2">
          <BuffBar effects={effects} size="md" />
        </div>
      )}
      
      {/* Semi-transparent oval beneath the fighter */}
      <div className="relative">
        <div className="absolute bottom-0 left-1/2 w-20 h-6 bg-black bg-opacity-30 rounded-full -z-10 transform -translate-x-1/2 translate-y-1"></div>
        
        {/* Fighter image */}
        <div className={`w-16 h-16 md:w-20 md:h-20 flex align-bottom pb-2 items-end ${avatarClass} ${isElite ? 'filter-brightness-110' : ''}`}>
          <Image
            src={image}
            alt={imageAlt}
            width={width * scale}
            height={height * scale}
            className={isEnemy ? "-scale-x-100" : ""}
          />
        </div>
      </div>
    </div>
  );
}
