import { redirect } from 'next/navigation';
import { getCharacterFromCookie } from '@/app/actions/character';
import { ROUTES } from '@/lib/constants';
import GameNavigation from '@/components/navigation/game-navigation';
import ShopContainer from '@/components/shop/shop-container';
import CharacterStats from '@/components/character/character-stats';
import { getCurrentGameDay } from '@/lib/utils';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function ShopPage() {
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
        <GameNavigation activeTab="shop" currentDay={currentDay} />
        
        {/* Character stats */}
        <div className="mb-4">
          <CharacterStats character={character} />
        </div>
        
        {/* Shop container */}
        <ShopContainer 
          initialGold={character.gold} 
          equipment={character.equipment || {
            weapon_id: null,
            helmet_id: null,
            armor_id: null,
            trinket_id: null
          }}
        />
      </div>
    </div>
  );
}
