'use server';

import { createClient } from '@/lib/supabase/server';
import type { ApiResponse, Character, CharacterBossProgress, WorldBoss, WorldBossStatus, RewardItem, Item } from '@/lib/types';
import { generateId, getCurrentGameDay, getCurrentGameWeek, calculateBossDamage } from '@/lib/utils';
import { getCharacterById } from './character';
import { addItemToInventory, getRewardForTable } from './rewards';
import { updateHighestBossDamage, incrementBossesSlain } from './leaderboard';

/**
 * Get the current world boss and its status for the current week
 */
export async function getCurrentWorldBoss(): Promise<ApiResponse<WorldBoss>> {
  try {
    const supabase = await createClient();
    const currentWeek = getCurrentGameWeek();
    
    // Try to get the world boss for the current week
    const { data: existingBoss, error: existingBossError } = await supabase
      .from('world_boss')
      .select(`
        *
      `)
      .eq('week', currentWeek)
      .single();
    
    if (existingBoss) {
      // Get the world boss status for this week
      const { data: bossStatus, error: statusError } = await supabase
        .from('world_boss_status')
        .select('*')
        .eq('boss_id', existingBoss.id)
        .eq('week', currentWeek)
        .single();
      
      if (statusError && statusError.code !== 'PGRST116') { // Not "No rows found" error
        console.error('Error getting world boss status:', statusError);
        return {
          success: false,
          error: 'Failed to get world boss status'
        };
      }
      
      // If no status record exists, create one
      if (!bossStatus) {
        const newBossStatus = {
          boss_id: existingBoss.id,
          week: currentWeek,
          total_hitpoints: existingBoss.total_hitpoints,
          current_hitpoints: existingBoss.total_hitpoints, // Start with full HP
          player_count: 0,
          attack_count: 0,
          total_damage_received: 0,
          created_at: new Date().toISOString()
        };
        
        const { data: createdStatus, error: createStatusError } = await supabase
          .from('world_boss_status')
          .insert(newBossStatus)
          .select()
          .single();
        
        if (createStatusError) {
          console.error('Error creating world boss status:', createStatusError);
          return {
            success: false,
            error: 'Failed to create world boss status'
          };
        }
        
        console.log(`Created new world boss status for week ${currentWeek}:`, createdStatus);
        
        // Combine the boss and status
        const bossWithStatus = {
          ...existingBoss,
          status: createdStatus
        };
        
        return {
          success: true,
          data: bossWithStatus as WorldBoss
        };
      }
      
      // Combine the boss and status
      const bossWithStatus = {
        ...existingBoss,
        status: bossStatus
      };
      
      console.log(`Found existing world boss for week ${currentWeek}:`, existingBoss.name);
      return {
        success: true,
        data: bossWithStatus as WorldBoss
      };
    }
    
    // If no boss exists for the current week, create one from the data
    // Get the world boss data from the worldboss.json file (loaded as seed data)
    const { data: bosses, error: bossesError } = await supabase
      .from('world_boss')
      .select('*')
      .order('week', { ascending: true });
    
    if (bossesError) {
      console.error('Error getting world bosses:', bossesError);
      return {
        success: false,
        error: 'Failed to get world boss data'
      };
    }
    
    // Create a new boss for the current week using the template that matches (week % boss_count)
    if (bosses && bosses.length > 0) {
      const bossTemplate = bosses[((currentWeek - 1) % bosses.length)];
      
      // Create a new boss record for the current week
      const newBoss = {
        name: bossTemplate.name,
        description: bossTemplate.description,
        week: currentWeek,
        total_hitpoints: bossTemplate.total_hitpoints,
        image_url: bossTemplate.image_url,
        legendary_reward_table: bossTemplate.legendary_reward_table || (bossTemplate.id * 10) + 4,
        challenger_reward_table: bossTemplate.challenger_reward_table || (bossTemplate.id * 10) + 2,
        basic_reward_table: bossTemplate.basic_reward_table || (bossTemplate.id * 10) + 1,
        created_at: new Date().toISOString()
      };
      
      const { data: createdBoss, error: createError } = await supabase
        .from('world_boss')
        .insert(newBoss)
        .select()
        .single();
      
      if (createError) {
        console.error('Error creating new world boss:', createError);
        return {
          success: false,
          error: 'Failed to create new world boss'
        };
      }
      
      // Create a new boss status record for the current week
      const newBossStatus = {
        boss_id: createdBoss.id,
        week: currentWeek,
        total_hitpoints: bossTemplate.total_hitpoints,
        current_hitpoints: bossTemplate.total_hitpoints, // Start with full HP
        player_count: 0,
        attack_count: 0,
        total_damage_received: 0,
        created_at: new Date().toISOString()
      };
      
      const { data: createdStatus, error: createStatusError } = await supabase
        .from('world_boss_status')
        .insert(newBossStatus)
        .select()
        .single();
      
      if (createStatusError) {
        console.error('Error creating new world boss status:', createStatusError);
        return {
          success: false,
          error: 'Failed to create new world boss status'
        };
      }
      
      // Combine the boss and status
      const bossWithStatus = {
        ...createdBoss,
        status: createdStatus
      };
      
      console.log(`Created new world boss for week ${currentWeek}:`, bossWithStatus.name);
      return {
        success: true,
        data: bossWithStatus as WorldBoss
      };
    }
    
    return {
      success: false,
      error: 'No world boss data available'
    };
  } catch (err) {
    console.error('Unexpected error getting world boss:', err);
    return {
      success: false,
      error: 'An unexpected error occurred'
    };
  }
}

