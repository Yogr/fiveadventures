'use client';

import { useDungeonAdventure } from './DungeonAdventureContext';
import LoadingSpinner from '@/components/ui/loading-spinner';
import CombatInterface from '@/components/combat/combat-interface';
import Image from 'next/image';
import { ImageSource } from '@/lib/image-source';

// Inline DungeonCompletedView component
function DungeonCompletedView({ dungeonName }: { dungeonName: string }) {
  return (
    <div className="w-full rounded-lg border-2 border-amber-900 border-t-amber-700 border-l-amber-700 bg-gradient-to-b from-yellow-950 to-black overflow-hidden">
      {/* Background image with overlaid content */}
      <div className="relative w-full h-48">
        {/* Background image */}
        <div className="absolute inset-0">
          <Image
            src="/image/ui/dungeonbackground.png"
            alt="Dungeon Completed"
            fill
            className="object-cover rounded-t-md"
            priority
          />
          <div className="absolute inset-0 bg-black/40"></div>
        </div>
        
        {/* Content overlay */}
        <div className="absolute inset-0 flex flex-col justify-center items-center p-4 z-10">
          <h2 className="text-2xl md:text-3xl text-amber-300 text-center font-bold" 
            style={{ textShadow: "2px 2px 4px rgba(0,0,0,0.9), -1px -1px 4px rgba(0,0,0,0.9)" }}
          >
            Dungeon Completed!
          </h2>
        </div>
      </div>
      
      <div className="p-6 text-center">
        <p className="text-amber-300 mb-6">
          You have completed all adventures in the {dungeonName} dungeon.
        </p>
        
        <div className="flex justify-center mb-6">
          <Image 
            src="/image/ui/chest_open.png" 
            alt="Treasure" 
            width={80} 
            height={80} 
            className="animate-pulse"
          />
        </div>
        
        <p className="text-amber-200">
          Return to select a new dungeon to explore.
        </p>
      </div>
    </div>
  );
}

