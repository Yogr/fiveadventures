import { redirect } from 'next/navigation';
import { getCharacterFromCookie } from '@/app/actions/character';
import { ROUTES } from '@/lib/constants';
import GameNavigation from '@/components/navigation/game-navigation';
import { getCurrentGameDay } from '@/lib/utils';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function WorldBossPage({
  searchParams
}: {
  searchParams: Promise<{ characterId?: string }>
}) {
  // Get character ID from URL search params (if available)
  const _searchParams = await searchParams;
  const characterId = _searchParams.characterId;
  
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
          activeTab="worldboss" 
          currentDay={currentDay} 
          user={user ? { email: user.email || '' } : null}
        />
        
        <div className="bg-gray-800 p-4 rounded-md">
          <h2 className="text-xl sm:text-2xl font-bold mb-4 text-center">World Boss</h2>
          
          {/* Placeholder content for the world boss page */}
          <div className="flex flex-col items-center">
            <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gray-700 rounded-full flex items-center justify-center mb-4">
              <span className="text-3xl sm:text-4xl">A</span>
            </div>
            
            <h3 className="text-lg sm:text-xl font-bold mb-2">Ancient Dragon</h3>
            
            <div className="w-full max-w-md mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span>HP</span>
                <span>7,500 / 10,000</span>
              </div>
              <div className="h-4 bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-red-600" 
                  style={{ width: '75%' }}
                ></div>
              </div>
            </div>
            
            <p className="text-gray-300 mb-6 text-center">
              A fearsome dragon that has awakened from its slumber. Its scales shimmer with magical energy, and its breath can melt stone.
            </p>
            
            <button className="pixel-button bg-red-600 hover:bg-red-500 active:bg-red-700">
              Attack Boss
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
