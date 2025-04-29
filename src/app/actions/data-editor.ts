'use server';

import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from './auth';

// Fetch items from the database
export async function getItems() {
  const supabase = await createClient();
  
  // Fetch all items from the database
  const { data: items, error } = await supabase
    .from('items')
    .select('*')
    .order('id');
  
  if (error) {
    console.error('Error fetching items:', error);
    return { success: false, error: error.message };
  }
  
  return { success: true, data: items };
}

// Save an item to the database
export async function saveItem(item: any) {
  // First check if user has admin privileges
  await requireAdmin();
  
  const supabase = await createClient();
 
  const { data, error } = await supabase
    .from('items')
    .upsert(item, { onConflict: 'id' })
    .select();
  
  if (error) {
    console.error('Error saving item:', error, item);
    return { success: false, error: error.message };
  }
  
  return { success: true, data: data ? data[0] : null };
}

// Delete an item from the database
export async function deleteItem(id: number) {
  // First check if user has admin privileges
  await requireAdmin();
  
  const supabase = await createClient();
  
  // Delete the item
  const { error } = await supabase
    .from('items')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error deleting item:', error);
    return { success: false, error: error.message };
  }
  
  return { success: true };
}

// Fetch classes from the database
export async function getClasses() {
  const supabase = await createClient();
  
  // Fetch all classes from the database
  const { data: classes, error } = await supabase
    .from('classes')
    .select('*')
    .order('id');
  
  if (error) {
    console.error('Error fetching classes:', error);
    return { success: false, error: error.message };
  }
  
  return { success: true, data: classes };
}

// Fetch skills from the database
export async function getSkills() {
  const supabase = await createClient();
  
  // Fetch all skills from the database
  const { data: skills, error } = await supabase
    .from('skills')
    .select('*')
    .order('id');
  
  if (error) {
    console.error('Error fetching skills:', error);
    return { success: false, error: error.message };
  }
  
  return { success: true, data: skills };
}

// Save a skill to the database (handles both insert and update)
export async function saveSkill(skill: any) {
  // First check if user has admin privileges
  await requireAdmin();
  
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('skills')
    .upsert(skill, { onConflict: 'id' })
    .select();
  
  if (error) {
    console.error('Error saving skill:', error);
    return { success: false, error: error.message };
  }
  
  return { success: true, data: data ? data[0] : null };
}

// Delete a skill from the database
export async function deleteSkill(id: number) {
  // First check if user has admin privileges
  await requireAdmin();
  
  const supabase = await createClient();
  
  // Delete the skill
  const { error } = await supabase
    .from('skills')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error deleting skill:', error);
    return { success: false, error: error.message };
  }
  
  return { success: true };
}

// Fetch areas from the database
export async function getAreas() {
  const supabase = await createClient();
  
  // Fetch all areas from the database
  const { data: areas, error } = await supabase
    .from('areas')
    .select('*')
    .order('id');
  
  if (error) {
    console.error('Error fetching areas:', error);
    return { success: false, error: error.message };
  }
  
  return { success: true, data: areas };
}

// Save an area to the database (handles both insert and update)
export async function saveArea(area: any) {
  // First check if user has admin privileges
  await requireAdmin();
  
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('areas')
    .upsert(area, { onConflict: 'id' })
    .select();
  
  if (error) {
    console.error('Error saving area:', error);
    return { success: false, error: error.message };
  }
  
  return { success: true, data: data ? data[0] : null };
}

// Delete an area from the database
export async function deleteArea(id: number) {
  // First check if user has admin privileges
  await requireAdmin();
  
  const supabase = await createClient();
  
  // Delete the area
  const { error } = await supabase
    .from('areas')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error deleting area:', error);
    return { success: false, error: error.message };
  }
  
  return { success: true };
}

