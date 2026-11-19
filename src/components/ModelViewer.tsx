import React, { useEffect, useRef, useImperativeHandle } from 'react';
import * as THREE from 'three';

const FOV = 32;
const DRAG_SPEED = 0.007;
const PITCH_LIMIT = (65 * Math.PI) / 180;

const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

// Soft radial contact shadow texture generated procedurally without external assets
const createRadialShadowTexture = (): THREE.Texture => {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    gradient.addColorStop(0, 'rgba(0, 0, 0, 0.75)');
    gradient.addColorStop(0.3, 'rgba(0, 0, 0, 0.45)');
    gradient.addColorStop(0.65, 'rgba(0, 0, 0, 0.12)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
};

// Detailed 3D Cinema Camera Object
export const createCinemaCameraObject = (): THREE.Group => {
  const cameraGroup = new THREE.Group();

  // Materials Palette
  const bodyMat = new THREE.MeshStandardMaterial({
    color: 0x1c1c1f,
    metalness: 0.45,
    roughness: 0.4,
  });

  const gripMat = new THREE.MeshStandardMaterial({
    color: 0x09090b,
    metalness: 0.15,
    roughness: 0.8,
  });

  const metalMat = new THREE.MeshStandardMaterial({
    color: 0xd4d4d8,
    metalness: 0.95,
    roughness: 0.2,
  });

  const redAccentMat = new THREE.MeshStandardMaterial({
    color: 0xdc2626,
    metalness: 0.8,
    roughness: 0.25,
    emissive: 0x991b1b,
    emissiveIntensity: 0.35,
  });

  const glassMat = new THREE.MeshStandardMaterial({
    color: 0x081528,
    metalness: 0.95,
    roughness: 0.05,
    emissive: 0x0284c7,
    emissiveIntensity: 0.15,
  });

  const screenMat = new THREE.MeshStandardMaterial({
    color: 0x0b1320,
    metalness: 0.3,
    roughness: 0.2,
    emissive: 0x0284c7,
    emissiveIntensity: 0.2,
  });

  // 1. Camera Body (Main Housing)
  const body = new THREE.Mesh(new THREE.BoxGeometry(1.65, 1.05, 0.68), bodyMat);
  cameraGroup.add(body);

  // 2. Ergonomic Right Grip
  const grip = new THREE.Mesh(new THREE.BoxGeometry(0.44, 1.02, 0.48), gripMat);
  grip.position.set(0.7, -0.01, 0.24);
  cameraGroup.add(grip);

  // 3. Top Viewfinder / Pentaprism Pyramid
  const prism = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.54, 0.32, 4), bodyMat);
  prism.position.set(-0.1, 0.63, 0.02);
  prism.rotation.y = Math.PI / 4;
  cameraGroup.add(prism);

  // 4. Hotshoe Mount (Flash/Mic connector)
  const hotshoe = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.06, 0.28), metalMat);
  hotshoe.position.set(-0.1, 0.81, 0.02);
  cameraGroup.add(hotshoe);

  // 5. Cinema Lens Assembly (Multi-stage Cylinder)
  // Base Mount Ring
  const lensMount = new THREE.Mesh(new THREE.CylinderGeometry(0.56, 0.56, 0.14, 32), metalMat);
  lensMount.position.set(-0.1, 0, 0.4);
  lensMount.rotation.x = Math.PI / 2;
  cameraGroup.add(lensMount);

  // Main Barrel
  const lensBarrel = new THREE.Mesh(new THREE.CylinderGeometry(0.52, 0.52, 0.55, 32), bodyMat);
  lensBarrel.position.set(-0.1, 0, 0.72);
  lensBarrel.rotation.x = Math.PI / 2;
  cameraGroup.add(lensBarrel);

  // Knurled Focus Ring
  const focusRing = new THREE.Mesh(new THREE.CylinderGeometry(0.545, 0.545, 0.22, 32), gripMat);
  focusRing.position.set(-0.1, 0, 0.68);
  focusRing.rotation.x = Math.PI / 2;
  cameraGroup.add(focusRing);

  // Signature Cinema Red Accent Ring
  const redRing = new THREE.Mesh(new THREE.TorusGeometry(0.53, 0.026, 16, 48), redAccentMat);
  redRing.position.set(-0.1, 0, 1.0);
  cameraGroup.add(redRing);

  // Front Lens Hood
  const hood = new THREE.Mesh(new THREE.CylinderGeometry(0.545, 0.51, 0.16, 32), bodyMat);
  hood.position.set(-0.1, 0, 1.08);
  hood.rotation.x = Math.PI / 2;
  cameraGroup.add(hood);

  // Front Lens Glass Optical Element
  const glass = new THREE.Mesh(new THREE.CircleGeometry(0.46, 32), glassMat);
  glass.position.set(-0.1, 0, 1.15);
  cameraGroup.add(glass);

  // 6. Top Dials & Shutter Release
  const modeDial = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.12, 24), metalMat);
  modeDial.position.set(-0.62, 0.58, -0.05);
  cameraGroup.add(modeDial);

  const dial2 = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.12, 24), metalMat);
  dial2.position.set(0.38, 0.58, -0.05);
  cameraGroup.add(dial2);

  const shutterCollar = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.08, 20), metalMat);
  shutterCollar.position.set(0.7, 0.56, 0.24);
  cameraGroup.add(shutterCollar);

  const shutterBtn = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.05, 20), redAccentMat);
  shutterBtn.position.set(0.7, 0.61, 0.24);
  cameraGroup.add(shutterBtn);

  // 7. Back LCD Screen Display
  const lcd = new THREE.Mesh(new THREE.BoxGeometry(1.08, 0.74, 0.04), screenMat);
  lcd.position.set(-0.15, -0.04, -0.35);
  cameraGroup.add(lcd);

  // Viewfinder Eyepiece
  const eyepiece = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.22, 0.12), gripMat);
  eyepiece.position.set(-0.1, 0.56, -0.37);
  cameraGroup.add(eyepiece);

  return cameraGroup;
};

