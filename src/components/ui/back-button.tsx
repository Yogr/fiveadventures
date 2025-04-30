'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { HiChevronLeft } from 'react-icons/hi';

interface BackButtonProps {
  href?: string;
  onClick?: () => void;
  className?: string;
}

export default function BackButton({ href, onClick, className = '' }: BackButtonProps) {
  const router = useRouter();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (!href) {
      router.back();
    }
  };

  const baseClasses = "inline-flex items-center text-amber-300 hover:text-amber-200 transition-colors";
  const combinedClasses = `${baseClasses} ${className}`;

  if (href) {
    return (
      <Link href={href} className={combinedClasses}>
        <HiChevronLeft className="mr-1" />
        <span>Back</span>
      </Link>
    );
  }

  return (
    <button onClick={handleClick} className={combinedClasses}>
      <HiChevronLeft className="mr-1" />
      <span>Back</span>
    </button>
  );
}
