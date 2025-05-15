'use client';

import React from 'react';
import Image from 'next/image';

interface DungeonCompletedViewProps {
  dungeonName: string;
}

export function DungeonCompletedView({ dungeonName }: DungeonCompletedViewProps) {
  return (
    <div className="p-6 bg-amber-900/50 rounded-lg border border-amber-700 text-center">
      <h2 className="text-xl font-bold text-amber-200 mb-4">Dungeon Completed!</h2>
      <p className="text-amber-300 mb-4">
        You have completed all adventures in the {dungeonName} dungeon.
      </p>
      <div className="mt-6 flex justify-center">
        <Image 
          src="/image/ui/chest_open.png" 
          alt="Treasure" 
          width={64} 
          height={64} 
          className="animate-pulse"
        />
      </div>
      <p className="text-amber-200 mt-4">
        Return to select a new dungeon to explore.
      </p>
    </div>
  );
}

export function DungeonStartedView({ dungeonName, onStart }: { dungeonName: string, onStart: () => void }) {
  return (
    <div className="p-6 bg-amber-900/50 rounded-lg border border-amber-700 text-center">
      <h2 className="text-xl font-bold text-amber-200 mb-4">Dungeon Started!</h2>
      <p className="text-amber-300 mb-4">
        You've entered the {dungeonName} dungeon. Prepare for your adventure!
      </p>
      <div className="mt-6 flex justify-center">
        <Image 
          src="/image/ui/dungeonbackground.png" 
          alt="Dungeon" 
          width={128} 
          height={96} 
          className="rounded-lg border border-amber-800"
        />
      </div>
      <button
        className="mt-6 px-4 py-2 bg-amber-700 hover:bg-amber-600 text-amber-100 rounded"
        onClick={onStart}
      >
        Begin Exploration
      </button>
    </div>
  );
}

export function NoAdventureView({ dungeonName }: { dungeonName: string }) {
  return (
    <div className="p-6 bg-amber-900/50 rounded-lg border border-amber-700 text-center">
      <h2 className="text-xl font-bold text-amber-200 mb-4">No Adventure Available</h2>
      <p className="text-amber-300 mb-4">
        There are no adventures available in the {dungeonName} dungeon.
      </p>
    </div>
  );
}
