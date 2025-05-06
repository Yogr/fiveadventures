'use client';

type SpinnerSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface LoadingSpinnerProps {
  size?: SpinnerSize;
  className?: string;
}

const sizeClasses = {
  xs: 'w-3 h-3 border-[2px]',
  sm: 'w-6 h-6 border-[2px]',
  md: 'w-10 h-10 border-2',
  lg: 'w-16 h-16 border-2',
  xl: 'w-24 h-24 border-3'
};

export default function LoadingSpinner({ size = 'md', className = '' }: LoadingSpinnerProps) {
  const sizeClass = sizeClasses[size] || sizeClasses.md;
  
  return (
    <div className={`inline-block ${sizeClass} ${className} border-amber-300 border-t-amber-500 rounded-full animate-spin`} role="status">
      <span className="sr-only">Loading...</span>
    </div>
  );
}
