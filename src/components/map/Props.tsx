import { useFrame } from '@react-three/fiber';
import { useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { LANE, ROAD, SCENE, TRAIL, TRSIC } from '../../data/geo';
import { KIND_META, places, type Place } from '../../data/places';
import { SpriteLabel } from './Markers';
import {
  WATER_LEVEL,
  WORLD_RADIUS,
  ZONES,
  mulberry32,
  nearestRoad,
  riverDist,
  riverZ,
  slopeAt,
  terrainHeight,
  type FlatZone,
} from './world';

/* ───────────────────────── instancing helper ───────────────────────── */

interface InstancedProps {
  geometry: THREE.BufferGeometry;
  matrices: THREE.Matrix4[];
  colors?: THREE.Color[];
  color?: string;
  roughness?: number;
}

function Instanced({ geometry, matrices, colors, color = '#ffffff', roughness = 0.9 }: InstancedProps) {
  const ref = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    matrices.forEach((m, i) => mesh.setMatrixAt(i, m));
    colors?.forEach((c, i) => mesh.setColorAt(i, c));
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [matrices, colors]);

  return (
    <instancedMesh ref={ref} args={[geometry, undefined, matrices.length]} castShadow receiveShadow>
      <meshStandardMaterial flatShading roughness={roughness} color={color} />
    </instancedMesh>
  );
}

const Q = new THREE.Quaternion();
const E = new THREE.Euler();
function mat(x: number, y: number, z: number, sx = 1, sy = sx, sz = sx, rotY = 0) {
  return new THREE.Matrix4().compose(
    new THREE.Vector3(x, y, z),
    Q.setFromEuler(E.set(0, rotY, 0)),
    new THREE.Vector3(sx, sy, sz),
  );
}

const GEO = {
  trunk: new THREE.CylinderGeometry(0.08, 0.12, 0.6, 6),
  coneA: new THREE.ConeGeometry(0.62, 1.3, 7),
  coneB: new THREE.ConeGeometry(0.46, 1.1, 7),
  blob: new THREE.IcosahedronGeometry(0.7, 0),
  orchardBlob: new THREE.IcosahedronGeometry(0.6, 1),
  fruit: new THREE.IcosahedronGeometry(0.1, 0),
};

/* ───────────────────────── forest + orchard ───────────────────────── */

const PINE_COLORS = ['#1f6b3a', '#2a7d45', '#18583a', '#33804a'].map((c) => new THREE.Color(c));
const ROUND_COLORS = ['#4c9c47', '#62ad4e', '#3e8c45', '#7bb352'].map((c) => new THREE.Color(c));

function useForest() {
  return useMemo(() => {
    const rnd = mulberry32(42);
    const zones = Object.values(ZONES) as FlatZone[];
    const pts: { x: number; z: number; h: number; pine: boolean; s: number; c: number }[] = [];
    for (let tries = 0; tries < 4000 && pts.length < 240; tries++) {
      const a = rnd() * Math.PI * 2;
      const r = Math.sqrt(rnd()) * (WORLD_RADIUS - 1.3);
      const x = Math.cos(a) * r;
      const z = Math.sin(a) * r;
      const h = terrainHeight(x, z);
      if (h < 1) continue;
      if (riverDist(x, z) < 3) continue;
      if (slopeAt(x, z) > 1.2) continue;
      if (nearestRoad(x, z).d < 2.4) continue;
      if (places.some((pl) => Math.hypot(x - pl.position[0], z - pl.position[1]) < 2.2)) continue;
      if (zones.some((zn) => Math.hypot(x - zn.x, z - zn.z) < zn.r + 0.7)) continue;
      if (pts.some((p) => (p.x - x) ** 2 + (p.z - z) ** 2 < 1.3)) continue;
      pts.push({ x, z, h, pine: rnd() < 0.62, s: 0.8 + rnd() * 0.75, c: Math.floor(rnd() * 4) });
    }

    const trunks: THREE.Matrix4[] = [];
    const coneA: THREE.Matrix4[] = [];
    const coneB: THREE.Matrix4[] = [];
    const blobs: THREE.Matrix4[] = [];
    const pineCols: THREE.Color[] = [];
    const blobCols: THREE.Color[] = [];
    for (const p of pts) {
      trunks.push(mat(p.x, p.h + 0.3 * p.s, p.z, p.s));
      if (p.pine) {
        coneA.push(mat(p.x, p.h + p.s * 1.0, p.z, p.s));
        coneB.push(mat(p.x, p.h + p.s * 1.7, p.z, p.s));
        pineCols.push(PINE_COLORS[p.c]);
      } else {
        blobs.push(mat(p.x, p.h + p.s * 1.1, p.z, p.s * 1.1, p.s * 1.0, p.s * 1.1));
        blobCols.push(ROUND_COLORS[p.c]);
      }
    }
    return { trunks, coneA, coneB, blobs, pineCols, blobCols };
  }, []);
}

