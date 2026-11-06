import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import {
  club,
  competitionName,
  competitionUrl,
  fetchedAt,
  fixtures,
  isClub,
  isHome,
  outcomeOf,
  results,
  season,
  source,
  standings,
  topPlayers,
  type Match,
  type Outcome,
  type TopPlayer,
} from '../data/football';
import { useI18n } from '../lib/i18n';
import Marquee from './Marquee';
import Reveal from './Reveal';

const OUTCOME_STYLE: Record<Outcome, string> = {
  W: 'bg-emerald-400 text-leaf-950',
  D: 'bg-sun-400 text-leaf-950',
  L: 'bg-apple-500 text-white',
};

/** Locale-aware date/time formatters. */
function useFormatters() {
  const { locale } = useI18n();
  return useMemo(() => {
    const d = new Intl.DateTimeFormat(locale, { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'Europe/Belgrade' });
    const t = new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Belgrade' });
    const full = new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'long', year: 'numeric' });
    return { date: (x: Date) => d.format(x), time: (x: Date) => t.format(x), full: (x: Date) => full.format(x) };
  }, [locale]);
}

/* ───────────────────────── countdown ───────────────────────── */

function useCountdown(target: Date) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);
  const diff = Math.max(0, target.getTime() - now);
  return {
    d: Math.floor(diff / 864e5),
    h: Math.floor((diff / 36e5) % 24),
    m: Math.floor((diff / 6e4) % 60),
    s: Math.floor((diff / 1e3) % 60),
  };
}

function Digit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex min-w-[3.8rem] flex-col items-center rounded-2xl bg-black/30 px-2.5 py-2.5 ring-1 ring-white/15 backdrop-blur sm:min-w-[5rem] sm:px-3">
      <div className="relative h-10 overflow-hidden sm:h-12">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={value}
            className="block font-sport text-4xl font-extrabold tabular-nums leading-10 text-white sm:text-5xl sm:leading-[3rem]"
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '-100%', opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {String(value).padStart(2, '0')}
          </motion.span>
        </AnimatePresence>
      </div>
      <span className="mt-1 text-[10px] font-bold uppercase tracking-widest text-leaf-300">{label}</span>
    </div>
  );
}

function NextMatch({ match }: { match: Match | undefined }) {
  const { t, tx } = useI18n();
  const fmt = useFormatters();
  const cd = useCountdown(match?.date ?? new Date());

  if (!match) {
    return (
      <div className="rounded-[2rem] bg-gradient-to-br from-leaf-700 to-leaf-900 p-8 text-center shadow-2xl ring-1 ring-white/15">
        <p className="font-sport text-3xl font-extrabold uppercase text-white">{t('fk.noNext')}</p>
      </div>
    );
  }
  const venue = isHome(match) ? t('fk.homeVenue') : tx(match.venue);
  return (
    <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#1d4fa8] to-[#0e2a63] p-5 shadow-2xl ring-1 ring-white/15 sm:p-8">
      <div className="absolute -right-10 -top-10 size-48 animate-morph bg-sun-400/20 blur-xl" aria-hidden />
      <div className="relative flex flex-wrap items-center justify-between gap-2 text-sm font-bold uppercase tracking-widest text-sun-300">
        <span className="inline-flex items-center gap-2">
          <span className="size-2 animate-pulse rounded-full bg-apple-400" /> {t('fk.next')}
        </span>
        <span>{t('fk.round', { n: match.round })}</span>
      </div>

      <div className="relative mt-5 grid grid-cols-[1fr_auto_1fr] items-center gap-2 text-center sm:gap-6">
        <p className="break-words font-sport text-xl font-extrabold uppercase leading-none text-white sm:text-4xl">{tx(match.home)}</p>
        <span className="rounded-full bg-sun-400 px-3 py-1.5 font-sport text-xl font-extrabold text-leaf-950 sm:text-2xl">VS</span>
        <p className="break-words font-sport text-xl font-extrabold uppercase leading-none text-white sm:text-4xl">{tx(match.away)}</p>
      </div>

      <p className="relative mt-4 text-center text-sm font-semibold text-blue-100">
        {fmt.date(match.date)} · {fmt.time(match.date)} · {venue}
      </p>

      <div className="relative mt-6 flex justify-center gap-1.5 sm:gap-3" role="timer" aria-label={t('fk.countdown')}>
        <Digit value={cd.d} label={t('fk.days')} />
        <Digit value={cd.h} label={t('fk.hours')} />
        <Digit value={cd.m} label={t('fk.min')} />
        <Digit value={cd.s} label={t('fk.sec')} />
      </div>
    </div>
  );
}

