'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import DungeonProgress from '@/components/character/dungeon-progress';
import type { Area, Character, CharacterDungeon } from '@/lib/types';
import { getAvailableDungeons, enterDungeon } from '@/app/actions/dungeon';
import LoadingSpinner from '@/components/ui/loading-spinner';
import Image from 'next/image';
import { ImageSource } from '@/lib/image-source';
import CombatInterface from '@/components/combat/combat-interface';
import { useDungeon, useDungeonState } from './DungeonContext';

interface DungeonTabContentProps {
  character: Character;
}

export default function DungeonTabContent({ character }: DungeonTabContentProps) {
  const [loading, setLoading] = useState(true);
  const [enteringDungeon, setEnteringDungeon] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availableDungeons, setAvailableDungeons] = useState<Area[]>([]);
  const [activeDungeon, setActiveDungeon] = useState<CharacterDungeon | null>(null);
  
  const { state, dispatch } = useDungeon();
  const { dungeonState, setDungeonState } = useDungeonState();

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
          // Character has an active dungeon
          setActiveDungeon(dungeonData);
          
          // Update the dungeon context
          dispatch({ type: 'SET_CHARACTER', payload: character });
          dispatch({ type: 'SET_DUNGEON', payload: dungeonData });
          dispatch({ type: 'SET_AREA', payload: dungeonData.area });
          
          // Set the dungeon state based on the current state in the database
          setDungeonState(dungeonData.current_state as any);
          setLoading(false);
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
  }, [character.id, dispatch, setDungeonState]);

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
      
      // Successfully entered dungeon, refresh the component
      const supabase = createClient();
      const { data: dungeonData, error: dungeonError } = await supabase
        .from('character_dungeons')
        .select('*, area:area_id(*)')
        .eq('character_id', character.id)
        .not('current_state', 'eq', 'exited')
        .not('current_state', 'eq', 'completed')
        .maybeSingle();
      
      if (dungeonError || !dungeonData) {
        console.error('Error fetching new dungeon data:', dungeonError);
        setError('Failed to load dungeon data after entering');
        setEnteringDungeon(false);
        return;
      }
      
      // Update state with new dungeon data
      setActiveDungeon(dungeonData);
      
      // Update the dungeon context
      dispatch({ type: 'SET_CHARACTER', payload: character });
      dispatch({ type: 'SET_DUNGEON', payload: dungeonData });
      dispatch({ type: 'SET_AREA', payload: dungeonData.area });
      
      // Set the dungeon state based on the current state in the database
      setDungeonState(dungeonData.current_state as any);
      
      setEnteringDungeon(false);
    } catch (err) {
      console.error('Error entering dungeon:', err);
      setError('An unexpected error occurred');
      setEnteringDungeon(false);
    }
  };

  // Render active dungeon combat
  if (state.combatId && dungeonState === 'combat' && activeDungeon) {
    // Get area from active dungeon
    const areaForCombat = {
      id: String(activeDungeon.area.id),
      name: activeDungeon.area.name,
      image: activeDungeon.area.image || 'dungeonbackground'
    };
    
    return (
      <CombatInterface
        combatId={state.combatId}
        character={character}
        area={areaForCombat}
        onCombatEnd={(result) => {
          // Update combat result in context
          dispatch({ type: 'SET_COMBAT_VICTORY', payload: result.isVictory });
          dispatch({ type: 'SET_COMBAT_ID', payload: null });
          
          // Reload dungeon data after combat ends
          setTimeout(() => {
            window.location.reload();
          }, 500);
        }}
      />
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // If there's an active dungeon but we're not in combat, let the original DungeonContainer handle it
  if (activeDungeon) {
    return (
      <div className="w-full">
        <DungeonProgress character={character} />
        <div className="mt-4 p-4 bg-amber-900/40 rounded-lg border border-amber-800">
          <h2 className="text-xl font-bold text-amber-100 mb-2">Active Dungeon: {activeDungeon.area.name}</h2>
          <p className="text-amber-200 mb-4">Continue your exploration of this dungeon!</p>
          <div className="flex justify-between items-center">
            <span className="text-amber-300">
              Progress: {activeDungeon.current_adventure_count} / 3 adventures
            </span>
            <span className="text-amber-300">
              Current state: {dungeonState}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Dungeon keys and progress */}
      <DungeonProgress character={character} />
      
      {/* Error message */}
      {error && (
        <div className="p-4 bg-red-900/50 text-red-100 rounded-md border border-red-800 mb-6">
          <p>{error}</p>
        </div>
      )}
      
      {/* Available dungeons */}
      <div className="space-y-6 mt-4">
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
              <div
                key={dungeon.id}
                className="p-4 bg-amber-900/40 rounded-lg border border-amber-800 transition-colors text-left flex items-start"
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
                    <div className="text-amber-400 text-sm mt-2">
                      <button 
                        onClick={() => handleEnterDungeon(dungeon.id)}
                        className={`px-3 py-1 rounded flex items-center ${character.dungeon_keys >= dungeon.dungeon_keys_required ? 'bg-amber-700 hover:bg-amber-600' : 'bg-amber-900/50 cursor-not-allowed'}`}
                        disabled={enteringDungeon || character.dungeon_keys < dungeon.dungeon_keys_required}
                      >
                        <span>Enter dungeon</span> 
                        <div className="flex items-center ml-2">
                          <Image src="/image/ui/dungeon_key.png" alt="key" width={16} height={16} className="mr-1" /> 
                          <span>{dungeon.dungeon_keys_required}</span>
                        </div>
                      </button>
                    </div>
                    
                    {character.dungeon_keys < dungeon.dungeon_keys_required && (
                      <span className="text-red-300 text-xs">Not enough keys</span>
                    )}
                  </div>
                </div>
              </div>
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
  );
}