function useOrchard() {
  return useMemo(() => {
    const rnd = mulberry32(5);
    const { x: cx, z: cz, r } = ZONES.orchard;
    const trees: THREE.Matrix4[] = [];
    const trunks: THREE.Matrix4[] = [];
    const leafCols: THREE.Color[] = [];
    const fruits: THREE.Matrix4[] = [];
    const fruitCols: THREE.Color[] = [];
    const fruitPalette = ['#e0392f', '#f7be2e', '#7a3b8f', '#e0392f'];
    const leaf = ['#4fa046', '#62b04f', '#7ab852', '#3f8f44'];

    let idx = 0;
    for (let j = -4; j <= 4; j++) {
      for (let i = -4; i <= 4; i++) {
        const x = cx + i * 1.45 + (j % 2) * 0.45;
        const z = cz + j * 1.35;
        if (Math.hypot(x - cx, z - cz) > r * 0.88) continue;
        const h = terrainHeight(x, z);
        if (h < 0.9 || riverDist(x, z) < 2.4) continue;
        const s = 0.85 + rnd() * 0.3;
        trunks.push(mat(x, h + 0.3 * s, z, s));
        trees.push(mat(x, h + 0.95 * s, z, s));
        leafCols.push(new THREE.Color(leaf[idx % 4]));
        const fc = new THREE.Color(fruitPalette[idx % 4]);
        for (let k = 0; k < 7; k++) {
          const a = rnd() * Math.PI * 2;
          const up = rnd() * 0.9 - 0.2;
          const rr = Math.sqrt(1 - up * up) * 0.62 * s;
          fruits.push(mat(x + Math.cos(a) * rr, h + 0.95 * s + up * 0.6 * s, z + Math.sin(a) * rr, s));
          fruitCols.push(fc);
        }
        idx++;
      }
    }
    return { trees, trunks, leafCols, fruits, fruitCols };
  }, []);
}

export function Forest() {
  const f = useForest();
  const o = useOrchard();
  return (
    <group>
      <Instanced geometry={GEO.trunk} matrices={f.trunks} color="#6b4423" />
      <Instanced geometry={GEO.coneA} matrices={f.coneA} colors={f.pineCols} />
      <Instanced geometry={GEO.coneB} matrices={f.coneB} colors={f.pineCols} />
      <Instanced geometry={GEO.blob} matrices={f.blobs} colors={f.blobCols} />
      <Instanced geometry={GEO.trunk} matrices={o.trunks} color="#6b4423" />
      <Instanced geometry={GEO.orchardBlob} matrices={o.trees} colors={o.leafCols} />
      <Instanced geometry={GEO.fruit} matrices={o.fruits} colors={o.fruitCols} roughness={0.5} />
    </group>
  );
}

/* ───────────────────────── village ───────────────────────── */

function Box({
  pos,
  size,
  color,
  rot = 0,
  emissive,
  emissiveIntensity = 0,
}: {
  pos: [number, number, number];
  size: [number, number, number];
  color: string;
  rot?: number;
  emissive?: string;
  emissiveIntensity?: number;
}) {
  return (
    <mesh position={pos} rotation={[0, rot, 0]} castShadow receiveShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} flatShading emissive={emissive ?? '#000'} emissiveIntensity={emissiveIntensity} />
    </mesh>
  );
}

function Roof({ w, d, h, y, color }: { w: number; d: number; h: number; y: number; color: string }) {
  return (
    <mesh position={[0, y + h / 2, 0]} rotation={[0, Math.PI / 4, 0]} scale={[w * 0.78, h, d * 0.78]} castShadow>
      <coneGeometry args={[1, 1, 4]} />
      <meshStandardMaterial color={color} flatShading />
    </mesh>
  );
}

function House({
  x,
  z,
  w,
  d,
  h,
  rot,
  wall,
  roof,
  dark,
}: {
  x: number;
  z: number;
  w: number;
  d: number;
  h: number;
  rot: number;
  wall: string;
  roof: string;
  dark: boolean;
}) {
  const y = terrainHeight(x, z);
  const win = dark ? '#ffd27a' : '#9ec8e8';
  return (
    <group position={[x, y, z]} rotation={[0, rot, 0]}>
      <Box pos={[0, h / 2, 0]} size={[w, h, d]} color={wall} />
      <Roof w={w * 1.18} d={d * 1.18} h={h * 0.75} y={h} color={roof} />
      <Box pos={[-w * 0.22, h * 0.55, d / 2 + 0.01]} size={[0.16, 0.2, 0.03]} color={win} emissive="#ffb43a" emissiveIntensity={dark ? 2.2 : 0} />
      <Box pos={[w * 0.22, h * 0.55, d / 2 + 0.01]} size={[0.16, 0.2, 0.03]} color={win} emissive="#ffb43a" emissiveIntensity={dark ? 2.2 : 0} />
      <Box pos={[0, h * 0.28, d / 2 + 0.01]} size={[0.2, h * 0.5, 0.03]} color="#6b4423" />
    </group>
  );
}

const WALLS = ['#fff3dc', '#f4e1c1', '#eef2dd', '#fbe7d3'];
const ROOFS = ['#c0392b', '#a8442f', '#b5651d', '#c0392b'];

/** Heading (rotation about Y) for an object whose front (+z) should face the nearest road. */
function facingRoad(x: number, z: number) {
  const r = nearestRoad(x, z);
  return Math.atan2(r.x - x, r.z - z);
}

