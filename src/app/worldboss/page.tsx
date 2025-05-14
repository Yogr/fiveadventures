import { getCharacterForUser } from '@/app/actions/character';
import { getCurrentWorldBoss, getCharacterBossProgress, calculatePendingRewards, checkWeeklyReset, getTotalAttackers } from '@/app/actions/worldboss';
import { getRewardTables, getItems } from '@/app/actions/data-editor';
import WorldBossContainer from '@/components/worldboss/world-boss-container';
import type { Item } from '@/lib/types';
import { getCurrentGameDay, getCurrentGameWeek } from '@/lib/utils';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Function to calculate days remaining in the current week
function getDaysRemainingInWeek(): number {
  const currentDay = getCurrentGameDay();
  // Calculate the first day of the current week
  const currentWeekStartDay = (getCurrentGameWeek() - 1) * 7 + 1;
  // Calculate the first day of the next week
  const nextWeekStartDay = currentWeekStartDay + 7;
  // Return the difference
  return nextWeekStartDay - currentDay;
}

export default async function WorldBossPage() {
  // Check for weekly reset (if it's a new week, process rewards and create new boss)
  await checkWeeklyReset();
  
  // Get character from layout
  const characterResponse = await getCharacterForUser();
  
  if (!characterResponse.success || !characterResponse.data) {
    return (
      <div className="bg-amber-950 bg-opacity-90 p-4 rounded-lg border-2 border-amber-800 border-t-amber-700 border-l-amber-700">
        <h2 className="text-xl sm:text-2xl font-bold mb-4 text-center text-amber-300">World Boss</h2>
        <p className="text-amber-200 text-center">Character not found. Please create a character first.</p>
      </div>
    );
  }
  
  const character = characterResponse.data;
  
  // Get the current world boss
  const worldBossResponse = await getCurrentWorldBoss();
  
  if (!worldBossResponse.success || !worldBossResponse.data) {
    return (
      <div className="bg-amber-950 bg-opacity-90 p-4 rounded-lg border-2 border-amber-800 border-t-amber-700 border-l-amber-700">
        <h2 className="text-xl sm:text-2xl font-bold mb-4 text-center text-amber-300">World Boss</h2>
        <p className="text-amber-200 text-center">Unable to load world boss data. Please try again later.</p>
      </div>
    );
  }
  
  const worldBoss = worldBossResponse.data;
  
  // Get character's progress for this boss
  const progressResponse = await getCharacterBossProgress(character.id);
  
  if (!progressResponse.success || !progressResponse.data) {
    return (
      <div className="bg-amber-950 bg-opacity-90 p-4 rounded-lg border-2 border-amber-800 border-t-amber-700 border-l-amber-700">
        <h2 className="text-xl sm:text-2xl font-bold mb-4 text-center text-amber-300">World Boss</h2>
        <p className="text-amber-200 text-center">Unable to load your progress. Please try again later.</p>
      </div>
    );
  }
  
  const progress = progressResponse.data;
  
  // Get total number of adventurers who have attacked
  const totalAttackersResponse = await getTotalAttackers();
  const totalAttackers = totalAttackersResponse.success ? (totalAttackersResponse.data || 0) : 0;
  
  // Calculate days remaining in the current week
  const daysRemaining = getDaysRemainingInWeek();
  
  // Calculate and process any pending rewards
  const rewardsResponse = await calculatePendingRewards(character.id);
  const claimedRewards = rewardsResponse.success ? rewardsResponse.data || [] : [];
  
  // Fetch reward tables data
  const rewardTablesResponse = await getRewardTables();
  const rewardTables = rewardTablesResponse.success ? rewardTablesResponse.data || [] : [];
  
  // Find the reward tables for this boss
  const legendaryTable = rewardTables.find((table: any) => table.id === worldBoss.legendary_reward_table);
  const challengerTable = rewardTables.find((table: any) => table.id === worldBoss.challenger_reward_table);
  const basicTable = rewardTables.find((table: any) => table.id === worldBoss.basic_reward_table);
  
  // Fetch all items to get full item details
  const itemsResponse = await getItems();
  const allItems = itemsResponse.success ? itemsResponse.data || [] : [];
  
  // Extract items from the reward tables
  const legendaryItems: Item[] = [];
  const challengerItems: Item[] = [];
  const basicItems: Item[] = [];
  
  // Process legendary items
  if (legendaryTable?.items) {
    for (const rewardItem of legendaryTable.items) {
      // Find the full item details
      const fullItem = allItems.find((item: any) => item.id === rewardItem.item_id);
      
      if (fullItem) {
        // Use the full item details
        legendaryItems.push({
          ...fullItem,
          rarity: 'Legendary' // Override rarity for legendary rewards
        });
      }
    }
  }
  
  // Process challenger items
  if (challengerTable?.items) {
    for (const rewardItem of challengerTable.items) {
      // Find the full item details
      const fullItem = allItems.find((item: any) => item.id === rewardItem.item_id);
      
      if (fullItem) {
        // Use the full item details
        challengerItems.push({
          ...fullItem,
          rarity: 'Epic' // Override rarity for challenger rewards
        });
      }
    }
  }
  
  // Process basic items
  if (basicTable?.items) {
    for (const rewardItem of basicTable.items) {
      // Find the full item details
      const fullItem = allItems.find((item: any) => item.id === rewardItem.item_id);
      
      if (fullItem) {
        // Use the full item details
        basicItems.push({
          ...fullItem,
          rarity: 'Rare' // Override rarity for basic rewards
        });
      }
    }
  }
  
  return (
    <div className="bg-amber-950 bg-opacity-90 p-4 rounded-lg border-2 border-amber-800 border-t-amber-700 border-l-amber-700">
      <h2 className="text-xl sm:text-2xl font-bold mb-4 text-center text-amber-300">World Boss</h2>
      
      <WorldBossContainer
        initialBoss={worldBoss}
        initialProgress={progress}
        character={character}
        claimedRewards={claimedRewards}
        legendaryItems={legendaryItems}
        challengerItems={challengerItems}
        basicItems={basicItems}
        totalAdventurers={totalAttackers}
        daysRemaining={daysRemaining}
      />
    </div>
  );
}
