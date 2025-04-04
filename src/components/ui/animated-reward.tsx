'use client';

import { useState, useEffect } from 'react';

interface AnimatedRewardProps {
  children: React.ReactNode;
  delay?: number; // milliseconds to delay before showing
  className?: string;
  isItem?: boolean; // whether to apply shaking animation (for items)
  onAnimationStart?: () => void; // callback when animation starts
}

export default function AnimatedReward({ 
  children, 
  delay = 0,
  className = '',
  isItem = false,
  onAnimationStart
}: AnimatedRewardProps) {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
      if (onAnimationStart) {
        onAnimationStart();
      }
    }, delay);
    
    return () => clearTimeout(timer);
  }, [delay, onAnimationStart]);
  
  if (!isVisible) {
    return null;
  }
  
  return (
    <div 
      className={`
        animate-fadeIn 
        ${isItem ? 'animate-shake' : ''} 
        ${className}
      `}
    >
      {children}
    </div>
  );
}