// Fetch adventures from the database
export async function getAdventures() {
  const supabase = await createClient();
  
  // Fetch all adventures from the database
  const { data: adventures, error } = await supabase
    .from('adventures')
    .select('*')
    .order('id');
  
  if (error) {
    console.error('Error fetching adventures:', error);
    return { success: false, error: error.message };
  }
  
  return { success: true, data: adventures };
}

// Save an adventure to the database (handles both insert and update)
export async function saveAdventure(adventure: any) {
  // First check if user has admin privileges
  await requireAdmin();
  
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('adventures')
    .upsert(adventure, { onConflict: 'id' })
    .select();
  
  if (error) {
    console.error('Error saving adventure:', error);
    return { success: false, error: error.message };
  }
  
  return { success: true, data: data ? data[0] : null };
}

// Delete an adventure from the database
export async function deleteAdventure(id: number) {
  // First check if user has admin privileges
  await requireAdmin();
  
  const supabase = await createClient();
  
  // Delete the adventure
  const { error } = await supabase
    .from('adventures')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error deleting adventure:', error);
    return { success: false, error: error.message };
  }
  
  return { success: true };
}

// Fetch monsters from the database
export async function getMonsters() {
  const supabase = await createClient();
  
  // Fetch all monsters from the database
  const { data: monsters, error } = await supabase
    .from('monsters')
    .select('*')
    .order('id');
  
  if (error) {
    console.error('Error fetching monsters:', error);
    return { success: false, error: error.message };
  }
  
  return { success: true, data: monsters };
}

// Save a monster to the database (handles both insert and update)
export async function saveMonster(monster: any) {
  // First check if user has admin privileges
  await requireAdmin();
  
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('monsters')
    .upsert(monster, { onConflict: 'id' })
    .select();
  
  if (error) {
    console.error('Error saving monster:', error);
    return { success: false, error: error.message };
  }
  
  return { success: true, data: data ? data[0] : null };
}

// Delete a monster from the database
export async function deleteMonster(id: number) {
  // First check if user has admin privileges
  await requireAdmin();
  
  const supabase = await createClient();
  
  // Delete the monster
  const { error } = await supabase
    .from('monsters')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error deleting monster:', error);
    return { success: false, error: error.message };
  }
  
  return { success: true };
}

// Fetch reward tables from the database
export async function getRewardTables() {
  const supabase = await createClient();
  
  // Fetch all reward tables and their items
  const { data: rewardTables, error } = await supabase
    .from('reward_tables')
    .select(`
      *,
      reward_items:reward_items(
        id,
        item_id,
        chance,
        items:item_id(name)
      )
    `)
    .order('id');
  
  if (error) {
    console.error('Error fetching reward tables:', error);
    return { success: false, error: error.message };
  }
  
  // Process the data to make it easier to work with
  const processedTables = rewardTables.map(table => ({
    ...table,
    items: (table.reward_items || []).map((item: any) => ({
      id: item.id,
      item_id: item.item_id,
      item_name: item.items?.name,
      chance: item.chance
    }))
  }));
  
  return { success: true, data: processedTables };
}

// Save a reward table to the database (handles both insert and update)
export async function saveRewardTable(rewardTable: any) {
  // First check if user has admin privileges
  await requireAdmin();
  
  const supabase = await createClient();
  
  try {
    // 1. Upsert the reward table record
    const tableData = {
      id: rewardTable.id,
      name: rewardTable.name,
      description: rewardTable.description,
      created_at: rewardTable.created_at || new Date().toISOString()
    };
    
    const { data: savedTable, error: tableError } = await supabase
      .from('reward_tables')
      .upsert(tableData, { onConflict: 'id' })
      .select();
    
    if (tableError) {
      throw tableError;
    }
    
    const tableId = savedTable[0].id;
    
    // 2. Handle reward items if they exist
    if (rewardTable.items && Array.isArray(rewardTable.items)) {
      // Delete all existing items for this table
      await supabase
        .from('reward_items')
        .delete()
        .eq('reward_table_id', tableId);
      
      // If there are items to add, insert them with sequential IDs
      if (rewardTable.items.length > 0) {
        const itemsToInsert = rewardTable.items.map((item: any, index: number) => ({
          id: index + 1, // Sequential IDs starting from 1
          reward_table_id: tableId,
          item_id: item.item_id,
          chance: item.chance,
          created_at: new Date().toISOString()
        }));
        
        const { error: itemsError } = await supabase
          .from('reward_items')
          .insert(itemsToInsert);
        
        if (itemsError) {
          throw itemsError;
        }
      }
    }
    
    return { success: true, data: savedTable[0] };
  } catch (error: any) {
    console.error('Error saving reward table:', error);
    return { success: false, error: error.message };
  }
}

