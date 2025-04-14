'use server';

import { unstable_cache } from 'next/cache';
import type { Area } from '@/lib/types';
import areasData from '../../../data/areas.json';
import { createClient } from '@/lib/supabase/server';
import { getCurrentGameDay } from '@/lib/utils';

// Get all areas
export async function getAreas() {
  try {
    // Return areas from the JSON file
    return {
      success: true,
      data: areasData as Area[]
    };
  } catch (error) {
    console.error('Error getting areas:', error);
    return {
      success: false,
      error: 'Failed to get areas'
    };
  }
}

// Get cached areas
export const getCachedAreas = unstable_cache(
  async () => {
    const result = await getAreas();
    return result;
  },
  ['areas'],
  { revalidate: 86400 } // Cache for 24 hours
);

export async function getSelectedArea(characterId: string, day: number) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('character_selected_area')
    .select('area_id')
    .eq('character_id', characterId)
    .eq('day', day)
    .single();

  // If the error is PGRST116 (no rows found), it means the character hasn't selected an area yet
  // This is not a real error, just a normal case we need to handle
  if (error && error.code === 'PGRST116') {
    console.log('No selected area yet for character:', characterId, 'day:', day);
    return {
      success: false,
      data: null
    };
  }

  if (error || !data) {
    console.error('Error getting selected area:', error);
    return {
      success: false,
      error: 'Failed to get selected area'
    };
  }

  return {
    success: true,
    data: data.area_id
  };
}

export async function selectArea(characterId: string, areaId: number) {
  const supabase = await createClient();
  const currentDay = getCurrentGameDay();

  // First check if the character already has a selected area row
  const { data: existingArea, error: checkError } = await supabase
    .from('character_selected_area')
    .select('area_id, day')
    .eq('character_id', characterId)
    .single();

  if (checkError && checkError.code !== 'PGRST116') {
    // Real error, not just "no rows found"
    console.error('Error checking existing area:', checkError);
    return {
      success: false,
      error: 'Failed to check existing area'
    };
  }

  // If area already exists, update it instead of inserting
  if (existingArea) {
    if (existingArea.day !== currentDay) {
      // If the day is different, we can update the area
      const { error: updateError } = await supabase
        .from('character_selected_area')
        .update({
          area_id: areaId,
          day: currentDay
        })
        .eq('character_id', characterId);
      if (updateError) {
        console.error('Error updating area:', updateError);
        return {
          success: false,
          error: 'Failed to update area'
        };
      }
      console.log('Area updated successfully for character:', characterId, 'to area:', areaId);
    } else {
      // If the day is the same, we can just return failure because user can't select a new area today
      return {
        success: false,
        message: 'Area already selected for today'
      };
    }

  } else {
    // No existing area, insert a new one
    const { error: insertError } = await supabase
      .from('character_selected_area')
      .insert({
        character_id: characterId,
        area_id: areaId,
        day: currentDay
      });

    if (insertError) {
      console.error('Error inserting area:', insertError);
      return {
        success: false,
        error: 'Failed to insert area'
      };
    }
  }

  return {
    success: true
  };
}
