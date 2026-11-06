import { useCursor } from '@react-three/drei';
import { useFrame, useThree, type ThreeEvent } from '@react-three/fiber';
import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { KIND_META, places, type Place } from '../../data/places';
import { terrainHeight } from './world';

/** Height of the pin above the ground. */
const LIFT = 1.7;
const LABEL_PX = 30;

export const placeGroundY = (p: Place) => Math.max(terrainHeight(p.position[0], p.position[1]), 0.15);

type LabelTone = 'pin' | 'sign' | 'street';

/** Draws a pill label ("🌳 Name") to a canvas texture — plain three.js, no extra DOM or React roots. */
function makeLabel(emoji: string, text: string, hot: boolean, tone: LabelTone = 'pin') {
  const k = 2;
  const h = 56 * k;
  const font = `800 ${24 * k}px Manrope, system-ui, sans-serif`;
  const c = document.createElement('canvas');
  const g = c.getContext('2d')!;
  g.font = font;
  const label = `${emoji}  ${text}`;
  const w = Math.ceil(g.measureText(label).width + 46 * k);
  c.width = w;
  c.height = h;
  g.font = font;
  g.textBaseline = 'middle';
  const r = h / 2 - 3;
  g.beginPath();
  g.roundRect(3, 3, w - 6, h - 6, r);
  const bg = hot ? '#ffffff' : tone === 'sign' ? '#f7be2e' : tone === 'street' ? 'rgba(46,52,60,0.92)' : 'rgba(8,33,15,0.88)';
  g.fillStyle = bg;
  g.fill();
  g.lineWidth = hot ? 6 : 3;
  g.strokeStyle = hot ? '#f7be2e' : tone === 'sign' ? '#08210f' : 'rgba(255,255,255,0.35)';
  g.stroke();
  g.fillStyle = hot || tone === 'sign' ? '#08210f' : '#ffffff';
  g.fillText(label, 23 * k, h / 2 + 2);
  const texture = new THREE.CanvasTexture(c);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return { texture, aspect: w / h };
}

interface SpriteLabelProps {
  position: [number, number, number];
  emoji: string;
  text: string;
  hot?: boolean;
  /** On-screen height in CSS pixels. */
  px?: number;
  tone?: LabelTone;
}

/** Constant-screen-size text label placed in the 3D world. */
export function SpriteLabel({ position, emoji, text, hot = false, px = LABEL_PX, tone = 'pin' }: SpriteLabelProps) {
  const size = useThree((s) => s.size);
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const [fontsReady, setFontsReady] = useState(false);
  useEffect(() => {
    let alive = true;
    document.fonts?.ready.then(() => alive && setFontsReady(true));
    return () => {
      alive = false;
    };
  }, []);

  const labels = useMemo(
    () => {
      void fontsReady; // re-draw once the web font has loaded
      return { normal: makeLabel(emoji, text, false, tone), hot: makeLabel(emoji, text, true, tone) };
    },
    [emoji, text, tone, fontsReady],
  );
  useEffect(() => () => {
    labels.normal.texture.dispose();
    labels.hot.texture.dispose();
  }, [labels]);

  const current = hot ? labels.hot : labels.normal;
  // sizeAttenuation=false sprites keep a constant on-screen size, whatever the camera distance.
  const sy = ((px * (hot ? 1.12 : 1)) / size.height) * 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));

  return (
    <sprite position={position} scale={[sy * current.aspect, sy, 1]} renderOrder={10} raycast={() => null}>
      <spriteMaterial map={current.texture} sizeAttenuation={false} depthTest={false} transparent toneMapped={false} />
    </sprite>
  );
}

function Label({ name, kind, hot }: { name: string; kind: Place['kind']; hot: boolean }) {
  return <SpriteLabel position={[0, LIFT + 1.05, 0]} emoji={KIND_META[kind].emoji} text={name} hot={hot} />;
}

interface MarkerProps {
  place: Place;
  name: string;
  active: boolean;
  onSelect: (id: string) => void;
}

function Marker({ place, name, active, onSelect }: MarkerProps) {
  const [x, z] = place.position;
  const y = placeGroundY(place);
  const meta = KIND_META[place.kind];

  const bob = useRef<THREE.Group>(null);
  const ring = useRef<THREE.Mesh>(null);
  const [hover, setHover] = useState(false);
  useCursor(hover);
  const phase = useMemo(() => x * 0.7 + z * 0.3, [x, z]);

  useFrame(({ clock }, dt) => {
    const t = clock.elapsedTime;
    const g = bob.current;
    if (g) {
      g.position.y = LIFT + Math.sin(t * 2 + phase) * 0.14;
      g.rotation.y = t * 0.8;
      const target = active ? 1.5 : hover ? 1.3 : place.featured ? 1 : 0.7;
      g.scale.setScalar(THREE.MathUtils.damp(g.scale.x, target, 9, dt));
    }
    const r = ring.current;
    if (r) {
      const k = (t * 0.7 + phase) % 1;
      r.scale.setScalar(1 + k * 2.2);
      (r.material as THREE.MeshBasicMaterial).opacity = (active ? 0.8 : 0.45) * (1 - k);
    }
  });

  const click = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (e.delta > 6) return; // it was a drag, not a click
    onSelect(place.id);
  };

  return (
    <group
      position={[x, y, z]}
      onClick={click}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHover(true);
      }}
      onPointerOut={() => setHover(false)}
    >
      <mesh ref={ring} position={[0, 0.07, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.38, 0.5, 40]} />
        <meshBasicMaterial color={meta.color} transparent depthWrite={false} side={THREE.DoubleSide} />
      </mesh>

      {/* stem so the pin visibly belongs to the ground */}
      <mesh position={[0, LIFT / 2 - 0.2, 0]}>
        <cylinderGeometry args={[0.015, 0.015, LIFT - 0.4, 6]} />
        <meshBasicMaterial color={meta.color} transparent opacity={0.4} />
      </mesh>

      <group ref={bob} position={[0, LIFT, 0]}>
        {/* invisible, generously sized hit target — easy to tap on phones */}
        <mesh>
          <sphereGeometry args={[0.95, 12, 12]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
        <mesh position={[0, -0.5, 0]} rotation={[Math.PI, 0, 0]} castShadow>
          <coneGeometry args={[0.3, 0.75, 20]} />
          <meshStandardMaterial color={meta.color} roughness={0.4} />
        </mesh>
        <mesh castShadow>
          <sphereGeometry args={[0.42, 24, 24]} />
          <meshStandardMaterial color={meta.color} roughness={0.35} emissive={meta.color} emissiveIntensity={active || hover ? 0.55 : 0.2} />
        </mesh>
        <mesh position={[0, 0, 0.3]}>
          <sphereGeometry args={[0.16, 16, 16]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      </group>

      {(place.featured || active || hover) && <Label name={name} kind={place.kind} hot={active || hover} />}
    </group>
  );
}

export default function Markers({ activeId, onSelect, names }: { activeId: string | null; onSelect: (id: string) => void; names: Record<string, string> }) {
  return (
    <group>
      {places.map((p) => (
        <Marker key={p.id} place={p} name={names[p.id] ?? p.id} active={p.id === activeId} onSelect={onSelect} />
      ))}
    </group>
  );
}
