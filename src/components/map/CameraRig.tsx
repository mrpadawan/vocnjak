import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three/examples/jsm/controls/OrbitControls.js';
import { placeById } from '../../data/places';
import { placeGroundY } from './Markers';

const HOME_DIR = new THREE.Vector3(23, 19.5, 25).normalize();
const HOME_TARGET = new THREE.Vector3(0, 0.8, 0);

/** Pulls the home camera back on narrow viewports so the whole island fits horizontally. */
export const homeView = (aspect: number) => {
  const distance = THREE.MathUtils.clamp(88 / aspect, 54, 96);
  return {
    position: HOME_DIR.clone().multiplyScalar(distance).add(HOME_TARGET),
    target: HOME_TARGET.clone(),
  };
};

interface Props {
  activeId: string | null;
  /** Bumps whenever the user presses "reset view". */
  resetKey: number;
  /** On phones the info sheet covers the lower half, so the pin is aimed higher on screen. */
  compact: boolean;
}

interface Goal {
  position: THREE.Vector3;
  target: THREE.Vector3;
}

/**
 * Smoothly dollies the camera to a clicked pin (or back home) by damping both the camera and the
 * OrbitControls target. Any manual drag/zoom cancels the animation so the user is never fought.
 */
export default function CameraRig({ activeId, resetKey, compact }: Props) {
  const camera = useThree((s) => s.camera);
  const controls = useThree((s) => s.controls) as OrbitControlsImpl | null;
  const aspect = useThree((s) => s.size.width / s.size.height);
  const goal = useRef<Goal | null>(null);
  const hadSelection = useRef(false);
  const lastReset = useRef(resetKey);
  const userMoved = useRef(false);
  const aspectRef = useRef(aspect);
  aspectRef.current = aspect;

  useEffect(() => {
    if (!controls) return;
    const cancel = () => {
      goal.current = null;
      userMoved.current = true;
    };
    controls.addEventListener('start', cancel);
    return () => controls.removeEventListener('start', cancel);
  }, [controls]);

  // Frame the island for the current aspect ratio (initially, and on resize until the user takes over).
  useEffect(() => {
    if (!controls || userMoved.current || hadSelection.current) return;
    const home = homeView(aspect);
    camera.position.copy(home.position);
    controls.target.copy(home.target);
    controls.update();
  }, [aspect, camera, controls]);

  useEffect(() => {
    if (!controls) return;
    const place = activeId ? placeById(activeId) : null;
    if (place) {
      hadSelection.current = true;
      lastReset.current = resetKey;
      const [x, z] = place.position;
      const y = placeGroundY(place);
      // Keep the current viewing azimuth so the move feels like a dolly, not a teleport.
      const off = camera.position.clone().sub(controls.target);
      const azimuth = Math.atan2(off.x, off.z);
      const polar = 0.95;
      const dist = compact ? 17 : 15;

      // Make room for the info card: lower the aim point on phones (bottom sheet) and push it
      // to the right on desktop (side card) so the pin stays visible beside the card.
      const target = new THREE.Vector3(x, y + 1.2 - (compact ? 3.4 : 0), z);
      if (!compact) target.add(new THREE.Vector3(Math.cos(azimuth), 0, -Math.sin(azimuth)).multiplyScalar(2.8));
      const position = new THREE.Vector3(
        target.x + dist * Math.sin(polar) * Math.sin(azimuth),
        target.y + dist * Math.cos(polar),
        target.z + dist * Math.sin(polar) * Math.cos(azimuth),
      );
      goal.current = { position, target };
    } else if (hadSelection.current || resetKey !== lastReset.current) {
      hadSelection.current = false;
      lastReset.current = resetKey;
      userMoved.current = false;
      goal.current = homeView(aspectRef.current);
    }
  }, [activeId, resetKey, compact, camera, controls]);

  useFrame((_, dt) => {
    const g = goal.current;
    if (!g || !controls) return;
    const k = 1 - Math.exp(-dt * 3.2);
    camera.position.lerp(g.position, k);
    controls.target.lerp(g.target, k);
    controls.update();
    if (camera.position.distanceTo(g.position) < 0.05 && controls.target.distanceTo(g.target) < 0.05) {
      goal.current = null;
    }
  });

  return null;
}
