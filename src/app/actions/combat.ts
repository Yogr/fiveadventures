'use server';

import type {
  ApiResponse,
  Combat,
  Character,
  Monster,
  Item,
  Skill,
  Fighter,
  TurnEvents
} from '@/lib/types';
import { getCharacterById } from './character';
import { getPrimaryStat, generateId } from '@/lib/utils';
import { createClient } from '@/lib/supabase/server';
import { 
  getCachedItemById, 
  getCachedMonsterById,
  getCachedSkillById,
  getCachedSkills
} from '@/lib/game-data-service';
import { processDungeonKeyParts } from './dungeon';
import { updateCombatEffects, applySkillEffect, applyMonsterAbilityEffect } from './effect-helpers';
import { executeSkill, processActiveEffects } from './skill-utils';
import {
  calculateTotalDamage,
  calculateTotalDefense,
  getTotalMaxHitpoints,
  calculateCriticalHit,
  calculateDodgeChance
} from '@/lib/character-utils';
import { getLevelFromExperience, CLASS_STAT_GROWTH } from '@/lib/utils';

// Get combat data
export async function getCombat(
  combatId: string
): Promise<ApiResponse<Combat>> {
  try {
    console.log('Combat: Getting combat data for ID:', combatId);
    const supabase = await createClient();
    
    // First get basic combat data without joined monster (which we'll fetch with cache)
    const { data, error } = await supabase
      .from('combat')
      .select(`
        *,
        player_effects,
        enemy_effects
      `)
      .eq('id', combatId)
      .single();
    
    if (error) {
      console.error('Error getting combat:', error);
      return {
        success: false,
        error: 'Failed to get combat'
      };
    }
    
    // Now fetch the monster data from cache
    if (data.monster_id) {
      console.log('Combat: Fetching monster data for combat from cache, ID:', data.monster_id);
      const { success: monsterSuccess, data: monsterData } = await getCachedMonsterById(data.monster_id, supabase);
      if (monsterSuccess && monsterData) {
        // Add the monster data to the combat object
        data.monster = monsterData;
        console.log('Combat: Successfully fetched monster data:', monsterData.name);
      } else {
        console.error('Combat: Failed to fetch monster data from cache, falling back to direct query');
        // Fall back to direct database query if cache fails
        const supabaseMonster = await supabase
          .from('monsters')
          .select('*')
          .eq('id', data.monster_id)
          .single();
          
        if (!supabaseMonster.error) {
          data.monster = supabaseMonster.data as Monster;
          console.log('Combat: Successfully fetched monster data from database:', data.monster.name);
        } else {
          console.error('Combat: Failed to fetch monster data from database:', supabaseMonster.error);
        }
      }
    }
    
    console.log('Combat: Retrieved combat data:', {
      id: data.id,
      is_completed: data.is_completed,
      is_victory: data.is_victory,
      current_turn: data.current_turn || 1,
      has_monster: !!data.monster
    });
    
    // Now fetch the monster data from cache
    if (data && data.monster_id) {
      console.log('ActiveCombat: Fetching monster data for combat from cache, ID:', data.monster_id);
      const { success: monsterSuccess, data: monsterData } = await getCachedMonsterById(data.monster_id, supabase);
      if (monsterSuccess && monsterData) {
        // Add the monster data to the combat object
        data.monster = monsterData;
        console.log('ActiveCombat: Successfully fetched monster data:', monsterData.name);
      } else {
        console.error('ActiveCombat: Failed to fetch monster data from cache, falling back to direct query');
        // Fall back to direct database query if cache fails
        const supabaseMonster = await supabase
          .from('monsters')
          .select('*')
          .eq('id', data.monster_id)
          .single();
          
        if (!supabaseMonster.error) {
          data.monster = supabaseMonster.data as Monster;
          console.log('ActiveCombat: Successfully fetched monster data from database:', data.monster.name);
        } else {
          console.error('ActiveCombat: Failed to fetch monster data from database:', supabaseMonster.error);
        }
      }
    }
    
    return {
      success: true,
      data: data as Combat
    };
  } catch (err) {
    console.error('Unexpected error getting combat:', err);
    return {
      success: false,
      error: 'An unexpected error occurred'
    };
  }
}

/**
 * Process effects from equipped items for a character
 * @param character The character with equipment
 * @param monster The monster being fought
 * @param isBoss Whether the monster is a boss
 * @returns Object containing various effect modifiers
 */
