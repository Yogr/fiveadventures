import { redirect } from 'next/navigation';
import { getCharacterFromCookie } from '@/app/actions/character';
import { ROUTES } from '@/lib/constants';
import AdventureContent from '@/app/adventure/adventure-content';
import GameNavigation from '@/components/navigation/game-navigation';
import { getCurrentGameDay } from '@/lib/utils';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AdventurePage() {
  // Check if user has a character
  const characterResponse = await getCharacterFromCookie();
  
  if (!characterResponse.success || !characterResponse.data) {
    // Redirect to character creation if no character found
    redirect(ROUTES.CHARACTER_CREATE);
  }
  
  const character = characterResponse.data;
  const currentDay = getCurrentGameDay();
  
  return (
    <div className="min-h-screen p-4">
      <div className="w-full max-w-lg mx-auto">
        <GameNavigation activeTab="adventure" currentDay={currentDay} />
        <AdventureContent characterId={character.id} />
      </div>
    </div>
  );
}