/** Ordinary houses along the village road, alternating sides (kept clear of the named places). */
function useStreetHouses() {
  return useMemo(() => {
    const rnd = mulberry32(11);
    const out: { x: number; z: number; w: number; d: number; h: number; rot: number; wall: string; roof: string }[] = [];
    const pts = ROAD;
    const spacing = 1.5;
    let carry = 0.8;
    let side = 1;
    for (let i = 0; i < pts.length - 1; i++) {
      const [ax, az] = pts[i];
      const [bx, bz] = pts[i + 1];
      const len = Math.hypot(bx - ax, bz - az);
      const tx = (bx - ax) / len;
      const tz = (bz - az) / len;
      while (carry < len) {
        const px = ax + tx * carry;
        const pz = az + tz * carry;
        const off = 1.45 + rnd() * 0.25;
        const x = px - tz * off * side;
        const z = pz + tx * off * side;
        const clear = places.every((pl) => Math.hypot(x - pl.position[0], z - pl.position[1]) > 2.1);
        if (clear && terrainHeight(x, z) > WATER_LEVEL + 0.6 && riverDist(x, z) > 2.6) {
          const k = Math.floor(rnd() * 4);
          out.push({
            x,
            z,
            w: 1.0 + rnd() * 0.35,
            d: 0.85 + rnd() * 0.25,
            h: 0.62 + rnd() * 0.2,
            rot: facingRoad(x, z) + (rnd() - 0.5) * 0.15,
            wall: WALLS[k],
            roof: ROOFS[(k + 1) % 4],
          });
        }
        carry += spacing;
        side = -side;
      }
      carry -= len;
    }
    return out;
  }, []);
}

export function Village({ dark }: { dark: boolean }) {
  const houses = useStreetHouses();
  return (
    <group>
      {houses.map((h, i) => (
        <House key={i} {...h} dark={dark} />
      ))}
    </group>
  );
}

/* ───────────────────────── roads ───────────────────────── */

