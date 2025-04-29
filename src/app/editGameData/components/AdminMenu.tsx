'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminMenu() {
  const pathname = usePathname();
  
  const menuItems = [
    { name: 'Dashboard', path: '/editGameData' },
    { name: 'Classes', path: '/editGameData/classes' },
    { name: 'Skills', path: '/editGameData/skills' },
    { name: 'Areas', path: '/editGameData/areas' },
    { name: 'Adventures', path: '/editGameData/adventures' },
    { name: 'Items', path: '/editGameData/items' },
    { name: 'Monsters', path: '/editGameData/monsters' },
    { name: 'Reward Tables', path: '/editGameData/rewardTables' },
    { name: 'Shop Items', path: '/editGameData/shopItems' },
    { name: 'World Bosses', path: '/editGameData/worldBosses' },
  ];
  
  return (
    <div className="w-64 bg-gray-100 min-h-screen p-4 border-r">
      <h2 className="text-xl font-bold mb-6 text-center text-blue-800">Game Data Editor</h2>
      
      <nav>
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.path;
            
            return (
              <li key={item.path}>
                <Link 
                  href={item.path}
                  className={`block px-4 py-2 rounded transition-colors ${
                    isActive 
                      ? 'bg-blue-600 text-white font-medium' 
                      : 'hover:bg-gray-200'
                  }`}
                >
                  {item.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      
      <div className="mt-8 pt-4 border-t">
        <Link 
          href="/"
          className="block px-4 py-2 rounded text-gray-700 hover:bg-gray-200 transition-colors"
        >
          ← Back to Game
        </Link>
      </div>
    </div>
  );
}
