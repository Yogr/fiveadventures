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
import CombatInterface from '@/components/combat/combat-interface';
import { MAX_ADVENTURES_PER_DAY } from '@/lib/constants';

// Inner component that uses both contexts
const AdventureContainerInner = memo(function AdventureContainerInner() {
  const { 
    state, 
    dispatch, 
    loadCharacterData, 
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
    showCombat,
    showRewards,
    oldExperience,
    showLevelUp
  } = state;
  
  // Get adventure state from context
  const { 
    loading: stateLoading, 
    error: stateError, 
    adventureState 
  } = useAdventureState();
  
  // Combine loading and error states
  const loading = adventureLoading || stateLoading;
  const error = adventureError || stateError;
  
  // We no longer need to load areas on mount since they're passed from the server
  // through AdventureProvider's initialAreas prop
  
  // Load selected area if character exists
  useEffect(() => {
    if (character) {
      console.log('Character exists, loading area data...');
      loadAreaData(character.id, character.last_played_day);
    }
  }, [character?.id, character?.last_played_day, loadAreaData]);
  
  if (loading) {
    return <LoadingSpinner size="lg" />;
  }
  
  if (error) {
    return <ErrorView error={error} />;
  }
  
  if (!character) {
    return <NoCharacterView />;
  }
  
  // All adventures completed for the day
  if (character.daily_adventure_count >= MAX_ADVENTURES_PER_DAY) {
    return <AllAdventuresCompletedView character={character} />;
  }
  
  // Show combat if available
  if (showCombat && combatId && character) {
    return (
      <CombatInterface 
        combatId={combatId}
        character={character}
        onCombatEnd={handleCombatEnd}
      />
    );
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
  
  // Show outcome if available
  if (outcome) {
    return (
      <OutcomeView
        outcome={outcome}
        character={character}
        oldExperience={oldExperience}
        showRewards={showRewards}
        showLevelUp={showLevelUp}
        rewardItem={state.rewardItem}
        messageOverride={undefined} // TODO: Implement a 'getMessageOverride' function to handle this. It should look to see if we are in combat, and if so, return the combat outcome aka. if defeated, won, or ran away. Otherwise, return undefined.
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
      area={selectedArea}
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
