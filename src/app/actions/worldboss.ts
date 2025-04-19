'use server';

import { createClient } from '@/lib/supabase/server';
import type { ApiResponse, Character, CharacterBossProgress, WorldBoss, BossReward, RewardItem } from '@/lib/types';
import { generateId, getCurrentGameDay, getCurrentGameWeek, calculateBossDamage } from '@/lib/utils';
import { getCharacterById } from './character';
import { addItemToInventory, getRewardForTable } from './rewards';

/**
 * Get the current world boss for the current week
 */
export async function getCurrentWorldBoss(): Promise<ApiResponse<WorldBoss>> {
  try {
    const supabase = await createClient();
    const currentWeek = getCurrentGameWeek();
    
    // Try to get the world boss for the current week
    const { data: existingBoss, error: existingBossError } = await supabase
      .from('world_boss')
      .select('*')
      .eq('week', currentWeek)
      .single();
    
    if (existingBoss) {
      console.log(`Found existing world boss for week ${currentWeek}:`, existingBoss.name);
      return {
        success: true,
        data: existingBoss as WorldBoss
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
        current_hitpoints: bossTemplate.total_hitpoints, // Start with full HP
        player_count: 0,
        attack_count: 0,
        total_damage: 0,
        is_defeated: false,
        image_url: bossTemplate.image_url,
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
      
      console.log(`Created new world boss for week ${currentWeek}:`, createdBoss.name);
      return {
        success: true,
        data: createdBoss as WorldBoss
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
        pending_rewards: false,
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
    if (worldBoss.is_defeated) {
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
    
    // Update world boss HP and stats
    const newCurrentHitpoints = Math.max(0, worldBoss.current_hitpoints - damage);
    const bossDefeated = newCurrentHitpoints === 0;
    
    const { error: updateBossError } = await supabase
      .from('world_boss')
      .update({
        current_hitpoints: newCurrentHitpoints,
        player_count: isFirstAttack ? worldBoss.player_count + 1 : worldBoss.player_count,
        attack_count: worldBoss.attack_count + 1,
        total_damage: worldBoss.total_damage + damage,
        is_defeated: bossDefeated,
        defeated_at: bossDefeated ? now : null
      })
      .eq('id', worldBoss.id);
    
    if (updateBossError) {
      console.error('Error updating world boss:', updateBossError);
      return {
        success: false,
        error: 'Failed to update world boss'
      };
    }
    
    // If boss is defeated, set pending rewards for all participants
    if (bossDefeated) {
      const { error: pendingRewardsError } = await supabase
        .from('character_boss_progress')
        .update({
          pending_rewards: true
        })
        .eq('boss_id', worldBoss.id)
        .eq('week', worldBoss.week);
      
      if (pendingRewardsError) {
        console.error('Error setting pending rewards:', pendingRewardsError);
        // Not critical, continue anyway
      }
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
 * Get pending rewards for a character
 */
export async function getPendingRewards(
  characterId: string
): Promise<ApiResponse<BossReward[]>> {
  try {
    const supabase = await createClient();
    
    // Get all boss rewards that are not claimed
    const { data: rewards, error: rewardsError } = await supabase
      .from('boss_rewards')
      .select(`
        *,
        boss:boss_id(*),
        item:item_id(*)
      `)
      .eq('character_id', characterId)
      .eq('is_claimed', false)
      .order('week', { ascending: false });
    
    if (rewardsError) {
      console.error('Error getting pending rewards:', rewardsError);
      return {
        success: false,
        error: 'Failed to get pending rewards'
      };
    }
    
    return {
      success: true,
      data: rewards as BossReward[]
    };
  } catch (err) {
    console.error('Unexpected error getting pending rewards:', err);
    return {
      success: false,
      error: 'An unexpected error occurred'
    };
  }
}

/**
 * Check for character progress with pending rewards and generate rewards
 */
export async function processCharacterRewards(): Promise<ApiResponse<boolean>> {
  try {
    const supabase = await createClient();
    
    // Get all character progress records with pending rewards
    const { data: pendingProgress, error: pendingError } = await supabase
      .from('character_boss_progress')
      .select(`
        *,
        boss:boss_id(*)
      `)
      .eq('pending_rewards', true);
    
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
    
    // Group by boss_id to get total damage per boss
    const bossTotalDamage = pendingProgress.reduce((acc, progress) => {
      if (!acc[progress.boss_id]) {
        acc[progress.boss_id] = {
          totalDamage: 0,
          playerCount: 0
        };
      }
      
      acc[progress.boss_id].totalDamage += progress.total_damage;
      acc[progress.boss_id].playerCount += 1;
      
      return acc;
    }, {} as Record<number, { totalDamage: number; playerCount: number }>);
    
    // For each pending progress, generate a reward
    for (const progress of pendingProgress) {
      // Skip if total damage is 0
      if (progress.total_damage === 0) {
        continue;
      }
      
      // Calculate contribution percentage
      const bossStats = bossTotalDamage[progress.boss_id];
      const contributionPercentage = (progress.total_damage / bossStats.totalDamage) * 100;
      
      // Determine reward tier based on contribution
      // Higher contribution = better chance for higher tier rewards
      let legendaryChance = contributionPercentage * 0.5; // 0-50%
      let epicChance = contributionPercentage * 1.0;      // 0-100%
      let rareChance = contributionPercentage * 1.5;      // 0-150%
      
      // Apply random factor
      const roll = Math.random() * 100;
      let rewardTier: string;
      
      if (roll < legendaryChance) {
        rewardTier = 'Legendary';
      } else if (roll < legendaryChance + epicChance) {
        rewardTier = 'Epic';
      } else if (roll < legendaryChance + epicChance + rareChance) {
        rewardTier = 'Rare';
      } else {
        rewardTier = 'Common';
      }
      
      // Get a reward item from the appropriate reward table
      // The reward table ID should be unique for each boss and tier
      // For example: boss_1_legendary, boss_1_epic, etc.
      // We'd need to have these set up in the reward_tables table
      const rewardTableId = progress.boss_id * 10 + 
        (rewardTier === 'Legendary' ? 4 :
         rewardTier === 'Epic' ? 3 :
         rewardTier === 'Rare' ? 2 : 1);
      
      const rewardResponse = await getRewardForTable(rewardTableId);
      
      if (!rewardResponse.success) {
        console.error('Error getting reward for table:', rewardResponse.error);
        continue; // Try next progress
      }
      
      const reward = rewardResponse.data;
      
      if (!reward) {
        console.error('No reward generated for table:', rewardTableId);
        continue; // Try next progress
      }
      
      // Create reward record
      const { error: createRewardError } = await supabase
        .from('boss_rewards')
        .insert({
          id: generateId(),
          character_id: progress.character_id,
          boss_id: progress.boss_id,
          week: progress.week,
          reward_tier: rewardTier,
          item_id: reward.item_id,
          is_claimed: false,
          created_at: new Date().toISOString()
        });
      
      if (createRewardError) {
        console.error('Error creating reward:', createRewardError);
        continue; // Try next progress
      }
      
      // Mark progress as processed
      const { error: updateProgressError } = await supabase
        .from('character_boss_progress')
        .update({
          pending_rewards: false
        })
        .eq('id', progress.id);
      
      if (updateProgressError) {
        console.error('Error updating progress:', updateProgressError);
        // Not critical, continue anyway
      }
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
 * Claim a boss reward
 */
export async function claimBossReward(
  rewardId: string
): Promise<ApiResponse<boolean>> {
  try {
    const supabase = await createClient();
    
    // Get the reward
    const { data: reward, error: rewardError } = await supabase
      .from('boss_rewards')
      .select('*')
      .eq('id', rewardId)
      .single();
    
    if (rewardError || !reward) {
      console.error('Error getting reward:', rewardError);
      return {
        success: false,
        error: 'Failed to get reward'
      };
    }
    
    // Check if already claimed
    if (reward.is_claimed) {
      return {
        success: false,
        error: 'Reward has already been claimed'
      };
    }
    
    // Add item to character's inventory
    const addItemResponse = await addItemToInventory(reward.character_id, reward.item_id);
    
    if (!addItemResponse.success) {
      return {
        success: false,
        error: addItemResponse.error || 'Failed to add item to inventory'
      };
    }
    
    // Mark as claimed
    const { error: updateError } = await supabase
      .from('boss_rewards')
      .update({
        is_claimed: true,
        claimed_at: new Date().toISOString()
      })
      .eq('id', rewardId);
    
    if (updateError) {
      console.error('Error updating reward:', updateError);
      return {
        success: false,
        error: 'Failed to mark reward as claimed'
      };
    }
    
    return {
      success: true,
      data: true
    };
  } catch (err) {
    console.error('Unexpected error claiming reward:', err);
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
      // Process pending rewards
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
 * Get boss reward details by ID
 */
export async function getBossRewardById(
  rewardId: string
): Promise<ApiResponse<BossReward>> {
  try {
    const supabase = await createClient();
    
    // Get the reward with related data
    const { data: reward, error: rewardError } = await supabase
      .from('boss_rewards')
      .select(`
        *,
        boss:boss_id(*),
        item:item_id(*)
      `)
      .eq('id', rewardId)
      .single();
    
    if (rewardError || !reward) {
      console.error('Error getting reward:', rewardError);
      return {
        success: false,
        error: 'Failed to get reward'
      };
    }
    
    return {
      success: true,
      data: reward as BossReward
    };
  } catch (err) {
    console.error('Unexpected error getting reward:', err);
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