/**
 * Get a character's progress against the current world boss
 */
export async function getCharacterBossProgress(
  characterId: string
): Promise<ApiResponse<CharacterBossProgress>> {
  try {
    const supabase = await createClient();
    const worldBossResponse = await getCurrentWorldBoss();
    
    if (!worldBossResponse.success || !worldBossResponse.data) {
      return {
        success: false,
        error: 'Failed to get current world boss'
      };
    }
    
    const worldBoss = worldBossResponse.data;
    const currentWeek = getCurrentGameWeek();
    
    // Get character's progress for this boss and week
    const { data: progressData, error: progressError } = await supabase
      .from('character_boss_progress')
      .select(`
        *,
        boss:boss_id(*)
      `)
      .eq('character_id', characterId)
      .eq('boss_id', worldBoss.id)
      .eq('week', currentWeek)
      .single();
    
    if (progressError && progressError.code !== 'PGRST116') { // Not "No rows found" error
      console.error('Error getting character boss progress:', progressError);
      return {
        success: false,
        error: 'Failed to get character boss progress'
      };
    }
    
    // If character has no progress record, create one
    if (!progressData) {
      const newProgress = {
        id: generateId(),
        character_id: characterId,
        boss_id: worldBoss.id,
        week: currentWeek,
        attack_count: 0,
        total_damage: 0,
        reward_claimed: false,
        last_attack: null
      };
      
      const { data: createdProgress, error: createError } = await supabase
        .from('character_boss_progress')
        .insert(newProgress)
        .select(`
          *,
          boss:boss_id(*)
        `)
        .single();
      
      if (createError) {
        console.error('Error creating character boss progress:', createError);
        return {
          success: false,
          error: 'Failed to create character boss progress'
        };
      }
      
      return {
        success: true,
        data: createdProgress as CharacterBossProgress
      };
    }
    
    return {
      success: true,
      data: progressData as CharacterBossProgress
    };
  } catch (err) {
    console.error('Unexpected error getting character boss progress:', err);
    return {
      success: false,
      error: 'An unexpected error occurred'
    };
  }
}

/**
 * Check if a character can attack the world boss today
 */
