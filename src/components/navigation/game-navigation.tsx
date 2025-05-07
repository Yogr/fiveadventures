'use client';

import { useState, useEffect } from 'react';
import { HiExclamation } from 'react-icons/hi';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/lib/constants';
import WorldBossButtonCompanion from '@/components/worldboss/world-boss-button-companion';
import CharacterStats from '@/components/character/character-stats';
import type { Character } from '@/lib/types';
import { createClient } from '@/lib/supabase/client';
import { getCharacterById } from '@/app/actions/character';
import { signOut } from '@/app/actions/auth';
import Image from 'next/image';

interface GameNavigationProps {
  activeTab: 'adventure' | 'shop' | 'worldboss' | 'dungeon' | 'leaderboard' | 'guild';
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
    const supabase = createClient();
    const characterId = initialCharacter.id;
    
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
          // Refresh character data when updated
          try {
            const response = await getCharacterById(characterId);
            
            if (response.success && response.data) {
              // Update the character state
              setCharacter(response.data);
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
    
    return () => {
      supabase.removeChannel(subscription);
    };
  }, [initialCharacter.id]); // Keep dependency on initialCharacter.id only
  
  return (
    <div className="w-full flex flex-col">
      {/* Top navigation bar */}
      <div className="w-full flex items-start justify-between px-1 pt-0 mt-0">
        {/* Day counter - left section */}
        <div className="text-xs text-amber-300 flex-none p-1">
          <span>Day: {currentDay}</span>
        </div>
        
        {/* Navigation buttons - center section with new design */}
        <div className="flex-1 flex justify-around">
          <div className="relative w-full max-w-[400px] flex">
            {/* Background image */}
            <div className="relative w-full aspect-[5/1]">
              <Image 
                src="/image/ui/navbar_bg.png" 
                alt="Navigation background"
                fill
                priority
                className="object-cover"
              />
            </div>
            
            {/* Buttons positioned over the background */}
            <div className="absolute inset-0 flex justify-around items-start px-0.5">
              {/* Shop Button */}
              <Link 
                href={ROUTES.SHOP}
                className="group flex flex-col items-center justify-center opacity-90 hover:opacity-100"
              >
                <div className="relative w-9 h-9">
                  <Image 
                    src="/image/ui/shop.png" 
                    alt="Shop" 
                    fill
                    className="object-contain"
                  />
                </div>
                <span className="text-lg text-shadow text-white group-hover:text-amber-200 -mt-5 z-20">Shop</span>
              </Link>
              
              {/* Leaderboard Button */}
              <Link 
                href={ROUTES.LEADERBOARD}
                className="group flex flex-col items-center justify-center opacity-90 hover:opacity-100"
              >
                <div className="relative w-9 h-9">
                  <Image 
                    src="/image/ui/leaderboard.png" 
                    alt="Leaderboard" 
                    fill
                    className="object-contain"
                  />
                </div>
                <span className="text-lg text-shadow text-white group-hover:text-amber-200 -mt-5 z-20">Top</span>
              </Link>
              
              {/* Adventure Button */}
              <Link 
                href={ROUTES.ADVENTURE}
                className="group flex flex-col items-center justify-center opacity-90 hover:opacity-100"
              >
                <div className="relative w-9 h-9">
                  <Image 
                    src="/image/ui/adventure.png" 
                    alt="Adventure" 
                    fill
                    className="object-contain"
                  />
                </div>
                <span className="text-lg text-shadow text-white group-hover:text-amber-200 -mt-5 z-20">Adventure</span>
              </Link>
              
              {/* Guild Button */}
              <Link 
                href={ROUTES.GUILD}
                className="group flex flex-col items-center justify-center opacity-90 hover:opacity-100"
              >
                <div className="relative w-9 h-9">
                  <Image 
                    src="/image/ui/guild.png" 
                    alt="Guild" 
                    fill
                    className="object-contain"
                  />
                </div>
                <span className="text-lg text-shadow text-white group-hover:text-amber-200 -mt-5 z-20">Guild</span>
              </Link>
              
              {/* World Boss Button */}
              <div className="relative flex items-center">
                <Link 
                  href={ROUTES.WORLD_BOSS}
                  className="group flex flex-col items-center justify-center opacity-90 hover:opacity-100"
                >
                  <div className="relative w-9 h-9">
                    <Image 
                      src="/image/ui/worldboss.png" 
                      alt="World Boss" 
                      fill
                      className="object-contain"
                    />
                  </div>
                  <span className="text-lg text-shadow text-white group-hover:text-amber-200 -mt-5 z-20">Boss</span>
                </Link>
                
                {showWorldBossCompanion && (
                  <div className="absolute -right-1 -top-2 scale-75">
                    <WorldBossButtonCompanion />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Login/Logout button - right section */}
        <div className="flex-none flex items-center justify-end p-1">
          {user ? (
            <button 
              onClick={async () => {
                await signOut();
                window.location.href = '/';
              }} 
              className="rounded px-1.5 py-0.5 text-sm text-center text-white font-medium bg-gradient-to-b from-blue-500 to-blue-700 hover:from-blue-400 hover:to-blue-600 border border-blue-400 shadow-sm hover:shadow-md"
            >
              Logout
            </button>
          ) : (
            <div className="relative flex items-center">
              <Link 
                href="/login"
                className="rounded px-1.5 py-0.5 text-sm text-center text-white font-medium bg-gradient-to-b from-blue-500 to-blue-700 hover:from-blue-400 hover:to-blue-600 border border-blue-400 shadow-sm hover:shadow-md"
              >
                Login
              </Link>
              
              {/* Warning bubble for unlinked characters with completed adventures */}
              {!user && character.status === 'unlinked' && character.daily_adventure_count > 0 && (
                <div className="absolute -top-1 -right-1 group">
                  <div className="bg-amber-500 text-amber-950 rounded-full w-4 h-4 flex items-center justify-center">
                    <HiExclamation size={12} />
                  </div>
                  <div className="absolute hidden group-hover:block right-0 top-5 w-48 p-2 bg-amber-100 border border-amber-500 text-amber-900 text-xs rounded shadow-lg z-50">
                    Sign in to save your character's progress!
                  </div>
                </div>
              )}
            </div>
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
