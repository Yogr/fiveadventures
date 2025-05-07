'use server';

import { unstable_cache } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import type { 
  ApiResponse, 
  Item, 
  Monster, 
  Area, 
  Adventure, 
  AdventureDecision, 
  AdventureOutcome, 
  Skill,
  WorldBoss,
  ShopItem,
  RewardTable
} from '@/lib/types';

import { SupabaseClient } from '@supabase/supabase-js';

// ========================
// ITEMS
// ========================

/**
 * Get all items from the database (uncached)
 * @param supabaseClient Optional Supabase client to use instead of creating a new one
 */
async function getItems(supabaseClient?: SupabaseClient): Promise<ApiResponse<Item[]>> {
  try {
    // Use provided client or create a new one
    const supabase = supabaseClient || await createClient();
    
    const { data, error } = await supabase
      .from('items')
      .select('*')
      .order('id');
    
    if (error) {
      console.error('Error fetching items:', error);
      return { success: false, error: error.message };
    }
    
    return { success: true, data: data as Item[] };
  } catch (err) {
    console.error('Unexpected error getting items:', err);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Get a single item by ID (uncached)
 * @param id Item ID to fetch
 * @param supabaseClient Optional Supabase client to use instead of creating a new one
 */
async function getItemById(id: number, supabaseClient?: SupabaseClient): Promise<ApiResponse<Item>> {
  try {
    // Use provided client or create a new one
    const supabase = supabaseClient || await createClient();
    
    const { data, error } = await supabase
      .from('items')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error(`Error fetching item ${id}:`, error);
      return { success: false, error: error.message };
    }
    
    return { success: true, data: data as Item };
  } catch (err) {
    console.error(`Unexpected error getting item ${id}:`, err);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Get all items (cached for 24 hours)
 * @param supabaseClient Optional Supabase client to use instead of creating a new one
 */
export const getCachedItems = unstable_cache(
  async (supabaseClient?: SupabaseClient) => {
    const result = await getItems(supabaseClient);
    return result;
  },
  ['items'],
  { revalidate: 86400 } // 24 hours
);

/**
 * Get a single item by ID (cached for 24 hours)
 * @param id Item ID to fetch
 * @param supabaseClient Optional Supabase client to use instead of creating a new one
 */
export const getCachedItemById = unstable_cache(
  async (id: number, supabaseClient?: SupabaseClient) => {
    try {
      const result = await getItemById(id, supabaseClient);
      return result;
    } catch (err) {
      console.error(`Error in getCachedItemById for ID ${id}:`, err);
      return { success: false, error: 'Exception in getCachedItemById' };
    }
  },
  ['item'],
  { revalidate: 86400 } // 24 hours
);

// ========================
// MONSTERS
// ========================

/**
 * Get all monsters from the database (uncached)
 * @param supabaseClient Optional Supabase client to use instead of creating a new one
 */
async function getMonsters(supabaseClient?: SupabaseClient): Promise<ApiResponse<Monster[]>> {
  try {
    // Use provided client or create a new one
    const supabase = supabaseClient || await createClient();
    
    const { data, error } = await supabase
      .from('monsters')
      .select('*')
      .order('id');
    
    if (error) {
      console.error('Error fetching monsters:', error);
      return { success: false, error: error.message };
    }
    
    return { success: true, data: data as Monster[] };
  } catch (err) {
    console.error('Unexpected error getting monsters:', err);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Get a single monster by ID (uncached)
 * @param id Monster ID to fetch
 * @param supabaseClient Optional Supabase client to use instead of creating a new one
 */
async function getMonsterById(id: number, supabaseClient?: SupabaseClient): Promise<ApiResponse<Monster>> {
  try {
    // Use provided client or create a new one
    const supabase = supabaseClient || await createClient();
    
    const { data, error } = await supabase
      .from('monsters')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error(`Error fetching monster ${id}:`, error);
      return { success: false, error: error.message };
    }
    
    return { success: true, data: data as Monster };
  } catch (err) {
    console.error(`Unexpected error getting monster ${id}:`, err);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Get all monsters (cached for 24 hours)
 * @param supabaseClient Optional Supabase client to use instead of creating a new one
 */
export const getCachedMonsters = unstable_cache(
  async (supabaseClient?: SupabaseClient) => {
    const result = await getMonsters(supabaseClient);
    return result;
  },
  ['monsters'],
  { revalidate: 86400 } // 24 hours
);

/**
 * Get a single monster by ID (cached for 24 hours)
 * @param id Monster ID to fetch
 * @param supabaseClient Optional Supabase client to use instead of creating a new one
 */
export const getCachedMonsterById = unstable_cache(
  async (id: number, supabaseClient?: SupabaseClient) => {
    const result = await getMonsterById(id, supabaseClient);
    return result;
  },
  ['monster'],
  { revalidate: 86400 } // 24 hours
);

// ========================
// AREAS
// ========================

/**
 * Get all areas from the database (uncached)
 * @param supabaseClient Optional Supabase client to use instead of creating a new one
 */
async function getAreas(supabaseClient?: SupabaseClient): Promise<ApiResponse<Area[]>> {
  try {
    // Use provided client or create a new one
    const supabase = supabaseClient || await createClient();
    
    const { data, error } = await supabase
      .from('areas')
      .select('*')
      .order('id');
    
    if (error) {
      console.error('Error fetching areas:', error);
      return { success: false, error: error.message };
    }
    
    return { success: true, data: data as Area[] };
  } catch (err) {
    console.error('Unexpected error getting areas:', err);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Get a single area by ID (uncached)
 * @param id Area ID to fetch
 * @param supabaseClient Optional Supabase client to use instead of creating a new one
 */
async function getAreaById(id: number, supabaseClient?: SupabaseClient): Promise<ApiResponse<Area>> {
  try {
    // Use provided client or create a new one
    const supabase = supabaseClient || await createClient();
    
    const { data, error } = await supabase
      .from('areas')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error(`Error fetching area ${id}:`, error);
      return { success: false, error: error.message };
    }
    
    return { success: true, data: data as Area };
  } catch (err) {
    console.error(`Unexpected error getting area ${id}:`, err);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Get all areas (cached for 24 hours)
 * @param supabaseClient Optional Supabase client to use instead of creating a new one
 */
export const getCachedAreas = unstable_cache(
  async (supabaseClient?: SupabaseClient) => {
    const result = await getAreas(supabaseClient);
    return result;
  },
  ['areas'],
  { revalidate: 86400 } // 24 hours
);

/**
 * Get a single area by ID (cached for 24 hours)
 * @param id Area ID to fetch
 * @param supabaseClient Optional Supabase client to use instead of creating a new one
 */
export const getCachedAreaById = unstable_cache(
  async (id: number, supabaseClient?: SupabaseClient) => {
    const result = await getAreaById(id, supabaseClient);
    return result;
  },
  ['area'],
  { revalidate: 86400 } // 24 hours
);

// ========================
// ADVENTURES
// ========================

/**
 * Get all adventures from the database (uncached)
 * @param supabaseClient Optional Supabase client to use instead of creating a new one
 */
async function getAdventures(supabaseClient?: SupabaseClient): Promise<ApiResponse<Adventure[]>> {
  try {
    // Use provided client or create a new one
    const supabase = supabaseClient || await createClient();
    
    const { data, error } = await supabase
      .from('adventures')
      .select('*')
      .order('id');
    
    if (error) {
      console.error('Error fetching adventures:', error);
      return { success: false, error: error.message };
    }
    
    return { success: true, data: data as Adventure[] };
  } catch (err) {
    console.error('Unexpected error getting adventures:', err);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Get a single adventure by ID (uncached)
 * @param id Adventure ID to fetch
 * @param supabaseClient Optional Supabase client to use instead of creating a new one
 */
async function getAdventureById(id: number, supabaseClient?: SupabaseClient): Promise<ApiResponse<Adventure>> {
  try {
    // Use provided client or create a new one
    const supabase = supabaseClient || await createClient();
    
    const { data, error } = await supabase
      .from('adventures')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error(`Error fetching adventure ${id}:`, error);
      return { success: false, error: error.message };
    }
    
    return { success: true, data: data as Adventure };
  } catch (err) {
    console.error(`Unexpected error getting adventure ${id}:`, err);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Get all adventures (cached for 24 hours)
 * @param supabaseClient Optional Supabase client to use instead of creating a new one
 */
export const getCachedAdventures = unstable_cache(
  async (supabaseClient?: SupabaseClient) => {
    const result = await getAdventures(supabaseClient);
    return result;
  },
  ['adventures'],
  { revalidate: 86400 } // 24 hours
);

/**
 * Get a single adventure by ID (cached for 24 hours)
 * @param id Adventure ID to fetch
 * @param supabaseClient Optional Supabase client to use instead of creating a new one
 */
export const getCachedAdventureById = unstable_cache(
  async (id: number, supabaseClient?: SupabaseClient) => {
    const result = await getAdventureById(id, supabaseClient);
    return result;
  },
  ['adventure'],
  { revalidate: 86400 } // 24 hours
);

// ========================
// ADVENTURE DECISIONS
// ========================

/**
 * Get all adventure decisions from the database (uncached)
 * @param supabaseClient Optional Supabase client to use instead of creating a new one
 */
async function getAdventureDecisions(supabaseClient?: SupabaseClient): Promise<ApiResponse<AdventureDecision[]>> {
  try {
    // Use provided client or create a new one
    const supabase = supabaseClient || await createClient();
    
    const { data, error } = await supabase
      .from('adventure_decisions')
      .select('*')
      .order('id');
    
    if (error) {
      console.error('Error fetching adventure decisions:', error);
      return { success: false, error: error.message };
    }
    
    return { success: true, data: data as AdventureDecision[] };
  } catch (err) {
    console.error('Unexpected error getting adventure decisions:', err);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Get a single adventure decision by ID (uncached)
 * @param id Decision ID to fetch
 * @param supabaseClient Optional Supabase client to use instead of creating a new one
 */
async function getAdventureDecisionById(id: number, supabaseClient?: SupabaseClient): Promise<ApiResponse<AdventureDecision>> {
  try {
    // Use provided client or create a new one
    const supabase = supabaseClient || await createClient();
    
    const { data, error } = await supabase
      .from('adventure_decisions')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error(`Error fetching adventure decision ${id}:`, error);
      return { success: false, error: error.message };
    }
    
    return { success: true, data: data as AdventureDecision };
  } catch (err) {
    console.error(`Unexpected error getting adventure decision ${id}:`, err);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Get all adventure decisions (cached for 24 hours)
 * @param supabaseClient Optional Supabase client to use instead of creating a new one
 */
export const getCachedAdventureDecisions = unstable_cache(
  async (supabaseClient?: SupabaseClient) => {
    const result = await getAdventureDecisions(supabaseClient);
    return result;
  },
  ['adventure_decisions'],
  { revalidate: 86400 } // 24 hours
);

/**
 * Get a single adventure decision by ID (cached for 24 hours)
 * @param id Decision ID to fetch
 * @param supabaseClient Optional Supabase client to use instead of creating a new one
 */
export const getCachedAdventureDecisionById = unstable_cache(
  async (id: number, supabaseClient?: SupabaseClient) => {
    const result = await getAdventureDecisionById(id, supabaseClient);
    return result;
  },
  ['adventure_decision'],
  { revalidate: 86400 } // 24 hours
);

// ========================
// ADVENTURE OUTCOMES
// ========================

/**
 * Get all adventure outcomes from the database (uncached)
 * @param supabaseClient Optional Supabase client to use instead of creating a new one
 */
async function getAdventureOutcomes(supabaseClient?: SupabaseClient): Promise<ApiResponse<AdventureOutcome[]>> {
  try {
    // Use provided client or create a new one
    const supabase = supabaseClient || await createClient();
    
    const { data, error } = await supabase
      .from('adventure_outcomes')
      .select('*')
      .order('id');
    
    if (error) {
      console.error('Error fetching adventure outcomes:', error);
      return { success: false, error: error.message };
    }
    
    return { success: true, data: data as AdventureOutcome[] };
  } catch (err) {
    console.error('Unexpected error getting adventure outcomes:', err);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Get a single adventure outcome by ID (uncached)
 * @param id Outcome ID to fetch
 * @param supabaseClient Optional Supabase client to use instead of creating a new one
 */
async function getAdventureOutcomeById(id: number, supabaseClient?: SupabaseClient): Promise<ApiResponse<AdventureOutcome>> {
  try {
    // Use provided client or create a new one
    const supabase = supabaseClient || await createClient();
    
    const { data, error } = await supabase
      .from('adventure_outcomes')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error(`Error fetching adventure outcome ${id}:`, error);
      return { success: false, error: error.message };
    }
    
    return { success: true, data: data as AdventureOutcome };
  } catch (err) {
    console.error(`Unexpected error getting adventure outcome ${id}:`, err);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Get all adventure outcomes (cached for 24 hours)
 * @param supabaseClient Optional Supabase client to use instead of creating a new one
 */
export const getCachedAdventureOutcomes = unstable_cache(
  async (supabaseClient?: SupabaseClient) => {
    const result = await getAdventureOutcomes(supabaseClient);
    return result;
  },
  ['adventure_outcomes'],
  { revalidate: 86400 } // 24 hours
);

/**
 * Get a single adventure outcome by ID (cached for 24 hours)
 * @param id Outcome ID to fetch
 * @param supabaseClient Optional Supabase client to use instead of creating a new one
 */
export const getCachedAdventureOutcomeById = unstable_cache(
  async (id: number, supabaseClient?: SupabaseClient) => {
    const result = await getAdventureOutcomeById(id, supabaseClient);
    return result;
  },
  ['adventure_outcome'],
  { revalidate: 86400 } // 24 hours
);

// ========================
// SKILLS
// ========================

/**
 * Get all skills from the database (uncached)
 * @param supabaseClient Optional Supabase client to use instead of creating a new one
 */
async function getSkills(supabaseClient?: SupabaseClient): Promise<ApiResponse<Skill[]>> {
  try {
    // Use provided client or create a new one
    const supabase = supabaseClient || await createClient();
    
    const { data, error } = await supabase
      .from('skills')
      .select('*')
      .order('id');
    
    if (error) {
      console.error('Error fetching skills:', error);
      return { success: false, error: error.message };
    }
    
    return { success: true, data: data as Skill[] };
  } catch (err) {
    console.error('Unexpected error getting skills:', err);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Get a single skill by ID (uncached)
 * @param id Skill ID to fetch
 * @param supabaseClient Optional Supabase client to use instead of creating a new one
 */
async function getSkillById(id: number, supabaseClient?: SupabaseClient): Promise<ApiResponse<Skill>> {
  try {
    // Use provided client or create a new one
    const supabase = supabaseClient || await createClient();
    
    const { data, error } = await supabase
      .from('skills')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error(`Error fetching skill ${id}:`, error);
      return { success: false, error: error.message };
    }
    
    return { success: true, data: data as Skill };
  } catch (err) {
    console.error(`Unexpected error getting skill ${id}:`, err);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Get all skills (cached for 24 hours)
 * @param supabaseClient Optional Supabase client to use instead of creating a new one
 */
export const getCachedSkills = unstable_cache(
  async (supabaseClient?: SupabaseClient) => {
    const result = await getSkills(supabaseClient);
    return result;
  },
  ['skills'],
  { revalidate: 86400 } // 24 hours
);

/**
 * Get a single skill by ID (cached for 24 hours)
 * @param id Skill ID to fetch
 * @param supabaseClient Optional Supabase client to use instead of creating a new one
 */
export const getCachedSkillById = unstable_cache(
  async (id: number, supabaseClient?: SupabaseClient) => {
    const result = await getSkillById(id, supabaseClient);
    return result;
  },
  ['skill'],
  { revalidate: 86400 } // 24 hours
);

// ========================
// WORLD BOSS
// ========================

/**
 * Get all world bosses from the database (uncached)
 * @param supabaseClient Optional Supabase client to use instead of creating a new one
 */
async function getWorldBosses(supabaseClient?: SupabaseClient): Promise<ApiResponse<WorldBoss[]>> {
  try {
    // Use provided client or create a new one
    const supabase = supabaseClient || await createClient();
    
    const { data, error } = await supabase
      .from('world_boss')
      .select('*')
      .order('id');
    
    if (error) {
      console.error('Error fetching world bosses:', error);
      return { success: false, error: error.message };
    }
    
    return { success: true, data: data as WorldBoss[] };
  } catch (err) {
    console.error('Unexpected error getting world bosses:', err);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Get a single world boss by ID (uncached)
 * @param id World Boss ID to fetch
 * @param supabaseClient Optional Supabase client to use instead of creating a new one
 */
async function getWorldBossById(id: number, supabaseClient?: SupabaseClient): Promise<ApiResponse<WorldBoss>> {
  try {
    // Use provided client or create a new one
    const supabase = supabaseClient || await createClient();
    
    const { data, error } = await supabase
      .from('world_boss')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error(`Error fetching world boss ${id}:`, error);
      return { success: false, error: error.message };
    }
    
    return { success: true, data: data as WorldBoss };
  } catch (err) {
    console.error(`Unexpected error getting world boss ${id}:`, err);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Get all world bosses (cached for 24 hours)
 * @param supabaseClient Optional Supabase client to use instead of creating a new one
 */
export const getCachedWorldBosses = unstable_cache(
  async (supabaseClient?: SupabaseClient) => {
    const result = await getWorldBosses(supabaseClient);
    return result;
  },
  ['world_bosses'],
  { revalidate: 86400 } // 24 hours
);

/**
 * Get a single world boss by ID (cached for 24 hours)
 * @param id World Boss ID to fetch
 * @param supabaseClient Optional Supabase client to use instead of creating a new one
 */
export const getCachedWorldBossById = unstable_cache(
  async (id: number, supabaseClient?: SupabaseClient) => {
    const result = await getWorldBossById(id, supabaseClient);
    return result;
  },
  ['world_boss'],
  { revalidate: 86400 } // 24 hours
);

// ========================
// SHOP ITEMS
// ========================

/**
 * Get all shop items from the database (uncached)
 * @param supabaseClient Optional Supabase client to use instead of creating a new one
 */
async function getShopItems(supabaseClient?: SupabaseClient): Promise<ApiResponse<ShopItem[]>> {
  try {
    // Use provided client or create a new one
    const supabase = supabaseClient || await createClient();
    
    const { data, error } = await supabase
      .from('shop_items')
      .select(`
        *,
        item:item_id(*)
      `)
      .order('id');
    
    if (error) {
      console.error('Error fetching shop items:', error);
      return { success: false, error: error.message };
    }
    
    return { success: true, data: data as ShopItem[] };
  } catch (err) {
    console.error('Unexpected error getting shop items:', err);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Get a single shop item by ID (uncached)
 * @param id Shop Item ID to fetch
 * @param supabaseClient Optional Supabase client to use instead of creating a new one
 */
async function getShopItemById(id: number, supabaseClient?: SupabaseClient): Promise<ApiResponse<ShopItem>> {
  try {
    // Use provided client or create a new one
    const supabase = supabaseClient || await createClient();
    
    const { data, error } = await supabase
      .from('shop_items')
      .select(`
        *,
        item:item_id(*)
      `)
      .eq('id', id)
      .single();
    
    if (error) {
      console.error(`Error fetching shop item ${id}:`, error);
      return { success: false, error: error.message };
    }
    
    return { success: true, data: data as ShopItem };
  } catch (err) {
    console.error(`Unexpected error getting shop item ${id}:`, err);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Get all shop items (cached for 24 hours)
 * @param supabaseClient Optional Supabase client to use instead of creating a new one
 */
export const getCachedShopItems = unstable_cache(
  async (supabaseClient?: SupabaseClient) => {
    const result = await getShopItems(supabaseClient);
    return result;
  },
  ['shop_items'],
  { revalidate: 86400 } // 24 hours
);

/**
 * Get a single shop item by ID (cached for 24 hours)
 * @param id Shop Item ID to fetch
 * @param supabaseClient Optional Supabase client to use instead of creating a new one
 */
export const getCachedShopItemById = unstable_cache(
  async (id: number, supabaseClient?: SupabaseClient) => {
    const result = await getShopItemById(id, supabaseClient);
    return result;
  },
  ['shop_item'],
  { revalidate: 86400 } // 24 hours
);

// ========================
// REWARD TABLES
// ========================

/**
 * Get all reward tables from the database (uncached)
 * @param supabaseClient Optional Supabase client to use instead of creating a new one
 */
async function getRewardTables(supabaseClient?: SupabaseClient): Promise<ApiResponse<RewardTable[]>> {
  try {
    // Use provided client or create a new one
    const supabase = supabaseClient || await createClient();
    
    const { data, error } = await supabase
      .from('reward_tables')
      .select(`
        *,
        reward_items:reward_items(
          id,
          item_id,
          chance,
          items:item_id(*)
        )
      `)
      .order('id');
    
    if (error) {
      console.error('Error fetching reward tables:', error);
      return { success: false, error: error.message };
    }
    
    return { success: true, data: data as RewardTable[] };
  } catch (err) {
    console.error('Unexpected error getting reward tables:', err);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Get a single reward table by ID (uncached)
 * @param id Reward Table ID to fetch
 * @param supabaseClient Optional Supabase client to use instead of creating a new one
 */
async function getRewardTableById(id: number, supabaseClient?: SupabaseClient): Promise<ApiResponse<RewardTable>> {
  try {
    // Use provided client or create a new one
    const supabase = supabaseClient || await createClient();
    
    const { data, error } = await supabase
      .from('reward_tables')
      .select(`
        *,
        reward_items:reward_items(
          id,
          item_id,
          chance,
          items:item_id(*)
        )
      `)
      .eq('id', id)
      .single();
    
    if (error) {
      console.error(`Error fetching reward table ${id}:`, error);
      return { success: false, error: error.message };
    }
    
    return { success: true, data: data as RewardTable };
  } catch (err) {
    console.error(`Unexpected error getting reward table ${id}:`, err);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Get all reward tables (cached for 24 hours)
 * @param supabaseClient Optional Supabase client to use instead of creating a new one
 */
export const getCachedRewardTables = unstable_cache(
  async (supabaseClient?: SupabaseClient) => {
    const result = await getRewardTables(supabaseClient);
    return result;
  },
  ['reward_tables'],
  { revalidate: 86400 } // 24 hours
);

/**
 * Get a single reward table by ID (cached for 24 hours)
 * @param id Reward Table ID to fetch
 * @param supabaseClient Optional Supabase client to use instead of creating a new one
 */
export const getCachedRewardTableById = unstable_cache(
  async (id: number, supabaseClient?: SupabaseClient) => {
    const result = await getRewardTableById(id, supabaseClient);
    return result;
  },
  ['reward_table'],
  { revalidate: 86400 } // 24 hours
);
