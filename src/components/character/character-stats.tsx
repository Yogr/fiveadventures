'use client';

import { useState } from 'react';
import Image from 'next/image';
import type { Character } from '@/lib/types';
import DungeonKeyDisplay from './dungeon-key-display';
import { getRequiredExperience, getLevelFromExperience } from '@/lib/utils';
import { formatNumber } from '@/lib/utils';
import { getTotalMaxHitpoints, getTotalMaxEnergy } from '@/lib/character-utils';
import AdventureTracker from '@/components/adventure/adventure-tracker';
import CharacterDetailsModal from './character-details-modal';
import { MAX_ADVENTURES_PER_DAY } from '@/lib/constants';
import { useAudio } from '@/lib/audio-utils';

interface CharacterStatsProps {
  character: Character;
}

export default function CharacterStats({ character }: CharacterStatsProps) {
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const { playInventoryOpenSound } = useAudio(); // Assuming you have a custom hook for audio
  
  const level = getLevelFromExperience(character.experience);
  const nextLevelExp = getRequiredExperience(level + 1);
  const currentLevelExp = getRequiredExperience(level);
  const expProgress = nextLevelExp > currentLevelExp 
    ? ((character.experience - currentLevelExp) / (nextLevelExp - currentLevelExp)) * 100
    : 100;
  
  const totalMaxHitpoints = getTotalMaxHitpoints(character);
  const totalMaxEnergy = getTotalMaxEnergy(character);
  
  const hpPercentage = (character.current_hitpoints / totalMaxHitpoints) * 100;
  const energyPercentage = (character.current_energy / totalMaxEnergy) * 100;
  
  return (
    <div className="bg-gradient-to-b from-yellow-950 to-black px-2 pt-2 pb-1 md:px-3 md:pt-3 md:pb-1 rounded-lg relative border-2 border-amber-900 border-t-amber-700 border-l-amber-700">
      <div className="flex justify-around items-start">
        {/* Left side with avatar and name */}
        <div className="flex flex-col items-center mr-2">
          {/* Character name */}
          <h3 className="text-base md:text-lg font-medium text-amber-200 mb-1 self-start">{character.name}</h3>
          
          <button 
            onClick={() => { playInventoryOpenSound(); setShowDetailsModal(true) }}
            className="h-12 w-12 flex items-center justify-center self-center"
            aria-label="Character"
          >
            {/* Character avatar */}
            <div className="w-12 h-12 md:w-14 md:h-14 rounded-full flex-shrink-0 border border-amber-700 bg-stone-800 overflow-hidden relative">
              <Image
                src={`/image/characters/${character.class.toLowerCase()}.png`}
                alt={`${character.class} character portrait`}
                fill
                sizes="(max-width: 768px) 48px, 56px"
                className="object-cover"
                priority
              />
            </div>
          </button>
        </div>
        
        {/* Middle section with bars */}
        <div className="flex-grow flex flex-col justify-center max-w-[65%]">
          {/* Level and class info above bars */}
          <div className="mb-0.5">
            <span className="text-purple-300">Lv. {level}</span> <span className="text-amber-300">{character.class}</span>
          </div>
          
          {/* HP Bar - combined label and bar */}
          <div className="mb-1">
            <div className="flex items-center h-3.5 md:h-4 relative">
              <span className="absolute left-1 z-10 text-white font-medium">HP</span>
              <span className="absolute right-1 z-10 text-white font-medium">
                {formatNumber(character.current_hitpoints)}/{formatNumber(totalMaxHitpoints)}
              </span>
              <div className="w-full h-full bg-amber-900 rounded-md overflow-hidden">
                <div 
                  className="h-full bg-red-600" 
                  style={{ width: `${Math.max(0, Math.min(100, hpPercentage))}%` }}
                ></div>
              </div>
            </div>
          </div>
          
          {/* Energy Bar - combined label and bar */}
          <div className="mb-1">
            <div className="flex items-center h-3.5 md:h-4 relative">
              <span className="absolute left-1 z-10 text-white font-medium">MP</span>
              <span className="absolute right-1 z-10 text-white font-medium">
                {formatNumber(character.current_energy)}/{formatNumber(totalMaxEnergy)}
              </span>
              <div className="w-full h-full bg-amber-900 rounded-md overflow-hidden">
                <div 
                  className="h-full bg-blue-600" 
                  style={{ width: `${Math.max(0, Math.min(100, energyPercentage))}%` }}
                ></div>
              </div>
            </div>
          </div>
          
          {/* XP Bar - combined label and bar */}
          <div className="mb-1">
            <div className="flex items-center h-3.5 md:h-4 relative">
              <span className="absolute left-1 z-10 text-white font-medium">XP</span>
              <span className="absolute right-1 z-10 text-white font-medium">
                {Math.floor(expProgress)}%
              </span>
              <div className="w-full h-full bg-amber-900 rounded-md overflow-hidden">
                <div 
                  className="h-full bg-green-600" 
                  style={{ width: `${Math.max(0, Math.min(100, expProgress))}%` }}
                ></div>
              </div>
            </div>
          </div>
          
          {/* Adventure Tracker - placed right after XP bar */}
          <div className="flex justify-center scale-75 -mb-4">
            <AdventureTracker 
              totalAdventures={MAX_ADVENTURES_PER_DAY} 
              completedAdventures={character.daily_adventure_count} 
            />
          </div>
        </div>
        
        {/* Right side with gold and inventory */}
        <div className="flex flex-col justify-start ml-1">
          {/* Gold display */}
          <div className="bg-amber-900 px-1.5 py-0.5 rounded-md flex items-center mb-1">
            {/* Gold coin placeholder - will be replaced with actual image */}
            <div className="w-4 h-4 mr-1 flex items-center justify-center">
              <Image
                src="/image/ui/coin.png"
                alt="Gold"
                width={16}
                height={16}
                className="object-contain"
              />
            </div>
            <span className="text-yellow-400 font-light">{formatNumber(character.gold)}</span>
          </div>
          
          {/* Dungeon keys display - always show */}
          <div className="bg-amber-900 px-1.5 py-0.5 rounded-md flex items-center mb-1">
            <DungeonKeyDisplay character={character} />
          </div>
          
          {/* Inventory button */}
          <button 
            onClick={() => { playInventoryOpenSound(); setShowDetailsModal(true) }}
            className="h-10 w-10 flex items-center justify-center self-center mt-1"
            aria-label="Inventory"
          >
            <Image
              src="/image/ui/backpack.png"
              alt="Inventory"
              width={64}
              height={64}
              className="object-contain"
            />
          </button>
        </div>
      </div>
      
      {/* Character Details Modal */}
      <CharacterDetailsModal
        character={character}
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
      />
    </div>
  );
}
