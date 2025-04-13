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
  
  // Get user session
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user || null;
  
  const currentDay = getCurrentGameDay();
  
  return (
    <div className="min-h-screen">
      {/* Navigation bar flush with top of page */}
      <GameNavigation 
        activeTab="worldboss" 
        currentDay={currentDay} 
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
