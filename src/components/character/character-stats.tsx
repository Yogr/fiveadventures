'use client';

import { Character } from '@/lib/types';
import { getRequiredExperience, getLevelFromExperience } from '@/lib/utils';
import { formatNumber } from '@/lib/utils';

interface CharacterStatsProps {
  character: Character;
}

export default function CharacterStats({ character }: CharacterStatsProps) {
  const level = getLevelFromExperience(character.experience);
  const nextLevelExp = getRequiredExperience(level + 1);
  const currentLevelExp = getRequiredExperience(level);
  const expProgress = nextLevelExp > currentLevelExp 
    ? ((character.experience - currentLevelExp) / (nextLevelExp - currentLevelExp)) * 100
    : 100;
  
  const hpPercentage = (character.current_hitpoints / character.max_hitpoints) * 100;
  const energyPercentage = (character.current_energy / character.max_energy) * 100;
  
  return (
    <div className="bg-gray-800 p-4 rounded-md">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-2xl font-bold">{character.name}</h3>
        <div className="text-xl">
          <span className="text-purple-400">Lv. {level}</span> {character.class}
        </div>
      </div>
      
      {/* Character avatar placeholder */}
      <div className="w-24 h-24 mx-auto mb-4 bg-gray-700 rounded-full flex items-center justify-center">
        <span className="text-3xl">{character.name.charAt(0)}</span>
      </div>
      
      {/* HP Bar */}
      <div className="mb-2">
        <div className="flex justify-between text-sm mb-1">
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
      <div className="mb-2">
        <div className="flex justify-between text-sm mb-1">
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
      
      {/* Stats */}
      <div className="grid grid-cols-2 gap-2 mb-2">
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
      
      {/* Gold */}
      <div className="bg-gray-700 p-2 rounded-md">
        <div className="flex justify-between">
          <span>Gold</span>
          <span className="text-yellow-400">{formatNumber(character.gold)}</span>
        </div>
      </div>
    </div>
  );
}
