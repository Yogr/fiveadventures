'use server';

import { createClient } from '@/lib/supabase/server';

/**
 * Upload an image to Supabase storage (server-side)
 * @param file The file to upload
 * @param type The type of game data (enemy, weapon, area, etc.)
 * @param filename The filename to use (without extension)
 * @returns Promise resolving to the filename that was uploaded
 */
export async function uploadImageToSupabase(file: File, type: string, filename: string): Promise<string> {
  const STORAGE_BUCKET = 'images';
  const supabase = await createClient();
  const filePath = `${type}/${filename}.png`;
  
  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(filePath, file, { 
      upsert: true,
      contentType: 'image/png'
    });
    
  if (error) throw error;
  
  return filename; // Return just the filename to store in DB
}
