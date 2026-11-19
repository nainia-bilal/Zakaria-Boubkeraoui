import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface Hero3DCanvasProps {
  currentLang: 'en' | 'fr' | 'ar';
}

export const Hero3DCanvas: React.FC<Hero3DCanvasProps> = ({ currentLang }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const isInteracting = useRef(false);
  const mousePos = useRef({ x: 0, y: 0 });
  const targetRotation = useRef({ x: 0.15, y: -0.35 });
  const currentRotation = useRef({ x: 0.15, y: -0.35 });
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Detect software WebGL as per Three.js skill
    const isSoftwareGl = (() => {
      try {
        const gl = document.createElement('canvas').getContext('webgl2');
        if (!gl) return true;
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
        const gpu = String(gl.getParameter(param));
        gl.getExtension('WEBGL_lose_context')?.loseContext();
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      } catch {
        return true;
      }
    })();

    const width = container.clientWidth || 320;
    const height = container.clientHeight || 230;

    // Scene
    const scene = new THREE.Scene();

    // Camera
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 0, 5.4);

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;

    container.appendChild(renderer.domElement);

    // Master 3D Group
    const cameraRig = new THREE.Group();
    scene.add(cameraRig);

    // -------------------------------------------------------------
    // Procedural 3D Cinema / Mirrorless Camera Construction (12+ parts)
    // -------------------------------------------------------------

    // Materials Palette
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0x18181b, // Dark charcoal matte body
      metalness: 0.35,
      roughness: 0.55,
    });

    const gripMat = new THREE.MeshStandardMaterial({
      color: 0x09090b, // Deep textured rubber grip
      metalness: 0.1,
      roughness: 0.85,
    });

    const metalMat = new THREE.MeshStandardMaterial({
      color: 0xd4d4d8, // Brushed metallic titanium/chrome
      metalness: 0.95,
      roughness: 0.18,
    });

    const redAccentMat = new THREE.MeshStandardMaterial({
      color: 0xdc2626, // Signature Cinema Red Ring & REC button
      metalness: 0.8,
      roughness: 0.25,
      emissive: 0x7f1d1d,
      emissiveIntensity: 0.3,
    });

    const glassMat = new THREE.MeshStandardMaterial({
      color: 0x0c1e33, // Optical camera glass with deep cyan reflection
      metalness: 0.95,
      roughness: 0.05,
    });

    const screenMat = new THREE.MeshStandardMaterial({
      color: 0x0b1320, // Back LCD monitor screen
      metalness: 0.4,
      roughness: 0.2,
      emissive: 0x0284c7,
      emissiveIntensity: 0.15,
    });

    // 1. Camera Body (Main Housing)
    const bodyGeo = new THREE.BoxGeometry(1.6, 1.05, 0.65);
    const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
    cameraRig.add(bodyMesh);

    // 2. Ergonomic Right Grip
    const gripGeo = new THREE.BoxGeometry(0.42, 1.02, 0.45);
    const gripMesh = new THREE.Mesh(gripGeo, gripMat);
    gripMesh.position.set(0.68, -0.01, 0.22);
    cameraRig.add(gripMesh);

    // 3. Top Viewfinder / Pentaprism Pyramid
    const prismGeo = new THREE.CylinderGeometry(0.35, 0.52, 0.32, 4);
    const prismMesh = new THREE.Mesh(prismGeo, bodyMat);
    prismMesh.position.set(-0.1, 0.62, 0.02);
    prismMesh.rotation.y = Math.PI / 4;
    cameraRig.add(prismMesh);

    // 4. Hotshoe Mount (Flash/Mic connector)
    const hotshoeGeo = new THREE.BoxGeometry(0.24, 0.06, 0.26);
    const hotshoeMesh = new THREE.Mesh(hotshoeGeo, metalMat);
    hotshoeMesh.position.set(-0.1, 0.8, 0.02);
    cameraRig.add(hotshoeMesh);

    // 5. Cinema Lens Assembly (Multi-stage Cylinder)
    // Base mount ring (Silver metal)
    const lensMountGeo = new THREE.CylinderGeometry(0.55, 0.55, 0.14, 32);
    const lensMountMesh = new THREE.Mesh(lensMountGeo, metalMat);
    lensMountMesh.position.set(-0.1, 0, 0.38);
    lensMountMesh.rotation.x = Math.PI / 2;
    cameraRig.add(lensMountMesh);

    // Main Lens Barrel
    const lensBarrelGeo = new THREE.CylinderGeometry(0.52, 0.52, 0.55, 32);
    const lensBarrelMesh = new THREE.Mesh(lensBarrelGeo, bodyMat);
    lensBarrelMesh.position.set(-0.1, 0, 0.7);
    lensBarrelMesh.rotation.x = Math.PI / 2;
    cameraRig.add(lensBarrelMesh);

    // Focus & Zoom Knurled Ring (Ribbed)
    const focusRingGeo = new THREE.CylinderGeometry(0.54, 0.54, 0.2, 32);
    const focusRingMesh = new THREE.Mesh(focusRingGeo, gripMat);
    focusRingMesh.position.set(-0.1, 0, 0.65);
    focusRingMesh.rotation.x = Math.PI / 2;
    cameraRig.add(focusRingMesh);

    // Signature Cinema Red Ring (Leica / Cinema Prime Accent)
    const redRingGeo = new THREE.TorusGeometry(0.525, 0.025, 16, 48);
    const redRingMesh = new THREE.Mesh(redRingGeo, redAccentMat);
    redRingMesh.position.set(-0.1, 0, 0.98);
    cameraRig.add(redRingMesh);

    // Front Outer Bezel / Lens Hood Rim
    const hoodGeo = new THREE.CylinderGeometry(0.54, 0.51, 0.16, 32);
    const hoodMesh = new THREE.Mesh(hoodGeo, bodyMat);
    hoodMesh.position.set(-0.1, 0, 1.05);
    hoodMesh.rotation.x = Math.PI / 2;
    cameraRig.add(hoodMesh);

    // Front Lens Glass Optical Element
    const glassGeo = new THREE.CircleGeometry(0.46, 32);
    const glassMesh = new THREE.Mesh(glassGeo, glassMat);
    glassMesh.position.set(-0.1, 0, 1.12);
    cameraRig.add(glassMesh);

    // 6. Top Dials & Shutter Button
    // Mode Dial (Left)
    const modeDialGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.12, 24);
    const modeDialMesh = new THREE.Mesh(modeDialGeo, metalMat);
    modeDialMesh.position.set(-0.62, 0.57, -0.05);
    cameraRig.add(modeDialMesh);

    // Control Dial (Right)
    const dial2Geo = new THREE.CylinderGeometry(0.18, 0.18, 0.12, 24);
    const dial2Mesh = new THREE.Mesh(dial2Geo, metalMat);
    dial2Mesh.position.set(0.38, 0.57, -0.05);
    cameraRig.add(dial2Mesh);

    // Shutter Release Button with Red REC Dot
    const shutterCollarGeo = new THREE.CylinderGeometry(0.13, 0.13, 0.08, 20);
    const shutterCollarMesh = new THREE.Mesh(shutterCollarGeo, metalMat);
    shutterCollarMesh.position.set(0.68, 0.55, 0.22);
    cameraRig.add(shutterCollarMesh);

    const shutterBtnGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.05, 20);
    const shutterBtnMesh = new THREE.Mesh(shutterBtnGeo, redAccentMat);
    shutterBtnMesh.position.set(0.68, 0.6, 0.22);
    cameraRig.add(shutterBtnMesh);

    // 7. Back LCD Screen Display
    const lcdGeo = new THREE.BoxGeometry(1.05, 0.72, 0.04);
    const lcdMesh = new THREE.Mesh(lcdGeo, screenMat);
    lcdMesh.position.set(-0.15, -0.04, -0.34);
    cameraRig.add(lcdMesh);

    // Viewfinder Eyepiece (Back)
    const eyepieceGeo = new THREE.BoxGeometry(0.32, 0.22, 0.12);
    const eyepieceMesh = new THREE.Mesh(eyepieceGeo, gripMat);
    eyepieceMesh.position.set(-0.1, 0.55, -0.36);
    cameraRig.add(eyepieceMesh);

    // 9. Studio Lighting Setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 3.2);
    keyLight.position.set(3, 4, 4);
    scene.add(keyLight);

    const redRimLight = new THREE.DirectionalLight(0xdc2626, 4.0);
    redRimLight.position.set(-4, -1, -2);
    scene.add(redRimLight);

    const cyanLensLight = new THREE.DirectionalLight(0x38bdf8, 2.5);
    cyanLensLight.position.set(0, -3, 3);
    scene.add(cyanLensLight);

    // Event handlers for interactive mouse and touch rotation
    const handlePointerMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      mousePos.current = { x, y };

      if (isInteracting.current) {
        targetRotation.current.y = x * 2.2;
        targetRotation.current.x = -y * 1.5;
      } else {
        targetRotation.current.y = x * 0.9 - 0.25;
        targetRotation.current.x = -y * 0.6 + 0.15;
      }
    };

    const handlePointerDown = () => {
      isInteracting.current = true;
    };

    const handlePointerUp = () => {
      isInteracting.current = false;
    };

    container.addEventListener('pointermove', handlePointerMove);
    container.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointerup', handlePointerUp);

    // Resize Observer
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width: w, height: h } = entry.contentRect;
        if (w > 0 && h > 0) {
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
          renderer.setSize(w, h);
        }
      }
    });
    resizeObserver.observe(container);

    // Animation Loop
    let animId = 0;
    const startTime = performance.now();

    const animate = () => {
      const elapsedTime = (performance.now() - startTime) / 1000;

      // Smooth interpolation for rotation (damping)
      const dampFactor = isInteracting.current ? 0.12 : 0.05;
      currentRotation.current.x += (targetRotation.current.x - currentRotation.current.x) * dampFactor;
      currentRotation.current.y += (targetRotation.current.y - currentRotation.current.y) * dampFactor;

      // Base auto-idle hovering & cinematic tilt
      const idleBob = Math.sin(elapsedTime * 1.5) * 0.08;
      const idleRoll = Math.sin(elapsedTime * 0.9) * 0.04;

      cameraRig.rotation.x = currentRotation.current.x + idleRoll;
      cameraRig.rotation.y = currentRotation.current.y + Math.sin(elapsedTime * 0.6) * 0.15;
      cameraRig.position.y = idleBob;

      renderer.render(scene, camera);
      animId = requestAnimationFrame(animate);
    };

    animate();

    // Cleanup
    return () => {
      cancelAnimationFrame(animId);
      resizeObserver.disconnect();
      container.removeEventListener('pointermove', handlePointerMove);
      container.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointerup', handlePointerUp);

      bodyGeo.dispose();
      bodyMat.dispose();
      gripGeo.dispose();
      gripMat.dispose();
      prismGeo.dispose();
      hotshoeGeo.dispose();
      metalMat.dispose();
      lensMountGeo.dispose();
      lensBarrelGeo.dispose();
      focusRingGeo.dispose();
      redRingGeo.dispose();
      redAccentMat.dispose();
      hoodGeo.dispose();
      glassGeo.dispose();
      glassMat.dispose();
      modeDialGeo.dispose();
      dial2Geo.dispose();
      shutterCollarGeo.dispose();
      shutterBtnGeo.dispose();
      lcdGeo.dispose();
      screenMat.dispose();
      eyepieceGeo.dispose();
      renderer.dispose();

      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      className="relative flex flex-col items-center justify-center my-3 sm:my-4 group select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 3D Canvas Viewport */}
      <div
        ref={mountRef}
        className="w-full max-w-[320px] sm:max-w-[440px] h-[210px] sm:h-[260px] cursor-grab active:cursor-grabbing touch-none relative"
        title="3D Cinema Camera — Drag or move to rotate 360°"
      />

      {/* Interactive 3D Camera metadata badge */}
      <div className="flex items-center gap-2 mt-1 px-3 py-1 bg-white/95 border border-black/20 rounded-full text-[10px] sm:text-[11px] font-mono shadow-xs backdrop-blur-xs">
        <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
        <span className="font-bold text-neutral-900 uppercase tracking-wider">
          {currentLang === 'ar' ? 'كاميرا سينمائية 3D' : currentLang === 'fr' ? 'Caméra Cinéma 3D' : '3D Cinema Camera'}
        </span>
        <span className="text-neutral-400">·</span>
        <span className="text-neutral-600 font-semibold">
          {currentLang === 'ar' ? 'حرك للمشاهدة 360°' : 'Drag to Rotate 360°'}
        </span>
      </div>
    </div>
  );
};