export default function DungeonAdventureView() {
  const { 
    state, 
    selectDecision, 
    completeAdventure,
    handleCombatEnd,
    continueToNextAdventure
  } = useDungeonAdventure();
  
  const {
    loading,
    error,
    character,
    dungeon,
    adventure,
    selectedDecision,
    outcome,
    combatId,
    showPreCombat,
    showCombat,
    showRewards,
    oldExperience,
    showLevelUp,
    rewardItem,
    combatResult
  } = state;

  if (loading) {
    return (
      <div className="flex justify-center items-center w-full h-full min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-4 bg-red-900/50 text-red-100 rounded-md border border-red-800 mb-6">
        <p className="text-lg font-semibold mb-2">Error</p>
        <p>{error}</p>
      </div>
    );
  }
  
  // Show pre-combat view if available
  if (showPreCombat && outcome && combatId) {
    return (
      <div className="w-full rounded-lg border-2 border-amber-900 border-t-amber-700 border-l-amber-700 bg-gradient-to-b from-yellow-950 to-black">
        {/* Background image with overlaid content */}
        <div className="relative w-full h-48">
          {/* Background image */}
          <div className="absolute inset-0">
            <Image
              src={dungeon?.area?.image 
                ? ImageSource.getAreaImagePath(dungeon.area)
                : '/image/ui/dungeonbackground.png'}
              alt="Combat Encounter"
              fill
              className="object-cover rounded-t-md"
              priority
            />
            <div className="absolute inset-0 bg-black/50"></div> {/* Darker overlay for combat */}
          </div>
          
          {/* Content overlay */}
          <div className="absolute inset-0 flex flex-col justify-center p-4 z-10">
            <h2 className="text-xl md:text-2xl mb-2 text-amber-300 text-center font-bold" 
              style={{ textShadow: "2px 2px 4px rgba(0,0,0,0.9), -1px -1px 4px rgba(0,0,0,0.9)" }}
            >
              Combat Encounter!
            </h2>
          </div>
        </div>
        
        <div className="p-6 animate-fadeIn">
          <div className="p-4 bg-gray-900/80 rounded-md mb-6">
            <p className="text-amber-200">{outcome.description}</p>
          </div>
          
          <div className="flex justify-center">
            <button 
              onClick={() => {
                // Set combat state
                completeAdventure();
              }} 
              className="px-6 py-2 text-xl bg-red-700 hover:bg-red-600 active:bg-red-800 text-white rounded"
            >
              Begin Combat
            </button>
          </div>
        </div>
      </div>
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
    let messageOverride;
    
    // Generate message override for combat results
    if (combatResult) {
      if (combatResult.ranAway) {
        messageOverride = `You ran away from the ${combatResult.monsterName}!`;
      } else if (combatResult.isVictory) {
        messageOverride = `You were victorious against the ${combatResult.monsterName}!`;
      } else {
        messageOverride = `You were defeated by the ${combatResult.monsterName}!`;
      }
    }
    
    return (
      <div className="w-full rounded-lg border-2 border-amber-900 border-t-amber-700 border-l-amber-700 bg-gradient-to-b from-yellow-950 to-black">
        {/* Background image with overlaid content */}
        <div className="relative w-full h-48">
          {/* Background image */}
          <div className="absolute inset-0">
            <Image
              src={dungeon?.area?.image 
                ? ImageSource.getAreaImagePath(dungeon.area)
                : '/image/ui/dungeonbackground.png'}
              alt="Dungeon Outcome"
              fill
              className="object-cover rounded-t-md"
              priority
            />
          </div>
          
          {/* Content overlay */}
          <div className="absolute inset-0 flex flex-col justify-center p-4 z-10">
            <h2 className="text-xl md:text-2xl text-amber-300 text-center" 
              style={{ textShadow: "2px 2px 4px rgba(0,0,0,0.9), -1px -1px 4px rgba(0,0,0,0.9)" }}
            >
              {messageOverride || outcome.description}
            </h2>
          </div>
        </div>
        
        <div className="p-6 animate-fadeIn">
          {/* Display rewards */}
          {showRewards && (
            <div className="mt-2 p-4 bg-amber-900/30 rounded-md">
              <h3 className="text-xl font-semibold text-amber-200 mb-2">Rewards</h3>
              {outcome.experience_bonus > 0 && (
                <p className="text-amber-300">Experience: +{outcome.experience_bonus}</p>
              )}
              {outcome.gold_bonus > 0 && (
                <p className="text-amber-300">Gold: +{outcome.gold_bonus}</p>
              )}
              {rewardItem && (
                <div className="mt-2 p-2 bg-amber-800/50 rounded">
                  <p className="text-amber-200">Item: {rewardItem.item.name}</p>
                </div>
              )}
            </div>
          )}
          
          <div className="flex justify-center mt-6">
            <button 
              onClick={continueToNextAdventure} 
              className="px-6 py-2 text-xl bg-amber-700 hover:bg-amber-600 active:bg-amber-800 text-white rounded"
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  // Check if dungeon is completed based on adventure count
  // Or dungeonState is completed
  if (dungeon.current_adventure_count >= 3 || dungeon.current_state === 'completed') {
    return <DungeonCompletedView dungeonName={dungeon.area.name} />;
  }
  
  // If we don't have an adventure, show waiting screen
  if (!adventure) {
    return (
      <div className="w-full rounded-lg border-2 border-amber-900 border-t-amber-700 border-l-amber-700 bg-gradient-to-b from-yellow-950 to-black">
        {/* Background image with overlaid content */}
        <div className="relative w-full h-48">
          {/* Background image */}
          <div className="absolute inset-0">
            <Image
              src={dungeon?.area?.image 
                ? ImageSource.getAreaImagePath(dungeon.area)
                : '/image/ui/dungeonbackground.png'}
              alt="Loading Adventure"
              fill
              className="object-cover rounded-t-md opacity-70"
              priority
            />
            <div className="absolute inset-0 bg-black/60"></div> {/* Darker overlay for loading state */}
          </div>
          
          {/* Content overlay */}
          <div className="absolute inset-0 flex flex-col justify-center items-center p-4 z-10">
            <h2 className="text-xl md:text-2xl mb-2 text-amber-300 text-center font-bold" 
              style={{ textShadow: "2px 2px 4px rgba(0,0,0,0.9), -1px -1px 4px rgba(0,0,0,0.9)" }}
            >
              Preparing Next Challenge...
            </h2>
          </div>
        </div>
        
        <div className="p-6 text-center">
          <p className="text-amber-200 mb-6">
            Your next adventure in the {dungeon.area.name} dungeon awaits.
          </p>
          
          <div className="flex justify-center">
            <LoadingSpinner size="md" />
          </div>
        </div>
      </div>
    );
  }
  
  // Show adventure and decisions - custom implementation not using AdventureView
  return (
    <div className="w-full rounded-lg border-2 border-amber-900 border-t-amber-700 border-l-amber-700 bg-gradient-to-b from-yellow-950 to-black">
      {/* Background image with overlaid content */}
      <div className="relative w-full h-48">
        {/* Background image */}
        <div className="absolute inset-0">
          <Image
            src={adventure.image_url 
              ? ImageSource.getAdventureImagePath(adventure)
              : '/image/ui/dungeonbackground.png'}
            alt={adventure.title}
            fill
            className="object-cover rounded-t-md"
            priority
          />
        </div>
        
        {/* Content overlay */}
        <div className="absolute inset-0 flex flex-col p-4 z-10">
          <h2 className="text-xl md:text-2xl mb-2 text-amber-300" 
            style={{ textShadow: "2px 2px 4px rgba(0,0,0,0.9), -1px -1px 4px rgba(0,0,0,0.9)" }}
          >
            {adventure.title}
          </h2>
          <p className="text-sm md:text-base text-amber-200"
            style={{ textShadow: "1px 1px 3px rgba(0,0,0,0.9), -1px -1px 3px rgba(0,0,0,0.9)" }}
          >
            {adventure.description}
          </p>
        </div>
      </div>
      
      <div className="p-4">
        
        {/* Decisions */}
        <div className="mx-2 mb-4">
          <h3 className="text-lg mb-2 text-amber-300">What will you do?</h3>
          
          <div className="space-y-2">
            {adventure.decisions?.map((decision) => (
              <div 
                key={decision.id}
                onClick={() => selectDecision(decision)}
                className={`p-3 rounded-md border cursor-pointer transition-colors ${
                  selectedDecision?.id === decision.id
                    ? 'border-amber-500 bg-amber-900/50'
                    : 'border-amber-800 bg-amber-950/50 hover:bg-amber-900/30'
                }`}
              >
                <p className="text-amber-100">{decision.description}</p>
              </div>
            ))}
          </div>
        </div>
        
        <div className="flex justify-center mb-2">
          <button 
            onClick={() => completeAdventure()}
            disabled={!selectedDecision || loading}
            className={`px-4 py-2 rounded text-white ${
              !selectedDecision || loading
                ? 'bg-gray-600 cursor-not-allowed opacity-70' 
                : 'bg-amber-700 hover:bg-amber-600'
              }`}
          >
            {loading ? 'Processing...' : 'Proceed with Decision'}
          </button>
        </div>
      </div>
    </div>
  );
}
