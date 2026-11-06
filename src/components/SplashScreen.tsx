import { motion, useReducedMotion, type Variants } from 'framer-motion';
import { useEffect } from 'react';
import { useI18n } from '../lib/i18n';
import { Apple, Leaf, Pear, Plum } from './art/Fruit';

/** Total time the splash stays on screen before auto-continuing. */
const DURATION_MS = 3900;

const letter: Variants = {
  hidden: { opacity: 0, y: 60, scale: 0.5, rotate: -10, filter: 'blur(14px)' },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    rotate: 0,
    filter: 'blur(0px)',
    transition: { type: 'spring', stiffness: 160, damping: 14 },
  },
};

const word: Variants = {
  hidden: {},
  show: (delay: number) => ({ transition: { staggerChildren: 0.055, delayChildren: delay } }),
};

function Word({ text, delay, className }: { text: string; delay: number; className: string }) {
  return (
    <motion.span className={`inline-flex ${className}`} variants={word} custom={delay} initial="hidden" animate="show" aria-hidden>
      {text.split('').map((c, i) => (
        <motion.span key={i} variants={letter} className="inline-block">
          {/* inline-block collapses a plain space, so use a non-breaking one */}
          {c === ' ' ? ' ' : c}
        </motion.span>
      ))}
    </motion.span>
  );
}

const orbit = [
  { Icon: Apple, r: 190, size: 52, dur: 26, start: 0 },
  { Icon: Plum, r: 250, size: 44, dur: 34, start: 120 },
  { Icon: Pear, r: 215, size: 48, dur: 30, start: 240 },
  { Icon: Leaf, r: 290, size: 38, dur: 40, start: 70 },
  { Icon: Apple, r: 330, size: 34, dur: 46, start: 200 },
];

const iris = (r: string) => `circle(${r} at 50% 50%)`;

export default function SplashScreen({ onDone }: { onDone: () => void }) {
  const reduce = useReducedMotion();
  const { t } = useI18n();

  useEffect(() => {
    const t = window.setTimeout(onDone, reduce ? 900 : DURATION_MS);
    return () => window.clearTimeout(t);
  }, [onDone, reduce]);

  const wipe = { duration: reduce ? 0.2 : 1.05, ease: [0.76, 0, 0.24, 1] as const };

  return (
    <motion.div
      className="fixed inset-0 z-[100]"
      role="status"
      aria-live="polite"
      aria-label={t('splash.aria')}
      exit={{ opacity: 1 }}
    >
      {/* Layer 2 (sun yellow) peeks out as the green iris closes, then closes itself. */}
      <motion.div
        className="absolute inset-0 bg-sun-400"
        initial={{ clipPath: iris('150%') }}
        animate={{ clipPath: iris('150%') }}
        exit={{ clipPath: iris('0%'), transition: { ...wipe, delay: reduce ? 0 : 0.22 } }}
      />

      {/* Layer 1 (deep green) holds the cinematic title sequence. */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center overflow-hidden bg-leaf-950"
        style={{ backgroundImage: 'radial-gradient(ellipse at 50% 55%, #1f6535 0%, #0e3320 45%, #08210f 100%)' }}
        initial={{ clipPath: iris('150%') }}
        animate={{ clipPath: iris('150%') }}
        exit={{ clipPath: iris('0%'), transition: wipe }}
      >
        {/* orbiting fruit */}
        {!reduce &&
          orbit.map(({ Icon, r, size, dur, start }, i) => (
            <motion.div
              key={i}
              className="absolute left-1/2 top-1/2 size-0"
              initial={{ opacity: 0, rotate: start, scale: 0.2 }}
              animate={{ opacity: 0.9, rotate: start + 360, scale: 1 }}
              transition={{
                opacity: { duration: 1.2, delay: 0.2 + i * 0.15 },
                scale: { duration: 1.4, delay: 0.2 + i * 0.15, ease: 'easeOut' },
                rotate: { duration: dur, repeat: Infinity, ease: 'linear' },
              }}
            >
              <div style={{ transform: `translateX(${r}px)` }} className="max-sm:scale-[0.7]">
                <Icon width={size} height={size} className="-translate-x-1/2 -translate-y-1/2 drop-shadow-lg" />
              </div>
            </motion.div>
          ))}

        <div className="relative px-6 text-center">
          <motion.p
            className="mb-5 text-xs font-bold uppercase tracking-[0.5em] text-sun-300 sm:text-sm"
            initial={{ opacity: 0, letterSpacing: '1em' }}
            animate={{ opacity: 1, letterSpacing: '0.5em' }}
            transition={{ duration: 1.4, delay: 0.1 }}
            exit={{ opacity: 0, transition: { duration: 0.3 } }}
          >
            {t('splash.region')}
          </motion.p>

          <motion.h1
            className="font-display text-white"
            aria-label={t('splash.aria')}
            exit={{ scale: 1.9, opacity: 0, filter: 'blur(10px)', transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] } }}
          >
            <span className="block text-3xl font-semibold italic sm:text-5xl md:text-6xl">
              <Word text={t('splash.welcome')} delay={0.45} className="" />
            </span>
            <span className="mt-1 block text-[clamp(3.6rem,17vw,11rem)] font-extrabold leading-[0.95] tracking-tight text-sun-400">
              <Word text={t('meta.name')} delay={1.15} className="" />
            </span>
          </motion.h1>

          <motion.div
            className="mx-auto mt-8 h-1 origin-left rounded-full bg-apple-500"
            style={{ width: 'min(260px, 60vw)' }}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1.2, delay: 1.9, ease: [0.22, 1, 0.36, 1] }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
          />
        </div>

        <motion.button
          type="button"
          onClick={onDone}
          className="absolute bottom-8 right-6 rounded-full border border-white/30 px-4 py-2 text-sm font-semibold text-white/80 backdrop-blur transition hover:bg-white/10 hover:text-white sm:right-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          exit={{ opacity: 0, transition: { duration: 0.2 } }}
        >
          {t('splash.skip')}
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
