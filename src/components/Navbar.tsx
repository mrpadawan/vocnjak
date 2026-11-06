import { AnimatePresence, motion, useScroll, useSpring } from 'framer-motion';
import { useEffect, useState } from 'react';
import { LANGS, useI18n } from '../lib/i18n';
import { useTheme } from '../lib/theme';
import { Apple, Moon, Sun } from './art/Fruit';
import { useIntro } from './IntroGate';

const links = [
  { id: 'atrakcije', key: 'nav.attractions' },
  { id: 'mesta', key: 'nav.places' },
  { id: 'selo', key: 'nav.about' },
  { id: 'mapa', key: 'nav.map' },
  { id: 'fk', key: 'nav.fk' },
  { id: 'linkovi', key: 'nav.links' },
];

/** Three-way language / script switch: Serbian Latin (default), Serbian Cyrillic, English. */
function LanguageSwitch({ solid, id }: { solid: boolean; id: string }) {
  const { lang, setLang, t } = useI18n();
  return (
    <div
      role="group"
      aria-label={t('nav.language')}
      className={`relative flex rounded-full p-0.5 text-xs font-extrabold ${solid ? 'bg-ink/10 text-ink' : 'bg-white/20 text-white'}`}
    >
      {LANGS.map((l) => (
        <button
          key={l.id}
          type="button"
          lang={l.html}
          title={l.name}
          aria-pressed={lang === l.id}
          onClick={() => setLang(l.id)}
          className="relative rounded-full px-2.5 py-2 leading-none"
        >
          {lang === l.id && (
            <motion.span
              layoutId={`lang-pill-${id}`}
              className="absolute inset-0 rounded-full bg-sun-400"
              transition={{ type: 'spring', stiffness: 420, damping: 32 }}
            />
          )}
          <span className={`relative ${lang === l.id ? 'text-leaf-950' : ''}`}>{l.label}</span>
        </button>
      ))}
    </div>
  );
}

export default function Navbar() {
  const { ready } = useIntro();
  const { theme, toggle } = useTheme();
  const { t } = useI18n();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState('');
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 24 });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Scroll-spy: highlight the link whose section is in the middle of the viewport.
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: '-45% 0px -50% 0px' },
    );
    links.forEach((l) => {
      const el = document.getElementById(l.id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, []);

  const solid = scrolled || open;

  return (
    <motion.header
      className="fixed inset-x-0 top-0 z-50"
      initial={{ y: -90, opacity: 0 }}
      animate={ready ? { y: 0, opacity: 1 } : {}}
      transition={{ type: 'spring', stiffness: 120, damping: 18, delay: 0.2 }}
    >
      <nav
        className={`mx-auto mt-3 flex max-w-6xl items-center justify-between rounded-full px-3 py-2.5 transition-all duration-300 sm:px-6 ${
          solid
            ? 'bg-paper/80 shadow-lg shadow-black/10 ring-1 ring-line backdrop-blur-xl'
            : 'bg-leaf-950/30 ring-1 ring-white/15 backdrop-blur-md'
        } mx-3 sm:mx-auto`}
        aria-label={t('nav.main')}
      >
        <a href="#top" className="group flex items-center gap-2 font-display text-xl font-extrabold tracking-tight">
          <Apple className="size-8 transition-transform duration-300 group-hover:-rotate-12 group-hover:scale-110" />
          <span className={`max-sm:hidden ${solid ? 'text-ink' : 'text-white drop-shadow'}`}>{t('meta.name')}</span>
        </a>

        <ul className="hidden items-center gap-0.5 xl:flex">
          {links.map((l) => (
            <li key={l.id}>
              <a
                href={`#${l.id}`}
                className={`relative rounded-full px-3.5 py-2 text-sm font-bold transition-colors ${
                  solid ? 'text-ink hover:text-apple-500' : 'text-white/90 hover:text-white'
                }`}
              >
                {active === l.id && (
                  <motion.span
                    layoutId="nav-pill"
                    className={`absolute inset-0 -z-10 rounded-full ${solid ? 'bg-sun-400/40' : 'bg-white/20'}`}
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                {t(l.key)}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <LanguageSwitch solid={solid} id="bar" />
          <button
            type="button"
            onClick={toggle}
            aria-label={theme === 'dark' ? t('nav.themeLight') : t('nav.themeDark')}
            className={`grid size-10 place-items-center rounded-full transition hover:scale-110 active:scale-95 ${
              solid ? 'bg-ink/10 text-ink' : 'bg-white/20 text-white'
            }`}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={theme}
                initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
                animate={{ rotate: 0, opacity: 1, scale: 1 }}
                exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
                transition={{ duration: 0.2 }}
              >
                {theme === 'dark' ? <Sun className="size-5" /> : <Moon className="size-5" />}
              </motion.span>
            </AnimatePresence>
          </button>

          <button
            type="button"
            className={`grid size-10 place-items-center rounded-full xl:hidden ${solid ? 'bg-ink/10 text-ink' : 'bg-white/20 text-white'}`}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? t('nav.menuClose') : t('nav.menuOpen')}
            onClick={() => setOpen((o) => !o)}
          >
            <span className="relative block h-3.5 w-5">
              <span className={`absolute left-0 h-0.5 w-5 rounded bg-current transition-all ${open ? 'top-1.5 rotate-45' : 'top-0'}`} />
              <span className={`absolute left-0 top-1.5 h-0.5 w-5 rounded bg-current transition-opacity ${open ? 'opacity-0' : ''}`} />
              <span className={`absolute left-0 h-0.5 w-5 rounded bg-current transition-all ${open ? 'top-1.5 -rotate-45' : 'top-3'}`} />
            </span>
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            className="mx-3 mt-2 overflow-hidden rounded-3xl bg-paper/95 shadow-xl ring-1 ring-line backdrop-blur-xl xl:hidden"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
          >
            <ul className="flex flex-col p-3">
              {links.map((l, i) => (
                <motion.li key={l.id} initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.05 * i }}>
                  <a
                    href={`#${l.id}`}
                    onClick={() => setOpen(false)}
                    className="block rounded-2xl px-4 py-3 text-lg font-bold text-ink hover:bg-sun-400/30"
                  >
                    {t(l.key)}
                  </a>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        className="absolute inset-x-0 -bottom-1 mx-6 h-[3px] origin-left rounded-full bg-gradient-to-r from-apple-500 via-sun-400 to-leaf-500"
        style={{ scaleX: progress, opacity: scrolled ? 1 : 0 }}
        aria-hidden
      />
    </motion.header>
  );
}
