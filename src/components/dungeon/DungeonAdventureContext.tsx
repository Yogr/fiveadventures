'use client';

import { createContext, useContext, useReducer, useCallback, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { 
  getDungeonAdventure, 
  completeDungeonAdventure 
} from '@/app/actions/dungeon';
import { 
  getDungeonState,
  updateDungeonState
} from '@/app/actions/dungeon-state';
import { createClient } from '@/lib/supabase/client';
import type { 
  Character, 
  CharacterDungeon, 
  Adventure, 
  AdventureDecision, 
  AdventureOutcome,
  RewardItem,
  Combat
} from '@/lib/types';
import { getLevelFromExperience } from '@/lib/utils';

// Define the state shape (similar to AdventureState)
interface DungeonAdventureState {
  loading: boolean;
  error: string | null;
  character: Character;
  dungeon: CharacterDungeon;
  adventure: Adventure | null;
  selectedDecision: AdventureDecision | null;
  outcome: AdventureOutcome | null;
  combatId: string | null;
  showPreCombat: boolean;
  showCombat: boolean;
  showRewards: boolean;
  oldExperience: number;
  showLevelUp: boolean;
  skipCombatCheck: boolean;
  rewardItem: RewardItem | null;
  combatResult: { isVictory: boolean; ranAway: boolean; monsterName: string } | null;
}

// Define action types (similar to AdventureAction)
type DungeonAdventureAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_CHARACTER'; payload: Character }
  | { type: 'SET_DUNGEON'; payload: CharacterDungeon }
  | { type: 'SET_ADVENTURE'; payload: Adventure | null }
  | { type: 'SET_SELECTED_DECISION'; payload: AdventureDecision | null }
  | { type: 'SET_OUTCOME'; payload: AdventureOutcome | null }
  | { type: 'SET_COMBAT_ID'; payload: string | null }
  | { type: 'SET_SHOW_PRE_COMBAT'; payload: boolean }
  | { type: 'SET_SHOW_COMBAT'; payload: boolean }
  | { type: 'SET_SHOW_REWARDS'; payload: boolean }
  | { type: 'SET_OLD_EXPERIENCE'; payload: number }
  | { type: 'SET_SHOW_LEVEL_UP'; payload: boolean }
  | { type: 'SET_SKIP_COMBAT_CHECK'; payload: boolean }
  | { type: 'SET_REWARD_ITEM'; payload: RewardItem | null }
  | { type: 'SET_COMBAT_RESULT'; payload: { isVictory: boolean; ranAway: boolean; monsterName: string } | null }
  | { type: 'RESET_ADVENTURE_STATE' };

// Create the context
interface DungeonAdventureContextType {
  state: DungeonAdventureState;
  dispatch: React.Dispatch<DungeonAdventureAction>;
  loadAdventureData: () => Promise<void>;
  selectDecision: (decision: AdventureDecision) => void;
  completeAdventure: () => Promise<void>;
  handleCombatEnd: (result: { isVictory: boolean; ranAway: boolean; monsterName: string }) => void;
  continueToNextAdventure: () => Promise<void>;
}

const DungeonAdventureContext = createContext<DungeonAdventureContextType | null>(null);

// Reducer function
function dungeonAdventureReducer(state: DungeonAdventureState, action: DungeonAdventureAction): DungeonAdventureState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_CHARACTER':
      return { ...state, character: action.payload };
    case 'SET_DUNGEON':
      return { ...state, dungeon: action.payload };
    case 'SET_ADVENTURE':
      return { ...state, adventure: action.payload };
    case 'SET_SELECTED_DECISION':
      return { ...state, selectedDecision: action.payload };
    case 'SET_OUTCOME':
      return { ...state, outcome: action.payload };
    case 'SET_COMBAT_ID':
      return { ...state, combatId: action.payload };
    case 'SET_SHOW_PRE_COMBAT':
      return { ...state, showPreCombat: action.payload };
    case 'SET_SHOW_COMBAT':
      return { ...state, showCombat: action.payload };
    case 'SET_SHOW_REWARDS':
      return { ...state, showRewards: action.payload };
    case 'SET_OLD_EXPERIENCE':
      return { ...state, oldExperience: action.payload };
    case 'SET_SHOW_LEVEL_UP':
      return { ...state, showLevelUp: action.payload };
    case 'SET_SKIP_COMBAT_CHECK':
      return { ...state, skipCombatCheck: action.payload };
    case 'SET_REWARD_ITEM':
      return { ...state, rewardItem: action.payload };
    case 'SET_COMBAT_RESULT':
      return { ...state, combatResult: action.payload };
    case 'RESET_ADVENTURE_STATE':
      return {
        ...state,
        selectedDecision: null,
        outcome: null,
        showPreCombat: false,
        showRewards: false,
        showLevelUp: false,
        combatId: null,
        showCombat: false,
        rewardItem: null,
        combatResult: null
      };
    default:
      return state;
  }
}

