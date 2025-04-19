import { redirect } from 'next/navigation';
import { getCharacterForUser } from '@/app/actions/character';
import { ROUTES } from '@/lib/constants';
import GameNavigation from '@/components/navigation/game-navigation';
import { getCurrentGameDay } from '@/lib/utils';
import { createClient } from '@/lib/supabase/server';

export default async function WorldBossLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Check if user has a character
  const characterResponse = await getCharacterForUser();
  
  if (!characterResponse.success || !characterResponse.data) {
    // Redirect to character creation if no character found
    redirect(ROUTES.CHARACTER_CREATE);
  }
  
  const character = characterResponse.data;
  
  // Get user session
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user || null;
  
  const currentDay = getCurrentGameDay();
  
  return (
    <div className="min-h-screen">
      {/* Navigation bar with character stats */}
      <GameNavigation 
        activeTab="worldboss" 
        currentDay={currentDay}
        character={character}
        user={user ? { email: user.email || '' } : null}
        showWorldBossCompanion={false} // Hide on world boss page since we're already there
      />
      
      <div className="p-4">
        <div className="w-full max-w-lg mx-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
