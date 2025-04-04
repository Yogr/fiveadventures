'use client';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function LoadingSpinner({ 
  size = 'md', 
  className = '' 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-6 h-6 border-2',
    md: 'w-10 h-10 border-4',
    lg: 'w-16 h-16 border-6'
  };

  return (
    <div className="flex justify-center items-center p-4">
      <div 
        className={`${sizeClasses[size]} loading-spinner ${className}`}
        aria-label="Loading"
      ></div>
    </div>
  );
}
