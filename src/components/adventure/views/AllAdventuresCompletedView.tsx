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
    
    {/* Warning for unlinked characters */}
    {character.status === 'unlinked' && (
      <div className="mb-6 bg-amber-100 border-l-4 border-amber-500 text-amber-900 p-4 rounded">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-amber-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium">
              Your character's progress is not saved to an account!
            </p>
            <p className="mt-1 text-sm">
              Create an account or sign in to save your character and continue your adventure on any device.
            </p>
            <p className="mt-2">
              <Link href={ROUTES.LOGIN} className="inline-flex items-center px-3 py-1 border border-amber-600 text-sm leading-5 font-medium rounded-md text-amber-800 bg-amber-200 hover:bg-amber-300 focus:outline-none focus:border-amber-700 focus:shadow-outline-amber active:bg-amber-300 transition ease-in-out duration-150">
                Sign In Now
              </Link>
            </p>
          </div>
        </div>
      </div>
    )}
    
      <div className="flex flex-col sm:flex-row justify-center gap-4">
        {character.status !== 'unlinked' && (
          <Link href={ROUTES.WORLD_BOSS} className="pixel-button bg-red-600 hover:bg-red-500 active:bg-red-700">
            Fight World Boss
          </Link>
        )}
        <Link href={ROUTES.SHOP} className="pixel-button bg-green-600 hover:bg-green-500 active:bg-green-700">
          Shop
        </Link>
      </div>
    </div>
  );
});

export default AllAdventuresCompletedView;
