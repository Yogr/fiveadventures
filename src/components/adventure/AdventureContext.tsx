'use client';

import { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import type { ReactNode } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Character, Adventure, AdventureDecision, AdventureOutcome, Combat, Area } from '@/lib/types';
import { getCharacterById } from '@/app/actions/character';
import { getAdventure } from '@/app/actions/adventure-updated';
import { getActiveCharacterCombat } from '@/app/actions/combat';
import { getSelectedArea } from '@/app/actions/area';

// Define the state shape
interface AdventureState {
  loading: boolean;
  error: string | null;
  character: Character | null;
  areas: Area[];
  selectedArea: Area | null;
  adventure: Adventure | null;
  selectedDecision: AdventureDecision | null;
  outcome: AdventureOutcome | null;
  combatId: string | null;
  showCombat: boolean;
  showRewards: boolean;
  oldExperience: number;
  showLevelUp: boolean;
}

// Define action types
type AdventureAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_CHARACTER'; payload: Character }
  | { type: 'SET_AREAS'; payload: Area[] }
  | { type: 'SET_SELECTED_AREA'; payload: Area | null }
  | { type: 'SET_ADVENTURE'; payload: Adventure | null }
  | { type: 'SET_SELECTED_DECISION'; payload: AdventureDecision | null }
  | { type: 'SET_OUTCOME'; payload: AdventureOutcome | null }
  | { type: 'SET_COMBAT_ID'; payload: string | null }
  | { type: 'SET_SHOW_COMBAT'; payload: boolean }
  | { type: 'SET_SHOW_REWARDS'; payload: boolean }
  | { type: 'SET_OLD_EXPERIENCE'; payload: number }
  | { type: 'SET_SHOW_LEVEL_UP'; payload: boolean }
  | { type: 'RESET_ADVENTURE_STATE' };

// Create the context
interface AdventureContextType {
  state: AdventureState;
  dispatch: React.Dispatch<AdventureAction>;
  loadCharacterData: (characterId: string) => Promise<void>;
  loadAreaData: (characterId: string, currentDay: number) => Promise<void>;
  loadAdventureData: () => Promise<void>;
  selectArea: (area: Area) => Promise<void>;
  selectDecision: (decision: AdventureDecision) => void;
  completeAdventure: () => Promise<void>;
  handleCombatEnd: (result: { isVictory: boolean; ranAway: boolean; monsterName: string }) => void;
  continueToNextAdventure: () => Promise<void>;
}

const AdventureContext = createContext<AdventureContextType | null>(null);

// Initial state
const initialState: AdventureState = {
  loading: true,
  error: null,
  character: null,
  areas: [],
  selectedArea: null,
  adventure: null,
  selectedDecision: null,
  outcome: null,
  combatId: null,
  showCombat: false,
  showRewards: false,
  oldExperience: 0,
  showLevelUp: false,
};

// Reducer function
function adventureReducer(state: AdventureState, action: AdventureAction): AdventureState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_CHARACTER':
      return { ...state, character: action.payload };
    case 'SET_AREAS':
      return { ...state, areas: action.payload };
    case 'SET_SELECTED_AREA':
      return { ...state, selectedArea: action.payload };
    case 'SET_ADVENTURE':
      return { ...state, adventure: action.payload };
    case 'SET_SELECTED_DECISION':
      return { ...state, selectedDecision: action.payload };
    case 'SET_OUTCOME':
      return { ...state, outcome: action.payload };
    case 'SET_COMBAT_ID':
      return { ...state, combatId: action.payload };
    case 'SET_SHOW_COMBAT':
      return { ...state, showCombat: action.payload };
    case 'SET_SHOW_REWARDS':
      return { ...state, showRewards: action.payload };
    case 'SET_OLD_EXPERIENCE':
      return { ...state, oldExperience: action.payload };
    case 'SET_SHOW_LEVEL_UP':
      return { ...state, showLevelUp: action.payload };
    case 'RESET_ADVENTURE_STATE':
      return {
        ...state,
        selectedDecision: null,
        outcome: null,
        showRewards: false,
        showLevelUp: false,
      };
    default:
      return state;
  }
}

// Provider component
interface AdventureProviderProps {
  initialCharacter: Character;
  currentDay: number;
  initialAreas?: Area[];
  initialSelectedArea?: Area | null;
  children: ReactNode;
}

