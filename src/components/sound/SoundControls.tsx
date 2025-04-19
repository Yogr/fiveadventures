'use client';

import { useSound } from './SoundContext';
import { useMusic } from './MusicContext';
import { LuVolume2, LuVolumeX } from 'react-icons/lu';
import { LuMusic, LuMusic2 } from 'react-icons/lu';

export function SoundControls() {
  const { soundEnabled, setSoundEnabled, playSoundEffect } = useSound();
  const { musicEnabled, setMusicEnabled } = useMusic();

  const handleSoundToggle = () => {
    playSoundEffect('click');
    setSoundEnabled(!soundEnabled);
  };

  const handleMusicToggle = () => {
    if (soundEnabled) {
      playSoundEffect('click');
    }
    setMusicEnabled(!musicEnabled);
  };

  return (
    <div className="fixed bottom-4 right-4 flex flex-col gap-2 z-50">
      <button
        onClick={handleSoundToggle}
        className="p-2 bg-gray-800 rounded-full transition-all duration-300 hover:bg-gray-700 focus:outline-none"
        aria-label={soundEnabled ? 'Disable sound effects' : 'Enable sound effects'}
        title={soundEnabled ? 'Sound On' : 'Sound Off'}
      >
        {soundEnabled ? (
          <LuVolume2 className="w-6 h-6 text-green-400" />
        ) : (
          <LuVolumeX className="w-6 h-6 text-gray-400" />
        )}
      </button>
      
      <button
        onClick={handleMusicToggle}
        className="p-2 bg-gray-800 rounded-full transition-all duration-300 hover:bg-gray-700 focus:outline-none"
        aria-label={musicEnabled ? 'Disable music' : 'Enable music'}
        title={musicEnabled ? 'Music On' : 'Music Off'}
      >
        {musicEnabled ? (
          <LuMusic className="w-6 h-6 text-green-400" />
        ) : (
          <LuMusic2 className="w-6 h-6 text-gray-400" />
        )}
      </button>
    </div>
  );
}
