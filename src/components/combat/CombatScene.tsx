'use client';

import React, { useEffect } from 'react';
import FighterDisplay from './fighter-display';
import CombatMessagePanel from './CombatMessagePanel';
import Image from 'next/image';
import type { Character, Combat } from '@/lib/types';
import { getTotalMaxHitpoints } from '@/lib/character-utils';
import type { CombatEffect } from '@/lib/effect-utils';

interface CombatSceneProps {
  character: Character;
  combat: Combat;
  characterEffects: CombatEffect[];
  monsterEffects: CombatEffect[];
  combatLog: string[];
  areaImage: string;
  onMonsterInfoClick: () => void;
}

export default function CombatScene({
  character,
  combat,
  characterEffects,
  monsterEffects,
  combatLog,
  areaImage,
  onMonsterInfoClick
}: CombatSceneProps) {

  // Calculate current monster HP
  const monsterCurrentHp = Math.max(0, combat.monster.hitpoints - combat.character_damage_dealt);
  
  return (
    <div className="relative rounded-lg overflow-hidden h-[40vh] md:h-[300px]">
      {/* Main background that covers the full area */}
      <div className="absolute inset-0 z-0">
        <img
          src={`/image/area/${areaImage}.png`}
          alt="Combat background"
          className="w-full h-full object-cover object-top"
          style={{ filter: 'blur(1px)' }}
        />
        
        {/* Semi-transparent overlay for better readability */}
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
      </div>
      
      {/* Combat log messages overlay at the top */}
      <CombatMessagePanel messages={combatLog} />
      
      {/* Fighters positioned directly on top of the background */}
      <div className="absolute bottom-2 inset-x-0 z-20 flex justify-between items-end px-3 md:px-6">
        {/* Character - Left Side */}
        <div className="self-end">
          <FighterDisplay 
            name={character.name}
            image={`/image/characters/${character.class.toLowerCase()}.png`}
            imageAlt={character.name}
            currentHp={character.current_hitpoints}
            maxHp={getTotalMaxHitpoints(character)}
            effects={characterEffects}
          />
        </div>
        
        {/* Monster - Right Side */}
        <div className="self-end">
          <FighterDisplay 
            name={combat.monster.name}
            image={`/image/enemy/${combat.monster.image_url}.png`}
            imageAlt={combat.monster.name}
            currentHp={monsterCurrentHp}
            maxHp={combat.monster.hitpoints}
            scale={combat.monster.scale ? combat.monster.scale : 1.0}
            isEnemy={true}
            isElite={combat.monster.is_elite}
            effects={monsterEffects}
            onInfoClick={onMonsterInfoClick}
          />
        </div>
      </div>
      
      {/* Floating Damage Numbers Container */}
      <div id="damage-numbers" className="absolute inset-0 pointer-events-none z-30">
        {/* Damage numbers will be added dynamically via JavaScript */}
      </div>
    </div>
  );
}
