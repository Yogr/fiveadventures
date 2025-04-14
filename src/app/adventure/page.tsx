import { getCharacterForUser } from '@/app/actions/character';
import { getAreas, getSelectedArea } from '@/app/actions/area';
import { getCurrentGameDay } from '@/lib/utils';
import { AdventureProvider } from '@/components/adventure/AdventureContext';
import AdventureContainer from '@/components/adventure/AdventureContainer';

// Use ISR with a reasonable revalidation time instead of forcing dynamic rendering
// This allows caching while ensuring data is refreshed periodically
export const revalidate = 60; // Revalidate every 60 seconds

export default async function AdventurePage() {
  console.log('Rendering AdventurePage on server');
  
  // Get character from layout
  const characterResponse = await getCharacterForUser();
  const character = characterResponse.data!; // We know this exists because of the layout check
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
  
  return (
    <AdventureProvider 
      initialCharacter={character} 
      currentDay={currentDay}
      initialAreas={areas}
      initialSelectedArea={selectedArea}
    >
      <AdventureContainer />
    </AdventureProvider>
  );
}
