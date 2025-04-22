'use client';

import { useEffect, useRef } from 'react';
import { useMusic } from './MusicContext';
import { Howler } from 'howler';

/**
 * A component that manages global music playback.
 * This component has no UI and is responsible for:
 * 1. Starting the main theme when the app loads (if music is enabled)
 * 2. Starting the main theme when the user enables music
 * 
 * Note: Due to browser autoplay policies, music will only start after user interaction
 */
export function GlobalMusicPlayer() {
  const { musicEnabled, playMusic, currentTrack } = useMusic();
  const initialized = useRef(false);
  
  // Set up event listeners for unlocking audio on user interaction
  useEffect(() => {
    const unlockAudio = () => {
      // This creates a silent sound and plays it to unlock the audio context
      console.log('User interacted with the page, unlocking audio context');
      
      // Unlock Howler audio context
      if (Howler.ctx && Howler.ctx.state !== 'running') {
        Howler.ctx.resume().then(() => {
          console.log('Audio context resumed successfully');
          initialized.current = true;
          
          // Try to play music if enabled
          if (musicEnabled && (!currentTrack || currentTrack !== 'mainTheme')) {
            console.log('Playing main theme after context resume');
            // Temporarily disabling music for now.
            //playMusic('mainTheme');
          }
        });
      } else {
        initialized.current = true;
      }
      
      // Remove the event listeners once audio is unlocked
      document.removeEventListener('click', unlockAudio);
      document.removeEventListener('touchstart', unlockAudio);
      document.removeEventListener('keydown', unlockAudio);
    };
    
    // Add event listeners to unlock audio
    document.addEventListener('click', unlockAudio);
    document.addEventListener('touchstart', unlockAudio);
    document.addEventListener('keydown', unlockAudio);
    
    return () => {
      // Clean up event listeners
      document.removeEventListener('click', unlockAudio);
      document.removeEventListener('touchstart', unlockAudio);
      document.removeEventListener('keydown', unlockAudio);
    };
  }, [musicEnabled, playMusic, currentTrack]);
  
  // Start main theme when music is enabled (after initialization)
  useEffect(() => {
    if (initialized.current && musicEnabled && (!currentTrack || currentTrack !== 'mainTheme')) {
      console.log('GlobalMusicPlayer: Starting main theme (music enabled changed)');
      playMusic('mainTheme');
    }
  }, [musicEnabled, currentTrack, playMusic]);
  
  // No visible UI - just handles music logic
  return null;
}