export async function processItemEffects(
  character: Character,
  monster: Monster,
  isBoss: boolean = false
): Promise<{
  damageMultiplier: number;
  ignoreDefense: boolean;
  additionalDamage: number;
  doubleCastChance: number;
  freeCastChance: number;
  reflectSpellChance: number;
  elementalDamage: number;
  elementalType: string | null;
  tripleStrikeChance: number;
}> {
  // Initialize result with default values
  const result = {
    damageMultiplier: 1.0,
    ignoreDefense: false,
    additionalDamage: 0,
    doubleCastChance: 0,
    freeCastChance: 0,
    reflectSpellChance: 0,
    elementalDamage: 0,
    elementalType: null as string | null,
    tripleStrikeChance: 0
  };
  
  // Check if character has equipment
  if (!character.equipment) {
    return result;
  }
  
  // Get all equipped items
  const equippedItems = [
    character.equipment.weapon,
    character.equipment.helmet,
    character.equipment.armor,
    character.equipment.trinket
  ].filter(item => item !== null && item !== undefined) as Item[];
  
  // Process each equipped item
  for (const item of equippedItems) {
    if (!item.effects) continue;
    
    const effects = item.effects as Record<string, any>;
    
    // Process elemental damage
    if (effects.elemental) {
      result.elementalDamage += effects.elemental.damage || 0;
      result.elementalType = effects.elemental.type || null;
    }
    
    // Process critical hit modifiers (handled separately in combat function)
    
    // Process boss damage multiplier
    if (effects.boss_damage_multiplier && isBoss) {
      result.damageMultiplier *= effects.boss_damage_multiplier;
    }
    
    // Process special effects
    if (effects.special) {
      const special = effects.special;
      
      // Check for ArmorBreak effect
      if (special.type === 'ArmorBreak') {
        // Roll for chance to ignore defense
        const roll = Math.random() * 100;
        if (roll <= 15) { // 15% chance hardcoded in the item
          result.ignoreDefense = true;
        }
      }
      
      // Check for ManaEfficiency effect - reduces energy cost
      if (special.type === 'ManaEfficiency') {
        // This is handled separately in the skill usage section
      }
      
      // Check for HeroicStrike effect - chance to triple damage
      if (special.type === 'HeroicStrike') {
        result.tripleStrikeChance = special.description?.includes('10%') ? 10 : 0;
      }
      
      // Check for SpellMastery effect - chance to cast twice or cost no energy
      if (special.type === 'SpellMastery') {
        result.doubleCastChance = 8; // 8% from description
        result.freeCastChance = 15; // 15% from description
      }
      
      // Check for CrystalReflection effect - chance to reflect spells
      if (special.type === 'CrystalReflection') {
        result.reflectSpellChance = special.description?.includes('15%') ? 15 : 0;
      }
    }
  }
  
  return result;
}

