import { getCharacterForUser } from '@/app/actions/character';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function WorldBossPage() {
  // Get character from layout
  const characterResponse = await getCharacterForUser();
  const character = characterResponse.data!; // We know this exists because of the layout check
  
  return (
    <div className="bg-amber-950 bg-opacity-90 p-4 rounded-lg border-2 border-amber-800 border-t-amber-700 border-l-amber-700">
      <h2 className="text-xl sm:text-2xl font-bold mb-4 text-center text-amber-300">World Boss</h2>
      
      {/* Placeholder content for the world boss page */}
      <div className="flex flex-col items-center">
        <div className="w-24 h-24 sm:w-32 sm:h-32 bg-amber-900 rounded-full flex items-center justify-center mb-4 border border-amber-700">
          <span className="text-3xl sm:text-4xl text-amber-200">A</span>
        </div>
        
        <h3 className="text-lg sm:text-xl font-bold mb-2 text-amber-200">Ancient Dragon</h3>
        
        <div className="w-full max-w-md mb-4">
          <div className="flex justify-between text-sm mb-1 text-amber-200">
            <span>HP</span>
            <span>7,500 / 10,000</span>
          </div>
          <div className="h-4 bg-amber-900 rounded-md overflow-hidden">
            <div 
              className="h-full bg-red-600" 
              style={{ width: '75%' }}
            ></div>
          </div>
        </div>
        
        <p className="text-amber-200 mb-6 text-center">
          A fearsome dragon that has awakened from its slumber. Its scales shimmer with magical energy, and its breath can melt stone.
        </p>
        
        <button className="pixel-button bg-amber-800 hover:bg-amber-700 active:bg-amber-900">
          Attack Boss
        </button>
      </div>
    </div>
  );
}
