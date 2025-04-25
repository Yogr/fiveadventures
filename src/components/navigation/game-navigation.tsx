'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/lib/constants';
import WorldBossButtonCompanion from '@/components/worldboss/world-boss-button-companion';
import CharacterStats from '@/components/character/character-stats';
import type { Character } from '@/lib/types';
import { createClient } from '@/lib/supabase/client';
import { getCharacterById } from '@/app/actions/character';
import { signOut } from '@/app/actions/auth';

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
    
    // Enhanced logging for debugging
    console.log('GameNavigation: Creating subscription for character ID:', characterId);
    console.log('GameNavigation: Initial character state:', {
      name: initialCharacter.name,
      hp: `${initialCharacter.current_hitpoints}/${initialCharacter.max_hitpoints}`,
      energy: `${initialCharacter.current_energy}/${initialCharacter.max_energy}`,
      gold: initialCharacter.gold,
      adventureCount: initialCharacter.daily_adventure_count
    });
    
    // Subscribe to character updates - using a unique channel name for navigation
    const subscription = supabase
      .channel(`character-${characterId}-nav`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'characters',
          filter: `id=eq.${characterId}`
        },
        async (payload) => {
          // Enhanced logging for debugging
          console.log('GameNavigation: Received database update event:', {
            eventType: 'UPDATE',
            table: 'characters',
            recordId: payload.new.id,
            timestamp: new Date().toISOString()
          });
          console.log('GameNavigation: Updated character data from payload:', {
            name: payload.new.name,
            hp: `${payload.new.current_hitpoints}/${payload.new.max_hitpoints}`,
            energy: `${payload.new.current_energy}/${payload.new.max_energy}`,
            gold: payload.new.gold,
            adventureCount: payload.new.daily_adventure_count
          });
          
          // Refresh character data when updated
          console.log('GameNavigation: Fetching full character data from server...');
          
          try {
            const response = await getCharacterById(characterId);
            
            if (response.success && response.data) {
              console.log('GameNavigation: Successfully fetched character data');
              console.log('GameNavigation: Character state comparison:', {
                old: {
                  hp: `${character.current_hitpoints}/${character.max_hitpoints}`,
                  energy: `${character.current_energy}/${character.max_energy}`,
                  gold: character.gold,
                  adventureCount: character.daily_adventure_count
                },
                new: {
                  hp: `${response.data.current_hitpoints}/${response.data.max_hitpoints}`,
                  energy: `${response.data.current_energy}/${response.data.max_energy}`,
                  gold: response.data.gold,
                  adventureCount: response.data.daily_adventure_count
                }
              });
              
              // Update the character state
              setCharacter(response.data);
              console.log('GameNavigation: Character state updated');
            } else {
              console.error('GameNavigation: Failed to get character data:', response.error);
            }
          } catch (error) {
            console.error('GameNavigation: Error refreshing character data:', error);
          }
        }
      )
      .subscribe((status, err) => {
        if (status === 'SUBSCRIBED') {
          console.log('GameNavigation: Successfully subscribed to character updates');
        }
      });
    
    console.log('GameNavigation: Subscription initialized with channel:', `character-${characterId}`);
    
    return () => {
      console.log('GameNavigation: Cleaning up Supabase subscription');
      supabase.removeChannel(subscription);
    };
  }, [initialCharacter.id]); // Keep dependency on initialCharacter.id only
  return (
    <div className="w-full flex flex-col">
      {/* Top navigation bar */}
      <div className="w-full bg-yellow-950 border-b border-amber-900 flex items-center justify-between px-4 py-1">
        {/* Day counter - left section */}
        <div className="text-sm text-amber-300 flex-1">
          <span>Day: {currentDay}</span>
        </div>
        
        {/* Navigation buttons - center section */}
        <div className="flex items-center justify-center gap-2 flex-1">
          <Link 
            href={ROUTES.ADVENTURE}
            className={`rounded px-2 py-0.5 text-sm text-center text-white font-medium ${
              activeTab === 'adventure' ? 'bg-red-700' : 'bg-red-600 hover:bg-red-500'
            }`}
          >
            Adventure
          </Link>
          
          <Link 
            href={ROUTES.SHOP}
            className={`rounded px-2 py-0.5 text-sm text-center text-white font-medium ${
              activeTab === 'shop' ? 'bg-yellow-700' : 'bg-yellow-600 hover:bg-yellow-500'
            }`}
          >
            Shop
          </Link>
          
          <div className="relative flex items-center">
            <Link 
              href={ROUTES.WORLD_BOSS}
              className={`rounded px-2 py-0.5 text-sm text-center text-white font-medium whitespace-nowrap ${
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
        
        {/* Login/Logout button - right section */}
        <div className="flex items-center justify-end flex-1">
          {user ? (
            <button 
              onClick={async () => {
                await signOut();
                window.location.href = '/';
              }} 
              className="rounded px-2 py-0.5 text-sm text-center text-white font-medium bg-blue-600 hover:bg-blue-500"
            >
              Logout
            </button>
          ) : (
            <Link 
              href="/login"
              className="rounded px-2 py-0.5 text-sm text-center text-white font-medium bg-blue-600 hover:bg-blue-500"
            >
              Login
            </Link>
          )}
        </div>
      </div>
      
      {/* Character stats below navigation */}
      <div className="w-full max-w-lg mx-auto px-2 pt-2">
        <CharacterStats character={character} />
      </div>
    </div>
  );
}
