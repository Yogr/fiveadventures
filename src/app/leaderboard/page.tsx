import { Suspense } from 'react';
import { getCharacterForUser } from '@/app/actions/character';
import LeaderboardContent from './leaderboard-content';
import Image from 'next/image';

export default async function LeaderboardPage() {
  // Get current character
  const characterResponse = await getCharacterForUser();
  const character = characterResponse.success ? characterResponse.data : null;
  
  return (
    <div className="container mx-auto px-4 pb-8">
      <div className="text-center mb-2">
        <h1 className="text-3xl font-bold text-amber-400 mb-1">Leaderboard</h1>
      </div>

      <div className="bg-gray-900 border border-amber-800 rounded-lg p-4 shadow-lg">
        <div className="flex justify-center mb-6">
          <div className="relative w-24 h-24">
            <Image 
              src="/image/ui/leaderboard.png" 
              alt="Leaderboard" 
              fill
              priority
              className="object-contain"
            />
          </div>
        </div>
        
        <Suspense fallback={<LeaderboardLoading />}>
          <LeaderboardContent characterId={character?.id} />
        </Suspense>
      </div>
    </div>
  );
}

function LeaderboardLoading() {
  return (
    <div className="animate-pulse">
      {/* Loading tabs */}
      <div className="border-b border-amber-800 mb-4">
        <div className="flex space-x-1">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-10 w-24 bg-gray-700 rounded-t-md"></div>
          ))}
        </div>
      </div>
      
      {/* Loading table */}
      <div className="bg-gray-800 border border-amber-800 rounded-lg overflow-hidden">
        <div className="p-4 border-b border-amber-800 bg-amber-900/30">
          <div className="h-6 w-40 bg-gray-700 rounded"></div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-800/60">
              <tr>
                {['rank', 'name', 'class', 'value'].map(col => (
                  <th key={col} className="px-4 py-3">
                    <div className="h-4 bg-gray-700 rounded w-full"></div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {Array.from({ length: 10 }).map((_, i) => (
                <tr key={i} className="bg-gray-800/30">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="h-4 bg-gray-600 rounded w-8"></div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="h-4 bg-gray-600 rounded w-32"></div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="h-4 bg-gray-600 rounded w-20"></div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right">
                    <div className="h-4 bg-gray-600 rounded w-16 ml-auto"></div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