// Provider component
interface DungeonAdventureProviderProps {
  character: Character;
  dungeon: CharacterDungeon;
  children: ReactNode;
}

export function DungeonAdventureProvider({ 
  character, 
  dungeon,
  children 
}: DungeonAdventureProviderProps) {
  // Initial state
  const initialState: DungeonAdventureState = {
    loading: true,
    error: null,
    character,
    dungeon,
    adventure: null,
    selectedDecision: null,
    outcome: null,
    combatId: dungeon.combat_id || null,
    showPreCombat: false,
    showCombat: !!dungeon.combat_id,
    showRewards: false,
    oldExperience: 0,
    showLevelUp: false,
    skipCombatCheck: false,
    rewardItem: null,
    combatResult: null
  };

  const [state, dispatch] = useReducer(dungeonAdventureReducer, initialState);

  // Load adventure data
  const loadAdventureData = useCallback(async (options?: {
    forceSkipCombatCheck?: boolean,
    forceLoadNewAdventure?: boolean
  }) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      console.log('Loading dungeon adventure data...');
      
      const skipCombatCheck = options?.forceSkipCombatCheck || state.skipCombatCheck;
      const forceLoadNewAdventure = options?.forceLoadNewAdventure || false;
      
      // Get current dungeon state from database
      const dungeonStateResponse = await getDungeonState(dungeon.id);
      
      if (!dungeonStateResponse.success || !dungeonStateResponse.data) {
        console.error('Failed to get dungeon state:', dungeonStateResponse.error);
        dispatch({ 
          type: 'SET_LOADING', payload: false 
        });
        return;
      }
      
      const currentDungeonState = dungeonStateResponse.data;
      const currentState = currentDungeonState.current_state;
      console.log(`Current dungeon state: ${currentState}, adventure_id: ${currentDungeonState.current_adventure_id}`);
      
      // If dungeon is completed, just return
      if (currentState === 'completed' || currentState === 'exited') {
        console.log('Dungeon is completed or exited, not loading adventure');
        dispatch({ type: 'SET_LOADING', payload: false });
        return;
      }
      
      // Check for active combat if not skipping combat check
      if (currentState === 'combat' && !skipCombatCheck) {
        if (currentDungeonState.combat_id) {
          console.log(`Found active combat: ${currentDungeonState.combat_id}`);
          dispatch({ type: 'SET_COMBAT_ID', payload: currentDungeonState.combat_id });
          
          // If we have an outcome, show pre-combat, otherwise show combat directly
          if (currentDungeonState.outcome_id) {
            dispatch({ type: 'SET_SHOW_PRE_COMBAT', payload: true });
            dispatch({ type: 'SET_SHOW_COMBAT', payload: false });
          } else {
            dispatch({ type: 'SET_SHOW_COMBAT', payload: true });
          }
          
          dispatch({ type: 'SET_LOADING', payload: false });
          return;
        }
      } else if (skipCombatCheck) {
        // Reset the skip combat check flag after using it once
        dispatch({ type: 'SET_SKIP_COMBAT_CHECK', payload: false });
      }
      
      // If in outcome state and has outcome, stay there unless forced to load new adventure
      if (currentState === 'outcome' && currentDungeonState.outcome_id && !forceLoadNewAdventure) {
        console.log('Found outcome state, not loading new adventure');
        dispatch({ type: 'SET_LOADING', payload: false });
        return;
      }
      
      // Check if we have a saved adventure_id and it's not locally loaded
      const needsToFetchSavedAdventure = currentDungeonState.current_adventure_id && !state.adventure && !forceLoadNewAdventure;
      const needsNewAdventure = !currentDungeonState.current_adventure_id || !state.adventure || forceLoadNewAdventure;
      
      if (needsToFetchSavedAdventure) {
        console.log(`Fetching saved adventure ID ${currentDungeonState.current_adventure_id}`);
        // We have a saved adventure_id but no adventure loaded - fetch it
        const savedResponse = await getDungeonAdventure(character, dungeon.id);
        
        if (savedResponse.success && savedResponse.data) {
          console.log(`Successfully loaded saved adventure: ${savedResponse.data.title}`);
          dispatch({ type: 'SET_ADVENTURE', payload: savedResponse.data });
          
          // Also restore decision if available
          if (currentDungeonState.decision_id && savedResponse.data.decisions) {
            const decision = savedResponse.data.decisions.find(d => d.id === currentDungeonState.decision_id);
            if (decision) {
              dispatch({ type: 'SET_SELECTED_DECISION', payload: decision });
            }
          }
          
          dispatch({ type: 'SET_LOADING', payload: false });
          return;
        } else {
          console.error('Failed to load saved adventure:', savedResponse.error);
          // Fall through to get a new adventure
        }
      }
      
      // Either we need a new adventure or failed to load saved one
      if (needsNewAdventure) {
        console.log('Getting a new adventure...');
        // Load a new adventure
        const response = await getDungeonAdventure(character, dungeon.id);
        
        if (!response.success || !response.data) {
          console.error('Failed to get dungeon adventure:', response.error);
          dispatch({ 
            type: 'SET_ERROR', 
            payload: response.error || 'Failed to load dungeon adventure' 
          });
          dispatch({ type: 'SET_LOADING', payload: false });
          return;
        }
        
        console.log(`Successfully loaded new adventure: ${response.data.title}`);
        // Update the state with the new adventure
        dispatch({ type: 'SET_ADVENTURE', payload: response.data });
        
        // Update the database state to adventure
        await updateDungeonState(dungeon.id, {
          current_state: 'adventure',
          current_adventure_id: response.data.id
        });
      }
      
      dispatch({ type: 'SET_LOADING', payload: false });
    } catch (error) {
      console.error('Error loading dungeon adventure:', error);
      dispatch({ type: 'SET_ERROR', payload: 'An unexpected error occurred' });
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [character, dungeon.id, state.adventure, state.skipCombatCheck]);

  // Select decision
  const selectDecision = useCallback(async (decision: AdventureDecision) => {
    dispatch({ type: 'SET_SELECTED_DECISION', payload: decision });
    
    // Persist the decision to the database
    if (state.adventure) {
      try {
        await updateDungeonState(dungeon.id, {
          current_state: 'adventure',
          decision_id: decision.id,
          current_adventure_id: state.adventure.id
        });
      } catch (error) {
        console.error('Error persisting decision:', error);
        // Continue anyway as this isn't critical for UI functionality
      }
    }
  }, [dungeon.id, state.adventure]);

  // Complete adventure
  const completeAdventure = useCallback(async () => {
    if (!state.adventure || !state.selectedDecision) return;
    
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const currentExperience = state.character.experience;
      
      const result = await completeDungeonAdventure({
        character: state.character,
        dungeonId: state.dungeon.id,
        adventureId: state.adventure.id,
        decisionId: state.selectedDecision.id
      });
      
      if (!result.success || !result.data) {
        dispatch({ 
          type: 'SET_ERROR', 
          payload: result.error || 'Failed to complete dungeon adventure' 
        });
        dispatch({ type: 'SET_LOADING', payload: false });
        return;
      }
      
      // Save old experience for level up check
      dispatch({ type: 'SET_OLD_EXPERIENCE', payload: currentExperience });
      
      // Set the outcome
      dispatch({ type: 'SET_OUTCOME', payload: result.data.outcome });
      
      // Check if outcome has combat
      if (result.data.outcome.has_combat && result.data.combat) {
        // Update database state to combat
        await updateDungeonState(dungeon.id, {
          current_state: 'combat',
          current_adventure_id: state.adventure.id,
          decision_id: state.selectedDecision.id,
          outcome_id: result.data.outcome.id,
          combat_id: result.data.combat.id
        });
        
        dispatch({ type: 'SET_COMBAT_ID', payload: result.data.combat.id });
        dispatch({ type: 'SET_SHOW_COMBAT', payload: false });
        dispatch({ type: 'SET_SHOW_PRE_COMBAT', payload: true });
      } else {
        // Update database state to outcome if no combat
        await updateDungeonState(dungeon.id, {
          current_state: 'outcome',
          current_adventure_id: state.adventure.id,
          decision_id: state.selectedDecision.id,
          outcome_id: result.data.outcome.id,
          combat_id: null
        });
      }
      
      // Set reward item if available
      if (result.data.rewardItem) {
        dispatch({ type: 'SET_REWARD_ITEM', payload: result.data.rewardItem });
      }
      
      // Show level up animation if experience increased enough to level up
      if (result.data.character.experience > currentExperience) {
        const oldLevel = getLevelFromExperience(currentExperience);
        const newLevel = getLevelFromExperience(result.data.character.experience);
        
        if (newLevel > oldLevel) {
          dispatch({ type: 'SET_SHOW_LEVEL_UP', payload: true });
        }
      }
      
      // Update character
      dispatch({ type: 'SET_CHARACTER', payload: result.data.character });
      
      // Update dungeon
      dispatch({ type: 'SET_DUNGEON', payload: result.data.dungeon });
    } catch (err) {
      console.error('Error completing dungeon adventure:', err);
      dispatch({ type: 'SET_ERROR', payload: 'An unexpected error occurred' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [state.adventure?.id, state.character, state.dungeon.id, state.selectedDecision?.id]);

  // Handle combat end
  const handleCombatEnd = useCallback(async (result: { isVictory: boolean; ranAway: boolean; monsterName: string }) => {
    // Set flag to skip combat check on next loadAdventureData call
    dispatch({ type: 'SET_SKIP_COMBAT_CHECK', payload: true });
    
    // Clear combat state
    dispatch({ type: 'SET_SHOW_COMBAT', payload: false });
    dispatch({ type: 'SET_COMBAT_ID', payload: null });
    
    // Store the combat result in state
    dispatch({ type: 'SET_COMBAT_RESULT', payload: result });
    
    // Always show rewards for victories
    if (result.isVictory) {
      dispatch({ type: 'SET_SHOW_REWARDS', payload: true });
    }
    
    let outcomeData: AdventureOutcome;
    
    // Create an appropriate outcome message based on the result
    if (result.ranAway) {
      outcomeData = {
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
        created_at: new Date().toISOString(),
        is_success: false
      };
      
      dispatch({ type: 'SET_OUTCOME', payload: outcomeData });
    } else if (!result.isVictory) {
      // If defeated, create a defeat outcome
      outcomeData = {
        id: 0,
        decision_id: 0,
        description: `You were defeated by the ${result.monsterName}!`,
        experience_bonus: 0, 
        gold_bonus: 0,
        hitpoints_change: 0,
        energy_change: 0,
        has_combat: true,
        monster_ids: [],
        stat_requirements: null,
        reward_table_id: null,
        success_rate_formula: null,
        created_at: new Date().toISOString(),
        is_success: false
      };
      
      dispatch({ type: 'SET_OUTCOME', payload: outcomeData });
    } else {
      // If victory, we already have the outcome in state, use that
      outcomeData = state.outcome!;
    }
    
    // Update database state to reflect combat result
    try {
      await updateDungeonState(dungeon.id, {
        current_state: 'outcome',
        combat_id: null
      });
    } catch (error) {
      console.error('Error updating dungeon state after combat:', error);
      // Continue anyway as this doesn't affect the UI functionality
    }
  }, [dungeon.id, state.outcome]);

  // Continue to next adventure
  const continueToNextAdventure = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // Reset adventure ID in the database to clear the current adventure
      // This ensures we get a fresh adventure on the next load
      try {
        await updateDungeonState(dungeon.id, {
          current_adventure_id: null,
          decision_id: null,
          outcome_id: null,
          combat_id: null,
          current_state: 'started'
        });
      } catch (updateError) {
        console.error('Error resetting dungeon adventure state:', updateError);
        // Continue anyway, this isn't critical for UI functionality
      }
      
      // Reset state for next adventure
      dispatch({ type: 'RESET_ADVENTURE_STATE' });
      
      // Set flag to skip combat check on next loadAdventureData call
      dispatch({ type: 'SET_SKIP_COMBAT_CHECK', payload: true });
      
      // Force load a new adventure with special options
      await loadAdventureData({
        forceSkipCombatCheck: true,
        forceLoadNewAdventure: true
      });
    } catch (error) {
      console.error('Error loading next dungeon adventure:', error);
      dispatch({ type: 'SET_ERROR', payload: 'An unexpected error occurred' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [loadAdventureData, dungeon.id]);

  // Initial load
  useEffect(() => {
    // Set a timeout to allow the component to fully mount
    const timer = setTimeout(() => {
      loadAdventureData();
    }, 100);
    
    return () => clearTimeout(timer);
  }, [loadAdventureData]);

  const contextValue = {
    state,
    dispatch,
    loadAdventureData,
    selectDecision,
    completeAdventure,
    handleCombatEnd,
    continueToNextAdventure,
  };

  return (
    <DungeonAdventureContext.Provider value={contextValue}>
      {children}
    </DungeonAdventureContext.Provider>
  );
}

// Custom hook to use the dungeon adventure context
export function useDungeonAdventure() {
  const context = useContext(DungeonAdventureContext);
  
  if (!context) {
    throw new Error('useDungeonAdventure must be used within a DungeonAdventureProvider');
  }
  
  return context;
}
