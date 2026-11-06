import { useId } from 'react';
import type { ArtTone, ArtVariant } from '../../data/places';

/**
 * Self-contained illustrated "photos" for every place. Pure SVG, so the site ships with
 * images that work offline — swap for real photographs by replacing this component's
 * usages with <img> tags.
 */

interface Tone {
  sky: [string, string];
  sun: string;
  sunPos: [number, number, number];
  far: string;
  mid: string;
  near: string;
  leaf: [string, string];
  wall: string;
  roof: string;
  glow: number;
}

const TONES: Record<ArtTone, Tone> = {
  day: {
    sky: ['#86cff7', '#eaf8ff'],
    sun: '#fff2a8',
    sunPos: [315, 62, 26],
    far: '#a9d69a',
    mid: '#79bd62',
    near: '#4c9a45',
    leaf: ['#2f8a45', '#4aa84f'],
    wall: '#fff7e6',
    roof: '#c0392b',
    glow: 0,
  },
  dawn: {
    sky: ['#ff9d7e', '#ffe8b6'],
    sun: '#fff6d2',
    sunPos: [92, 178, 30],
    far: '#c3c98f',
    mid: '#90b86c',
    near: '#5c9a50',
    leaf: ['#3f8a47', '#6aa957'],
    wall: '#fff0dc',
    roof: '#b8412e',
    glow: 0.2,
  },
  dusk: {
    sky: ['#40367e', '#ff9565'],
    sun: '#ffd27a',
    sunPos: [318, 165, 30],
    far: '#6a7ba3',
    mid: '#47775f',
    near: '#325a46',
    leaf: ['#1f5a3c', '#2d7048'],
    wall: '#e8d9c6',
    roof: '#8e3b34',
    glow: 1,
  },
};

function Tree({ x, y, s = 1, t, fruit }: { x: number; y: number; s?: number; t: Tone; fruit?: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x="-3" y="-4" width="6" height="22" rx="2" fill="#6b4423" />
      <circle cx="0" cy="-18" r="19" fill={t.leaf[0]} />
      <circle cx="-9" cy="-10" r="12" fill={t.leaf[1]} />
      <circle cx="10" cy="-12" r="11" fill={t.leaf[1]} />
      {fruit &&
        [
          [-8, -22],
          [6, -26],
          [10, -14],
          [-14, -10],
          [0, -12],
        ].map(([fx, fy], i) => <circle key={i} cx={fx} cy={fy} r="3" fill={fruit} />)}
    </g>
  );
}

function Cypress({ x, y, s = 1, t }: { x: number; y: number; s?: number; t: Tone }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x="-2" y="0" width="4" height="10" fill="#5b3a1e" />
      <path d="M0-60C14-40 12-8 0 2-12-8-14-40 0-60z" fill={t.leaf[0]} />
      <path d="M0-52C7-36 6-12 0-2" stroke={t.leaf[1]} strokeWidth="4" fill="none" opacity=".6" />
    </g>
  );
}

