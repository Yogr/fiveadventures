'use server';

import { createClient } from '@/lib/supabase/server';
import { unstable_cache } from 'next/cache';
import type { ApiResponse, CharacterClass } from '@/lib/types';
import { calculatePowerLevel, calculateEquipmentRating } from '@/lib/character-utils';
import type { SupabaseClient } from '@supabase/supabase-js';

export type LeaderboardItem = {
  rank: number;
  id: string;
  name: string;
  class: CharacterClass;
  value: number;
};

export type PaginatedLeaderboard = {
  entries: LeaderboardItem[];
  currentPage: number;
  totalPages: number;
  totalEntries: number;
  playerRank?: number;
};

// Define interfaces for database return types
interface CharacterRecord {
  id: string;
  name: string;
  class: CharacterClass;
  level?: number;
  gold?: number;
}

interface CharacterStatRecord {
  character_id: string;
  power_level?: number;
  total_adventures_completed?: number;
  bosses_slain?: number;
  highest_boss_damage?: number;
  characters?: {
    name: string;
    class: CharacterClass;
  };
}

/**
 * Ensures a character has a stats record in the character_stats table
 */
export async function ensureCharacterStats(
  characterId: string,
  supabase?: any
): Promise<ApiResponse<boolean>> {
  try {
    const client = supabase || await createClient();
    
    // Check if the character already has stats
    const { data: existingStats, error: checkError } = await client
      .from('character_stats')
      .select('*')
      .eq('character_id', characterId)
      .single();
    
    if (checkError && checkError.code !== 'PGRST116') { // Not a "no rows returned" error
      console.error('Error checking character stats:', checkError);
      return {
        success: false,
        error: 'Failed to check character stats'
      };
    }
    
    // If stats already exist, just return success
    if (existingStats) {
      return {
        success: true,
        data: true
      };
    }
    
    // Create a new stats record for the character
    const { error: insertError } = await client
      .from('character_stats')
      .insert({
        character_id: characterId,
        power_level: 0,
        total_adventures_completed: 0,
        bosses_slain: 0,
        highest_boss_damage: 0,
        updated_at: new Date().toISOString()
      });
    
    if (insertError) {
      console.error('Error creating character stats:', insertError);
      return {
        success: false,
        error: 'Failed to create character stats'
      };
    }
    
    return {
      success: true,
      data: true
    };
  } catch (err) {
    console.error('Unexpected error ensuring character stats:', err);
    return {
      success: false,
      error: 'An unexpected error occurred'
    };
  }
}

/**
 * Update a character's power level based on their current stats and equipment
 */
export async function updateCharacterPowerLevel(
  characterId: string,
  supabase?: any
): Promise<ApiResponse<number>> {
  try {
    const client = supabase || await createClient();
    
    // Get the character's data
    const { data: character, error: characterError } = await client
      .from('characters')
      .select(`
        *,
        equipment:equipment_id(*)
      `)
      .eq('id', characterId)
      .single();
    
    if (characterError) {
      console.error('Error getting character:', characterError);
      return {
        success: false,
        error: 'Failed to get character data'
      };
    }
    
    // Calculate power level based on character stats and equipment
    const powerLevel = calculatePowerLevel(character);
    
    // Ensure character has a stats record
    await ensureCharacterStats(characterId, client);
    
    // Update the character's power level in the stats table
    const { error: updateError } = await client
      .from('character_stats')
      .update({
        power_level: powerLevel,
        updated_at: new Date().toISOString()
      })
      .eq('character_id', characterId);
    
    if (updateError) {
      console.error('Error updating character power level:', updateError);
      return {
        success: false,
        error: 'Failed to update character power level'
      };
    }
    
    return {
      success: true,
      data: powerLevel
    };
  } catch (err) {
    console.error('Unexpected error updating character power level:', err);
    return {
      success: false,
      error: 'An unexpected error occurred'
    };
  }
}

/**
 * Increment a character's adventures completed count
 */
