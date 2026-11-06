import { AnimatePresence, motion } from 'framer-motion';
import { Suspense, lazy, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  GOOGLE_MAPS_VILLAGE,
  TRSIC_WALK_MIN,
  VILLAGE_CENTER,
  WALK_TO_TRSIC_URL,
  googleMapsEmbed,
} from '../../data/geo';
import { KIND_META, placeById, places, type PlaceKind } from '../../data/places';
import { useI18n } from '../../lib/i18n';
import { useMediaQuery } from '../../lib/useMediaQuery';
import { useTheme } from '../../lib/theme';
import Reveal from '../Reveal';
import SceneArt from '../art/SceneArt';
import LocationModal from './LocationModal';
import MapErrorBoundary from './MapErrorBoundary';

// three.js + R3F are heavy: they load only when the map section is about to be seen.
const VillageScene = lazy(() => import('./VillageScene'));

interface Props {
  activeId: string | null;
  onSelect: (id: string | null) => void;
}

type Mode = '3d' | 'real';

function Loading({ label }: { label: string }) {
  return (
    <div className="absolute inset-0 grid place-items-center">
      <div className="flex flex-col items-center gap-3 text-white">
        <div className="size-12 animate-spin rounded-full border-4 border-white/30 border-t-sun-400" />
        <p className="text-sm font-bold">{label}</p>
      </div>
    </div>
  );
}

function Compass({ innerRef, label, north }: { innerRef: React.RefObject<HTMLDivElement | null>; label: string; north: string }) {
  return (
    <div
      className="pointer-events-none absolute left-3 top-16 z-20 grid size-14 place-items-center rounded-full bg-white/90 shadow-lg ring-1 ring-black/10 backdrop-blur sm:left-4 sm:top-[4.5rem]"
      role="img"
      aria-label={label}
    >
      <div ref={innerRef} className="relative size-11 will-change-transform">
        <span className="absolute left-1/2 top-0 -translate-x-1/2 text-[11px] font-extrabold leading-none text-apple-600">{north}</span>
        <svg viewBox="0 0 40 40" className="absolute inset-0 size-full">
          <path d="M20 9 25 22H15z" fill="#e0392f" />
          <path d="M20 31 15 22h10z" fill="#9aa5a0" />
          <circle cx="20" cy="22" r="1.8" fill="#12281d" />
        </svg>
      </div>
    </div>
  );
}

function LocationCard() {
  const { t } = useI18n();
  const btn = 'inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-extrabold transition hover:scale-[1.03] active:scale-95';
  return (
    <Reveal className="mt-6" delay={0.1}>
      <div className="grid gap-5 rounded-[2rem] bg-card p-6 ring-1 ring-line sm:p-8 lg:grid-cols-[1.2fr_1fr] lg:items-center">
        <div className="flex items-start gap-4">
          <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-apple-500 text-2xl shadow-lg" aria-hidden>
            📍
          </span>
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.25em] text-apple-500">{t('map.loc.title')}</p>
            <address className="mt-1 font-display text-2xl font-extrabold not-italic leading-snug sm:text-3xl">{t('map.loc.value')}</address>
            <p className="mt-3 text-sm text-muted">
              {t('map.loc.coords', {
                lat: VILLAGE_CENTER.lat.toFixed(4),
                lon: VILLAGE_CENTER.lon.toFixed(4),
                walk: `${TRSIC_WALK_MIN} min`,
              })}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2.5 lg:justify-end">
          <a href={GOOGLE_MAPS_VILLAGE} target="_blank" rel="noopener noreferrer" className={`${btn} bg-sun-400 text-leaf-950`}>
            {t('map.loc.gmaps')}
          </a>
          <a href={WALK_TO_TRSIC_URL} target="_blank" rel="noopener noreferrer" className={`${btn} border-2 border-ink/20 text-ink hover:border-ink`}>
            {t('map.loc.walk')}
          </a>
        </div>

        <p className="text-xs leading-relaxed text-muted lg:col-span-2">{t('map.note')}</p>
      </div>
    </Reveal>
  );
}

