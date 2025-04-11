import { redirect } from 'next/navigation';
import { getCharacterForUser } from '@/app/actions/character';
import { ROUTES } from '@/lib/constants';
import AdventureContent from '@/app/adventure/adventure-content';
import GameNavigation from '@/components/navigation/game-navigation';
import { getCurrentGameDay } from '@/lib/utils';
import { createClient } from '@/lib/supabase/server';

export default async function AdventurePage() {
  
  // Check if user has a character
  const characterResponse = await getCharacterForUser();
  
  if (!characterResponse.success || !characterResponse.data) {
    // Redirect to character creation if no character found
    console.log('No character found, redirecting to character creation...');
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
