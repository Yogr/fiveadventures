import Image from 'next/image';

export default function LeaderboardPage() {
  return (
    <div className="container mx-auto px-4 pb-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-amber-400 mb-4">Leaderboard</h1>
        <div className="w-16 h-1 bg-amber-500 mx-auto mb-6"></div>
        <p className="text-xl text-amber-200 max-w-2xl mx-auto">
          Track your progress against other adventurers and compete for glory and rewards!
        </p>
      </div>

      <div className="bg-gray-900 border border-amber-800 rounded-lg p-6 shadow-lg">
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
        
        <div className="bg-amber-900/40 border border-amber-700 rounded-lg p-5 mb-8">
          <h2 className="text-2xl font-bold text-center text-amber-300 mb-4">Coming Soon!</h2>
          <p className="text-center text-amber-100 text-lg">
            The leaderboard is currently under construction. Soon you'll be able to compete 
            with other adventurers for a place among the legends of the realm.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <div className="bg-gray-800 border border-amber-700 rounded-lg p-5 hover:border-amber-500 transition-colors duration-300 shadow-md">
            <h2 className="text-xl font-semibold text-amber-300 mb-3 flex items-center">
              <div className="w-6 h-6 mr-2 flex-shrink-0 bg-amber-500 rounded-full flex items-center justify-center text-amber-950 font-bold">1</div>
              Most Powerful Heroes
            </h2>
            <p className="text-gray-300">Top adventurers ranked by level, strength, and battle prowess</p>
          </div>
          
          <div className="bg-gray-800 border border-amber-700 rounded-lg p-5 hover:border-amber-500 transition-colors duration-300 shadow-md">
            <h2 className="text-xl font-semibold text-amber-300 mb-3 flex items-center">
              <div className="w-6 h-6 mr-2 flex-shrink-0 bg-amber-500 rounded-full flex items-center justify-center text-amber-950 font-bold">2</div>
              Wealthiest Adventurers
            </h2>
            <p className="text-gray-300">Fortune seekers ranked by their hoards of gold and treasure</p>
          </div>
          
          <div className="bg-gray-800 border border-amber-700 rounded-lg p-5 hover:border-amber-500 transition-colors duration-300 shadow-md">
            <h2 className="text-xl font-semibold text-amber-300 mb-3 flex items-center">
              <div className="w-6 h-6 mr-2 flex-shrink-0 bg-amber-500 rounded-full flex items-center justify-center text-amber-950 font-bold">3</div>
              Boss Slayers
            </h2>
            <p className="text-gray-300">Heroic warriors ranked by world boss damage and legendary kills</p>
          </div>
          
          <div className="bg-gray-800 border border-amber-700 rounded-lg p-5 hover:border-amber-500 transition-colors duration-300 shadow-md">
            <h2 className="text-xl font-semibold text-amber-300 mb-3 flex items-center">
              <div className="w-6 h-6 mr-2 flex-shrink-0 bg-amber-500 rounded-full flex items-center justify-center text-amber-950 font-bold">4</div>
              Adventure Masters
            </h2>
            <p className="text-gray-300">Explorers ranked by quests completed and territories conquered</p>
          </div>
        </div>
      </div>
    </div>
  );
}
