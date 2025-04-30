'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import type { Character, CharacterDungeon } from '@/lib/types';
import { ROUTES } from '@/lib/constants';

interface DungeonProgressProps {
  character: Character;
}

export default function DungeonProgress({ character }: DungeonProgressProps) {
  const [activeDungeon, setActiveDungeon] = useState<CharacterDungeon | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Check if character has an active dungeon
  useEffect(() => {
    async function checkActiveDungeon() {
      if (!character.id) return;
      
      setLoading(true);
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
          setLoading(false);
          return;
        }
        
        setActiveDungeon(dungeonData);
        setLoading(false);
      } catch (err) {
        console.error('Error loading dungeon data:', err);
        setLoading(false);
      }
    }
    
    checkActiveDungeon();
  }, [character.id]);
  
  // If character doesn't have keys or key parts and no active dungeon, don't show anything
  if (
    character.dungeon_keys === 0 && 
    character.dungeon_key_parts === 0 && 
    !activeDungeon
  ) {
    return null;
  }
  
  return (
    <div className="bg-amber-900/20 p-4 rounded-lg mb-4 border border-amber-800/50">
      <h3 className="text-lg font-semibold text-amber-100 mb-2">Dungeon Status</h3>
      
      {/* Active Dungeon */}
      {activeDungeon && (
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-amber-200 font-medium">Active Dungeon:</span>
            <span className="text-amber-300">{activeDungeon.area?.name}</span>
          </div>
          
          <div className="flex items-center justify-between mb-1">
            <span className="text-amber-200 font-medium">Adventures Completed:</span>
            <span className="text-amber-300">{activeDungeon.current_adventure_count}</span>
          </div>
          
          <Link 
            href={ROUTES.DUNGEON}
            className="mt-2 inline-block bg-amber-700 hover:bg-amber-600 text-amber-100 px-3 py-1 rounded text-sm transition-colors"
          >
            Continue Dungeon
          </Link>
        </div>
      )}
      
      {/* Available Keys */}
      <div className="flex items-center justify-between mb-1">
        <span className="text-amber-200 font-medium">Dungeon Keys:</span>
        <span className="text-amber-300">
          {character.dungeon_keys || 0}
          {character.dungeon_key_parts > 0 && (
            <span className="ml-1 text-amber-400/80">
              (+{character.dungeon_key_parts.toFixed(1)} parts)
            </span>
          )}
        </span>
      </div>
      
      {/* Key Parts Progress Bar */}
      {character.dungeon_key_parts > 0 && (
        <div className="mt-2">
          <div className="w-full h-2 bg-amber-900 rounded-full overflow-hidden">
            <div 
              className="h-full bg-amber-500" 
              style={{ width: `${Math.min(100, character.dungeon_key_parts * 100)}%` }}
            ></div>
          </div>
          <div className="text-xs text-amber-400/70 mt-1">
            {character.dungeon_key_parts.toFixed(1)}/1.0 parts to next key
          </div>
        </div>
      )}
      
      {/* Enter Dungeon Button - Only if character has keys and no active dungeon */}
      {character.dungeon_keys > 0 && !activeDungeon && (
        <Link 
          href={ROUTES.DUNGEON}
          className="mt-3 inline-block bg-amber-700 hover:bg-amber-600 text-amber-100 px-3 py-1 rounded text-sm transition-colors"
        >
          Enter Dungeon
        </Link>
      )}
    </div>
  );
}
