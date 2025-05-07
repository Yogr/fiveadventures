'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMobileMenu } from './MobileMenuContext';

export default function AdminMenu() {
  const pathname = usePathname();
  const { isMenuOpen, closeMenu } = useMobileMenu();
  
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
    <div className={`
      fixed inset-y-0 left-0 z-30 
      transform ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'} 
      transition-transform duration-300 ease-in-out
      md:relative md:translate-x-0 md:w-64
      bg-amber-950 p-4 border-r border-amber-800
      overflow-y-auto
      ${isMenuOpen ? 'shadow-lg md:shadow-none' : ''}
    `}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-center text-amber-300">Game Data Editor</h2>
        <button 
          onClick={closeMenu}
          className="text-amber-100 md:hidden focus:outline-none"
          aria-label="Close menu"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
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
                      ? 'bg-amber-700 text-amber-100 font-medium shadow-md' 
                      : 'text-amber-200 hover:bg-amber-900 hover:text-amber-100'
                  }`}
                  onClick={() => {
                    if (window.innerWidth < 768) {
                      closeMenu();
                    }
                  }}
                >
                  {item.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      
      <div className="mt-8 pt-4 border-t border-amber-800">
        <Link 
          href="/"
          className="block px-4 py-2 rounded text-amber-300 hover:bg-amber-900 hover:text-amber-100 transition-colors"
        >
          ← Back to Game
        </Link>
      </div>
    </div>
  );
}
