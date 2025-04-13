'use server';

import { createClient } from '@/lib/supabase/server';
import type { ApiResponse, Item } from '@/lib/types';
import { getCharacterForUser } from './character';
import { revalidatePath } from 'next/cache';

// Equip an item from inventory
export async function equipItem(inventoryItemId: string): Promise<ApiResponse<{ message: string; item: Item }>> {
  try {
    const supabase = await createClient();

    // Get character from cookie
    const characterResponse = await getCharacterForUser();
    if (!characterResponse.success || !characterResponse.data) {
      return { success: false, error: 'Character not found' };
    }
    
    const character = characterResponse.data;
    
    // Get inventory item and associated item details
    const { data: inventoryItem, error: inventoryItemError } = await supabase
      .from('character_inventory')
      .select('*, item:item_id(*)')
      .eq('id', inventoryItemId)
      .eq('character_id', character.id)
      .single();
    
    if (inventoryItemError || !inventoryItem) {
      console.error('Error fetching inventory item:', inventoryItemError);
      return { success: false, error: 'Item not found in inventory' };
    }
    
    // Determine the slot based on item type
    let slotField: string | null = null;
    
    switch (inventoryItem.item.type) {
      case 'Weapon':
        slotField = 'weapon_id';
        break;
      case 'Helmet':
        slotField = 'helmet_id';
        break;
      case 'Armor':
        slotField = 'armor_id';
        break;
      case 'Trinket':
        slotField = 'trinket_id';
        break;
      default:
        return { success: false, error: 'Invalid item type' };
    }
    
    // Get current equipment
    const { data: equipment, error: equipmentError } = await supabase
      .from('character_equipment')
      .select('*')
      .eq('character_id', character.id)
      .single();
    
    if (equipmentError) {
      console.error('Error fetching equipment:', equipmentError);
      return { success: false, error: 'Failed to fetch equipment' };
    }
    
    // Check if there's already an item in that slot
    const currentItemId = equipment[slotField];
    
    // Begin transaction
    // 1. Update equipment with new item
    const { error: updateEquipmentError } = await supabase
      .from('character_equipment')
      .update({ [slotField]: inventoryItem.item_id })
      .eq('character_id', character.id);
    
    if (updateEquipmentError) {
      console.error('Error updating equipment:', updateEquipmentError);
      return { success: false, error: 'Failed to equip item' };
    }
    
    // 2. Remove the item from inventory
    const { error: removeInventoryError } = await supabase
      .from('character_inventory')
      .delete()
      .eq('id', inventoryItemId);
    
    if (removeInventoryError) {
      console.error('Error removing item from inventory:', removeInventoryError);
      // Rollback equipment update
      await supabase
        .from('character_equipment')
        .update({ [slotField]: currentItemId })
        .eq('character_id', character.id);
      return { success: false, error: 'Failed to update inventory' };
    }
    
    // 3. If there was an item in that slot, add it to inventory
    if (currentItemId) {
      const { error: addInventoryError } = await supabase
        .from('character_inventory')
        .insert({
          character_id: character.id,
          item_id: currentItemId,
          quantity: 1,
          acquired_at: new Date().toISOString()
        });
      
      if (addInventoryError) {
        console.error('Error adding previous item to inventory:', addInventoryError);
        // This is not critical, so we don't need to rollback
      }
    }
    
    // Revalidate paths to update UI
    revalidatePath('/adventure');
    revalidatePath('/shop');
    
    return { 
      success: true, 
      data: { 
        message: `Successfully equipped ${inventoryItem.item.name}`,
        item: inventoryItem.item
      } 
    };
  } catch (err) {
    console.error('Error in equipItem:', err);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

// Unequip an item from equipment
export async function unequipItem(slotName: string): Promise<ApiResponse<{ message: string }>> {
  try {
    const supabase = await createClient();

    // Get character from cookie
    const characterResponse = await getCharacterForUser();
    if (!characterResponse.success || !characterResponse.data) {
      return { success: false, error: 'Character not found' };
    }
    
    const character = characterResponse.data;
    
    // Map slot name to field name
    let slotField: string | null = null;
    let slotItemName: string | null = null;
    
    switch (slotName.toLowerCase()) {
      case 'weapon':
        slotField = 'weapon_id';
        slotItemName = character.equipment?.weapon?.name || 'Weapon';
        break;
      case 'helmet':
        slotField = 'helmet_id';
        slotItemName = character.equipment?.helmet?.name || 'Helmet';
        break;
      case 'armor':
        slotField = 'armor_id';
        slotItemName = character.equipment?.armor?.name || 'Armor';
        break;
      case 'trinket':
        slotField = 'trinket_id';
        slotItemName = character.equipment?.trinket?.name || 'Trinket';
        break;
      default:
        return { success: false, error: 'Invalid equipment slot' };
    }
    
    // Get current equipment
    const { data: equipment, error: equipmentError } = await supabase
      .from('character_equipment')
      .select('*')
      .eq('character_id', character.id)
      .single();
    
    if (equipmentError) {
      console.error('Error fetching equipment:', equipmentError);
      return { success: false, error: 'Failed to fetch equipment' };
    }
    
    // Check if there's an item in that slot
    const currentItemId = equipment[slotField];
    
    if (!currentItemId) {
      return { success: false, error: 'No item equipped in that slot' };
    }
    
    // Begin transaction
    // 1. Add the item to inventory
    const { error: addInventoryError } = await supabase
      .from('character_inventory')
      .insert({
        character_id: character.id,
        item_id: currentItemId,
        quantity: 1,
        acquired_at: new Date().toISOString()
      });
    
    if (addInventoryError) {
      console.error('Error adding item to inventory:', addInventoryError);
      return { success: false, error: 'Failed to add item to inventory' };
    }
    
    // 2. Remove the item from equipment
    const { error: updateEquipmentError } = await supabase
      .from('character_equipment')
      .update({ [slotField]: null })
      .eq('character_id', character.id);
    
    if (updateEquipmentError) {
      console.error('Error updating equipment:', updateEquipmentError);
      // Rollback inventory addition
      await supabase
        .from('character_inventory')
        .delete()
        .eq('character_id', character.id)
        .eq('item_id', currentItemId)
        .order('acquired_at', { ascending: false })
        .limit(1);
      return { success: false, error: 'Failed to unequip item' };
    }
    
    // Revalidate paths to update UI
    revalidatePath('/adventure');
    revalidatePath('/shop');
    
    return { 
      success: true, 
      data: { 
        message: `Successfully unequipped ${slotItemName}`
      } 
    };
  } catch (err) {
    console.error('Error in unequipItem:', err);
    return { success: false, error: 'An unexpected error occurred' };
  }
}