function Backdrop({ t, uid, high = false }: { t: Tone; uid: string; high?: boolean }) {
  const [sx, sy, sr] = t.sunPos;
  return (
    <>
      <defs>
        <linearGradient id={`${uid}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={t.sky[0]} />
          <stop offset="1" stopColor={t.sky[1]} />
        </linearGradient>
        <radialGradient id={`${uid}-sun`}>
          <stop offset="0" stopColor={t.sun} stopOpacity=".9" />
          <stop offset="1" stopColor={t.sun} stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="400" height="300" fill={`url(#${uid}-sky)`} />
      <circle cx={sx} cy={sy} r={sr * 3} fill={`url(#${uid}-sun)`} />
      <circle cx={sx} cy={sy} r={sr} fill={t.sun} />
      {t === TONES.dusk && [30, 70, 130, 200, 250, 360].map((x, i) => <circle key={i} cx={x} cy={18 + ((i * 23) % 60)} r="1.4" fill="#fff" opacity=".8" />)}
      <path d={high ? 'M0 170L60 120l50 40 60-70 70 80 50-40 60 60 50-30v140H0z' : 'M0 175C60 140 120 150 180 165s150-10 220-35v170H0z'} fill={t.far} />
      <path d="M0 205C70 170 140 190 220 180s130-20 180-5v125H0z" fill={t.mid} />
    </>
  );
}

function Ground({ t, y = 215 }: { t: Tone; y?: number }) {
  return <path d={`M0 ${y}C90 ${y - 18} 170 ${y + 8} 250 ${y - 4}s110-6 150 6V300H0z`} fill={t.near} />;
}

/* ───────────── variants ───────────── */

function Orchard({ t, uid }: { t: Tone; uid: string }) {
  const fruits = ['#e0392f', '#f7be2e', '#7a3b8f'];
  return (
    <>
      <Backdrop t={t} uid={uid} />
      <Ground t={t} y={205} />
      {[0, 1, 2, 3].map((r) =>
        [0, 1, 2, 3, 4, 5].map((c) => {
          const s = 0.55 + r * 0.22;
          const x = ((c + (r % 2) * 0.5) * 80 + 20 - r * 6) % 430;
          return <Tree key={`${r}-${c}`} x={x} y={212 + r * 24} s={s} t={t} fruit={fruits[(r + c) % 3]} />;
        }),
      )}
    </>
  );
}

function Viewpoint({ t, uid }: { t: Tone; uid: string }) {
  return (
    <>
      <Backdrop t={t} uid={uid} high />
      <Ground t={t} y={225} />
      <path d="M-10 300C90 270 170 245 240 232" stroke="#e8d3a0" strokeWidth="14" strokeLinecap="round" fill="none" opacity=".85" />
      <g transform="translate(262 238)">
        {[-30, 30].map((lx) => (
          <path key={lx} d={`M${lx} 0L${lx * 0.7} -90`} stroke="#7a4f2a" strokeWidth="6" strokeLinecap="round" />
        ))}
        <path d="M-30 -30L30 -70M30 -30L-30 -70" stroke="#7a4f2a" strokeWidth="3" />
        <rect x="-40" y="-98" width="80" height="9" rx="2" fill="#8c5a2e" />
        <path d="M-40 -98V-122M40 -98V-122M-40 -118H40" stroke="#6b4423" strokeWidth="3.5" strokeLinecap="round" />
        <path d="M-46 -122L0 -150 46 -122z" fill={t.roof} />
        <circle cx="0" cy="-106" r="5" fill="#2b2b2b" />
        <rect x="-4" y="-102" width="8" height="10" rx="2" fill="#2f8fd1" />
      </g>
      <Tree x={70} y={245} s={0.9} t={t} />
      <Tree x={110} y={258} s={0.7} t={t} />
      <Cypress x={355} y={252} s={0.8} t={t} />
    </>
  );
}

function Church({ t, uid }: { t: Tone; uid: string }) {
  const lit = t.glow > 0.5 ? '#ffd27a' : '#9ec8e8';
  return (
    <>
      <Backdrop t={t} uid={uid} />
      <path d="M40 300C80 240 150 215 215 215s130 25 180 85z" fill={t.mid} />
      <Ground t={t} y={245} />
      <g transform="translate(215 232)">
        <rect x="-45" y="-52" width="70" height="52" fill={t.wall} />
        <path d="M-52 -52L-10-84 32-52z" fill={t.roof} />
        <rect x="18" y="-110" width="26" height="110" fill={t.wall} />
        <path d="M14-110L31-146 48-110z" fill={t.roof} />
        <path d="M31-146v-16M25-156h12" stroke="#3a3a3a" strokeWidth="3" strokeLinecap="round" />
        <path d="M-28 0v-26a10 10 0 0 1 20 0v26z" fill="#6b4423" />
        <rect x="-38" y="-44" width="8" height="12" rx="4" fill={lit} />
        <rect x="6" y="-44" width="8" height="12" rx="4" fill={lit} />
        <rect x="26" y="-92" width="10" height="16" rx="5" fill={lit} />
      </g>
      <Cypress x={150} y={250} s={1} t={t} />
      <Cypress x={172} y={254} s={0.8} t={t} />
      <Cypress x={290} y={252} s={1.1} t={t} />
      <Tree x={60} y={262} s={0.9} t={t} />
      <Tree x={350} y={265} s={0.8} t={t} />
    </>
  );
}

function Stream({ t, uid }: { t: Tone; uid: string }) {
  const water = t.glow > 0.5 ? '#6d8fd0' : '#58b6ea';
  return (
    <>
      <Backdrop t={t} uid={uid} />
      <Ground t={t} y={215} />
      <path d="M170 215C150 235 235 242 205 262S90 280 120 300H300C280 285 330 270 285 250S220 235 235 215z" fill={water} />
      <path d="M200 232C190 240 225 246 212 258" stroke="#fff" strokeWidth="3" strokeLinecap="round" opacity=".55" fill="none" />
      <path d="M150 276c20-6 40 0 60-5" stroke="#fff" strokeWidth="3" strokeLinecap="round" opacity=".45" fill="none" />
      {[
        [120, 288, 12],
        [255, 262, 9],
        [185, 247, 7],
      ].map(([x, y, r], i) => (
        <ellipse key={i} cx={x} cy={y} rx={r} ry={r * 0.65} fill="#9a9a90" />
      ))}
      <g transform="translate(225 246)">
        <path d="M-52 4Q0-24 52 4v10H-52z" fill="#a9a398" />
        <path d="M-52 4Q0-24 52 4" stroke="#8a847a" strokeWidth="3" fill="none" />
        <path d="M-30 6Q0-10 30 6v8H-30z" fill={water} />
      </g>
      <Tree x={60} y={240} s={1.1} t={t} />
      <Tree x={345} y={250} s={1} t={t} />
      {[320, 332, 344].map((x, i) => (
        <path key={x} d={`M${x} 292l${i - 1} -22`} stroke={t.leaf[1]} strokeWidth="3" strokeLinecap="round" />
      ))}
    </>
  );
}

function Culture({ t, uid }: { t: Tone; uid: string }) {
  const lit = t.glow > 0.5 ? '#ffd27a' : '#bfe0f5';
  return (
    <>
      <Backdrop t={t} uid={uid} />
      <Ground t={t} y={235} />
      <g transform="translate(200 250)">
        <rect x="-110" y="-96" width="220" height="96" fill={t.wall} />
        <path d="M-122 -96L0 -138 122-96z" fill={t.roof} />
        <path d="M-60 -96L0-120 60-96z" fill={t.wall} opacity=".9" />
        {[-80, -40, 40, 80].map((x) => (
          <g key={x}>
            <rect x={x - 9} y="-76" width="18" height="30" rx="9" fill={lit} />
            <rect x={x - 11} y="-48" width="22" height="3" fill="#b8a98a" />
          </g>
        ))}
        <path d="M-16 0v-44a16 16 0 0 1 32 0v44z" fill="#6b4423" />
        <path d="M-60 0h120v8h-120z" fill="#c9bfa8" />
      </g>
      <g transform="translate(330 250)">
        <rect x="-2" y="-120" width="4" height="120" fill="#6b6b6b" />
        <rect x="2" y="-118" width="30" height="8" fill="#d6322a" />
        <rect x="2" y="-110" width="30" height="8" fill="#2a4fa8" />
        <rect x="2" y="-102" width="30" height="8" fill="#fff" />
      </g>
      <Tree x={40} y={262} s={1} t={t} />
      <Tree x={78} y={272} s={0.7} t={t} />
      <Cypress x={375} y={268} s={0.8} t={t} />
    </>
  );
}

function Stadium({ t, uid }: { t: Tone; uid: string }) {
  const lamp = t.glow > 0.5 ? '#fff3b0' : '#e8e8e8';
  return (
    <>
      <Backdrop t={t} uid={uid} />
      <Ground t={t} y={190} />
      {/* stand */}
      <rect x="95" y="150" width="210" height="40" fill="#2e3b36" />
      <rect x="95" y="144" width="210" height="8" fill={t.roof} />
      {Array.from({ length: 21 }).map((_, i) => (
        <rect key={i} x={100 + i * 10} y={158 + (i % 3) * 8} width="6" height="6" rx="3" fill={['#e0392f', '#f7be2e', '#fff'][i % 3]} opacity=".9" />
      ))}
      {/* floodlights */}
      {[60, 340].map((x) => (
        <g key={x}>
          <rect x={x - 2} y="96" width="4" height="96" fill="#555" />
          <rect x={x - 14} y="84" width="28" height="14" rx="3" fill="#333" />
          {[-9, 0, 9].map((dx) => (
            <circle key={dx} cx={x + dx} cy="91" r="3.4" fill={lamp} />
          ))}
          {t.glow > 0.5 && <circle cx={x} cy="95" r="34" fill="#fff3b0" opacity=".18" />}
        </g>
      ))}
      {/* pitch */}
      <path d="M70 300L330 300 290 202H110z" fill="#3fa24a" />
      {[0, 1, 2, 3].map((i) => (
        <path key={i} d={`M${110 - i * 10} ${202 + i * 24}H${290 + i * 10}l${i === 3 ? 12 : 4} 24H${106 - i * 10 - 4}z`} fill="#fff" opacity={i % 2 ? 0.07 : 0} />
      ))}
      <path d="M110 202H290L330 300H70zM200 202L200 300" stroke="#fff" strokeWidth="2.5" fill="none" opacity=".85" />
      <ellipse cx="200" cy="252" rx="30" ry="12" stroke="#fff" strokeWidth="2.5" fill="none" opacity=".85" />
      <g stroke="#fff" strokeWidth="3" fill="none">
        <path d="M170 204V190H230V204" />
      </g>
      <circle cx="238" cy="270" r="7" fill="#fff" stroke="#222" strokeWidth="1.5" />
    </>
  );
}

function Market({ t, uid }: { t: Tone; uid: string }) {
  const stalls: [number, string][] = [
    [95, '#e0392f'],
    [200, '#f7be2e'],
    [305, '#3a9d54'],
  ];
  const fruit = ['#e0392f', '#f7be2e', '#7a3b8f', '#3a9d54'];
  return (
    <>
      <Backdrop t={t} uid={uid} />
      <Ground t={t} y={215} />
      <path d="M0 255C100 240 300 240 400 255V300H0z" fill="#d9c79b" opacity=".85" />
      {/* bunting */}
      <path d="M0 60Q200 110 400 60" stroke="#6b4423" strokeWidth="2" fill="none" />
      {Array.from({ length: 13 }).map((_, i) => {
        const x = 20 + i * 30;
        const y = 60 + Math.sin(((x / 400) * Math.PI)) * 38;
        return <path key={i} d={`M${x - 8} ${y}L${x + 8} ${y}L${x} ${y + 16}z`} fill={['#e0392f', '#f7be2e', '#fff', '#2a4fa8'][i % 4]} />;
      })}
      {stalls.map(([x, c], si) => (
        <g key={x} transform={`translate(${x} 262)`}>
          <rect x="-40" y="-70" width="3" height="70" fill="#6b4423" />
          <rect x="37" y="-70" width="3" height="70" fill="#6b4423" />
          <rect x="-44" y="-30" width="88" height="30" fill="#8c5a2e" />
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <path key={i} d={`M${-44 + i * 14.7} -86h14.7l${i % 2 ? 2 : -2} 22h-14.7z`} fill={i % 2 ? '#fff' : c} />
          ))}
          {[-30, -12, 6, 24].map((fx, i) => (
            <circle key={fx} cx={fx + 4} cy="-35" r="6" fill={fruit[(i + si) % 4]} />
          ))}
        </g>
      ))}
    </>
  );
}

