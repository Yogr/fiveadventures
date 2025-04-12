import { redirect } from 'next/navigation';
import { getCharacterForUser } from '@/app/actions/character';
import { getAreas, getSelectedArea } from '@/app/actions/area';
import { ROUTES } from '@/lib/constants';
import GameNavigation from '@/components/navigation/game-navigation';
import { getCurrentGameDay } from '@/lib/utils';
import { createClient } from '@/lib/supabase/server';
import { AdventureProvider } from '@/components/adventure/AdventureContext';
import AdventureContainer from '@/components/adventure/AdventureContainer';

export default async function AdventurePage() {
  console.log('Rendering AdventurePage on server');
  
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
  
  // Pre-fetch areas data on the server
  const areasResponse = await getAreas();
  const areas = areasResponse.success && areasResponse.data ? areasResponse.data : [];
  
  console.log('Server-side data fetched:');
  console.log('- Character:', character.name);
  console.log('- Current day:', currentDay);
  console.log('- Areas loaded:', areas.length);
  
  // Try to get selected area
  let selectedArea = null;
  try {
    const selectedAreaResponse = await getSelectedArea(character.id, currentDay);
    if (selectedAreaResponse.success && selectedAreaResponse.data && areas.length > 0) {
      const areaId = selectedAreaResponse.data;
      selectedArea = areas.find(area => area.id === areaId) || null;
      console.log('- Selected area:', selectedArea ? selectedArea.name : 'None');
    } else {
      console.log('- No selected area for today');
    }
  } catch (error) {
    console.error('Error getting selected area:', error);
  }
  
  // Create initial state for the AdventureProvider
  const initialState = {
    character,
    areas,
    selectedArea,
    currentDay
  };
  
  return (
    <div className="min-h-screen p-4">
      <div className="w-full max-w-lg mx-auto">
        <GameNavigation 
          activeTab="adventure" 
          currentDay={currentDay} 
          user={user ? { email: user.email || '' } : null}
        />
        
        <AdventureProvider 
          initialCharacter={character} 
          currentDay={currentDay}
          initialAreas={areas}
          initialSelectedArea={selectedArea}
        >
          <AdventureContainer />
        </AdventureProvider>
      </div>
    </div>
  );
}
