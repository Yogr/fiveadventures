'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getCharacterForUser } from '@/app/actions/character';
import { ROUTES } from '@/lib/constants';
import CharacterStats from '@/components/character/character-stats';
import AdventureTracker from '@/components/adventure/adventure-tracker';
import LoadingSpinner from '@/components/ui/loading-spinner';
import type { Character } from '@/lib/types';

export default function CharacterPage() {
  const [character, setCharacter] = useState<Character | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadCharacter() {
      setLoading(true);
      setError(null);
      
      try {
        const response = await getCharacterForUser();
        
        if (!response.success || !response.data) {
          setError(response.error || 'Failed to load character data');
          setLoading(false);
          return;
        }
        
        setCharacter(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Unexpected error loading character:', err);
        setError('An unexpected error occurred');
        setLoading(false);
      }
    }
    
    loadCharacter();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !character) {
    return (
      <div className="p-4 bg-red-900/50 text-red-100 rounded-md">
        <h2 className="text-xl font-bold mb-2">Error</h2>
        <p>{error || 'Character not found'}</p>
        <Link href="/" className="inline-flex items-center text-amber-300 hover:text-amber-200 transition-colors mt-4">
          Back
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-amber-100 mb-6">{character.name}</h1>
        
        {/* Character Stats Panel */}
        <div className="mb-6">
          <CharacterStats character={character} />
        </div>
        
        {/* Removed duplicate dungeon progress display */}
        
        {/* Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {/* Adventure Button */}
          <Link 
            href={ROUTES.ADVENTURE}
            className="p-4 bg-gradient-to-br from-red-800 to-red-950 hover:from-red-700 hover:to-red-900 rounded-lg border border-red-700 shadow-md transition-colors"
          >
            <h2 className="text-xl font-semibold text-red-200 mb-2">Adventures</h2>
            <p className="text-red-300">
              Embark on exciting adventures to gain experience, gold, and items.
            </p>
            <div className="mt-3">
              <AdventureTracker completedAdventures={character.daily_adventure_count} totalAdventures={5} />
            </div>
          </Link>
          
          {/* Dungeon Button - Always show even if character doesn't have keys */}
          <Link 
            href={ROUTES.DUNGEON}
            className="p-4 bg-gradient-to-br from-amber-800 to-amber-950 hover:from-amber-700 hover:to-amber-900 rounded-lg border border-amber-700 shadow-md transition-colors"
          >
            <h2 className="text-xl font-semibold text-amber-200 mb-2">Dungeons</h2>
            <p className="text-amber-300">
              Explore dangerous dungeons for greater challenges and rewards.
            </p>
            <div className="mt-3 text-amber-400 font-medium">
              Available Keys: {character.dungeon_keys || 0}
              {character.dungeon_key_parts > 0 && (
                <span className="ml-2 text-sm text-amber-300">
                  (+{character.dungeon_key_parts.toFixed(1)})
                </span>
              )}
            </div>
          </Link>
          
          {/* World Boss Button */}
          <Link 
            href={ROUTES.WORLD_BOSS}
            className="p-4 bg-gradient-to-br from-purple-800 to-purple-950 hover:from-purple-700 hover:to-purple-900 rounded-lg border border-purple-700 shadow-md transition-colors"
          >
            <h2 className="text-xl font-semibold text-purple-200 mb-2">World Boss</h2>
            <p className="text-purple-300">
              Join other players to defeat powerful bosses and earn rare rewards.
            </p>
          </Link>
          
          {/* Shop Button */}
          <Link 
            href={ROUTES.SHOP}
            className="p-4 bg-gradient-to-br from-yellow-800 to-yellow-950 hover:from-yellow-700 hover:to-yellow-900 rounded-lg border border-yellow-700 shadow-md transition-colors"
          >
            <h2 className="text-xl font-semibold text-yellow-200 mb-2">Shop</h2>
            <p className="text-yellow-300">
              Buy and sell items to improve your character and earn gold.
            </p>
          </Link>
        </div>
        
        {/* Get Dungeon Keys - only show if character doesn't have keys */}
        {character.dungeon_keys < 1 && (
          <div className="p-4 bg-amber-900/30 rounded-lg border border-amber-800/50 mb-6">
            <h3 className="text-lg font-semibold text-amber-100 mb-2">How to Get Dungeon Keys</h3>
            <p className="text-amber-200 text-sm">
              Defeat elite enemies during adventures for a chance to collect dungeon key parts. 
              Each elite enemy has a 50% chance to drop half a dungeon key part. 
              Collect enough parts to form a complete key and unlock access to dungeons!
            </p>
            <div className="mt-3 text-amber-300">
              Your Progress: {character.dungeon_key_parts.toFixed(1)}/1.0 key parts
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