function Memorial({ t, uid }: { t: Tone; uid: string }) {
  const lit = t.glow > 0.5 ? '#ffd27a' : '#bfe0f5';
  return (
    <>
      <Backdrop t={t} uid={uid} />
      <Ground t={t} y={225} />
      {/* footpath */}
      <path d="M-10 300C80 280 150 262 200 252" stroke="#e8d3a0" strokeWidth="16" strokeLinecap="round" fill="none" opacity=".9" />
      {/* log house with steep shingled roof */}
      <g transform="translate(150 252)">
        <rect x="-62" y="-52" width="124" height="52" fill="#9a6b43" />
        {[-40, -28, -16, -4, 8, 20, 32, 44].map((ly) => (
          <path key={ly} d={`M-62 ${ly}H62`} stroke="#6c4a2d" strokeWidth="2" opacity=".7" />
        ))}
        <path d="M-72 -52L0 -112 72 -52z" fill="#5b3d24" />
        <path d="M-50 -58L0 -98 50 -58" stroke="#7a5a3a" strokeWidth="3" fill="none" opacity=".7" />
        <rect x="38" y="-96" width="12" height="30" fill="#7a7570" />
        <path d="M-12 0v-30a12 12 0 0 1 24 0v30z" fill="#4a2f17" />
        <rect x="-50" y="-36" width="18" height="16" rx="2" fill={lit} />
        <rect x="32" y="-36" width="18" height="16" rx="2" fill={lit} />
      </g>
      {/* monument */}
      <g transform="translate(285 255)">
        <rect x="-18" y="-20" width="36" height="20" fill="#b9b5ac" />
        <rect x="-9" y="-70" width="18" height="50" rx="4" fill="#8f8c85" />
        <circle cx="0" cy="-80" r="10" fill="#8f8c85" />
      </g>
      {/* flag */}
      <g transform="translate(345 262)">
        <rect x="-1.5" y="-90" width="3" height="90" fill="#6b6b6b" />
        <rect x="1.5" y="-88" width="26" height="7" fill="#d6322a" />
        <rect x="1.5" y="-81" width="26" height="7" fill="#2a4fa8" />
        <rect x="1.5" y="-74" width="26" height="7" fill="#fff" />
      </g>
      {/* fence */}
      {Array.from({ length: 8 }).map((_, i) => (
        <rect key={i} x={70 + i * 24} y="262" width="4" height="16" fill="#6b4423" />
      ))}
      <path d="M70 268H260" stroke="#6b4423" strokeWidth="3" />
      <Tree x={40} y={250} s={1} t={t} />
      <Tree x={380} y={280} s={0.8} t={t} />
    </>
  );
}

