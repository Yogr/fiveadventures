'use client';

import { useState, useEffect } from 'react';
import { 
  getDungeonAdventure, 
  completeDungeonAdventure 
} from '@/app/actions/dungeon';
import type { 
  Character, 
  CharacterDungeon, 
  Adventure, 
  AdventureDecision, 
  AdventureOutcome,
  RewardItem
} from '@/lib/types';
import LoadingSpinner from '@/components/ui/loading-spinner';
import ErrorView from '@/components/adventure/views/ErrorView';
import AdventureView from '@/components/adventure/views/AdventureView';
import OutcomeView from '@/components/adventure/views/OutcomeView';
import PreCombatView from '@/components/adventure/views/PreCombatView';
import CombatInterface from '@/components/combat/combat-interface';

interface DungeonAdventureContentProps {
  character: Character;
  dungeon: CharacterDungeon;
}

export default function DungeonAdventureContent({ 
  character, 
  dungeon 
}: DungeonAdventureContentProps) {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const [adventure, setAdventure] = useState<Adventure | null>(null);
  const [selectedDecision, setSelectedDecision] = useState<AdventureDecision | null>(null);
  const [outcome, setOutcome] = useState<AdventureOutcome | null>(null);
  const [rewardItem, setRewardItem] = useState<RewardItem | null>(null);
  
  const [combatId, setCombatId] = useState<string | null>(null);
  const [showCombat, setShowCombat] = useState<boolean>(false);
  const [showPreCombat, setShowPreCombat] = useState<boolean>(false);
  const [showRewards, setShowRewards] = useState<boolean>(false);
  const [oldExperience, setOldExperience] = useState<number>(0);
  const [showLevelUp, setShowLevelUp] = useState<boolean>(false);
  const [combatResult, setCombatResult] = useState<{isVictory: boolean; ranAway: boolean; monsterName: string} | null>(null);

  // Load dungeon adventure data
  useEffect(() => {
    async function loadDungeonAdventure() {
      setLoading(true);
      setError(null);
      
      try {
        // Check if we're in combat
        if (dungeon.combat_id) {
          setCombatId(dungeon.combat_id);
          setShowCombat(true);
          setLoading(false);
          return;
        }
        
        // Check if we have an outcome
        if (dungeon.outcome_id) {
          // TODO: Fetch outcome details if needed
          setLoading(false);
          return;
        }
        
        // Load a new adventure
        const response = await getDungeonAdventure(character, dungeon.id);
        
        if (!response.success) {
          console.error('Failed to get dungeon adventure:', response.error);
          setError(response.error || 'Failed to load dungeon adventure');
          setLoading(false);
          return;
        }
        
        // Set the adventure
        setAdventure(response.data || null);
        setLoading(false);
      } catch (err) {
        console.error('Error loading dungeon adventure:', err);
        setError('An unexpected error occurred');
        setLoading(false);
      }
    }
    
    loadDungeonAdventure();
  }, [character, dungeon]);

  // Handle decision selection
  const handleDecisionSelect = (decision: AdventureDecision) => {
    setSelectedDecision(decision);
  };

  // Handle adventure completion
  const handleCompleteAdventure = async () => {
    if (!adventure || !selectedDecision) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Get the old experience for level up check
      setOldExperience(character.experience);
      
      const response = await completeDungeonAdventure({
        character,
        dungeonId: dungeon.id,
        adventureId: adventure.id,
        decisionId: selectedDecision.id
      });
      
      if (!response.success || !response.data) {
        console.error('Failed to complete dungeon adventure:', response.error);
        setError(response.error || 'Failed to complete adventure');
        setLoading(false);
        return;
      }
      
      // Set the outcome
      setOutcome(response.data.outcome);
      
      // Check if outcome has combat
      if (response.data.outcome.has_combat && response.data.combat) {
        setCombatId(response.data.combat.id);
        setShowPreCombat(true);
      }
      
      // Set reward item if available
      if (response.data.rewardItem) {
        setRewardItem(response.data.rewardItem);
      }
      
      // Update character
      // In a real implementation, you'd update the global character state
      
      setLoading(false);
    } catch (err) {
      console.error('Error completing dungeon adventure:', err);
      setError('An unexpected error occurred');
      setLoading(false);
    }
  };

  // Handle combat end
  const handleCombatEnd = (result: {isVictory: boolean; ranAway: boolean; monsterName: string}) => {
    setShowCombat(false);
    setCombatId(null);
    setCombatResult(result);
    
    if (result.isVictory) {
      setShowRewards(true);
    }
  };

  // Handle continue to next adventure
  const handleContinueToNextAdventure = () => {
    // Reset state for next adventure
    setSelectedDecision(null);
    setOutcome(null);
    setShowPreCombat(false);
    setShowRewards(false);
    setShowCombat(false);
    setCombatId(null);
    setCombatResult(null);
    setRewardItem(null);
    
    // Reload the adventure
    loadDungeonAdventure();
  };

  // Helper function to load adventure data
  async function loadDungeonAdventure() {
    setLoading(true);
    setError(null);
    
    try {
      const response = await getDungeonAdventure(character, dungeon.id);
      
      if (!response.success || !response.data) {
        console.error('Failed to get dungeon adventure:', response.error);
        setError(response.error || 'Failed to load dungeon adventure');
        setLoading(false);
        return;
      }
      
      // Set the adventure
      setAdventure(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error loading dungeon adventure:', err);
      setError('An unexpected error occurred');
      setLoading(false);
    }
  }

  // Generate a message override for combat results
  const getMessageOverride = () => {
    if (!outcome) return undefined;
    
    if (combatResult) {
      if (combatResult.ranAway) {
        return `You ran away from the ${combatResult.monsterName}!`;
      } else if (combatResult.isVictory) {
        return `You were victorious against the ${combatResult.monsterName}!`;
      } else {
        return `You were defeated by the ${combatResult.monsterName}!`;
      }
    }
    
    return undefined;
  };

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
  
  // Show pre-combat view if available
  if (showPreCombat && outcome && combatId && !showCombat) {
    return (
      <PreCombatView
        outcome={outcome}
        character={character}
        onContinue={() => {
          setShowPreCombat(false);
          setShowCombat(true);
        }}
      />
    );
  }

  // Show combat if available
  if (showCombat && combatId) {
    // Convert area.id from number to string to match the expected type
    const areaForCombat = {
      id: String(dungeon.area.id),
      name: dungeon.area.name,
      image: dungeon.area.image || 'dungeonbackground'
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
    const messageOverride = getMessageOverride();
    
    return (
      <OutcomeView
        outcome={outcome}
        character={character}
        oldExperience={oldExperience}
        showRewards={showRewards}
        showLevelUp={showLevelUp}
        rewardItem={rewardItem}
        messageOverride={messageOverride}
        onContinue={handleContinueToNextAdventure}
      />
    );
  }
  
  // All dungeon adventures completed
  if (dungeon.current_adventure_count >= 3) {
    return (
      <div className="p-6 bg-amber-900/50 rounded-lg border border-amber-700 text-center">
        <h2 className="text-xl font-bold text-amber-200 mb-4">Dungeon Completed!</h2>
        <p className="text-amber-300 mb-4">
          You have completed all adventures in this dungeon. Return to select a new dungeon.
        </p>
      </div>
    );
  }
  
  // If we don't have an adventure, show an error
  if (!adventure) {
    return (
      <div className="p-6 bg-amber-900/50 rounded-lg border border-amber-700 text-center">
        <h2 className="text-xl font-bold text-amber-200 mb-4">No Adventure Available</h2>
        <p className="text-amber-300 mb-4">
          There are no adventures available in this dungeon.
        </p>
      </div>
    );
  }
  
  // Show adventure and decisions
  return (
    <AdventureView 
      adventure={adventure}
      character={character}
      onDecisionSelect={handleDecisionSelect}
      onAdventureComplete={handleCompleteAdventure}
      selectedDecision={selectedDecision}
    />
  );
}
