'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { CHARACTER_CLASSES, ROUTES } from '@/lib/constants';
import { generateRandomName, CLASS_BASE_STATS } from '@/lib/utils';
import { createCharacter } from '@/app/actions/character';
import CharacterClassCard from '@/components/character/character-class-card';
import CharacterClassInfoModal from '@/components/character/character-class-info-modal';

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

  // Reference to the name input field
  const nameInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError('Please enter a character name');
      nameInputRef.current?.focus();
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
        
        // If the error is about name already taken, focus the name input
        if (result.error?.includes('name already taken')) {
          nameInputRef.current?.focus();
        }
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
            ref={nameInputRef}
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
            <CharacterClassCard
              key={characterClass}
              characterClass={characterClass}
              isSelected={selectedClass === characterClass}
              onSelect={() => setSelectedClass(characterClass)}
              onInfoClick={() => setInfoModalClass(characterClass)}
            />
          ))}
        </div>
      </div>

      {/* Class Info Modal */}
      {infoModalClass && (
        <CharacterClassInfoModal 
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
