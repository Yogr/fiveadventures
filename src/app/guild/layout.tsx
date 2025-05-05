import { redirect } from 'next/navigation';
import { getCharacterForUser } from '@/app/actions/character';
import { getUser } from '@/app/actions/auth';
import { ROUTES } from '@/lib/constants';
import GameNavigation from '@/components/navigation/game-navigation';
import { getCurrentGameDay } from '@/lib/utils';

export default async function GuildLayout({
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
  
  // Get user
  const user = await getUser();
  
  const currentDay = getCurrentGameDay();
  
  return (
    <div className="min-h-screen pt-0 mt-0">
      {/* Navigation bar with character stats */}
      <GameNavigation 
        activeTab="guild" 
        currentDay={currentDay}
        character={character}
        user={user ? { email: user.email || '' } : null}
        showWorldBossCompanion={false}
      />
      
      <div className="p-4">
        <div className="w-full max-w-lg mx-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
