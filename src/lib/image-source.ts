import { createClient } from '@/lib/supabase/client';
import { uploadImageToSupabase } from '@/app/actions/image-actions';
import type { Monster, Item, Area, CharacterClass, Skill, WorldBoss } from '@/lib/types';

/**
 * Utility class for handling image paths and uploads for different game data types
 */
export class ImageSource {
  private static readonly SUPABASE_URL = 'https://ebmwfcmwnnbeyjxeadmj.supabase.co';
  private static readonly STORAGE_BUCKET = 'images';
  
  /**
   * Creates a full image URL for a specific type and filename
   */
  private static createImageUrl(type: string, filename: string): string {
    if (!filename) return '';
    return `${this.SUPABASE_URL}/storage/v1/object/public/${this.STORAGE_BUCKET}/${type}/${filename}.png`;
  }
  
  /**
   * Upload an image to Supabase storage (server-side)
   * Use this method from server components
   * @param file The file to upload
   * @param type The type of game data (enemy, weapon, area, etc.)
   * @param filename The filename to use (without extension)
   * @returns Promise resolving to the filename that was uploaded
   */
  static async uploadImage(file: File, type: string, filename: string): Promise<string> {
    return uploadImageToSupabase(file, type, filename);
  }
  
  /**
   * Upload an image to Supabase storage (client-side)
   * @param file The file to upload
   * @param type The type of game data (enemy, weapon, area, etc.)
   * @param filename The filename to use (without extension)
   * @returns Promise resolving to the filename that was uploaded
   */
  static async uploadImageClient(file: File, type: string, filename: string): Promise<string> {
    const supabase = createClient();
    const filePath = `${type}/${filename}.png`;
    
    const { data, error } = await supabase.storage
      .from(this.STORAGE_BUCKET)
      .upload(filePath, file, { 
        upsert: true,
        contentType: 'image/png'
      });
      
    if (error) throw error;
    
    return filename; // Return just the filename to store in DB
  }
  
  /**
   * Get image path for monsters
   */
  static getMonsterImagePath(monster: any): string {
    if (!monster || !monster.image_url) return '';
    return this.createImageUrl('enemy', monster.image_url);
  }
  
  /**
   * Get image path for items
   */
  static getItemImagePath(item: any): string {
    if (!item || !item.image_url) return '';
    
    // Items are stored in different folders based on type
    const itemType = item.type?.toLowerCase() || 'misc';
    return this.createImageUrl(itemType, item.image_url);
  }
  
  /**
   * Get image path for areas
   */
  static getAreaImagePath(area: Area | { image: string } | null | undefined): string {
    if (!area) return '';
    
    // Areas use 'image' property instead of 'image_url'
    const imageFilename = 'image' in area ? area.image : '';
    if (!imageFilename) return '';
    
    return this.createImageUrl('area', imageFilename);
  }
  
  /**
   * Get image path for character classes
   */
  static getCharacterImagePath(characterClass: any): string {
    if (!characterClass) return '';
    
    // If it's just a string (class name), use that directly
    if (typeof characterClass === 'string') {
      return this.createImageUrl('characters', characterClass.toLowerCase());
    }
    
    // Otherwise extract the class property if it exists
    if (typeof characterClass === 'object' && characterClass !== null) {
      // Check either class or character_class depending on the model
      const className = 
        'class' in characterClass ? characterClass.class : 
        'character_class' in characterClass ? characterClass.character_class : 
        '';
        
      if (className) {
        return this.createImageUrl('characters', String(className).toLowerCase());
      }
    }
    
    return '';
  }
  
  /**
   * Get image path for skills
   */
  static getSkillImagePath(skill: any): string {
    if (!skill || !skill.image_url) return '';
    return this.createImageUrl('skill', skill.image_url);
  }
  
  /**
   * Get image path for world bosses
   */
  static getBossImagePath(boss: any): string {
    if (!boss || !boss.image_url) return '';
    return this.createImageUrl('boss', boss.image_url);
  }
  
  /**
   * Get image path for adventures
   */
  static getAdventureImagePath(adventure: any): string {
    if (!adventure || !adventure.image_url) return '';
    return this.createImageUrl('adventure', adventure.image_url);
  }
}
