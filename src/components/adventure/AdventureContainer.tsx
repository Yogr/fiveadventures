'use client';

import { memo, useEffect } from 'react';
import { useAdventure } from './AdventureContext';
import { AdventureStateProvider, useAdventureState } from './AdventureStateContext';
import LoadingSpinner from '@/components/ui/loading-spinner';
import ErrorView from './views/ErrorView';
import NoCharacterView from './views/NoCharacterView';
import AllAdventuresCompletedView from './views/AllAdventuresCompletedView';
import AreaSelectionView from './views/AreaSelectionView';
import NoAdventureView from './views/NoAdventureView';
import AdventureView from './views/AdventureView';
import OutcomeView from './views/OutcomeView';
import PreCombatView from './views/PreCombatView';
import CombatInterface from '@/components/combat/combat-interface';
import { MAX_ADVENTURES_PER_DAY } from '@/lib/constants';

// Inner component that uses both contexts
const AdventureContainerInner = memo(function AdventureContainerInner() {
  const {
    state,
    loadAreaData,
    handleCombatEnd
  } = useAdventure();
  
  const {
    loading: adventureLoading,
    error: adventureError,
    character,
    areas,
    selectedArea,
    adventure,
    outcome,
    combatId,
    showPreCombat,
    showCombat,
    showRewards,
    oldExperience,
    showLevelUp
  } = state;

  // Function to get message override based on combat outcome
  const getMessageOverride = () => {
    console.log('AdventureContainer: getMessageOverride called');
    console.log('AdventureContainer: state.combatResult =', state.combatResult);
    
    // If we don't have outcome, return undefined
    if (!outcome) {
      console.log('AdventureContainer: No outcome, returning undefined');
      return undefined;
    }
    
    // Use the combat result stored in state if available
    if (state.combatResult) {
      console.log('AdventureContainer: Using combat result from state');
      if (state.combatResult.ranAway) {
        const message = `You ran away from the ${state.combatResult.monsterName}!`;
        console.log('AdventureContainer: Returning message:', message);
        return message;
      } else if (state.combatResult.isVictory) {
        const message = `You were victorious against the ${state.combatResult.monsterName}!`;
        console.log('AdventureContainer: Returning message:', message);
        return message;
      } else {
        const message = `You were defeated by the ${state.combatResult.monsterName}!`;
        console.log('AdventureContainer: Returning message:', message);
        return message;
      }
    }
    
    console.log('AdventureContainer: No combat result, returning undefined');
    return undefined;
  };
  
  // Get adventure state from context
  const { 
    loading: stateLoading, 
    error: stateError, 
    adventureState 
  } = useAdventureState();
  
  // Combine loading and error states
  const loading = adventureLoading || stateLoading;
  const error = adventureError || stateError;
  
  // Load selected area if character exists
  useEffect(() => {
    if (character) {
      console.log('Character exists, loading area data...');
      loadAreaData(character.id, character.last_played_day);
    }
  }, [character?.id, character?.last_played_day, loadAreaData]);
  
  if (loading) {
    return (
      <div className="flex justify-center items-center w-full h-full min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }
  
  if (error) {
    return <ErrorView error={error} />;
  }
  
  if (!character) {
    return <NoCharacterView />;
  }
  
  // Show pre-combat view if available
  if (showPreCombat && outcome && combatId && character && selectedArea && !showCombat) {
    console.log('AdventureContainer: Showing pre-combat view');
    return (
      <PreCombatView
        outcome={outcome}
        character={character}
      />
    );
  }

  // Show combat if available - this takes precedence over outcome
  if (showCombat && combatId && character && selectedArea) {
    console.log('AdventureContainer: Showing combat interface');
    // Convert area.id from number to string to match the expected type
    const areaForCombat = {
      id: String(selectedArea.id),
      name: selectedArea.name,
      image: selectedArea.image || 'enchanted-forest' // Default image if none is provided
    };
    
    return (
      <CombatInterface 
        combatId={combatId}
        character={character}
        area={areaForCombat}
        onCombatEnd={handleCombatEnd}
      />
    );
  }
  
  // Show outcome if available
  if (outcome) {
    console.log('AdventureContainer: Rendering OutcomeView with state.combatResult =', state.combatResult);
    const messageOverride = getMessageOverride();
    console.log('AdventureContainer: messageOverride =', messageOverride);
    
    return (
      <OutcomeView
        outcome={outcome}
        character={character}
        oldExperience={oldExperience}
        showRewards={showRewards}
        showLevelUp={showLevelUp}
        rewardItem={state.rewardItem}
        messageOverride={messageOverride}
      />
    );
  }
  
  // All adventures completed for the day
  if (character.daily_adventure_count >= MAX_ADVENTURES_PER_DAY) {
    return <AllAdventuresCompletedView character={character} />;
  }
  
  // Show area selection if no area has been selected
  if (!selectedArea) {
    return (
      <AreaSelectionView 
        areas={areas}
        character={character}
      />
    );
  }
  
  if (!adventure) {
    return (
      <NoAdventureView 
        character={character}
        selectedArea={selectedArea}
      />
    );
  }
  
  // Show adventure and decisions
  return (
    <AdventureView 
      adventure={adventure}
      character={character}
    />
  );
});

// Outer component that provides the AdventureStateProvider
const AdventureContainer = memo(function AdventureContainer() {
  const { state } = useAdventure();
  const { character } = state;
  
  if (!character) {
    return <NoCharacterView />;
  }
  
  return (
    <AdventureStateProvider character={character}>
      <AdventureContainerInner />
    </AdventureStateProvider>
  );
});

export default AdventureContainer;
