'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCharacterForUser } from '@/app/actions/character';
import { createClient } from '@/lib/supabase/client';
import {
  DungeonProvider,
  DungeonStateProvider
} from '@/components/dungeon/DungeonContext';
import DungeonContainer from '@/components/dungeon/DungeonContainer';
import LoadingSpinner from '@/components/ui/loading-spinner';
import Link from 'next/link';
import { ROUTES } from '@/lib/constants';
import type { Character, CharacterDungeon } from '@/lib/types';

export default function DungeonPage() {
  const [character, setCharacter] = useState<Character | null>(null);
  const [activeDungeon, setActiveDungeon] = useState<CharacterDungeon | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function loadCharacterAndDungeon() {
      setLoading(true);
      setError(null);
      
      try {
        // Get character data
        const response = await getCharacterForUser();
        
        if (!response.success || !response.data) {
          setError(response.error || 'Failed to load character data');
          setLoading(false);
          return;
        }
        
        const character = response.data;
        setCharacter(character);
        
        // Check if character has an active dungeon
        const supabase = createClient();
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
        
        // If character has no active dungeon, redirect to character page
        if (!dungeonData && character.dungeon_keys === 0) {
          router.push(ROUTES.HOME);
          return;
        }
        
        setActiveDungeon(dungeonData);
        setLoading(false);
      } catch (err) {
        console.error('Error loading dungeon data:', err);
        setError('An unexpected error occurred');
        setLoading(false);
      }
    }
    
    loadCharacterAndDungeon();
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !character) {
    return (
      <div className="p-4 bg-red-900/50 text-red-100 rounded-md">
        <h2 className="text-xl font-bold mb-2">Error</h2>
        <p>{error || 'Character not found'}</p>
        <Link href={ROUTES.HOME} className="inline-flex items-center text-amber-300 hover:text-amber-200 transition-colors mt-4">
          Back to Home
        </Link>
      </div>
    );
  }
  
  return (
    <DungeonProvider>
      <DungeonStateProvider>
        <DungeonContainer character={character} />
      </DungeonStateProvider>
    </DungeonProvider>
  );
}
