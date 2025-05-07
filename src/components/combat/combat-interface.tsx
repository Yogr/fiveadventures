'use client';

import { useState, useEffect, useRef, Fragment } from 'react';
import { useRouter } from 'next/navigation';
import type { Combat, Character, Skill } from '@/lib/types';
import { getCombat, startCombatTurn } from '@/app/actions/combat';
import { getCharacterSkills } from '@/app/actions/combat';
import { getCharacterById } from '@/app/actions/character';
import type { CombatEffect } from '@/lib/effect-utils';
import { useAdventureState } from '@/components/adventure/AdventureStateContext';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react';
import Image from 'next/image';
import { ImageSource } from '@/lib/image-source';
import ActionButton from './action-button';
import CombatScene from './CombatScene';
import StatusBar from './status-bar';

interface CombatInterfaceProps {
  combatId: string;
  character: Character;
  area: { id: string; name: string; image: string };
  onCombatEnd: (result: { isVictory: boolean; ranAway: boolean; monsterName: string }) => void;
}

export default function CombatInterface({ combatId, character: initialCharacter, area, onCombatEnd }: CombatInterfaceProps) {
  const router = useRouter();
  const { refreshAdventureState } = useAdventureState();
  const [loading, setLoading] = useState(true);
  const [character, setCharacter] = useState<Character>(initialCharacter);
  const [combat, setCombat] = useState<Combat | null>(null);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [actionInProgress, setActionInProgress] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [combatLog, setCombatLog] = useState<string[]>([]);
  const [showMonsterInfo, setShowMonsterInfo] = useState(false);
  const [characterEffects, setCharacterEffects] = useState<CombatEffect[]>([]);
  const [monsterEffects, setMonsterEffects] = useState<CombatEffect[]>([]);
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
          console.error('CombatInterface: Failed to load combat data:', combatResponse.error);
          setError('Failed to load combat data');
          setLoading(false);
          return;
        }
        
        setCombat(combatResponse.data);
        
        // Get character skills
        const skillsResponse = await getCharacterSkills(character.id);
        
        if (skillsResponse.success && skillsResponse.data) {
          setSkills(skillsResponse.data);
        } else {
          console.error('CombatInterface: Failed to load skills:', skillsResponse.error);
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

  // Update active effects and combat log whenever combat data changes
  useEffect(() => {
    if (!combat) return;
    
    // Get effects from the combat object
    const playerEffects = Array.isArray(combat.player_effects) ? combat.player_effects : [];
    const enemyEffects = Array.isArray(combat.enemy_effects) ? combat.enemy_effects : [];

    setCharacterEffects(playerEffects as CombatEffect[]);
    setMonsterEffects(enemyEffects as CombatEffect[]);
    
    // Update combat log from server data
    if (combat.combat_log && Array.isArray(combat.combat_log)) {
      // Filter out any non-string values and convert to string[]
      const stringLogs = combat.combat_log
        .filter(entry => typeof entry === 'string')
        .map(entry => String(entry));
      setCombatLog(stringLogs);
    }
  }, [combat]);

  // Check if combat is completed
  useEffect(() => {
    if (!combat || combatEndingRef.current) return;
    
    // End combat if server says it's completed
    if (combat.is_completed && combat.is_victory !== null) {
      // Check if this was a "run away" scenario
      const ranAway = combat.turns && Array.isArray(combat.turns) && combat.turns.some((turn: any) => {
        // Only consider turns where the player successfully ran away
        return turn.actor === 'character' && turn.action === 'run' && turn.effects?.success === true;
      });
      
      // Create final result
      const finalResult = {
        isVictory: ranAway ? false : (combat.is_victory === true),
        ranAway: !!ranAway,
        monsterName: combat.monster?.name || 'monster'
      };
      
      // Set combat ending flag to prevent multiple calls
      combatEndingRef.current = true;
      
      // Refresh character information first
      getCharacterById(character.id).then(response => {
        if (response.success && response.data) {
          setCharacter(response.data);
        }
        
        // Call onCombatEnd to update the UI with the result
        onCombatEnd(finalResult);
      }).catch(() => {
        // Call onCombatEnd even if getCharacterById fails
        onCombatEnd(finalResult);
      });
    }
  }, [combat, character.id, combatId, onCombatEnd]);

  // Create a floating damage number
  const createFloatingNumber = (
    target: 'character' | 'monster', 
    value: number, 
    type: 'damage' | 'heal' | 'effect' | 'dodge' | 'crit' | 'poison' | 'burn' | 'bleed' = 'damage', 
    text?: string
  ) => {
    // Get the target element
    const targetElement = document.querySelector(target === 'character' ? '.character-avatar' : '.monster-avatar');
    if (!targetElement) return;
    
    // Create the floating number element
    const floatingNumber = document.createElement('div');
    
    // Set class based on type
    switch (type) {
      case 'damage':
        floatingNumber.className = 'damage-number';
        break;
      case 'heal':
        floatingNumber.className = 'heal-number';
        break;
      case 'dodge':
        floatingNumber.className = 'dodge-text';
        break;
      case 'crit':
        floatingNumber.className = 'crit-text';
        break;
      case 'poison':
        floatingNumber.className = 'poison-text';
        break;
      case 'burn':
        floatingNumber.className = 'burn-text';
        break;
      case 'bleed':
        floatingNumber.className = 'bleed-text';
        break;
      default:
        floatingNumber.className = 'effect-text';
    }
    
    // Set text content with emoji based on type
    if (text) {
      floatingNumber.textContent = text;
    } else if (type === 'dodge') {
      floatingNumber.textContent = 'Dodge!';
    } else if (type === 'crit') {
      floatingNumber.textContent = 'CRIT!';
    } else if (type === 'poison') {
      floatingNumber.textContent = `${value} 🧪`; // Poison flask emoji
    } else if (type === 'burn') {
      floatingNumber.textContent = `${value} 🔥`; // Fire emoji
    } else if (type === 'bleed') {
      floatingNumber.textContent = `${value} 🩸`; // Blood drop emoji
    } else {
      floatingNumber.textContent = `${value}`;
    }
    
    // Position it over the target
    const rect = targetElement.getBoundingClientRect();
    const damageContainer = document.getElementById('damage-numbers');
    if (!damageContainer) return;
    
    const containerRect = damageContainer.getBoundingClientRect();
    
    // Adjust position based on target (move character effects right, monster effects left)
    const horizontalOffset = target === 'character' ? 20 : -20; // 20px offset
    
    // Add slight randomness to position for multiple numbers
    const randomX = Math.floor(Math.random() * 20) - 10; // -10 to +10 pixels
    const randomY = Math.floor(Math.random() * 10) - 5;  // -5 to +5 pixels
    
    floatingNumber.style.left = `${rect.left - containerRect.left + rect.width / 2 + horizontalOffset + randomX}px`;
    floatingNumber.style.top = `${rect.top - containerRect.top + randomY}px`;
    
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
    setCombatLog(prevLog => {
      // Keep only the last 5 messages to avoid cluttering the overlay
      const newLog = [...prevLog, message];
      if (newLog.length > 5) {
        return newLog.slice(newLog.length - 5);
      }
      return newLog;
    });
  };

  // Handle monster action (extracted to reduce code duplication)
  const handleMonsterAction = (result: any, currentCombat: Combat) => {
    if (!result.data) return;
    
    // Check if monster dealt damage
    const monsterDealtDamage = result.data.monster_damage_dealt > currentCombat.monster_damage_dealt;
    
    // Get structured data from turnEvents
    const turnEvents = result.data.turnEvents;
    const monsterAction = turnEvents?.monsterAction;
    
    // Variables to track combat event types
    let usedSkill = monsterAction?.type === 'skill';
    let skillName = monsterAction?.skillUsed || '';
    let monsterCrit = monsterAction?.criticalHit || false;
    let characterDodged = monsterAction?.targetDodged || false;
    
    // Get DoT effects data directly from turnEvents
    const dotEffects = {
      bleed: { 
        detected: monsterAction?.dotEffects?.bleed?.triggered || false, 
        amount: monsterAction?.dotEffects?.bleed?.amount || 0 
      },
      poison: { 
        detected: monsterAction?.dotEffects?.poison?.triggered || false, 
        amount: monsterAction?.dotEffects?.poison?.amount || 0 
      },
      burn: { 
        detected: monsterAction?.dotEffects?.burn?.triggered || false, 
        amount: monsterAction?.dotEffects?.burn?.amount || 0 
      }
    };
    
    // Short delay before monster acts
    setTimeout(() => {
      // Animate monster attacking
      animateElement('.monster-avatar', 'attacking');
      
      // If monster used a skill, show it with an effect floating text
      if (usedSkill) {
        createFloatingNumber('monster', 0, 'effect', skillName);
      }
      
      // If character dodged the attack
      if (characterDodged) {
        setTimeout(() => {
          createFloatingNumber('character', 0, 'dodge', 'Dodge!');
        }, 250);
      } 
      // If damage was dealt
      else if (monsterDealtDamage) {
        const monsterDamage = result.data.monster_damage_dealt - currentCombat.monster_damage_dealt;
        
        // Short delay for attack animation
        setTimeout(() => {
          // Animate character being hit
          animateElement('.character-avatar', 'hit');
          
          // Show critical hit text if it was a crit
          if (monsterCrit) {
            createFloatingNumber('character', 0, 'crit', 'CRIT!');
            setTimeout(() => {
              // Show damage number after crit text
              createFloatingNumber('character', monsterDamage, 'damage');
            }, 100);
          } else {
            // Normal damage number
            createFloatingNumber('character', monsterDamage, 'damage');
          }
        }, 250);
        
        // Update character HP locally instead of fetching from server
        const newHP = Math.max(0, character.current_hitpoints - monsterDamage);
        
        // Update character state locally
        setCharacter(prevChar => ({
          ...prevChar,
          current_hitpoints: newHP
        }));
      } else if (usedSkill) {
        // If no damage was dealt but a skill was used, it's a status effect
        setTimeout(() => {
          // Create a visual effect to show the skill impact
          createFloatingNumber('character', 0, 'effect', 'Affected!');
        }, 250);
      }
      
      // Display DoT effects after a slight delay
      setTimeout(() => {
        // Show bleeding effect if detected
        if (dotEffects.bleed.detected) {
          createFloatingNumber('character', dotEffects.bleed.amount, 'bleed');
        }
        
        // Show poison effect if detected
        if (dotEffects.poison.detected) {
          setTimeout(() => {
            createFloatingNumber('character', dotEffects.poison.amount, 'poison');
          }, 150); // Small delay to not overlap with bleed
        }
        
        // Show burn effect if detected
        if (dotEffects.burn.detected) {
          setTimeout(() => {
            createFloatingNumber('character', dotEffects.burn.amount, 'burn');
          }, 300); // Small delay to not overlap with poison
        }
      }, 700); // Display after the main attack animation
    }, 500);
  };

  // Handle combat completion (extracted to reduce code duplication)
  const handleCombatCompletion = (result: any, isVictoryAction: boolean) => {
    if (!combat || !result.data?.is_completed) return;
    
    if (result.data.is_victory) {
      addToCombatLog(`You defeated the ${combat.monster.name}!`);
      createFloatingNumber('monster', 0, 'effect', 'Defeated!');
    } else {
      addToCombatLog(`You were defeated by the ${combat.monster.name}!`);
      createFloatingNumber('character', 0, 'effect', 'Defeated!');
    }
    
    // Refresh character data after combat ends
    getCharacterById(character.id).then(response => {
      if (response.success && response.data) {
        setCharacter(response.data);
      }
    });
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
      
      // Get structured data from turnEvents
      const turnEvents = result.data.turnEvents;
      const characterAction = turnEvents?.characterAction;
      
      // Variables to track combat event types
      let monsterDodged = characterAction?.targetDodged || false;
      let criticalHit = characterAction?.criticalHit || false;
      
      // Get DoT effects data directly from turnEvents
      const dotEffects = {
        bleed: { 
          detected: characterAction?.dotEffects?.bleed?.triggered || false, 
          amount: characterAction?.dotEffects?.bleed?.amount || 0 
        },
        poison: { 
          detected: characterAction?.dotEffects?.poison?.triggered || false, 
          amount: characterAction?.dotEffects?.poison?.amount || 0 
        },
        burn: { 
          detected: characterAction?.dotEffects?.burn?.triggered || false, 
          amount: characterAction?.dotEffects?.burn?.amount || 0 
        }
      };
      
      // Calculate damage dealt
      const damageDealt = result.data.character_damage_dealt - combat.character_damage_dealt;
      
      // Show appropriate combat effects
      if (monsterDodged) {
        // Show dodge text on monster
        createFloatingNumber('monster', 0, 'dodge', 'Dodge!');
      } else {
        // Show critical hit text if it was a crit
        if (criticalHit) {
          createFloatingNumber('monster', 0, 'crit', 'CRIT!');
          setTimeout(() => {
            // Show damage number after crit text
            createFloatingNumber('monster', damageDealt, 'damage');
          }, 100);
          
          // Animate monster being hit (with stronger effect for crits)
          animateElement('.monster-avatar', 'hit');
        } else if (damageDealt > 0) {
          // Regular damage
          createFloatingNumber('monster', damageDealt, 'damage');
          
          // Animate monster being hit
          animateElement('.monster-avatar', 'hit');
        }
      }
      
      // Display DoT effects after a slight delay
      setTimeout(() => {
        // Show bleeding effect if detected
        if (dotEffects.bleed.detected) {
          createFloatingNumber('monster', dotEffects.bleed.amount, 'bleed');
        }
        
        // Show poison effect if detected
        if (dotEffects.poison.detected) {
          setTimeout(() => {
            createFloatingNumber('monster', dotEffects.poison.amount, 'poison');
          }, 150); // Small delay to not overlap with bleed
        }
        
        // Show burn effect if detected
        if (dotEffects.burn.detected) {
          setTimeout(() => {
            createFloatingNumber('monster', dotEffects.burn.amount, 'burn');
          }, 300); // Small delay to not overlap with poison
        }
      }, 700); // Display after the main attack animation
      
      setCombat(result.data);
      
      // Handle monster counter-action
      handleMonsterAction(result, combat);
      
      // Handle combat completion
      handleCombatCompletion(result, true);
      
      setActionInProgress(false);
    } catch (err) {
      console.error('Error performing attack:', err);
      setError('An unexpected error occurred');
      setActionInProgress(false);
    }
  };

  // Handle skill action
  const handleUseSkill = async (skill: Skill) => {
    if (!combat || actionInProgress) return;
    
    // Check energy before attempting to use skill
    if (character.current_energy < skill.energy_cost) {
      setError('Not enough energy to use this skill');
      setTimeout(() => setError(null), 3000); // Clear error after 3 seconds
      return;
    }
    
    setActionInProgress(true);
    setSelectedSkill(skill);
    
    try {
      // Animate character using skill
      animateElement('.character-avatar', 'attacking');
      
      // Show skill name as effect
      createFloatingNumber('character', 0, 'effect', skill.name);
      
      // Update energy locally immediately for responsive UI
      const energyCost = skill.energy_cost;
      setCharacter(prevChar => ({
        ...prevChar,
        current_energy: Math.max(0, prevChar.current_energy - energyCost)
      }));
      
      const result = await startCombatTurn(combatId, 'skill', skill);
      
      if (!result.success || !result.data) {
        setError(result.error || 'Failed to use skill');
        setTimeout(() => setError(null), 3000); // Clear error after 3 seconds
        setActionInProgress(false);
        return;
      }
      
      // Get structured data from turnEvents
      const turnEvents = result.data.turnEvents;
      const characterAction = turnEvents?.characterAction;
      
      // Get DoT effects data directly from turnEvents
      const dotEffects = {
        bleed: { 
          detected: characterAction?.dotEffects?.bleed?.triggered || false, 
          amount: characterAction?.dotEffects?.bleed?.amount || 0 
        },
        poison: { 
          detected: characterAction?.dotEffects?.poison?.triggered || false, 
          amount: characterAction?.dotEffects?.poison?.amount || 0 
        },
        burn: { 
          detected: characterAction?.dotEffects?.burn?.triggered || false, 
          amount: characterAction?.dotEffects?.burn?.amount || 0 
        }
      };
      
      setCombat(result.data);
      addToCombatLog(`You used ${skill.name}!`);
      
      // If skill dealt damage
      if (result.data.character_damage_dealt > combat.character_damage_dealt) {
        const damageDealt = result.data.character_damage_dealt - combat.character_damage_dealt;
        
        // Show floating damage number on monster
        createFloatingNumber('monster', damageDealt, 'damage');
        
        // Animate monster being hit
        animateElement('.monster-avatar', 'hit');
        
        addToCombatLog(`You dealt ${damageDealt} damage to the ${combat.monster.name}!`);
      }
      
      // Check if healing was done by comparing character HP
      // We need to get the updated character data from the server
      let updatedCharacterHP = character.current_hitpoints;
      
      // Try to get the latest character data if available
      if (result.data && result.data.character_id) {
        const charResponse = await getCharacterById(result.data.character_id);
        if (charResponse.success && charResponse.data) {
          updatedCharacterHP = charResponse.data.current_hitpoints;
        }
      }
      
      // If healing occurred (current HP is higher than before)
      if (updatedCharacterHP > character.current_hitpoints) {
        const healingDone = updatedCharacterHP - character.current_hitpoints;
        
        // Show floating healing number on character
        createFloatingNumber('character', healingDone, 'heal');
        
        // Update character HP locally
        setCharacter(prevChar => ({
          ...prevChar,
          current_hitpoints: updatedCharacterHP
        }));
        
        addToCombatLog(`You healed for ${healingDone} health!`);
        
        // Display DoT effects after a slight delay
        setTimeout(() => {
          // Show bleeding effect if detected
          if (dotEffects.bleed.detected) {
            createFloatingNumber('monster', dotEffects.bleed.amount, 'bleed');
          }
          
          // Show poison effect if detected
          if (dotEffects.poison.detected) {
            setTimeout(() => {
              createFloatingNumber('monster', dotEffects.poison.amount, 'poison');
            }, 150); // Small delay to not overlap with bleed
          }
          
          // Show burn effect if detected
          if (dotEffects.burn.detected) {
            setTimeout(() => {
              createFloatingNumber('monster', dotEffects.burn.amount, 'burn');
            }, 300); // Small delay to not overlap with poison
          }
        }, 700); // Display after the main attack animation
      }
      
      // Handle monster counter-action
      handleMonsterAction(result, combat);
      
      // Handle combat completion
      handleCombatCompletion(result, false);
      
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
      
      if (result.data.is_completed) {
        addToCombatLog(`You successfully ran away from the ${combat.monster.name}!`);
        createFloatingNumber('character', 0, 'effect', 'Escaped!');
      } else {
        addToCombatLog('You failed to run away!');
        createFloatingNumber('character', 0, 'effect', 'Failed!');
        
        // Handle monster counter-action after failed run
        handleMonsterAction(result, combat);
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

  // Create error overlay component
  const ErrorOverlay = () => {
    if (!error) return null;
    
    return (
      <div className="absolute top-0 left-0 right-0 z-50 bg-red-900 border border-red-500 p-2 rounded-md text-center mx-auto max-w-md">
        <p className="text-white mb-1">{error}</p>
        <button 
          onClick={() => setError(null)} 
          className="text-xs bg-red-700 hover:bg-red-600 text-white px-2 py-1 rounded"
        >
          Dismiss
        </button>
      </div>
    );
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center w-full h-full min-h-[400px]">
        <LoadingSpinner size="lg" />
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

  // Calculate current monster HP (safely handle undefined monster)
  const monsterCurrentHp = combat.monster && combat.monster.hitpoints ? 
    Math.max(0, combat.monster.hitpoints - combat.character_damage_dealt) : 0;
  
  return (
    <>
      <div className="animate-fadeIn relative">
        {/* Error overlay */}
        <ErrorOverlay />
        {/* Combat Scene Component - Contains background, fighters, and messages */}
        <CombatScene
          character={character}
          combat={combat}
          characterEffects={characterEffects}
          monsterEffects={monsterEffects}
          combatLog={combatLog}
          areaImage={area.image}
          onMonsterInfoClick={() => setShowMonsterInfo(true)}
        />
          
        {/* Control Panel - Directly below Combat Scene with no gap */}
        <div className="bg-gray-900 bg-opacity-80 py-2 px-3 border-t border-gray-700">
          {combat.is_completed ? (
            <div className="text-center py-1 md:py-2">
              <h3 className="text-xl md:text-2xl mb-2 md:mb-4 text-yellow-400">
                {combat.is_victory ? 'Victory!' : 'Defeat!'}
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

                  // Create the final result - this action only updates the UI, doesn't trigger server calls
                  const finalResult = {
                    isVictory: combat.is_victory === true,
                    ranAway: !!ranAway,
                    monsterName: combat.monster?.name || 'monster'
                  };

                  // Get updated character data
                  getCharacterById(character.id).then(response => {
                    if (response.success && response.data) {
                      setCharacter(response.data);
                    }
                    
                    // Call onCombatEnd to update the UI
                    onCombatEnd(finalResult);
                  }).catch(() => {
                    // Call onCombatEnd even if getCharacterById fails
                    onCombatEnd(finalResult);
                  });
                }}
                className="pixel-button text-base md:text-xl"
              >
                Continue
              </button>
            </div>
          ) : (
            <div className="relative">
              {/* Combined action bar - Attack and skills in one row */}
              <div className="flex flex-wrap gap-2 items-center justify-center">
                <ActionButton 
                  icon="attack"
                  label="Attack"
                  onClick={handleAttack}
                  disabled={actionInProgress}
                />
                
                {skills.length > 0 ? (
                  skills.map((skill) => (
                    <ActionButton 
                      key={skill.id}
                      icon={`skill/${skill.image_url}`}
                      label={skill.name}
                      onClick={() => {
                        if (character.current_energy >= skill.energy_cost && !actionInProgress) {
                          handleUseSkill(skill);
                        }
                      }}
                      disabled={character.current_energy < skill.energy_cost || actionInProgress}
                      cost={skill.energy_cost}
                      description={`${skill.description} (Energy: ${skill.energy_cost})`}
                      isSkill={true}
                    />
                  ))
                ) : (
                  <div className="text-center px-2 text-gray-400">
                    <p className="text-sm">No skills available</p>
                  </div>
                )}
              </div>
              
              {/* Run Away button in bottom right */}
              <div className="flex justify-end mt-2">
                <button 
                  onClick={handleRun}
                  disabled={actionInProgress}
                  className="bg-yellow-700 hover:bg-yellow-600 active:bg-yellow-800 px-4 py-1 rounded-full text-sm font-bold text-white shadow-md disabled:opacity-50 flex items-center"
                >
                  <div className="w-4 h-4 mr-1">
                    <Image
                      src="/image/ui/flee.png"
                      alt=""
                      width={16}
                      height={16}
                    />
                  </div>
                  Run Away
                </button>
              </div>
              
              {/* Use skill button removed - skills now activate immediately on click */}
            </div>
          )}
        </div>
      </div>

      {/* Monster Info Dialog */}
      {combat && (
        <Transition appear show={showMonsterInfo} as={Fragment}>
          <Dialog as="div" className="relative z-50" onClose={() => setShowMonsterInfo(false)}>
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-black bg-opacity-75" />
            </TransitionChild>

            <div className="fixed inset-0 overflow-y-auto">
              <div className="flex min-h-full items-center justify-center p-4 text-center">
                <TransitionChild
                  as={Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0 scale-95"
                  enterTo="opacity-100 scale-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100 scale-100"
                  leaveTo="opacity-0 scale-95"
                >
                  <DialogPanel className="w-11/12 max-w-sm md:max-w-md transform overflow-hidden rounded-2xl bg-gray-900 border-2 border-gray-700 p-4 md:p-6 text-left align-middle shadow-xl transition-all">
                    <DialogTitle as="h3" className="text-lg md:text-xl font-bold text-center text-red-400 mb-3 md:mb-4 border-b border-gray-700 pb-2">
                      {combat.monster.name}
                      {combat.monster.is_elite && (
                        <span className="ml-2 text-xs text-yellow-400 font-bold border border-yellow-400 rounded-md px-1 py-0.5">
                          ELITE
                        </span>
                      )}
                    </DialogTitle>
                    
                    <div className="flex mb-4">
                      <div className="mr-4">
                        <div 
                          style={{
                            width: '80px', 
                            height: '80px',
                            position: 'relative',
                            overflow: 'visible'
                          }}
                        >
                          {/* Monster image centered within container */}
                          <div
                            style={{
                              position: 'absolute',
                              bottom: '0',
                              left: '50%',
                              transform: 'translateX(-50%)',
                              width: `${80 * (combat.monster.scale || 1.0)}px`,
                              height: `${80 * (combat.monster.scale || 1.0)}px`,
                            }}
                          >
                            <Image
                              src={ImageSource.getMonsterImagePath(combat.monster)}
                              alt={combat.monster.name}
                              width={80 * (combat.monster.scale || 1.0)}
                              height={80 * (combat.monster.scale || 1.0)}
                              className="-scale-x-100"
                              priority={true}
                              style={{
                                objectFit: 'contain',
                                width: `${80 * (combat.monster.scale || 1.0)}px`,
                                height: `${80 * (combat.monster.scale || 1.0)}px`,
                              }}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="mb-2">
                          <StatusBar 
                            current={monsterCurrentHp} 
                            max={combat.monster.hitpoints}
                          />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-1 md:gap-2">
                          {combat.monster.defense && (
                            <>
                              <div><span>Attack:</span> {combat.monster.attack}</div>
                              <div><span>Defense:</span> {combat.monster.defense}</div>
                              <div><span>Level:</span> {combat.monster.level || 1}</div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Monster abilities section */}
                    {combat.monster.abilities && Object.keys(combat.monster.abilities).length > 0 && (
                      <div className="mt-4 border-t border-gray-700 pt-2">
                        <h4 className="mb-2 text-yellow-400">Abilities:</h4>
                        <div className="grid grid-cols-1 gap-2">
                          {Object.entries(combat.monster.abilities).map(([name, ability]: [string, any]) => (
                            <div key={name} className="bg-gray-800 p-2 rounded">
                              <div className="text-red-300">{name}</div>
                              <div className="text-gray-300">
                                {ability.damage ? `Damage: ${ability.damage}` : ''}
                                {ability.damage_over_time ? ` DoT: ${ability.damage_over_time}` : ''}
                                {ability.duration ? ` (${ability.duration} turns)` : ''}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="mt-4 text-center">
                      <button
                        type="button"
                        className="pixel-button"
                        onClick={() => setShowMonsterInfo(false)}
                      >
                        Close
                      </button>
                    </div>
                  </DialogPanel>
                </TransitionChild>
              </div>
            </div>
          </Dialog>
        </Transition>
      )}
    </>
  );
}
