'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ROUTES } from '@/lib/constants';
import WorldBossButtonCompanion from '@/components/worldboss/world-boss-button-companion';
import CharacterStats from '@/components/character/character-stats';
import type { Character } from '@/lib/types';
import { createClient } from '@/lib/supabase/client';
import { getCharacterById } from '@/app/actions/character';

interface GameNavigationProps {
  activeTab: 'adventure' | 'shop' | 'worldboss';
  currentDay: number;
  character: Character;
  user?: {
    email: string;
  } | null;
  showWorldBossCompanion?: boolean;
}

export default function GameNavigation({ 
  activeTab, 
  currentDay, 
  character: initialCharacter,
  user, 
  showWorldBossCompanion = false 
}: GameNavigationProps) {
  // Use state to track the character data so we can update it
  const [character, setCharacter] = useState<Character>(initialCharacter);

  // Set up Supabase subscription for character updates
  useEffect(() => {
    console.log('Setting up Supabase subscription for character updates in GameNavigation');
    const supabase = createClient();
    const characterId = initialCharacter.id;
    
    // Subscribe to character updates
    const subscription = supabase
      .channel(`nav-character-${characterId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'characters',
          filter: `id=eq.${characterId}`
        },
        async (payload) => {
          // Refresh character data when updated
          console.log('Character updated in database:', payload);
          console.log('Refreshing navigation data for character:', characterId);
          
          try {
            const response = await getCharacterById(characterId);
            console.log('Character data response:', response);
            
            if (response.success && response.data) {
              console.log('Setting new character data:', response.data);
              console.log('Old adventure count:', character.daily_adventure_count);
              console.log('New adventure count:', response.data.daily_adventure_count);
              setCharacter(response.data);
            } else {
              console.error('Failed to get character data:', response.error);
            }
          } catch (error) {
            console.error('Error refreshing character data:', error);
          }
        }
      )
      .subscribe();
    
    console.log('Subscription set up with channel:', `nav-character-${characterId}`);
    
    return () => {
      console.log('Cleaning up Supabase subscription');
      supabase.removeChannel(subscription);
    };
  }, [initialCharacter.id, character.daily_adventure_count]);
  return (
    <div className="w-full flex flex-col">
      {/* Top navigation bar */}
      <div className="w-full bg-amber-950 flex items-center justify-between px-2 py-0.5">
        {/* Day counter */}
        <div className="text-xs text-amber-300">
          <span>Day: {currentDay}</span>
        </div>
        
        {/* Navigation buttons */}
        <div className="flex items-center gap-1">
          <Link 
            href={ROUTES.ADVENTURE}
            className={`rounded px-2 py-0.5 text-xs text-center text-white font-medium ${
              activeTab === 'adventure' ? 'bg-red-700' : 'bg-red-600 hover:bg-red-500'
            }`}
          >
            Adventure
          </Link>
          
          <Link 
            href={ROUTES.SHOP}
            className={`rounded px-2 py-0.5 text-xs text-center text-white font-medium ${
              activeTab === 'shop' ? 'bg-yellow-700' : 'bg-yellow-600 hover:bg-yellow-500'
            }`}
          >
            Shop
          </Link>
          
          <div className="relative flex items-center">
            <Link 
              href={ROUTES.WORLD_BOSS}
              className={`rounded px-2 py-0.5 text-xs text-center text-white font-medium ${
                activeTab === 'worldboss' ? 'bg-purple-700' : 'bg-purple-600 hover:bg-purple-500'
              }`}
            >
              World Boss
            </Link>
            
            {showWorldBossCompanion && (
              <div className="absolute left-[calc(100%-5px)]">
                <WorldBossButtonCompanion />
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Character stats below navigation */}
      <div className="w-full max-w-lg mx-auto px-2 pt-2">
        <CharacterStats character={character} />
      </div>
    </div>
  );
}
