'use client';

import React from 'react';
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn">
      <div className="bg-gray-800 p-3 sm:p-4 md:p-6 rounded-lg max-w-md w-full mx-2 sm:mx-4">
        <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-2 sm:mb-3 md:mb-4">{characterClass}</h3>
        
        <p className="text-gray-300 text-sm sm:text-base mb-3 sm:mb-4">
          {classDescriptions[characterClass as keyof typeof classDescriptions]}
        </p>
        
        {/* Stats Section */}
        <div className="bg-gray-700 p-3 rounded-md mb-4">
          <h4 className="text-base sm:text-lg font-semibold mb-2">Base Stats</h4>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex justify-between">
              <span className="font-medium">Strength:</span>
              <span className="text-yellow-300">{stats.strength}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Intelligence:</span>
              <span className="text-blue-300">{stats.intelligence}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Agility:</span>
              <span className="text-green-300">{stats.agility}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Luck:</span>
              <span className="text-purple-300">{stats.luck}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">HP:</span>
              <span className="text-red-300">{stats.hitpoints}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Energy:</span>
              <span className="text-blue-300">{stats.energy}</span>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end">
          <button 
            onClick={onClose}
            className="pixel-button text-sm sm:text-base bg-blue-600 hover:bg-blue-500 active:bg-blue-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
