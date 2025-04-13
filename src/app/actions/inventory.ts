'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { getCharacterForUser, getCharacterById } from './character';

/**
 * Equip an item from the character's inventory
 */
export async function equipItem(inventoryItemId: string) {
  try {
    const supabase = await createClient();
    
    // Get the character using the secure getCharacterForUser function
    // This handles both authenticated and cookie-based character retrieval
    const characterResponse = await getCharacterForUser();
    
    if (!characterResponse.success || !characterResponse.data) {
      return { success: false, error: characterResponse.error || 'Character not found' };
    }
    
    const character = characterResponse.data;
    
    // Get the inventory item
    const { data: inventoryItem, error: inventoryError } = await supabase
      .from('character_inventory')
      .select('*, item:items(*)')
      .eq('id', inventoryItemId)
      .single();
    
    if (inventoryError || !inventoryItem) {
      return { success: false, error: 'Item not found' };
    }
    
    // Check if the inventory item belongs to the character
    if (inventoryItem.character_id !== character.id) {
      return { success: false, error: 'Item does not belong to this character' };
    }
    
    // Get the item type
    const itemType = inventoryItem.item.type;
    
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
    
    // Determine which equipment slot to update and check if there's an item already equipped
    let updateData: any = {};
    let currentlyEquippedItemId: number | null = null;
    
    switch (itemType) {
      case 'Weapon':
        updateData.weapon_id = inventoryItem.item_id;
        currentlyEquippedItemId = equipment.weapon_id;
        break;
      case 'Helmet':
        updateData.helmet_id = inventoryItem.item_id;
        currentlyEquippedItemId = equipment.helmet_id;
        break;
      case 'Armor':
        updateData.armor_id = inventoryItem.item_id;
        currentlyEquippedItemId = equipment.armor_id;
        break;
      case 'Trinket':
        updateData.trinket_id = inventoryItem.item_id;
        currentlyEquippedItemId = equipment.trinket_id;
        break;
      default:
        return { success: false, error: 'Invalid item type' };
    }
    
    // If there's an item already equipped, move it to inventory
    if (currentlyEquippedItemId) {
      const { error: addToInventoryError } = await supabase
        .from('character_inventory')
        .insert({
          character_id: character.id,
          item_id: currentlyEquippedItemId,
          quantity: 1,
          acquired_at: new Date().toISOString()
        });
      
      if (addToInventoryError) {
        console.error('Error adding previously equipped item to inventory:', addToInventoryError);
        return { success: false, error: 'Failed to swap equipment' };
      }
    }
    
    // Update equipment
    const { error: updateError } = await supabase
      .from('character_equipment')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('character_id', character.id);
    
    if (updateError) {
      console.error('Error updating equipment:', updateError);
      return { success: false, error: 'Failed to equip item' };
    }
    
    // Remove the item from inventory
    const { error: removeFromInventoryError } = await supabase
      .from('character_inventory')
      .delete()
      .eq('id', inventoryItemId);
    
    if (removeFromInventoryError) {
      console.error('Error removing item from inventory:', removeFromInventoryError);
      // This is not critical, so we don't return an error
    }
    
    // Get the updated character data with equipment and inventory
    const updatedCharacterResponse = await getCharacterById(character.id);
    
    if (!updatedCharacterResponse.success || !updatedCharacterResponse.data) {
      // If we can't get the updated character data, still return success
      // but without the updated data
      return { success: true };
    }
    
    // Return the updated character data
    return { 
      success: true,
      data: updatedCharacterResponse.data
    };
  } catch (error) {
    console.error('Error equipping item:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Unequip an item from the character's equipment
 */
export async function unequipItem(itemType: string) {
  try {
    const supabase = await createClient();
    
    // Get the character using the secure getCharacterForUser function
    // This handles both authenticated and cookie-based character retrieval
    const characterResponse = await getCharacterForUser();
    
    if (!characterResponse.success || !characterResponse.data) {
      return { success: false, error: characterResponse.error || 'Character not found' };
    }
    
    const character = characterResponse.data;
    
    // Check if the character has the item equipped
    const { data: equipment, error: equipmentError } = await supabase
      .from('character_equipment')
      .select('*')
      .eq('character_id', character.id)
      .single();
    
    if (equipmentError || !equipment) {
      return { success: false, error: 'Equipment not found' };
    }
    
    // Determine which equipment slot to update and get the item ID
    let updateData: any = {};
    let itemIdToUnequip: number | null = null;
    
    switch (itemType) {
      case 'Weapon':
        updateData.weapon_id = null;
        itemIdToUnequip = equipment.weapon_id;
        break;
      case 'Helmet':
        updateData.helmet_id = null;
        itemIdToUnequip = equipment.helmet_id;
        break;
      case 'Armor':
        updateData.armor_id = null;
        itemIdToUnequip = equipment.armor_id;
        break;
      case 'Trinket':
        updateData.trinket_id = null;
        itemIdToUnequip = equipment.trinket_id;
        break;
      default:
        return { success: false, error: 'Invalid item type' };
    }
    
    // Check if there's an item to unequip
    if (!itemIdToUnequip) {
      return { success: false, error: 'No item equipped in this slot' };
    }
    
    // Add the unequipped item to inventory
    const { error: addToInventoryError } = await supabase
      .from('character_inventory')
      .insert({
        character_id: character.id,
        item_id: itemIdToUnequip,
        quantity: 1,
        acquired_at: new Date().toISOString()
      });
    
    if (addToInventoryError) {
      console.error('Error adding unequipped item to inventory:', addToInventoryError);
      return { success: false, error: 'Failed to unequip item' };
    }
    
    // Update equipment
    const { error: updateError } = await supabase
      .from('character_equipment')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('character_id', character.id);
    
    if (updateError) {
      console.error('Error updating equipment:', updateError);
      return { success: false, error: 'Failed to unequip item' };
    }
    
    // Get the updated character data with equipment and inventory
    const updatedCharacterResponse = await getCharacterById(character.id);
    
    if (!updatedCharacterResponse.success || !updatedCharacterResponse.data) {
      // If we can't get the updated character data, still return success
      // but without the updated data
      return { success: true };
    }
    
    // Return the updated character data
    return { 
      success: true,
      data: updatedCharacterResponse.data
    };
  } catch (error) {
    console.error('Error unequipping item:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}
