import { AnimatePresence, motion, type PanInfo } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { KIND_META, mapsUrl, places, type Place } from '../../data/places';
import { useI18n } from '../../lib/i18n';
import SceneArt from '../art/SceneArt';

interface Props {
  place: Place | null;
  compact: boolean;
  onClose: () => void;
  onSelect: (id: string) => void;
}

/**
 * Info popup for a clicked pin: a desktop side card / mobile bottom sheet with a swipeable
 * image gallery, quick facts and previous / next navigation between places.
 */
export default function LocationModal({ place, compact, onClose, onSelect }: Props) {
  const index = place ? places.findIndex((p) => p.id === place.id) : -1;
  const step = (d: number) => onSelect(places[(index + d + places.length) % places.length].id);

  useEffect(() => {
    if (!place) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [place, onClose]);

  return (
    <AnimatePresence mode="wait">
      {place && (
        <motion.aside
          key={place.id}
          role="dialog"
          aria-labelledby="place-title"
          className={`absolute z-30 overflow-y-auto overscroll-contain bg-card text-ink shadow-2xl ring-1 ring-line ${
            compact ? 'inset-x-2 bottom-2 max-h-[58%] rounded-3xl' : 'bottom-4 right-4 top-16 w-[26rem] rounded-[2rem]'
          }`}
          initial={compact ? { y: '110%', opacity: 0.6 } : { x: 80, opacity: 0, scale: 0.96 }}
          animate={compact ? { y: 0, opacity: 1 } : { x: 0, opacity: 1, scale: 1 }}
          exit={compact ? { y: '110%', opacity: 0 } : { x: 60, opacity: 0, scale: 0.97 }}
          transition={{ type: 'spring', stiffness: 220, damping: 26, delay: 0.25 }}
        >
          <PlaceBody place={place} index={index} step={step} onClose={onClose} />
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

function PlaceBody({ place, index, step, onClose }: { place: Place; index: number; step: (d: number) => void; onClose: () => void }) {
  const { t, tr } = useI18n();
  const [slide, setSlide] = useState(0);
  const [dir, setDir] = useState(1);
  const closeRef = useRef<HTMLButtonElement>(null);
  const meta = KIND_META[place.kind];
  const n = place.images.length;

  useEffect(() => {
    closeRef.current?.focus({ preventScroll: true });
  }, []);

  const go = (d: number) => {
    setDir(d);
    setSlide((s) => (s + d + n) % n);
  };
  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (n < 2) return;
    if (info.offset.x < -50) go(1);
    else if (info.offset.x > 50) go(-1);
  };

  const image = place.images[slide];

  return (
    <div>
      <div className="relative aspect-[4/3] overflow-hidden bg-leaf-900 max-sm:aspect-[16/9]">
        <AnimatePresence initial={false} custom={dir} mode="popLayout">
          <motion.div
            key={slide}
            custom={dir}
            className={`absolute inset-0 ${n > 1 ? 'cursor-grab active:cursor-grabbing' : ''}`}
            variants={{
              enter: (d: number) => ({ x: `${d * 100}%`, opacity: 0.6 }),
              center: { x: 0, opacity: 1 },
              exit: (d: number) => ({ x: `${-d * 60}%`, opacity: 0 }),
            }}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: 'spring', stiffness: 260, damping: 30 }}
            drag={n > 1 ? 'x' : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.25}
            onDragEnd={onDragEnd}
          >
            <SceneArt variant={image.variant} tone={image.tone} className="size-full" title={tr(image.caption)} />
          </motion.div>
        </AnimatePresence>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-4 pb-3 pt-10 text-sm font-semibold text-white">
          {tr(image.caption)}
        </div>

        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label={t('map.close')}
          className="absolute right-3 top-3 grid size-10 place-items-center rounded-full bg-black/50 text-white backdrop-blur transition hover:scale-110 hover:bg-black/70"
        >
          ✕
        </button>

        {n > 1 && (
          <>
            {([-1, 1] as const).map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => go(d)}
                aria-label={d < 0 ? t('modal.imgPrev') : t('modal.imgNext')}
                className={`absolute top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-full bg-white/85 text-leaf-950 shadow transition hover:scale-110 ${d < 0 ? 'left-3' : 'right-3'}`}
              >
                {d < 0 ? '‹' : '›'}
              </button>
            ))}
            <div className="absolute bottom-3 right-4 flex gap-1.5">
              {place.images.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={t('modal.imgN', { n: i + 1 })}
                  onClick={() => {
                    setDir(i > slide ? 1 : -1);
                    setSlide(i);
                  }}
                  className={`h-2 rounded-full transition-all ${i === slide ? 'w-6 bg-white' : 'w-2 bg-white/50'}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <div className="p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-white"
            style={{ background: meta.color }}
          >
            <span aria-hidden>{meta.emoji}</span> {tr(meta.label)}
          </span>
          {place.walk && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-sun-400 px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-leaf-950">
              <span aria-hidden>🚶</span> {tr(place.walk)}
            </span>
          )}
        </div>
        <h3 id="place-title" className="mt-3 font-display text-2xl font-extrabold leading-tight sm:text-3xl">
          {tr(place.name)}
        </h3>
        <p className="mt-1 font-semibold text-apple-500">{tr(place.tagline)}</p>
        <p className="mt-3 leading-relaxed text-muted">{tr(place.description)}</p>

        {place.facts.length > 0 && (
          <dl className="mt-5 grid grid-cols-2 gap-2.5">
            {place.facts.map((f, i) => (
              <motion.div
                key={i}
                className="rounded-2xl bg-paper p-3 ring-1 ring-line"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 + i * 0.06 }}
              >
                <dt className="text-[11px] font-bold uppercase tracking-wider text-muted">{tr(f.label)}</dt>
                <dd className="mt-0.5 text-sm font-extrabold">{tr(f.value)}</dd>
              </motion.div>
            ))}
          </dl>
        )}

        <a
          href={mapsUrl(place)}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-sun-400 px-4 py-3 text-sm font-extrabold text-leaf-950 transition hover:scale-[1.02] active:scale-95"
        >
          {t('modal.gmaps')}
        </a>
        {place.approx && <p className="mt-2 text-center text-xs text-muted">{t('modal.approx')}</p>}

        <div className="mt-5 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => step(-1)}
            className="rounded-full border-2 border-ink/15 px-4 py-2 text-sm font-bold transition hover:border-ink hover:bg-ink hover:text-paper"
          >
            {t('modal.prev')}
          </button>
          <span className="text-xs font-bold text-muted">
            {index + 1} / {places.length}
          </span>
          <button
            type="button"
            onClick={() => step(1)}
            className="rounded-full bg-leaf-700 px-4 py-2 text-sm font-bold text-white transition hover:bg-leaf-600"
          >
            {t('modal.next')}
          </button>
        </div>
      </div>
    </div>
  );
}