export async function incrementAdventuresCompleted(
  characterId: string,
  supabase = null
): Promise<ApiResponse<number>> {
  try {
    const client = supabase || await createClient();
    
    // Ensure character has a stats record
    await ensureCharacterStats(characterId, client);
    
    // Get the current count
    const { data: stats, error: statsError } = await client
      .from('character_stats')
      .select('total_adventures_completed')
      .eq('character_id', characterId)
      .single();
    
    if (statsError) {
      console.error('Error getting character stats:', statsError);
      return {
        success: false,
        error: 'Failed to get character stats'
      };
    }
    
    const newCount = (stats.total_adventures_completed || 0) + 1;
    
    // Update the character's adventures completed count
    const { error: updateError } = await client
      .from('character_stats')
      .update({
        total_adventures_completed: newCount,
        updated_at: new Date().toISOString()
      })
      .eq('character_id', characterId);
    
    if (updateError) {
      console.error('Error updating character adventures count:', updateError);
      return {
        success: false,
        error: 'Failed to update character adventures count'
      };
    }
    
    return {
      success: true,
      data: newCount
    };
  } catch (err) {
    console.error('Unexpected error incrementing adventures completed:', err);
    return {
      success: false,
      error: 'An unexpected error occurred'
    };
  }
}

/**
 * Increment a character's bosses slain count
 */
export async function incrementBossesSlain(
  characterId: string,
  supabase = null
): Promise<ApiResponse<number>> {
  try {
    const client = supabase || await createClient();
    
    // Ensure character has a stats record
    await ensureCharacterStats(characterId, client);
    
    // Get the current count
    const { data: stats, error: statsError } = await client
      .from('character_stats')
      .select('bosses_slain')
      .eq('character_id', characterId)
      .single();
    
    if (statsError) {
      console.error('Error getting character stats:', statsError);
      return {
        success: false,
        error: 'Failed to get character stats'
      };
    }
    
    const newCount = (stats.bosses_slain || 0) + 1;
    
    // Update the character's bosses slain count
    const { error: updateError } = await client
      .from('character_stats')
      .update({
        bosses_slain: newCount,
        updated_at: new Date().toISOString()
      })
      .eq('character_id', characterId);
    
    if (updateError) {
      console.error('Error updating character bosses slain count:', updateError);
      return {
        success: false,
        error: 'Failed to update character bosses slain count'
      };
    }
    
    return {
      success: true,
      data: newCount
    };
  } catch (err) {
    console.error('Unexpected error incrementing bosses slain:', err);
    return {
      success: false,
      error: 'An unexpected error occurred'
    };
  }
}

/**
 * Update a character's highest boss damage if the new damage is higher
 */
export async function updateHighestBossDamage(
  characterId: string,
  damage: number,
  supabase = null
): Promise<ApiResponse<number>> {
  try {
    const client = supabase || await createClient();
    
    // Ensure character has a stats record
    await ensureCharacterStats(characterId, client);
    
    // Get the current highest damage
    const { data: stats, error: statsError } = await client
      .from('character_stats')
      .select('highest_boss_damage')
      .eq('character_id', characterId)
      .single();
    
    if (statsError) {
      console.error('Error getting character stats:', statsError);
      return {
        success: false,
        error: 'Failed to get character stats'
      };
    }
    
    // Only update if the new damage is higher
    if (damage <= (stats.highest_boss_damage || 0)) {
      return {
        success: true,
        data: stats.highest_boss_damage || 0
      };
    }
    
    // Update the character's highest boss damage
    const { error: updateError } = await client
      .from('character_stats')
      .update({
        highest_boss_damage: damage,
        updated_at: new Date().toISOString()
      })
      .eq('character_id', characterId);
    
    if (updateError) {
      console.error('Error updating character highest boss damage:', updateError);
      return {
        success: false,
        error: 'Failed to update character highest boss damage'
      };
    }
    
    return {
      success: true,
      data: damage
    };
  } catch (err) {
    console.error('Unexpected error updating highest boss damage:', err);
    return {
      success: false,
      error: 'An unexpected error occurred'
    };
  }
}