function Workshop({ t, uid }: { t: Tone; uid: string }) {
  const lit = t.glow > 0.5 ? '#ffd27a' : '#bfe0f5';
  return (
    <>
      <Backdrop t={t} uid={uid} />
      <Ground t={t} y={225} />
      <path d="M0 262C120 252 280 252 400 262V300H0z" fill="#c9bfa8" opacity=".8" />
      <g transform="translate(160 262)">
        <rect x="-100" y="-86" width="200" height="86" fill="#d8dadc" />
        <rect x="-108" y="-96" width="216" height="12" fill="#6b7178" />
        <rect x="-78" y="-66" width="82" height="66" rx="3" fill="#3d4349" />
        {[-58, -40, -22, -4].map((ly) => (
          <path key={ly} d={`M-78 ${ly + 0}H4`} stroke="#555c63" strokeWidth="2" />
        ))}
        <rect x="26" y="-60" width="52" height="34" rx="2" fill={lit} />
        <rect x="30" y="-18" width="22" height="18" fill="#6b4423" />
        <rect x="-60" y="-120" width="120" height="22" rx="3" fill="#2f5aa8" />
        <path d="M-48 -109h96" stroke="#fff" strokeWidth="4" strokeLinecap="round" opacity=".85" />
      </g>
      {/* a car waiting outside */}
      <g transform="translate(320 266)">
        <path d="M-44 0v-16c0-6 4-10 10-10h14l12-14h28l14 14h6c6 0 10 4 10 10V0z" fill="#e0392f" />
        <path d="M-6-26l9-10h22l10 10z" fill="#bfe0f5" opacity=".9" />
        <circle cx="-22" cy="2" r="9" fill="#2b2b2b" />
        <circle cx="30" cy="2" r="9" fill="#2b2b2b" />
      </g>
      <Tree x={40} y={250} s={0.9} t={t} />
    </>
  );
}

