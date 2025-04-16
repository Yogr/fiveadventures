'use client';

import { useState, useEffect, useRef } from 'react';

interface AnimatedTextProps {
  text: string;
  className?: string;
  speed?: number; // milliseconds per word
  onComplete?: () => void;
}

export default function AnimatedText({
  text,
  className = '',
  speed = 100,
  onComplete
}: AnimatedTextProps) {
  const [displayedText, setDisplayedText] = useState<string[]>([]);
  const hasCompletedRef = useRef(false);
  const wordsRef = useRef<string[]>([]);
  
  // Update the words ref when text changes
  useEffect(() => {
    wordsRef.current = text.split(' ');
  }, [text]);
  
  useEffect(() => {
    // If we've already completed the animation, display all words immediately
    if (hasCompletedRef.current) {
      setDisplayedText(wordsRef.current);
      return;
    }
    
    // Reset displayed text when text changes and we haven't completed yet
    setDisplayedText([]);
    
    const words = wordsRef.current;
    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex < words.length) {
        const word = words[currentIndex];
        if (word !== undefined) {
          setDisplayedText(prev => [...prev, word]);
        }
        currentIndex++;
      } else {
        clearInterval(interval);
        hasCompletedRef.current = true;
        if (onComplete) {
          onComplete();
        }
      }
    }, speed);
    
    return () => clearInterval(interval);
  }, [text, speed, onComplete]);
  
  return (
    <p className={className}>
      {displayedText.map((word, index) => (
        <span 
          key={index} 
          className="animate-fadeIn inline-block"
          style={{ marginRight: '0.25em' }}
        >
          {word}
        </span>
      ))}
    </p>
  );
}
