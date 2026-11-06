import { AnimatePresence, animate, motion, useInView } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { aboutSources, aboutTabs, census, type AboutTab, type Block } from '../data/about';
import { useI18n } from '../lib/i18n';
import Reveal from './Reveal';

/** Bars that grow in when scrolled into view, one per census year. */
function CensusChart() {
  const { t, locale } = useI18n();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const max = 1300;
  const fmt = new Intl.NumberFormat(locale);

  return (
    <div ref={ref} className="rounded-3xl bg-card p-5 ring-1 ring-line sm:p-7">
      <p className="mb-5 text-xs font-extrabold uppercase tracking-[0.25em] text-apple-500">{t('about.census')}</p>
      <ul className="space-y-3" role="list">
        {census.map((c, i) => (
          <li key={c.year} className="grid grid-cols-[3.2rem_1fr_4.2rem] items-center gap-3 text-sm sm:grid-cols-[4rem_1fr_5rem]">
            <span className="font-extrabold tabular-nums">{c.year}</span>
            <span className="h-7 overflow-hidden rounded-full bg-ink/10">
              <motion.span
                className="block h-full rounded-full bg-gradient-to-r from-leaf-600 to-sun-400"
                initial={{ width: 0 }}
                animate={inView ? { width: `${(c.pop / max) * 100}%` } : {}}
                transition={{ duration: 1, delay: 0.1 + i * 0.12, ease: [0.22, 1, 0.36, 1] }}
              />
            </span>
            <span className="text-right font-extrabold tabular-nums">{fmt.format(c.pop)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function CountText({ text }: { text: string }) {
  // Animates the leading number of a stat (e.g. "189 m", "99,7%") when it appears.
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const match = text.match(/^(\d[\d.,]*)(.*)$/);
  useEffect(() => {
    if (!inView || !match || !ref.current) return;
    const raw = match[1];
    const decimals = /[.,]\d{1,2}$/.test(raw) && raw.length - raw.search(/[.,]\d{1,2}$/) <= 3 ? raw.split(/[.,]/).pop()!.length : 0;
    const target = parseFloat(raw.replace(/\.(?=\d{3}\b)/g, '').replace(',', '.'));
    if (Number.isNaN(target)) return;
    const el = ref.current;
    const sep = raw.includes(',') ? ',' : '.';
    const c = animate(0, target, {
      duration: 1.1,
      ease: 'easeOut',
      onUpdate: (v) => {
        const s = decimals ? v.toFixed(decimals).replace('.', sep) : Math.round(v).toString();
        el.textContent = (target >= 1000 && !decimals ? Math.round(v).toLocaleString('de-DE') : s) + match[2];
      },
    });
    return () => c.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, text]);
  return <span ref={ref}>{text}</span>;
}

function Cards({ blocks }: { blocks: Block[] }) {
  const { tr } = useI18n();
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {blocks.map((b, i) => (
        <motion.article
          key={i}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5, delay: (i % 2) * 0.08 }}
          className="rounded-3xl bg-card p-6 ring-1 ring-line"
        >
          <h4 className="font-display text-xl font-extrabold leading-snug">{tr(b.title)}</h4>
          <p className="mt-2 leading-relaxed text-muted">{tr(b.body)}</p>
        </motion.article>
      ))}
    </div>
  );
}

function Timeline({ tab }: { tab: AboutTab }) {
  const { tr } = useI18n();
  return (
    <ol className="relative ml-3 border-l-2 border-dashed border-ink/20 pl-7 sm:ml-5 sm:pl-10">
      {tab.events!.map((e, i) => (
        <motion.li
          key={i}
          initial={{ opacity: 0, x: -24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.55 }}
          className="relative pb-9 last:pb-0"
        >
          <span
            className={`absolute -left-[2.35rem] top-1 grid size-5 place-items-center rounded-full ring-4 ring-paper sm:-left-[3.1rem] sm:size-6 ${
              e.somber ? 'bg-ink' : 'bg-sun-400'
            }`}
            aria-hidden
          >
            <span className={`size-2 rounded-full ${e.somber ? 'bg-paper' : 'bg-leaf-900'}`} />
          </span>
          <p className={`text-xs font-extrabold uppercase tracking-[0.2em] ${e.somber ? 'text-muted' : 'text-apple-500'}`}>{tr(e.when)}</p>
          <h4 className="mt-1 font-display text-xl font-extrabold leading-snug sm:text-2xl">{tr(e.title)}</h4>
          <p
            className={`mt-2 max-w-3xl leading-relaxed text-muted ${
              e.somber ? 'rounded-2xl border-l-4 border-ink/40 bg-ink/5 p-4' : ''
            }`}
          >
            {tr(e.body)}
          </p>
        </motion.li>
      ))}
    </ol>
  );
}

function TabBody({ tab }: { tab: AboutTab }) {
  const { tr } = useI18n();
  return (
    <div className="space-y-8">
      {tab.intro && <p className="max-w-3xl text-lg leading-relaxed text-muted">{tr(tab.intro)}</p>}

      {tab.stats && (
        <ul className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {tab.stats.map((s, i) => (
            <li key={i} className="rounded-3xl bg-gradient-to-br from-leaf-800 to-leaf-900 p-5 text-white shadow-lg">
              <p className="font-display text-3xl font-extrabold text-sun-300 sm:text-4xl">
                <CountText text={tr(s.value)} />
              </p>
              <p className="mt-1 text-sm font-semibold text-leaf-100">{tr(s.label)}</p>
            </li>
          ))}
        </ul>
      )}

      {tab.census && <CensusChart />}
      {tab.events && <Timeline tab={tab} />}
      {tab.blocks && <Cards blocks={tab.blocks} />}

      {tab.extra && (
        <div>
          <h3 className="mb-4 font-display text-2xl font-extrabold sm:text-3xl">🏚️ {tr(tab.extraTitle!)}</h3>
          <Cards blocks={tab.extra} />
        </div>
      )}
    </div>
  );
}

export default function About() {
  const { t, tr } = useI18n();
  const [active, setActive] = useState<AboutTab['id']>('geo');
  const tab = aboutTabs.find((x) => x.id === active)!;

  return (
    <section id="selo" className="relative mx-auto max-w-6xl px-4 pb-24 sm:px-6 sm:pb-32">
      <Reveal className="max-w-3xl">
        <p className="mb-2 text-sm font-extrabold uppercase tracking-[0.3em] text-apple-500">{t('about.eyebrow')}</p>
        <h2 className="font-display text-4xl font-extrabold leading-tight sm:text-6xl">{t('about.title')}</h2>
        <p className="mt-4 text-lg text-muted">{t('about.intro')}</p>
      </Reveal>

      <Reveal delay={0.1} className="no-scrollbar mt-8 -mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <div role="tablist" aria-label={t('about.title')} className="flex w-max gap-2">
          {aboutTabs.map((x) => (
            <button
              key={x.id}
              type="button"
              role="tab"
              aria-selected={active === x.id}
              onClick={() => setActive(x.id)}
              className="relative whitespace-nowrap rounded-full px-5 py-2.5 text-sm font-extrabold text-ink ring-1 ring-line transition hover:ring-ink/40"
            >
              {active === x.id && (
                <motion.span layoutId="about-pill" className="absolute inset-0 rounded-full bg-sun-400" transition={{ type: 'spring', stiffness: 400, damping: 30 }} />
              )}
              <span className={`relative ${active === x.id ? 'text-leaf-950' : ''}`}>
                <span aria-hidden>{x.emoji}</span> {tr(x.label)}
              </span>
            </button>
          ))}
        </div>
      </Reveal>

      <div className="mt-10" role="tabpanel">
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
          >
            <TabBody tab={tab} />
          </motion.div>
        </AnimatePresence>
      </div>

      <details className="mt-14 rounded-3xl bg-card p-5 ring-1 ring-line">
        <summary className="cursor-pointer text-sm font-extrabold uppercase tracking-[0.2em] text-muted">{t('about.sources')}</summary>
        <ul className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
          {aboutSources.map((s) => (
            <li key={s.href}>
              <a href={s.href} target="_blank" rel="noopener noreferrer" className="font-semibold underline decoration-sun-400 decoration-2 underline-offset-4 hover:text-apple-500">
                {s.label} ↗
              </a>
            </li>
          ))}
        </ul>
      </details>
    </section>
  );
}
