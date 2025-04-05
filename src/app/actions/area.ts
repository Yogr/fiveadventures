'use server';

import { supabase } from '@/lib/supabase';
import { unstable_cache } from 'next/cache';
import type { Area } from '@/lib/types-updated';
import areasData from '../../../data/areas.json';

// Module-level variable to store selected areas
// This will be reset when the server restarts
const selectedAreasMap = new Map<string, number>();

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

// Get selected area for a character
export async function getSelectedArea(characterId: string) {
  try {
    // For now, since we're still developing and the database schema hasn't been updated yet,
    // we'll simulate the area selection by storing it in memory
    // In a real implementation, this would be stored in the database
    
    // Get all areas
    const areas = await getCachedAreas();
    if (!areas.success || !areas.data) {
      return {
        success: false,
        error: 'Failed to get areas'
      };
    }
    
    // Check if the character has selected an area
    const selectedAreaId = selectedAreasMap.get(characterId);
    
    if (selectedAreaId) {
      // Find the area in the areas list
      const selectedArea = areas.data.find(area => area.id === selectedAreaId);
      
      if (selectedArea) {
        return {
          success: true,
          data: {
            areaId: selectedAreaId,
            area: selectedArea,
            hasSelected: true
          }
        };
      }
    }
    
    // If no area is selected, return hasSelected: false
    return {
      success: true,
      data: {
        areaId: null,
        area: null,
        hasSelected: false
      }
    };
  } catch (error) {
    console.error('Error getting selected area:', error);
    return {
      success: false,
      error: 'Failed to get selected area'
    };
  }
}

// Select an area for a character
export async function selectArea(characterId: string, areaId: number) {
  try {
    // Get the selected area
    const areas = await getCachedAreas();
    if (!areas.success || !areas.data) {
      return {
        success: false,
        error: 'Failed to get areas'
      };
    }
    
    const selectedArea = areas.data.find(area => area.id === areaId);
    if (!selectedArea) {
      return {
        success: false,
        error: 'Area not found'
      };
    }
    
    // In a production implementation, we would store the selected area in the database
    // For now, we'll just return the selected area
    
    // Store the selected area in memory for this session
    // This is a temporary solution until we implement the database table
    // We'll use a module-level variable to store the selected areas
    // This will be reset when the server restarts
    selectedAreasMap.set(characterId, areaId);
    
    return {
      success: true,
      data: {
        areaId,
        area: selectedArea,
        hasSelected: true
      }
    };
  } catch (error) {
    console.error('Error selecting area:', error);
    return {
      success: false,
      error: 'Failed to select area'
    };
  }
}
