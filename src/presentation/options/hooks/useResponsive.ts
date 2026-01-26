import { useState, useEffect } from 'react';

type Breakpoint = 'mobile' | 'tablet' | 'desktop';

interface ResponsiveState {
  breakpoint: Breakpoint;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  width: number;
}

const BREAKPOINTS = {
  mobile: 768,
  tablet: 1024,
} as const;

function getBreakpoint(width: number): Breakpoint {
  if (width < BREAKPOINTS.mobile) return 'mobile';
  if (width < BREAKPOINTS.tablet) return 'tablet';
  return 'desktop';
}

export function useResponsive(): ResponsiveState {
  const [state, setState] = useState<ResponsiveState>(() => {
    const width = typeof window !== 'undefined' ? window.innerWidth : 1024;
    const breakpoint = getBreakpoint(width);
    return {
      breakpoint,
      isMobile: breakpoint === 'mobile',
      isTablet: breakpoint === 'tablet',
      isDesktop: breakpoint === 'desktop',
      width,
    };
  });

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const breakpoint = getBreakpoint(width);
      setState({
        breakpoint,
        isMobile: breakpoint === 'mobile',
        isTablet: breakpoint === 'tablet',
        isDesktop: breakpoint === 'desktop',
        width,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return state;
}
