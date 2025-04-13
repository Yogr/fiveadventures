'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import type { Database } from '@/lib/database-types';

/**
 * Equip an item from the character's inventory
 */
export async function equipItem(inventoryItemId: string) {
  try {
    const supabase = await createClient();
    
    // Get the current user
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      return { success: false, error: 'Authentication required' };
    }
    
    const user = session.user;
    
    if (!user) {
      return { success: false, error: 'Authentication required' };
    }
    
    // Get the inventory item
    const { data: inventoryItem, error: inventoryError } = await supabase
      .from('character_inventory')
      .select('*, item:items(*)')
      .eq('id', inventoryItemId)
      .single();
    
    if (inventoryError || !inventoryItem) {
      return { success: false, error: 'Item not found' };
    }
    
    // Get the character
    const { data: character, error: characterError } = await supabase
      .from('characters')
      .select('*')
      .eq('user_id', user.id)
      .single();
    
    if (characterError || !character) {
      return { success: false, error: 'Character not found' };
    }
    
    // Check if the inventory item belongs to the character
    if (inventoryItem.character_id !== character.id) {
      return { success: false, error: 'Item does not belong to this character' };
    }
    
    // Get the item type
    const itemType = inventoryItem.item.type;
    
    // Start a transaction
    const { data: transaction, error: transactionError } = await supabase.rpc('equip_item', {
      p_inventory_item_id: inventoryItemId,
      p_character_id: character.id,
      p_item_type: itemType
    });
    
    if (transactionError) {
      console.error('Transaction error:', transactionError);
      return { success: false, error: 'Failed to equip item' };
    }
    
    // Revalidate the character page to reflect the changes
    revalidatePath('/character');
    revalidatePath('/adventure');
    revalidatePath('/shop');
    revalidatePath('/worldboss');
    
    return { success: true };
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
    
    // Get the current user
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      return { success: false, error: 'Authentication required' };
    }
    
    const user = session.user;
    
    if (!user) {
      return { success: false, error: 'Authentication required' };
    }
    
    // Get the character
    const { data: character, error: characterError } = await supabase
      .from('characters')
      .select('*')
      .eq('user_id', user.id)
      .single();
    
    if (characterError || !character) {
      return { success: false, error: 'Character not found' };
    }
    
    // Start a transaction
    const { data: transaction, error: transactionError } = await supabase.rpc('unequip_item', {
      p_character_id: character.id,
      p_item_type: itemType
    });
    
    if (transactionError) {
      console.error('Transaction error:', transactionError);
      return { success: false, error: 'Failed to unequip item' };
    }
    
    // Revalidate the character page to reflect the changes
    revalidatePath('/character');
    revalidatePath('/adventure');
    revalidatePath('/shop');
    revalidatePath('/worldboss');
    
    return { success: true };
  } catch (error) {
    console.error('Error unequipping item:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}