/**
 * Get level-based leaderboard
 */
export const getLevelLeaderboard = unstable_cache(
  async (
    page: number = 1,
    pageSize: number = 10,
    playerCharacterId?: string,
    supabase?: SupabaseClient
  ): Promise<ApiResponse<PaginatedLeaderboard>> => {
    try {
      if (!supabase) {
        supabase = await createClient();
      }
      const offset = (page - 1) * pageSize;
      
      // Get total count for pagination
      const { count, error: countError } = await supabase
        .from('characters')
        .select('*', { count: 'exact', head: true });
      
      if (countError) {
        console.error('Error getting total character count:', countError);
        return {
          success: false,
          error: 'Failed to get character count'
        };
      }
      
      // Get paginated leaderboard data
      const { data: leaderboardData, error: leaderboardError } = await supabase
        .from('characters')
        .select('id, name, class, level')
        .order('level', { ascending: false })
        .range(offset, offset + pageSize - 1);
      
      if (leaderboardError) {
        console.error('Error getting level leaderboard:', leaderboardError);
        return {
          success: false,
          error: 'Failed to get leaderboard data'
        };
      }

      console.log('Leaderboard Data:', leaderboardData);
      
      // Transform to LeaderboardItem format with ranks
      const entries: LeaderboardItem[] = leaderboardData.map((character: any, index: number) => ({
        rank: offset + index + 1,
        id: character.id,
        name: character.name,
        class: character.class,
        value: character.level
      }));
      
      // Get player's rank if a characterId was provided
      let playerRank = null;
      if (playerCharacterId) {
        // Call the DB function to get the rank
        const { data: rankData, error: rankError } = await supabase
          .rpc('get_level_rank', { p_character_id: playerCharacterId });
        
        if (!rankError && rankData !== null) {
          playerRank = rankData;
        }
      }
      
      const totalPages = Math.ceil((count || 0) / pageSize);
      
      return {
        success: true,
        data: {
          entries,
          currentPage: page,
          totalPages,
          totalEntries: count || 0,
          playerRank
        }
      };
    } catch (err) {
      console.error('Unexpected error getting level leaderboard:', err);
      return {
        success: false,
        error: 'An unexpected error occurred'
      };
    }
  },
  ['level-leaderboard'],
  { revalidate: 30 } // Cache for 1 hour
);

/**
 * Get level-based leaderboard filtered by class
 */
export const getLevelLeaderboardByClass = unstable_cache(
  async (
    characterClass: CharacterClass,
    page: number = 1,
    pageSize: number = 10,
    playerCharacterId?: string,
    supabase?: any
  ): Promise<ApiResponse<PaginatedLeaderboard>> => {
    try {
      if (!supabase) {
        supabase = await createClient();
      }
      const offset = (page - 1) * pageSize;
      
      // Get total count for pagination
      const { count, error: countError } = await supabase
        .from('characters')
        .select('*', { count: 'exact', head: true })
        .eq('class', characterClass);
      
      if (countError) {
        console.error('Error getting total character count by class:', countError);
        return {
          success: false,
          error: 'Failed to get leaderboard data'
        };
      }
      
      // Get paginated leaderboard data
      const { data: leaderboardData, error: leaderboardError } = await supabase
        .from('characters')
        .select('id, name, class, level')
        .eq('class', characterClass)
        .order('level', { ascending: false })
        .range(offset, offset + pageSize - 1);
      
      if (leaderboardError) {
        console.error('Error getting level leaderboard by class:', leaderboardError);
        return {
          success: false,
          error: 'Failed to get leaderboard data'
        };
      }
      
      // Transform to LeaderboardItem format with ranks
      const entries: LeaderboardItem[] = leaderboardData.map((character: any, index: number) => ({
        rank: offset + index + 1,
        id: character.id,
        name: character.name,
        class: character.class,
        value: character.level
      }));
      
      // Get player's rank if a characterId was provided and matches the class
      let playerRank = null;
      if (playerCharacterId) {
        // First check if the character is of the requested class
        const { data: character, error: characterError } = await supabase
          .from('characters')
          .select('class')
          .eq('id', playerCharacterId)
          .single();
        
        if (!characterError && character.class === characterClass) {
          // Call the DB function to get the rank by class
          const { data: rankData, error: rankError } = await supabase
            .rpc('get_level_rank_by_class', { 
              p_character_id: playerCharacterId,
              p_class: characterClass
            });
          
          if (!rankError && rankData !== null) {
            playerRank = rankData;
          }
        }
      }
      
      const totalPages = Math.ceil((count || 0) / pageSize);
      
      return {
        success: true,
        data: {
          entries,
          currentPage: page,
          totalPages,
          totalEntries: count || 0,
          playerRank
        }
      };
    } catch (err) {
      console.error('Unexpected error getting level leaderboard by class:', err);
      return {
        success: false,
        error: 'An unexpected error occurred'
      };
    }
  },
  ['level-leaderboard-by-class'],
  { revalidate: 3600 } // Cache for 1 hour
);