export async function canAttackWorldBossToday(
  characterId: string
): Promise<ApiResponse<boolean>> {
  try {
    // Get character progress
    const progressResponse = await getCharacterBossProgress(characterId);
    
    if (!progressResponse.success || !progressResponse.data) {
      return {
        success: false,
        error: progressResponse.error || 'Failed to get character progress'
      };
    }
    
    const progress = progressResponse.data;
    const currentDay = getCurrentGameDay();
    
    // If never attacked or last attack was on a previous day, can attack
    if (!progress.last_attack) {
      return {
        success: true,
        data: true
      };
    }
    
    // Parse the last attack day
    const lastAttackDate = new Date(progress.last_attack);
    const lastAttackDay = Math.ceil(
      (lastAttackDate.getTime() - new Date('2025-04-04').getTime()) / (1000 * 60 * 60 * 24)
    );
    
    // Can attack if last attack was on a different day
    return {
      success: true,
      data: lastAttackDay < currentDay
    };
  } catch (err) {
    console.error('Unexpected error checking if can attack:', err);
    return {
      success: false,
      error: 'An unexpected error occurred'
    };
  }
}

/**
 * Process a character's attack on the world boss
 */
export async function attackWorldBoss(
  characterId: string
): Promise<ApiResponse<{ damage: number; canAttackAgain: boolean; bossDefeated: boolean }>> {
  try {
    const supabase = await createClient();
    
    // Check if character can attack today
    const canAttackResponse = await canAttackWorldBossToday(characterId);
    
    if (!canAttackResponse.success) {
      return {
        success: false,
        error: canAttackResponse.error || 'Failed to check if character can attack'
      };
    }
    
    if (!canAttackResponse.data) {
      return {
        success: false,
        error: 'Character has already attacked the world boss today'
      };
    }
    
    // Get character data for damage calculation
    const characterResponse = await getCharacterById(characterId);
    
    if (!characterResponse.success || !characterResponse.data) {
      return {
        success: false,
        error: 'Failed to get character data'
      };
    }
    
    const character = characterResponse.data;
    
    // Get current world boss
    const worldBossResponse = await getCurrentWorldBoss();
    
    if (!worldBossResponse.success || !worldBossResponse.data) {
      return {
        success: false,
        error: 'Failed to get current world boss'
      };
    }
    
    const worldBoss = worldBossResponse.data;
    
    // Check if boss is already defeated
    if ((worldBoss.status?.current_hitpoints || 0) <= 0 || 
        (worldBoss.status?.total_damage_received || 0) >= (worldBoss.status?.total_hitpoints || 0)) {
      return {
        success: false,
        error: 'World boss has already been defeated'
      };
    }
    
    // Calculate damage
    // Convert character equipment to the expected format for calculateBossDamage
    const equipmentForDamage = {
      weapon: character.equipment?.weapon ? {
        base_damage: character.equipment.weapon.base_damage || 0,
        effects: character.equipment.weapon.effects
      } : null,
      armor: character.equipment?.armor ? {
        base_defense: character.equipment.armor.base_defense || 0,
        effects: character.equipment.armor.effects
      } : null,
      helmet: character.equipment?.helmet ? {
        base_defense: character.equipment.helmet.base_defense || 0,
        effects: character.equipment.helmet.effects
      } : null,
      trinket: character.equipment?.trinket ? {
        effects: character.equipment.trinket.effects
      } : null
    };
    
    const damage = calculateBossDamage(character, equipmentForDamage);
    console.log(`Character ${character.name} deals ${damage} damage to ${worldBoss.name}`);
    
    // Get character progress
    const progressResponse = await getCharacterBossProgress(characterId);
    
    if (!progressResponse.success || !progressResponse.data) {
      return {
        success: false,
        error: 'Failed to get character progress'
      };
    }
    
    const progress = progressResponse.data;
    const now = new Date().toISOString();
    const currentDay = getCurrentGameDay();
    
    // Update character progress
    const { error: updateProgressError } = await supabase
      .from('character_boss_progress')
      .update({
        attack_count: progress.attack_count + 1,
        total_damage: progress.total_damage + damage,
        last_attack: now
      })
      .eq('id', progress.id);
    
    if (updateProgressError) {
      console.error('Error updating character progress:', updateProgressError);
      return {
        success: false,
        error: 'Failed to update character progress'
      };
    }
    
    // Check if this is the character's first attack on this boss
    const isFirstAttack = progress.attack_count === 0;
    
    // Update world boss status
    const currentHitpoints = worldBoss.status?.current_hitpoints || 0;
    const totalHitpoints = worldBoss.status?.total_hitpoints || worldBoss.total_hitpoints;
    const newCurrentHitpoints = Math.max(0, currentHitpoints - damage);
    const newTotalDamage = (worldBoss.status?.total_damage_received || 0) + damage;
    const bossDefeated = newCurrentHitpoints <= 0 || newTotalDamage >= totalHitpoints;
    
    const { error: updateBossError } = await supabase
      .from('world_boss_status')
      .update({
        current_hitpoints: newCurrentHitpoints,
        player_count: isFirstAttack ? (worldBoss.status?.player_count || 0) + 1 : worldBoss.status?.player_count,
        attack_count: (worldBoss.status?.attack_count || 0) + 1,
        total_damage_received: (worldBoss.status?.total_damage_received || 0) + damage,
        defeated_at: bossDefeated ? now : null
      })
      .eq('boss_id', worldBoss.id)
      .eq('week', worldBoss.week);
    
    if (updateBossError) {
      console.error('Error updating world boss status:', updateBossError);
      return {
        success: false,
        error: 'Failed to update world boss status'
      };
    }
    
    // Update character's highest boss damage if this is higher
    updateHighestBossDamage(characterId, damage, supabase as any);
    
    // If boss is defeated, increment bosses slain count
    if (bossDefeated) {
      // Increment character's bosses slain count
      incrementBossesSlain(characterId, supabase as any);
    }
    
    return {
      success: true,
      data: {
        damage,
        canAttackAgain: false, // Can't attack again today
        bossDefeated
      }
    };
  } catch (err) {
    console.error('Unexpected error attacking world boss:', err);
    return {
      success: false,
      error: 'An unexpected error occurred'
    };
  }
}

