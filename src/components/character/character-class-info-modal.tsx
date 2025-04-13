'use client';

import React from 'react';
import Image from 'next/image';
import { CLASS_BASE_STATS } from '@/lib/utils';

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
    'Cleric': 'Clerics are devoted healers with high intelligence and luck. They can restore health and provide protective blessings to themselves.'
  };

  const stats = CLASS_BASE_STATS[characterClass as keyof typeof CLASS_BASE_STATS];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 animate-fadeIn p-3">
      <div className="bg-amber-950 p-3 md:p-4 rounded-lg max-w-xs md:max-w-sm w-full relative overflow-hidden">
        {/* Character image in background */}
        <div className="absolute top-0 right-0 w-40 h-40 md:w-48 md:h-48 opacity-50 -z-10">
          <Image
            src={`/image/characters/${characterClass.toLowerCase()}.png`}
            alt={characterClass}
            width={160}
            height={160}
            className="object-contain"
            priority
          />
        </div>
        
        {/* Content container with higher z-index */}
        <div className="relative z-10">
          <h3 className="text-lg md:text-xl font-bold mb-2">{characterClass}</h3>
          
          <p className="text-amber-200 text-sm md:text-base mb-2">
            {classDescriptions[characterClass as keyof typeof classDescriptions]}
          </p>
          
          {/* Stats Section */}
          <div className="bg-amber-900 p-2 rounded-md mb-3 border border-amber-800">
            <h4 className="text-base md:text-lg font-semibold mb-1">Base Stats</h4>
            <div className="grid grid-cols-2 gap-1 text-sm md:text-base">
              <div className="flex items-center">
                <span className="font-medium">Strength:</span>
                <span className="text-yellow-300 ml-0.5">{stats.strength}</span>
              </div>
              <div className="flex items-center">
                <span className="font-medium">Intelligence:</span>
                <span className="text-blue-300 ml-0.5">{stats.intelligence}</span>
              </div>
              <div className="flex items-center">
                <span className="font-medium">Agility:</span>
                <span className="text-green-300 ml-0.5">{stats.agility}</span>
              </div>
              <div className="flex items-center">
                <span className="font-medium">Luck:</span>
                <span className="text-purple-300 ml-0.5">{stats.luck}</span>
              </div>
              <div className="flex items-center">
                <span className="font-medium">HP:</span>
                <span className="text-red-300 ml-0.5">{stats.hitpoints}</span>
              </div>
              <div className="flex items-center">
                <span className="font-medium">Energy:</span>
                <span className="text-blue-300 ml-0.5">{stats.energy}</span>
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
    </div>
  );
}
