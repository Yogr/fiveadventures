'use client';

import React from 'react';
import Image from 'next/image';
import { CLASS_BASE_STATS } from '@/lib/utils';
import { STAT_ICONS, STAT_COLORS } from '@/lib/stat-icons';
import { ImageSource } from '@/lib/image-source';

interface CharacterClassInfoModalProps {
  characterClass: string;
  onClose: () => void;
}

export default function CharacterClassInfoModal({
  characterClass,
  onClose
}: CharacterClassInfoModalProps) {
  const classDescriptions = {
    'Warrior': 'Warriors excel in strength and combat prowess. They can withstand more damage and are skilled with all types of weapons.',
    'Wizard': 'Wizards harness magical powers and have high intelligence. They can cast powerful spells and identify magical items.',
    'Thief': 'Thieves are agile and lucky. They excel at finding hidden treasures and can avoid traps with their quick reflexes.',
    'Ranger': 'Rangers are balanced adventurers with good agility. They are skilled trackers and have knowledge of the wilderness.',
    'Cleric': 'Clerics are devoted healers with high wisdom. They can restore health and provide protective blessings to themselves.'
  };

  const stats = CLASS_BASE_STATS[characterClass as keyof typeof CLASS_BASE_STATS];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 animate-fadeIn p-3">
      <div className="bg-amber-950 p-3 md:p-4 rounded-lg max-w-xs md:max-w-sm w-full relative overflow-hidden">
        <div className="flex flex-row">
          {/* Class image */}
          <div className="flex-shrink-0 mr-3">
            <div className="w-24 h-24 md:w-32 md:h-32 relative rounded-lg overflow-hidden border-2 border-amber-700 bg-amber-900">
              <Image
                src={ImageSource.getCharacterImagePath(characterClass)}
                alt={characterClass}
                fill
                sizes="(max-width: 768px) 96px, 128px"
                className="object-cover"
                priority
              />
            </div>
          </div>
          
          {/* Content container */}
          <div className="flex-1">
            <h3 className="text-lg md:text-xl font-bold mb-2">{characterClass}</h3>
            
            <p className="text-amber-200 text-sm md:text-base mb-2">
              {classDescriptions[characterClass as keyof typeof classDescriptions]}
            </p>
          </div>
        </div>
        
        {/* Stats Section */}
        <div className="bg-amber-900 p-2 rounded-md mb-3 border border-amber-800 mt-3">
          <h4 className="text-base md:text-lg font-semibold mb-1">Base Stats</h4>
          <div className="grid grid-cols-2 gap-2 text-sm md:text-base">
            <div className="flex items-center">
              {STAT_ICONS.strength && React.createElement(STAT_ICONS.strength, { className: `${STAT_COLORS.strength} mr-1 text-base` })}
              <span className="font-medium">Strength:</span>
              <span className={`${STAT_COLORS.strength} ml-1`}>{stats.strength}</span>
            </div>
            <div className="flex items-center">
              {STAT_ICONS.intelligence && React.createElement(STAT_ICONS.intelligence, { className: `${STAT_COLORS.intelligence} mr-1 text-base` })}
              <span className="font-medium">Intelligence:</span>
              <span className={`${STAT_COLORS.intelligence} ml-1`}>{stats.intelligence}</span>
            </div>
            <div className="flex items-center">
              {STAT_ICONS.wisdom && React.createElement(STAT_ICONS.wisdom, { className: `${STAT_COLORS.wisdom} mr-1 text-base` })}
              <span className="font-medium">Wisdom:</span>
              <span className={`${STAT_COLORS.wisdom} ml-1`}>{stats.wisdom}</span>
            </div>
            <div className="flex items-center">
              {STAT_ICONS.agility && React.createElement(STAT_ICONS.agility, { className: `${STAT_COLORS.agility} mr-1 text-base` })}
              <span className="font-medium">Agility:</span>
              <span className={`${STAT_COLORS.agility} ml-1`}>{stats.agility}</span>
            </div>
            <div className="flex items-center">
              {STAT_ICONS.luck && React.createElement(STAT_ICONS.luck, { className: `${STAT_COLORS.luck} mr-1 text-base` })}
              <span className="font-medium">Luck:</span>
              <span className={`${STAT_COLORS.luck} ml-1`}>{stats.luck}</span>
            </div>
            <div className="flex items-center">
              <span className="font-medium">HP:</span>
              <span className="text-red-400 ml-1">{stats.hitpoints}</span>
            </div>
            <div className="flex items-center">
              <span className="font-medium">Energy:</span>
              <span className="text-blue-400 ml-1">{stats.energy}</span>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end">
          <button 
            onClick={onClose}
            className="pixel-button text-xs md:text-sm bg-amber-800 hover:bg-amber-700 active:bg-amber-900 px-3 py-1"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