/* ───────────────────────── results / fixtures / table ───────────────────────── */

function MatchRow({ match, i }: { match: Match; i: number }) {
  const { t, tx } = useI18n();
  const fmt = useFormatters();
  const outcome = outcomeOf(match);
  const mine = (n: string) => (isClub(n) ? 'text-sun-300' : 'text-white');
  const sc = match.score;

  return (
    <motion.li
      layout
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 30 }}
      transition={{ delay: i * 0.05, type: 'spring', stiffness: 260, damping: 24 }}
      className="rounded-2xl bg-white/5 px-3 py-3 ring-1 ring-white/10 sm:px-5 sm:py-3.5"
    >
      {/* phones: two stacked lines, so long team names never get squeezed */}
      <div className="sm:hidden">
        <div className="mb-1.5 flex items-center justify-between text-[11px] font-bold uppercase tracking-wide text-leaf-300">
          <span>
            {fmt.date(match.date)}
            {!sc && <> · {fmt.time(match.date)}</>}
          </span>
          <span className="flex items-center gap-2">
            {t('fk.round', { n: match.round })}
            {outcome && <span className={`grid size-5 place-items-center rounded-full text-[10px] font-extrabold ${OUTCOME_STYLE[outcome]}`}>{t(`fk.${outcome}`)}</span>}
          </span>
        </div>
        <div className="grid grid-cols-[1fr_auto] items-center gap-x-3 gap-y-1">
          <p className={`min-w-0 font-sport text-lg font-bold uppercase leading-tight ${mine(match.home)}`}>{tx(match.home)}</p>
          <span className="min-w-8 rounded-md bg-black/40 px-2 py-0.5 text-center font-sport text-xl font-extrabold tabular-nums text-white">{sc ? sc.home : '–'}</span>
          <p className={`min-w-0 font-sport text-lg font-bold uppercase leading-tight ${mine(match.away)}`}>{tx(match.away)}</p>
          <span className="min-w-8 rounded-md bg-black/40 px-2 py-0.5 text-center font-sport text-xl font-extrabold tabular-nums text-white">{sc ? sc.away : '–'}</span>
        </div>
      </div>

      {/* tablets and up: one line */}
      <div className="hidden grid-cols-[auto_1fr_auto_1fr] items-center gap-5 sm:grid">
        <div className="w-14 text-left text-xs font-bold uppercase leading-tight text-leaf-300">
          {fmt.date(match.date)}
          <span className="block text-[10px] opacity-70">{t('fk.round', { n: match.round })}</span>
        </div>
        <p className={`min-w-0 text-right font-sport text-2xl font-bold uppercase leading-tight ${mine(match.home)}`}>{tx(match.home)}</p>
        {sc ? (
          <div className="flex items-center gap-2">
            <span className="rounded-lg bg-black/40 px-3 py-1 font-sport text-3xl font-extrabold tabular-nums text-white">
              {sc.home} : {sc.away}
            </span>
            {outcome && (
              <span className={`grid size-7 place-items-center rounded-full text-xs font-extrabold ${OUTCOME_STYLE[outcome]}`} title={outcome}>
                {t(`fk.${outcome}`)}
              </span>
            )}
          </div>
        ) : (
          <span className="rounded-lg bg-white/10 px-3 py-1 font-sport text-2xl font-bold tabular-nums text-sun-300">{fmt.time(match.date)}</span>
        )}
        <p className={`min-w-0 text-left font-sport text-2xl font-bold uppercase leading-tight ${mine(match.away)}`}>{tx(match.away)}</p>
      </div>
    </motion.li>
  );
}

