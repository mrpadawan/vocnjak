import { OrbitControls, Stars } from '@react-three/drei';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef, useState, type RefObject } from 'react';
import type { OrbitControls as OrbitControlsImpl } from 'three/examples/jsm/controls/OrbitControls.js';
import CameraRig, { homeView } from './CameraRig';
import Markers from './Markers';
import { Church, Clouds, Forest, Lookout, Pois, Roads, Stadium, Stream, Trsic, Village } from './Props';
import Terrain from './Terrain';

interface Props {
  activeId: string | null;
  onSelect: (id: string) => void;
  resetKey: number;
  dark: boolean;
  /** Pauses rendering when the section is off-screen. */
  running: boolean;
  compact: boolean;
  /** DOM element (compass needle) rotated every frame to keep pointing north. */
  compassRef: RefObject<HTMLElement | null>;
  /** Place names in the current language (the 3D labels are drawn on a canvas, outside React context). */
  names: Record<string, string>;
  trailLabel: string;
}

/** Rotates the DOM compass to match the camera heading — no React state, so no re-renders. */
function CompassSync({ compassRef }: { compassRef: RefObject<HTMLElement | null> }) {
  const camera = useThree((s) => s.camera);
  const controls = useThree((s) => s.controls) as OrbitControlsImpl | null;
  useFrame(() => {
    const el = compassRef.current;
    if (!el || !controls) return;
    // North is −z. With the camera at azimuth θ, north appears rotated clockwise by θ on screen.
    const az = Math.atan2(camera.position.x - controls.target.x, camera.position.z - controls.target.z);
    el.style.transform = `rotate(${az}rad)`;
  });
  return null;
}

export default function VillageScene({ activeId, onSelect, resetKey, dark, running, compact, compassRef, names, trailLabel }: Props) {
  // Slow idle spin that stops the moment the user touches the map or opens a place.
  const [idle, setIdle] = useState(true);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  return (
    <Canvas
      shadows
      dpr={compact ? [1, 1.5] : [1, 1.75]}
      frameloop={running ? 'always' : 'never'}
      camera={{ position: homeView(1.6).position.toArray(), fov: 36, near: 0.1, far: 240 }}
      gl={{ antialias: true, alpha: true }}
      style={{ touchAction: 'none' }}
    >
      {/* lighting changes with the theme: warm sun by day, cool moon by night */}
      <hemisphereLight args={[dark ? '#6f86d6' : '#cfeaff', dark ? '#1c2a3d' : '#6b8a4a', dark ? 0.75 : 1.05]} />
      <directionalLight
        position={dark ? [-14, 22, 10] : [16, 26, 12]}
        intensity={dark ? 1.1 : 2.6}
        color={dark ? '#9db4ff' : '#fff1d0'}
        castShadow
        shadow-mapSize={compact ? [1024, 1024] : [2048, 2048]}
        shadow-camera-left={-26}
        shadow-camera-right={26}
        shadow-camera-top={26}
        shadow-camera-bottom={-26}
        shadow-camera-near={1}
        shadow-camera-far={90}
        shadow-bias={-0.0004}
      />
      {dark && <Stars radius={70} depth={40} count={compact ? 600 : 1200} factor={4} saturation={0} fade speed={0.6} />}

      <Terrain dark={dark} />
      <Roads trailLabel={trailLabel} />
      <Forest />
      <Village dark={dark} />
      <Church />
      <Stadium dark={dark} />
      <Pois dark={dark} />
      <Lookout dark={dark} />
      <Stream />
      <Trsic />
      <Clouds dark={dark} />
      <Markers activeId={activeId} onSelect={onSelect} names={names} />

      <OrbitControls
        makeDefault
        enablePan={false}
        enableDamping
        dampingFactor={0.08}
        minDistance={7}
        maxDistance={110}
        minPolarAngle={0.35}
        maxPolarAngle={1.38}
        autoRotate={idle && !activeId}
        autoRotateSpeed={0.45}
        onStart={() => {
          window.clearTimeout(timer.current);
          setIdle(false);
        }}
        onEnd={() => {
          window.clearTimeout(timer.current);
          timer.current = window.setTimeout(() => setIdle(true), 5000);
        }}
      />
      <CameraRig activeId={activeId} resetKey={resetKey} compact={compact} />
      <CompassSync compassRef={compassRef} />
    </Canvas>
  );
}