function Ribbon({ pts, width, color, lift = 0.07 }: { pts: [number, number][]; width: number; color: string; lift?: number }) {
  const geometry = useMemo(() => {
    const pos: number[] = [];
    const idx: number[] = [];
    const ok: boolean[] = [];
    pts.forEach(([x, z], i) => {
      const [px, pz] = pts[Math.max(0, i - 1)];
      const [nx, nz] = pts[Math.min(pts.length - 1, i + 1)];
      const len = Math.hypot(nx - px, nz - pz) || 1;
      const tx = (nx - px) / len;
      const tz = (nz - pz) / len;
      for (const side of [1, -1]) {
        const vx = x - tz * (width / 2) * side;
        const vz = z + tx * (width / 2) * side;
        pos.push(vx, terrainHeight(vx, vz) + lift, vz);
      }
      ok.push(terrainHeight(x, z) > WATER_LEVEL + 0.12);
    });
    for (let i = 0; i < pts.length - 1; i++) {
      if (!ok[i] || !ok[i + 1]) continue; // leave a gap where the stream is (the bridge spans it)
      const a = i * 2;
      idx.push(a, a + 2, a + 1, a + 1, a + 2, a + 3);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setIndex(idx);
    g.computeVertexNormals();
    return g;
  }, [pts, width, lift]);
  return (
    <mesh geometry={geometry} receiveShadow>
      <meshStandardMaterial color={color} roughness={1} side={THREE.DoubleSide} polygonOffset polygonOffsetFactor={-3} polygonOffsetUnits={-3} />
    </mesh>
  );
}

/** Main road + lane (asphalt) and the footpath to Tršić (dirt), with its signpost. */
export function Roads({ trailLabel }: { trailLabel: string }) {
  const start = TRAIL[0];
  const sy = terrainHeight(start[0] + 0.9, start[1] + 0.35);
  return (
    <group>
      <Ribbon pts={ROAD} width={0.62} color="#6e7378" />
      <Ribbon pts={LANE} width={0.5} color="#7d8288" />
      <Ribbon pts={TRAIL} width={0.42} color="#cfae7a" lift={0.08} />
      {/* signpost where the footpath leaves the lane */}
      <group position={[start[0] + 0.9, sy, start[1] + 0.35]}>
        <Box pos={[0, 0.5, 0]} size={[0.07, 1, 0.07]} color="#6b4423" />
        <Box pos={[0.28, 0.9, 0]} size={[0.7, 0.22, 0.05]} color="#f7be2e" />
      </group>
      <SpriteLabel position={[start[0] + 1.2, sy + 1.55, start[1] + 0.35]} emoji="🚶" text={trailLabel} px={26} tone="sign" />
    </group>
  );
}

/* ───────────────────────── everyday places ───────────────────────── */

function Awning({ w, y, z, c }: { w: number; y: number; z: number; c: string }) {
  const n = 5;
  return (
    <group>
      {Array.from({ length: n }).map((_, i) => (
        <mesh key={i} position={[-w / 2 + (w / n) * (i + 0.5), y, z]} rotation={[0.4, 0, 0]} castShadow>
          <boxGeometry args={[w / n, 0.03, 0.42]} />
          <meshStandardMaterial color={i % 2 ? '#ffffff' : c} flatShading />
        </mesh>
      ))}
    </group>
  );
}

function PoiBuilding({ place, dark }: { place: Place; dark: boolean }) {
  const [x, z] = place.position;
  const y = terrainHeight(x, z);
  const rot = facingRoad(x, z);
  const accent = KIND_META[place.kind].color;
  const win = dark ? '#ffd27a' : '#9ec8e8';
  const glow = dark ? 2.2 : 0;

  let body: React.ReactNode = null;
  switch (place.style) {
    case 'school':
      body = (
        <>
          <Box pos={[0, 0.4, 0]} size={[2.5, 0.8, 1.1]} color="#ffe9a8" />
          <Roof w={2.9} d={1.4} h={0.5} y={0.8} color="#c0392b" />
          {[-0.9, -0.45, 0.45, 0.9].map((wx) => (
            <Box key={wx} pos={[wx, 0.48, 0.56]} size={[0.2, 0.26, 0.03]} color={win} emissive="#ffb43a" emissiveIntensity={glow} />
          ))}
          <Box pos={[0, 0.25, 0.56]} size={[0.38, 0.5, 0.03]} color="#6b4423" />
          <mesh position={[1.5, 0.9, 0.5]} castShadow>
            <cylinderGeometry args={[0.025, 0.025, 1.8, 6]} />
            <meshStandardMaterial color="#8a8a8a" />
          </mesh>
          {(['#d6322a', '#2a4fa8', '#ffffff'] as const).map((c, i) => (
            <mesh key={c} position={[1.5 + 0.22, 1.68 - i * 0.11, 0.5]}>
              <boxGeometry args={[0.44, 0.11, 0.02]} />
              <meshStandardMaterial color={c} />
            </mesh>
          ))}
        </>
      );
      break;
    case 'shop':
    case 'cafe':
      body = (
        <>
          <Box pos={[0, 0.34, 0]} size={[1.3, 0.68, 0.9]} color="#fff3dc" />
          <Roof w={1.55} d={1.15} h={0.4} y={0.68} color={place.style === 'cafe' ? '#a8442f' : '#c0392b'} />
          <Box pos={[-0.3, 0.38, 0.46]} size={[0.4, 0.3, 0.03]} color={win} emissive="#ffb43a" emissiveIntensity={glow} />
          <Box pos={[0.35, 0.28, 0.46]} size={[0.24, 0.5, 0.03]} color="#6b4423" />
          <Awning w={1.2} y={0.64} z={0.62} c={accent} />
          {place.style === 'cafe' &&
            [-0.5, 0.5].map((tx) => (
              <group key={tx} position={[tx, 0, 1.1]}>
                <mesh position={[0, 0.2, 0]} castShadow>
                  <cylinderGeometry args={[0.2, 0.2, 0.03, 10]} />
                  <meshStandardMaterial color="#f1e6d0" />
                </mesh>
                <Box pos={[0, 0.1, 0]} size={[0.04, 0.2, 0.04]} color="#6b4423" />
                <mesh position={[0, 0.58, 0]} castShadow>
                  <coneGeometry args={[0.34, 0.2, 8]} />
                  <meshStandardMaterial color={accent} flatShading />
                </mesh>
                <Box pos={[0, 0.38, 0]} size={[0.025, 0.4, 0.025]} color="#6b4423" />
              </group>
            ))}
        </>
      );
      break;
    case 'garage':
      body = (
        <>
          <Box pos={[0, 0.3, 0]} size={[1.6, 0.6, 1.0]} color="#d8dadc" />
          <Box pos={[0, 0.64, 0]} size={[1.7, 0.07, 1.1]} color="#6b7178" />
          <Box pos={[-0.3, 0.26, 0.51]} size={[0.7, 0.46, 0.03]} color="#3d4349" />
          <Box pos={[0.5, 0.45, 0.51]} size={[0.36, 0.14, 0.03]} color={accent} />
          <Box pos={[0.5, 0.2, 0.51]} size={[0.2, 0.4, 0.03]} color="#6b4423" />
        </>
      );
      break;
    case 'hut':
      body = (
        <>
          <Box pos={[0, 0.28, 0]} size={[1.0, 0.56, 0.8]} color="#f1e3c8" />
          <Roof w={1.2} d={1.0} h={0.36} y={0.56} color="#8e3b34" />
          <Box pos={[-0.2, 0.34, 0.41]} size={[0.2, 0.2, 0.03]} color={win} emissive="#ffb43a" emissiveIntensity={glow} />
          <Box pos={[0.25, 0.22, 0.41]} size={[0.2, 0.42, 0.03]} color="#6b4423" />
          <Box pos={[0, 0.5, 0.42]} size={[0.5, 0.1, 0.02]} color={accent} />
        </>
      );
      break;
    case 'house':
      body = (
        <>
          <Box pos={[0, 0.36, 0]} size={[1.4, 0.72, 1.0]} color="#fbe7d3" />
          <Roof w={1.7} d={1.3} h={0.55} y={0.72} color="#b5651d" />
          <Box pos={[-0.35, 0.4, 0.51]} size={[0.2, 0.22, 0.03]} color={win} emissive="#ffb43a" emissiveIntensity={glow} />
          <Box pos={[0.35, 0.28, 0.51]} size={[0.24, 0.5, 0.03]} color="#6b4423" />
          <Box pos={[1.25, 0.2, -0.2]} size={[0.8, 0.4, 0.6]} color="#7d5a38" />
          <Roof w={1.0} d={0.8} h={0.28} y={0.4} color="#5b3d24" />
        </>
      );
      break;
    case 'monument':
      body = (
        <>
          <Box pos={[0, 0.06, 0]} size={[0.9, 0.12, 0.9]} color="#a9a59c" />
          <Box pos={[0, 0.2, 0]} size={[0.6, 0.16, 0.6]} color="#b9b5ac" />
          <mesh position={[0, 0.85, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
            <cylinderGeometry args={[0.1, 0.2, 1.2, 4]} />
            <meshStandardMaterial color="#8f8c85" flatShading />
          </mesh>
          <mesh position={[0, 1.55, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
            <coneGeometry args={[0.1, 0.2, 4]} />
            <meshStandardMaterial color="#7a7770" flatShading />
          </mesh>
        </>
      );
      break;
    case 'shelter':
      body = (
        <>
          {[-0.7, 0, 0.7].map((kx, i) => (
            <group key={kx} position={[kx, 0, -0.2 + (i === 1 ? 0.25 : 0)]}>
              <Box pos={[0, 0.17, 0]} size={[0.5, 0.34, 0.5]} color={['#c9873f', '#b86f3a', '#d19a52'][i]} />
              <Roof w={0.62} d={0.62} h={0.22} y={0.34} color="#6b4423" />
              <Box pos={[0, 0.12, 0.26]} size={[0.18, 0.22, 0.02]} color="#2b1d12" />
            </group>
          ))}
          {Array.from({ length: 14 }).map((_, i) => {
            const a = (i / 14) * Math.PI * 2;
            return <Box key={i} pos={[Math.cos(a) * 1.45, 0.14, Math.sin(a) * 1.15]} size={[0.05, 0.28, 0.05]} color="#6b4423" />;
          })}
        </>
      );
      break;
    case 'field':
      body = (
        <>
          {/* netted perimeter */}
          {(
            [
              [0, -1.8, 4.2, 0.04],
              [0, 1.8, 4.2, 0.04],
            ] as const
          ).map(([px, pz, w], i) => (
            <mesh key={i} position={[px, 0.35, pz]}>
              <planeGeometry args={[w, 0.7]} />
              <meshStandardMaterial color="#2f3b2f" transparent opacity={0.35} side={THREE.DoubleSide} />
            </mesh>
          ))}
          {[-2.1, 2.1].map((px) => (
            <mesh key={px} position={[px, 0.35, 0]} rotation={[0, Math.PI / 2, 0]}>
              <planeGeometry args={[3.6, 0.7]} />
              <meshStandardMaterial color="#2f3b2f" transparent opacity={0.35} side={THREE.DoubleSide} />
            </mesh>
          ))}
          {Array.from({ length: 10 }).map((_, i) => (
            <Box key={i} pos={[-2.1 + (i % 5) * 1.05, 0.35, i < 5 ? -1.8 : 1.8]} size={[0.05, 0.7, 0.05]} color="#5b4a2f" />
          ))}
          {/* barricades */}
          {(
            [
              [-0.9, -0.5, 0.5, 0.4, 0.35],
              [0.4, 0.5, 0.6, 0.5, 0.4],
              [1.2, -0.6, 0.35, 0.35, 0.5],
              [-0.2, 0.9, 0.45, 0.35, 0.3],
            ] as const
          ).map(([bx, bz, w, h, d], i) => (
            <Box key={i} pos={[bx, h / 2, bz]} size={[w, h, d]} color={['#6b7a4a', '#8a7a52', '#59663f', '#7a6a45'][i]} />
          ))}
        </>
      );
      break;
    default:
      return null;
  }

  return (
    <group position={[x, y, z]} rotation={[0, place.style === 'field' ? 0.3 : rot, 0]}>
      {body}
    </group>
  );
}

/** Little buildings for every named place that has no dedicated landmark model. */
export function Pois({ dark }: { dark: boolean }) {
  return (
    <group>
      {places
        .filter((p) => p.style !== 'landmark')
        .map((p) => (
          <PoiBuilding key={p.id} place={p} dark={dark} />
        ))}
    </group>
  );
}


/* ───────────────────────── landmarks ───────────────────────── */

function Cypress({ x, z, s = 1 }: { x: number; z: number; s?: number }) {
  const y = terrainHeight(x, z);
  return (
    <mesh position={[x, y + 0.8 * s, z]} scale={[0.34 * s, s, 0.34 * s]} castShadow>
      <coneGeometry args={[1, 1.9, 6]} />
      <meshStandardMaterial color="#1c5a35" flatShading />
    </mesh>
  );
}

export function Church() {
  const { x, z } = ZONES.church;
  const y = terrainHeight(x, z);
  return (
    <group>
      <group position={[x, y, z]} rotation={[0, -0.5, 0]}>
        <Box pos={[0, 0.4, 0]} size={[1.0, 0.8, 1.5]} color="#fffaf0" />
        <Roof w={1.3} d={1.9} h={0.55} y={0.8} color="#9b3b2f" />
        <Box pos={[0, 0.8, 0.85]} size={[0.5, 1.6, 0.5]} color="#fffaf0" />
        <mesh position={[0, 1.9, 0.85]} rotation={[0, Math.PI / 4, 0]} scale={[0.5, 0.6, 0.5]} castShadow>
          <coneGeometry args={[1, 1, 4]} />
          <meshStandardMaterial color="#9b3b2f" flatShading />
        </mesh>
        <Box pos={[0, 2.35, 0.85]} size={[0.05, 0.3, 0.05]} color="#3a3a3a" />
        <Box pos={[0, 2.4, 0.85]} size={[0.2, 0.05, 0.05]} color="#3a3a3a" />
        <Box pos={[0, 0.25, -0.76]} size={[0.28, 0.5, 0.03]} color="#6b4423" />
      </group>
      <Cypress x={x - 1.5} z={z + 0.4} s={1.1} />
      <Cypress x={x - 1.3} z={z - 0.9} s={0.9} />
      <Cypress x={x + 1.6} z={z - 0.5} s={1.2} />
      <Cypress x={x + 1.3} z={z + 1.1} s={0.85} />
    </group>
  );
}

function usePitchTexture() {
  return useMemo(() => {
    const c = document.createElement('canvas');
    c.width = 1024;
    c.height = 640;
    const g = c.getContext('2d')!;
    for (let i = 0; i < 10; i++) {
      g.fillStyle = i % 2 ? '#3f9f4a' : '#48ad53';
      g.fillRect((i * c.width) / 10, 0, c.width / 10 + 1, c.height);
    }
    g.strokeStyle = 'rgba(255,255,255,.92)';
    g.lineWidth = 7;
    g.strokeRect(24, 24, c.width - 48, c.height - 48);
    g.beginPath();
    g.moveTo(c.width / 2, 24);
    g.lineTo(c.width / 2, c.height - 24);
    g.stroke();
    g.beginPath();
    g.arc(c.width / 2, c.height / 2, 78, 0, Math.PI * 2);
    g.stroke();
    g.strokeRect(24, c.height / 2 - 160, 150, 320);
    g.strokeRect(c.width - 174, c.height / 2 - 160, 150, 320);
    g.strokeRect(24, c.height / 2 - 78, 60, 156);
    g.strokeRect(c.width - 84, c.height / 2 - 78, 60, 156);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    return tex;
  }, []);
}

function Goal({ x, y, z, dir }: { x: number; y: number; z: number; dir: 1 | -1 }) {
  return (
    <group position={[x, y, z]}>
      <Box pos={[0, 0.17, -0.34]} size={[0.04, 0.34, 0.04]} color="#fff" />
      <Box pos={[0, 0.17, 0.34]} size={[0.04, 0.34, 0.04]} color="#fff" />
      <Box pos={[0, 0.34, 0]} size={[0.04, 0.04, 0.72]} color="#fff" />
      <mesh position={[dir * 0.12, 0.17, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[0.68, 0.32]} />
        <meshStandardMaterial color="#fff" transparent opacity={0.25} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

export function Stadium({ dark }: { dark: boolean }) {
  const x = ZONES.stadium.x + 0.9;
  const z = ZONES.stadium.z;
  const y = terrainHeight(x, z) + 0.035;
  const tex = usePitchTexture();
  const L = 4.2;
  const W = 2.7;
  const lamp = dark ? 2.6 : 0;
  return (
    <group>
      <mesh position={[x, y, z]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[L, W]} />
        <meshStandardMaterial map={tex} roughness={1} />
      </mesh>
      <Goal x={x - L / 2 + 0.05} y={y} z={z} dir={-1} />
      <Goal x={x + L / 2 - 0.05} y={y} z={z} dir={1} />
      {/* stand along the north side */}
      <Box pos={[x, y + 0.18, z - W / 2 - 0.45]} size={[3.4, 0.36, 0.6]} color="#5a6a64" />
      <Box pos={[x, y + 0.42, z - W / 2 - 0.6]} size={[3.4, 0.2, 0.4]} color="#6b7b74" />
      <Box pos={[x, y + 0.9, z - W / 2 - 0.7]} size={[3.6, 0.07, 0.8]} color="#c0392b" />
      {Array.from({ length: 9 }).map((_, i) => (
        <Box key={i} pos={[x - 1.45 + i * 0.36, y + 0.42, z - W / 2 - 0.3]} size={[0.14, 0.1, 0.1]} color={['#e0392f', '#f7be2e', '#fff'][i % 3]} />
      ))}
      {/* floodlights */}
      {(
        [
          [-L / 2 - 0.35, -W / 2 - 0.35],
          [L / 2 + 0.35, -W / 2 - 0.35],
          [-L / 2 - 0.35, W / 2 + 0.35],
          [L / 2 + 0.35, W / 2 + 0.35],
        ] as const
      ).map(([dx, dz], i) => (
        <group key={i} position={[x + dx, y, z + dz]}>
          <mesh position={[0, 1.0, 0]} castShadow>
            <cylinderGeometry args={[0.035, 0.05, 2.0, 6]} />
            <meshStandardMaterial color="#555" />
          </mesh>
          <Box pos={[0, 2.05, 0]} size={[0.5, 0.18, 0.12]} color="#e8e8e8" emissive="#fff3b0" emissiveIntensity={lamp} />
          {dark && (
            <mesh position={[0, 2.05, 0]}>
              <sphereGeometry args={[0.55, 12, 12]} />
              <meshBasicMaterial color="#fff3b0" transparent opacity={0.14} depthWrite={false} />
            </mesh>
          )}
        </group>
      ))}
    </group>
  );
}

export function Lookout({ dark }: { dark: boolean }) {
  const { x, z } = ZONES.lookout;
  const y = terrainHeight(x, z);
  return (
    <group position={[x, y, z]} rotation={[0, 0.6, 0]}>
      {[
        [-0.4, -0.4],
        [0.4, -0.4],
        [-0.4, 0.4],
        [0.4, 0.4],
      ].map(([lx, lz], i) => (
        <mesh key={i} position={[lx, 0.9, lz]} castShadow>
          <cylinderGeometry args={[0.05, 0.06, 1.8, 6]} />
          <meshStandardMaterial color="#7a4f2a" flatShading />
        </mesh>
      ))}
      <Box pos={[0, 1.8, 0]} size={[1.1, 0.07, 1.1]} color="#8c5a2e" />
      {[
        [0, 0.52, 1.1, 0.04],
        [0, -0.52, 1.1, 0.04],
      ].map(([, rz, w], i) => (
        <Box key={i} pos={[0, 2.05, rz]} size={[w, 0.05, 0.05]} color="#6b4423" />
      ))}
      <Box pos={[-0.52, 2.05, 0]} size={[0.05, 0.05, 1.1]} color="#6b4423" />
      <Box pos={[0.52, 2.05, 0]} size={[0.05, 0.05, 1.1]} color="#6b4423" />
      <mesh position={[0, 2.75, 0]} rotation={[0, Math.PI / 4, 0]} scale={[0.95, 0.5, 0.95]} castShadow>
        <coneGeometry args={[1, 1, 4]} />
        <meshStandardMaterial color="#9b3b2f" flatShading />
      </mesh>
      {[
        [-0.45, -0.45],
        [0.45, 0.45],
      ].map(([px, pz], i) => (
        <Box key={i} pos={[px, 2.35, pz]} size={[0.04, 0.7, 0.04]} color="#6b4423" />
      ))}
      <Box pos={[0, 2.2, 0]} size={[0.08, 0.08, 0.08]} color="#ffd27a" emissive="#ffb43a" emissiveIntensity={dark ? 3 : 0} />
    </group>
  );
}

export function Stream() {
  const rocks = useMemo(() => {
    const rnd = mulberry32(21);
    return Array.from({ length: 18 }).map(() => {
      const rx = -18 + rnd() * 36;
      const side = rnd() < 0.5 ? -1 : 1;
      const rz = riverZ(rx) + side * (1.2 + rnd() * 0.8);
      return { x: rx, z: rz, s: 0.12 + rnd() * 0.16, y: Math.max(terrainHeight(rx, rz), WATER_LEVEL) };
    });
  }, []);

  // Ognjenov most: a stone bridge where the main road crosses the stream.
  const bridge = useMemo(() => {
    const [bx, bz] = SCENE.most;
    const near = nearestRoad(bx, bz);
    // direction of the road at the crossing = direction across the stream
    

    let angle = Math.PI / 2;
    for (let i = 0; i < ROAD.length - 1; i++) {
      const [ax, az] = ROAD[i];
      const [cx, cz] = ROAD[i + 1];
      if (Math.hypot(ax - near.x, az - near.z) < 0.8) {
        angle = Math.atan2(cz - az, cx - ax);
        break;
      }
    }
    const half = 2.9;
    const tx = Math.cos(angle);
    const tz = Math.sin(angle);
    const y0 = terrainHeight(bx - tx * half, bz - tz * half);
    const y1 = terrainHeight(bx + tx * half, bz + tz * half);
    return { x: bx, z: bz, angle, half, y: Math.max((y0 + y1) / 2 + 0.12, 0.9) };
  }, []);

  return (
    <group>
      {rocks.map((r, i) => (
        <mesh key={i} position={[r.x, r.y + r.s * 0.3, r.z]} scale={[1.2, 0.8, 1]} castShadow>
          <dodecahedronGeometry args={[r.s, 0]} />
          <meshStandardMaterial color="#9a978c" flatShading />
        </mesh>
      ))}
      <group position={[bridge.x, 0, bridge.z]} rotation={[0, -bridge.angle, 0]}>
        <Box pos={[0, bridge.y, 0]} size={[bridge.half * 2, 0.14, 0.7]} color="#b0aa9c" />
        <Box pos={[0, bridge.y + 0.18, 0.32]} size={[bridge.half * 2, 0.2, 0.08]} color="#9e988a" />
        <Box pos={[0, bridge.y + 0.18, -0.32]} size={[bridge.half * 2, 0.2, 0.08]} color="#9e988a" />
        {[-bridge.half + 0.3, bridge.half - 0.3].map((px) => (
          <Box key={px} pos={[px, bridge.y / 2 - 0.05, 0]} size={[0.55, bridge.y + 0.1, 0.7]} color="#8f897c" />
        ))}
      </group>
    </group>
  );
}

/* ───────────────────────── Tršić ───────────────────────── */

/** Vuk Karadžić's birthplace: a log house with a steep shingled roof, a monument and a small plaza. */
export function Trsic() {
  const [x, z] = TRSIC;
  const y = terrainHeight(x, z);
  const log = '#8a6240';
  return (
    <group position={[x, y, z]} rotation={[0, Math.atan2(-1.2, -0.5), 0]}>
      {/* plaza */}
      <mesh position={[0, 0.03, 0.9]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[1.25, 20]} />
        <meshStandardMaterial color="#d9cfb2" roughness={1} />
      </mesh>
      {/* log house */}
      <Box pos={[-0.4, 0.32, -0.5]} size={[1.5, 0.64, 0.95]} color={log} />
      {[0.12, 0.28, 0.44, 0.6].map((ly) => (
        <Box key={ly} pos={[-0.4, ly, -0.03]} size={[1.52, 0.025, 0.02]} color="#6c4a2d" />
      ))}
      <mesh position={[-0.4, 1.0, -0.5]} rotation={[0, Math.PI / 2, 0]} scale={[0.98, 0.72, 1.0]} castShadow>
        <coneGeometry args={[0.95, 1, 4]} />
        <meshStandardMaterial color="#5b3d24" flatShading />
      </mesh>
      <Box pos={[-0.4, 0.26, -0.015]} size={[0.26, 0.5, 0.03]} color="#4a2f17" />
      <Box pos={[0.15, 0.4, -0.015]} size={[0.2, 0.18, 0.03]} color="#9ec8e8" />
      <Box pos={[-0.95, 1.05, -0.5]} size={[0.14, 0.4, 0.14]} color="#7a7570" />
      {/* outbuilding */}
      <Box pos={[1.25, 0.2, -0.75]} size={[0.7, 0.4, 0.6]} color="#7d5a38" />
      <mesh position={[1.25, 0.57, -0.75]} rotation={[0, Math.PI / 4, 0]} scale={[0.55, 0.35, 0.5]} castShadow>
        <coneGeometry args={[1, 1, 4]} />
        <meshStandardMaterial color="#5b3d24" flatShading />
      </mesh>
      {/* monument */}
      <Box pos={[0.5, 0.18, 1.0]} size={[0.4, 0.36, 0.4]} color="#b9b5ac" />
      <mesh position={[0.5, 0.64, 1.0]} castShadow>
        <cylinderGeometry args={[0.08, 0.13, 0.55, 8]} />
        <meshStandardMaterial color="#8f8c85" flatShading />
      </mesh>
      <mesh position={[0.5, 1.02, 1.0]} castShadow>
        <icosahedronGeometry args={[0.11, 0]} />
        <meshStandardMaterial color="#8f8c85" flatShading />
      </mesh>
      {/* fence along the front */}
      {Array.from({ length: 7 }).map((_, i) => (
        <Box key={i} pos={[-1.5 + i * 0.5, 0.12, 0.28]} size={[0.05, 0.24, 0.05]} color="#6b4423" />
      ))}
      <Box pos={[0, 0.2, 0.28]} size={[3.1, 0.04, 0.03]} color="#6b4423" />
      {/* flag */}
      <mesh position={[-1.6, 0.9, 0.9]} castShadow>
        <cylinderGeometry args={[0.025, 0.025, 1.8, 6]} />
        <meshStandardMaterial color="#8a8a8a" />
      </mesh>
      {(['#d6322a', '#2a4fa8', '#ffffff'] as const).map((c, i) => (
        <mesh key={c} position={[-1.6 + 0.23, 1.68 - i * 0.12, 0.9]}>
          <boxGeometry args={[0.46, 0.12, 0.02]} />
          <meshStandardMaterial color={c} />
        </mesh>
      ))}
    </group>
  );
}

/* ───────────────────────── sky decorations ───────────────────────── */

export function Clouds({ dark }: { dark: boolean }) {
  const refs = useRef<(THREE.Group | null)[]>([]);
  const clouds = useMemo(
    () => [
      { y: 13.5, z: -14, x: -14, speed: 0.35, s: 1.2 },
      { y: 14.5, z: 11, x: 4, speed: 0.25, s: 1.6 },
      { y: 13, z: 16, x: 20, speed: 0.3, s: 1 },
    ],
    [],
  );
  useFrame((_, dt) => {
    clouds.forEach((c, i) => {
      const g = refs.current[i];
      if (!g) return;
      c.x += c.speed * dt;
      if (c.x > 30) c.x = -30;
      g.position.x = c.x;
    });
  });
  return (
    <group>
      {clouds.map((c, i) => (
        <group key={i} ref={(el) => void (refs.current[i] = el)} position={[c.x, c.y, c.z]} scale={c.s}>
          {(
            [
              [0, 0, 0, 1.1],
              [1.1, -0.15, 0.1, 0.8],
              [-1.1, -0.2, -0.1, 0.75],
              [0.4, 0.45, 0, 0.7],
            ] as const
          ).map(([x, y, z, r], k) => (
            <mesh key={k} position={[x, y, z]} castShadow>
              <icosahedronGeometry args={[r, 1]} />
              <meshStandardMaterial color={dark ? '#7f8fbd' : '#ffffff'} flatShading roughness={1} transparent opacity={dark ? 0.7 : 0.95} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}
