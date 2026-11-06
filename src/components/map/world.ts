/**
 * Procedural world definition for the low-poly Voćnjak valley.
 * Pure math (no three.js imports) so terrain, props and pins all agree on ground height.
 *
 * Layout is anchored to reality: the village road (ROAD) and the village of Tršić (TRSIC)
 * sit where they do on OpenStreetMap (1 unit ≈ 65 m, +x east, −z north). Everything else — stream,
 * orchard, church, stadium, lookout — is an illustrative landmark placed around them.
 */
import { LANE, ROAD, SCENE, TRAIL } from '../../data/geo.ts';

export const WORLD_RADIUS = 24;
export const WATER_LEVEL = 0.12;
export const RIM_HEIGHT = 3.4;

export const smoothstep = (a: number, b: number, v: number) => {
  const t = Math.min(1, Math.max(0, (v - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/** Deterministic PRNG so the scene is identical on every load. */
export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Centre line of the stream: it runs west → east and passes under Ognjenov most. */
export const riverZ = (x: number) => {
  const [bx, bz] = SCENE.most;
  return bz + (x - bx) * 0.05 + Math.sin((x - bx) * 0.2) * 2.6;
};

/** Distance (scene units, along z) from the stream's centre line. */
export const riverDist = (x: number, z: number) => Math.abs(z - riverZ(x));

export interface FlatZone {
  x: number;
  z: number;
  r: number;
  /** Fixed ground height. When omitted the zone levels to the natural height at its centre. */
  h?: number;
}

/** Flat spots under the landmarks that have their own 3D model (positions come from data/geo.ts). */
export const ZONES = {
  stadium: { x: SCENE.stadion[0], z: SCENE.stadion[1], r: 4.0 },
  church: { x: SCENE.crkva[0], z: SCENE.crkva[1], r: 1.9 },
  orchard: { x: SCENE.sljivik[0], z: SCENE.sljivik[1], r: 5.0, h: 1.5 },
  lookout: { x: SCENE.vidikovac[0], z: SCENE.vidikovac[1], r: 1.8 },
  trsic: { x: SCENE.trsic[0], z: SCENE.trsic[1], r: 3.2 },
  shelter: { x: SCENE.fido[0], z: SCENE.fido[1], r: 1.9 },
  airsoft: { x: SCENE.airsoft[0], z: SCENE.airsoft[1], r: 2.6 },
} satisfies Record<string, FlatZone>;

/* ───────────── roads ───────────── */

type Poly = [number, number][];
export const ROADS: Poly[] = [ROAD, LANE, TRAIL];

function nearestOnPoly(poly: Poly, x: number, z: number) {
  let best = Infinity;
  let bx = 0;
  let bz = 0;
  for (let i = 0; i < poly.length - 1; i++) {
    const [ax, az] = poly[i];
    const [cx, cz] = poly[i + 1];
    const dx = cx - ax;
    const dz = cz - az;
    const len2 = dx * dx + dz * dz || 1;
    const t = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / len2));
    const px = ax + dx * t;
    const pz = az + dz * t;
    const d = Math.hypot(x - px, z - pz);
    if (d < best) {
      best = d;
      bx = px;
      bz = pz;
    }
  }
  return { d: best, x: bx, z: bz };
}

export function nearestRoad(x: number, z: number) {
  let best = { d: Infinity, x: 0, z: 0 };
  for (const poly of ROADS) {
    const n = nearestOnPoly(poly, x, z);
    if (n.d < best.d) best = n;
  }
  return best;
}

/* ───────────── terrain ───────────── */

const softFloor = (h: number, floor: number) => {
  const k = 2.5;
  return floor + Math.log(1 + Math.exp((h - floor) * k)) / k;
};

function natural(x: number, z: number) {
  const d = Math.abs(z - riverZ(x));
  // Hills grow with distance from the stream, so the valley floor stays soft and walkable.
  const rise = smoothstep(2.5, 15, d);
  const roll =
    Math.sin(x * 0.16 + 1.2) * Math.cos(z * 0.13 + 0.4) * 1.5 +
    Math.sin(x * 0.07 - z * 0.09 + 2) * 1.3 +
    Math.cos(x * 0.29 + z * 0.23) * 0.45 +
    Math.sin(z * 0.5 + x * 0.31) * 0.2;
  let h = 1.1 + roll * (0.3 + 0.7 * rise) + 2.4 * rise;
  // The big hill that carries the lookout.
  h += 3.4 * Math.exp(-((x - ZONES.lookout.x) ** 2 + (z - ZONES.lookout.z) ** 2) / (2 * 3.4 * 3.4));
  return softFloor(h, 0.9);
}

/** Natural hills, eased down into a gentle terrace around the village street. */
function ground(x: number, z: number) {
  let h = natural(x, z);
  const near = nearestOnPoly(ROAD, x, z);
  const w = (1 - smoothstep(2.2, 7.5, near.d)) * 0.88;
  if (w > 0) h += (1.7 + (h - 2.6) * 0.22 - h) * w;
  return h;
}

const zoneHeights = new Map<string, number>();
function zoneHeight(key: string, zone: FlatZone) {
  if (zone.h !== undefined) return zone.h;
  let v = zoneHeights.get(key);
  if (v === undefined) {
    v = ground(zone.x, zone.z);
    zoneHeights.set(key, v);
  }
  return v;
}

export function terrainHeight(x: number, z: number) {
  let h = ground(x, z);

  const d = z - riverZ(x);
  const valley = Math.exp(-(d * d) / (2 * 1.9 * 1.9));
  h = h * (1 - valley) + -0.5 * valley;

  // Road bed: level the ground across the road (but never dam the stream).
  const road = nearestRoad(x, z);
  if (road.d < 2.4) {
    const w = (1 - smoothstep(0.7, 2.4, road.d)) * (1 - valley);
    if (w > 0) h += (ground(road.x, road.z) - h) * w;
  }

  for (const key in ZONES) {
    const zone = ZONES[key as keyof typeof ZONES] as FlatZone;
    const dist = Math.hypot(x - zone.x, z - zone.z);
    const w = 1 - smoothstep(zone.r * 0.7, zone.r, dist);
    if (w > 0) h += (zoneHeight(key, zone) - h) * w;
  }

  const r = Math.hypot(x, z);
  h += (RIM_HEIGHT - h) * smoothstep(WORLD_RADIUS * 0.86, WORLD_RADIUS, r);
  return h;
}

export function slopeAt(x: number, z: number) {
  const e = 0.3;
  const dx = terrainHeight(x + e, z) - terrainHeight(x - e, z);
  const dz = terrainHeight(x, z + e) - terrainHeight(x, z - e);
  return Math.hypot(dx, dz) / (2 * e);
}