function Shelter({ t, uid }: { t: Tone; uid: string }) {
  const fur = ['#c9873f', '#8a5a2b', '#e8d3a0'];
  return (
    <>
      <Backdrop t={t} uid={uid} />
      <Ground t={t} y={225} />
      {/* kennels */}
      {[100, 200, 300].map((x, i) => (
        <g key={x} transform={`translate(${x} 262)`}>
          <rect x="-34" y="-40" width="68" height="40" fill={['#c9873f', '#b86f3a', '#d19a52'][i]} />
          <path d="M-42-40L0-70 42-40z" fill="#6b4423" />
          <path d="M-14 0v-22a14 14 0 0 1 28 0v22z" fill="#2b1d12" />
        </g>
      ))}
      {/* dog */}
      <g transform="translate(250 282)">
        <ellipse cx="0" cy="-14" rx="26" ry="13" fill={fur[0]} />
        <circle cx="26" cy="-24" r="11" fill={fur[0]} />
        <path d="M32-34l8-8 2 12z" fill={fur[1]} />
        <rect x="-20" y="-6" width="6" height="14" rx="3" fill={fur[1]} />
        <rect x="8" y="-6" width="6" height="14" rx="3" fill={fur[1]} />
        <path d="M-26-18c-10-6-14-16-10-22" stroke={fur[1]} strokeWidth="5" strokeLinecap="round" fill="none" />
        <circle cx="30" cy="-26" r="1.8" fill="#222" />
        <circle cx="36" cy="-22" r="2.4" fill="#222" />
      </g>
      {/* fence */}
      {Array.from({ length: 17 }).map((_, i) => (
        <rect key={i} x={10 + i * 24} y="268" width="4" height="30" fill="#6b4423" />
      ))}
      <path d="M10 278H400M10 290H400" stroke="#6b4423" strokeWidth="3" />
      <text x="360" y="60" fontSize="34" opacity=".9" fill="#e0392f">♥</text>
    </>
  );
}

