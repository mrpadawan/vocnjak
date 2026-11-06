import { motion } from 'framer-motion';
import { useEffect, useState, type ReactNode } from 'react';
import { WEATHER_COORDS, externalLinks, type ExternalLink } from '../data/links';
import { useI18n } from '../lib/i18n';
import Reveal from './Reveal';

const icons: Record<ExternalLink['id'], ReactNode> = {
  loznica: (
    <svg viewBox="0 0 48 48" className="size-full" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 20 24 8l18 12M10 20v18M20 20v18M28 20v18M38 20v18M6 40h36" />
    </svg>
  ),
  weather: (
    <svg viewBox="0 0 48 48" className="size-full" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="18" cy="18" r="7" />
      <path d="M18 4v3M5 18h3M8.7 8.7l2 2M27.3 8.7l-2 2" />
      <path d="M16 38h20a8 8 0 0 0 1-15.9A10 10 0 0 0 18 24a7 7 0 0 0-2 14z" />
    </svg>
  ),
  facebook: (
    <svg viewBox="0 0 48 48" className="size-full" fill="currentColor">
      <path d="M27 44V26h6l1-7h-7v-4c0-2 .8-3.4 3.5-3.4H34V5.3C33.3 5.2 31.300 5 29 5c-5 0-8 3-8 8.4V19h-6v7h6v18z" />
    </svg>
  ),
  instagram: (
    <svg viewBox="0 0 48 48" className="size-full" fill="none" stroke="currentColor" strokeWidth="3.2">
      <rect x="6" y="6" width="36" height="36" rx="10" />
      <circle cx="24" cy="24" r="8.5" />
      <circle cx="34" cy="14" r="1.8" fill="currentColor" stroke="none" />
    </svg>
  ),
};

const styles: Record<ExternalLink['id'], string> = {
  loznica: 'bg-sun-400 text-leaf-950 shadow-leaf-950',
  weather: 'bg-[#1d6fd6] text-white shadow-leaf-950',
  facebook: 'bg-[#1877f2] text-white shadow-leaf-950',
  instagram: 'bg-gradient-to-br from-[#feda75] via-[#d62976] to-[#4f5bd5] text-white shadow-leaf-950',
};

function useTemperature() {
  const [temp, setTemp] = useState<number | null>(null);
  useEffect(() => {
    const ctl = new AbortController();
    const { lat, lon } = WEATHER_COORDS;
    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m`, { signal: ctl.signal })
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((d) => typeof d?.current?.temperature_2m === 'number' && setTemp(Math.round(d.current.temperature_2m)))
      .catch(() => {
        /* the chip simply stays hidden when offline or blocked */
      });
    return () => ctl.abort();
  }, []);
  return temp;
}

export default function ExternalLinks() {
  const temp = useTemperature();
  const { t } = useI18n();

  return (
    <section id="linkovi" className="relative mx-auto max-w-6xl px-4 py-24 sm:px-6 sm:py-32">
      <Reveal className="mx-auto max-w-2xl text-center">
        <p className="mb-2 text-sm font-extrabold uppercase tracking-[0.3em] text-apple-500">{t('links.eyebrow')}</p>
        <h2 className="font-display text-4xl font-extrabold leading-tight sm:text-6xl">{t('links.title')}</h2>
        <p className="mt-4 text-lg text-muted">{t('links.intro')}</p>
      </Reveal>

      <ul className="mt-12 grid gap-5 sm:grid-cols-2 sm:gap-6">
        {externalLinks.map((l, i) => (
          <Reveal as="li" key={l.id} delay={i * 0.08} y={40}>
            <motion.a
              href={l.href}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ x: -4, y: -4 }}
              whileTap={{ x: 4, y: 4 }}
              transition={{ type: 'spring', stiffness: 500, damping: 25 }}
              className={`group relative flex items-center gap-5 overflow-hidden rounded-[2rem] border-[3px] border-leaf-950 p-6 shadow-[8px_8px_0_0] transition-shadow hover:shadow-[12px_12px_0_0] active:shadow-[2px_2px_0_0] sm:p-8 dark:border-white/80 dark:shadow-white/80 ${styles[l.id]}`}
            >
              <span className="size-16 shrink-0 transition-transform duration-300 group-hover:rotate-[-8deg] group-hover:scale-110 sm:size-20">{icons[l.id]}</span>
              <span className="min-w-0 flex-1">
                <span className="block font-display text-2xl font-extrabold leading-tight sm:text-3xl">{t(`links.${l.id}.label`)}</span>
                <span className="mt-1 block text-sm font-semibold opacity-85 sm:text-base">{t(`links.${l.id}.hint`)}</span>
                {l.id === 'weather' && temp !== null && (
                  <span className="mt-3 inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-sm font-extrabold">
                    <span className="size-2 animate-pulse rounded-full bg-green-300" /> {t('links.now', { temp })}
                  </span>
                )}
              </span>
              <span
                className="grid size-12 shrink-0 place-items-center rounded-full bg-black/15 text-2xl transition-all duration-300 group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:bg-black/30"
                aria-hidden
              >
                ↗
              </span>
              <span className="sr-only">{t('links.newTab')}</span>
            </motion.a>
          </Reveal>
        ))}
      </ul>
    </section>
  );
}
