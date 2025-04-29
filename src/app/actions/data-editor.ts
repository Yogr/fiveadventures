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
  let result;
  
  // Check if item has an id - if yes, update, if no, insert
  if (item.id && typeof item.id === 'number') {
    // Update existing item
    result = await supabase
      .from('items')
      .update({
        name: item.name,
        type: item.type,
        rarity: item.rarity,
        weapon_type: item.weapon_type,
        base_damage: item.base_damage,
        base_defense: item.base_defense,
        effects: item.effects,
        value: item.value,
        image_url: item.image_url,
        updated_at: new Date().toISOString()
      })
      .eq('id', item.id);
  } else {
    // Insert new item
    result = await supabase
      .from('items')
      .insert({
        name: item.name,
        type: item.type,
        rarity: item.rarity,
        weapon_type: item.weapon_type,
        base_damage: item.base_damage,
        base_defense: item.base_defense,
        effects: item.effects,
        value: item.value,
        image_url: item.image_url,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select();
  }
  
  const { error, data } = result;
  
  if (error) {
    console.error('Error saving item:', error);
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
    items: table.reward_items.map((item: any) => ({
      id: item.id,
      item_id: item.item_id,
      item_name: item.items?.name,
      chance: item.chance
    }))
  }));
  
  return { success: true, data: processedTables };
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
