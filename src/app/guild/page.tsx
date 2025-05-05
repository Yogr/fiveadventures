import Image from 'next/image';

export default function GuildPage() {
  return (
    <div className="container mx-auto px-4 pb-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-amber-400 mb-4">Guild Hall</h1>
        <div className="w-16 h-1 bg-amber-500 mx-auto mb-6"></div>
        <p className="text-xl text-amber-200 max-w-2xl mx-auto">
          Join forces with fellow adventurers to conquer challenges too great for any single hero!
        </p>
      </div>

      <div className="bg-gray-900 border border-amber-800 rounded-lg p-6 shadow-lg">
        <div className="flex justify-center mb-6">
          <div className="relative w-28 h-28">
            <Image 
              src="/image/ui/guild.png" 
              alt="Guild" 
              fill
              priority
              className="object-contain"
            />
          </div>
        </div>
        
        <div className="bg-amber-900/40 border border-amber-700 rounded-lg p-5 mb-8">
          <h2 className="text-2xl font-bold text-center text-amber-300 mb-4">Coming Soon!</h2>
          <p className="text-center text-amber-100 text-lg">
            The Guild Hall is currently under construction. Soon you'll be able to form powerful 
            alliances with other adventurers to take on legendary challenges!
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <div className="bg-gray-800 border border-amber-700 rounded-lg p-5 hover:border-amber-500 transition-colors duration-300 shadow-md">
            <h2 className="text-xl font-semibold text-amber-300 mb-3">Guild Quests</h2>
            <p className="text-gray-300">Take on special challenges with your guildmates for exclusive rewards and treasures only available to organized guilds.</p>
            <div className="w-full h-px bg-amber-800/50 my-4"></div>
            <div className="flex items-center text-amber-200 text-sm">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.414-1.414A1 1 0 0011.586 2H8.414a1 1 0 00-.707.293L6.293 3.707A1 1 0 015.586 4H4zm6 9a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd"></path>
              </svg>
              Preview coming soon
            </div>
          </div>
          
          <div className="bg-gray-800 border border-amber-700 rounded-lg p-5 hover:border-amber-500 transition-colors duration-300 shadow-md">
            <h2 className="text-xl font-semibold text-amber-300 mb-3">Guild Upgrades</h2>
            <p className="text-gray-300">Invest in your guild hall to unlock powerful bonuses for all members, from increased gold drops to enhanced combat abilities.</p>
            <div className="w-full h-px bg-amber-800/50 my-4"></div>
            <div className="flex items-center text-amber-200 text-sm">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd"></path>
              </svg>
              Multiple upgrade paths
            </div>
          </div>
          
          <div className="bg-gray-800 border border-amber-700 rounded-lg p-5 hover:border-amber-500 transition-colors duration-300 shadow-md">
            <h2 className="text-xl font-semibold text-amber-300 mb-3">Guild Chat</h2>
            <p className="text-gray-300">Coordinate strategies and share adventures with your guildmates through an integrated messaging system and guild boards.</p>
            <div className="w-full h-px bg-amber-800/50 my-4"></div>
            <div className="flex items-center text-amber-200 text-sm">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd"></path>
              </svg>
              Real-time communication
            </div>
          </div>
          
          <div className="bg-gray-800 border border-amber-700 rounded-lg p-5 hover:border-amber-500 transition-colors duration-300 shadow-md">
            <h2 className="text-xl font-semibold text-amber-300 mb-3">Guild Wars</h2>
            <p className="text-gray-300">Compete against other guilds for glory and legendary treasures in seasonal competitions and territory control.</p>
            <div className="w-full h-px bg-amber-800/50 my-4"></div>
            <div className="flex items-center text-amber-200 text-sm">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd"></path>
              </svg>
              Seasonal rewards
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