export interface ModelViewerProps {
  url?: string;
  width?: number | string;
  height?: number | string;
  environment?: string;
  environmentIntensity?: number;
  exposure?: number;
  autoRotate?: boolean;
  autoRotateSpeed?: number;
  autoRotateDelay?: number;
  dragRotate?: boolean;
  turntable?: boolean;
  zoom?: boolean;
  minZoom?: number;
  maxZoom?: number;
  hoverTilt?: number;
  float?: number;
  shadow?: boolean;
  shadowOpacity?: number;
  intro?: 'rise' | 'spin' | 'fade' | 'none';
  startAngle?: number;
  tilt?: number;
  offsetX?: number;
  offsetY?: number;
  fit?: number;
  resetOnDoubleClick?: boolean;
  className?: string;
  style?: React.CSSProperties;
  onModelLoaded?: () => void;
  ref?: React.Ref<{ capture: (type?: string) => string | null }>;
}

export const ModelViewer: React.FC<ModelViewerProps> = ({
  url = 'camera',
  width = 400,
  height = 400,
  exposure = 1,
  autoRotate = true,
  autoRotateSpeed = 0.4,
  autoRotateDelay = 2,
  dragRotate = true,
  turntable = false,
  zoom = true,
  minZoom = 0.7,
  maxZoom = 2,
  hoverTilt = 0.18,
  float = 0.25,
  shadow = true,
  shadowOpacity = 0.45,
  startAngle = -25,
  tilt = 10,
  offsetX = 0,
  offsetY = 0,
  fit = 0.8,
  resetOnDoubleClick = true,
  className = '',
  style,
  onModelLoaded,
  ref,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);

  useImperativeHandle(
    ref,
    () => ({
      capture: (type = 'image/png') => rendererRef.current?.domElement.toDataURL(type) ?? null,
    }),
    []
  );

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const w = container.clientWidth || 400;
    const h = container.clientHeight || 280;

    // Scene
    const scene = new THREE.Scene();

    // Camera
    const camera = new THREE.PerspectiveCamera(FOV, w / h, 0.1, 100);

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: true,
    });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = exposure * 1.25;

    rendererRef.current = renderer;
    container.appendChild(renderer.domElement);

    // Studio Lighting Setup (100% offline, zero network delay)
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.6);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 3.2);
    keyLight.position.set(4, 6, 5);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xffffff, 1.5);
    fillLight.position.set(-4, 3, 3);
    scene.add(fillLight);

    const rimLightRed = new THREE.DirectionalLight(0xdc2626, 4.0);
    rimLightRed.position.set(-5, -1, -3);
    scene.add(rimLightRed);

    const specularLensCyan = new THREE.DirectionalLight(0x38bdf8, 2.5);
    specularLensCyan.position.set(0, -3, 3);
    scene.add(specularLensCyan);

    const topFill = new THREE.DirectionalLight(0xffffff, 1.4);
    topFill.position.set(0, 5, -4);
    scene.add(topFill);

    // Master Stage Rig
    const placeGroup = new THREE.Group();
    const floatGroup = new THREE.Group();
    const tiltGroup = new THREE.Group();
    const spinGroup = new THREE.Group();
    const modelGroup = new THREE.Group();

    scene.add(placeGroup);
    placeGroup.add(floatGroup);
    floatGroup.add(tiltGroup);
    tiltGroup.add(spinGroup);
    spinGroup.add(modelGroup);

    // Create 3D Camera model
    const cameraMesh = createCinemaCameraObject();
    modelGroup.add(cameraMesh);

    // Measure object bounding box for automatic framing
    const box = new THREE.Box3().setFromObject(cameraMesh);
    const extent = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const scale = 2 / Math.max(extent.x, extent.y, extent.z, 0.0001);
    const radius = (extent.length() / 2) * scale;
    const floor = (extent.y / 2) * scale;

    modelGroup.scale.setScalar(scale);
    modelGroup.position.set(-center.x * scale, -center.y * scale, -center.z * scale);

    // Soft Contact Shadow
    let shadowMesh: THREE.Mesh | null = null;
    if (shadow) {
      const shadowTex = createRadialShadowTexture();
      const shadowGeo = new THREE.PlaneGeometry(radius * 3.8, radius * 3.8);
      const shadowMat = new THREE.MeshBasicMaterial({
        map: shadowTex,
        transparent: true,
        opacity: shadowOpacity,
        depthWrite: false,
      });
      shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
      shadowMesh.rotation.x = -Math.PI / 2;
      shadowMesh.position.set(0, -floor - 0.05, 0);
      placeGroup.add(shadowMesh);
    }

    // Motion State
    const motion = {
      yaw: toRadians(startAngle),
      pitch: toRadians(tilt),
      yawVelocity: 0,
      pitchVelocity: 0,
      zoom: 1,
      zoomGoal: 1,
      tiltX: 0,
      tiltY: 0,
      tiltGoalX: 0,
      tiltGoalY: 0,
      spinSpeed: 0,
      idle: 0,
      dragging: false,
      clock: 0,
      reset: null as { yaw: number; pitch: number } | null,
    };

    onModelLoaded?.();

    // Event Handlers for pointer drag, hover tilt, and inertia
    const pointers = new Map<number, { x: number; y: number; t: number }>();
    let pinchStart = 0;
    let zoomStart = 1;

    const onPointerDown = (e: PointerEvent) => {
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY, t: e.timeStamp });
      if (pointers.size === 2 && zoom) {
        const [a, b] = [...pointers.values()];
        pinchStart = Math.hypot(a.x - b.x, a.y - b.y);
        zoomStart = motion.zoomGoal;
        motion.dragging = false;
      } else if (pointers.size === 1 && dragRotate && (e.pointerType !== 'mouse' || e.button === 0)) {
        motion.dragging = true;
        motion.yawVelocity = 0;
        motion.pitchVelocity = 0;
        container.setPointerCapture?.(e.pointerId);
        container.style.cursor = 'grabbing';
      }
      motion.idle = 0;
    };

    const onPointerMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      if (e.pointerType === 'mouse' || e.pointerType === 'pen') {
        const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        const ny = ((e.clientY - rect.top) / rect.height) * 2 - 1;
        motion.tiltGoalX = ny * hoverTilt * 0.6;
        motion.tiltGoalY = nx * hoverTilt;
      }
      const last = pointers.get(e.pointerId);
      if (last) {
        const dx = e.clientX - last.x;
        const dy = e.clientY - last.y;
        const elapsed = Math.max((e.timeStamp - last.t) / 1000, 1 / 240);
        last.x = e.clientX;
        last.y = e.clientY;
        last.t = e.timeStamp;
        if (pointers.size === 2 && zoom && pinchStart > 0) {
          const [a, b] = [...pointers.values()];
          const dist = Math.hypot(a.x - b.x, a.y - b.y);
          motion.zoomGoal = THREE.MathUtils.clamp((zoomStart * dist) / pinchStart, minZoom, maxZoom);
        } else if (motion.dragging) {
          motion.yaw += dx * DRAG_SPEED;
          motion.yawVelocity = motion.yawVelocity * 0.4 + ((dx * DRAG_SPEED) / elapsed) * 0.6;
          if (!turntable) {
            motion.pitch = THREE.MathUtils.clamp(motion.pitch + dy * DRAG_SPEED, -PITCH_LIMIT, PITCH_LIMIT);
            motion.pitchVelocity = motion.pitchVelocity * 0.4 + ((dy * DRAG_SPEED) / elapsed) * 0.6;
          }
          motion.idle = 0;
        }
      }
    };

    const onPointerUp = (e: PointerEvent) => {
      const last = pointers.get(e.pointerId);
      if (last && e.timeStamp - last.t > 80) {
        motion.yawVelocity = 0;
        motion.pitchVelocity = 0;
      }
      pointers.delete(e.pointerId);
      if (pointers.size < 2) pinchStart = 0;
      if (pointers.size === 0) {
        motion.dragging = false;
        container.style.cursor = dragRotate ? 'grab' : 'default';
      }
    };

    const onPointerLeave = () => {
      motion.tiltGoalX = 0;
      motion.tiltGoalY = 0;
    };

    const onWheel = (e: WheelEvent) => {
      if (!zoom) return;
      e.preventDefault();
      motion.zoomGoal = THREE.MathUtils.clamp(motion.zoomGoal * Math.exp(-e.deltaY * 0.005), minZoom, maxZoom);
      motion.idle = 0;
    };

    const onDblClick = () => {
      if (!resetOnDoubleClick) return;
      const turns = Math.round((motion.yaw - toRadians(startAngle)) / (Math.PI * 2));
      motion.reset = { yaw: toRadians(startAngle) + turns * Math.PI * 2, pitch: toRadians(tilt) };
      motion.zoomGoal = 1;
      motion.yawVelocity = 0;
      motion.pitchVelocity = 0;
      motion.idle = 0;
    };

    container.addEventListener('pointerdown', onPointerDown);
    container.addEventListener('pointermove', onPointerMove);
    container.addEventListener('pointerup', onPointerUp);
    container.addEventListener('pointercancel', onPointerUp);
    container.addEventListener('pointerleave', onPointerLeave);
    container.addEventListener('wheel', onWheel, { passive: false });
    container.addEventListener('dblclick', onDblClick);

    // Resize Observer
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width: curW, height: curH } = entry.contentRect;
        if (curW > 0 && curH > 0) {
          camera.aspect = curW / curH;
          camera.updateProjectionMatrix();
          renderer.setSize(curW, curH);
        }
      }
    });
    resizeObserver.observe(container);

    // Animation Loop
    let animId = 0;
    let lastTime = performance.now();

    const animate = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;
      motion.clock += dt;
      motion.idle += dt;

      if (motion.reset) {
        motion.yaw += (motion.reset.yaw - motion.yaw) * (1 - Math.exp(-dt * 7));
        motion.pitch += (motion.reset.pitch - motion.pitch) * (1 - Math.exp(-dt * 7));
        if (Math.abs(motion.reset.yaw - motion.yaw) < 0.001 && Math.abs(motion.reset.pitch - motion.pitch) < 0.001) {
          motion.reset = null;
        }
      } else if (!motion.dragging) {
        const decay = Math.exp(-dt * 4.5);
        motion.yaw += motion.yawVelocity * dt;
        motion.pitch = THREE.MathUtils.clamp(motion.pitch + motion.pitchVelocity * dt, -PITCH_LIMIT, PITCH_LIMIT);
        motion.yawVelocity *= decay;
        motion.pitchVelocity *= decay;
      }

      // Idle auto-rotation easing back in
      const spinning = autoRotate && !motion.dragging && motion.idle > autoRotateDelay;
      motion.spinSpeed += ((spinning ? autoRotateSpeed : 0) - motion.spinSpeed) * (1 - Math.exp(-dt * 2));
      motion.yaw += motion.spinSpeed * dt;

      // Smooth zoom and tilt
      motion.zoom += (motion.zoomGoal - motion.zoom) * (1 - Math.exp(-dt * 8));
      motion.tiltX += (motion.tiltGoalX - motion.tiltX) * (1 - Math.exp(-dt * 6));
      motion.tiltY += (motion.tiltGoalY - motion.tiltY) * (1 - Math.exp(-dt * 6));

      // Camera distance and projection framing
      const aspect = (container.clientWidth || 400) / Math.max(container.clientHeight || 280, 1);
      const halfView = Math.tan(toRadians(FOV) / 2);
      const fitDistance = radius / (Math.max(fit, 0.05) * halfView * Math.min(1, aspect));
      const distance = fitDistance / motion.zoom;
      camera.position.set(0, 0, distance);
      camera.near = distance / 50;
      camera.far = distance * 50;
      camera.lookAt(0, 0, 0);
      camera.updateProjectionMatrix();

      const halfHeight = fitDistance * halfView;
      placeGroup.position.set(offsetX * halfHeight * aspect, offsetY * halfHeight, 0);

      // Gentle floating bob
      const bob = Math.sin(motion.clock * 1.4) * float * 0.08;
      floatGroup.position.y = bob;

      tiltGroup.rotation.set(motion.tiltX, motion.tiltY, 0);
      spinGroup.rotation.set(motion.pitch, motion.yaw, 0, 'YXZ');

      renderer.render(scene, camera);
      animId = requestAnimationFrame(animate);
    };

    animId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animId);
      resizeObserver.disconnect();
      container.removeEventListener('pointerdown', onPointerDown);
      container.removeEventListener('pointermove', onPointerMove);
      container.removeEventListener('pointerup', onPointerUp);
      container.removeEventListener('pointercancel', onPointerUp);
      container.removeEventListener('pointerleave', onPointerLeave);
      container.removeEventListener('wheel', onWheel);
      container.removeEventListener('dblclick', onDblClick);

      renderer.dispose();
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [
    url,
    autoRotate,
    autoRotateSpeed,
    autoRotateDelay,
    dragRotate,
    turntable,
    zoom,
    minZoom,
    maxZoom,
    hoverTilt,
    float,
    shadow,
    shadowOpacity,
    startAngle,
    tilt,
    offsetX,
    offsetY,
    fit,
    resetOnDoubleClick,
    exposure,
    onModelLoaded,
  ]);

  return (
    <div
      ref={mountRef}
      className={className}
      style={{
        position: 'relative',
        width,
        height,
        cursor: dragRotate ? 'grab' : 'default',
        touchAction: 'pan-y',
        ...style,
      }}
    />
  );
};

export default ModelViewer;