/**
 * Get wealth-based leaderboard
 */
export const getWealthLeaderboard = unstable_cache(
  async (
    page: number = 1,
    pageSize: number = 10,
    playerCharacterId?: string,
    supabase?: any
  ): Promise<ApiResponse<PaginatedLeaderboard>> => {
    try {
      if (!supabase) {
        supabase = await createClient();
      }
      const offset = (page - 1) * pageSize;
      
      // Get total count for pagination
      const { count, error: countError } = await supabase
        .from('characters')
        .select('*', { count: 'exact', head: true });
      
      if (countError) {
        console.error('Error getting total character count:', countError);
        return {
          success: false,
          error: 'Failed to get leaderboard data'
        };
      }
      
      // Get paginated leaderboard data
      const { data: leaderboardData, error: leaderboardError } = await supabase
        .from('characters')
        .select('id, name, class, gold')
        .order('gold', { ascending: false })
        .range(offset, offset + pageSize - 1);
      
      if (leaderboardError) {
        console.error('Error getting wealth leaderboard:', leaderboardError);
        return {
          success: false,
          error: 'Failed to get leaderboard data'
        };
      }
      
      // Transform to LeaderboardItem format with ranks
      const entries: LeaderboardItem[] = leaderboardData.map((character: any, index: number) => ({
        rank: offset + index + 1,
        id: character.id,
        name: character.name,
        class: character.class,
        value: character.gold
      }));
      
      // Get player's rank if a characterId was provided
      let playerRank = null;
      if (playerCharacterId) {
        // Call the DB function to get the rank
        const { data: rankData, error: rankError } = await supabase
          .rpc('get_wealth_rank', { p_character_id: playerCharacterId });
        
        if (!rankError && rankData !== null) {
          playerRank = rankData;
        }
      }
      
      const totalPages = Math.ceil((count || 0) / pageSize);
      
      return {
        success: true,
        data: {
          entries,
          currentPage: page,
          totalPages,
          totalEntries: count || 0,
          playerRank
        }
      };
    } catch (err) {
      console.error('Unexpected error getting wealth leaderboard:', err);
      return {
        success: false,
        error: 'An unexpected error occurred'
      };
    }
  },
  ['wealth-leaderboard'],
  { revalidate: 3600 } // Cache for 1 hour
);

/**
 * Get power-based leaderboard
 */
