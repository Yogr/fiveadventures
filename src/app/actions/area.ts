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

  const { error } = await supabase
    .from('character_selected_area')
    .insert({
      character_id: characterId,
      area_id: areaId,
      day: currentDay
    })

  if (error) {
    console.error('Error selecting area:', error);
    return {
      success: false,
      error: 'Failed to select area'
    }
  }

  return {
    success: true
  }

}