/** Slide-in list with every place, grouped by type — the keyboard / touch friendly way to find one of ~25 pins. */
function PlaceList({ open, onClose, onPick, activeId }: { open: boolean; onClose: () => void; onPick: (id: string) => void; activeId: string | null }) {
  const { t, tr } = useI18n();
  const groups = useMemo(() => {
    const m = new Map<PlaceKind, typeof places>();
    places.forEach((p) => m.set(p.kind, [...(m.get(p.kind) ?? []), p]));
    return [...m.entries()];
  }, []);
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="absolute inset-y-3 left-3 z-40 flex w-[min(20rem,calc(100%-1.5rem))] flex-col overflow-hidden rounded-3xl bg-card text-ink shadow-2xl ring-1 ring-line sm:inset-y-4 sm:left-4"
          initial={{ x: -40, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -40, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 28 }}
          role="dialog"
          aria-label={t('map.listTitle')}
        >
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <h3 className="font-display text-xl font-extrabold">{t('map.listTitle')}</h3>
            <button type="button" onClick={onClose} aria-label={t('map.close')} className="grid size-9 place-items-center rounded-full bg-ink/10 hover:bg-ink/20">
              ✕
            </button>
          </div>
          <div className="flex-1 overflow-y-auto overscroll-contain p-3">
            {groups.map(([kind, list]) => (
              <div key={kind} className="mb-3">
                <p className="px-2 pb-1 pt-2 text-xs font-extrabold uppercase tracking-wider" style={{ color: KIND_META[kind].color }}>
                  {KIND_META[kind].emoji} {tr(KIND_META[kind].label)}
                </p>
                {list.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => onPick(p.id)}
                    className={`block w-full rounded-xl px-3 py-2 text-left text-sm font-bold transition hover:bg-sun-400/30 ${p.id === activeId ? 'bg-sun-400/40' : ''}`}
                  >
                    {tr(p.name)}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function VillageMap({ activeId, onSelect }: Props) {
  const { theme } = useTheme();
  const { t, tr, lang } = useI18n();
  const compact = useMediaQuery('(max-width: 767px)');
  const wrap = useRef<HTMLDivElement>(null);
  const compassRef = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<Mode>('3d');
  const [near, setNear] = useState(false); // load three.js a bit before the section is visible
  const [visible, setVisible] = useState(false); // render frames only while on screen
  const [resetKey, setResetKey] = useState(0);
  const [listOpen, setListOpen] = useState(false);
  const [realId, setRealId] = useState('village');

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const loader = new IntersectionObserver(([e]) => e.isIntersecting && setNear(true), { rootMargin: '600px' });
    const viewer = new IntersectionObserver(([e]) => setVisible(e.isIntersecting));
    loader.observe(el);
    viewer.observe(el);
    return () => {
      loader.disconnect();
      viewer.disconnect();
    };
  }, []);

  // Selecting a place from elsewhere (attraction cards) always brings the 3D view back.
  useEffect(() => {
    if (activeId) {
      setMode('3d');
      setRealId(activeId);
    }
  }, [activeId]);

  const select = useCallback(
    (id: string) => {
      setListOpen(false);
      onSelect(id);
    },
    [onSelect],
  );
  const close = useCallback(() => onSelect(null), [onSelect]);
  const active = activeId ? (placeById(activeId) ?? null) : null;
  const attractions = useMemo(() => places.filter((p) => p.featured), []);
  const names = useMemo(() => Object.fromEntries(places.map((p) => [p.id, tr(p.name)])), [tr]);
  const realQuery = realId === 'village' ? 'Voćnjak, Loznica, Srbija' : (placeById(realId)?.mapsQuery ?? 'Voćnjak, Loznica, Srbija');

  return (
    <section id="mapa" className="relative px-3 py-20 sm:px-6 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <Reveal className="mb-8 flex flex-wrap items-end justify-between gap-5 px-2">
          <div className="max-w-2xl">
            <p className="mb-2 text-sm font-extrabold uppercase tracking-[0.3em] text-apple-500">{t('map.eyebrow')}</p>
            <h2 className="font-display text-4xl font-extrabold leading-tight sm:text-6xl">{t('map.title')}</h2>
            <p className="mt-4 text-lg text-muted">{t('map.intro')}</p>
          </div>

          <div role="tablist" aria-label={t('map.tabs')} className="relative flex rounded-full bg-ink/10 p-1">
            {(
              [
                ['3d', t('map.tab3d')],
                ['real', t('map.tabReal')],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={mode === id}
                onClick={() => setMode(id)}
                className="relative rounded-full px-5 py-2.5 text-sm font-extrabold"
              >
                {mode === id && (
                  <motion.span layoutId="map-mode" className="absolute inset-0 rounded-full bg-leaf-800" transition={{ type: 'spring', stiffness: 400, damping: 32 }} />
                )}
                <span className={`relative ${mode === id ? 'text-white' : ''}`}>{label}</span>
              </button>
            ))}
          </div>
        </Reveal>

        <Reveal y={50}>
          <div
            ref={wrap}
            className="relative h-[82svh] min-h-[540px] overflow-hidden rounded-[2rem] shadow-2xl ring-1 ring-line sm:rounded-[2.5rem] md:h-[78vh]"
            style={{ background: 'linear-gradient(to bottom, var(--map-sky-top), var(--map-sky-bottom))' }}
          >
            {mode === '3d' ? (
              <>
                <MapErrorBoundary
                  fallback={
                    <div className="absolute inset-0">
                      <SceneArt variant="viewpoint" tone="day" className="size-full opacity-80" />
                      <div className="absolute inset-0 grid place-items-center bg-black/30 p-6 text-center text-white">
                        <p className="max-w-sm text-lg font-bold">{t('map.fallback')}</p>
                      </div>
                    </div>
                  }
                >
                  {near && (
                    <Suspense fallback={<Loading label={t('map.loading')} />}>
                      <VillageScene
                        activeId={activeId}
                        onSelect={select}
                        resetKey={resetKey}
                        dark={theme === 'dark'}
                        running={visible}
                        compact={compact}
                        compassRef={compassRef}
                        names={names}
                        trailLabel={`${t('att.introStrong')} · ${t('map.walk')}`}
                      />
                    </Suspense>
                  )}
                  {!near && <Loading label={t('map.loading')} />}
                </MapErrorBoundary>

                <Compass innerRef={compassRef} label={t('map.compass')} north={t('map.north')} />

                {/* attraction chips + the full list: the accessible alternative to clicking pins */}
                <div className="no-scrollbar absolute inset-x-0 top-0 z-20 flex gap-2 overflow-x-auto p-3 sm:p-4" role="tablist" aria-label={t('map.chipsAria')}>
                  <button
                    type="button"
                    onClick={() => setListOpen((o) => !o)}
                    aria-expanded={listOpen}
                    className="flex shrink-0 items-center gap-1.5 rounded-full bg-sun-400 px-3.5 py-2 text-sm font-extrabold text-leaf-950 shadow-md transition hover:scale-105"
                  >
                    {t('map.listBtn')}
                  </button>
                  {attractions.map((p) => {
                    const meta = KIND_META[p.kind];
                    const on = p.id === activeId;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        role="tab"
                        aria-selected={on}
                        onClick={() => select(p.id)}
                        className={`relative flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-extrabold shadow-md ring-1 backdrop-blur transition ${
                          on ? 'bg-white text-leaf-950 ring-sun-400' : 'bg-leaf-950/70 text-white ring-white/20 hover:bg-leaf-950/90'
                        }`}
                      >
                        {on && <motion.span layoutId="chip-ring" className="absolute inset-0 rounded-full ring-2 ring-sun-400" />}
                        <span aria-hidden>{meta.emoji}</span>
                        {tr(p.name)}
                      </button>
                    );
                  })}
                </div>

                <PlaceList open={listOpen} onClose={() => setListOpen(false)} onPick={select} activeId={activeId} />

                <div className="pointer-events-none absolute bottom-3 left-3 z-20 flex flex-col items-start gap-2 sm:bottom-4 sm:left-4">
                  <button
                    type="button"
                    onClick={() => {
                      onSelect(null);
                      setResetKey((k) => k + 1);
                    }}
                    className="pointer-events-auto rounded-full bg-white/90 px-4 py-2 text-sm font-extrabold text-leaf-950 shadow-lg backdrop-blur transition hover:scale-105 active:scale-95"
                  >
                    {t('map.reset')}
                  </button>
                  <p className="hidden rounded-full bg-black/40 px-3 py-1.5 text-xs font-semibold text-white/90 backdrop-blur sm:block">{t('map.hint')}</p>
                </div>

                <LocationModal place={active} compact={compact} onClose={close} onSelect={select} />
              </>
            ) : (
              <motion.div className="absolute inset-0 bg-card" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <iframe
                  key={`${realQuery}-${lang}`}
                  title={`Google Maps: ${realQuery}`}
                  src={googleMapsEmbed(realQuery, lang === 'en' ? 'en' : 'sr')}
                  loading="lazy"
                  className="size-full border-0"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />
                <label className="absolute left-3 top-3 flex max-w-[calc(100%-1.5rem)] items-center gap-2 rounded-full bg-white/95 py-1.5 pl-4 pr-2 text-sm font-bold text-leaf-950 shadow-lg backdrop-blur">
                  <span className="shrink-0">{t('map.realLabel')}</span>
                  <select
                    value={realId}
                    onChange={(e) => setRealId(e.target.value)}
                    className="min-w-0 rounded-full bg-sun-400 px-3 py-1.5 text-sm font-extrabold"
                  >
                    <option value="village">{t('map.realVillage')}</option>
                    {places.map((p) => (
                      <option key={p.id} value={p.id}>
                        {tr(p.name)}
                      </option>
                    ))}
                  </select>
                </label>
              </motion.div>
            )}
          </div>
        </Reveal>

        <LocationCard />
      </div>
    </section>
  );
}
