'use client';

import { useState, useEffect } from 'react';

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
  
  useEffect(() => {
    // Reset displayed text when text changes
    setDisplayedText([]);
    
    // Split text into words inside the effect
    const words = text.split(' ');
    
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
