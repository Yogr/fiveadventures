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
  let result;
  
  // Start a transaction to ensure all operations succeed or fail together
  try {
    // Check if reward table has an id - if yes, update, if no, insert
    if (rewardTable.id && typeof rewardTable.id === 'number' && rewardTable.id < 1000000) {
      // Update existing reward table
      result = await supabase
        .from('reward_tables')
        .update({
          name: rewardTable.name,
          description: rewardTable.description
        })
        .eq('id', rewardTable.id)
        .select();
        
      // If we have items to update, handle them
      if (rewardTable.items && Array.isArray(rewardTable.items)) {
        // First, remove all existing items that aren't in the new list
        const itemIds = rewardTable.items.map((item: any) => 
          typeof item.id === 'number' && item.id < 1000000 ? item.id : null
        ).filter(Boolean);
        
        // Delete items that are no longer present (if any existing IDs were provided)
        if (itemIds.length > 0) {
          await supabase
            .from('reward_items')
            .delete()
            .eq('reward_table_id', rewardTable.id)
            .not('id', 'in', `(${itemIds.join(',')})`);
        } else {
          // If no existing IDs were provided, delete all items for this table
          await supabase
            .from('reward_items')
            .delete()
            .eq('reward_table_id', rewardTable.id);
        }
        
        // Now upsert all items
        for (const item of rewardTable.items) {
          if (item.id && typeof item.id === 'number' && item.id < 1000000) {
            // Update existing item
            await supabase
              .from('reward_items')
              .update({
                item_id: item.item_id,
                chance: item.chance
              })
              .eq('id', item.id)
              .eq('reward_table_id', rewardTable.id);
          } else {
            // Get the next available ID for the new reward item
            const { data: maxIdData } = await supabase
              .from('reward_items')
              .select('id')
              .eq('reward_table_id', rewardTable.id)
              .order('id', { ascending: false })
              .limit(1);
              
            // Determine the next ID (default to 1 if no existing items)
            const nextId = (maxIdData && maxIdData.length > 0 && maxIdData[0] && maxIdData[0].id) ? 
              maxIdData[0].id + 1 : 1;
            
            // Insert new item
            await supabase
              .from('reward_items')
              .insert({
                id: nextId,
                reward_table_id: rewardTable.id,
                item_id: item.item_id,
                chance: item.chance,
                created_at: new Date().toISOString()
              });
          }
        }
      }
    } else {
      // Insert new reward table
      result = await supabase
        .from('reward_tables')
        .insert({
          name: rewardTable.name,
          description: rewardTable.description,
          created_at: new Date().toISOString()
        })
        .select();
        
      // If we have a successful insert and items to add
      if (result.data && result.data.length > 0 && rewardTable.items && Array.isArray(rewardTable.items)) {
        const newTableId = result.data[0].id;
        
        // Add all items to the new table
        for (let i = 0; i < rewardTable.items.length; i++) {
          const item = rewardTable.items[i];
          await supabase
            .from('reward_items')
            .insert({
              id: i + 1, // Start IDs at 1
              reward_table_id: newTableId,
              item_id: item.item_id,
              chance: item.chance,
              created_at: new Date().toISOString()
            });
        }
      }
    }
    
    const { error, data } = result;
    
    if (error) {
      throw error;
    }
    
    return { success: true, data: data ? data[0] : null };
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
