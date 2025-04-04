'use client';

import { useState } from 'react';
import type { Character } from '@/lib/types';
import { getRequiredExperience, getLevelFromExperience } from '@/lib/utils';
import { formatNumber } from '@/lib/utils';

interface CharacterStatsProps {
  character: Character;
}

export default function CharacterStats({ character }: CharacterStatsProps) {
  const [showDetailedStats, setShowDetailedStats] = useState(false);
  
  const level = getLevelFromExperience(character.experience);
  const nextLevelExp = getRequiredExperience(level + 1);
  const currentLevelExp = getRequiredExperience(level);
  const expProgress = nextLevelExp > currentLevelExp 
    ? ((character.experience - currentLevelExp) / (nextLevelExp - currentLevelExp)) * 100
    : 100;
  
  const hpPercentage = (character.current_hitpoints / character.max_hitpoints) * 100;
  const energyPercentage = (character.current_energy / character.max_energy) * 100;
  
  return (
    <div className="bg-gray-800 p-2 sm:p-3 md:p-4 rounded-md relative">
      <div className="flex justify-between items-center mb-2 sm:mb-3">
        <h3 className="text-lg sm:text-xl md:text-2xl font-bold">{character.name}</h3>
        <div className="text-sm sm:text-base md:text-lg">
          <span className="text-purple-400">Lv. {level}</span> {character.class}
        </div>
      </div>
      
      <div className="flex flex-row gap-2 sm:gap-3 mb-2 sm:mb-3">
        {/* Character avatar placeholder */}
        <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-gray-700 rounded-full flex items-center justify-center flex-shrink-0">
          <span className="text-xl sm:text-2xl md:text-3xl">{character.name.charAt(0)}</span>
        </div>
        
        <div className="flex-grow flex flex-col justify-center">
          {/* HP Bar */}
          <div className="mb-2">
            <div className="flex justify-between text-xs sm:text-sm mb-1">
              <span>HP</span>
              <span>{character.current_hitpoints} / {character.max_hitpoints}</span>
            </div>
            <div className="stat-bar hp-bar">
              <div 
                className="stat-bar-fill" 
                style={{ width: `${Math.max(0, Math.min(100, hpPercentage))}%` }}
              ></div>
              <div className="stat-bar-text">
                {formatNumber(character.current_hitpoints)}/{formatNumber(character.max_hitpoints)}
              </div>
            </div>
          </div>
          
          {/* Energy Bar */}
          <div className="mb-0">
            <div className="flex justify-between text-xs sm:text-sm mb-1">
              <span>Energy</span>
              <span>{character.current_energy} / {character.max_energy}</span>
            </div>
            <div className="stat-bar energy-bar">
              <div 
                className="stat-bar-fill" 
                style={{ width: `${Math.max(0, Math.min(100, energyPercentage))}%` }}
              ></div>
              <div className="stat-bar-text">
                {formatNumber(character.current_energy)}/{formatNumber(character.max_energy)}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* XP Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-1">
          <span>XP</span>
          <span>{formatNumber(character.experience - currentLevelExp)} / {formatNumber(nextLevelExp - currentLevelExp)}</span>
        </div>
        <div className="stat-bar xp-bar">
          <div 
            className="stat-bar-fill" 
            style={{ width: `${Math.max(0, Math.min(100, expProgress))}%` }}
          ></div>
          <div className="stat-bar-text">
            {Math.floor(expProgress)}%
          </div>
        </div>
      </div>
      
      {/* Gold and Inventory Button */}
      <div className="flex gap-2 items-center">
        <div className="bg-gray-700 p-1 sm:p-2 rounded-md text-sm sm:text-base flex-grow">
          <div className="flex justify-between">
            <span>Gold</span>
            <span className="text-yellow-400">{formatNumber(character.gold)}</span>
          </div>
        </div>
        <button 
          onClick={() => setShowDetailedStats(!showDetailedStats)}
          className="pixel-button bg-yellow-800 hover:bg-yellow-700 active:bg-yellow-900 text-sm"
        >
          Inventory
        </button>
      </div>
      
      {/* Detailed Stats Popup */}
      {showDetailedStats && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-4 rounded-md max-w-md w-full animate-fadeIn">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Detailed Stats</h3>
              <button 
                onClick={() => setShowDetailedStats(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            
            {/* Character Stats */}
            <div className="mb-4">
              <h4 className="text-lg mb-2">Attributes</h4>
              <div className="grid grid-cols-2 gap-2 text-sm sm:text-base">
                <div className="bg-gray-700 p-2 rounded-md">
                  <div className="flex justify-between">
                    <span>STR</span>
                    <span className="text-red-400">{character.strength}</span>
                  </div>
                </div>
                <div className="bg-gray-700 p-2 rounded-md">
                  <div className="flex justify-between">
                    <span>INT</span>
                    <span className="text-blue-400">{character.intelligence}</span>
                  </div>
                </div>
                <div className="bg-gray-700 p-2 rounded-md">
                  <div className="flex justify-between">
                    <span>AGI</span>
                    <span className="text-green-400">{character.agility}</span>
                  </div>
                </div>
                <div className="bg-gray-700 p-2 rounded-md">
                  <div className="flex justify-between">
                    <span>LCK</span>
                    <span className="text-yellow-400">{character.luck}</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Inventory Placeholder */}
            <div>
              <h4 className="text-lg mb-2">Inventory</h4>
              <div className="bg-gray-700 p-3 rounded-md text-center">
                <p>Inventory items will be displayed here</p>
              </div>
            </div>
            
            <div className="mt-4 text-center">
              <button 
                onClick={() => setShowDetailedStats(false)}
                className="pixel-button"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
