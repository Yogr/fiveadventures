'use server';

import { createClient } from '@/lib/supabase/server';
import type { ApiResponse } from '@/lib/types';

// Update user sound and music settings
export async function updateUserSettings({
  userId,
  musicEnabled,
  soundEnabled
}: {
  userId: string;
  musicEnabled?: boolean;
  soundEnabled?: boolean;
}): Promise<ApiResponse<null>> {
  try {
    const supabase = await createClient();
    
    // Prepare update data based on what was provided
    const updateData: {
      music_enabled?: boolean;
      sound_enabled?: boolean;
    } = {};
    
    if (typeof musicEnabled !== 'undefined') {
      updateData.music_enabled = musicEnabled;
    }
    
    if (typeof soundEnabled !== 'undefined') {
      updateData.sound_enabled = soundEnabled;
    }
    
    // Only proceed if we have data to update
    if (Object.keys(updateData).length === 0) {
      return {
        success: true,
        data: null
      };
    }
    
    // Update user settings
    const { error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', userId);
    
    if (error) {
      console.error('Error updating user settings:', error);
      return {
        success: false,
        error: 'Failed to update user settings'
      };
    }
    
    return {
      success: true,
      data: null
    };
  } catch (err) {
    console.error('Unexpected error updating user settings:', err);
    return {
      success: false,
      error: 'An unexpected error occurred'
    };
  }
}

// Get user settings
export async function getUserSettings(
  userId: string
): Promise<ApiResponse<{ musicEnabled: boolean; soundEnabled: boolean }>> {
  try {
    const supabase = await createClient();
    
    // Get user settings
    const { data: user, error } = await supabase
      .from('users')
      .select('music_enabled, sound_enabled')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error('Error getting user settings:', error);
      return {
        success: false,
        error: 'Failed to get user settings'
      };
    }
    
    return {
      success: true,
      data: {
        musicEnabled: user.music_enabled || false,
        soundEnabled: user.sound_enabled || false
      }
    };
  } catch (err) {
    console.error('Unexpected error getting user settings:', err);
    return {
      success: false,
      error: 'An unexpected error occurred'
    };
  }
}
