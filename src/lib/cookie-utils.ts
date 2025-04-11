'use server';

import { cookies } from 'next/headers';

export async function getCookie(name: string): Promise<string | undefined> {
  try {
    return cookies().get(name)?.value;
  } catch (error) {
    console.error(`Error getting cookie ${name}:`, error);
    return undefined;
  }
}

export async function setCookie(
  name: string, 
  value: string, 
  options?: {
    maxAge?: number;
    path?: string;
    httpOnly?: boolean;
    sameSite?: 'strict' | 'lax' | 'none';
  }
): Promise<void> {
  try {
    cookies().set(name, value, options);
  } catch (error) {
    console.error(`Error setting cookie ${name}:`, error);
  }
}
