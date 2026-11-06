import { useMemo } from 'react';
import * as THREE from 'three';
import { RIM_HEIGHT, WATER_LEVEL, WORLD_RADIUS, ZONES, mulberry32, nearestRoad, smoothstep, terrainHeight } from './world';

const SEG = 120;

const C = {
  sand: new THREE.Color('#e6d5a2'),
  low: new THREE.Color('#9ad06e'),
  mid: new THREE.Color('#59a84c'),
  high: new THREE.Color('#2f7d45'),
  peak: new THREE.Color('#b9ae6c'),
  rock: new THREE.Color('#8d8b7c'),
  orchardA: new THREE.Color('#b4dc6e'),
  orchardB: new THREE.Color('#8fc95a'),
  path: new THREE.Color('#d4c08f'),
  pitch: new THREE.Color('#58b455'),
};

function buildTerrainGeometry() {
  const size = WORLD_RADIUS * 2 + 2;
  const geo = new THREE.PlaneGeometry(size, size, SEG, SEG);
  geo.rotateX(-Math.PI / 2);
  const pos = geo.attributes.position as THREE.BufferAttribute;
  const cell = size / SEG;
  const rnd = mulberry32(7);

  for (let i = 0; i < pos.count; i++) {
    let x = pos.getX(i) + (rnd() - 0.5) * cell * 0.75;
    let z = pos.getZ(i) + (rnd() - 0.5) * cell * 0.75;
    const r = Math.hypot(x, z);
    if (r > WORLD_RADIUS) {
      x *= WORLD_RADIUS / r;
      z *= WORLD_RADIUS / r;
    }
    pos.setXYZ(i, x, terrainHeight(x, z), z);
  }

  // Non-indexed geometry gives every triangle its own normal and colour → crisp low-poly facets.
  const flat = geo.toNonIndexed();
  flat.computeVertexNormals();

  const p = flat.attributes.position as THREE.BufferAttribute;
  const n = flat.attributes.normal as THREE.BufferAttribute;
  const colors = new Float32Array(p.count * 3);
  const col = new THREE.Color();
  const tmp = new THREE.Color();
  const jr = mulberry32(99);

  for (let i = 0; i < p.count; i += 3) {
    const cx = (p.getX(i) + p.getX(i + 1) + p.getX(i + 2)) / 3;
    const cz = (p.getZ(i) + p.getZ(i + 1) + p.getZ(i + 2)) / 3;
    const h = (p.getY(i) + p.getY(i + 1) + p.getY(i + 2)) / 3;
    const ny = n.getY(i);

    const t = Math.min(1, Math.max(0, (h - 0.5) / 4.4));
    if (t < 0.5) col.copy(C.low).lerp(C.mid, t / 0.5);
    else col.copy(C.mid).lerp(C.high, (t - 0.5) / 0.5);
    col.lerp(C.peak, smoothstep(0.82, 1, t) * 0.8);
    col.lerp(C.rock, smoothstep(0.88, 0.7, ny) * 0.85);
    col.lerp(C.sand, smoothstep(WATER_LEVEL + 0.32, WATER_LEVEL + 0.05, h));

    const dOrchard = Math.hypot(cx - ZONES.orchard.x, cz - ZONES.orchard.z);
    if (dOrchard < ZONES.orchard.r) {
      const stripe = Math.floor(cz * 0.7) % 2 === 0 ? C.orchardA : C.orchardB;
      col.lerp(tmp.copy(stripe), 0.8 * (1 - smoothstep(ZONES.orchard.r * 0.6, ZONES.orchard.r, dOrchard)));
    }
    const dRoad = nearestRoad(cx, cz).d;
    col.lerp(C.path, 0.4 * (1 - smoothstep(0.5, 1.5, dRoad)));
    const dTrsic = Math.hypot(cx - ZONES.trsic.x, cz - ZONES.trsic.z);
    col.lerp(C.path, 0.35 * (1 - smoothstep(ZONES.trsic.r * 0.4, ZONES.trsic.r, dTrsic)));
    const dStadium = Math.hypot(cx - ZONES.stadium.x, cz - ZONES.stadium.z);
    col.lerp(C.pitch, 0.55 * (1 - smoothstep(ZONES.stadium.r * 0.6, ZONES.stadium.r, dStadium)));

    col.offsetHSL(0, 0, (jr() - 0.5) * 0.07);
    for (let k = 0; k < 3; k++) {
      colors[(i + k) * 3] = col.r;
      colors[(i + k) * 3 + 1] = col.g;
      colors[(i + k) * 3 + 2] = col.b;
    }
  }
  flat.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  return flat;
}

export default function Terrain({ dark }: { dark: boolean }) {
  const geometry = useMemo(buildTerrainGeometry, []);
  const soilHeight = RIM_HEIGHT + 0.2;

  return (
    <group>
      <mesh geometry={geometry} receiveShadow castShadow>
        <meshStandardMaterial vertexColors flatShading roughness={1} color={dark ? '#7d90c4' : '#ffffff'} />
      </mesh>

      {/* Diorama "cut" edges */}
      <mesh position={[0, RIM_HEIGHT - soilHeight / 2, 0]} receiveShadow>
        <cylinderGeometry args={[WORLD_RADIUS + 0.02, WORLD_RADIUS - 0.1, soilHeight, 72, 1, true]} />
        <meshStandardMaterial color={dark ? '#4a3a30' : '#7a5232'} flatShading roughness={1} />
      </mesh>
      <mesh position={[0, -0.2 - 1.6, 0]} receiveShadow>
        <cylinderGeometry args={[WORLD_RADIUS - 0.1, WORLD_RADIUS - 1.6, 3.2, 72, 1, true]} />
        <meshStandardMaterial color={dark ? '#4b4f63' : '#8e8a7c'} flatShading roughness={1} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, -3.4, 0]}>
        <circleGeometry args={[WORLD_RADIUS - 1.6, 48]} />
        <meshStandardMaterial color="#2c2a28" side={THREE.DoubleSide} />
      </mesh>

      {/* Water fills every valley below WATER_LEVEL */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, WATER_LEVEL, 0]} receiveShadow>
        <circleGeometry args={[WORLD_RADIUS - 0.05, 80]} />
        <meshStandardMaterial
          color={dark ? '#2a4a92' : '#4fb4ea'}
          transparent
          opacity={0.82}
          roughness={0.15}
          metalness={0.15}
          emissive={dark ? '#14306e' : '#000000'}
          emissiveIntensity={dark ? 0.6 : 0}
        />
      </mesh>
    </group>
  );
}
