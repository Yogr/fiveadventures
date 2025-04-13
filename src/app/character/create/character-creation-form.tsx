'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { CHARACTER_CLASSES, ROUTES } from '@/lib/constants';
import { generateRandomName } from '@/lib/utils';
import { createCharacter, setCharacterIdCookie } from '@/app/actions/character';
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
    
    // Set creating state to true and clear any previous errors
    setIsCreating(true);
    setError(null);
    
    try {
      const result = await createCharacter({
        name: name.trim(),
        characterClass: selectedClass as 'Warrior' | 'Wizard' | 'Thief' | 'Ranger' | 'Cleric'
      });
      
      if (result.success && result.data?.characterId) {
        // Character created successfully, now set the cookie and redirect
        console.log('Character created successfully:', result.data.characterId);

        try {
          // Add character ID to cookies using server action
          await setCharacterIdCookie(result.data.characterId);
          
          // Keep isCreating true during redirect
          router.push(ROUTES.ADVENTURE);
        } catch (cookieErr) {
          console.error('Error setting character cookie:', cookieErr);
          setError('Failed to save character data');
          setIsCreating(false);
        }
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
    <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
      {/* Character Name */}
      <div className="space-y-1">
        <label htmlFor="name" className="block text-base md:text-lg text-amber-200">
          Character Name
        </label>
        <div className="flex gap-1">
          <input
            type="text"
            id="name"
            ref={nameInputRef}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-2 py-1 bg-amber-900 border border-amber-700 rounded-md text-sm md:text-base"
            placeholder="Enter name"
            maxLength={20}
          />
          <button
            type="button"
            onClick={handleRandomName}
            className="pixel-button bg-amber-800 hover:bg-amber-700 active:bg-amber-900 text-xs md:text-sm px-2 py-1"
          >
            Random
          </button>
        </div>
      </div>

      {/* Character Class Selection */}
      <div className="space-y-2">
        <h2 className="text-base md:text-lg text-amber-200">Choose Your Class</h2>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
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
        <div className="bg-red-900 border border-red-500 p-2 rounded-md text-center text-sm">
          {error}
        </div>
      )}

      {/* Submit Button */}
      <div className="flex justify-center mt-4">
        <button
          type="submit"
          disabled={isCreating}
          className={`pixel-button text-sm md:text-base py-1 md:py-2 px-4 md:px-6 
            ${isCreating 
              ? 'bg-gray-600 cursor-not-allowed opacity-70' 
              : 'bg-amber-800 hover:bg-amber-700 active:bg-amber-900'
            } transition-all duration-200`}
        >
          {isCreating ? 'Creating...' : 'Begin Adventure'}
        </button>
      </div>
    </form>
  );
}
