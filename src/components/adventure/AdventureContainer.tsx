'use client';

import { memo, useEffect } from 'react';
import { useAdventure } from './AdventureContext';
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

const AdventureContainer = memo(function AdventureContainer() {
  const { 
    state, 
    dispatch, 
    loadCharacterData, 
    loadAreaData,
    handleCombatEnd
  } = useAdventure();
  
  const { 
    loading, 
    error, 
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

export default AdventureContainer;