// Start a combat turn
export async function startCombatTurn(
  combatId: string,
  action: string,
  skill?: Skill | null,
): Promise<ApiResponse<Combat>> {
  try {
    const supabase = await createClient();

    // Get the combat data without joined monster (which we'll fetch with cache)
    const { data: combat, error: combatError } = await supabase
      .from('combat')
      .select('*, character:character_id(*), player_effects, enemy_effects')
      .eq('id', combatId)
      .single();
    
    if (combatError || !combat) {
      console.error('Error getting combat:', combatError);
      return {
        success: false,
        error: 'Failed to get combat'
      };
    }
    
    if (combat.is_completed) {
      return {
        success: false,
        error: 'Combat is already completed'
      };
    }
    
    // Fetch monster data from cache
    if (combat.monster_id) {
      console.log('Fetching monster data for ID:', combat.monster_id);
      const { success: monsterSuccess, data: monsterData } = await getCachedMonsterById(combat.monster_id, supabase);
      if (monsterSuccess && monsterData) {
        // Add the monster data to the combat object
        combat.monster = monsterData;
      } else {
        console.error('Error fetching monster data from cache for ID:', combat.monster_id);
        return {
          success: false,
          error: 'Failed to get monster data'
        };
      }
    } else {
      console.error('Combat missing monster_id');
      return {
        success: false,
        error: 'Invalid combat data'
      };
    }
    
    // Verify monster data is valid before proceeding
    const monsterData = combat.monster as Monster;
    if (!monsterData || !monsterData.hitpoints) {
      console.error('Monster data is invalid or incomplete:', monsterData);
      return {
        success: false,
        error: 'Invalid monster data'
      };
    }
    
    // Get character and ensure it has populated equipment data
    const character = combat.character as Character;
    
    // Get character equipment IDs if not already populated
    if (!character.equipment || !character.equipment.weapon) {
      // Get character equipment
      const { data: equipment, error: equipmentError } = await supabase
        .from('character_equipment')
        .select('*')
        .eq('character_id', character.id)
        .single();
        
      if (equipmentError && equipmentError.code !== 'PGRST116') {
        console.error('Error getting character equipment:', equipmentError);
      }
      
      // Create equipment object
      const characterEquipment = equipment || {
        id: '', 
        character_id: character.id,
        weapon_id: null,
        helmet_id: null,
        armor_id: null,
        trinket_id: null,
        updated_at: new Date().toISOString()
      };
      
      // Fetch all equipment items using cached functions
      // Use parallel fetching for better performance
      const equipmentPromises = [];
      let weaponItem = null;
      let helmetItem = null;
      let armorItem = null;
      let trinketItem = null;
      
      if (characterEquipment.weapon_id) {
        equipmentPromises.push(
          getCachedItemById(characterEquipment.weapon_id, supabase)
            .then(result => {
              if (result.success) {
                weaponItem = result.data;
              }
            })
        );
      }
      
      if (characterEquipment.helmet_id) {
        equipmentPromises.push(
          getCachedItemById(characterEquipment.helmet_id, supabase)
            .then(result => {
              if (result.success) {
                helmetItem = result.data;
              }
            })
        );
      }
      
      if (characterEquipment.armor_id) {
        equipmentPromises.push(
          getCachedItemById(characterEquipment.armor_id, supabase)
            .then(result => {
              if (result.success) {
                armorItem = result.data;
              }
            })
        );
      }
      
      if (characterEquipment.trinket_id) {
        equipmentPromises.push(
          getCachedItemById(characterEquipment.trinket_id, supabase)
            .then(result => {
              if (result.success) {
                trinketItem = result.data;
              }
            })
        );
      }
      
      // Wait for all equipment items to be fetched
      await Promise.all(equipmentPromises);
      
      // Attach equipment data to character
      character.equipment = {
        ...characterEquipment,
        weapon: weaponItem,
        helmet: helmetItem,
        armor: armorItem,
        trinket: trinketItem
      };
      
      // Update the character in the combat object
      combat.character = character;
    }
    
    // Get the current turn number
    const currentTurn = combat.current_turn || 1;
    
    // Initialize combat log for this turn
    let combatLog = combat.combat_log || [];
    
    // Process character action
    let characterDamageDealt = 0;
    let characterHealingDone = 0;
    // We already have monster data from earlier verification
    const monster = monsterData;
    
    // Initialize turnEvents object to track structured combat data
    let turnEvents: TurnEvents = {
      characterAction: {
        type: action as 'attack' | 'skill' | 'run',
        criticalHit: false,
        targetDodged: false,
        damageDealt: 0,
        skillUsed: action === 'skill' && skill ? skill.name : undefined,
        effectsApplied: [],
        dotEffects: {
          bleed: { triggered: false, amount: 0 },
          poison: { triggered: false, amount: 0 },
          burn: { triggered: false, amount: 0 }
        }
      },
      monsterAction: {
        type: 'none',
        skillUsed: null,
        criticalHit: false,
        targetDodged: false,
        damageDealt: 0,
        effectsApplied: [],
        dotEffects: {
          bleed: { triggered: false, amount: 0 },
          poison: { triggered: false, amount: 0 },
          burn: { triggered: false, amount: 0 }
        }
      }
    };
    
    // Filter active effects before the turn starts and process any DoT/HoT effects
    await updateCombatEffects(combatId);
    
    // Process any active effects (applying DoT, HoT, etc.)
    const effectResults = await processActiveEffects(combat, currentTurn);
    
    // Apply any damage or healing from effects
    if (effectResults.playerDamageFromEffects > 0) {
      // Character takes damage from effects
      const newHP = Math.max(0, character.current_hitpoints - effectResults.playerDamageFromEffects);
      await supabase
        .from('characters')
        .update({
          current_hitpoints: newHP
        })
        .eq('id', character.id);
        
      // Add to combat log
      combatLog.push(...effectResults.messages.filter(msg => msg.includes('player')));
    }
    
    if (effectResults.playerHealingFromEffects > 0) {
      // Character heals from effects
      const newHP = Math.min(
        getTotalMaxHitpoints(character), 
        character.current_hitpoints + effectResults.playerHealingFromEffects
      );
      
      await supabase
        .from('characters')
        .update({
          current_hitpoints: newHP
        })
        .eq('id', character.id);
    }
    
    // Apply monster effects (damage and healing)
    // This is tracked in memory since monster HP isn't in the database
    const monsterCurrentHP = Math.max(0, monster.hitpoints - combat.character_damage_dealt);
    let monsterUpdatedHP = monsterCurrentHP;
    
    if (effectResults.monsterDamageFromEffects > 0) {
      monsterUpdatedHP = Math.max(0, monsterUpdatedHP - effectResults.monsterDamageFromEffects);
      combatLog.push(...effectResults.messages.filter(msg => msg.includes('monster')));
    }
    
    if (effectResults.monsterHealingFromEffects > 0) {
      monsterUpdatedHP = Math.min(monster.hitpoints, monsterUpdatedHP + effectResults.monsterHealingFromEffects);
    }
    
    // Update the character damage dealt to include effect damage
    characterDamageDealt += (monsterCurrentHP - monsterUpdatedHP);
    
    // Calculate character damage based on action
    if (action === 'attack') {
      // Basic attack
      // The character object already has fully populated equipment data from the enhanced character service
      // No need to fetch equipment again - it's already cached and included in the character object
      const weaponEquipment = character.equipment;
      
      // Check if monster is a boss
      const isBoss = monster.is_elite === true || monster.is_boss === true;
      
      // Process item effects
      const itemEffects = await processItemEffects(character, monster, isBoss);
      
      // Calculate total damage using the same function as in the character display
      let baseDamage = calculateTotalDamage(character, weaponEquipment?.weapon || undefined);

      console.log('Combat: Base damage calculated:', baseDamage);
      
      // Add randomness (±20%)
      const randomFactor = 0.8 + (Math.random() * 0.4); // 0.8 to 1.2
      characterDamageDealt = Math.floor(baseDamage * randomFactor);

      console.log(`Combat: Character basic attack - Base damage: ${baseDamage}, Random factor: ${randomFactor}, Damage dealt: ${characterDamageDealt}`);
      
      // Apply monster defense (reduced impact) unless we have ignore defense effect
      if (!itemEffects.ignoreDefense) {
        characterDamageDealt = Math.max(1, characterDamageDealt - Math.floor(monster.defense / 3));
        console.log(`Combat: Monster defense applied - Damage reduced to: ${characterDamageDealt}, monster defense: ${monster.defense}`);
      } else {
        combatLog.push(`${character.name}'s attack ignores armor!`);
      }
      
      // Check for critical hit using character's weapon
      const criticalHit = calculateCriticalHit(
        character, 
        weaponEquipment?.weapon || undefined
      );
      
      // Apply critical hit if it occurs
      if (criticalHit.isCritical) {
        console.log(`Combat: Critical hit! Damage before multiplier: ${characterDamageDealt}`);
        characterDamageDealt = Math.floor(characterDamageDealt * criticalHit.multiplier);
        combatLog.push(`${character.name} lands a CRITICAL hit on ${monster.name}!`);
        
        // Update turnEvents with critical hit data
        turnEvents.characterAction!.criticalHit = true;
      }

      // Add elemental damage if applicable
      if (itemEffects.elementalDamage > 0) {
        const elementalDamage = itemEffects.elementalDamage;
        characterDamageDealt += elementalDamage;
        combatLog.push(`${itemEffects.elementalType || 'Elemental'} damage adds ${elementalDamage} additional damage.`);
      }
      
      // Check for triple strike from HeroicStrike effect
      if (itemEffects.tripleStrikeChance > 0) {
        const tripleStrikeRoll = Math.random() * 100;
        if (tripleStrikeRoll <= itemEffects.tripleStrikeChance) {
          characterDamageDealt = Math.floor(characterDamageDealt * 3);
          combatLog.push(`Heroic Strike activated! Triple damage: ${characterDamageDealt}.`);
        }
      }
      
      console.log(`Combat: Character basic attack - Base damage: ${baseDamage}, Final damage: ${characterDamageDealt}`);
      
      // Update turnEvents with damage data
      turnEvents.characterAction!.damageDealt = characterDamageDealt;
      
      // Add to combat log
      combatLog.push(`${character.name} attacks ${monster.name} for ${characterDamageDealt} damage.`);
    } else if (action === 'skill' && skill) {
      
      // Process item effects to check for ManaEfficiency
      const isBoss = monster.is_elite === true || monster.is_boss === true;
      const itemEffects = await processItemEffects(character, monster, isBoss);
      
      // Calculate energy cost with potential reduction from ManaEfficiency
      let energyCost = skill.energy_cost;
      let freeSpellCast = false;
      
      // Check for chance of free cast (SpellMastery effect)
      if (itemEffects.freeCastChance > 0) {
        const freeCastRoll = Math.random() * 100;
        if (freeCastRoll <= itemEffects.freeCastChance) {
          freeSpellCast = true;
          combatLog.push(`Spell Mastery activates! ${skill.name} costs no energy.`);
        }
      }
      
      // Apply ManaEfficiency if present
      const weaponEffects = character.equipment?.weapon?.effects as any;
      const trinketEffects = character.equipment?.trinket?.effects as any;
      
      const hasEquipmentWithManaEfficiency = 
        (weaponEffects?.special?.type === 'ManaEfficiency') ||
        (trinketEffects?.special?.type === 'ManaEfficiency');
      
      if (hasEquipmentWithManaEfficiency && !freeSpellCast) {
        // Apply mana efficiency reduction (15% from item descriptions)
        const reduction = 0.15;
        const oldCost = energyCost;
        energyCost = Math.floor(energyCost * (1 - reduction));
      }
      
      // Skip energy check if free cast
      if (!freeSpellCast && character.current_energy < energyCost) {
        return {
          success: false,
          error: 'Not enough energy'
        };
      }

      // Cast Character and Monster directly as Fighter with TypeScript's interface
      const characterAsFighter = character as unknown as Fighter;
      
      // For monsters, we need to calculate current HP based on damage dealt
      const monsterCurrentHP = Math.max(0, monster.hitpoints - combat.character_damage_dealt);
      
      // Create the fighter object
      const monsterAsFighter = {
        // Start with a fresh object to avoid type errors
        id: monster.id.toString(), // Convert to string as Fighter requires string id
        name: monster.name,
        hitpoints: monster.hitpoints,
        current_hitpoints: monsterCurrentHP,
        attack: monster.attack,
        defense: monster.defense,
        // Default values for missing stats
        strength: monster.attack, // Use attack as strength
        intelligence: 0,
        agility: 0,
        luck: 0,
        wisdom: 0,
        level: monster.level || 1,
        // Add abilities and any other Monster properties we might need
        abilities: monster.abilities
      } as Fighter;
      
      // Calculate chance to dodge the skill
      const dodgeChance = calculateDodgeChance(monsterAsFighter as any, characterAsFighter as any);
      const dodgeRoll = Math.random() * 100;
      const dodged = dodgeRoll <= dodgeChance;
      
      // If monster dodges, no damage is dealt and we add a message
      if (dodged) {
        characterDamageDealt = 0;
        combatLog.push(`${monster.name} dodges ${character.name}'s ${skill.name}!`);
        
        // Update turnEvents with dodge data
        turnEvents.characterAction!.targetDodged = true;
      } else {
        // Execute the skill directly with casted objects
        const skillResult = await executeSkill(skill, characterAsFighter, monsterAsFighter, combat);
        
        // Apply the results
        characterDamageDealt += skillResult.damageDealt;
        characterHealingDone += skillResult.healingDone;
        
        // Add messages to combat log
        combatLog.push(...skillResult.messages);
        
        // Apply any effects if the skill created them
        if (skillResult.effectApplied) {
          await applySkillEffect(combatId, skill, 'character');
        }
        
        // Log debug information
        console.log(`Combat: Skill ${skill.name} executed with result:`, {
          damageDealt: characterDamageDealt,
          healingDone: characterHealingDone,
          effectApplied: skillResult.effectApplied,
          messages: skillResult.messages.length
        });
        
        // Update turnEvents with skill result data
        turnEvents.characterAction!.damageDealt = characterDamageDealt;
        if (skillResult.effectApplied) {
          turnEvents.characterAction!.effectsApplied.push(skill.name);
        }
      }
      
      
      // Update character energy (only if not a free cast)
      if (!freeSpellCast) {
        await supabase
          .from('characters')
          .update({
            current_energy: Math.max(0, character.current_energy - energyCost)
          })
          .eq('id', character.id);
      }
    } else if (action === 'run') {
      // Run away
      // 50% chance of success, modified by agility
      const runChance = 50 + character.agility * 2;
      const roll = Math.floor(Math.random() * 100) + 1;
      
      console.log(`Combat: Run attempt - Roll: ${roll}, Chance: ${runChance}, Success: ${roll <= runChance}`);
      
      // Add to combat log
      combatLog.push(`${character.name} attempts to run away.`);
      
      if (roll <= runChance) {
        // Success - end combat immediately
        // Add to combat log
        combatLog.push(`${character.name} successfully escaped!`);
        
        await supabase
          .from('combat')
          .update({
            is_completed: true,
            is_victory: false,
            combat_log: combatLog,
            completed_at: new Date().toISOString()
          })
          .eq('id', combatId);
        
        // Increment daily adventure count when successfully running away
        console.log('Combat: Character successfully ran away - updating adventure count');
        
        const newAdventureCount = character.daily_adventure_count + 1;
        
        const { error: characterUpdateError } = await supabase
          .from('characters')
          .update({
            daily_adventure_count: newAdventureCount,
            updated_at: new Date().toISOString()
          })
          .eq('id', character.id);
        
        if (characterUpdateError) {
          console.error('Error updating character after running away:', characterUpdateError);
        } else {
          console.log('Character successfully updated after running away');
        }
        
        // Get updated combat
        const { data: updatedCombat } = await supabase
          .from('combat')
          .select('*, monster:monster_id(*), player_effects, enemy_effects')
          .eq('id', combatId)
          .single();
        
        // CRITICAL FIX: Return immediately after successful run, monster doesn't get a turn
        return {
          success: true,
          data: updatedCombat as Combat
        };
      } else {
        // Failed to run
        console.log('Combat: Run attempt failed, monster gets to attack');
        
        // Add to combat log
        combatLog.push(`${character.name} failed to escape!`);
      }
    }
    
    // Apply healing if any
    if (characterHealingDone > 0) {
      character.current_hitpoints = Math.min(getTotalMaxHitpoints(character), character.current_hitpoints + characterHealingDone);

      await supabase
        .from('characters')
        .update({
          current_hitpoints: character.current_hitpoints
        })
        .eq('id', character.id);
    }
    
    // Calculate total damage dealt to monster (accumulate previous + current turn damage)
    const totalDamageDealt = combat.character_damage_dealt + characterDamageDealt;
    
    // Update monster HP based on total accumulated damage
    const monsterRemainingHp = Math.max(0, monster.hitpoints - totalDamageDealt);
    
    console.log(`Combat: Monster HP calculation - Initial HP: ${monster.hitpoints}, Previous Damage: ${combat.character_damage_dealt}, New Damage: ${characterDamageDealt}, Total Damage: ${totalDamageDealt}, Remaining HP: ${monsterRemainingHp}`);
    
    // Check if monster is defeated
    if (monsterRemainingHp === 0) {
      // Monster defeated - This section handles the COMPLETE combat ending process including:
      // 1. Marking combat as completed
      // 2. Awarding experience and gold
      // 3. Incrementing adventure count
      // 4. Updating all necessary database records
      
      // Add to combat log
      combatLog.push(`${monster.name} was defeated!`);
      
      // Check if monster is elite and process dungeon key parts
      if (monster.is_elite) {
        console.log('Combat: Elite monster defeated, processing dungeon key parts');
        const dungeonKeyResult = await processDungeonKeyParts(character.id, true, combatLog);
        if (!dungeonKeyResult.success) {
          console.error('Error processing dungeon key parts:', dungeonKeyResult.error);
        }
      }
      
      console.log('Combat: Monster defeated - processing complete victory flow');
      await supabase
        .from('combat')
        .update({
          is_completed: true,
          is_victory: true,
          current_turn: currentTurn + 1,
          character_damage_dealt: totalDamageDealt,
          combat_log: combatLog,
          completed_at: new Date().toISOString()
        })
        .eq('id', combatId);
      
      
      // Add rewards to character in a single transaction
      const { error: updateExpGoldError } = await supabase
        .from('characters')
        .update({
          experience: character.experience + monster.experience_reward,
          gold: character.gold + monster.gold_reward,
        })
        .eq('id', character.id);
        
      if (updateExpGoldError) {
        console.error('Combat: Failed to update character experience and gold:', updateExpGoldError);
        return {
          success: false,
          error: 'Failed to update character with rewards'
        };
      }
      
      // Increment adventure count in a separate transaction to ensure it's updated correctly
      const { error: updateAdventureCountError } = await supabase
        .from('characters')
        .update({
          daily_adventure_count: character.daily_adventure_count + 1,
          updated_at: new Date().toISOString() // Force update timestamp
        })
        .eq('id', character.id);

      console.log('Combat: Adventure count updated to:', character.daily_adventure_count + 1);
        
      if (updateAdventureCountError) {
        console.error('Combat: Error updating adventure count:', updateAdventureCountError);
        // Continue anyway, this isn't as critical as the rewards
      }
      
      // Update the adventure state to outcome to properly transition to the outcome screen
      const { error: updateAdventureStateError } = await supabase
        .from('character_adventures')
        .upsert(
          {
            character_id: character.id,
            current_state: 'outcome',
            combat_id: null,
            day: character.last_played_day,
            adventure_number: character.daily_adventure_count,
            updated_at: new Date().toISOString()
          },
          { onConflict: 'character_id' }
        );
      
      if (updateAdventureStateError) {
        console.error('Combat: Error updating adventure state:', updateAdventureStateError);
        // Continue anyway, this isn't critical
      }
      
      // Get updated combat with effects
      const { data: updatedCombat, error: updateError } = await supabase
        .from('combat')
        .select('*, monster:monster_id(*), player_effects, enemy_effects')
        .eq('id', combatId)
        .single();
      
      if (updateError) {
        console.error('Error getting updated combat:', updateError);
        return {
          success: false,
          error: 'Failed to get updated combat'
        };
      }
      
      return {
        success: true,
        data: updatedCombat as Combat
      };
    }
    
    if (monsterRemainingHp > 0) {
      // Monster's turn
      let monsterDamageDealt = 0;
      
      // Check if monster has abilities
      const hasAbilities = monster.abilities && Object.keys(monster.abilities).length > 0;
      
      // Decide if monster uses a basic attack or an ability
      const useAbility = hasAbilities && Math.random() < 0.5; // 50% chance to use ability if available
      
      if (!useAbility || !hasAbilities) {
        // Calculate chance for character to dodge monster's attack
        const dodgeChance = calculateDodgeChance(character, monster);
        const dodgeRoll = Math.random() * 100;
        const dodged = dodgeRoll <= dodgeChance;
        
      if (dodged) {
        // Character dodges the attack
        monsterDamageDealt = 0;
        combatLog.push(`${character.name} dodges ${monster.name}'s attack!`);
        
        // Update turnEvents with dodge data
        turnEvents.monsterAction!.type = 'attack';
        turnEvents.monsterAction!.targetDodged = true;
      } else {
          // Monster performs a basic attack
          // Base damage with randomness (±20%)
          const randomFactor = 0.8 + (Math.random() * 0.4); // 0.8 to 1.2
          monsterDamageDealt = Math.floor(monster.attack * randomFactor);
          
          // Calculate total defense using the same function as in the character display
          const totalDefense = calculateTotalDefense(character);
          
          // Reduced impact of defense
          monsterDamageDealt = Math.max(1, monsterDamageDealt - Math.floor(totalDefense / 3));
          
          console.log(`Combat: Monster basic attack - Damage: ${monsterDamageDealt}, Character defense: ${totalDefense}`);
          
          // Check for critical hit (monsters have a base 5% chance plus 1% per level)
          const monsterCritChance = Math.min(20, 5 + (monster.level || 1));
          const critRoll = Math.random() * 100;
          const monsterCrit = critRoll <= monsterCritChance;
          
          if (monsterCrit) {
            // Critical hit multiplies damage by 1.5
            monsterDamageDealt = Math.floor(monsterDamageDealt * 2);
            combatLog.push(`${monster.name} lands a CRITICAL hit on ${character.name}!`);
            
            // Update turnEvents with critical hit data
            turnEvents.monsterAction!.criticalHit = true;
          }
          
          // Update turnEvents with monster action data
          turnEvents.monsterAction!.type = 'attack';
          turnEvents.monsterAction!.damageDealt = monsterDamageDealt;
          
          // Add to combat log
          combatLog.push(`${monster.name} attacks ${character.name} for ${monsterDamageDealt} damage.`);
        }
      } else {
        // Monster uses an ability
        const abilities = monster.abilities as Record<string, any> || {};
        const abilityNames = Object.keys(abilities);
        
        // Randomly select one ability with equal probability
        const randomAbilityIndex = Math.floor(Math.random() * abilityNames.length);
        const chosenAbilityName = abilityNames[randomAbilityIndex] || '';
        const chosenAbility = abilities[chosenAbilityName] as Record<string, any> || {};
        
        console.log(`Combat: Monster using ability: ${chosenAbilityName}`);
        
        // Add to combat log with highlighted formatting to make skill usage more prominent
        combatLog.push(`${monster.name} uses [${chosenAbilityName}]!`);
        
        // Process the selected ability
        if (chosenAbility.damage) {
          // Damage ability
          monsterDamageDealt = chosenAbility.damage;
          
          // Apply base attack as well for damage abilities
          const baseAttack = Math.floor(monster.attack * 0.6); // 60% of base attack
          monsterDamageDealt += baseAttack;
          
          // Calculate chance for character to dodge monster's attack
          const dodgeChance = calculateDodgeChance(character, monster);
          const dodgeRoll = Math.random() * 100;
          const dodged = dodgeRoll <= dodgeChance;
          
          if (dodged) {
            // Character dodges the skill attack
            monsterDamageDealt = 0;
            combatLog.push(`${character.name} dodges ${monster.name}'s [${chosenAbilityName}]!`);
            
            // Update turnEvents with dodge data
            turnEvents.monsterAction!.type = 'skill';
            turnEvents.monsterAction!.skillUsed = chosenAbilityName;
            turnEvents.monsterAction!.targetDodged = true;
          } else {
            // Apply defense
            const totalDefense = calculateTotalDefense(character);
            monsterDamageDealt = Math.max(1, monsterDamageDealt - Math.floor(totalDefense / 3));
            
            // Check for critical hit (monsters have a base 5% chance plus 1% per level)
            const monsterCritChance = 5 + (monster.level || 1);
            const critRoll = Math.random() * 100;
            const monsterCrit = critRoll <= monsterCritChance;
            
            if (monsterCrit) {
              // Critical hit multiplies damage by 1.5
              monsterDamageDealt = Math.floor(monsterDamageDealt * 1.5);
              combatLog.push(`${monster.name}'s [${chosenAbilityName}] CRITICALLY hits ${character.name}!`);
              
              // Update turnEvents with critical hit data
              turnEvents.monsterAction!.criticalHit = true;
            }
            
            // Update turnEvents with monster action data
            turnEvents.monsterAction!.type = 'skill';
            turnEvents.monsterAction!.skillUsed = chosenAbilityName;
            turnEvents.monsterAction!.damageDealt = monsterDamageDealt;
            
            // Add to combat log
            combatLog.push(`[${chosenAbilityName}] deals ${monsterDamageDealt} damage to ${character.name}.`);
          }
        }
        
        // Handle status effects
        if (chosenAbility.defense_boost || chosenAbility.immobilize || chosenAbility.damage_over_time) {
          // Apply monster ability effect to combat record if it has a duration
          if (chosenAbility.duration) {
            console.log('Combat: Applying monster ability effect to combat record');
            await applyMonsterAbilityEffect(combatId, String(chosenAbilityName), chosenAbility);
            
            // Add to combat log
            combatLog.push(`[${chosenAbilityName}] effect applied to ${character.name}`);
            
            // Update turnEvents with effect data
            turnEvents.monsterAction!.effectsApplied.push(chosenAbilityName);
          }
        }
        
        // If no damage was dealt but this is a pure status effect ability, make it impactful without attacking
        if (monsterDamageDealt === 0 && !chosenAbility.damage && !chosenAbility.damage_over_time) {
          // Instead of doing an additional attack, just make the ability more impactful in the log
          combatLog.push(`${character.name} feels the effects of [${chosenAbilityName}]!`);
        }
      }
      
      // Update character HP
      character.current_hitpoints = Math.max(0, character.current_hitpoints - monsterDamageDealt);
      
      await supabase
        .from('characters')
        .update({
          current_hitpoints: character.current_hitpoints
        })
        .eq('id', character.id);
    
      // Check if character is defeated
      if (character.current_hitpoints === 0) {
        // Character defeated - end combat
        // Add to combat log
        combatLog.push(`${character.name} was defeated!`);
        
        await supabase
          .from('combat')
          .update({
            is_completed: true,
            is_victory: false,
            current_turn: currentTurn + 1,
            character_damage_dealt: totalDamageDealt,
            monster_damage_dealt: combat.monster_damage_dealt + monsterDamageDealt,
            combat_log: combatLog,
            completed_at: new Date().toISOString()
          })
          .eq('id', combatId);
      } else {
        // Combat continues
        await supabase
          .from('combat')
          .update({
            current_turn: currentTurn + 1,
            character_damage_dealt: totalDamageDealt,
            monster_damage_dealt: combat.monster_damage_dealt + monsterDamageDealt,
            combat_log: combatLog
          })
          .eq('id', combatId);
      }
    }
    
      // Track DoT effects that were triggered in this turn
      if (effectResults.playerDamageFromEffects > 0) {
        // Check which effects were triggered by examining the messages
        for (const msg of effectResults.messages) {
          if (typeof msg === 'string') {
            if (msg.toLowerCase().includes('bleed') && msg.toLowerCase().includes('player')) {
              const damageMatch = msg.match(/deals (\d+) damage/i);
              if (damageMatch && damageMatch[1]) {
                turnEvents.monsterAction!.dotEffects.bleed.triggered = true;
                turnEvents.monsterAction!.dotEffects.bleed.amount = parseInt(damageMatch[1], 10);
              }
            } else if (msg.toLowerCase().includes('poison') && msg.toLowerCase().includes('player')) {
              const damageMatch = msg.match(/deals (\d+) damage/i);
              if (damageMatch && damageMatch[1]) {
                turnEvents.monsterAction!.dotEffects.poison.triggered = true;
                turnEvents.monsterAction!.dotEffects.poison.amount = parseInt(damageMatch[1], 10);
              }
            } else if (msg.toLowerCase().includes('burn') && msg.toLowerCase().includes('player')) {
              const damageMatch = msg.match(/deals (\d+) damage/i);
              if (damageMatch && damageMatch[1]) {
                turnEvents.monsterAction!.dotEffects.burn.triggered = true;
                turnEvents.monsterAction!.dotEffects.burn.amount = parseInt(damageMatch[1], 10);
              }
            }
          }
        }
      }
      
      if (effectResults.monsterDamageFromEffects > 0) {
        // Check which effects were triggered by examining the messages
        for (const msg of effectResults.messages) {
          if (typeof msg === 'string') {
            if (msg.toLowerCase().includes('bleed') && msg.toLowerCase().includes('monster')) {
              const damageMatch = msg.match(/deals (\d+) damage/i);
              if (damageMatch && damageMatch[1]) {
                turnEvents.characterAction!.dotEffects.bleed.triggered = true;
                turnEvents.characterAction!.dotEffects.bleed.amount = parseInt(damageMatch[1], 10);
              }
            } else if (msg.toLowerCase().includes('poison') && msg.toLowerCase().includes('monster')) {
              const damageMatch = msg.match(/deals (\d+) damage/i);
              if (damageMatch && damageMatch[1]) {
                turnEvents.characterAction!.dotEffects.poison.triggered = true;
                turnEvents.characterAction!.dotEffects.poison.amount = parseInt(damageMatch[1], 10);
              }
            } else if (msg.toLowerCase().includes('burn') && msg.toLowerCase().includes('monster')) {
              const damageMatch = msg.match(/deals (\d+) damage/i);
              if (damageMatch && damageMatch[1]) {
                turnEvents.characterAction!.dotEffects.burn.triggered = true;
                turnEvents.characterAction!.dotEffects.burn.amount = parseInt(damageMatch[1], 10);
              }
            }
          }
        }
      }
      
      // Update combat effects - filter out expired effects and update remaining durations
      await updateCombatEffects(combatId);
      
      // Store the turnEvents in the combat record
      await supabase
        .from('combat')
        .update({ turnEvents })
        .eq('id', combatId);
      
      // Get updated combat
      const { data: updatedCombat, error: updateError } = await supabase
        .from('combat')
        .select('*, monster:monster_id(*), player_effects, enemy_effects, turnEvents')
        .eq('id', combatId)
        .single();
    
    if (updateError) {
      console.error('Error getting updated combat:', updateError);
      return {
        success: false,
        error: 'Failed to get updated combat'
      };
    }
    
    return {
      success: true,
      data: updatedCombat as Combat
    };
  } catch (err) {
    console.error('Unexpected error in combat turn:', err);
    return {
      success: false,
      error: 'An unexpected error occurred'
    };
  }
}

