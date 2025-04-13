'use client';

import { useState } from 'react';
import Image from 'next/image';
import type { Character } from '@/lib/types';
import { getRequiredExperience, getLevelFromExperience } from '@/lib/utils';
import { formatNumber } from '@/lib/utils';
import AdventureTracker from '@/components/adventure/adventure-tracker';
import CharacterDetailsModal from './character-details-modal';
import { MAX_ADVENTURES_PER_DAY } from '@/lib/constants';

interface CharacterStatsProps {
  character: Character;
}

export default function CharacterStats({ character }: CharacterStatsProps) {
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  
  const level = getLevelFromExperience(character.experience);
  const nextLevelExp = getRequiredExperience(level + 1);
  const currentLevelExp = getRequiredExperience(level);
  const expProgress = nextLevelExp > currentLevelExp 
    ? ((character.experience - currentLevelExp) / (nextLevelExp - currentLevelExp)) * 100
    : 100;
  
  const hpPercentage = (character.current_hitpoints / character.max_hitpoints) * 100;
  const energyPercentage = (character.current_energy / character.max_energy) * 100;
  
  return (
    <div className="bg-amber-950 bg-opacity-90 p-2 md:p-3 rounded-lg relative border-2 border-amber-800 border-t-amber-700 border-l-amber-700">
      <div className="flex items-start">
        {/* Left side with avatar and name */}
        <div className="flex flex-col items-center mr-2">
          {/* Character name */}
          <h3 className="text-base md:text-lg font-bold text-amber-200 mb-1 self-start">{character.name}</h3>
          
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
        </div>
        
        {/* Middle section with bars */}
        <div className="flex-grow flex flex-col justify-center max-w-[65%]">
          {/* Level and class info above bars */}
          <div className="text-xs md:text-sm mb-0.5">
            <span className="text-purple-300">Lv. {level}</span> <span className="text-amber-300">{character.class}</span>
          </div>
          
          {/* HP Bar - combined label and bar */}
          <div className="mb-1">
            <div className="flex items-center h-3.5 md:h-4 relative">
              <span className="absolute left-1 text-xs z-10 text-white font-medium">HP</span>
              <span className="absolute right-1 text-xs md:text-sm z-10 text-white font-medium">
                {formatNumber(character.current_hitpoints)}/{formatNumber(character.max_hitpoints)}
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
              <span className="absolute left-1 text-xs z-10 text-white font-medium">MP</span>
              <span className="absolute right-1 text-xs md:text-sm z-10 text-white font-medium">
                {formatNumber(character.current_energy)}/{formatNumber(character.max_energy)}
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
          <div>
            <div className="flex items-center h-3.5 md:h-4 relative">
              <span className="absolute left-1 text-xs z-10 text-white font-medium">XP</span>
              <span className="absolute right-1 text-xs md:text-sm z-10 text-white font-medium">
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
        </div>
        
        {/* Right side with gold and inventory */}
        <div className="flex flex-col justify-center ml-1">
          <div className="bg-amber-900 px-1.5 py-1 rounded-md flex items-center mb-1">
            {/* Gold coin placeholder - will be replaced with actual image */}
            <div className="w-4 h-4 bg-yellow-500 rounded-full mr-1 flex items-center justify-center text-xs">
              $
            </div>
            <span className="text-yellow-400 text-xs">{formatNumber(character.gold)}</span>
          </div>
          
          {/* Inventory button */}
          <button 
            onClick={() => setShowDetailsModal(true)}
            className="h-5 w-5 bg-amber-800 hover:bg-amber-700 active:bg-amber-900 rounded-md flex items-center justify-center self-center"
            aria-label="Inventory"
          >
            {/* Inventory icon placeholder - will be replaced with actual image */}
            <div className="w-4 h-4 flex items-center justify-center text-amber-200">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                <path d="M3.375 3C2.339 3 1.5 3.84 1.5 4.875v.75c0 1.036.84 1.875 1.875 1.875h17.25c1.035 0 1.875-.84 1.875-1.875v-.75C22.5 3.839 21.66 3 20.625 3H3.375z" />
                <path fillRule="evenodd" d="M3.087 9l.54 9.176A3 3 0 006.62 21h10.757a3 3 0 002.995-2.824L20.913 9H3.087zm6.163 3.75A.75.75 0 0110 12h4a.75.75 0 010 1.5h-4a.75.75 0 01-.75-.75z" clipRule="evenodd" />
              </svg>
            </div>
          </button>
        </div>
      </div>
      
      {/* Adventure Tracker */}
      <div className="flex justify-center scale-75 origin-top -mb-6">
        <AdventureTracker 
          totalAdventures={MAX_ADVENTURES_PER_DAY} 
          completedAdventures={character.daily_adventure_count} 
        />
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
