import { motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform, type Variants } from 'framer-motion';
import { useMemo, useRef } from 'react';
import { Apple, Leaf, Pear, Plum } from './art/Fruit';
import { useI18n } from '../lib/i18n';
import { useIntro } from './IntroGate';

const W = 1440;

const farY = (x: number) => 470 + Math.sin(x / 210) * 46 + Math.sin(x / 95) * 12;
const midY = (x: number) => 560 + Math.sin(x / 170 + 1) * 40 + Math.sin(x / 80) * 10;
const nearY = (x: number) => 680 + Math.sin(x / 260 + 2) * 46;

const hillPath = (fn: (x: number) => number) => {
  const pts: string[] = [];
  for (let x = 0; x <= W; x += 24) pts.push(`${x},${fn(x).toFixed(1)}`);
  return `M0,900 L${pts.join(' L')} L${W},900 Z`;
};


const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.25 } },
};
const letterV: Variants = {
  hidden: { y: 120, opacity: 0, rotate: 8 },
  show: { y: 0, opacity: 1, rotate: 0, transition: { type: 'spring', stiffness: 140, damping: 13 } },
};
const fadeUp: Variants = {
  hidden: { y: 26, opacity: 0 },
  show: { y: 0, opacity: 1, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } },
};

const fruits = [
  { Icon: Apple, cls: 'left-[6%] top-[26%] size-14 sm:size-20', delay: 0 },
  { Icon: Plum, cls: 'right-[9%] top-[22%] size-12 sm:size-16', delay: 0.8 },
  { Icon: Pear, cls: 'left-[14%] bottom-[30%] size-12 sm:size-16', delay: 1.6 },
  { Icon: Leaf, cls: 'right-[16%] bottom-[34%] size-10 sm:size-14', delay: 0.4 },
  { Icon: Apple, cls: 'right-[4%] bottom-[22%] size-10 sm:size-12', delay: 1.2 },
];

