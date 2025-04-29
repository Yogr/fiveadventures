import { isUserAdmin } from '@/app/actions/auth';
import AdminMenu from './components/AdminMenu';
import Link from 'next/link';

export default async function GameDataEditorPage() {
  // Check if user is admin (but don't restrict access)
  const isAdmin = await isUserAdmin();
  
  return (
    <div className="flex w-full">
      <AdminMenu />
      <div className="flex-1 p-6 bg-amber-900 min-h-screen">
        <h1 className="text-2xl font-bold mb-6 text-amber-100">Game Data Editor Dashboard</h1>
        
        <div className="bg-amber-950 p-6 rounded-lg border border-amber-700 shadow-lg">
          <h2 className="text-xl font-semibold text-amber-300 mb-4">Welcome to the Admin Panel</h2>
          
          <p className="mb-4 text-amber-200">
            This is the centralized dashboard for managing game data. Use the menu on the left to navigate to different data sections.
          </p>
          
          <div className="bg-amber-800/50 border-l-4 border-amber-500 p-4 mb-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-amber-300" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-amber-100">
                  {isAdmin 
                    ? "You have admin privileges. You can edit all game data."
                    : "You are in view-only mode. Contact an administrator to get edit privileges."}
                </p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-8">
            {[
              { name: 'Classes', path: '/editGameData/classes', description: 'Manage player character classes', icon: '👤' },
              { name: 'Skills', path: '/editGameData/skills', description: 'Configure character abilities', icon: '⚔️' },
              { name: 'Areas', path: '/editGameData/areas', description: 'Edit game world regions', icon: '🗺️' },
              { name: 'Adventures', path: '/editGameData/adventures', description: 'Create and modify quests', icon: '📜' },
              { name: 'Items', path: '/editGameData/items', description: 'Manage equipment and consumables', icon: '🔮' },
              { name: 'Monsters', path: '/editGameData/monsters', description: 'Configure enemies and their stats', icon: '👹' },
              { name: 'Reward Tables', path: '/editGameData/rewardTables', description: 'Set up loot distribution', icon: '💎' },
              { name: 'Shop Items', path: '/editGameData/shopItems', description: 'Configure shop inventories', icon: '🛒' },
              { name: 'World Bosses', path: '/editGameData/worldBosses', description: 'Configure epic encounters', icon: '🐉' },
            ].map((category) => (
              <Link 
                key={category.name} 
                href={category.path}
                className="bg-amber-800/50 p-5 rounded-lg shadow-md hover:shadow-lg transition-all border border-amber-700/50 hover:bg-amber-700/50 group"
              >
                <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">{category.icon}</div>
                <h3 className="font-bold text-amber-200 mb-2 group-hover:text-amber-100">{category.name}</h3>
                <p className="text-amber-300/80 text-sm">{category.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