export const getPowerLeaderboard = unstable_cache(
  async (
    page: number = 1,
    pageSize: number = 10,
    playerCharacterId?: string,
    supabase?: any
  ): Promise<ApiResponse<PaginatedLeaderboard>> => {
    try {
      if (!supabase) {
        supabase = await createClient();
      }
      const offset = (page - 1) * pageSize;
      
      // Get total count for pagination
      const { count, error: countError } = await supabase
        .from('character_stats')
        .select('*', { count: 'exact', head: true });
      
      if (countError) {
        console.error('Error getting total character stats count:', countError);
        return {
          success: false,
          error: 'Failed to get leaderboard data'
        };
      }
      
      // Get paginated leaderboard data with character details
      const { data: leaderboardData, error: leaderboardError } = await supabase
        .from('character_stats')
        .select(`
          character_id,
          power_level,
          characters:character_id (
            name,
            class
          )
        `)
        .order('power_level', { ascending: false })
        .range(offset, offset + pageSize - 1);
      
      if (leaderboardError) {
        console.error('Error getting power leaderboard:', leaderboardError);
        return {
          success: false,
          error: 'Failed to get leaderboard data'
        };
      }
      
  // Transform to LeaderboardItem format with ranks
  const entries: LeaderboardItem[] = leaderboardData.map((stat: any, index: number) => {
    const character = stat.characters as any;
    return {
      rank: offset + index + 1,
      id: stat.character_id,
      name: character?.name || 'Unknown',
      class: character?.class || 'Warrior',
      value: stat.power_level || 0
    };
  });
      
      // Get player's rank if a characterId was provided
      let playerRank = null;
      if (playerCharacterId) {
        // Call the DB function to get the rank
        const { data: rankData, error: rankError } = await supabase
          .rpc('get_power_rank', { p_character_id: playerCharacterId });
        
        if (!rankError && rankData !== null) {
          playerRank = rankData;
        }
      }
      
      const totalPages = Math.ceil((count || 0) / pageSize);
      
      return {
        success: true,
        data: {
          entries,
          currentPage: page,
          totalPages,
          totalEntries: count || 0,
          playerRank
        }
      };
    } catch (err) {
      console.error('Unexpected error getting power leaderboard:', err);
      return {
        success: false,
        error: 'An unexpected error occurred'
      };
    }
  },
  ['power-leaderboard'],
  { revalidate: 3600 } // Cache for 1 hour
);

/**
 * Get power-based leaderboard filtered by class
 */
export const getPowerLeaderboardByClass = unstable_cache(
  async (
    characterClass: CharacterClass,
    page: number = 1,
    pageSize: number = 10,
    playerCharacterId?: string,
    supabase?: any
  ): Promise<ApiResponse<PaginatedLeaderboard>> => {
    try {
      if (!supabase) {
        supabase = await createClient();
      }
      const offset = (page - 1) * pageSize;
      
      // Get total count for pagination
      const { count, error: countError } = await supabase
        .from('character_stats')
        .select(`
          character_id,
          characters:character_id (class)
        `, { count: 'exact', head: true })
        .eq('characters.class', characterClass);
      
      if (countError) {
        console.error('Error getting total character stats count by class:', countError);
        return {
          success: false,
          error: 'Failed to get leaderboard data'
        };
      }
      
      // Get paginated leaderboard data with character details
      const { data: leaderboardData, error: leaderboardError } = await supabase
        .from('character_stats')
        .select(`
          character_id,
          power_level,
          characters:character_id (
            name,
            class
          )
        `)
        .eq('characters.class', characterClass)
        .order('power_level', { ascending: false })
        .range(offset, offset + pageSize - 1);
      

      
      if (leaderboardError) {
        console.error('Error getting power leaderboard by class:', leaderboardError);
        return {
          success: false,
          error: 'Failed to get leaderboard data'
        };
      }
      
      // Transform to LeaderboardItem format with ranks
      const entries: LeaderboardItem[] = leaderboardData.map((stat: any, index: number) => {
        const character = stat.characters as any;
        return {
          rank: offset + index + 1,
          id: stat.character_id,
          name: character?.name || 'Unknown',
          class: character?.class || 'Warrior',
          value: stat.power_level || 0
        };
      });
      
      // Get player's rank if a characterId was provided
      let playerRank = null;
      if (playerCharacterId) {
        // First check if the character is of the requested class
        const { data: character, error: characterError } = await supabase
          .from('characters')
          .select('class')
          .eq('id', playerCharacterId)
          .single();
        
        if (!characterError && character.class === characterClass) {
          // Call the DB function to get the rank by class
          const { data: rankData, error: rankError } = await supabase
            .rpc('get_power_rank_by_class', { 
              p_character_id: playerCharacterId,
              p_class: characterClass
            });
          
          if (!rankError && rankData !== null) {
            playerRank = rankData;
          }
        }
      }
      
      const totalPages = Math.ceil((count || 0) / pageSize);
      
      return {
        success: true,
        data: {
          entries,
          currentPage: page,
          totalPages,
          totalEntries: count || 0,
          playerRank
        }
      };
    } catch (err) {
      console.error('Unexpected error getting power leaderboard by class:', err);
      return {
        success: false,
        error: 'An unexpected error occurred'
      };
    }
  },
  ['power-leaderboard-by-class'],
  { revalidate: 3600 } // Cache for 1 hour
);