export function AdventureProvider({ 
  initialCharacter, 
  currentDay, 
  initialAreas = [], 
  initialSelectedArea = null,
  children 
}: AdventureProviderProps) {
  const [state, dispatch] = useReducer(adventureReducer, {
    ...initialState,
    character: initialCharacter,
    areas: initialAreas,
    selectedArea: initialSelectedArea,
    loading: false, // Start with loading false since we have initial data
  });
  
  // Log initial state for debugging
  useEffect(() => {
    console.log('AdventureProvider initialized with:', {
      character: state.character?.name,
      areasCount: state.areas.length,
      selectedArea: state.selectedArea?.name || 'None',
      loading: state.loading
    });
  }, []);

  // Load character data
  const loadCharacterData = useCallback(async (characterId: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await getCharacterById(characterId);
      
      if (response.success && response.data) {
        dispatch({ type: 'SET_CHARACTER', payload: response.data });
      } else {
        dispatch({ type: 'SET_ERROR', payload: response.error || 'Failed to load character data' });
      }
    } catch (error) {
      console.error('Error loading character data:', error);
      dispatch({ type: 'SET_ERROR', payload: 'An unexpected error occurred' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  // Load area data
  const loadAreaData = useCallback(async (characterId: string, day: number) => {
    try {
      const selectedAreaResponse = await getSelectedArea(characterId, day);
      
      if (selectedAreaResponse.success && selectedAreaResponse.data) {
        // Find the area object from the areas array
        const selectedAreaObj = state.areas.find(area => area.id === selectedAreaResponse.data);
        
        if (selectedAreaObj) {
          dispatch({ type: 'SET_SELECTED_AREA', payload: selectedAreaObj });
        }
      } else {
        // No area selected yet, set selectedArea to null
        dispatch({ type: 'SET_SELECTED_AREA', payload: null });
      }
    } catch (error) {
      console.error('Error loading area data:', error);
    }
  }, [state.areas, dispatch]);

  // Load adventure data
  const loadAdventureData = useCallback(async () => {
    if (!state.character || !state.selectedArea) return;
    
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      // Check if character has completed all adventures for the day
      if (state.character.daily_adventure_count >= 5) { // Using 5 as MAX_ADVENTURES_PER_DAY
        dispatch({ type: 'SET_LOADING', payload: false });
        return;
      }

      // Check if character is in active combat
      const activeCombatResponse = await getActiveCharacterCombat(state.character.id);
      
      if (activeCombatResponse.success && activeCombatResponse.data) {
        dispatch({ type: 'SET_COMBAT_ID', payload: activeCombatResponse.data.id });
        dispatch({ type: 'SET_SHOW_COMBAT', payload: true });
        dispatch({ type: 'SET_LOADING', payload: false });
        return;
      }
      
      const adventureResponse = await getAdventure(state.character, state.selectedArea);
      
      if (!adventureResponse.success || !adventureResponse.data) {
        dispatch({ 
          type: 'SET_ERROR', 
          payload: adventureResponse.error || 'Failed to load adventure data' 
        });
        dispatch({ type: 'SET_LOADING', payload: false });
        return;
      }
      
      dispatch({ type: 'SET_ADVENTURE', payload: adventureResponse.data });
      dispatch({ type: 'SET_LOADING', payload: false });
    } catch (error) {
      console.error('Error loading adventure data:', error);
      dispatch({ type: 'SET_ERROR', payload: 'An unexpected error occurred' });
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [state.character, state.selectedArea]);

  // Select area
  const selectArea = useCallback(async (area: Area) => {
    if (!state.character) return;
    
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const { selectArea } = await import('@/app/actions/area');
      const result = await selectArea(state.character.id, area.id);
      
      if (result.success) {
        dispatch({ type: 'SET_SELECTED_AREA', payload: area });
      } else {
        dispatch({ type: 'SET_ERROR', payload: result.error || 'Failed to select area' });
      }
    } catch (error) {
      console.error('Error selecting area:', error);
      dispatch({ type: 'SET_ERROR', payload: 'An unexpected error occurred' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [state.character]);

  // Select decision
  const selectDecision = useCallback((decision: AdventureDecision) => {
    dispatch({ type: 'SET_SELECTED_DECISION', payload: decision });
  }, []);

  // Complete adventure
  const completeAdventure = useCallback(async () => {
    if (!state.character || !state.adventure || !state.selectedDecision) return;
    
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const { completeAdventure } = await import('@/app/actions/adventure-updated');
      const result = await completeAdventure({
        character: state.character,
        adventureId: state.adventure.id,
        decisionId: state.selectedDecision.id
      });
      
      if (!result.success || !result.data) {
        dispatch({ 
          type: 'SET_ERROR', 
          payload: result.error || 'Failed to complete adventure' 
        });
        dispatch({ type: 'SET_LOADING', payload: false });
        return;
      }
      
      // Save old experience for level up check
      dispatch({ type: 'SET_OLD_EXPERIENCE', payload: state.character.experience });
      
      // Check if outcome has combat
      if (result.data.outcome.has_combat && result.data.combat) {
        dispatch({ type: 'SET_COMBAT_ID', payload: result.data.combat.id });
        dispatch({ type: 'SET_SHOW_COMBAT', payload: true });
      }
      
      // Set outcome
      dispatch({ type: 'SET_OUTCOME', payload: result.data.outcome });
      
      // Show level up animation if experience increased enough to level up
      if (result.data.character.experience > state.character.experience) {
        dispatch({ type: 'SET_SHOW_LEVEL_UP', payload: true });
      }
      
      // Update character
      dispatch({ type: 'SET_CHARACTER', payload: result.data.character });
    } catch (error) {
      console.error('Error completing adventure:', error);
      dispatch({ type: 'SET_ERROR', payload: 'An unexpected error occurred' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [state.character, state.adventure, state.selectedDecision]);

  // Handle combat end
  const handleCombatEnd = useCallback((result: { isVictory: boolean; ranAway: boolean; monsterName: string }) => {
    dispatch({ type: 'SET_SHOW_COMBAT', payload: false });
    
    // If the player ran away, show a different outcome
    if (result.ranAway) {
      dispatch({
        type: 'SET_OUTCOME',
        payload: {
          id: 0,
          decision_id: 0,
          description: `You ran away from the ${result.monsterName}!`,
          experience_bonus: 0,
          gold_bonus: 0,
          hitpoints_change: 0,
          energy_change: 0,
          has_combat: false,
          monster_ids: [],
          stat_requirements: null,
          reward_table_id: null,
          success_rate_formula: null,
          created_at: new Date().toISOString()
        }
      });
    }
    
    // Refresh character data after combat
    if (state.character) {
      loadCharacterData(state.character.id);
    }
  }, [state.character, loadCharacterData]);

  // Continue to next adventure
  const continueToNextAdventure = useCallback(async () => {
    if (!state.character) return;
    
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'RESET_ADVENTURE_STATE' });
      
      // Get character data
      await loadCharacterData(state.character.id);
      
      // Load adventure data
      await loadAdventureData();
    } catch (error) {
      console.error('Error loading next adventure:', error);
      dispatch({ type: 'SET_ERROR', payload: 'An unexpected error occurred' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [state.character, loadCharacterData, loadAdventureData]);

  // Set up Supabase subscription for character updates
  useEffect(() => {
    if (!state.character) return;
    
    const supabase = createClient();
    const characterId = state.character.id;
    
    // Subscribe to character updates
    const subscription = supabase
      .channel(`character-${characterId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'characters',
          filter: `id=eq.${characterId}`
        },
        async () => {
          // Refresh character data when updated
          await loadCharacterData(characterId);
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(subscription);
    };
  }, [state.character, loadCharacterData]);

  // Reset animation state when outcome changes
  useEffect(() => {
    if (state.outcome) {
      dispatch({ type: 'SET_SHOW_REWARDS', payload: false });
      dispatch({ type: 'SET_SHOW_LEVEL_UP', payload: false });
    }
  }, [state.outcome]);

  // Load adventure data when selected area changes
  useEffect(() => {
    if (state.character && state.selectedArea) {
      loadAdventureData();
    }
  }, [state.selectedArea, loadAdventureData]);

  const contextValue = {
    state,
    dispatch,
    loadCharacterData,
    loadAreaData,
    loadAdventureData,
    selectArea,
    selectDecision,
    completeAdventure,
    handleCombatEnd,
    continueToNextAdventure,
  };

  return (
    <AdventureContext.Provider value={contextValue}>
      {children}
    </AdventureContext.Provider>
  );
}

// Custom hook to use the adventure context
export function useAdventure() {
  const context = useContext(AdventureContext);
  
  if (!context) {
    throw new Error('useAdventure must be used within an AdventureProvider');
  }
  
  return context;
}