function Table() {
  const { t, tx } = useI18n();
  const cols = ['p', 'w', 'd', 'l', 'gd', 'pts'] as const;
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[19rem] border-separate border-spacing-y-1.5 text-sm">
        <thead>
          <tr className="text-[11px] font-bold uppercase tracking-wider text-leaf-300">
            <th className="w-8 text-left">#</th>
            <th className="text-left">{t('fk.col.team')}</th>
            {cols.map((c) => (
              <th key={c} className={`w-9 text-center ${c === 'pts' ? 'text-sun-300' : ''}`}>
                {t(`fk.col.${c}`)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {standings.map((s, i) => {
            const me = s.clubId === club.id;
            return (
              <motion.tr
                key={s.clubId}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className={me ? 'bg-sun-400 text-leaf-950' : 'bg-white/5 text-white'}
              >
                <td className="rounded-l-xl py-2 pl-2 font-sport text-lg font-extrabold">{s.pos}</td>
                <td className="py-2 pr-2">
                  <span className="block font-sport text-base font-bold uppercase leading-none sm:text-lg">{tx(s.team)}</span>
                  <span className={`text-[11px] font-semibold ${me ? 'text-leaf-900' : 'text-leaf-300'}`}>{tx(s.town)}</span>
                </td>
                {[s.played, s.won, s.drawn, s.lost, s.gd > 0 ? `+${s.gd}` : s.gd].map((v, k) => (
                  <td key={k} className="text-center font-sport text-base font-bold tabular-nums">
                    {v}
                  </td>
                ))}
                <td className="rounded-r-xl text-center font-sport text-xl font-extrabold tabular-nums">{s.pts}</td>
              </motion.tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

type Tab = 'results' | 'fixtures' | 'table';

function Matches() {
  const { t } = useI18n();
  const [tab, setTab] = useState<Tab>('results');
  const form = results.slice(0, 5).map(outcomeOf);
  const list = tab === 'results' ? results : fixtures.slice(1);

  return (
    <div className="mt-6 rounded-[2rem] bg-black/25 p-3 ring-1 ring-white/10 backdrop-blur sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div role="tablist" className="relative flex rounded-full bg-black/30 p-1">
          {(
            [
              ['results', t('fk.results')],
              ['fixtures', t('fk.fixtures')],
              ['table', t('fk.table')],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              role="tab"
              aria-selected={tab === id}
              type="button"
              onClick={() => setTab(id)}
              className="relative rounded-full px-3.5 py-2 font-sport text-base font-bold uppercase tracking-wide text-white sm:px-5 sm:text-lg"
            >
              {tab === id && (
                <motion.span layoutId="fk-tab" className="absolute inset-0 rounded-full bg-apple-500" transition={{ type: 'spring', stiffness: 400, damping: 32 }} />
              )}
              <span className="relative">{label}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2" aria-label={t('fk.formAria')}>
          <span className="text-xs font-bold uppercase tracking-widest text-leaf-300">{t('fk.form')}</span>
          {form.map((o, i) =>
            o ? (
              <motion.span
                key={i}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.4 + i * 0.08, type: 'spring', stiffness: 400, damping: 14 }}
                className={`grid size-7 place-items-center rounded-full text-xs font-extrabold ${OUTCOME_STYLE[o]}`}
              >
                {t(`fk.${o}`)}
              </motion.span>
            ) : null,
          )}
        </div>
      </div>

      <div className="mt-5">
        {tab === 'table' ? (
          <Table />
        ) : (
          <ul className="flex flex-col gap-2.5">
            <AnimatePresence mode="popLayout" initial={false}>
              {list.length === 0 && <li className="py-6 text-center font-sport text-xl font-bold uppercase text-leaf-300">{t('fk.noNext')}</li>}
              {list.map((m, i) => (
                <MatchRow key={`${tab}-${m.id}`} match={m} i={i} />
              ))}
            </AnimatePresence>
          </ul>
        )}
      </div>
    </div>
  );
}

/* ───────────────────────── club card + top players ───────────────────────── */

function Shirt({ num, selected }: { num: number; selected: boolean }) {
  return (
    <svg viewBox="0 0 64 64" className={`size-12 drop-shadow-lg transition-all sm:size-14 ${selected ? 'scale-110 drop-shadow-[0_0_14px_#f7be2e]' : ''}`}>
      <path d="M22 6 8 14l6 14 8-4v32h20V24l8 4 6-14-14-8c-2 5-6 8-10 8s-8-3-10-8z" fill="#1d4fa8" stroke={selected ? '#f7be2e' : '#fff'} strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M26 10c2 3 4 5 6 5s4-2 6-5" stroke="#fff" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M8 14l6 14 8-4M56 14l-6 14-8-4" stroke="#e0392f" strokeWidth="3" fill="none" strokeLinejoin="round" />
      <text x="32" y="46" textAnchor="middle" fontFamily="Barlow Condensed, Roboto Condensed, sans-serif" fontWeight="800" fontSize="22" fill="#fff">
        {num}
      </text>
    </svg>
  );
}

/** Pitch spot by position; players of the same line are spread out evenly. */
function placePlayers(players: TopPlayer[]) {
  const lineY: Record<string, number> = { Golman: 87, Odbrana: 66, Sredina: 47, Veza: 47, Napad: 25 };
  const groups = new Map<string, TopPlayer[]>();
  players.forEach((p) => groups.set(p.position, [...(groups.get(p.position) ?? []), p]));
  return players.map((p) => {
    const g = groups.get(p.position)!;
    const idx = g.indexOf(p);
    const x = g.length === 1 ? 50 : 25 + (50 / (g.length - 1)) * idx;
    return { p, x, y: lineY[p.position] ?? 50 };
  });
}

function TopPlayers() {
  const { t, tx } = useI18n();
  const spots = useMemo(() => placePlayers(topPlayers), []);
  const [sel, setSel] = useState<number>(topPlayers[topPlayers.length - 1]?.id ?? 0);
  const chosen = topPlayers.find((p) => p.id === sel);

  if (topPlayers.length === 0) return null;
  return (
    <div>
      <h3 className="mb-4 font-sport text-3xl font-extrabold uppercase text-white">{t('fk.top')}</h3>
      <div className="relative mx-auto aspect-[5/5] w-full max-w-[30rem] overflow-hidden rounded-[2rem] border-4 border-white/70 bg-[#2f9a46] shadow-2xl">
        <div className="absolute inset-0" style={{ backgroundImage: 'repeating-linear-gradient(0deg, #34a64c 0 12.5%, #2d9444 12.5% 25%)' }} />
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 size-full" fill="none" stroke="rgba(255,255,255,.75)" strokeWidth=".6">
          <rect x="3" y="3" width="94" height="94" />
          <path d="M3 50h94" />
          <circle cx="50" cy="50" r="10" />
          <rect x="22" y="3" width="56" height="17" />
          <rect x="22" y="80" width="56" height="17" />
          <rect x="37" y="89" width="26" height="8" />
        </svg>
        {spots.map(({ p, x, y }, i) => (
          <motion.button
            key={p.id}
            type="button"
            aria-label={`${tx(p.name)}, ${p.num}`}
            aria-pressed={sel === p.id}
            onClick={() => setSel(p.id)}
            className="absolute z-10 -translate-x-1/2 -translate-y-1/2 outline-none"
            initial={{ opacity: 0, scale: 0.4, left: `${x}%`, top: `${y + 12}%` }}
            whileInView={{ opacity: 1, scale: 1, top: `${y}%` }}
            viewport={{ once: true }}
            transition={{ type: 'spring', stiffness: 150, damping: 14, delay: i * 0.08 }}
            whileHover={{ scale: 1.18, rotate: i % 2 ? 5 : -5 }}
            whileTap={{ scale: 0.92 }}
            style={{ left: `${x}%` }}
          >
            <Shirt num={p.num} selected={sel === p.id} />
            <span
              className={`absolute left-1/2 top-full -mt-1 -translate-x-1/2 whitespace-nowrap rounded-full px-2 py-0.5 font-sport text-[13px] font-bold uppercase leading-tight sm:text-sm ${
                sel === p.id ? 'bg-sun-400 text-leaf-950' : 'bg-black/55 text-white'
              }`}
            >
              {tx(p.name.split(' ').slice(-1)[0])}
            </span>
          </motion.button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {chosen && (
          <motion.div
            key={chosen.id}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mt-5 rounded-3xl bg-gradient-to-br from-sun-400 to-sun-500 p-5 text-leaf-950 shadow-xl"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-sport text-6xl font-extrabold leading-none">#{chosen.num}</p>
                <p className="mt-1 font-sport text-2xl font-extrabold uppercase leading-tight">{tx(chosen.name)}</p>
              </div>
              <span className="rounded-full bg-leaf-950 px-3 py-1 font-sport text-lg font-bold text-sun-300">{t(`fk.pos.${chosen.position}`)}</span>
            </div>
            <a
              href={`${source.url.split('/club/')[0]}/player/${chosen.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-block text-sm font-extrabold underline decoration-2 underline-offset-4"
            >
              {t('fk.profile')}
            </a>
          </motion.div>
        )}
      </AnimatePresence>
      <p className="mt-3 text-xs text-leaf-300">{t('fk.topNote')}</p>
    </div>
  );
}

function ClubCard() {
  const { t, tx } = useI18n();
  const facts: [string, string][] = [
    [t('fk.facts.founded'), String(club.founded)],
    [t('fk.facts.colors'), t('fk.facts.colorsValue')],
    [t('fk.facts.stadium'), t('fk.facts.stadiumValue')],
    [t('fk.facts.league'), tx(competitionName)],
  ];
  return (
    <dl className="mt-6 grid grid-cols-2 gap-2.5">
      {facts.map(([k, v]) => (
        <div key={k} className="rounded-2xl bg-white/5 p-3.5 ring-1 ring-white/10">
          <dt className="text-[11px] font-bold uppercase tracking-wider text-leaf-300">{k}</dt>
          <dd className="mt-0.5 font-sport text-lg font-bold uppercase leading-tight text-white">{v}</dd>
        </div>
      ))}
    </dl>
  );
}

/* ───────────────────────── section ───────────────────────── */

export default function FootballClub() {
  const { t, tx } = useI18n();
  const fmt = useFormatters();
  const ticker = results.map((m) => `${tx(m.home)} ${m.score!.home}:${m.score!.away} ${tx(m.away)}`);

  return (
    <section id="fk" className="relative isolate overflow-hidden bg-leaf-950 text-white">
      <div className="pitch-stripes absolute inset-0 -z-10" aria-hidden />
      <svg viewBox="0 0 400 400" className="pointer-events-none absolute -right-40 top-20 -z-10 size-[42rem] opacity-[0.07]" fill="none" stroke="#fff" strokeWidth="3" aria-hidden>
        <circle cx="200" cy="200" r="150" />
        <circle cx="200" cy="200" r="6" fill="#fff" />
        <path d="M200 50v300" />
      </svg>

      {ticker.length > 0 && <Marquee className="bg-apple-500 py-3 font-sport text-xl font-extrabold uppercase tracking-wider text-white sm:text-2xl" dot="bg-white" items={ticker} />}

      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-32">
        <Reveal>
          <p className="mb-2 text-sm font-extrabold uppercase tracking-[0.3em] text-sun-400">{t('fk.eyebrow')}</p>
          <h2 className="font-sport text-[clamp(4.5rem,16vw,10rem)] font-extrabold uppercase italic leading-[0.85] tracking-tight">
            {tx('FK')} <span className="text-sun-400">{tx('Luk')}</span>
          </h2>
          <p className="mt-3 font-sport text-xl font-bold uppercase tracking-wide text-blue-200 sm:text-2xl">
            {tx(competitionName)} · {season}
          </p>
          <p className="mt-3 max-w-xl text-lg text-leaf-100">{t('fk.blurb')}</p>
        </Reveal>

        <div className="mt-12 grid gap-10 lg:grid-cols-[1.15fr_1fr] lg:gap-12">
          <div>
            <Reveal>
              <NextMatch match={fixtures[0]} />
            </Reveal>
            <Reveal delay={0.1}>
              <Matches />
            </Reveal>
          </div>
          <Reveal delay={0.15}>
            <TopPlayers />
            <ClubCard />
          </Reveal>
        </div>

        <p className="mt-10 text-sm text-leaf-300">
          {t('fk.source', { date: fmt.full(fetchedAt) })}{' '}
          <a href={source.url} target="_blank" rel="noopener noreferrer" className="font-bold underline decoration-sun-400 decoration-2 underline-offset-4 hover:text-white">
            srbijasport.net ↗
          </a>{' '}
          ·{' '}
          <a href={competitionUrl} target="_blank" rel="noopener noreferrer" className="font-bold underline decoration-sun-400 decoration-2 underline-offset-4 hover:text-white">
            {t('fk.fullLeague')} ↗
          </a>
        </p>
      </div>
    </section>
  );
}
