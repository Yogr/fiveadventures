'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import type { Combat, Character, Skill } from '@/lib/types';
import { getCombat, startCombatTurn } from '@/app/actions/combat';
import { getCharacterSkills } from '@/app/actions/combat';
import { getCharacterById } from '@/app/actions/character';
import { updateAdventureState } from '@/app/actions/adventure-state';
import { useAdventureState } from '@/components/adventure/AdventureStateContext';
import LoadingSpinner from '@/components/ui/loading-spinner';
import Image from 'next/image';

interface CombatInterfaceProps {
  combatId: string;
  character: Character;
  onCombatEnd: (result: { isVictory: boolean; ranAway: boolean; monsterName: string }) => void;
}

export default function CombatInterface({ combatId, character: initialCharacter, onCombatEnd }: CombatInterfaceProps) {
  const router = useRouter();
  const { adventureState, refreshAdventureState } = useAdventureState();
  const [loading, setLoading] = useState(true);
  const [character, setCharacter] = useState<Character>(initialCharacter);
  const [combat, setCombat] = useState<Combat | null>(null);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [actionInProgress, setActionInProgress] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [combatLog, setCombatLog] = useState<string[]>([]);
  const combatEndingRef = useRef(false);

  // Load combat data
  useEffect(() => {
    async function loadCombatData() {
      setLoading(true);
      setError(null);
      
      try {
        // Get combat data
        const combatResponse = await getCombat(combatId);
        if (!combatResponse.success || !combatResponse.data) {
          setError('Failed to load combat data');
          setLoading(false);
          return;
        }
        
        setCombat(combatResponse.data);
        
        // Get character skills
        const skillsResponse = await getCharacterSkills(character.id);
        if (skillsResponse.success && skillsResponse.data) {
          setSkills(skillsResponse.data.filter(skill => skill.learned));
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error loading combat data:', err);
        setError('An unexpected error occurred');
        setLoading(false);
      }
    }
    
    loadCombatData();
  }, [combatId, character.id]);

  // Check if combat is completed
  useEffect(() => {
    if (!combat || combatEndingRef.current) return;
    
    console.log('CombatInterface: Checking if combat is completed:', {
      id: combat.id,
      is_completed: combat.is_completed,
      is_victory: combat.is_victory,
      turns: Array.isArray(combat.turns) ? combat.turns.length : 0
    });
    
    // Check if monster is defeated (HP <= 0)
    const monsterCurrentHP = combat.monster.hitpoints - combat.character_damage_dealt;
    const monsterDefeated = monsterCurrentHP <= 0;
    
    console.log('CombatInterface: Monster status:', {
      name: combat.monster.name,
      totalHP: combat.monster.hitpoints,
      damageTaken: combat.character_damage_dealt,
      currentHP: monsterCurrentHP,
      defeated: monsterDefeated
    });
    
    // End combat if server says it's completed or if monster HP is 0 or less
    if ((combat.is_completed && combat.is_victory !== null) || monsterDefeated) {
      console.log('CombatInterface: Combat is completed or monster is defeated');
      
      // If monster is defeated but combat not marked as completed, force victory
      // Ensure isVictory is always a boolean, not null
      const isVictory = monsterDefeated ? true : (combat.is_victory === true);
      console.log('CombatInterface: isVictory =', isVictory);
      
      // Check if this was a "run away" scenario
      console.log('CombatInterface: Checking if player ran away, combat.turns =', combat.turns);
      
      // Check if any turn was a successful run
      // A successful run has effects.success === true
      // A failed run has effects.success === false
      const ranAway = combat.turns && Array.isArray(combat.turns) && combat.turns.some((turn: any) => {
        // Only consider turns where the player successfully ran away
        const isRunAway = turn.actor === 'character' && turn.action === 'run' && turn.effects?.success === true;
        console.log('CombatInterface: Turn check for run away:', {
          turn_number: turn.turn_number,
          actor: turn.actor,
          action: turn.action,
          success: turn.effects?.success,
          isRunAway
        });
        return isRunAway;
      });
      
      console.log('CombatInterface: ranAway =', ranAway);
      
      // If player ran away, make sure isVictory is false
      const finalResult = {
        isVictory: ranAway ? false : isVictory,
        ranAway: !!ranAway,
        monsterName: combat.monster?.name || 'monster'
      };
      
      console.log('CombatInterface: Final combat result:', finalResult);
      
      // Set combat ending flag to prevent multiple calls
      combatEndingRef.current = true;
      
      // Import the completeCombat function
      import('@/app/actions/combat-end').then(({ completeCombat }) => {
        // Use the completeCombat function to handle the entire combat end process
        completeCombat(combatId, finalResult.isVictory, finalResult.ranAway).then(result => {
          if (!result.success || !result.data) {
            console.error('CombatInterface: Error completing combat:', result.error);
          } else {
            console.log('CombatInterface: Combat completed successfully:', {
              experienceGained: result.data.character.experience - character.experience,
              goldGained: result.data.character.gold - character.gold,
              adventureCount: result.data.character.daily_adventure_count
            });
            
            // Update local character state with the updated data
            setCharacter(result.data.character);
          }
          
          // Call onCombatEnd to update the UI
          console.log('CombatInterface: Calling onCombatEnd with result:', finalResult);
          onCombatEnd(finalResult);
        }).catch(error => {
          console.error('CombatInterface: Error in completeCombat:', error);
          
          // Call onCombatEnd even if completeCombat fails
          console.log('CombatInterface: Calling onCombatEnd after error with result:', finalResult);
          onCombatEnd(finalResult);
        });
      });
    }
  }, [combat, character.id, onCombatEnd, refreshAdventureState]);

  // Create a floating damage number
  const createFloatingNumber = (target: 'character' | 'monster', value: number, type: 'damage' | 'heal' | 'effect' = 'damage', text?: string) => {
    // Get the target element
    const targetElement = document.querySelector(target === 'character' ? '.character-avatar' : '.monster-avatar');
    if (!targetElement) return;
    
    // Create the floating number element
    const floatingNumber = document.createElement('div');
    floatingNumber.className = type === 'damage' ? 'damage-number' : type === 'heal' ? 'heal-number' : 'effect-text';
    floatingNumber.textContent = text || `${value}`;
    
    // Position it over the target
    const rect = targetElement.getBoundingClientRect();
    const damageContainer = document.getElementById('damage-numbers');
    if (!damageContainer) return;
    
    const containerRect = damageContainer.getBoundingClientRect();
    
    // Adjust position based on target (move character effects right, monster effects left)
    const horizontalOffset = target === 'character' ? 20 : -20; // 20px offset
    
    floatingNumber.style.left = `${rect.left - containerRect.left + rect.width / 2 + horizontalOffset}px`;
    floatingNumber.style.top = `${rect.top - containerRect.top}px`;
    
    // Add it to the DOM
    damageContainer.appendChild(floatingNumber);
    
    // Remove it after animation completes
    setTimeout(() => {
      floatingNumber.remove();
    }, 1000);
  };
  
  // Add animation class to an element
  const animateElement = (selector: string, className: string) => {
    const element = document.querySelector(selector);
    if (!element) return;
    
    element.classList.add(className);
    
    // Remove the class after animation completes
    setTimeout(() => {
      element.classList.remove(className);
    }, 500);
  };

  // Add message to combat log
  const addToCombatLog = (message: string) => {
    setCombatLog(prevLog => [...prevLog, message]);
  };

  // Handle attack action
  const handleAttack = async () => {
    if (!combat || actionInProgress) return;
    
    setActionInProgress(true);
    
    try {
      // Animate character attacking
      animateElement('.character-avatar', 'attacking');
      
      const result = await startCombatTurn(combatId, 'attack');
      
      if (!result.success || !result.data) {
        setError(result.error || 'Failed to perform attack');
        setActionInProgress(false);
        return;
      }
      
      // Calculate damage dealt
      const damageDealt = result.data!.character_damage_dealt - combat.character_damage_dealt;
      
      // Show floating damage number on monster
      createFloatingNumber('monster', damageDealt, 'damage');
      
      // Animate monster being hit
      animateElement('.monster-avatar', 'hit');
      
      setCombat(result.data);
      addToCombatLog(`You attacked the ${combat.monster.name} for ${damageDealt} damage!`);
      
      // If monster attacks back
      if (result.data!.monster_damage_dealt > combat.monster_damage_dealt) {
        // Short delay before monster attacks
        setTimeout(() => {
          const monsterDamage = result.data!.monster_damage_dealt - combat.monster_damage_dealt;
          
          // Animate monster attacking
          animateElement('.monster-avatar', 'attacking');
          
          // Short delay for attack animation
          setTimeout(() => {
            // Animate character being hit
            animateElement('.character-avatar', 'hit');
            
            // Show floating damage number on character
            createFloatingNumber('character', monsterDamage, 'damage');
          }, 250);
          
          addToCombatLog(`The ${combat.monster.name} attacked you for ${monsterDamage} damage!`);
          
          // Update character HP locally instead of fetching from server
          console.log('CombatInterface: Updating character HP locally after monster attack');
          
          // Calculate new HP
          const newHP = Math.max(0, character.current_hitpoints - monsterDamage);
          
          // Update character state locally
          setCharacter(prevChar => ({
            ...prevChar,
            current_hitpoints: newHP
          }));
          
          console.log('CombatInterface: Character HP updated locally:', {
            old: character.current_hitpoints,
            new: newHP,
            damage: monsterDamage
          });
        }, 500);
      }
      
      if (result.data!.is_completed) {
        if (result.data!.is_victory) {
          addToCombatLog(`You defeated the ${combat.monster.name}!`);
          createFloatingNumber('monster', 0, 'effect', 'Defeated!');
        } else {
          addToCombatLog(`You were defeated by the ${combat.monster.name}!`);
          createFloatingNumber('character', 0, 'effect', 'Defeated!');
        }
        
        // Refresh character data after combat ends
        console.log('CombatInterface: Refreshing character data after combat victory');
        getCharacterById(character.id).then(response => {
          if (response.success && response.data) {
            console.log('CombatInterface: Character data updated after combat victory:', {
              old: {
                hp: `${character.current_hitpoints}/${character.max_hitpoints}`,
                energy: `${character.current_energy}/${character.max_energy}`,
                gold: character.gold,
                adventureCount: character.daily_adventure_count
              },
              new: {
                hp: `${response.data.current_hitpoints}/${response.data.max_hitpoints}`,
                energy: `${response.data.current_energy}/${response.data.max_energy}`,
                gold: response.data.gold,
                adventureCount: response.data.daily_adventure_count
              }
            });
            setCharacter(response.data);
          } else {
            console.error('CombatInterface: Failed to get character data:', response.error);
          }
        });
      }
      
      setActionInProgress(false);
    } catch (err) {
      console.error('Error performing attack:', err);
      setError('An unexpected error occurred');
      setActionInProgress(false);
    }
  };

  // Handle skill action
  const handleUseSkill = async () => {
    if (!combat || !selectedSkill || actionInProgress) return;
    
    setActionInProgress(true);
    
    try {
      // Animate character using skill
      animateElement('.character-avatar', 'attacking');
      
      // Show skill name as effect
      createFloatingNumber('character', 0, 'effect', selectedSkill.name);
      
      const result = await startCombatTurn(combatId, 'skill', selectedSkill.id);
      
      if (!result.success || !result.data) {
        setError(result.error || 'Failed to use skill');
        setActionInProgress(false);
        return;
      }
      
      setCombat(result.data);
      addToCombatLog(`You used ${selectedSkill.name}!`);
      
      // If skill dealt damage
      if (result.data!.character_damage_dealt > combat.character_damage_dealt) {
        const damageDealt = result.data!.character_damage_dealt - combat.character_damage_dealt;
        
        // Show floating damage number on monster
        createFloatingNumber('monster', damageDealt, 'damage');
        
        // Animate monster being hit
        animateElement('.monster-avatar', 'hit');
        
        addToCombatLog(`You dealt ${damageDealt} damage to the ${combat.monster.name}!`);
      }
      
      // If monster attacks back
      if (result.data!.monster_damage_dealt > combat.monster_damage_dealt) {
        // Short delay before monster attacks
        setTimeout(() => {
          const monsterDamage = result.data!.monster_damage_dealt - combat.monster_damage_dealt;
          
          // Animate monster attacking
          animateElement('.monster-avatar', 'attacking');
          
          // Short delay for attack animation
          setTimeout(() => {
            // Animate character being hit
            animateElement('.character-avatar', 'hit');
            
            // Show floating damage number on character
            createFloatingNumber('character', monsterDamage, 'damage');
          }, 250);
          
          addToCombatLog(`The ${combat.monster.name} attacked you for ${monsterDamage} damage!`);
          
          // Update character HP locally instead of fetching from server
          console.log('CombatInterface: Updating character HP locally after monster attack');
          
          // Calculate new HP
          const newHP = Math.max(0, character.current_hitpoints - monsterDamage);
          
          // Update character state locally
          setCharacter(prevChar => ({
            ...prevChar,
            current_hitpoints: newHP
          }));
          
          console.log('CombatInterface: Character HP updated locally:', {
            old: character.current_hitpoints,
            new: newHP,
            damage: monsterDamage
          });
        }, 500);
      }
      
      if (result.data.is_completed) {
        if (result.data.is_victory) {
          addToCombatLog(`You defeated the ${combat.monster.name}!`);
          createFloatingNumber('monster', 0, 'effect', 'Defeated!');
        } else {
          addToCombatLog(`You were defeated by the ${combat.monster.name}!`);
          createFloatingNumber('character', 0, 'effect', 'Defeated!');
        }
        
        // Refresh character data after combat ends
        console.log('CombatInterface: Refreshing character data after combat defeat');
        getCharacterById(character.id).then(response => {
          if (response.success && response.data) {
            console.log('CombatInterface: Character data updated after combat defeat:', {
              old: {
                hp: `${character.current_hitpoints}/${character.max_hitpoints}`,
                energy: `${character.current_energy}/${character.max_energy}`,
                gold: character.gold,
                adventureCount: character.daily_adventure_count
              },
              new: {
                hp: `${response.data.current_hitpoints}/${response.data.max_hitpoints}`,
                energy: `${response.data.current_energy}/${response.data.max_energy}`,
                gold: response.data.gold,
                adventureCount: response.data.daily_adventure_count
              }
            });
            setCharacter(response.data);
          } else {
            console.error('CombatInterface: Failed to get character data:', response.error);
          }
        });
      }
      
      setSelectedSkill(null);
      setActionInProgress(false);
    } catch (err) {
      console.error('Error using skill:', err);
      setError('An unexpected error occurred');
      setActionInProgress(false);
    }
  };

  // Handle run action
  const handleRun = async () => {
    if (!combat || actionInProgress) return;
    
    setActionInProgress(true);
    
    try {
      // Show running effect
      createFloatingNumber('character', 0, 'effect', 'Running...');
      
      const result = await startCombatTurn(combatId, 'run');
      
      if (!result.success || !result.data) {
        setError(result.error || 'Failed to run from combat');
        setActionInProgress(false);
        return;
      }
      
      setCombat(result.data);
      
      if (result.data!.is_completed) {
        addToCombatLog(`You successfully ran away from the ${combat.monster.name}!`);
        createFloatingNumber('character', 0, 'effect', 'Escaped!');
      } else {
        addToCombatLog('You failed to run away!');
        createFloatingNumber('character', 0, 'effect', 'Failed!');
        
        // If monster attacks after failed run
        if (result.data!.monster_damage_dealt > combat.monster_damage_dealt) {
          // Short delay before monster attacks
          setTimeout(() => {
            const monsterDamage = result.data!.monster_damage_dealt - combat.monster_damage_dealt;
            
            // Animate monster attacking
            animateElement('.monster-avatar', 'attacking');
            
            // Short delay for attack animation
            setTimeout(() => {
              // Animate character being hit
              animateElement('.character-avatar', 'hit');
              
              // Show floating damage number on character
              createFloatingNumber('character', monsterDamage, 'damage');
            }, 250);
            
            addToCombatLog(`The ${combat.monster.name} attacked you for ${monsterDamage} damage!`);
            
            // Update character HP locally instead of fetching from server
            console.log('CombatInterface: Updating character HP locally after monster attack');
            
            // Calculate new HP
            const newHP = Math.max(0, character.current_hitpoints - monsterDamage);
            
            // Update character state locally
            setCharacter(prevChar => ({
              ...prevChar,
              current_hitpoints: newHP
            }));
            
            console.log('CombatInterface: Character HP updated locally:', {
              old: character.current_hitpoints,
              new: newHP,
              damage: monsterDamage
            });
          }, 500);
        }
      }
      
      setActionInProgress(false);
    } catch (err) {
      console.error('Error running from combat:', err);
      setError('An unexpected error occurred');
      setActionInProgress(false);
    }
  };

  // Auto-scroll combat log to bottom when new messages are added
  useEffect(() => {
    const combatLogElement = document.getElementById('combat-log');
    if (combatLogElement) {
      combatLogElement.scrollTop = combatLogElement.scrollHeight;
    }
  }, [combatLog]);

  if (loading) {
    return <LoadingSpinner size="lg" />;
  }

  if (error) {
    return (
      <div className="bg-red-900 border border-red-500 p-4 rounded-md text-center">
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

  if (!combat) {
    return (
      <div className="text-center">
        <p className="text-xl mb-4">Combat not found</p>
      </div>
    );
  }

  // Calculate health percentages
  const characterHealthPercent = Math.max(0, Math.min(100, (character.current_hitpoints / character.max_hitpoints) * 100));
  const monsterHealthPercent = Math.max(0, Math.min(100, ((combat.monster.hitpoints - combat.character_damage_dealt) / combat.monster.hitpoints) * 100));
  
  return (
    <div className="bg-gray-900 bg-opacity-80 p-4 pt-2 pb-3 animate-fadeIn rounded-lg">
      <h2 className="text-xl mb-2 text-red-400 text-center">Battle!</h2>
      
      <div className="grid grid-cols-2 gap-3 mb-3">
        {/* Character - Left Side */}
        <div className="bg-gray-800 p-3 rounded-md relative">
          <h3 className="text-lg mb-1">{character.name}</h3>
          
          <div className="w-16 h-16 mx-auto mb-2 bg-blue-900 rounded-full flex items-center justify-center character-avatar">
            <Image
              src={`/image/characters/${character.class.toLowerCase()}.png`}
              alt={character.name}
              width={64}
              height={64}
            />
          </div>
          
          <div className="mb-2">
            <div className="flex justify-between mb-1">
              <span>HP: {character.current_hitpoints}/{character.max_hitpoints}</span>
              <span>{Math.round(characterHealthPercent)}%</span>
            </div>
            <div className="w-full h-4 bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-red-600 transition-all duration-300" 
                style={{ width: `${characterHealthPercent}%` }}
              ></div>
            </div>
          </div>
          
          <div className="mb-2">
            <div className="flex justify-between mb-1">
              <span>Energy: {character.current_energy}/{character.max_energy}</span>
              <span>{Math.round((character.current_energy / character.max_energy) * 100)}%</span>
            </div>
            <div className="w-full h-4 bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-600 transition-all duration-300" 
                style={{ width: `${(character.current_energy / character.max_energy) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
        
        {/* Monster - Right Side */}
        <div className="bg-gray-800 p-3 rounded-md relative">
          <h3 className="text-lg mb-1">
            {combat.monster.name}
            {/* Elite monster indicator */}
            {combat.monster.is_elite && (
              <span className="ml-2 text-xs text-yellow-400 font-bold border border-yellow-400 rounded-md px-1 py-0.5">
                ELITE
              </span>
            )}
          </h3>
          
          <div className={`w-16 h-16 mx-auto mb-2 ${combat.monster.is_elite ? 'bg-yellow-900' : 'bg-red-900'} rounded-full flex items-center justify-center monster-avatar ${combat.monster.is_elite ? 'border-2 border-yellow-400' : ''}`}>
            <Image
                src={`/image/enemy/${combat.monster.image_url}.png`}
                alt={combat.monster.name}
                width={48}
                height={48}
                className="-scale-x-100"
              />
          </div>
          
          <div className="mb-2">
            <div className="flex justify-between mb-1">
              <span>HP: {Math.max(0, combat.monster.hitpoints - combat.character_damage_dealt)}/{combat.monster.hitpoints}</span>
              <span>{Math.round(monsterHealthPercent)}%</span>
            </div>
            <div className="w-full h-4 bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-red-600 transition-all duration-300" 
                style={{ width: `${monsterHealthPercent}%` }}
              ></div>
            </div>
          </div>
          
          <p className="text-sm mt-2">{combat.monster.description}</p>
        </div>
      </div>

      {/* Floating Damage Numbers Container */}
      <div id="damage-numbers" className="relative h-0">
        {/* Damage numbers will be added dynamically via JavaScript */}
      </div>
      
      {/* Actions - Moved above combat log */}
      {!combat.is_completed && (
        <div className="grid grid-cols-2 gap-2 mb-2">
          <div>
            <button 
              onClick={handleAttack}
              disabled={actionInProgress}
              className="pixel-button w-full py-1 bg-red-600 hover:bg-red-500 active:bg-red-700 disabled:opacity-50 attack-button"
            >
              Attack
            </button>
          </div>
          
          <div>
            <button 
              onClick={handleRun}
              disabled={actionInProgress}
              className="pixel-button w-full py-1 bg-yellow-600 hover:bg-yellow-500 active:bg-yellow-700 disabled:opacity-50"
            >
              Run Away
            </button>
          </div>
        </div>
      )}
      
      {/* Skills - Also moved above combat log */}
      {!combat.is_completed && skills.length > 0 && (
        <div className="bg-gray-800 p-2 rounded-md mb-2">
          <h3 className="text-lg mb-1">Skills</h3>
          
          <div className="grid grid-cols-2 gap-1">
            {skills.map((skill) => (
              <button 
                key={skill.id}
                className={`p-1 border rounded-md text-left text-sm ${
                  selectedSkill?.id === skill.id
                    ? 'border-blue-500 bg-blue-900 bg-opacity-30'
                    : 'border-gray-600 hover:border-gray-400'
                } ${character.current_energy < skill.energy_cost ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                onClick={() => character.current_energy >= skill.energy_cost && setSelectedSkill(skill)}
                disabled={character.current_energy < skill.energy_cost || actionInProgress}
              >
                <div className="flex justify-between">
                  <span className="font-bold">{skill.name}</span>
                  <span className="text-blue-400">{skill.energy_cost}</span>
                </div>
                <p className="text-xs text-gray-300 truncate">{skill.description}</p>
              </button>
            ))}
          </div>
          
          {selectedSkill && (
            <div className="mt-2 text-center">
              <button 
                onClick={handleUseSkill}
                disabled={actionInProgress}
                className="pixel-button py-1 text-sm bg-blue-600 hover:bg-blue-500 active:bg-blue-700 disabled:opacity-50"
              >
                Use {selectedSkill.name}
              </button>
            </div>
          )}
        </div>
      )}
      
      {/* Combat Log - Now below action buttons and skills */}
      <div id="combat-log" className="bg-gray-800 p-2 rounded-md mb-3 h-32 overflow-y-auto text-sm">
        {combatLog.length === 0 ? (
          <p className="text-gray-400">Battle has begun! Choose your action...</p>
        ) : (
          combatLog.map((message, index) => (
            <p key={index} className="mb-0.5">{message}</p>
          ))
        )}
      </div>
      
      {/* Combat Completed */}
      {combat.is_completed && (
        <div className="text-center">
          <h3 className="text-2xl mb-4">
            {combat.is_victory 
              ? 'Victory!' 
              : 'Defeat!'}
          </h3>
          
          <button
            onClick={() => {
              // Check if this was a "run away" scenario
              const ranAway = combat.turns && Array.isArray(combat.turns) && combat.turns.some((turn: any) =>
                turn.actor === 'character' && turn.action === 'run' && turn.effects?.success === true
              );
              
              // Set combat ending flag to prevent multiple calls
              if (combatEndingRef.current) return;
              combatEndingRef.current = true;
              
              // Create the final result
              const finalResult = {
                isVictory: combat.is_victory === true,
                ranAway: !!ranAway,
                monsterName: combat.monster?.name || 'monster'
              };
              
              // Import the completeCombat function
              import('@/app/actions/combat-end').then(({ completeCombat }) => {
                // Use the completeCombat function to handle the entire combat end process
                completeCombat(combatId, finalResult.isVictory, finalResult.ranAway).then(result => {
                  if (!result.success || !result.data) {
                    console.error('CombatInterface: Error completing combat:', result.error);
                  } else {
                    console.log('CombatInterface: Combat completed successfully:', {
                      experienceGained: result.data.character.experience - character.experience,
                      goldGained: result.data.character.gold - character.gold,
                      adventureCount: result.data.character.daily_adventure_count
                    });
                    
                    // Update local character state with the updated data
                    setCharacter(result.data.character);
                  }
                  
                  // Call onCombatEnd to update the UI
                  console.log('CombatInterface: Calling onCombatEnd with result:', finalResult);
                  onCombatEnd(finalResult);
                }).catch(error => {
                  console.error('CombatInterface: Error in completeCombat:', error);
                  
                  // Call onCombatEnd even if completeCombat fails
                  console.log('CombatInterface: Calling onCombatEnd after error with result:', finalResult);
                  onCombatEnd(finalResult);
                });
              });
            }}
            className="pixel-button text-xl"
          >
            Continue
          </button>
        </div>
      )}
    </div>
  );
}
