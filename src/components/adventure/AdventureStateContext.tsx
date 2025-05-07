'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Character } from '@/lib/types';
import { getCurrentGameDay } from '@/lib/utils';

// Define a new type for CharacterAdventureState
export interface CharacterAdventureState {
  id: string;
  character_id: string;
  current_state: 'none' | 'selecting_area' | 'adventure' | 'combat' | 'outcome' | 'adventures_completed';
  current_adventure_id: number | null;
  decision_id: number | null;
  outcome_id: number | null;
  combat_id: string | null;
  day: number;
  adventure_number: number;
  created_at: string;
  updated_at: string;
}

// Context state
interface AdventureStateContextType {
  loading: boolean;
  error: string | null;
  adventureState: CharacterAdventureState | null;
  refreshAdventureState: (newState?: CharacterAdventureState) => Promise<void>;
}

const AdventureStateContext = createContext<AdventureStateContextType | null>(null);

// Provider component
export function AdventureStateProvider({ 
  character,
  children 
}: { 
  character: Character;
  children: React.ReactNode;
}) {
  const [state, setState] = useState<AdventureStateContextType>({
    loading: true,
    error: null,
    adventureState: null,
    refreshAdventureState: async () => {}
  });

  // Function to fetch adventure state
  const fetchAdventureState = useCallback(async () => {
    if (!character) return;
    
    const characterId = character.id;
    const supabase = createClient();
    
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const { data, error } = await supabase
        .from('character_adventures')
        .select('*')
        .eq('character_id', characterId)
        .maybeSingle();
        
      if (error) {
        // If no record exists, create one
        if (error.code === 'PGRST116') {
          const { data: newData, error: createError } = await supabase
            .from('character_adventures')
            .insert({
              character_id: characterId,
              current_state: 'none',
              day: getCurrentGameDay(),
              adventure_number: 0
            })
            .select()
            .single();
            
          if (createError) {
            setState(prev => ({ ...prev, error: createError.message, loading: false }));
          } else {
            setState(prev => ({ 
              ...prev, 
              adventureState: newData as CharacterAdventureState,
              loading: false 
            }));
          }
        } else {
          setState(prev => ({ ...prev, error: error.message, loading: false }));
        }
      } else {
        setState(prev => ({ 
          ...prev, 
          adventureState: data as CharacterAdventureState,
          loading: false 
        }));
      }
    } catch (err) {
      console.error('Error fetching adventure state:', err);
      setState(prev => ({ ...prev, error: 'Failed to load adventure state', loading: false }));
    }
  }, [character]);

  // Create a memoized refresh function that can also accept direct state updates
  const refreshAdventureState = useCallback(async (newState?: CharacterAdventureState) => {
    if (newState) {
      // If we're given a new state directly, use it without fetching
      setState(prev => ({
        ...prev,
        adventureState: newState,
        loading: false,
        error: null
      }));
    } else {
      // Otherwise fetch the latest state from the server
      await fetchAdventureState();
    }
  }, [fetchAdventureState]);

  // Initialize adventure state when character changes
  useEffect(() => {
    if (!character) return;
    
    // Get the current adventure state
    fetchAdventureState();
    
  }, [character?.id, fetchAdventureState]);

  // Create the context value
  const contextValue = {
    loading: state.loading,
    error: state.error,
    adventureState: state.adventureState,
    refreshAdventureState
  };

  return (
    <AdventureStateContext.Provider value={contextValue}>
      {children}
    </AdventureStateContext.Provider>
  );
}

// Custom hook
export function useAdventureState() {
  const context = useContext(AdventureStateContext);
  if (!context) {
    throw new Error('useAdventureState must be used within an AdventureStateProvider');
  }
  return context;
}
