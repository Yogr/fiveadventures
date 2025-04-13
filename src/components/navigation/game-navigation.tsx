'use client';

import Link from 'next/link';
import { ROUTES } from '@/lib/constants';
import WorldBossButtonCompanion from '@/components/worldboss/world-boss-button-companion';
import CharacterStats from '@/components/character/character-stats';
import type { Character } from '@/lib/types';

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
  character,
  user, 
  showWorldBossCompanion = false 
}: GameNavigationProps) {
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
