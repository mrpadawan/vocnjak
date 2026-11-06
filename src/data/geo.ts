/**
 * Geographic data behind the 3D map.
 *
 * Positions of the real places were read from Google Maps screenshots and are stored as metres
 * east/north of "AS Perić". To fit a ~4 km wide area into one small valley, the 3D scene uses a
 * "magnifying glass" projection: the village core (shops, café, road) is shown at about 48 m per
 * scene unit, while the outskirts (dog shelter, airsoft field, Tršić) are progressively compressed.
 * To correct any position, edit the numbers in `REAL_M` — everything else follows.
 */

/** Anchor for the metre offsets below (AS Perić). */
export const ANCHOR = { lat: 44.50222, lon: 19.25505 };
/** Centre of the village of Voćnjak (OpenStreetMap). */
export const VILLAGE_CENTER = { lat: 44.50472, lon: 19.25278 };
/** Centre of the village of Tršić (OpenStreetMap), Vuk Karadžić's birthplace. */
export const TRSIC_COORDS = { lat: 44.4958165, lon: 19.2704649 };
export const TRSIC_WALK_MIN = 20;

const M_PER_DEG_LON = 111320 * Math.cos((44.5 * Math.PI) / 180);
const M_PER_DEG_LAT = 111200;
export const toMeters = (lat: number, lon: number): [number, number] => [
  (lon - ANCHOR.lon) * M_PER_DEG_LON,
  (lat - ANCHOR.lat) * M_PER_DEG_LAT,
];

/* ───────────── magnifying-glass projection ───────────── */

/** Centre of the magnified core, metres from the anchor. */
const CORE: [number, number] = [-500, 550];
const CORE_RADIUS_M = 600;
const CORE_M_PER_UNIT = 48;
const OUTER_M_PER_UNIT = 260;

/** Metres east/north of the anchor → scene [x, z] (+x east, −z north). */
export function warp(e: number, n: number): [number, number] {
  const dx = e - CORE[0];
  const dy = n - CORE[1];
  const r = Math.hypot(dx, dy);
  if (r < 1e-6) return [0, 0];
  const rs = r <= CORE_RADIUS_M ? r / CORE_M_PER_UNIT : CORE_RADIUS_M / CORE_M_PER_UNIT + (r - CORE_RADIUS_M) / OUTER_M_PER_UNIT;
  const f = rs / r;
  return [dx * f, -dy * f];
}

/* ───────────── places (metres east, north of the anchor) ───────────── */

/** Vuk Karadžić's birth house ("Vukova kuća"), as marked on Google Maps. */
const TRSIC_M: [number, number] = [1042, -574];

export const REAL_M: Record<string, [number, number]> = {
  'as-peric': [0, 0],
  goca: [-397, 262],
  eurogril: [-392, 323],
  anegdota: [-388, 353],
  gavric: [-384, 384],
  fdq: [-300, 350], // not found by name on Google Maps — placed in the village centre
  crkva: [-170, 283],
  antonic: [-310, 559],
  'polovni-delovi': [-448, 566],
  most: [-437, 684],
  'djuric-klima': [-641, 1129],
  djukanovic: [-1134, 837],
  skola: [-560, 1180], // approximate
  'as-matic': [-45, 20], // right next to AS Perić
  stadion: [-387, 1017], // Stadion "LUK" / Fudbalski klub Luk
  spomenik: [-831, 1299], // "Spomenik" at the northern entrance, on the road
  fido: [-1361, 181],
  jerinic: [-1401, 289],
  'rogonjin-spomenik': [-2074, 465],
  airsoft: [-2221, 331],
  'stefan-kop': [-2203, -57],
  trsic: TRSIC_M,
};

/** Scene positions: real places projected, plus a few illustrative landmarks placed by hand. */
export const SCENE: Record<string, [number, number]> = {
  ...Object.fromEntries(Object.entries(REAL_M).map(([id, [e, n]]) => [id, warp(e, n)])),
  sljivik: [12.5, 4.5],
  vidikovac: [10, -11],
};

// AS Matić stands right next to AS Perić. In the compressed outskirts that is far less than one scene
// unit, so nudge it sideways (towards the lane) to keep both buildings and pins readable.
SCENE['as-matic'] = [SCENE['as-peric'][0] - 2, SCENE['as-peric'][1] - 0.6];

export const TRSIC = SCENE.trsic;

/* ───────────── roads (drawn unnamed) ───────────── */

type Poly = [number, number][];