/**
 * Get adventures completed leaderboard
 */
export const getAdventuresLeaderboard = unstable_cache(
  async (
    page: number = 1,
    pageSize: number = 10,
    playerCharacterId?: string,
    supabase?: any
  ): Promise<ApiResponse<PaginatedLeaderboard>> => {
    try {
      if (!supabase) {
        supabase = await createClient();
      }
      const offset = (page - 1) * pageSize;
      
      // Get total count for pagination
      const { count, error: countError } = await supabase
        .from('character_stats')
        .select('*', { count: 'exact', head: true });
      
      if (countError) {
        console.error('Error getting total character stats count:', countError);
        return {
          success: false,
          error: 'Failed to get leaderboard data'
        };
      }
      
      // Get paginated leaderboard data with character details
      const { data: leaderboardData, error: leaderboardError } = await supabase
        .from('character_stats')
        .select(`
          character_id,
          total_adventures_completed,
          characters:character_id (
            name,
            class
          )
        `)
        .order('total_adventures_completed', { ascending: false })
        .range(offset, offset + pageSize - 1);
      
      if (leaderboardError) {
        console.error('Error getting adventures leaderboard:', leaderboardError);
        return {
          success: false,
          error: 'Failed to get leaderboard data'
        };
      }
      
      // Transform to LeaderboardItem format with ranks
      const entries: LeaderboardItem[] = leaderboardData.map((stat: any, index: number) => {
        const character = stat.characters as any;
        return {
          rank: offset + index + 1,
          id: stat.character_id,
          name: character?.name || 'Unknown',
          class: character?.class || 'Warrior',
          value: stat.total_adventures_completed || 0
        };
      });
      
      // Get player's rank if a characterId was provided
      let playerRank = null;
      if (playerCharacterId) {
        // Call the DB function to get the rank
        const { data: rankData, error: rankError } = await supabase
          .rpc('get_adventures_rank', { p_character_id: playerCharacterId });
        
        if (!rankError && rankData !== null) {
          playerRank = rankData;
        }
      }
      
      const totalPages = Math.ceil((count || 0) / pageSize);
      
      return {
        success: true,
        data: {
          entries,
          currentPage: page,
          totalPages,
          totalEntries: count || 0,
          playerRank
        }
      };
    } catch (err) {
      console.error('Unexpected error getting adventures leaderboard:', err);
      return {
        success: false,
        error: 'An unexpected error occurred'
      };
    }
  },
  ['adventures-leaderboard'],
  { revalidate: 3600 } // Cache for 1 hour
);

/**
 * Get adventures completed leaderboard filtered by class
 */
