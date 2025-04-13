import { getCharacterForUser } from '@/app/actions/character';
import ShopContainer from '@/components/shop/shop-container';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function ShopPage() {
  // Get character from layout
  const characterResponse = await getCharacterForUser();
  const character = characterResponse.data!; // We know this exists because of the layout check
  
  return (
    <ShopContainer 
      initialGold={character.gold} 
      equipment={character.equipment || {
        weapon_id: null,
        helmet_id: null,
        armor_id: null,
        trinket_id: null
      }}
    />
  );
}