function Field({ t, uid }: { t: Tone; uid: string }) {
  return (
    <>
      <Backdrop t={t} uid={uid} />
      <Ground t={t} y={215} />
      {/* netted field */}
      <path d="M50 300L350 300 320 205H80z" fill="#6b7a4a" opacity=".55" />
      <path d="M80 205V160M320 205V160M50 300V235M350 300V235" stroke="#5b4a2f" strokeWidth="5" />
      <path d="M80 160H320L350 235H50z" fill="#2f3b2f" opacity=".28" />
      {Array.from({ length: 12 }).map((_, i) => (
        <path key={i} d={`M${80 + i * 20} 160L${50 + i * 25} 235`} stroke="#2f3b2f" strokeWidth="1" opacity=".45" />
      ))}
      {/* barricades */}
      {[
        [120, 262, 44, 28, '#6b7a4a'],
        [200, 244, 36, 34, '#8a7a52'],
        [270, 266, 50, 26, '#59663f'],
        [160, 232, 28, 22, '#7a6a45'],
      ].map(([x, y, w, h, c], i) => (
        <rect key={i} x={x as number} y={(y as number) - (h as number)} width={w as number} height={h as number} rx="3" fill={c as string} />
      ))}
      {/* a player in camo */}
      <g transform="translate(236 252)">
        <circle cx="0" cy="-34" r="7" fill="#e8c9a0" />
        <rect x="-8" y="-28" width="16" height="22" rx="4" fill="#59663f" />
        <rect x="8" y="-24" width="26" height="4" rx="2" fill="#2b2b2b" />
        <rect x="-8" y="-6" width="6" height="14" fill="#3f4a2c" />
        <rect x="2" y="-6" width="6" height="14" fill="#3f4a2c" />
      </g>
    </>
  );
}

const VARIANTS: Record<ArtVariant, (p: { t: Tone; uid: string }) => React.ReactElement> = {
  workshop: Workshop,
  shelter: Shelter,
  field: Field,
  memorial: Memorial,
  orchard: Orchard,
  viewpoint: Viewpoint,
  church: Church,
  stream: Stream,
  culture: Culture,
  stadium: Stadium,
  market: Market,
};

interface Props {
  variant: ArtVariant;
  tone?: ArtTone;
  className?: string;
  title?: string;
}

export default function SceneArt({ variant, tone = 'day', className, title }: Props) {
  const uid = useId().replace(/:/g, '');
  const Variant = VARIANTS[variant];
  return (
    <svg
      viewBox="0 0 400 300"
      preserveAspectRatio="xMidYMid slice"
      className={className}
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      <Variant t={TONES[tone]} uid={uid} />
    </svg>
  );
}
