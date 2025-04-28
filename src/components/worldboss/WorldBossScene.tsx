'use client';

import React from 'react';
import FighterDisplay from '../combat/fighter-display';
import CombatMessagePanel from '../combat/CombatMessagePanel';
import StatusBar from '../combat/status-bar';
import type { Character, WorldBoss } from '@/lib/types';
import { getTotalMaxHitpoints } from '@/lib/character-utils';

interface WorldBossSceneProps {
  character: Character;
  boss: WorldBoss;
  combatLog?: string[];
  areaImage?: string;
}

export default function WorldBossScene({
  character,
  boss,
  combatLog = [],
  areaImage = 'abyssal-realm' // Default background
}: WorldBossSceneProps) {
  
  // Calculate HP percentage for the boss
  const hpPercentage = (boss.current_hitpoints / boss.total_hitpoints) * 100;
  
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
        <img
          src={`/image/area/${backgroundImage}.png`}
          alt="Combat background"
          className="w-full h-full object-cover object-top"
          style={{ filter: 'blur(1px)' }}
        />
        
        {/* Semi-transparent overlay for better readability */}
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
      </div>
      
      {/* Combat log messages overlay at the top (if enabled) */}
      {combatLog.length > 0 && (
        <CombatMessagePanel messages={combatLog} />
      )}
      
      {/* World Boss HP Bar - positioned at the top center */}
      <div className="absolute top-3 left-1/2 transform -translate-x-1/2 z-20 w-3/4 max-w-md">
        <div className="flex justify-between text-sm mb-1 text-amber-200">
          <span className="font-bold">{boss.name}</span>
          <span>{boss.current_hitpoints.toLocaleString()} / {boss.total_hitpoints.toLocaleString()}</span>
        </div>
        <div className="h-4 bg-amber-900 rounded-md overflow-hidden border border-amber-700">
          <div 
            className="h-full bg-red-600" 
            style={{ width: `${Math.max(0, Math.min(100, hpPercentage))}%` }}
          ></div>
        </div>
      </div>
      
      {/* Fighters positioned directly on top of the background */}
      <div className="absolute bottom-2 inset-x-0 z-20 flex justify-between items-end px-3 md:px-6">
        {/* Character - Left Side (no HP bar displayed) */}
        <div className="self-end">
          <FighterDisplay 
            name={character.name}
            image={`/image/characters/${character.class.toLowerCase()}.png`}
            imageAlt={character.name}
            currentHp={character.current_hitpoints}
            maxHp={getTotalMaxHitpoints(character)}
            effects={[]}
            // Hide status bar for the character
            className="status-bar-hidden"
          />
        </div>
        
        {/* World Boss - Right Side (HP bar already shown at top) */}
        <div className="self-end">
          <FighterDisplay 
            name={boss.name}
            image={`/image/boss/${boss.image_url}.png`}
            imageAlt={boss.name}
            currentHp={boss.current_hitpoints}
            maxHp={boss.total_hitpoints}
            scale={boss.scale || 4.0}
            isEnemy={true}
            effects={[]}
            // Hide status bar since we're showing it at the top
            className="status-bar-hidden"
          />
        </div>
      </div>
      
      {/* Defeated message (if applicable) */}
      {boss.is_defeated && (
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
