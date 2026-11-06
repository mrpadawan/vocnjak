import { AnimatePresence } from 'framer-motion';
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import SplashScreen from './SplashScreen';

const IntroContext = createContext({ ready: false });

/** True once the splash has finished — lets the hero start its own entrance animation. */
export const useIntro = () => useContext(IntroContext);

/**
 * Animation wrapper around the whole site: plays the cinematic splash, locks scrolling while it
 * runs, and wipes it away (AnimatePresence exit) to reveal the already-rendered dashboard.
 */
export default function IntroGate({ children }: { children: ReactNode }) {
  const [splash, setSplash] = useState(true);
  const finish = useCallback(() => setSplash(false), []);

  useEffect(() => {
    if (!splash) return;
    const html = document.documentElement;
    const prev = html.style.overflow;
    html.style.overflow = 'hidden';
    return () => {
      html.style.overflow = prev;
    };
  }, [splash]);

  return (
    <IntroContext.Provider value={{ ready: !splash }}>
      <AnimatePresence>{splash && <SplashScreen key="splash" onDone={finish} />}</AnimatePresence>
      {children}
    </IntroContext.Provider>
  );
}
