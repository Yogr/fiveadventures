'use client';

import { useState, useRef } from 'react';
import { Howler } from 'howler';
import { useAudio } from '@/lib/audio-utils';

/**
 * A simple button component for testing audio playback.
 * This helps diagnose audio issues by explicitly triggering sound and music.
 */
export default function AudioTestButton() {
  const [testCount, setTestCount] = useState(0);
  const [status, setStatus] = useState<string>('');
  const { 
    playSoundEffect, 
    playMusic, 
    soundEnabled, 
    musicEnabled, 
    setSoundEnabled, 
    setMusicEnabled 
  } = useAudio();
  const interactionRef = useRef(false);

  const runAudioTest = () => {
    interactionRef.current = true;
    setTestCount(prev => prev + 1);
    
    // First, ensure audio context is running
    if (Howler.ctx?.state !== 'running') {
      Howler.ctx?.resume().then(() => {
        setStatus('Audio context resumed, unlocking audio...');
        console.log('Audio context resumed successfully through test button');
      }).catch(err => {
        setStatus(`Failed to resume audio context: ${err.message}`);
        console.error('Failed to resume audio context:', err);
      });
    }

    // Make sure both sound and music are enabled
    if (!soundEnabled) {
      setSoundEnabled(true);
      setStatus(prev => prev + '\nSound enabled.');
    }
    
    if (!musicEnabled) {
      setMusicEnabled(true);
      setStatus(prev => prev + '\nMusic enabled.');
    }
    
    // Try to play a sound effect
    try {
      setStatus(prev => prev + '\nTrying to play click sound...');
      playSoundEffect('click');
    } catch (err) {
      setStatus(prev => prev + `\nError playing sound: ${err}`);
      console.error('Error playing sound:', err);
    }
    
    // Try to play music
    try {
      setStatus(prev => prev + '\nTrying to play main theme...');
      playMusic('mainTheme');
    } catch (err) {
      setStatus(prev => prev + `\nError playing music: ${err}`);
      console.error('Error playing music:', err);
    }
    
    // Log Howler's audio state
    setStatus(prev => 
      prev + `\nHowler context state: ${Howler.ctx?.state || 'none'}\n` +
      `Audio playback test #${testCount + 1} complete`
    );
  };

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col items-end">
      <button
        onClick={runAudioTest}
        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Test Audio
      </button>
      
      {status && (
        <div className="mt-2 max-w-xs bg-black bg-opacity-80 text-white text-xs p-2 rounded">
          <pre className="whitespace-pre-wrap">{status}</pre>
          <button 
            onClick={() => setStatus('')} 
            className="mt-1 text-xs text-gray-400 hover:text-white"
          >
            Clear
          </button>
        </div>
      )}
    </div>
  );
}