/**
 * Calculate and process pending rewards for a character
 */
export async function calculatePendingRewards(
  characterId: string
): Promise<ApiResponse<Item[]>> {
  try {
    const supabase = await createClient();
    const currentWeek = getCurrentGameWeek();
    
    // Get all character progress records for previous weeks that haven't been claimed
    const { data: pendingProgress, error: pendingError } = await supabase
      .from('character_boss_progress')
      .select(`
        *,
        boss:boss_id(*)
      `)
      .eq('character_id', characterId)
      .eq('reward_claimed', false)
      .lt('week', currentWeek);
    
    if (pendingError) {
      console.error('Error getting pending progress:', pendingError);
      return {
        success: false,
        error: 'Failed to get pending progress'
      };
    }
    
    if (!pendingProgress || pendingProgress.length === 0) {
      // No pending rewards to process
      return {
        success: true,
        data: []
      };
    }
    
    const rewardedItems: Item[] = [];
    
    // Process each pending progress record
    for (const progress of pendingProgress) {
      // Get the world boss status for this week and boss
      const { data: bossStatus, error: statusError } = await supabase
        .from('world_boss_status')
        .select('*')
        .eq('boss_id', progress.boss_id)
        .eq('week', progress.week)
        .single();
      
      if (statusError) {
        console.error('Error getting boss status:', statusError);
        continue; // Try next progress
      }
      
      // Determine reward tier based on performance
      let rewardTableId: number;
      
      // Check if boss was defeated
      const bossDefeated = bossStatus.current_hitpoints <= 0 || 
                          bossStatus.total_damage_received >= bossStatus.total_hitpoints;
      
      if (!bossDefeated) {
        // Boss wasn't defeated, use basic reward table
        rewardTableId = progress.boss.basic_reward_table;
      } else {
        // Calculate average damage
        const avgDamage = bossStatus.total_damage_received / bossStatus.player_count;
        
        if (progress.total_damage >= avgDamage) {
          // Above average, use legendary reward table
          rewardTableId = progress.boss.legendary_reward_table;
        } else {
          // Below average, use challenger reward table
          rewardTableId = progress.boss.challenger_reward_table;
        }
      }
      
      // Get a reward from the appropriate table
      const rewardResponse = await getRewardForTable(rewardTableId);
      
      if (!rewardResponse.success || !rewardResponse.data) {
        console.error('Error getting reward for table:', rewardResponse.error);
        continue; // Try next progress
      }
      
      const reward = rewardResponse.data;
      
      // Add item to character's inventory
      const addItemResponse = await addItemToInventory(characterId, reward.item_id);
      
      if (!addItemResponse.success) {
        console.error('Error adding item to inventory:', addItemResponse.error);
        continue; // Try next progress
      }
      
      // Add the item to our list of rewarded items
      rewardedItems.push(reward.item);
      
      // Mark progress as claimed
      const { error: updateError } = await supabase
        .from('character_boss_progress')
        .update({
          reward_claimed: true
        })
        .eq('id', progress.id);
      
      if (updateError) {
        console.error('Error marking reward as claimed:', updateError);
        // Not critical, continue anyway
      }
    }
    
    return {
      success: true,
      data: rewardedItems
    };
  } catch (err) {
    console.error('Unexpected error calculating rewards:', err);
    return {
      success: false,
      error: 'An unexpected error occurred'
    };
  }
}

