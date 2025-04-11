'use server';

import { cookies } from 'next/headers';
import { COOKIE_NAMES } from '@/lib/constants';

/**
 * Get the character ID from the cookie
 * This is a server-side function that can be used in server components
 */
export async function getCharacterIdFromCookie(): Promise<string | undefined> {
  try {
    const cookieStore = cookies();
    return cookieStore.get(COOKIE_NAMES.CHARACTER_ID)?.value;
  } catch (error) {
    console.error('Error getting character ID from cookie:', error);
    return undefined;
  }
}
