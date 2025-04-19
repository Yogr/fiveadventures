import { getCharacterForUser } from '@/app/actions/character';
import { getCurrentWorldBoss, getCharacterBossProgress, getPendingRewards, checkWeeklyReset } from '@/app/actions/worldboss';
import WorldBossContainer from '@/components/worldboss/world-boss-container';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

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
  
  // Get pending rewards
  const rewardsResponse = await getPendingRewards(character.id);
  const pendingRewards = rewardsResponse.success ? rewardsResponse.data || [] : [];
  
  return (
    <div className="bg-amber-950 bg-opacity-90 p-4 rounded-lg border-2 border-amber-800 border-t-amber-700 border-l-amber-700">
      <h2 className="text-xl sm:text-2xl font-bold mb-4 text-center text-amber-300">World Boss</h2>
      
      <WorldBossContainer
        initialBoss={worldBoss}
        initialProgress={progress}
        character={character}
        pendingRewards={pendingRewards}
      />
    </div>
  );
}