/**
 * Process character rewards for all characters with unclaimed rewards
 */
export async function processCharacterRewards(): Promise<ApiResponse<boolean>> {
  try {
    const supabase = await createClient();
    const currentWeek = getCurrentGameWeek();
    
    // Get all character progress records for previous weeks that haven't been claimed
    const { data: pendingProgress, error: pendingError } = await supabase
      .from('character_boss_progress')
      .select(`
        *,
        boss:boss_id(*)
      `)
      .eq('reward_claimed', false)
      .lt('week', currentWeek);
    
    if (pendingError) {
      console.error('Error getting pending progress:', pendingError);
      return {
        success: false,
        error: 'Failed to get pending progress'
      };
    }
    
    if (!pendingProgress || pendingProgress.length === 0) {
      // No pending rewards to process
      return {
        success: true,
        data: false
      };
    }
    
    // Process each character's rewards
    for (const progress of pendingProgress) {
      await calculatePendingRewards(progress.character_id);
    }
    
    return {
      success: true,
      data: true
    };
  } catch (err) {
    console.error('Unexpected error processing rewards:', err);
    return {
      success: false,
      error: 'An unexpected error occurred'
    };
  }
}

/**
 * Check for new week and process end-of-week actions
 */
export async function checkWeeklyReset(): Promise<ApiResponse<boolean>> {
  try {
    const currentDay = getCurrentGameDay();
    
    // Check if it's the start of a new week (day % 7 === 0)
    if (currentDay % 7 === 0) {
      // Process pending rewards for all characters
      await processCharacterRewards();
      
      // Create new world boss for the new week
      await getCurrentWorldBoss();
      
      return {
        success: true,
        data: true
      };
    }
    
    // Not a new week
    return {
      success: true,
      data: false
    };
  } catch (err) {
    console.error('Unexpected error checking weekly reset:', err);
    return {
      success: false,
      error: 'An unexpected error occurred'
    };
  }
}

/**
 * Get all world bosses
 */
export async function getAllWorldBosses(): Promise<ApiResponse<WorldBoss[]>> {
  try {
    const supabase = await createClient();
    
    // Get all world bosses
    const { data: bosses, error: bossesError } = await supabase
      .from('world_boss')
      .select('*')
      .order('week', { ascending: false });
    
    if (bossesError) {
      console.error('Error getting world bosses:', bossesError);
      return {
        success: false,
        error: 'Failed to get world bosses'
      };
    }
    
    return {
      success: true,
      data: bosses as WorldBoss[]
    };
  } catch (err) {
    console.error('Unexpected error getting world bosses:', err);
    return {
      success: false,
      error: 'An unexpected error occurred'
    };
  }
}
