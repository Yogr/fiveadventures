'use client';

import Link from 'next/link';
import { useMobileMenu } from './MobileMenuContext';

export default function TopNav() {
  const { isMenuOpen, toggleMenu } = useMobileMenu();
  
  return (
    <div className="bg-amber-950 text-amber-100 p-4 flex justify-between items-center border-b border-amber-800 md:hidden">
      <Link href="/editGameData" className="text-xl font-bold text-amber-300">
        Game Data Editor
      </Link>
      
      <button 
        onClick={toggleMenu}
        className="text-amber-100 focus:outline-none"
        aria-label={isMenuOpen ? "Close menu" : "Open menu"}
      >
        {isMenuOpen ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>
    </div>
  );
}
