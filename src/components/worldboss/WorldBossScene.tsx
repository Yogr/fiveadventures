'use client';

import React from 'react';
import FighterDisplay from '../combat/fighter-display';
import StatusBar from '../combat/status-bar';
import type { Character, WorldBoss } from '@/lib/types';
import { getTotalMaxHitpoints } from '@/lib/character-utils';
import Image from 'next/image';
import { ImageSource } from '@/lib/image-source';

interface WorldBossSceneProps {
  character: Character;
  boss: WorldBoss;
  areaImage?: string;
}

export default function WorldBossScene({
  character,
  boss,
  areaImage = 'abyssal-realm' // Default background
}: WorldBossSceneProps) {
  
  // Calculate HP percentage for the boss
  const currentHp = boss.status?.current_hitpoints || 0;
  const hpPercentage = (currentHp / boss.total_hitpoints) * 100;
  
  // Select appropriate background based on boss name/type
  const getBackgroundForBoss = () => {
    const bossName = boss.name.toLowerCase();
    
    if (bossName.includes('dragon')) return 'volcanic-wastes';
    if (bossName.includes('forest') || bossName.includes('treant')) return 'enchanted-forest';
    if (bossName.includes('undead') || bossName.includes('lich') || bossName.includes('shadow')) return 'catacombs';
    if (bossName.includes('kraken') || bossName.includes('sea')) return 'ancient-ruins'; // Assume ruins near water
    if (bossName.includes('construct') || bossName.includes('golem') || bossName.includes('titan')) return 'ancient-ruins';
    if (bossName.includes('mountain') || bossName.includes('stone')) return 'caverns';
    
    // Default to abyssal realm for other bosses
    return areaImage;
  };
  
  const backgroundImage = getBackgroundForBoss();
  
  return (
    <div className="relative rounded-lg overflow-hidden h-[40vh] md:h-[300px]">
      {/* Main background that covers the full area */}
      <div className="absolute inset-0 z-0">
        <Image
          src={ImageSource.getAreaImagePath({ image: backgroundImage })}
          alt="Combat background"
          fill
          className="object-cover object-top"
          priority
        />
        
        {/* Semi-transparent overlay for better readability */}
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
      </div>
      
      {/* World Boss HP Bar - positioned at the top center */}
      <div className="absolute top-3 left-1/2 transform -translate-x-1/2 z-20 w-3/4 max-w-md">
        <div className="flex justify-between text-sm mb-1 text-amber-200">
          <span>{boss.name}</span>
          <span>{currentHp.toLocaleString()} / {boss.total_hitpoints.toLocaleString()}</span>
        </div>
        <div className="h-4 bg-amber-900 rounded-md overflow-hidden border border-amber-700">
          <div 
            className="h-full bg-red-600" 
            style={{ width: `${Math.max(0, Math.min(100, hpPercentage))}%` }}
          ></div>
        </div>
      </div>
      
      {/* Fighters positioned directly on top of the background */}
      <div className="absolute bottom-2 inset-x-0 z-20 flex justify-around items-end px-3 md:px-6">
        {/* Character - Left Side (no HP bar displayed) */}
        <div className="self-end">
          <FighterDisplay 
            name={character.name}
            image={ImageSource.getCharacterImagePath(character.class)}
            imageAlt={character.name}
            currentHp={character.current_hitpoints}
            maxHp={getTotalMaxHitpoints(character)}
            effects={[]}
            isWorldBoss={true}
            className=""
          />
        </div>
        
        {/* World Boss - Right Side (HP bar already shown at top) */}
        <div className="self-end">
          <FighterDisplay 
            name={boss.name}
            image={ImageSource.getBossImagePath(boss)}
            imageAlt={boss.name}
            currentHp={currentHp}
            maxHp={boss.total_hitpoints}
            scale={boss.scale || 4.0}
            isEnemy={true}
            isWorldBoss={true}
            effects={[]}
            className=""
          />
        </div>
      </div>
      
      {((boss.status?.current_hitpoints || 0) <= 0 || (boss.status?.total_damage_received || 0) >= (boss.status?.total_hitpoints || 0)) && (
        <div className="absolute inset-0 flex items-center justify-center z-30">
          <div className="bg-green-800 bg-opacity-70 text-green-100 py-3 px-6 rounded-md text-xl font-bold animate-pulse">
            Boss Defeated!
          </div>
        </div>
      )}
      
      {/* Floating Damage Numbers Container */}
      <div id="worldboss-damage-numbers" className="absolute inset-0 pointer-events-none z-30">
        {/* Damage numbers will be added dynamically via JavaScript */}
      </div>
    </div>
  );
}
