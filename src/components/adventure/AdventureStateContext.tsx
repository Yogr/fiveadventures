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
  refreshAdventureState: () => Promise<void>;
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

  // Create a memoized refresh function
  const refreshAdventureState = useCallback(async () => {
    await fetchAdventureState();
  }, [fetchAdventureState]);

  // Set up Supabase subscription for adventure state updates
  useEffect(() => {
    if (!character) return;
    
    const characterId = character.id;
    const supabase = createClient();
    
    // First, get the current adventure state
    fetchAdventureState();
    
    // Subscribe to adventure state updates
    const subscription = supabase
      .channel(`character-adventure-state-${characterId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'character_adventures',
          filter: `character_id=eq.${characterId}`
        },
        (payload) => {
          console.log('AdventureStateContext: Received state update:', payload.new);
          setState(prev => ({ 
            ...prev, 
            adventureState: payload.new as CharacterAdventureState
          }));
        }
      )
      .subscribe((status, err) => {
        if (status === 'SUBSCRIBED') {
          console.log('AdventureStateContext: Successfully subscribed to adventure state updates');
        } else {
          console.error('AdventureStateContext: Subscription error:', status, err);
        }
      });
    
    return () => {
      console.log('AdventureStateContext: Cleaning up subscription');
      supabase.removeChannel(subscription);
    };
  }, [character?.id]);

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
