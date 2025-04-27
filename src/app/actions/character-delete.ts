'use server';

import { createClient } from '@/lib/supabase/server';
import type { ApiResponse } from '@/lib/types';

/**
 * Delete a character using the new delete_character stored procedure
 */
export async function deleteCharacter(
  characterId: string
): Promise<ApiResponse<boolean>> {
  try {
    const supabase = await createClient();
    
    console.log('Deleting character with ID:', characterId);
    
    // Call the stored procedure
    const { error } = await supabase.rpc('delete_character', {
      character_id: characterId
    });
    
    if (error) {
      console.error('Error deleting character:', error);
      return {
        success: false,
        error: `Failed to delete character: ${error.message}`
      };
    }
    
    console.log('Character successfully deleted');
    return {
      success: true,
      data: true
    };
  } catch (err) {
    console.error('Unexpected error deleting character:', err);
    return {
      success: false,
      error: 'An unexpected error occurred while deleting the character'
    };
  }
}
