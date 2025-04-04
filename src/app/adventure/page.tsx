import { redirect } from 'next/navigation';
import { getCharacterFromCookie } from '@/app/actions/character';
import { ROUTES } from '@/lib/constants';
import AdventureContent from '@/app/adventure/adventure-content';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AdventurePage() {
  // Check if user has a character
  const characterResponse = await getCharacterFromCookie();
  
  if (!characterResponse.success || !characterResponse.data) {
    // Redirect to character creation if no character found
    redirect(ROUTES.CHARACTER_CREATE);
  }
  
  const character = characterResponse.data;
  
  return (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-pixel mb-6 text-center text-purple-400">
          {character.name}'s Adventures
        </h1>
        
        <AdventureContent characterId={character.id} />
      </div>
    </div>
  );
}
