import { AnimatePresence, motion } from 'framer-motion';
import { useMemo, useState } from 'react';
import { KIND_META, mapsUrl, places, type PlaceKind } from '../data/places';
import { useI18n } from '../lib/i18n';
import Reveal from './Reveal';

type Filter = 'all' | PlaceKind;

/** Directory of everyday places and local businesses in the village (names from Google Maps). */
export default function Directory({ onShowOnMap }: { onShowOnMap: (id: string) => void }) {
  const { t, tr } = useI18n();
  const [filter, setFilter] = useState<Filter>('all');
  const list = useMemo(() => places.filter((p) => !p.featured), []);
  const kinds = useMemo(() => [...new Set(list.map((p) => p.kind))], [list]);
  const items = list.filter((p) => filter === 'all' || p.kind === filter);

  return (
    <section id="mesta" className="relative mx-auto max-w-6xl px-4 pb-24 sm:px-6 sm:pb-32">
      <Reveal className="max-w-2xl">
        <p className="mb-2 text-sm font-extrabold uppercase tracking-[0.3em] text-apple-500">{t('dir.eyebrow')}</p>
        <h2 className="font-display text-4xl font-extrabold leading-tight sm:text-5xl">{t('dir.title')}</h2>
        <p className="mt-4 text-lg text-muted">{t('dir.intro')}</p>
      </Reveal>

      <Reveal className="mt-8 flex flex-wrap gap-2" delay={0.1}>
        {(['all', ...kinds] as Filter[]).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            aria-pressed={filter === f}
            className="relative rounded-full px-4 py-2 text-sm font-extrabold text-ink ring-1 ring-line transition hover:ring-ink/40"
          >
            {filter === f && (
              <motion.span layoutId="dir-pill" className="absolute inset-0 rounded-full bg-sun-400" transition={{ type: 'spring', stiffness: 400, damping: 30 }} />
            )}
            <span className={`relative ${filter === f ? 'text-leaf-950' : ''}`}>
              {f === 'all' ? t('att.all') : `${KIND_META[f].emoji} ${tr(KIND_META[f].label)}`}
            </span>
          </button>
        ))}
      </Reveal>

      <motion.ul layout className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {items.map((p, i) => {
            const meta = KIND_META[p.kind];
            return (
              <motion.li
                key={p.id}
                layout
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                exit={{ opacity: 0, scale: 0.92 }}
                transition={{ duration: 0.4, delay: (i % 3) * 0.05 }}
              >
                <motion.article
                  whileHover={{ y: -4 }}
                  className="flex h-full flex-col gap-3 rounded-3xl bg-card p-5 shadow-md ring-1 ring-line transition-shadow hover:shadow-xl"
                >
                  <div className="flex items-start gap-3.5">
                    <span
                      className="grid size-12 shrink-0 place-items-center rounded-2xl text-2xl shadow-inner"
                      style={{ background: `${meta.color}26` }}
                      aria-hidden
                    >
                      {meta.emoji}
                    </span>
                    <div className="min-w-0">
                      <h3 className="font-display text-xl font-extrabold leading-tight">{tr(p.name)}</h3>
                      <p className="mt-0.5 text-sm font-bold" style={{ color: meta.color }}>
                        {tr(meta.label)}
                      </p>
                    </div>
                  </div>
                  <p className="flex-1 text-sm text-muted">{tr(p.description)}</p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => onShowOnMap(p.id)}
                      className="rounded-full bg-leaf-800 px-4 py-2 text-sm font-extrabold text-white transition hover:bg-leaf-600"
                    >
                      📍 {t('att.onMap')}
                    </button>
                    <a
                      href={mapsUrl(p)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-full border-2 border-ink/15 px-4 py-2 text-sm font-extrabold transition hover:border-ink"
                    >
                      {t('dir.gmaps')}
                    </a>
                  </div>
                </motion.article>
              </motion.li>
            );
          })}
        </AnimatePresence>
      </motion.ul>
    </section>
  );
}
