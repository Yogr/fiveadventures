import { getCharacterForUser } from '@/app/actions/character';
import { getAreas, getSelectedArea } from '@/app/actions/area';
import { getCurrentGameDay } from '@/lib/utils';
import AdventureTabContainer from '@/components/adventure/AdventureTabContainer';

export const dynamic = 'force-dynamic';

export default async function AdventurePage() {
  // Get character from layout
  const characterResponse = await getCharacterForUser();
  const character = characterResponse.data!; // We know this exists because of the layout check
  const currentDay = getCurrentGameDay();
  
  // Pre-fetch areas data on the server
  const areasResponse = await getAreas();
  const areas = areasResponse.success && areasResponse.data ? areasResponse.data : [];
  
  // Try to get selected area
  let selectedArea = null;
  try {
    const selectedAreaResponse = await getSelectedArea(character.id, currentDay);
    if (selectedAreaResponse.success && selectedAreaResponse.data && areas.length > 0) {
      const areaId = selectedAreaResponse.data;
      selectedArea = areas.find(area => area.id === areaId) || null;
    }
  } catch (error) {
    console.error('Error getting selected area:', error);
  }
  
  return (
    <div className="w-full">
      <AdventureTabContainer
        character={character}
        currentDay={currentDay}
        areas={areas}
        selectedArea={selectedArea}
      />
    </div>
  );
}
