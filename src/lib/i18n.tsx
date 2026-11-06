import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { STRINGS } from './strings';

/** Serbian (Latin) is the default; Serbian (Cyrillic) is derived from it by transliteration. */
export type Lang = 'lat' | 'cyr' | 'en';
export const LANGS: { id: Lang; label: string; name: string; html: string; locale: string }[] = [
  { id: 'lat', label: 'Lat', name: 'Srpski (latinica)', html: 'sr-Latn', locale: 'sr-Latn-RS' },
  { id: 'cyr', label: 'Ћир', name: 'Српски (ћирилица)', html: 'sr-Cyrl', locale: 'sr-Cyrl-RS' },
  { id: 'en', label: 'EN', name: 'English', html: 'en', locale: 'en-GB' },
];

/** A piece of content in Serbian (Latin) and English. */
export interface L {
  sr: string;
  en: string;
}
export const same = (s: string): L => ({ sr: s, en: s });

/* ───────────── Latin → Cyrillic ───────────── */

const DIGRAPHS: Record<string, string> = {
  lj: 'љ', Lj: 'Љ', LJ: 'Љ', nj: 'њ', Nj: 'Њ', NJ: 'Њ', dž: 'џ', Dž: 'Џ', DŽ: 'Џ',
};
const SINGLE: Record<string, string> = {
  a: 'а', b: 'б', v: 'в', g: 'г', d: 'д', đ: 'ђ', e: 'е', ž: 'ж', z: 'з', i: 'и', j: 'ј', k: 'к', l: 'л', m: 'м',
  n: 'н', o: 'о', p: 'п', r: 'р', s: 'с', t: 'т', ć: 'ћ', u: 'у', f: 'ф', h: 'х', c: 'ц', č: 'ч', š: 'ш',
  A: 'А', B: 'Б', V: 'В', G: 'Г', D: 'Д', Đ: 'Ђ', E: 'Е', Ž: 'Ж', Z: 'З', I: 'И', J: 'Ј', K: 'К', L: 'Л', M: 'М',
  N: 'Н', O: 'О', P: 'П', R: 'Р', S: 'С', T: 'Т', Ć: 'Ћ', U: 'У', F: 'Ф', H: 'Х', C: 'Ц', Č: 'Ч', Š: 'Ш',
};

/** Names that stay in Latin script even when the rest of the page is Cyrillic (brands, proper nouns). */
const PROTECTED = [
  'Google Maps', 'Open-Meteo', 'Facebook', 'Instagram', 'Eurogril 5', 'Caffe Anegdota', 'FDQ', 'Airsoft', 'Komandos',
  'Fido Shelter by Herz für Hunde Graz', 'Stefan_kop', 'VW', 'Audi',
];
const PROTECTED_RE = new RegExp(`(${PROTECTED.map((p) => p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`);

function cyr(segment: string) {
  let out = '';
  for (let i = 0; i < segment.length; i++) {
    const two = segment.slice(i, i + 2);
    if (DIGRAPHS[two]) {
      out += DIGRAPHS[two];
      i++;
    } else {
      const ch = segment[i];
      out += SINGLE[ch] ?? ch;
    }
  }
  return out;
}

export function toCyrillic(text: string) {
  return text
    .split(PROTECTED_RE)
    .map((part, i) => (i % 2 === 1 ? part : cyr(part)))
    .join('');
}

/* ───────────── context ───────────── */

interface Ctx {
  lang: Lang;
  setLang: (l: Lang) => void;
  locale: string;
  /** UI string by key, with `{name}` placeholders. */
  t: (key: string, vars?: Record<string, string | number>) => string;
  /** List-valued UI string (stored as `a|b|c`). */
  tl: (key: string) => string[];
  /** Pick the right language from a content object. */
  tr: (value: L) => string;
  /** Render Serbian-Latin text in the current script (identity for Latin, transliterated for Cyrillic). */
  tx: (text: string) => string;
}

const Ctx = createContext<Ctx>({
  lang: 'lat',
  setLang: () => {},
  locale: 'sr-Latn-RS',
  t: (k) => k,
  tl: () => [],
  tr: (v) => v.sr,
  tx: (s) => s,
});

const stored = (): Lang => {
  try {
    const v = localStorage.getItem('vocnjak-lang');
    if (v === 'lat' || v === 'cyr' || v === 'en') return v;
  } catch {
    /* storage unavailable */
  }
  return 'lat'; // Serbian (Latin) by default
};

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(stored);
  const meta = LANGS.find((l) => l.id === lang)!;

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem('vocnjak-lang', l);
    } catch {
      /* ignore */
    }
  }, []);

  const value = useMemo<Ctx>(() => {
    const tx = (s: string) => (lang === 'cyr' ? toCyrillic(s) : s);
    const raw = (key: string) => {
      const entry = STRINGS[key];
      if (!entry) return key;
      return lang === 'en' ? entry.en : entry.sr;
    };
    const interpolate = (s: string, vars?: Record<string, string | number>) =>
      vars ? s.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? `{${k}}`)) : s;
    return {
      lang,
      setLang,
      locale: meta.locale,
      t: (key, vars) => tx(interpolate(raw(key), vars)),
      tl: (key) => tx(raw(key)).split('|'),
      tr: (v) => (lang === 'en' ? v.en : tx(v.sr)),
      tx,
    };
  }, [lang, meta.locale, setLang]);

  useEffect(() => {
    document.documentElement.lang = meta.html;
    document.title = value.t('meta.title');
  }, [meta.html, value]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useI18n = () => useContext(Ctx);
