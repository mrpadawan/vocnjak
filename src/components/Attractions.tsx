import { AnimatePresence, motion } from 'framer-motion';
import { useMemo, useState } from 'react';
import { KIND_META, places, type PlaceKind } from '../data/places';
import { useI18n } from '../lib/i18n';
import Marquee from './Marquee';
import Reveal from './Reveal';
import SceneArt from './art/SceneArt';

type Filter = 'all' | PlaceKind;

export default function Attractions({ onShowOnMap }: { onShowOnMap: (id: string) => void }) {
  const { t, tl, tr } = useI18n();
  const [filter, setFilter] = useState<Filter>('all');
  const featured = useMemo(() => places.filter((p) => p.featured), []);
  const kinds = useMemo(() => [...new Set(featured.map((p) => p.kind))], [featured]);
  const items = useMemo(() => featured.filter((p) => filter === 'all' || p.kind === filter), [featured, filter]);

  return (
    <>
      <Marquee
        className="-rotate-1 scale-[1.03] bg-leaf-900 py-4 font-display text-2xl font-extrabold italic text-sun-300 shadow-xl sm:text-4xl"
        items={tl('att.marquee')}
      />

      <section id="atrakcije" className="relative mx-auto max-w-6xl px-4 py-24 sm:px-6 sm:py-32">
        {/* organic background shapes */}
        <div className="pointer-events-none absolute -left-24 top-24 -z-10 size-72 animate-morph bg-sun-400/25 blur-2xl" aria-hidden />
        <div className="pointer-events-none absolute -right-20 bottom-20 -z-10 size-80 animate-morph bg-leaf-500/20 blur-2xl [animation-delay:-6s]" aria-hidden />

        <Reveal className="max-w-2xl">
          <p className="mb-2 text-sm font-extrabold uppercase tracking-[0.3em] text-apple-500">{t('att.eyebrow')}</p>
          <h2 className="font-display text-4xl font-extrabold leading-tight sm:text-6xl">{t('att.title')}</h2>
          <p className="mt-4 text-lg text-muted">
            {t('att.intro1')}
            <strong className="text-ink">{t('att.introStrong')}</strong>
            {t('att.intro2')}
          </p>
        </Reveal>

        <Reveal className="mt-8 flex flex-wrap gap-2" delay={0.1}>
          {(['all', ...kinds] as Filter[]).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              aria-pressed={filter === f}
              className="relative rounded-full px-5 py-2.5 text-sm font-extrabold text-ink ring-1 ring-line transition hover:ring-ink/40"
            >
              {filter === f && (
                <motion.span
                  layoutId="filter-pill"
                  className="absolute inset-0 rounded-full bg-sun-400"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <span className={`relative ${filter === f ? 'text-leaf-950' : ''}`}>
                {f === 'all' ? t('att.all') : `${KIND_META[f].emoji} ${tr(KIND_META[f].label)}`}
              </span>
            </button>
          ))}
        </Reveal>

        <motion.ul layout className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          <AnimatePresence mode="popLayout">
            {items.map((p, i) => {
              const meta = KIND_META[p.kind];
              return (
                <motion.li
                  key={p.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9, y: 30 }}
                  whileInView={{ opacity: 1, scale: 1, y: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.5, delay: (i % 3) * 0.08, ease: [0.22, 1, 0.36, 1] }}
                  className="lg:nth-[3n+2]:translate-y-10"
                >
                  <motion.article
                    whileHover={{ y: -8, rotate: i % 2 ? 0.6 : -0.6 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 18 }}
                    className="group flex h-full flex-col overflow-hidden rounded-[2rem] bg-card shadow-lg ring-1 ring-line transition-shadow hover:shadow-2xl"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <SceneArt
                        variant={p.images[0].variant}
                        tone={p.images[0].tone}
                        title={tr(p.images[0].caption)}
                        className="size-full transition-transform duration-700 ease-out group-hover:scale-[1.14]"
                      />
                      <span
                        className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-white shadow-md"
                        style={{ background: meta.color }}
                      >
                        <span aria-hidden>{meta.emoji}</span> {tr(meta.label)}
                      </span>
                      {p.walk && (
                        <span className="absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-sun-400 px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-leaf-950 shadow-md">
                          <span aria-hidden>🚶</span> {tr(p.walk)}
                        </span>
                      )}
                      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/40 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    </div>

                    <div className="flex flex-1 flex-col p-6">
                      <h3 className="font-display text-2xl font-extrabold leading-tight">{tr(p.name)}</h3>
                      <p className="mt-1 font-semibold text-apple-500">{tr(p.tagline)}</p>
                      <p className="mt-3 line-clamp-3 flex-1 text-muted">{tr(p.description)}</p>
                      <button
                        type="button"
                        onClick={() => onShowOnMap(p.id)}
                        className="mt-5 inline-flex w-fit items-center gap-2 rounded-full bg-leaf-800 px-5 py-2.5 text-sm font-extrabold text-white transition hover:bg-leaf-600 group-hover:gap-3"
                      >
                        📍 {t('att.onMap')} <span aria-hidden>→</span>
                      </button>
                    </div>
                  </motion.article>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </motion.ul>
      </section>
    </>
  );
}
