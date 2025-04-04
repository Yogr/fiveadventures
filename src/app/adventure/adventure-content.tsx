'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getCharacter } from '@/app/actions/character';
import { getAdventure, completeAdventure } from '@/app/actions/adventure';
import { ROUTES, MAX_ADVENTURES_PER_DAY } from '@/lib/constants';
import { Character, Adventure, AdventureDecision, AdventureOutcome } from '@/lib/types';
import LoadingSpinner from '@/components/ui/loading-spinner';
import AdventureTracker from '@/components/adventure/adventure-tracker';
import CharacterStats from '@/components/character/character-stats';

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

  // Load character and adventure data
  useEffect(() => {
    async function loadData() {
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
        
        // Check if character has completed all adventures for the day
        if (characterResponse.data.daily_adventure_count >= MAX_ADVENTURES_PER_DAY) {
          setLoading(false);
          return;
        }
        
        // Get next adventure
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
    }
    
    loadData();
  }, [characterId]);

  // Handle decision selection
  const handleDecisionSelect = (decision: AdventureDecision) => {
    console.log('Decision selected:', decision);
    setSelectedDecision(decision);
  };

  // Handle adventure completion
  const handleCompleteAdventure = async () => {
    if (!character || !adventure || !selectedDecision) return;
    
    console.log('Completing adventure with decision:', selectedDecision);
    setLoading(true);
    setError(null);
    
    try {
      console.log('Completing adventure...');
      const result = await completeAdventure({
        characterId,
        adventureId: adventure.id,
        decisionId: selectedDecision.id
      });
      console.log('Adventure completion result:', result);
      if (!result.success || !result.data) {
        setError(result.error || 'Failed to complete adventure');
        setLoading(false);
        return;
      }
      
      // Update character and outcome
      setCharacter(result.data.character);
      setOutcome(result.data.outcome);

      console.log('Adventure completed successfully:', result.data.outcome);
      
      // Refresh the page after a delay to show the next adventure
      setTimeout(() => {
        console.log('Refreshing page...');
        setLoading(false);
        router.refresh();
      }, 1000);
    } catch (err) {
      console.error('Error completing adventure:', err);
      setError('An unexpected error occurred');
      setLoading(false);
    }
  };

  // Handle continue to next adventure
  const handleContinue = () => {
    setSelectedDecision(null);
    setOutcome(null);
    router.refresh();
  };

  if (loading) {
    return <LoadingSpinner size="lg" />;
  }

  if (error) {
    return (
      <div className="bg-red-900 border border-red-500 p-4 rounded-md text-center">
        <p className="text-xl mb-4">{error}</p>
        <button 
          onClick={() => router.refresh()} 
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
      <div className="pixel-border bg-gray-900 bg-opacity-80 p-6 text-center">
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

  if (!adventure) {
    return (
      <div className="text-center">
        <p className="text-xl mb-4">No adventures available</p>
        <button 
          onClick={() => router.refresh()} 
          className="pixel-button"
        >
          Try Again
        </button>
      </div>
    );
  }

  // Show outcome if available
  if (outcome) {
    return (
      <div className="pixel-border bg-gray-900 bg-opacity-80 p-6">
        <h2 className="text-3xl mb-4 text-green-400">Adventure Outcome</h2>
        
        <div className="mb-6">
          <AdventureTracker 
            totalAdventures={MAX_ADVENTURES_PER_DAY} 
            completedAdventures={character.daily_adventure_count} 
          />
        </div>
        
        <div className="mb-6 p-4 bg-gray-800 rounded-md">
          <p className="text-xl mb-4">{outcome.description}</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div className="bg-gray-700 p-3 rounded-md">
              <p className="text-green-400">+{outcome.experience_bonus} Experience</p>
            </div>
            <div className="bg-gray-700 p-3 rounded-md">
              <p className="text-yellow-400">+{outcome.gold_bonus} Gold</p>
            </div>
            {outcome.hitpoints_change !== 0 && (
              <div className="bg-gray-700 p-3 rounded-md">
                <p className={outcome.hitpoints_change > 0 ? "text-green-400" : "text-red-400"}>
                  {outcome.hitpoints_change > 0 ? "+" : ""}{outcome.hitpoints_change} HP
                </p>
              </div>
            )}
            {outcome.energy_change !== 0 && (
              <div className="bg-gray-700 p-3 rounded-md">
                <p className={outcome.energy_change > 0 ? "text-green-400" : "text-red-400"}>
                  {outcome.energy_change > 0 ? "+" : ""}{outcome.energy_change} Energy
                </p>
              </div>
            )}
          </div>
          
          {/* TODO: Show item reward if any */}
        </div>
        
        <div className="flex justify-center">
          <button 
            onClick={handleContinue} 
            className="pixel-button text-xl"
          >
            {character.daily_adventure_count >= MAX_ADVENTURES_PER_DAY 
              ? "View Summary" 
              : "Continue to Next Adventure"}
          </button>
        </div>
      </div>
    );
  }

  // Show adventure and decisions
  return (
    <div className="pixel-border bg-gray-900 bg-opacity-80 p-6">
      <div className="flex flex-col md:flex-row gap-6 mb-6">
        <div className="md:w-1/3">
          <CharacterStats character={character} />
        </div>
        
        <div className="md:w-2/3">
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
          {adventure.decisions?.map((decision) => (
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