function densify(poly: Poly, stepM: number): Poly {
  const out: Poly = [];
  for (let i = 0; i < poly.length - 1; i++) {
    const [ax, ay] = poly[i];
    const [bx, by] = poly[i + 1];
    const n = Math.max(1, Math.ceil(Math.hypot(bx - ax, by - ay) / stepM));
    for (let k = 0; k < n; k++) out.push([ax + ((bx - ax) * k) / n, ay + ((by - ay) * k) / n]);
  }
  out.push(poly[poly.length - 1]);
  return out;
}

function catmullRom(pts: Poly, perSegment = 8): Poly {
  const out: Poly = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(pts.length - 1, i + 2)];
    for (let k = 0; k < perSegment; k++) {
      const t = k / perSegment;
      const t2 = t * t;
      const t3 = t2 * t;
      const f = (a: number, b: number, c: number, d: number) =>
        0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3);
      out.push([f(p0[0], p1[0], p2[0], p3[0]), f(p0[1], p1[1], p2[1], p3[1])]);
    }
  }
  out.push(pts[pts.length - 1]);
  return out;
}

const project = (poly: Poly, stepM: number): Poly => densify(poly, stepM).map(([e, n]) => warp(e, n));

/** Main road 330 through the village, north → south, traced from Google Maps (metres). */
const MAIN_ROAD_M: Poly = [
  [-974, 1483],
  [-895, 1381],
  [-831, 1299],
  [-782, 1268],
  [-658, 1246],
  [-613, 1189],
  [-579, 1110],
  [-557, 1031],
  [-523, 975],
  [-466, 896],
  [-438, 805],
  [-430, 692],
  [-449, 562],
  [-400, 492],
  [-376, 423],
  [-345, 144],
  [-318, -82],
  [-362, -151],
  [-440, -198],
  [-640, -378],
  [-741, -395],
  [-814, -447],
  [-800, -552],
  [-814, -726],
  [-867, -804],
  [-1006, -809],
  [-1093, -899],
  [-1319, -978],
  [-1493, -1056],
];
/** Side lane from the main road past AS Perić. */
const LANE_M: Poly = [
  [-376, 348],
  [-275, 350],
  [-170, 292],
  [-92, 144],
  [-66, -30],
  [0, -129],
];
/** Footpath from the lane (past AS Perić) to Vuk's house in Tršić. */
const TRAIL_M: Poly = catmullRom(
  [
    [0, -129],
    [220, -210],
    [520, -320],
    [820, -460],
    TRSIC_M,
  ],
  6,
);

export const ROAD = project(MAIN_ROAD_M, 25);
export const LANE = project(LANE_M, 25);
export const TRAIL = project(TRAIL_M, 30);

/**
 * Point at fraction `t` (0–1, by length) along a polyline, pushed sideways by `off` scene units
 * (positive = left of the direction of travel).
 */
export function alongPath(poly: Poly, t: number, off = 0): [number, number] {
  const lens: number[] = [];
  let total = 0;
  for (let i = 0; i < poly.length - 1; i++) {
    const l = Math.hypot(poly[i + 1][0] - poly[i][0], poly[i + 1][1] - poly[i][1]);
    lens.push(l);
    total += l;
  }
  let d = Math.min(Math.max(t, 0), 1) * total;
  for (let i = 0; i < lens.length; i++) {
    if (d <= lens[i] || i === lens.length - 1) {
      const f = lens[i] ? d / lens[i] : 0;
      const [ax, az] = poly[i];
      const [bx, bz] = poly[i + 1];
      const tx = (bx - ax) / (lens[i] || 1);
      const tz = (bz - az) / (lens[i] || 1);
      return [ax + (bx - ax) * f + tz * off, az + (bz - az) * f - tx * off];
    }
    d -= lens[i];
  }
  return poly[0];
}

/* ───────────── Google Maps links ───────────── */

const q = (s: string) => encodeURIComponent(s);
export const googleMapsSearch = (query: string) => `https://www.google.com/maps/search/?api=1&query=${q(query)}`;
export const googleMapsEmbed = (query: string, hl: string) => `https://maps.google.com/maps?q=${q(query)}&z=15&hl=${hl}&output=embed`;
export const GOOGLE_MAPS_VILLAGE = googleMapsSearch('Voćnjak, Loznica, Srbija');
export const WALK_TO_TRSIC_URL =
  `https://www.google.com/maps/dir/?api=1&origin=${VILLAGE_CENTER.lat},${VILLAGE_CENTER.lon}` +
  `&destination=${TRSIC_COORDS.lat},${TRSIC_COORDS.lon}&travelmode=walking`;