// Check if a character is in active combat
export async function getActiveCharacterCombat(
  characterId: string
): Promise<ApiResponse<Combat | null>> {
  try {
    const supabase = await createClient();

    // Query for active combat for this character
    const { data, error } = await supabase
      .from('combat')
      .select(`
        *,
        player_effects,
        enemy_effects
      `)
      .eq('character_id', characterId)
      .eq('is_completed', false)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    if (error) {
      // If no data found, return null (not an error)
      if (error.code === 'PGRST116') {
        return {
          success: true,
          data: null
        };
      }
      
      console.error('Error checking for active combat:', error);
      return {
        success: false,
        error: 'Failed to check for active combat'
      };
    }
    
    return {
      success: true,
      data: data as Combat
    };
  } catch (err) {
    console.error('Unexpected error checking for active combat:', err);
    return {
      success: false,
      error: 'An unexpected error occurred'
    };
  }
}

// Get character skills
export async function getCharacterSkills(
  characterId: string
): Promise<ApiResponse<Array<Skill & { learned: boolean; level: number }>>> {
  try {
    const supabase = await createClient();

    console.log('getCharacterSkills: Fetching skills for character ID:', characterId);

    // Get character data to check class and level
    const characterResponse = await getCharacterById(characterId);
    if (!characterResponse.success || !characterResponse.data) {
      console.error('getCharacterSkills: Character not found');
      return {
        success: false,
        error: 'Character not found'
      };
    }
    
    const character = characterResponse.data;
    console.log('getCharacterSkills: Character info:', {
      id: character.id,
      name: character.name,
      class: character.class,
      level: character.level
    });
    
    // Get skills for character's class AND level_required <= character.level
    console.log('getCharacterSkills: Querying skills for class and level:', {
      class: character.class,
      level_required_lte: character.level
    });
    
    // Use cached skills from the game data service
    const { success: skillsSuccess, data: allSkills } = await getCachedSkills(supabase);
    
    if (!skillsSuccess || !allSkills) {
      console.log(`skillsSuccess: ${skillsSuccess}, allSkills: ${allSkills}`);
      return {
        success: false,
        error: 'Failed to get skills from cache'
      };
    }
    
    // Filter skills by class and level requirement
    const classSkills = allSkills.filter(
      (skill: any) => skill.class === character.class && (skill.level_required || 1) <= character.level
    );
    
    console.log('getCharacterSkills: Found class skills:', {
      count: classSkills?.length || 0,
      skills: classSkills?.map((s: any) => `${s.name} (level ${s.level_required || 1})`) || []
    });
    
    
    console.log('getCharacterSkills: Returning combined skills data:', {
      totalSkills: classSkills.length,
      skillNames: classSkills.map((s: Skill) => s.name)
    });
    
    // Add learned and level properties to match the expected return type
    const skillsWithLearned = classSkills.map((skill: Skill) => ({
      ...skill,
      learned: true,
      level: 1
    })) as Array<Skill & { learned: boolean; level: number }>;
    
    return {
      success: true,
      data: skillsWithLearned
    };
  } catch (err) {
    console.error('Unexpected error getting character skills:', err);
    return {
      success: false,
      error: 'An unexpected error occurred'
    };
  }
}

// Upgrade a skill
export async function upgradeSkill(
  characterId: string,
  skillId: number
): Promise<ApiResponse<null>> {
  try {
    const supabase = await createClient();

    // Get current skill level
    const { data: characterSkill, error: skillError } = await supabase
      .from('character_skills')
      .select('*')
      .eq('character_id', characterId)
      .eq('skill_id', skillId)
      .single();
    
    if (skillError || !characterSkill) {
      return {
        success: false,
        error: 'Character does not have this skill'
      };
    }
    
    // Upgrade skill
    const { error } = await supabase
      .from('character_skills')
      .update({
        level: characterSkill.level + 1
      })
      .eq('id', characterSkill.id);
    
    if (error) {
      console.error('Error upgrading skill:', error);
      return {
        success: false,
        error: 'Failed to upgrade skill'
      };
    }
    
    
    return {
      success: true,
      data: null
    };
  } catch (err) {
    console.error('Unexpected error upgrading skill:', err);
    return {
      success: false,
      error: 'An unexpected error occurred'
    };
  }
}