export default function Hero() {
  const { ready } = useIntro();
  const { t } = useI18n();
  const title = t('meta.name').split('');
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });

  // Scroll parallax: far layers barely move, near layers move more.
  const sunY = useTransform(scrollYProgress, [0, 1], [0, 220]);
  const farLayerY = useTransform(scrollYProgress, [0, 1], [0, 90]);
  const midLayerY = useTransform(scrollYProgress, [0, 1], [0, 170]);
  const nearLayerY = useTransform(scrollYProgress, [0, 1], [0, 260]);
  const textY = useTransform(scrollYProgress, [0, 1], [0, -90]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  // Pointer parallax.
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 60, damping: 18 });
  const sy = useSpring(my, { stiffness: 60, damping: 18 });
  const farX = useTransform(sx, (v) => v * -8);
  const midX = useTransform(sx, (v) => v * -18);
  const nearX = useTransform(sx, (v) => v * -34);
  const sunX = useTransform(sx, (v) => v * 10);
  const skyY = useTransform(sy, (v) => v * 6);

  const paths = useMemo(() => ({ far: hillPath(farY), mid: hillPath(midY), near: hillPath(nearY) }), []);

  // Orchard rows scattered along the mid and near hills.
  const trees = useMemo(() => {
    const out: { x: number; y: number; r: number; layer: 'mid' | 'near'; fruit: string | null }[] = [];
    const colors = ['#e0392f', '#f7be2e', '#7a3b8f', null, null];
    for (let x = 30; x < W; x += 62) out.push({ x, y: midY(x) + 6, r: 20 + ((x * 7) % 9), layer: 'mid', fruit: colors[(x / 62) % 5 | 0] });
    for (let x = 70; x < W; x += 150) out.push({ x, y: nearY(x) + 14, r: 38 + ((x * 3) % 14), layer: 'near', fruit: colors[(x / 150) % 5 | 0] });
    return out;
  }, []);

  const clouds = [
    { top: '14%', size: 'w-56 sm:w-80', dur: 90, delay: 0 },
    { top: '30%', size: 'w-40 sm:w-60', dur: 130, delay: -50 },
    { top: '8%', size: 'w-32 sm:w-44', dur: 110, delay: -90 },
  ];

  return (
    <section
      id="top"
      ref={ref}
      className="relative isolate flex min-h-[100svh] items-center justify-center overflow-hidden"
      onPointerMove={(e) => {
        if (reduce) return;
        mx.set((e.clientX / window.innerWidth - 0.5) * 2);
        my.set((e.clientY / window.innerHeight - 0.5) * 2);
      }}
    >
      {/* sky */}
      <motion.div
        className="absolute inset-[-4%] -z-30"
        style={{ y: skyY, background: 'linear-gradient(to bottom, var(--sky-top), var(--sky-mid) 55%, var(--sky-bottom))' }}
        initial={{ scale: 1.25 }}
        animate={ready ? { scale: 1 } : {}}
        transition={{ duration: 2.4, ease: [0.22, 1, 0.36, 1] }}
      />

      {/* sun / moon with organic morphing glow */}
      <motion.div className="absolute right-[10%] top-[14%] -z-20" style={{ y: sunY, x: sunX }}>
        <div className="absolute -inset-16 animate-morph rounded-full opacity-60 blur-2xl" style={{ background: 'var(--sun)' }} />
        <div className="relative size-24 rounded-full shadow-[0_0_80px_20px_var(--sun)] sm:size-32" style={{ background: 'var(--sun)' }} />
      </motion.div>

      {/* clouds */}
      {clouds.map((c, i) => (
        <motion.div
          key={i}
          className={`absolute -z-20 ${c.size}`}
          style={{ top: c.top, y: farLayerY }}
          initial={{ x: '-30vw' }}
          animate={{ x: '120vw' }}
          transition={{ duration: c.dur, repeat: Infinity, ease: 'linear', delay: c.delay }}
        >
          <svg viewBox="0 0 200 70" className="w-full opacity-80 dark:opacity-25" fill="white">
            <path d="M30 60a22 22 0 0 1 4-43 30 30 0 0 1 56-6 26 26 0 0 1 44 12 24 24 0 0 1 36 37z" />
          </svg>
        </motion.div>
      ))}

      {/* layered hills */}
      <motion.svg
        viewBox={`0 0 ${W} 900`}
        preserveAspectRatio="xMidYMax slice"
        className="absolute inset-x-[-3%] bottom-0 -z-10 h-[88%] w-[106%]"
        style={{ y: farLayerY, x: farX }}
        aria-hidden
      >
        <path d={paths.far} fill="var(--hill-far)" />
      </motion.svg>

      <motion.svg
        viewBox={`0 0 ${W} 900`}
        preserveAspectRatio="xMidYMax slice"
        className="absolute inset-x-[-4%] bottom-0 -z-10 h-[88%] w-[108%]"
        style={{ y: midLayerY, x: midX }}
        initial={{ scale: 1.12, transformOrigin: '50% 100%' }}
        animate={ready ? { scale: 1 } : {}}
        transition={{ duration: 2.2, ease: [0.22, 1, 0.36, 1] }}
        aria-hidden
      >
        <path d={paths.mid} fill="var(--hill-mid)" />
        {trees
          .filter((t) => t.layer === 'mid')
          .map((t, i) => (
            <g key={i}>
              <rect x={t.x - 2.5} y={t.y - 6} width="5" height="16" fill="#5b3a1e" opacity=".7" />
              <circle cx={t.x} cy={t.y - 16} r={t.r} fill="var(--tree-a)" />
              <circle cx={t.x - 7} cy={t.y - 10} r={t.r * 0.62} fill="var(--tree-b)" />
              {t.fruit && <circle cx={t.x + 6} cy={t.y - 22} r="3.4" fill={t.fruit} />}
            </g>
          ))}
      </motion.svg>

      <motion.svg
        viewBox={`0 0 ${W} 900`}
        preserveAspectRatio="xMidYMax slice"
        className="absolute inset-x-[-6%] bottom-0 -z-10 h-[88%] w-[112%]"
        style={{ y: nearLayerY, x: nearX }}
        initial={{ scale: 1.22, transformOrigin: '50% 100%' }}
        animate={ready ? { scale: 1 } : {}}
        transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }}
        aria-hidden
      >
        <path d={paths.near} fill="var(--hill-near)" />
        {trees
          .filter((t) => t.layer === 'near')
          .map((t, i) => (
            <g key={i}>
              <rect x={t.x - 5} y={t.y - 10} width="10" height="36" fill="#4a2f17" opacity=".8" />
              <circle cx={t.x} cy={t.y - 34} r={t.r} fill="var(--tree-a)" />
              <circle cx={t.x - 14} cy={t.y - 22} r={t.r * 0.62} fill="var(--tree-b)" />
              <circle cx={t.x + 16} cy={t.y - 26} r={t.r * 0.55} fill="var(--tree-b)" />
              {t.fruit && (
                <>
                  <circle cx={t.x + 12} cy={t.y - 44} r="6" fill={t.fruit} />
                  <circle cx={t.x - 16} cy={t.y - 30} r="5.4" fill={t.fruit} />
                </>
              )}
            </g>
          ))}
      </motion.svg>

      {/* soft fade into the page below */}
      <div className="absolute inset-x-0 bottom-0 -z-10 h-40 bg-gradient-to-t from-paper to-transparent" />

      {/* draggable fruit */}
      {fruits.map(({ Icon, cls, delay }, i) => (
        <motion.div
          key={i}
          className={`absolute z-10 cursor-grab touch-none active:cursor-grabbing ${cls}`}
          drag={!reduce}
          dragSnapToOrigin
          dragElastic={0.5}
          whileHover={{ scale: 1.2, rotate: 8 }}
          whileDrag={{ scale: 1.35, rotate: -14 }}
          initial={{ opacity: 0, scale: 0, y: 60 }}
          animate={ready ? { opacity: 1, scale: 1, y: 0 } : {}}
          transition={{ type: 'spring', stiffness: 200, damping: 12, delay: 1 + delay * 0.2 }}
        >
          <div className="animate-bob size-full" style={{ animationDelay: `${delay}s` }}>
            <Icon className="size-full drop-shadow-xl" />
          </div>
        </motion.div>
      ))}

      {/* copy */}
      <motion.div
        className="relative z-20 mx-auto max-w-5xl px-5 pt-20 text-center text-white"
        style={{ y: textY, opacity: textOpacity }}
        variants={container}
        initial="hidden"
        animate={ready ? 'show' : 'hidden'}
      >
        <motion.p
          variants={fadeUp}
          className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full bg-black/25 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.3em] backdrop-blur sm:text-sm"
        >
          <span className="size-2 animate-pulse rounded-full bg-sun-400" /> {t('splash.region')}
        </motion.p>

        <h1 className="font-display text-[clamp(4.2rem,19vw,13rem)] font-extrabold leading-[0.9] tracking-tight drop-shadow-[0_6px_0_rgba(8,33,15,0.35)]" aria-label={t('meta.name')}>
          <motion.span className="inline-flex overflow-hidden px-2 pb-8 -mb-4" variants={container} aria-hidden>
            {title.map((c, i) => (
              <motion.span
                key={i}
                variants={letterV}
                className="inline-block cursor-default"
                whileHover={{ y: -18, rotate: i % 2 ? 7 : -7, color: '#f7be2e', transition: { type: 'spring', stiffness: 400, damping: 10 } }}
              >
                {c}
              </motion.span>
            ))}
          </motion.span>
        </h1>

        <motion.p
          variants={fadeUp}
          className="mx-auto mt-3 max-w-2xl rounded-3xl bg-leaf-950/35 px-5 py-3 text-lg font-semibold text-white backdrop-blur-sm sm:text-2xl"
        >
          {t('hero.tagline')}
        </motion.p>

        <motion.div variants={fadeUp} className="mt-5 flex flex-wrap items-center justify-center gap-2 text-sm font-bold">
          <a href="#mapa" className="rounded-full bg-white/90 px-4 py-2 text-leaf-950 shadow transition hover:scale-105">
            {t('hero.pillLocation')}
          </a>
          <a href="#atrakcije" className="rounded-full bg-sun-400 px-4 py-2 text-leaf-950 shadow transition hover:scale-105">
            {t('hero.pillTrsic')}
          </a>
        </motion.div>

        <motion.div variants={fadeUp} className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
          <a
            href="#mapa"
            className="group inline-flex items-center gap-2 rounded-full bg-sun-400 px-7 py-4 text-base font-extrabold text-leaf-950 shadow-[0_6px_0_#b9830a] transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_0_#b9830a] active:translate-y-1 active:shadow-[0_2px_0_#b9830a]"
          >
            {t('hero.ctaMap')}
            <span className="transition-transform group-hover:translate-x-1" aria-hidden>
              →
            </span>
          </a>
          <a
            href="#fk"
            className="inline-flex items-center gap-2 rounded-full border-2 border-white/80 bg-white/10 px-7 py-[14px] text-base font-extrabold text-white backdrop-blur transition hover:bg-white hover:text-leaf-900"
          >
            {t('hero.ctaFk')}
          </a>
        </motion.div>
      </motion.div>

      {/* scroll cue */}
      <motion.a
        href="#atrakcije"
        aria-label={t('hero.scroll')}
        className="absolute bottom-6 left-1/2 z-20 hidden -translate-x-1/2 sm:block"
        initial={{ opacity: 0 }}
        animate={ready ? { opacity: 1 } : {}}
        transition={{ delay: 2 }}
      >
        <span className="flex h-11 w-7 justify-center rounded-full border-2 border-ink/60 pt-2">
          <motion.span className="h-2 w-1 rounded-full bg-ink/70" animate={{ y: [0, 14, 0] }} transition={{ duration: 1.6, repeat: Infinity }} />
        </span>
      </motion.a>
    </section>
  );
}
