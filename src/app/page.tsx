import Link from 'next/link';
import { ROUTES } from '@/lib/constants';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
      <div className="max-w-4xl w-full">
        <h1 className="text-6xl font-pixel mb-6 text-purple-400 pulse-animation">
          Five Adventures
        </h1>
        
        <div className="pixel-border bg-gray-900 bg-opacity-80 p-6 mb-8">
          <p className="text-2xl mb-6">
            Embark on a daily journey of five unique adventures in this pixelated RPG!
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="flex flex-col items-center">
              <h2 className="text-3xl text-yellow-400 mb-3">Create a Hero</h2>
              <p className="text-xl">
                Choose from four unique classes: Warrior, Wizard, Thief, or Ranger.
                Each with their own strengths and abilities.
              </p>
            </div>
            
            <div className="flex flex-col items-center">
              <h2 className="text-3xl text-green-400 mb-3">Daily Adventures</h2>
              <p className="text-xl">
                Embark on five adventures each day. Make choices, face challenges,
                and reap rewards based on your character's abilities.
              </p>
            </div>
            
            <div className="flex flex-col items-center">
              <h2 className="text-3xl text-blue-400 mb-3">Collect & Equip</h2>
              <p className="text-xl">
                Find weapons, armor, and magical trinkets to boost your stats
                and unlock new abilities for your character.
              </p>
            </div>
            
            <div className="flex flex-col items-center">
              <h2 className="text-3xl text-red-400 mb-3">Battle World Bosses</h2>
              <p className="text-xl">
                Join forces with other players to defeat powerful weekly bosses
                and earn exclusive rewards.
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link 
            href={ROUTES.CHARACTER_CREATE} 
            className="pixel-button text-2xl py-3 px-8"
          >
            Start Your Adventure
          </Link>
          
          <Link 
            href={ROUTES.LOGIN} 
            className="pixel-button text-2xl py-3 px-8 bg-blue-600 hover:bg-blue-500 active:bg-blue-700"
          >
            Login
          </Link>
        </div>
        
        <p className="mt-8 text-gray-300 text-lg">
          No account needed to start playing, but creating one will save your progress!
        </p>
      </div>
    </div>
  );
}
