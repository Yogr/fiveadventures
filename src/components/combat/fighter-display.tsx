'use client';

import React, { useMemo } from 'react';
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
  isWorldBoss?: boolean;
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
  isWorldBoss = false,
  effects = [],
  width = 80,
  height = 80,
  className = "",
  onInfoClick,
  additionalHeader
}: FighterDisplayProps) {
  // Determine avatar CSS class for animations
  const avatarClass = isEnemy ? 'monster-avatar' : 'character-avatar';

  // Calculate shadow size based on scale
  const shadowWidth = Math.round(20 * scale);
  const shadowHeight = Math.round(6 * scale);
  
  // Calculate image dimensions based on scale
  const imageWidth = Math.round(width * scale);
  const imageHeight = Math.round(height * scale);

  // Use fixed container size for consistent layout
  const containerSize = 80; // Fixed container size
  
  // Calculate additional spacing needed for larger scale fighters
  const statusMargin = useMemo(() => {
    if (scale <= 1.0) return 0;
    // Increase margin as scale increases
    return Math.round((scale - 1.0) * 40);
  }, [scale]);

  return (
    <div className={`flex flex-col items-center ${className} relative`}>
      {/* Only show status elements if not a world boss */}
      {!isWorldBoss && (
        <div className="flex flex-col items-center relative">
          {/* Name and info header - higher z-index */}
          <div 
            className="mb-2 px-3 py-1 bg-gray-900 bg-opacity-70 rounded-md text-center w-full"
            style={{ zIndex: 20 }}
          >
            <div className="flex items-center justify-center">
              <h3 className="text-base md:text-lg whitespace-nowrap">
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
          
          {/* Status Bar - higher z-index */}
          <div 
            className="w-32 md:w-40" 
            style={{ 
              zIndex: 20,
              marginBottom: `${statusMargin + 8}px` // Base 8px plus scale-based margin
            }}
          >
            <StatusBar 
              current={currentHp} 
              max={maxHp}
            />
          </div>
        </div>
      )}
      
      {/* Effects display - highest z-index */}
      {effects.length > 0 && (
        <div 
          className="absolute top-0 left-1/2 transform -translate-x-1/2" 
          style={{ zIndex: 30 }}
        >
          <BuffBar effects={effects} size="md" />
        </div>
      )}
      
      {/* Fighter container with shadow - lower z-index */}
      <div className="relative mt-1" style={{ zIndex: 10 }}>
        {/* Semi-transparent oval beneath the fighter */}
        <div 
          className="absolute bottom-0 left-1/2 bg-black bg-opacity-30 rounded-full transform -translate-x-1/2 translate-y-1"
          style={{ 
            width: `${shadowWidth}px`, 
            height: `${shadowHeight}px` 
          }}
        ></div>
        
        {/* Fighter image container */}
        <div 
          className={`${avatarClass} ${isElite ? 'filter-brightness-110' : ''}`}
          style={{
            width: `${containerSize}px`, 
            height: `${containerSize}px`,
            position: 'relative',
            overflow: 'visible'
          }}
        >
          {/* Fighter image centered within container */}
          <div
            style={{
              position: 'absolute',
              bottom: '0',
              left: '50%',
              transform: 'translateX(-50%)',
              width: `${imageWidth}px`,
              height: `${imageHeight}px`,
            }}
          >
            <Image
              src={image}
              alt={imageAlt}
              width={imageWidth}
              height={imageHeight}
              className={isEnemy ? "-scale-x-100" : ""}
              priority={true}
              style={{
                objectFit: 'contain',
                objectPosition: isEnemy ? 'bottom' : 'center',
                width: `${imageWidth}px`,
                height: `${imageHeight}px`,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
