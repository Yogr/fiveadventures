'use client';

import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useIsomorphicLayoutEffect } from '@/lib/use-isomorphic-layout-effect';

interface ClientOnlyProps {
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * ClientOnly component ensures that children are only rendered on the client side.
 * This helps avoid hydration mismatches and useLayoutEffect warnings.
 */
export default function ClientOnly({ children, fallback = null }: ClientOnlyProps) {
  const [isMounted, setIsMounted] = useState(false);

  // Use our custom hook instead of useLayoutEffect
  useIsomorphicLayoutEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return fallback;
  }

  return <>{children}</>;
}
