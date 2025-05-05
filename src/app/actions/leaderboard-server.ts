'use server';

import { createClient } from '@/lib/supabase/server';
import type { ApiResponse, CharacterClass } from '@/lib/types';
import type { PaginatedLeaderboard } from './leaderboard';
import { 
  getLevelLeaderboard, 
  getLevelLeaderboardByClass,
  getWealthLeaderboard,
  getPowerLeaderboard,
  getPowerLeaderboardByClass,
  getAdventuresLeaderboard,
  getAdventuresLeaderboardByClass,
  getBossesSlainLeaderboard,
  getHighestBossDamageLeaderboard
} from './leaderboard';

/**
 * Server wrapper for getLevelLeaderboard
 * This creates the Supabase client before passing it to the cached function
 */
export async function fetchLevelLeaderboard(
  page: number = 1,
  pageSize: number = 10,
  playerCharacterId?: string
): Promise<ApiResponse<PaginatedLeaderboard>> {
  const supabase = await createClient();
  return getLevelLeaderboard(page, pageSize, playerCharacterId, supabase);
}

/**
 * Server wrapper for getLevelLeaderboardByClass
 */
export async function fetchLevelLeaderboardByClass(
  characterClass: CharacterClass,
  page: number = 1,
  pageSize: number = 10,
  playerCharacterId?: string
): Promise<ApiResponse<PaginatedLeaderboard>> {
  const supabase = await createClient();
  return getLevelLeaderboardByClass(characterClass, page, pageSize, playerCharacterId, supabase);
}

/**
 * Server wrapper for getWealthLeaderboard
 */
export async function fetchWealthLeaderboard(
  page: number = 1,
  pageSize: number = 10,
  playerCharacterId?: string
): Promise<ApiResponse<PaginatedLeaderboard>> {
  const supabase = await createClient();
  return getWealthLeaderboard(page, pageSize, playerCharacterId, supabase);
}

/**
 * Server wrapper for getPowerLeaderboard
 */
export async function fetchPowerLeaderboard(
  page: number = 1,
  pageSize: number = 10,
  playerCharacterId?: string
): Promise<ApiResponse<PaginatedLeaderboard>> {
  const supabase = await createClient();
  return getPowerLeaderboard(page, pageSize, playerCharacterId, supabase);
}

/**
 * Server wrapper for getPowerLeaderboardByClass
 */
export async function fetchPowerLeaderboardByClass(
  characterClass: CharacterClass,
  page: number = 1,
  pageSize: number = 10,
  playerCharacterId?: string
): Promise<ApiResponse<PaginatedLeaderboard>> {
  const supabase = await createClient();
  return getPowerLeaderboardByClass(characterClass, page, pageSize, playerCharacterId, supabase);
}

/**
 * Server wrapper for getAdventuresLeaderboard
 */
export async function fetchAdventuresLeaderboard(
  page: number = 1,
  pageSize: number = 10,
  playerCharacterId?: string
): Promise<ApiResponse<PaginatedLeaderboard>> {
  const supabase = await createClient();
  return getAdventuresLeaderboard(page, pageSize, playerCharacterId, supabase);
}

/**
 * Server wrapper for getAdventuresLeaderboardByClass
 */
export async function fetchAdventuresLeaderboardByClass(
  characterClass: CharacterClass,
  page: number = 1,
  pageSize: number = 10,
  playerCharacterId?: string
): Promise<ApiResponse<PaginatedLeaderboard>> {
  const supabase = await createClient();
  return getAdventuresLeaderboardByClass(characterClass, page, pageSize, playerCharacterId, supabase);
}

/**
 * Server wrapper for getBossesSlainLeaderboard
 */
export async function fetchBossesSlainLeaderboard(
  page: number = 1,
  pageSize: number = 10,
  playerCharacterId?: string
): Promise<ApiResponse<PaginatedLeaderboard>> {
  const supabase = await createClient();
  return getBossesSlainLeaderboard(page, pageSize, supabase, playerCharacterId);
}

/**
 * Server wrapper for getHighestBossDamageLeaderboard
 */
export async function fetchHighestBossDamageLeaderboard(
  page: number = 1,
  pageSize: number = 10,
  playerCharacterId?: string
): Promise<ApiResponse<PaginatedLeaderboard>> {
  const supabase = await createClient();
  return getHighestBossDamageLeaderboard(page, pageSize, supabase, playerCharacterId);
}