// Delete a reward table from the database
export async function deleteRewardTable(id: number) {
  // First check if user has admin privileges
  await requireAdmin();
  
  const supabase = await createClient();
  
  try {
    // First delete all related reward items
    const { error: itemsError } = await supabase
      .from('reward_items')
      .delete()
      .eq('reward_table_id', id);
      
    if (itemsError) {
      throw itemsError;
    }
    
    // Then delete the reward table
    const { error: tableError } = await supabase
      .from('reward_tables')
      .delete()
      .eq('id', id);
      
    if (tableError) {
      throw tableError;
    }
    
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting reward table:', error);
    return { success: false, error: error.message };
  }
}

// Save a shop item to the database (handles both insert and update)
export async function saveShopItem(shopItem: any) {
  // First check if user has admin privileges
  await requireAdmin();
  
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('shop_items')
    .upsert(shopItem, { onConflict: 'id' })
    .select();
  
  if (error) {
    console.error('Error saving shop item:', error);
    return { success: false, error: error.message };
  }
  
  return { success: true, data: data ? data[0] : null };
}

// Delete a shop item from the database
export async function deleteShopItem(id: number) {
  // First check if user has admin privileges
  await requireAdmin();
  
  const supabase = await createClient();
  
  // Delete the shop item
  const { error } = await supabase
    .from('shop_items')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error deleting shop item:', error);
    return { success: false, error: error.message };
  }
  
  return { success: true };
}

// Fetch shop items from the database
export async function getShopItems() {
  const supabase = await createClient();
  
  // Fetch all shop items with related item and area details
  const { data: shopItems, error } = await supabase
    .from('shop_items')
    .select(`
      *,
      items:item_id(name),
      areas:area_id(name)
    `)
    .order('id');
  
  if (error) {
    console.error('Error fetching shop items:', error);
    return { success: false, error: error.message };
  }
  
  // Process the data to add item_name and area_name fields for display
  const processedItems = shopItems.map(item => ({
    ...item,
    item_name: item.items?.name,
    area_name: item.areas?.name
  }));
  
  return { success: true, data: processedItems };
}

// Save a world boss to the database (handles both insert and update)
export async function saveWorldBoss(worldBoss: any) {
  // First check if user has admin privileges
  await requireAdmin();
  
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('world_bosses')
    .upsert(worldBoss, { onConflict: 'id' })
    .select();
  
  if (error) {
    console.error('Error saving world boss:', error);
    return { success: false, error: error.message };
  }
  
  return { success: true, data: data ? data[0] : null };
}

// Delete a world boss from the database
export async function deleteWorldBoss(id: number) {
  // First check if user has admin privileges
  await requireAdmin();
  
  const supabase = await createClient();
  
  // Delete the world boss
  const { error } = await supabase
    .from('world_bosses')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error deleting world boss:', error);
    return { success: false, error: error.message };
  }
  
  return { success: true };
}

// Fetch world bosses from the database
export async function getWorldBosses() {
  const supabase = await createClient();
  
  // Fetch all world bosses from the database
  const { data: worldBosses, error } = await supabase
    .from('world_bosses')
    .select('*')
    .order('id');
  
  if (error) {
    console.error('Error fetching world bosses:', error);
    return { success: false, error: error.message };
  }
  
  return { success: true, data: worldBosses };
}
