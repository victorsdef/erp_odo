import { useWindowDimensions } from 'react-native';

export const BREAKPOINTS = { tablet: 768, desktop: 1024 };

export function useBreakpoint() {
  const { width } = useWindowDimensions();
  return {
    width,
    isMobile:  width < BREAKPOINTS.tablet,
    isTablet:  width >= BREAKPOINTS.tablet && width < BREAKPOINTS.desktop,
    isDesktop: width >= BREAKPOINTS.desktop,
    isLarge:   width >= BREAKPOINTS.tablet,
  };
}
