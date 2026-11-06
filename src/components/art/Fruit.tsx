import type { SVGProps } from 'react';

type P = SVGProps<SVGSVGElement>;

export function Apple(props: P) {
  return (
    <svg viewBox="0 0 64 64" {...props}>
      <path d="M32 21c-9-6-19 1-17 13 1.6 10 9 17 17 14 8 3 15.4-4 17-14 2-12-8-19-17-13z" fill="#e0392f" />
      <path d="M33 21c0-7 3-11 9-13-1 6-3 10-9 13z" fill="#3a9d54" />
      <path d="M32 21c0-3-1-6-2-8" stroke="#5b3a1e" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <ellipse cx="23" cy="31" rx="3" ry="5" fill="#fff" opacity=".3" transform="rotate(20 23 31)" />
    </svg>
  );
}

export function Plum(props: P) {
  return (
    <svg viewBox="0 0 64 64" {...props}>
      <ellipse cx="32" cy="37" rx="19" ry="21" fill="#7a3b8f" />
      <path d="M32 16c0 12 0 28 0 42" stroke="#5f2a72" strokeWidth="2" opacity=".5" fill="none" />
      <path d="M33 16c1-6 4-9 10-10-1 6-4 9-10 10z" fill="#3a9d54" />
      <path d="M32 17c0-3-1-5-2-7" stroke="#5b3a1e" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <ellipse cx="23" cy="32" rx="3.5" ry="6" fill="#fff" opacity=".28" transform="rotate(15 23 32)" />
    </svg>
  );
}

export function Pear(props: P) {
  return (
    <svg viewBox="0 0 64 64" {...props}>
      <path d="M32 18c-6 0-9 6-9 11 0 4-9 8-9 17 0 8 8 14 18 14s18-6 18-14c0-9-9-13-9-17 0-5-3-11-9-11z" fill="#f7be2e" />
      <path d="M33 18c1-6 4-10 10-11-1 6-4 10-10 11z" fill="#3a9d54" />
      <path d="M32 18c0-3-1-6-2-8" stroke="#5b3a1e" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <ellipse cx="24" cy="44" rx="3" ry="6" fill="#fff" opacity=".35" transform="rotate(12 24 44)" />
    </svg>
  );
}

export function Leaf(props: P) {
  return (
    <svg viewBox="0 0 64 64" {...props}>
      <path d="M10 54C8 28 26 10 54 10c0 28-16 46-44 44z" fill="#3a9d54" />
      <path d="M12 52C26 38 38 28 50 14" stroke="#174d2a" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity=".6" />
    </svg>
  );
}

export function Sun(props: P) {
  return (
    <svg viewBox="0 0 64 64" {...props}>
      <circle cx="32" cy="32" r="12" fill="currentColor" />
      {Array.from({ length: 8 }).map((_, i) => (
        <rect key={i} x="30.5" y="6" width="3" height="10" rx="1.5" fill="currentColor" transform={`rotate(${i * 45} 32 32)`} />
      ))}
    </svg>
  );
}

export function Moon(props: P) {
  return (
    <svg viewBox="0 0 64 64" {...props}>
      <path d="M44 41A19 19 0 0 1 23 14a19 19 0 1 0 21 27z" fill="currentColor" />
    </svg>
  );
}
