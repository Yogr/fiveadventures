'use client';

import React from 'react';

interface StatusBarProps {
  current: number;
  max: number;
  label?: string;
  className?: string;
  barColor?: string;
  height?: number;
}

export default function StatusBar({ 
  current, 
  max, 
  label = "HP", 
  className = "",
  barColor = "bg-red-600",
  height = 4
}: StatusBarProps) {
  // Calculate percentage (clamped between 0-100%)
  const percentage = Math.max(0, Math.min(100, (current / max) * 100));
  
  return (
    <div className={`w-full ${className}`}>
      <div 
        className={`w-full h-${height} bg-gray-700 bg-opacity-80 rounded-full overflow-hidden border border-gray-600 relative`}
      >
        <div 
          className={`h-full ${barColor} transition-all duration-300`} 
          style={{ width: `${percentage}%` }}
        ></div>
        
        {/* Status text inside the bar */}
        <div className="absolute inset-0 flex items-center justify-center text-white text-sm text-shadow">
          {label}: {current}/{max}
        </div>
      </div>
    </div>
  );
}
