import { isUserAdmin } from '@/app/actions/auth';
import AdminMenu from './components/AdminMenu';

export default async function GameDataEditorPage() {
  // Check if user is admin (but don't restrict access)
  const isAdmin = await isUserAdmin();
  
  return (
    <div className="flex w-full">
      <AdminMenu />
      <div className="flex-1 p-6">
        <h1 className="text-2xl font-bold mb-6">Game Data Editor Dashboard</h1>
        
        <div className="bg-amber-50 p-6 rounded-lg border border-amber-200">
          <h2 className="text-xl font-semibold text-amber-800 mb-4">Welcome to the Admin Panel</h2>
          
          <p className="mb-4 text-gray-700">
            This is the centralized dashboard for managing game data. Use the menu on the left to navigate to different data sections.
          </p>
          
          <div className="bg-amber-100 border-l-4 border-amber-500 p-4 mb-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-amber-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-amber-800">
                  {isAdmin 
                    ? "You have admin privileges. You can edit all game data."
                    : "You are in view-only mode. Contact an administrator to get edit privileges."}
                </p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-8">
            {[
              { name: 'Classes', description: 'Manage player character classes', icon: '👤' },
              { name: 'Skills', description: 'Configure character abilities', icon: '⚔️' },
              { name: 'Areas', description: 'Edit game world regions', icon: '🗺️' },
              { name: 'Adventures', description: 'Create and modify quests', icon: '📜' },
              { name: 'Items', description: 'Manage equipment and consumables', icon: '🔮' },
              { name: 'Monsters', description: 'Configure enemies and their stats', icon: '👹' },
              { name: 'Reward Tables', description: 'Set up loot distribution', icon: '💎' },
              { name: 'Shop Items', description: 'Configure shop inventories', icon: '🛒' },
              { name: 'World Bosses', description: 'Configure epic encounters', icon: '🐉' },
            ].map((category) => (
              <div key={category.name} className="bg-white p-5 rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200">
                <div className="text-3xl mb-3">{category.icon}</div>
                <h3 className="font-bold text-gray-800 mb-2">{category.name}</h3>
                <p className="text-gray-600 text-sm">{category.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
