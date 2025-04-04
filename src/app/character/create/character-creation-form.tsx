'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { CHARACTER_CLASSES, ROUTES } from '@/lib/constants';
import { CLASS_BASE_STATS, generateRandomName } from '@/lib/utils';
import { createCharacter } from '@/app/actions/character';

// Class info modal component
function ClassInfoModal({ 
  characterClass, 
  onClose 
}: { 
  characterClass: string; 
  onClose: () => void 
}) {
  const classDescriptions = {
    'Warrior': 'Warriors excel in strength and combat prowess. They can withstand more damage and are skilled with all types of weapons.',
    'Wizard': 'Wizards harness magical powers and have high intelligence. They can cast powerful spells and identify magical items.',
    'Thief': 'Thieves are agile and lucky. They excel at finding hidden treasures and can avoid traps with their quick reflexes.',
    'Ranger': 'Rangers are balanced adventurers with good agility. They are skilled trackers and have knowledge of the wilderness.',
    'Cleric': 'Clerics are devoted healers with high intelligence and luck. They can restore health and provide protective blessings to themselves.'
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn">
      <div className="bg-gray-800 p-3 sm:p-4 md:p-6 rounded-lg max-w-md w-full mx-2 sm:mx-4">
        <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-2 sm:mb-3 md:mb-4">{characterClass}</h3>
        <p className="text-gray-300 text-sm sm:text-base mb-3 sm:mb-4 md:mb-6">
          {classDescriptions[characterClass as keyof typeof classDescriptions]}
        </p>
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

export default function CharacterCreationForm() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [infoModalClass, setInfoModalClass] = useState<string | null>(null);

  const handleRandomName = () => {
    setName(generateRandomName());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError('Please enter a character name');
      return;
    }
    
    if (!selectedClass) {
      setError('Please select a character class');
      return;
    }
    
    setIsCreating(true);
    setError(null);
    
    try {
      const result = await createCharacter({
        name: name.trim(),
        characterClass: selectedClass as 'Warrior' | 'Wizard' | 'Thief' | 'Ranger' | 'Cleric'
      });
      
      if (result.success) {
        router.push(ROUTES.ADVENTURE);
      } else {
        setError(result.error || 'Failed to create character');
        setIsCreating(false);
      }
    } catch (err) {
      console.error('Error creating character:', err);
      setError('An unexpected error occurred');
      setIsCreating(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Character Name */}
      <div className="space-y-1 sm:space-y-2">
        <label htmlFor="name" className="block text-lg sm:text-xl md:text-2xl">
          Character Name
        </label>
        <div className="flex gap-1 sm:gap-2">
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-2 sm:px-3 md:px-4 py-1 sm:py-2 bg-gray-800 border-2 border-gray-600 rounded-md text-base sm:text-lg md:text-xl"
            placeholder="Enter name"
            maxLength={20}
          />
          <button
            type="button"
            onClick={handleRandomName}
            className="pixel-button bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-sm sm:text-base"
          >
            Random
          </button>
        </div>
      </div>

      {/* Character Class Selection */}
      <div className="space-y-2 sm:space-y-3 md:space-y-4">
        <h2 className="text-lg sm:text-xl md:text-2xl">Choose Your Class</h2>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {CHARACTER_CLASSES.map((characterClass) => (
            <div
              key={characterClass}
              className={`pixel-border p-4 cursor-pointer transition-all ${
                selectedClass === characterClass
                  ? 'bg-purple-900 border-purple-400'
                  : 'bg-gray-800 hover:bg-gray-700'
              }`}
              onClick={() => setSelectedClass(characterClass)}
            >
              <div className="flex flex-col items-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 mb-1 sm:mb-2 relative">
                {/* Placeholder for character class image */}
                <div className="absolute inset-0 bg-gray-600 rounded-full flex items-center justify-center text-xl sm:text-2xl md:text-3xl">
                  {characterClass.charAt(0)}
                </div>
                
                {/* Info button */}
                <button 
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setInfoModalClass(characterClass);
                  }}
                  className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs sm:text-sm hover:bg-blue-500 focus:outline-none"
                >
                  i
                </button>
              </div>
              <h3 className="text-base sm:text-lg md:text-xl font-bold mb-1 sm:mb-2">{characterClass}</h3>
              
              <div className="w-full space-y-0.5 sm:space-y-1 text-xs sm:text-sm">
                  <div className="flex justify-between">
                    <span>STR:</span>
                    <span>{CLASS_BASE_STATS[characterClass as keyof typeof CLASS_BASE_STATS].strength}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>INT:</span>
                    <span>{CLASS_BASE_STATS[characterClass as keyof typeof CLASS_BASE_STATS].intelligence}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>AGI:</span>
                    <span>{CLASS_BASE_STATS[characterClass as keyof typeof CLASS_BASE_STATS].agility}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>LCK:</span>
                    <span>{CLASS_BASE_STATS[characterClass as keyof typeof CLASS_BASE_STATS].luck}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Class Info Modal */}
      {infoModalClass && (
        <ClassInfoModal 
          characterClass={infoModalClass} 
          onClose={() => setInfoModalClass(null)} 
        />
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-900 border border-red-500 p-3 rounded-md text-center">
          {error}
        </div>
      )}

      {/* Submit Button */}
      <div className="flex justify-center">
        <button
          type="submit"
          disabled={isCreating}
          className="pixel-button text-base sm:text-xl md:text-2xl py-2 sm:py-3 px-6 sm:px-8 disabled:opacity-50"
        >
          {isCreating ? 'Creating...' : 'Begin Adventure'}
        </button>
      </div>
    </form>
  );
}
