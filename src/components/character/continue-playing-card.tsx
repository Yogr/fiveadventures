'use client';

import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/lib/constants';
import type { Character } from '@/lib/types';

interface ContinuePlayingCardProps {
  character: Character;
}

export default function ContinuePlayingCard({ character }: ContinuePlayingCardProps) {
  const router = useRouter();
  
  const handleContinuePlaying = () => {
    router.push(ROUTES.ADVENTURE);
  };
  
  return (
    <div className="bg-amber-900 bg-opacity-80 rounded-lg p-4 border border-amber-700 transition-all hover:bg-amber-800">
      <div className="flex flex-col items-center space-y-4">
        <h2 className="text-xl text-amber-200 font-semibold">Continue Playing</h2>
        
        {/* Character Image */}
        <div className="relative w-24 h-24 md:w-32 md:h-32">
          <Image
            src={`/image/characters/${character.class.toLowerCase()}.png`}
            alt={character.class}
            fill
            className="object-contain"
            priority
          />
        </div>
        
        {/* Character Details */}
        <div className="text-center">
          <h3 className="text-lg font-semibold text-amber-100">{character.name}</h3>
          <p className="text-amber-200">
            Level {character.level} {character.class}
          </p>
        </div>
        
        {/* Continue Button */}
        <button
          onClick={handleContinuePlaying}
          className="pixel-button bg-amber-800 hover:bg-amber-700 active:bg-amber-900 text-sm md:text-base py-2 px-6 w-full"
        >
          Continue Adventure
        </button>
      </div>
    </div>
  );
}
