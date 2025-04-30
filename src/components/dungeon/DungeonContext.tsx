'use client';

import React, { createContext, useContext, useReducer, useState } from 'react';
import type { Character, Area, Adventure, AdventureDecision, AdventureOutcome, CharacterDungeon } from '@/lib/types';

// Define the dungeon state types
export type DungeonStateType = 'started' | 'adventure' | 'decision' | 'outcome' | 'combat' | 'completed' | 'exited';

// Define the dungeon state context
interface DungeonState {
  character: Character | null;
  dungeon: CharacterDungeon | null;
  area: Area | null;
  adventure: Adventure | null;
  adventureCount: number;
  selectedDecision: AdventureDecision | null;
  outcome: AdventureOutcome | null;
  combatId: string | null;
  combatVictory: boolean | null;
  showPreCombat: boolean;
}

// Define actions for state updates
type DungeonAction =
  | { type: 'SET_CHARACTER'; payload: Character }
  | { type: 'SET_DUNGEON'; payload: CharacterDungeon }
  | { type: 'SET_AREA'; payload: Area }
  | { type: 'SET_ADVENTURE'; payload: Adventure | null }
  | { type: 'SET_ADVENTURE_COUNT'; payload: number }
  | { type: 'SET_DECISION'; payload: AdventureDecision | null }
  | { type: 'SET_OUTCOME'; payload: AdventureOutcome | null }
  | { type: 'SET_COMBAT_ID'; payload: string | null }
  | { type: 'SET_COMBAT_VICTORY'; payload: boolean | null }
  | { type: 'SET_SHOW_PRE_COMBAT'; payload: boolean }
  | { type: 'RESET' };

// Initial state
const initialState: DungeonState = {
  character: null,
  dungeon: null,
  area: null,
  adventure: null,
  adventureCount: 0,
  selectedDecision: null,
  outcome: null,
  combatId: null,
  combatVictory: null,
  showPreCombat: false
};

// Reducer function
function dungeonReducer(state: DungeonState, action: DungeonAction): DungeonState {
  switch (action.type) {
    case 'SET_CHARACTER':
      return { ...state, character: action.payload };
    case 'SET_DUNGEON':
      return { ...state, dungeon: action.payload };
    case 'SET_AREA':
      return { ...state, area: action.payload };
    case 'SET_ADVENTURE':
      return { ...state, adventure: action.payload };
    case 'SET_ADVENTURE_COUNT':
      return { ...state, adventureCount: action.payload };
    case 'SET_DECISION':
      return { ...state, selectedDecision: action.payload };
    case 'SET_OUTCOME':
      return { ...state, outcome: action.payload };
    case 'SET_COMBAT_ID':
      return { ...state, combatId: action.payload };
    case 'SET_COMBAT_VICTORY':
      return { ...state, combatVictory: action.payload };
    case 'SET_SHOW_PRE_COMBAT':
      return { ...state, showPreCombat: action.payload };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

// Create contexts
const DungeonContext = createContext<{
  state: DungeonState;
  dispatch: React.Dispatch<DungeonAction>;
}>({
  state: initialState,
  dispatch: () => null
});

const DungeonStateContext = createContext<{
  dungeonState: DungeonStateType;
  setDungeonState: React.Dispatch<React.SetStateAction<DungeonStateType>>;
}>({
  dungeonState: 'started',
  setDungeonState: () => null
});

// Provider components
export function DungeonProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(dungeonReducer, initialState);

  return (
    <DungeonContext.Provider value={{ state, dispatch }}>
      {children}
    </DungeonContext.Provider>
  );
}

export function DungeonStateProvider({ children }: { children: React.ReactNode }) {
  const [dungeonState, setDungeonState] = useState<DungeonStateType>('started');

  return (
    <DungeonStateContext.Provider value={{ dungeonState, setDungeonState }}>
      {children}
    </DungeonStateContext.Provider>
  );
}

// Custom hooks to use the context
export function useDungeon() {
  const context = useContext(DungeonContext);
  if (context === undefined) {
    throw new Error('useDungeon must be used within a DungeonProvider');
  }
  return context;
}

export function useDungeonState() {
  const context = useContext(DungeonStateContext);
  if (context === undefined) {
    throw new Error('useDungeonState must be used within a DungeonStateProvider');
  }
  return context;
}
