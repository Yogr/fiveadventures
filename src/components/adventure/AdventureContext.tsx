'use client';

import { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { Character, Adventure, AdventureDecision, AdventureOutcome, Combat, Area, RewardItem } from '@/lib/types';
import { getCharacterById } from '@/app/actions/character';
import { getAdventure } from '@/app/actions/adventure';
import { getActiveCharacterCombat } from '@/app/actions/combat';
import { getSelectedArea } from '@/app/actions/area';
import { updateAdventureState } from '@/app/actions/adventure-state';
import { getLevelFromExperience } from '@/lib/utils';

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
  showPreCombat: boolean; // New flag to show pre-combat screen
  showCombat: boolean;
  showRewards: boolean;
  oldExperience: number;
  showLevelUp: boolean;
  skipCombatCheck: boolean; // Flag to skip combat check after combat ends
  rewardItem: RewardItem | null;
  combatResult: { isVictory: boolean; ranAway: boolean; monsterName: string } | null;
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
  | { type: 'SET_SHOW_PRE_COMBAT'; payload: boolean } // New action for pre-combat screen
  | { type: 'SET_SHOW_COMBAT'; payload: boolean }
  | { type: 'SET_SHOW_REWARDS'; payload: boolean }
  | { type: 'SET_OLD_EXPERIENCE'; payload: number }
  | { type: 'SET_SHOW_LEVEL_UP'; payload: boolean }
  | { type: 'SET_SKIP_COMBAT_CHECK'; payload: boolean }
  | { type: 'SET_REWARD_ITEM'; payload: RewardItem | null }
  | { type: 'SET_COMBAT_RESULT'; payload: { isVictory: boolean; ranAway: boolean; monsterName: string } | null }
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
  showPreCombat: false, // Initialize pre-combat flag to false
  showCombat: false,
  showRewards: false,
  oldExperience: 0,
  showLevelUp: false,
  skipCombatCheck: false,
  rewardItem: null,
  combatResult: null,
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
      console.log('AdventureContext: Reducer processing SET_COMBAT_RESULT action with payload:', action.payload);
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
        combatResult: null,
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
  const router = useRouter();
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
      console.log('Loading area data for character:', characterId, 'day:', day);
      const selectedAreaResponse = await getSelectedArea(characterId, day);
      
      console.log('Selected area response:', selectedAreaResponse);
      
      if (selectedAreaResponse.success && selectedAreaResponse.data) {
        // Find the area object from the areas array
        const areaId = selectedAreaResponse.data;
        const areas = state.areas; // Capture areas to avoid dependency on state.areas
        console.log('Found area ID:', areaId, 'looking in areas:', areas.map(a => a.id));
        
        const selectedAreaObj = areas.find(area => area.id === areaId);
        
        if (selectedAreaObj) {
          console.log('Found matching area object:', selectedAreaObj.name);
          dispatch({ type: 'SET_SELECTED_AREA', payload: selectedAreaObj });
        } else {
          console.log('Area ID not found in areas array');
          // Area ID not found in areas array, set selectedArea to null
          dispatch({ type: 'SET_SELECTED_AREA', payload: null });
        }
      } else {
        console.log('No area selected yet, setting selectedArea to null');
        // No area selected yet, set selectedArea to null
        dispatch({ type: 'SET_SELECTED_AREA', payload: null });
      }
    } catch (error) {
      console.error('Error loading area data:', error);
      // In case of error, set selectedArea to null
      dispatch({ type: 'SET_SELECTED_AREA', payload: null });
    }
  }, [dispatch]); // Remove state.areas dependency

  // Load adventure data
  const loadAdventureData = useCallback(async () => {
    if (!state.character || !state.selectedArea) return;
    
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const characterId = state.character.id;
      const selectedAreaId = state.selectedArea.id;
      const skipCombatCheck = state.skipCombatCheck;
      const hasOutcome = !!state.outcome;
      const adventureCount = state.character.daily_adventure_count;
      
      // Get current adventure state
      const adventureStateResponse = await import('@/app/actions/adventure-state').then(
        ({ getAdventureState }) => getAdventureState(characterId)
      );
      
      let currentState = 'none';
      if (adventureStateResponse.success && adventureStateResponse.data) {
        currentState = adventureStateResponse.data.current_state;
      }
      
      // Check if character has completed all adventures for the day
      if (adventureCount >= 5) { // Using 5 as MAX_ADVENTURES_PER_DAY
        // Update state to adventures_completed if not already
        if (currentState !== 'adventures_completed') {
          await updateAdventureState(characterId, {
            current_state: 'adventures_completed',
            current_adventure_id: null,
            decision_id: null,
            outcome_id: null,
            combat_id: null,
            day: state.character.last_played_day,
            adventure_number: adventureCount
          });
        }
        dispatch({ type: 'SET_LOADING', payload: false });
        return;
      }

      // Only check for active combat if the character's state is 'combat' or we're skipping the check
      if ((currentState === 'combat' || skipCombatCheck) && !skipCombatCheck) {
        // Check if character is in active combat
        const activeCombatResponse = await getActiveCharacterCombat(characterId);
        
        if (activeCombatResponse.success && activeCombatResponse.data) {
          // Update state to combat if not already
          if (currentState !== 'combat') {
            await updateAdventureState(characterId, {
              current_state: 'combat',
              current_adventure_id: null,
              decision_id: null,
              outcome_id: null,
              combat_id: activeCombatResponse.data.id,
              day: state.character.last_played_day,
              adventure_number: adventureCount
            });
          }
          
          dispatch({ type: 'SET_COMBAT_ID', payload: activeCombatResponse.data.id });
          
          // We already have the outcome available from getAdventureState
          // Check if we're resuming a game with an existing combat
          const adventureStateResponse = await import('@/app/actions/adventure-state').then(
            ({ getAdventureState }) => getAdventureState(characterId)
          );
          
          if (adventureStateResponse.success && 
              adventureStateResponse.data && 
              adventureStateResponse.data.outcome_id) {
            // If we have an outcome_id, try to get the outcome from the state
            console.log('Found outcome ID in adventure state, checking if outcome already exists in state');
            
            // If we have an outcome in the state, show pre-combat view
            // Otherwise proceed directly to combat
            if (state.outcome) {
              console.log('Using existing outcome from state:', state.outcome.description);
              // Show pre-combat view first, then combat
              dispatch({ type: 'SET_SHOW_COMBAT', payload: false });
              dispatch({ type: 'SET_SHOW_PRE_COMBAT', payload: true });
            } else {
              console.log('No outcome in state, proceeding directly to combat');
              dispatch({ type: 'SET_SHOW_COMBAT', payload: true });
            }
          } else {
            console.log('No outcome ID found in adventure state, proceeding directly to combat');
            dispatch({ type: 'SET_SHOW_COMBAT', payload: true });
          }
          
          dispatch({ type: 'SET_LOADING', payload: false });
          return;
        }
      } else if (skipCombatCheck) {
        // Reset the skip combat check flag after using it once
        dispatch({ type: 'SET_SKIP_COMBAT_CHECK', payload: false });
      }
      
      // If character is in 'outcome' state, don't load a new adventure
      // UNLESS we're explicitly requesting a new adventure (skip combat check is true)
      if (currentState === 'outcome' && hasOutcome && !skipCombatCheck) {
        console.log('AdventureContext: Character in outcome state with outcome, skipping adventure load');
        dispatch({ type: 'SET_LOADING', payload: false });
        return;
      }
      
      // Update state to adventure
      if (currentState !== 'adventure') {
        await updateAdventureState(characterId, {
          current_state: 'adventure',
          current_adventure_id: null,
          decision_id: null,
          outcome_id: null,
          combat_id: null,
          day: state.character.last_played_day,
          adventure_number: adventureCount
        });
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
  }, [state.character?.id, state.selectedArea?.id, state.skipCombatCheck, !!state.outcome]);

  // Select area
  const selectArea = useCallback(async (area: Area) => {
    if (!state.character) return;
    
    try {
      const characterId = state.character.id;
      
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // Update adventure state to selecting_area
      const { selectArea } = await import('@/app/actions/area');
      await updateAdventureState(characterId, {
        current_state: 'selecting_area',
        current_adventure_id: null,
        decision_id: null,
        outcome_id: null,
        combat_id: null,
        day: state.character.last_played_day,
        adventure_number: state.character.daily_adventure_count
      });
      
      const result = await selectArea(characterId, area.id);
      
      if (result.success) {
        dispatch({ type: 'SET_SELECTED_AREA', payload: area });
        console.log('Area selected, state updated');
      } else {
        dispatch({ type: 'SET_ERROR', payload: result.error || 'Failed to select area' });
      }
    } catch (error) {
      console.error('Error selecting area:', error);
      dispatch({ type: 'SET_ERROR', payload: 'An unexpected error occurred' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [state.character?.id]);

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
      
      const characterId = state.character.id;
      const adventureId = state.adventure.id;
      const decisionId = state.selectedDecision.id;
      const currentExperience = state.character.experience;
      
      const { completeAdventure } = await import('@/app/actions/adventure');
      const result = await completeAdventure({
        character: state.character,
        adventureId: adventureId,
        decisionId: decisionId
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
      dispatch({ type: 'SET_OLD_EXPERIENCE', payload: currentExperience });
      
      // First, set the outcome regardless of where we go next
      dispatch({ type: 'SET_OUTCOME', payload: result.data.outcome });
      
      // Check if outcome has combat
      if (result.data.outcome.has_combat && result.data.combat) {
        // Update adventure state to combat but show pre-combat screen first
        await updateAdventureState(characterId, {
          current_state: 'combat', // Still use combat state in the database
          current_adventure_id: adventureId,
          decision_id: decisionId,
          outcome_id: result.data.outcome.id,
          combat_id: result.data.combat.id,
          day: state.character.last_played_day,
          adventure_number: state.character.daily_adventure_count
        });
        
        // First set combat ID
        dispatch({ type: 'SET_COMBAT_ID', payload: result.data.combat.id });
        
        // Then make sure combat is OFF and pre-combat is ON (order matters!)
        dispatch({ type: 'SET_SHOW_COMBAT', payload: false });
        dispatch({ type: 'SET_SHOW_PRE_COMBAT', payload: true });
        
        console.log('Setting up pre-combat screen with outcome:', result.data.outcome.description);
      } else {
        // Update adventure state to outcome
        await updateAdventureState(characterId, {
          current_state: 'outcome',
          current_adventure_id: adventureId,
          decision_id: decisionId,
          outcome_id: result.data.outcome.id,
          combat_id: null,
          day: state.character.last_played_day,
          adventure_number: state.character.daily_adventure_count
        });
      }
      
      // Set reward item if available
      if (result.data.rewardItem) {
        dispatch({ type: 'SET_REWARD_ITEM', payload: result.data.rewardItem });
      }
      
      // Show level up animation if experience increased enough to level up
      if (result.data.character.experience > currentExperience) {
        dispatch({ type: 'SET_SHOW_LEVEL_UP', payload: true });
      }
      
      // Update character
      dispatch({ type: 'SET_CHARACTER', payload: result.data.character });
      console.log('Adventure completed, state updated');
    } catch (error) {
      console.error('Error completing adventure:', error);
      dispatch({ type: 'SET_ERROR', payload: 'An unexpected error occurred' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [state.character?.id, state.adventure?.id, state.selectedDecision?.id]);

  // Handle combat end
  const handleCombatEnd = useCallback((result: { isVictory: boolean; ranAway: boolean; monsterName: string }) => {
    console.log('AdventureContext: handleCombatEnd called with result:', result);
    
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
    
    // If the player ran away, show a different outcome
    if (result.ranAway) {
      console.log('AdventureContext: Player ran away, creating custom outcome');
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
    } else if (result.isVictory) {
      // For victories, create an outcome with the rewards
      // The actual reward values will be set by the completeCombat function
      console.log('AdventureContext: Player won, creating victory outcome');
      dispatch({
        type: 'SET_OUTCOME',
        payload: {
          id: 0,
          decision_id: 0,
          description: `You defeated the ${result.monsterName}!`,
          experience_bonus: 0, // Will be updated with actual value
          gold_bonus: 0, // Will be updated with actual value
          hitpoints_change: 0,
          energy_change: 0,
          has_combat: true,
          monster_ids: [],
          stat_requirements: null,
          reward_table_id: null,
          success_rate_formula: null,
          created_at: new Date().toISOString()
        }
      });
    }
    
    // If we have a character and a combat ID, refresh the character data
    if (state.character && state.combatId) {
      const characterId = state.character.id;
      
      // Get the updated character data
      getCharacterById(characterId).then(response => {
        if (response.success && response.data) {
          console.log('AdventureContext: Character data refreshed after combat end');
          
          // Update character in state
          dispatch({ type: 'SET_CHARACTER', payload: response.data });
          
          // Check for level up
          if (state.character && response.data.experience > state.character.experience) {
            const oldLevel = getLevelFromExperience(state.character.experience);
            const newLevel = getLevelFromExperience(response.data.experience);
            
            if (newLevel > oldLevel) {
              console.log(`AdventureContext: Character leveled up from ${oldLevel} to ${newLevel}`);
              
              // Save old experience for level up check
              dispatch({ type: 'SET_OLD_EXPERIENCE', payload: state.character.experience });
              // Set showLevelUp flag
              dispatch({ type: 'SET_SHOW_LEVEL_UP', payload: true });
            }
            
            // If this is a victory, update the outcome with the actual rewards
            if (result.isVictory && state.outcome) {
              const experienceGained = response.data.experience - state.character.experience;
              const goldGained = response.data.gold - (state.character.gold || 0);
              
              const updatedOutcome = {
                ...state.outcome,
                experience_bonus: experienceGained,
                gold_bonus: goldGained
              };
              
              console.log('AdventureContext: Updating outcome with actual rewards:', updatedOutcome);
              dispatch({ type: 'SET_OUTCOME', payload: updatedOutcome });
            }
          }
        } else {
          console.error('AdventureContext: Error refreshing character data after combat:', response.error);
          loadCharacterData(characterId).catch(error => {
            console.error('AdventureContext: Error loading character data:', error);
          });
        }
      }).catch(error => {
        console.error('AdventureContext: Error refreshing character data after combat:', error);
        loadCharacterData(characterId).catch(error => {
          console.error('AdventureContext: Error loading character data:', error);
        });
      });
    }
    
    console.log('AdventureContext: Combat ended');
  }, [state.character, state.combatId, state.outcome, loadCharacterData, dispatch]);

  // Continue to next adventure
  const continueToNextAdventure = useCallback(async () => {
    if (!state.character) return;
    
    try {
      const characterId = state.character.id;
      
      dispatch({ type: 'SET_LOADING', payload: true });
      
      console.log('AdventureContext: Starting transition to next adventure');
      
      // First, update adventure state in the database
      const stateUpdateResult = await updateAdventureState(characterId, {
        current_state: 'adventure',
        current_adventure_id: null,
        decision_id: null,
        outcome_id: null,
        combat_id: null,
        day: state.character.last_played_day,
        adventure_number: state.character.daily_adventure_count
      });
      
      // Verify database update was successful
      if (!stateUpdateResult.success) {
        console.error('AdventureContext: Failed to update adventure state in database:', stateUpdateResult.error);
        dispatch({ type: 'SET_ERROR', payload: 'Failed to update adventure state: ' + stateUpdateResult.error });
        dispatch({ type: 'SET_LOADING', payload: false });
        return;
      }
      
      console.log('AdventureContext: Successfully updated adventure state in database to "adventure"');
      
      // Only reset client state after successful database update
      dispatch({ type: 'RESET_ADVENTURE_STATE' });
      
      // Set flag to skip combat check on next loadAdventureData call
      dispatch({ type: 'SET_SKIP_COMBAT_CHECK', payload: true });
      
      // Clear combat state
      dispatch({ type: 'SET_COMBAT_ID', payload: null });
      
      // Get character data directly and update state
      const { getCharacterById } = await import('@/app/actions/character');
      const response = await getCharacterById(characterId);
      if (response.success && response.data) {
        console.log('AdventureContext: Character data refreshed after continuing to next adventure');
        console.log('AdventureContext: Updated character state:', {
          hp: `${response.data.current_hitpoints}/${response.data.max_hitpoints}`,
          energy: `${response.data.current_energy}/${response.data.max_energy}`,
          gold: response.data.gold,
          adventureCount: response.data.daily_adventure_count
        });
        
        // Update character in state directly
        dispatch({ type: 'SET_CHARACTER', payload: response.data });
      } else {
        console.error('AdventureContext: Failed to fetch character data:', response.error);
        // Fall back to loadCharacterData if getCharacterById fails
        await loadCharacterData(characterId);
      }
      
      // Verify current adventure state again before loading new adventure
      const currentStateResponse = await import('@/app/actions/adventure-state').then(
        ({ getAdventureState }) => getAdventureState(characterId)
      );
      
      if (!currentStateResponse.success || !currentStateResponse.data) {
        console.error('AdventureContext: Failed to verify current adventure state:', currentStateResponse.error);
      } else if (currentStateResponse.data.current_state !== 'adventure') {
        console.warn('AdventureContext: Current state is not "adventure" as expected:', currentStateResponse.data.current_state);
      } else {
        console.log('AdventureContext: Verified current state is "adventure", proceeding to load new adventure');
      }
      
      // Load adventure data
      await loadAdventureData();
      
      console.log('AdventureContext: Successfully transitioned to next adventure');
    } catch (error) {
      console.error('Error loading next adventure:', error);
      dispatch({ type: 'SET_ERROR', payload: 'An unexpected error occurred' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [state.character?.id, loadCharacterData, loadAdventureData, dispatch]);

  // We no longer need a character subscription here as the GameNavigation component
  // already handles character updates, and we only need to react to adventure state changes

  // Reset animation state when outcome ID changes (not on every re-render)
  useEffect(() => {
    if (state.outcome) {
      // Only reset showRewards, but don't reset showLevelUp
      // This prevents the level up animation from being reset by re-renders
      dispatch({ type: 'SET_SHOW_REWARDS', payload: false });
      
      // We no longer reset showLevelUp here, as it should persist
      // until explicitly set to false by the LevelUpAnimation component
    }
  }, [state.outcome?.id]); // Only run when outcome ID changes, not on every outcome change

  // Load adventure data when selected area changes
  useEffect(() => {
    if (state.character && state.selectedArea) {
      loadAdventureData();
    }
  }, [state.character?.id, state.selectedArea?.id, loadAdventureData]);

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
