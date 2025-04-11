'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getCharacter } from '@/app/actions/character';
import { getAdventure, completeAdventure } from '@/app/actions/adventure-updated';
import { getActiveCharacterCombat } from '@/app/actions/combat';
import { getAreas, getSelectedArea, selectArea } from '@/app/actions/area';
import { ROUTES, MAX_ADVENTURES_PER_DAY } from '@/lib/constants';
import type { Character, Adventure, AdventureDecision, AdventureOutcome, Combat, Area } from '@/lib/types';
import LoadingSpinner from '@/components/ui/loading-spinner';
import AdventureTracker from '@/components/adventure/adventure-tracker';
import CharacterStats from '@/components/character/character-stats';
import CombatInterface from '@/components/combat/combat-interface';
import AnimatedText from '@/components/ui/animated-text';
import AnimatedReward from '@/components/ui/animated-reward';
import LevelUpAnimation from '@/components/ui/level-up-animation';
import AreaSelection from '@/components/area/area-selection';

interface AdventureContentProps {
  characterId: string;
}

export default function AdventureContent({ characterId }: AdventureContentProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [character, setCharacter] = useState<Character | null>(null);
  const [adventure, setAdventure] = useState<Adventure | null>(null);
  const [selectedDecision, setSelectedDecision] = useState<AdventureDecision | null>(null);
  const [outcome, setOutcome] = useState<AdventureOutcome | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [combatId, setCombatId] = useState<string | null>(null);
  const [showCombat, setShowCombat] = useState(false);
  // Use a state to control when rewards should be shown
  const [showRewards, setShowRewards] = useState(false);
  // Track old experience for level up animation
  const [oldExperience, setOldExperience] = useState(0);
  const [showLevelUp, setShowLevelUp] = useState(false);
  // Area selection states
  const [areas, setAreas] = useState<Area[]>([]);
  const [selectedArea, setSelectedArea] = useState<Area | null>(null);
  const [hasSelectedArea, setHasSelectedArea] = useState(false);
  const [loadingAreas, setLoadingAreas] = useState(false);
  
  // Reset animation state when outcome changes
  useEffect(() => {
    if (outcome) {
      setShowRewards(false);
      setShowLevelUp(false);
    }
  }, [outcome]);

  // Load areas data
  useEffect(() => {
    async function loadAreas() {
      setLoadingAreas(true);
      
      try {
        // Get all areas
        const areasResponse = await getAreas();
        if (!areasResponse.success || !areasResponse.data) {
          console.error('Failed to load areas');
          setLoadingAreas(false);
          return;
        }
        
        setAreas(areasResponse.data);
        
        // Check if character has selected an area for today
        const selectedAreaResponse = await getSelectedArea(characterId);
        if (!selectedAreaResponse.success) {
          console.error('Failed to check selected area');
          setLoadingAreas(false);
          return;
        }
        
        if (selectedAreaResponse.data?.hasSelected && selectedAreaResponse.data.area) {
          // Use type assertion to ensure TypeScript knows this is an Area
          const area: Area = selectedAreaResponse.data.area as Area;
          setSelectedArea(area);
          setHasSelectedArea(true);
        } else {
          setSelectedArea(null);
          setHasSelectedArea(false);
        }
        
        setLoadingAreas(false);
      } catch (err) {
        console.error('Error loading areas:', err);
        setLoadingAreas(false);
      }
    }
    
    if (characterId) {
      loadAreas();
    }
  }, [characterId]);
  
  // Handle area selection
  const handleAreaSelect = async (areaId: number) => {
    setLoadingAreas(true);
    
    try {
      const result = await selectArea(characterId, areaId);
      if (!result.success || !result.data) {
        console.error('Failed to select area');
        setLoadingAreas(false);
        return;
      }
      
      if (result.data.area) {
        // Use type assertion to ensure TypeScript knows this is an Area
        const area: Area = result.data.area as Area;
        setSelectedArea(area);
        setHasSelectedArea(true);
      } else {
        setSelectedArea(null);
        setHasSelectedArea(false);
      }
      
      // Load adventure data after area selection
      loadAdventureData();
    } catch (err) {
      console.error('Error selecting area:', err);
      setLoadingAreas(false);
    }
  };
  
  // Load character and adventure data
  const loadAdventureData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Get character data
      const characterResponse = await getCharacter(characterId);
      if (!characterResponse.success || !characterResponse.data) {
        setError('Failed to load character data');
        setLoading(false);
        return;
      }
      
      setCharacter(characterResponse.data);
      
      // Check if character is in active combat
      const activeCombatResponse = await getActiveCharacterCombat(characterId);
      if (activeCombatResponse.success && activeCombatResponse.data) {
        // Character is in active combat, show combat interface
        setCombatId(activeCombatResponse.data.id);
        setShowCombat(true);
        setLoading(false);
        return;
      }
      
      // Check if character has completed all adventures for the day
      if (characterResponse.data.daily_adventure_count >= MAX_ADVENTURES_PER_DAY) {
        // Set character and stop loading - don't try to get an adventure
        setCharacter(characterResponse.data);
        setLoading(false);
        return;
      }
      
      // Only get next adventure if the character hasn't completed all adventures
      const adventureResponse = await getAdventure(characterId);
      if (!adventureResponse.success || !adventureResponse.data) {
        setError('Failed to load adventure data');
        setLoading(false);
        return;
      }
      
      setAdventure(adventureResponse.data);
      setLoading(false);
    } catch (err) {
      console.error('Error loading adventure data:', err);
      setError('An unexpected error occurred');
      setLoading(false);
    }
  };
  
  // Load adventure data when component mounts
  useEffect(() => {
    if (characterId && hasSelectedArea) {
      loadAdventureData();
    }
  }, [characterId, hasSelectedArea]);

  // Handle decision selection
  const handleDecisionSelect = (decision: AdventureDecision) => {
    console.log('Decision selected:', decision);
    setSelectedDecision(decision);
  };

  // Handle adventure completion
  const handleCompleteAdventure = async () => {
    if (!character || !adventure || !selectedDecision) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await completeAdventure({
        characterId,
        adventureId: adventure.id,
        decisionId: selectedDecision.id
      });
      
      if (!result.success || !result.data) {
        setError(result.error || 'Failed to complete adventure');
        setLoading(false);
        return;
      }
      
      // Make sure result.data exists
      if (result.data) {
        // Save old experience for level up check
        if (character) {
          setOldExperience(character.experience);
        }
        
        // Update character first
        setCharacter(result.data.character);
        
        // Check if outcome has combat
        if (result.data.outcome.has_combat && result.data.combat) {
          setCombatId(result.data.combat.id);
          setShowCombat(true);
        }
        
        // Set loading to false before setting outcome
        setLoading(false);
        
        // Set outcome
        setOutcome(result.data!.outcome);
        
        // Show level up animation if experience increased enough to level up
        if (character && result.data.character.experience > character.experience) {
          setShowLevelUp(true);
        }
      } else {
        setLoading(false);
      }
    } catch (err) {
      console.error('Error completing adventure:', err);
      setError('An unexpected error occurred');
      setLoading(false);
    }
  };
  
  // Handle combat end
  const handleCombatEnd = (result: { isVictory: boolean; ranAway: boolean; monsterName: string }) => {
    setShowCombat(false);
    
    // If the player ran away, show a different outcome
    if (result.ranAway) {
      setOutcome({
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
      });
    }
    
    // Refresh character data after combat
    getCharacter(characterId).then(response => {
      if (response.success && response.data) {
        setCharacter(response.data);
      }
    });
  };

  // Handle continue to next adventure
  const handleContinue = async () => {
    setLoading(true);
    setSelectedDecision(null);
    setOutcome(null);
    
    try {
      // Get character data
      const characterResponse = await getCharacter(characterId);
      if (!characterResponse.success || !characterResponse.data) {
        setError('Failed to load character data');
        setLoading(false);
        return;
      }
      
      // Update character state
      setCharacter(characterResponse.data);
      
      // Check if character has completed all adventures for the day
      if (characterResponse.data.daily_adventure_count >= MAX_ADVENTURES_PER_DAY) {
        // Just stop loading - don't try to get an adventure
        setLoading(false);
        return;
      }
      
      // Only get next adventure if the character hasn't completed all adventures
      const adventureResponse = await getAdventure(characterId);
      if (!adventureResponse.success || !adventureResponse.data) {
        setError('Failed to load adventure data');
        setLoading(false);
        return;
      }
      
      setAdventure(adventureResponse.data);
      setLoading(false);
    } catch (err) {
      console.error('Error loading next adventure:', err);
      setError('An unexpected error occurred');
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner size="lg" />;
  }

  if (error) {
    return (
      <div className="bg-red-900 border border-red-500 p-4 rounded-md text-center animate-fadeIn">
        <p className="text-xl mb-4">{error}</p>
        <button 
          onClick={() => setError(null)} 
          className="pixel-button"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!character) {
    return (
      <div className="text-center">
        <p className="text-xl mb-4">Character not found</p>
        <Link href={ROUTES.CHARACTER_CREATE} className="pixel-button">
          Create Character
        </Link>
      </div>
    );
  }

  // All adventures completed for the day
  if (character.daily_adventure_count >= MAX_ADVENTURES_PER_DAY) {
    return (
      <div className="bg-gray-900 bg-opacity-80 p-6 text-center animate-fadeIn">
        <h2 className="text-3xl mb-4 text-yellow-400">All Adventures Completed!</h2>
        <p className="text-xl mb-6">
          You've completed all {MAX_ADVENTURES_PER_DAY} adventures for today.
          Return tomorrow for new adventures!
        </p>
        
        <div className="mb-8">
          <AdventureTracker 
            totalAdventures={MAX_ADVENTURES_PER_DAY} 
            completedAdventures={character.daily_adventure_count} 
          />
        </div>
        
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link href={ROUTES.WORLD_BOSS} className="pixel-button bg-red-600 hover:bg-red-500 active:bg-red-700">
            Fight World Boss
          </Link>
          <Link href={ROUTES.INVENTORY} className="pixel-button bg-blue-600 hover:bg-blue-500 active:bg-blue-700">
            Inventory
          </Link>
          <Link href={ROUTES.SHOP} className="pixel-button bg-green-600 hover:bg-green-500 active:bg-green-700">
            Shop
          </Link>
        </div>
      </div>
    );
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
  if (!hasSelectedArea && character) {
    if (loadingAreas) {
      return <LoadingSpinner size="lg" />;
    }
    
    return (
      <AreaSelection 
        areas={areas}
        character={character}
        onSelectArea={handleAreaSelect}
      />
    );
  }

  if (!adventure) {
    return (
      <div className="text-center animate-fadeIn">
        <p className="text-xl mb-4">No adventures available</p>
        <button 
          onClick={() => {
            setLoading(true);
            getAdventure(characterId).then(response => {
              if (response.success && response.data) {
                setAdventure(response.data);
              }
              setLoading(false);
            });
          }} 
          className="pixel-button"
        >
          Try Again
        </button>
      </div>
    );
  }

  // Show outcome if available
  if (outcome) {
    // Check if this is a "ran away" outcome
    const ranAway = outcome.description.includes('ran away from');
    // Check if this was the final adventure (5th adventure)
    // We need to check if the character has completed 4 adventures and is now completing the 5th one
    const isFinalAdventure = character.daily_adventure_count === MAX_ADVENTURES_PER_DAY - 1;
    
    return (
      <div className="bg-gray-900 bg-opacity-80 p-6 animate-fadeIn">
        {/* Level Up Animation */}
        {showLevelUp && character && (
          <LevelUpAnimation 
            oldExperience={oldExperience}
            newExperience={character.experience}
            onComplete={() => setShowLevelUp(false)}
          />
        )}
        <h2 className={`text-3xl mb-4 ${ranAway ? 'text-red-400' : 'text-green-400'}`}>
          {ranAway ? 'Defeat!' : 'Adventure Outcome'}
        </h2>
        
        <div className="mb-6">
          <AdventureTracker 
            totalAdventures={MAX_ADVENTURES_PER_DAY} 
            completedAdventures={character.daily_adventure_count} 
          />
        </div>
        
        <div className="mb-6 p-4 bg-gray-800 rounded-md">
          <AnimatedText 
            text={outcome.description} 
            className="text-xl mb-4"
            speed={80}
            onComplete={() => setShowRewards(true)}
          />
          
          {!ranAway && showRewards && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              {/* Item reward */}
              {outcome.reward_table_id && (
                <AnimatedReward delay={0} isItem={true} className="col-span-full bg-gray-700 p-3 rounded-md">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-purple-900 rounded-md flex items-center justify-center mr-4">
                      <span className="text-xl">W</span>
                    </div>
                    <div>
                      <h4 className="text-lg font-medium text-purple-300">Enchanted Sword</h4>
                      <p className="text-sm text-gray-300">Weapon (Slashing) • +15 Damage • +3 Strength</p>
                    </div>
                  </div>
                </AnimatedReward>
              )}
              
              {/* Other rewards */}
              <>
                <AnimatedReward delay={200} className="bg-gray-700 p-3 rounded-md">
                  <p className="text-green-400">+{outcome.experience_bonus} Experience</p>
                </AnimatedReward>
                
                <AnimatedReward delay={400} className="bg-gray-700 p-3 rounded-md">
                  <p className="text-yellow-400">+{outcome.gold_bonus} Gold</p>
                </AnimatedReward>
                
                {outcome.hitpoints_change !== 0 && (
                  <AnimatedReward delay={600} className="bg-gray-700 p-3 rounded-md">
                    <p className={outcome.hitpoints_change > 0 ? "text-green-400" : "text-red-400"}>
                      {outcome.hitpoints_change > 0 ? "+" : ""}{outcome.hitpoints_change} HP
                    </p>
                  </AnimatedReward>
                )}
                
                {outcome.energy_change !== 0 && (
                  <AnimatedReward delay={800} className="bg-gray-700 p-3 rounded-md">
                    <p className={outcome.energy_change > 0 ? "text-green-400" : "text-red-400"}>
                      {outcome.energy_change > 0 ? "+" : ""}{outcome.energy_change} Energy
                    </p>
                  </AnimatedReward>
                )}
              </>
            </div>
          )}
        </div>
        
        {/* Show "All Adventures Completed" content if this was the final adventure */}
        {isFinalAdventure && showRewards && (
          <div className="mt-8 text-center animate-fadeIn">
            <h2 className="text-3xl mb-4 text-yellow-400">All Adventures Completed!</h2>
            <p className="text-xl mb-6">
              You've completed all {MAX_ADVENTURES_PER_DAY} adventures for today.
              Return tomorrow for new adventures!
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4 mt-6">
              <Link href={ROUTES.WORLD_BOSS} className="pixel-button bg-red-600 hover:bg-red-500 active:bg-red-700">
                Fight World Boss
              </Link>
              <Link href={ROUTES.INVENTORY} className="pixel-button bg-blue-600 hover:bg-blue-500 active:bg-blue-700">
                Inventory
              </Link>
              <Link href={ROUTES.SHOP} className="pixel-button bg-green-600 hover:bg-green-500 active:bg-green-700">
                Shop
              </Link>
            </div>
          </div>
        )}
        
        {/* Only show continue button if not the final adventure */}
        {(!isFinalAdventure || !showRewards) && (
          <div className="flex justify-center">
            <button 
              onClick={handleContinue} 
              className="pixel-button text-xl"
            >
              Continue to Next Adventure
            </button>
          </div>
        )}
      </div>
    );
  }

  // Show adventure and decisions
  return (
    <div className="bg-gray-900 bg-opacity-80 p-6 animate-fadeIn">
      <div className="flex flex-col gap-4 mb-6">
        <div>
          <CharacterStats character={character} />
        </div>
        
        <div>
          <AdventureTracker 
            totalAdventures={MAX_ADVENTURES_PER_DAY} 
            completedAdventures={character.daily_adventure_count} 
          />
          
          <h2 className="text-3xl mb-2 text-yellow-400">{adventure.title}</h2>
          <p className="text-xl mb-6">{adventure.description}</p>
          
          {/* Adventure image placeholder */}
          <div className="w-full h-48 bg-gray-700 mb-6 rounded-md flex items-center justify-center">
            <p className="text-gray-400">Adventure Image</p>
          </div>
        </div>
      </div>
      
      {/* Decisions */}
      <div className="mb-6">
        <h3 className="text-2xl mb-4">What will you do?</h3>
        
        <div className="space-y-4">
          {adventure.decisions?.map((decision: AdventureDecision) => (
            <div 
              key={decision.id}
              className={`p-4 border-2 rounded-md cursor-pointer transition-all ${
                selectedDecision?.id === decision.id
                  ? 'border-purple-500 bg-purple-900 bg-opacity-30'
                  : 'border-gray-600 bg-gray-800 hover:border-gray-400'
              }`}
              onClick={() => handleDecisionSelect(decision)}
            >
              <p className="text-lg">{decision.description}</p>
            </div>
          ))}
        </div>
      </div>
      
      <div className="flex justify-center">
        <button 
          onClick={handleCompleteAdventure}
          disabled={!selectedDecision}
          className="pixel-button text-xl disabled:opacity-50"
        >
          Proceed with Decision
        </button>
      </div>
    </div>
  );
}
