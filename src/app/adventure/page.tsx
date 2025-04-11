import { redirect } from 'next/navigation';
import { getCharacterFromCookie } from '@/app/actions/character';
import { ROUTES } from '@/lib/constants';
import AdventureContent from '@/app/adventure/adventure-content';
import GameNavigation from '@/components/navigation/game-navigation';
import { getCurrentGameDay } from '@/lib/utils';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AdventurePage({
  searchParams
}: {
  searchParams: Promise<{ characterId?: string }>
}) {
  // Get character ID from URL search params (if available)
  const _params = await searchParams;
  const characterId = _params.characterId;
  
  // Check if user has a character
  const characterResponse = await getCharacterFromCookie(characterId);
  
  if (!characterResponse.success || !characterResponse.data) {
    // Redirect to character creation if no character found
    redirect(ROUTES.CHARACTER_CREATE);
  }
  
  // Get user session
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user || null;
  
  const character = characterResponse.data;
  const currentDay = getCurrentGameDay();
  
  return (
    <div className="min-h-screen p-4">
      <div className="w-full max-w-lg mx-auto">
        <GameNavigation 
          activeTab="adventure" 
          currentDay={currentDay} 
          user={user ? { email: user.email || '' } : null}
        />
        <AdventureContent characterId={character.id} />
      </div>
    </div>
  );
}
