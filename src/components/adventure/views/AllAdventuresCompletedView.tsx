'use client';

import { memo } from 'react';
import Link from 'next/link';
import type { Character } from '@/lib/types';
import { ROUTES, MAX_ADVENTURES_PER_DAY } from '@/lib/constants';
import AdventureTracker from '@/components/adventure/adventure-tracker';

interface AllAdventuresCompletedViewProps {
  character: Character;
}

const AllAdventuresCompletedView = memo(function AllAdventuresCompletedView({ 
  character 
}: AllAdventuresCompletedViewProps) {
  return (
    <div className="bg-gray-900 bg-opacity-80 p-6 text-center animate-fadeIn">
      <h2 className="text-3xl mb-4 text-yellow-400">All Adventures Completed!</h2>
      <p className="text-xl mb-6">
        You've completed all {MAX_ADVENTURES_PER_DAY} adventures for today.
        Return tomorrow for new adventures!
      </p>
      
      <div className="mb-8">
        <AdventureTracker 
          totalAdventures={MAX_ADVENTURES_PER_DAY} 
          completedAdventures={character.daily_adventure_count} 
        />
      </div>
      
      <div className="flex flex-col sm:flex-row justify-center gap-4">
        <Link href={ROUTES.WORLD_BOSS} className="pixel-button bg-red-600 hover:bg-red-500 active:bg-red-700">
          Fight World Boss
        </Link>
        <Link href={ROUTES.SHOP} className="pixel-button bg-green-600 hover:bg-green-500 active:bg-green-700">
          Shop
        </Link>
      </div>
    </div>
  );
});

export default AllAdventuresCompletedView;
