'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { DungeonProvider, DungeonStateProvider } from './DungeonContext';
import DungeonProgress from '@/components/character/dungeon-progress';
import type { Area, Character } from '@/lib/types';
import { getAvailableDungeons, enterDungeon } from '@/app/actions/dungeon';
import { ROUTES } from '@/lib/constants';
import LoadingSpinner from '@/components/ui/loading-spinner';
import Image from 'next/image';
import { ImageSource } from '@/lib/image-source';

interface DungeonContainerProps {
  character: Character;
}

export default function DungeonContainer({ character }: DungeonContainerProps) {
  const [loading, setLoading] = useState(true);
  const [enteringDungeon, setEnteringDungeon] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availableDungeons, setAvailableDungeons] = useState<Area[]>([]);
  const [activeDungeon, setActiveDungeon] = useState<any | null>(null);
  const router = useRouter();

  // Check if character has an active dungeon and load available dungeons
  useEffect(() => {
    async function checkActiveDungeon() {
      setLoading(true);
      setError(null);
      
      try {
        const supabase = createClient();
        
        // Check if character has an active dungeon
        const { data: dungeonData, error: dungeonError } = await supabase
          .from('character_dungeons')
          .select('*, area:area_id(*)')
          .eq('character_id', character.id)
          .not('current_state', 'eq', 'exited')
          .not('current_state', 'eq', 'completed')
          .maybeSingle();
        
        if (dungeonError) {
          console.error('Error checking active dungeon:', dungeonError);
          setError('Failed to check for active dungeons');
          setLoading(false);
          return;
        }
        
        if (dungeonData) {
          // Character has an active dungeon, navigate to dungeon page
          setActiveDungeon(dungeonData);
          // Redirect to dungeon page
          router.push(ROUTES.DUNGEON);
          return;
        }
        
        // No active dungeon, get available dungeons
        const dungeonResponse = await getAvailableDungeons(character.id);
        if (!dungeonResponse.success) {
          setError(dungeonResponse.error || 'Failed to load available dungeons');
          setLoading(false);
          return;
        }
        
        setAvailableDungeons(dungeonResponse.data || []);
        setLoading(false);
      } catch (err) {
        console.error('Error loading dungeon data:', err);
        setError('An unexpected error occurred');
        setLoading(false);
      }
    }
    
    checkActiveDungeon();
  }, [character.id, router]);

  // Handler for entering a dungeon
  const handleEnterDungeon = async (areaId: number) => {
    if (enteringDungeon) return;
    
    setEnteringDungeon(true);
    setError(null);
    
    try {
      const response = await enterDungeon(character.id, areaId);
      
      if (!response.success) {
        setError(response.error || 'Failed to enter dungeon');
        setEnteringDungeon(false);
        return;
      }
      
      // Successfully entered dungeon, navigate to dungeon page
      router.push(ROUTES.DUNGEON);
    } catch (err) {
      console.error('Error entering dungeon:', err);
      setError('An unexpected error occurred');
      setEnteringDungeon(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-amber-100 mb-6">Dungeons</h1>
        
        {/* Dungeon keys and progress */}
        <DungeonProgress character={character} />
        
        {/* Error message */}
        {error && (
          <div className="p-4 bg-red-900/50 text-red-100 rounded-md border border-red-800 mb-6">
            <p>{error}</p>
          </div>
        )}
        
        {/* Available dungeons */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-amber-200 mb-4">Available Dungeons</h2>
          
          {availableDungeons.length === 0 ? (
            <div className="p-6 bg-amber-900/30 rounded-lg border border-amber-800 text-center">
              <p className="text-amber-200 mb-3">No dungeons available.</p>
              <p className="text-amber-300 text-sm">
                Defeat elite enemies to collect dungeon key parts and unlock dungeons!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availableDungeons.map((dungeon) => (
                <button
                  key={dungeon.id}
                  onClick={() => handleEnterDungeon(dungeon.id)}
                  disabled={enteringDungeon || character.dungeon_keys < dungeon.dungeon_keys_required}
                  className={`p-4 bg-amber-900/40 rounded-lg border border-amber-800 hover:bg-amber-800/40 transition-colors text-left flex items-start ${
                    enteringDungeon || character.dungeon_keys < dungeon.dungeon_keys_required
                      ? 'opacity-60 cursor-not-allowed'
                      : 'cursor-pointer'
                  }`}
                >
                  <div className="flex-shrink-0 mr-4">
                    <div className="w-16 h-16 bg-amber-950 rounded-md overflow-hidden border border-amber-700">
                      <Image
                        src={ImageSource.getAreaImagePath(dungeon)}
                        alt={dungeon.name}
                        width={64}
                        height={64}
                        className="object-cover"
                      />
                    </div>
                  </div>
                  
                  <div className="flex-grow">
                    <h3 className="text-xl font-semibold text-amber-100">{dungeon.name}</h3>
                    <p className="text-amber-300 text-sm mb-2">{dungeon.description}</p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-amber-400 text-sm">
                        <span>Required Keys: {dungeon.dungeon_keys_required}</span>
                      </div>
                      
                      {character.dungeon_keys < dungeon.dungeon_keys_required && (
                        <span className="text-red-300 text-xs">Not enough keys</span>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
        
        {/* Dungeon info */}
        <div className="mt-8 p-4 bg-amber-900/20 rounded-lg border border-amber-800/50">
          <h3 className="text-lg font-semibold text-amber-100 mb-2">About Dungeons</h3>
          <p className="text-amber-200 text-sm mb-3">
            Dungeons are challenging adventures that require dungeon keys to enter. 
            Defeat elite enemies to collect dungeon key parts - each elite enemy has a 50% chance 
            to drop half a dungeon key.
          </p>
          <p className="text-amber-200 text-sm">
            Once inside a dungeon, you'll face a series of adventures similar to regular adventures, 
            but with more difficult enemies and better rewards. Complete all adventures in a dungeon 
            to claim the ultimate treasure!
          </p>
        </div>
      </div>
    </div>
  );
}