export const getAdventuresLeaderboardByClass = unstable_cache(
  async (
    characterClass: CharacterClass,
    page: number = 1,
    pageSize: number = 10,
    playerCharacterId?: string,
    supabase?: any
  ): Promise<ApiResponse<PaginatedLeaderboard>> => {
    try {
      if (!supabase) {
        supabase = await createClient();
      }
      const offset = (page - 1) * pageSize;
      
      // Get total count for pagination
      const { count, error: countError } = await supabase
        .from('character_stats')
        .select(`
          character_id,
          characters:character_id (class)
        `, { count: 'exact', head: true })
        .eq('characters.class', characterClass);
      
      if (countError) {
        console.error('Error getting total character stats count by class:', countError);
        return {
          success: false,
          error: 'Failed to get leaderboard data'
        };
      }
      
      // Get paginated leaderboard data with character details
      const { data: leaderboardData, error: leaderboardError } = await supabase
        .from('character_stats')
        .select(`
          character_id,
          total_adventures_completed,
          characters:character_id (
            name,
            class
          )
        `)
        .eq('characters.class', characterClass)
        .order('total_adventures_completed', { ascending: false })
        .range(offset, offset + pageSize - 1);
      
      if (leaderboardError) {
        console.error('Error getting adventures leaderboard by class:', leaderboardError);
        return {
          success: false,
          error: 'Failed to get leaderboard data'
        };
      }
      
      // Transform to LeaderboardItem format with ranks
      const entries: LeaderboardItem[] = leaderboardData.map((stat: any, index: number) => {
        const character = stat.characters as any;
        return {
          rank: offset + index + 1,
          id: stat.character_id,
          name: character?.name || 'Unknown',
          class: character?.class || 'Warrior',
          value: stat.total_adventures_completed || 0
        };
      });
      
      // Get player's rank if a characterId was provided
      let playerRank = null;
      if (playerCharacterId) {
        // First check if the character is of the requested class
        const { data: character, error: characterError } = await supabase
          .from('characters')
          .select('class')
          .eq('id', playerCharacterId)
          .single();
        
        if (!characterError && character.class === characterClass) {
          // Call the DB function to get the rank by class
          const { data: rankData, error: rankError } = await supabase
            .rpc('get_adventures_rank_by_class', { 
              p_character_id: playerCharacterId,
              p_class: characterClass
            });
          
          if (!rankError && rankData !== null) {
            playerRank = rankData;
          }
        }
      }
      
      const totalPages = Math.ceil((count || 0) / pageSize);
      
      return {
        success: true,
        data: {
          entries,
          currentPage: page,
          totalPages,
          totalEntries: count || 0,
          playerRank
        }
      };
    } catch (err) {
      console.error('Unexpected error getting adventures leaderboard by class:', err);
      return {
        success: false,
        error: 'An unexpected error occurred'
      };
    }
  },
  ['adventures-leaderboard-by-class'],
  { revalidate: 3600 } // Cache for 1 hour
);

/**
 * Get bosses slain leaderboard
 */
export const getBossesSlainLeaderboard = unstable_cache(
  async (
    page: number = 1,
    pageSize: number = 10,
    supabase: SupabaseClient,
    playerCharacterId?: string,
  ): Promise<ApiResponse<PaginatedLeaderboard>> => {
    try {
      const offset = (page - 1) * pageSize;
      
      // Get total count for pagination
      const { count, error: countError } = await supabase
        .from('character_stats')
        .select('*', { count: 'exact', head: true });
      
      if (countError) {
        console.error('Error getting total character stats count:', countError);
        return {
          success: false,
          error: 'Failed to get leaderboard data'
        };
      }
      
      // Get paginated leaderboard data with character details
      const { data: leaderboardData, error: leaderboardError } = await supabase
        .from('character_stats')
        .select(`
          character_id,
          bosses_slain,
          characters:character_id (
            name,
            class
          )
        `)
        .order('bosses_slain', { ascending: false })
        .range(offset, offset + pageSize - 1);
      
      if (leaderboardError) {
        console.error('Error getting bosses slain leaderboard:', leaderboardError);
        return {
          success: false,
          error: 'Failed to get leaderboard data'
        };
      }
      
      // Transform to LeaderboardItem format with ranks
      const entries: LeaderboardItem[] = leaderboardData.map((stat: any, index: number) => {
        const character = stat.characters as any;
        return {
          rank: offset + index + 1,
          id: stat.character_id,
          name: character?.name || 'Unknown',
          class: character?.class || 'Warrior',
          value: stat.bosses_slain || 0
        };
      });
      
      // Get player's rank if a characterId was provided
      let playerRank = null;
      if (playerCharacterId) {
        // Call the DB function to get the rank
        const { data: rankData, error: rankError } = await supabase
          .rpc('get_bosses_slain_rank', { p_character_id: playerCharacterId });
        
        if (!rankError && rankData !== null) {
          playerRank = rankData;
        }
      }
      
      const totalPages = Math.ceil((count || 0) / pageSize);
      
      return {
        success: true,
        data: {
          entries,
          currentPage: page,
          totalPages,
          totalEntries: count || 0,
          playerRank
        }
      };
    } catch (err) {
      console.error('Unexpected error getting bosses slain leaderboard:', err);
      return {
        success: false,
        error: 'An unexpected error occurred'
      };
    }
  },
  ['bosses-slain-leaderboard'],
  { revalidate: 3600 } // Cache for 1 hour
);

/**
 * Get highest boss damage leaderboard
 */
export const getHighestBossDamageLeaderboard = unstable_cache(
  async (
    page: number = 1,
    pageSize: number = 10,
    supabase: SupabaseClient,
    playerCharacterId?: string
  ): Promise<ApiResponse<PaginatedLeaderboard>> => {
    try {
      const offset = (page - 1) * pageSize;
      
      // Get total count for pagination
      const { count, error: countError } = await supabase
        .from('character_stats')
        .select('*', { count: 'exact', head: true });
      
      if (countError) {
        console.error('Error getting total character stats count:', countError);
        return {
          success: false,
          error: 'Failed to get leaderboard data'
        };
      }
      
      // Get paginated leaderboard data with character details
      const { data: leaderboardData, error: leaderboardError } = await supabase
        .from('character_stats')
        .select(`
          character_id,
          highest_boss_damage,
          characters:character_id (
            name,
            class
          )
        `)
        .order('highest_boss_damage', { ascending: false })
        .range(offset, offset + pageSize - 1);
      
      if (leaderboardError) {
        console.error('Error getting highest boss damage leaderboard:', leaderboardError);
        return {
          success: false,
          error: 'Failed to get leaderboard data'
        };
      }
      
      // Transform to LeaderboardItem format with ranks
      const entries: LeaderboardItem[] = leaderboardData.map((stat: any, index: number) => {
        const character = stat.characters as any;
        return {
          rank: offset + index + 1,
          id: stat.character_id,
          name: character?.name || 'Unknown',
          class: character?.class || 'Warrior',
          value: stat.highest_boss_damage || 0
        };
      });
      
      // Get player's rank if a characterId was provided
      let playerRank = null;
      if (playerCharacterId) {
        // Call the DB function to get the rank
        const { data: rankData, error: rankError } = await supabase
          .rpc('get_boss_damage_rank', { p_character_id: playerCharacterId });
        
        if (!rankError && rankData !== null) {
          playerRank = rankData;
        }
      }
      
      const totalPages = Math.ceil((count || 0) / pageSize);
      
      return {
        success: true,
        data: {
          entries,
          currentPage: page,
          totalPages,
          totalEntries: count || 0,
          playerRank
        }
      };
    } catch (err) {
      console.error('Unexpected error getting highest boss damage leaderboard:', err);
      return {
        success: false,
        error: 'An unexpected error occurred'
      };
    }
  },
  ['highest-boss-damage-leaderboard'],
  { revalidate: 3600 } // Cache for 1 hour
);
