import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { MetricHistoryPoint, CameraPreset, AppSettings } from '../../types';
import { audioSynth } from '../../services/audioSynth';

interface VoiceGuardScene3DProps {
  currentMetrics: MetricHistoryPoint;
  history: MetricHistoryPoint[];
  cameraPreset: CameraPreset;
  onPresetChange: (preset: CameraPreset) => void;
  isChallengeActive: boolean;
  challengeProgress: number; // 0 to 1
  settings: AppSettings;
  onMetricSelect?: (metricKey: string) => void;
}

export const VoiceGuardScene3D: React.FC<VoiceGuardScene3DProps> = ({
  currentMetrics,
  history,
  cameraPreset,
  onPresetChange,
  isChallengeActive,
  challengeProgress,
  settings,
  onMetricSelect,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);

  // References to dynamic 3D meshes
  const riskCoreRef = useRef<THREE.Mesh | null>(null);
  const outerRing1Ref = useRef<THREE.Mesh | null>(null);
  const outerRing2Ref = useRef<THREE.Mesh | null>(null);
  const jitterLineRef = useRef<THREE.Line | null>(null);
  const shimmerParticlesRef = useRef<THREE.Points | null>(null);
  const formantPointsRef = useRef<THREE.Points | null>(null);
  const shockwaveRef = useRef<THREE.Mesh | null>(null);
  const couplingRingsRef = useRef<THREE.Group | null>(null);
  const raycasterRef = useRef(new THREE.Raycaster());
  const mousePosRef = useRef(new THREE.Vector2());

  const [hoveredInfo, setHoveredInfo] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Camera preset animations
  const targetCameraPos = useRef(new THREE.Vector3(0, 1.8, 11));
  const targetLookAt = useRef(new THREE.Vector3(0, 0, 0));

  // Determine risk color
  const getRiskColor = (score: number) => {
    if (score <= 20) return new THREE.Color(0x00f0ff); // Cyan
    if (score <= 40) return new THREE.Color(0x10b981); // Green
    if (score <= 60) return new THREE.Color(0xfacc15); // Yellow
    if (score <= 80) return new THREE.Color(0xf97316); // Orange
    return new THREE.Color(0xef4444); // Red
  };

  // Update camera preset targets
  useEffect(() => {
    switch (cameraPreset) {
      case 1: // Front view (default)
        targetCameraPos.current.set(0, 1.8, 11);
        targetLookAt.current.set(0, 0, 0);
        break;
      case 2: // Top view (metrics overview)
        targetCameraPos.current.set(0, 14, 0.1);
        targetLookAt.current.set(0, 0, 0);
        break;
      case 3: // Side view (timeline view)
        targetCameraPos.current.set(12, 1, 0);
        targetLookAt.current.set(0, 0, 0);
        break;
      case 4: // Free look (isometric exploration)
        targetCameraPos.current.set(8, 7, 8);
        targetLookAt.current.set(0, 0, 0);
        break;
      case 5: // Call focus (zoomed in)
        targetCameraPos.current.set(0, 0.5, 4.8);
        targetLookAt.current.set(0, 0, 0);
        break;
    }
  }, [cameraPreset]);

  // Initial Scene Setup
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(settings.theme === 'light' ? 0xf1f5f9 : 0x070c14);
    scene.fog = new THREE.FogExp2(settings.theme === 'light' ? 0xf1f5f9 : 0x070c14, 0.035);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 1.8, 11);
    cameraRef.current = camera;

    // Renderer
    const pixelRatio = settings.quality3D === 'high' ? Math.min(window.devicePixelRatio, 2) : settings.quality3D === 'medium' ? 1.5 : 1;
    const renderer = new THREE.WebGLRenderer({ antialias: settings.quality3D !== 'low', alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(pixelRatio);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxDistance = 24;
    controls.minDistance = 2.5;
    controls.target.set(0, 0, 0);
    controlsRef.current = controls;

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x00f0ff, 1.8);
    dirLight1.position.set(5, 10, 7);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xef4444, 1.2);
    dirLight2.position.set(-5, -5, -5);
    scene.add(dirLight2);

    const pointLight = new THREE.PointLight(0x10b981, 2, 15);
    pointLight.position.set(0, 0, 0);
    scene.add(pointLight);

    // --- 1. Grid & Spatial Reference ---
    const gridHelper = new THREE.GridHelper(20, 20, 0x1e293b, 0x0f172a);
    gridHelper.position.y = -2.8;
    scene.add(gridHelper);

    // --- 2. Central Risk Hologram Group ---
    const riskGroup = new THREE.Group();
    riskGroup.name = 'riskGroup';

    // Core sphere (pulsing)
    const coreGeo = new THREE.SphereGeometry(1.0, 32, 32);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0x00f0ff,
      emissive: 0x00a8b8,
      emissiveIntensity: 0.8,
      roughness: 0.2,
      metalness: 0.8,
      wireframe: true,
    });
    const riskCore = new THREE.Mesh(coreGeo, coreMat);
    riskGroup.add(riskCore);
    riskCoreRef.current = riskCore;

    // Inner glowing sphere
    const innerGlowGeo = new THREE.SphereGeometry(0.75, 24, 24);
    const innerGlowMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      transparent: true,
      opacity: 0.4,
    });
    const innerGlow = new THREE.Mesh(innerGlowGeo, innerGlowMat);
    riskGroup.add(innerGlow);

    // Outer Torus Ring 1
    const ring1Geo = new THREE.TorusGeometry(1.8, 0.03, 16, 100);
    const ring1Mat = new THREE.MeshStandardMaterial({
      color: 0x00f0ff,
      emissive: 0x00f0ff,
      emissiveIntensity: 0.5,
      roughness: 0.3,
    });
    const outerRing1 = new THREE.Mesh(ring1Geo, ring1Mat);
    outerRing1.rotation.x = Math.PI / 2.5;
    riskGroup.add(outerRing1);
    outerRing1Ref.current = outerRing1;

    // Outer Torus Ring 2
    const ring2Geo = new THREE.TorusGeometry(2.3, 0.03, 16, 100);
    const ring2Mat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.4,
      roughness: 0.4,
    });
    const outerRing2 = new THREE.Mesh(ring2Geo, ring2Mat);
    outerRing2.rotation.y = Math.PI / 3;
    riskGroup.add(outerRing2);
    outerRing2Ref.current = outerRing2;

    scene.add(riskGroup);

    // --- 3. Jitter 3D Waveform Ribbon ---
    const jitterGeo = new THREE.BufferGeometry();
    const jitterPointsCount = 60;
    const jitterPositions = new Float32Array(jitterPointsCount * 3);
    for (let i = 0; i < jitterPointsCount; i++) {
      const t = (i / jitterPointsCount) * 10 - 5; // -5 to +5 on X
      jitterPositions[i * 3] = t;
      jitterPositions[i * 3 + 1] = -1.8;
      jitterPositions[i * 3 + 2] = 2.0;
    }
    jitterGeo.setAttribute('position', new THREE.BufferAttribute(jitterPositions, 3));
    const jitterMat = new THREE.LineBasicMaterial({
      color: 0x10b981,
      linewidth: 3,
    });
    const jitterLine = new THREE.Line(jitterGeo, jitterMat);
    jitterLine.name = 'jitterLine';
    scene.add(jitterLine);
    jitterLineRef.current = jitterLine;

    // Threshold plane for Jitter (Red threshold >3.5%)
    const threshGeo = new THREE.BufferGeometry();
    threshGeo.setAttribute('position', new THREE.Float32BufferAttribute([
      -5, -1.8 + 1.2, 2.0,
      5, -1.8 + 1.2, 2.0
    ], 3));
    const threshMat = new THREE.LineDashedMaterial({
      color: 0xef4444,
      dashSize: 0.2,
      gapSize: 0.15,
    });
    const threshLine = new THREE.Line(threshGeo, threshMat);
    threshLine.computeLineDistances();
    scene.add(threshLine);

    // --- 4. Shimmer 3D Particle Cloud ---
    const shimmerCount = 500;
    const shimmerGeo = new THREE.BufferGeometry();
    const shimmerPositions = new Float32Array(shimmerCount * 3);
    const shimmerColors = new Float32Array(shimmerCount * 3);

    for (let i = 0; i < shimmerCount; i++) {
      // Cylindrical cloud on the left side
      const radius = 0.5 + Math.random() * 1.8;
      const angle = Math.random() * Math.PI * 2;
      const height = (Math.random() - 0.5) * 4;

      shimmerPositions[i * 3] = -4.5 + radius * Math.cos(angle);
      shimmerPositions[i * 3 + 1] = height;
      shimmerPositions[i * 3 + 2] = radius * Math.sin(angle);

      // Default green/cyan
      shimmerColors[i * 3] = 0.05;
      shimmerColors[i * 3 + 1] = 0.85;
      shimmerColors[i * 3 + 2] = 0.65;
    }
    shimmerGeo.setAttribute('position', new THREE.BufferAttribute(shimmerPositions, 3));
    shimmerGeo.setAttribute('color', new THREE.BufferAttribute(shimmerColors, 3));

    const shimmerMat = new THREE.PointsMaterial({
      size: 0.08,
      vertexColors: true,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
    });
    const shimmerParticles = new THREE.Points(shimmerGeo, shimmerMat);
    shimmerParticles.name = 'shimmerParticles';
    scene.add(shimmerParticles);
    shimmerParticlesRef.current = shimmerParticles;

    // --- 5. Formant 3D Scatter Plot (Right Side) ---
    const formantGroup = new THREE.Group();
    formantGroup.position.set(4.5, 0, 0);

    // Vowel triangle boundary wireframe
    const vowelTriangleGeo = new THREE.BufferGeometry();
    // Points corresponding to /i/, /u/, /a/ in normalized 3D space
    const vI = new THREE.Vector3(-1.2, 1.5, -1.0); // high front /i/
    const vU = new THREE.Vector3(1.2, 1.2, 1.0);   // high back /u/
    const vA = new THREE.Vector3(0, -1.5, 0.2);    // low central /a/
    vowelTriangleGeo.setFromPoints([vI, vU, vA, vI]);

    const vowelTriangleMat = new THREE.LineBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.6,
    });
    const vowelTriangle = new THREE.Line(vowelTriangleGeo, vowelTriangleMat);
    formantGroup.add(vowelTriangle);

    // Vowel label markers (Spheres at vertices)
    [
      { pos: vI, label: '/i/ (300Hz, 2200Hz)', col: 0x38bdf8 },
      { pos: vU, label: '/u/ (350Hz, 800Hz)', col: 0x10b981 },
      { pos: vA, label: '/a/ (750Hz, 1200Hz)', col: 0xf59e0b },
    ].forEach((pt) => {
      const sGeo = new THREE.SphereGeometry(0.12, 16, 16);
      const sMat = new THREE.MeshBasicMaterial({ color: pt.col });
      const sMesh = new THREE.Mesh(sGeo, sMat);
      sMesh.position.copy(pt.pos);
      formantGroup.add(sMesh);
    });

    // Formant history points
    const formantCount = 40;
    const formantGeo = new THREE.BufferGeometry();
    const formantPositions = new Float32Array(formantCount * 3);
    const formantColors = new Float32Array(formantCount * 3);

    for (let i = 0; i < formantCount; i++) {
      formantPositions[i * 3] = (Math.random() - 0.5) * 2;
      formantPositions[i * 3 + 1] = (Math.random() - 0.5) * 2.5;
      formantPositions[i * 3 + 2] = (Math.random() - 0.5) * 2;

      // Color gradient by time
      const hue = i / formantCount;
      const c = new THREE.Color().setHSL(0.5 + hue * 0.4, 0.9, 0.6);
      formantColors[i * 3] = c.r;
      formantColors[i * 3 + 1] = c.g;
      formantColors[i * 3 + 2] = c.b;
    }
    formantGeo.setAttribute('position', new THREE.BufferAttribute(formantPositions, 3));
    formantGeo.setAttribute('color', new THREE.BufferAttribute(formantColors, 3));

    const formantMat = new THREE.PointsMaterial({
      size: 0.15,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
    });
    const formantPoints = new THREE.Points(formantGeo, formantMat);
    formantPoints.name = 'formantPoints';
    formantGroup.add(formantPoints);
    formantPointsRef.current = formantPoints;

    scene.add(formantGroup);

    // --- 6. Breath-Formant Coupling Arcs ---
    const couplingGroup = new THREE.Group();
    for (let b = 0; b < 3; b++) {
      const ringGeo = new THREE.TorusGeometry(3.0 + b * 0.4, 0.015, 12, 64);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0x10b981,
        transparent: true,
        opacity: 0.25 + b * 0.1,
      });
      const rMesh = new THREE.Mesh(ringGeo, ringMat);
      rMesh.rotation.x = Math.PI / 2;
      couplingGroup.add(rMesh);
    }
    scene.add(couplingGroup);
    couplingRingsRef.current = couplingGroup;

    // --- 7. Acoustic Challenge Shockwave ---
    const shockGeo = new THREE.RingGeometry(0.1, 0.3, 64);
    const shockMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0,
    });
    const shockwave = new THREE.Mesh(shockGeo, shockMat);
    shockwave.rotation.x = Math.PI / 2;
    scene.add(shockwave);
    shockwaveRef.current = shockwave;

    // Raycasting / Mouse Interaction
    const handleMouseMove = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mousePosRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mousePosRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      setTooltipPos({ x: event.clientX, y: event.clientY });
    };

    const handleDblClick = () => {
      onPresetChange(1);
    };

    const canvasDom = renderer.domElement;
    canvasDom.addEventListener('mousemove', handleMouseMove);
    canvasDom.addEventListener('dblclick', handleDblClick);

    // Resize Handler
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Animation Loop
    let clock = new THREE.Clock();
    let animId: number;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsedTime = clock.getElapsedTime() * (settings.animationSpeed / 100);

      // Smooth camera transition to target preset
      camera.position.lerp(targetCameraPos.current, 0.05);
      controls.target.lerp(targetLookAt.current, 0.05);
      controls.update();

      // Rotate Risk Rings
      if (outerRing1Ref.current) {
        outerRing1Ref.current.rotation.z += delta * 0.6;
        outerRing1Ref.current.rotation.x += delta * 0.2;
      }
      if (outerRing2Ref.current) {
        outerRing2Ref.current.rotation.y += delta * 0.4;
        outerRing2Ref.current.rotation.z -= delta * 0.3;
      }

      // Pulse Core
      if (riskCoreRef.current) {
        const pulse = 1.0 + Math.sin(elapsedTime * 4.0) * 0.08;
        riskCoreRef.current.scale.set(pulse, pulse, pulse);
      }

      // Shimmer Particle Cloud oscillation
      if (shimmerParticlesRef.current) {
        const posAttr = shimmerParticlesRef.current.geometry.attributes.position as THREE.BufferAttribute;
        const colAttr = shimmerParticlesRef.current.geometry.attributes.color as THREE.BufferAttribute;
        const positions = posAttr.array as Float32Array;
        const colors = colAttr.array as Float32Array;
        const isHighShimmer = currentMetrics.shimmer > 3.5;

        for (let i = 0; i < shimmerCount; i++) {
          const idx = i * 3;
          // Agitation speed
          const speed = isHighShimmer ? 2.5 : 0.8;
          positions[idx + 1] += Math.sin(elapsedTime * speed + i) * 0.008;

          // Color transition
          if (isHighShimmer) {
            colors[idx] = THREE.MathUtils.lerp(colors[idx], 0.95, 0.05);     // Red
            colors[idx + 1] = THREE.MathUtils.lerp(colors[idx + 1], 0.2, 0.05);
            colors[idx + 2] = THREE.MathUtils.lerp(colors[idx + 2], 0.2, 0.05);
          } else {
            colors[idx] = THREE.MathUtils.lerp(colors[idx], 0.05, 0.05);
            colors[idx + 1] = THREE.MathUtils.lerp(colors[idx + 1], 0.85, 0.05); // Green
            colors[idx + 2] = THREE.MathUtils.lerp(colors[idx + 2], 0.65, 0.05);
          }
        }
        posAttr.needsUpdate = true;
        colAttr.needsUpdate = true;
      }

      // Formant Point Animation
      if (formantPointsRef.current) {
        formantPointsRef.current.rotation.y = elapsedTime * 0.15;
      }

      // Breath coupling rings pulse
      if (couplingRingsRef.current) {
        const cScore = currentMetrics.couplingScore;
        const pulseSpeed = 1.5 + cScore * 3.5;
        const s = 1.0 + Math.sin(elapsedTime * pulseSpeed) * (0.04 + cScore * 0.08);
        couplingRingsRef.current.scale.set(s, 1, s);
      }

      // Challenge Shockwave animation
      if (shockwaveRef.current) {
        if (isChallengeActive) {
          const radius = 0.5 + challengeProgress * 7.5;
          shockwaveRef.current.scale.set(radius, radius, 1);
          (shockwaveRef.current.material as THREE.MeshBasicMaterial).opacity = (1 - challengeProgress) * 0.9;
        } else {
          (shockwaveRef.current.material as THREE.MeshBasicMaterial).opacity = 0;
        }
      }

      // Raycasting hover check
      raycasterRef.current.setFromCamera(mousePosRef.current, camera);
      const intersects = raycasterRef.current.intersectObjects(scene.children, true);

      let foundInfo: string | null = null;
      for (const hit of intersects) {
        if (hit.object.name === 'jitterLine') {
          foundInfo = `Jitter Ribbon: Frequency variation ${currentMetrics.jitter.toFixed(2)}%`;
          break;
        } else if (hit.object.name === 'shimmerParticles') {
          foundInfo = `Shimmer Particle Cloud: Amplitude variation ${currentMetrics.shimmer.toFixed(2)} dB (${currentMetrics.shimmer > 3.5 ? 'Dense Alert' : 'Sparse Natural'})`;
          break;
        } else if (hit.object.name === 'formantPoints') {
          foundInfo = `Formant Resonances: F1=${currentMetrics.f1}Hz, F2=${currentMetrics.f2}Hz, F3=${currentMetrics.f3}Hz (${currentMetrics.vowelZone})`;
          break;
        } else if (hit.object.name === 'riskCore' || hit.object.parent?.name === 'riskGroup') {
          foundInfo = `Central Risk Meter: ${currentMetrics.riskScore}% Threat Level (${currentMetrics.riskScore > 60 ? 'HIGH RISK' : currentMetrics.riskScore > 40 ? 'MEDIUM RISK' : 'SAFE'})`;
          break;
        }
      }
      setHoveredInfo(foundInfo);

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      canvasDom.removeEventListener('mousemove', handleMouseMove);
      canvasDom.removeEventListener('dblclick', handleDblClick);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [settings.quality3D, settings.theme]);

  // Update Dynamic Metrics Colors and Geometry
  useEffect(() => {
    if (!sceneRef.current) return;

    // Update Central Risk Core Color
    const riskColor = getRiskColor(currentMetrics.riskScore);
    if (riskCoreRef.current) {
      const mat = riskCoreRef.current.material as THREE.MeshStandardMaterial;
      mat.color = riskColor;
      mat.emissive = riskColor;
      mat.emissiveIntensity = 0.5 + (currentMetrics.riskScore / 100) * 0.7;
    }
    if (outerRing1Ref.current) {
      (outerRing1Ref.current.material as THREE.MeshStandardMaterial).color = riskColor;
    }

    // Update Jitter Waveform Geometry from History
    if (jitterLineRef.current && history.length > 2) {
      const posAttr = jitterLineRef.current.geometry.attributes.position as THREE.BufferAttribute;
      const positions = posAttr.array as Float32Array;
      const maxPts = Math.min(60, positions.length / 3);

      const recentHistory = history.slice(-maxPts);
      for (let i = 0; i < maxPts; i++) {
        const dataPoint = recentHistory[i] || currentMetrics;
        const t = (i / maxPts) * 10 - 5;
        positions[i * 3] = t;
        // Jitter height normalized
        const height = (dataPoint.jitter / 5.0) * 1.5;
        positions[i * 3 + 1] = -1.8 + height;
        positions[i * 3 + 2] = 2.0;
      }
      posAttr.needsUpdate = true;

      // Line color
      const jitterColor = currentMetrics.jitter > 3.5 ? 0xef4444 : currentMetrics.jitter > 2.4 ? 0xfacc15 : 0x10b981;
      (jitterLineRef.current.material as THREE.LineBasicMaterial).color.setHex(jitterColor);
    }

    // Update Formant 3D Scatter Points
    if (formantPointsRef.current && history.length > 2) {
      const posAttr = formantPointsRef.current.geometry.attributes.position as THREE.BufferAttribute;
      const colAttr = formantPointsRef.current.geometry.attributes.color as THREE.BufferAttribute;
      const positions = posAttr.array as Float32Array;
      const colors = colAttr.array as Float32Array;
      const ptCount = Math.min(40, positions.length / 3);

      const recent = history.slice(-ptCount);
      for (let i = 0; i < ptCount; i++) {
        const pt = recent[i] || currentMetrics;
        // Normalize F1 (300-800) to [-1.5, 1.5]
        const normF1 = ((pt.f1 - 550) / 250) * 1.5;
        // Normalize F2 (600-2500) to [-1.5, 1.5]
        const normF2 = ((pt.f2 - 1550) / 950) * 1.5;
        // Normalize F3 (1200-3500) to [-1.5, 1.5]
        const normF3 = ((pt.f3 - 2350) / 1150) * 1.5;

        positions[i * 3] = normF1;
        positions[i * 3 + 1] = normF2;
        positions[i * 3 + 2] = normF3;

        // Color based on time progression & anomaly
        const isAnomaly = pt.vowelZone === 'outlier';
        if (isAnomaly) {
          colors[i * 3] = 0.95;
          colors[i * 3 + 1] = 0.15;
          colors[i * 3 + 2] = 0.25;
        } else {
          const ratio = i / ptCount;
          const col = new THREE.Color().setHSL(0.5 + ratio * 0.35, 0.9, 0.6);
          colors[i * 3] = col.r;
          colors[i * 3 + 1] = col.g;
          colors[i * 3 + 2] = col.b;
        }
      }
      posAttr.needsUpdate = true;
      colAttr.needsUpdate = true;
    }

    // Update Coupling Rings Color
    if (couplingRingsRef.current) {
      const cScore = currentMetrics.couplingScore;
      const cColor = cScore >= 0.8 ? 0x10b981 : cScore >= 0.4 ? 0xfacc15 : 0xef4444;
      couplingRingsRef.current.children.forEach((child) => {
        if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshBasicMaterial) {
          child.material.color.setHex(cColor);
        }
      });
    }
  }, [currentMetrics, history]);

  // Click on 3D canvas
  const handleCanvasClick = useCallback(() => {
    if (hoveredInfo) {
      if (hoveredInfo.includes('Jitter')) {
        onMetricSelect?.('jitter');
      } else if (hoveredInfo.includes('Shimmer')) {
        onMetricSelect?.('shimmer');
      } else if (hoveredInfo.includes('Formant')) {
        onMetricSelect?.('formants');
        // Play acoustic resonant tone of current formant
        audioSynth.playFormantTone(currentMetrics.f1, currentMetrics.f2, currentMetrics.f3);
      } else if (hoveredInfo.includes('Risk')) {
        onMetricSelect?.('risk');
      }
    }
  }, [hoveredInfo, currentMetrics, onMetricSelect]);

  return (
    <div className="relative w-full h-full overflow-hidden select-none" ref={containerRef} onClick={handleCanvasClick}>
      {/* 3D Scene Controls Overlay (Top-Left of 3D Canvas) */}
      <div className="absolute top-4 left-4 z-10 flex flex-wrap items-center gap-1.5 bg-slate-950/80 backdrop-blur-md px-3 py-2 rounded-xl border border-slate-700/60 shadow-xl text-xs font-mono">
        <span className="text-slate-400 font-medium mr-1.5 flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
          VIEW:
        </span>
        {[
          { key: 1, label: '[1] Front', title: 'Front View (Default)' },
          { key: 2, label: '[2] Top', title: 'Top View (Overview)' },
          { key: 3, label: '[3] Side', title: 'Side View (Timeline)' },
          { key: 4, label: '[4] Free', title: 'Free Look (Exploration)' },
          { key: 5, label: '[5] Focus', title: 'Call Focus (Zoom)' },
        ].map((item) => (
          <button
            key={item.key}
            onClick={(e) => {
              e.stopPropagation();
              onPresetChange(item.key as CameraPreset);
            }}
            title={item.title}
            className={`px-2.5 py-1 rounded-lg transition-all font-semibold ${
              cameraPreset === item.key
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 shadow-sm shadow-cyan-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Navigation Help Badge (Bottom-Left) */}
      <div className="absolute bottom-4 left-4 z-10 hidden sm:flex items-center gap-3 bg-slate-950/70 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800 text-[11px] text-slate-400 font-mono">
        <span>🖱️ Left Drag: Rotate</span>
        <span>•</span>
        <span>Scroll: Zoom</span>
        <span>•</span>
        <span>Right Drag: Pan</span>
        <span>•</span>
        <span>2x Click: Reset</span>
      </div>

      {/* 3D Raycasting Tooltip */}
      {hoveredInfo && (
        <div
          className="absolute z-30 pointer-events-none bg-slate-900/95 backdrop-blur-md text-cyan-300 px-3 py-2 rounded-lg border border-cyan-500/40 shadow-2xl text-xs font-mono max-w-xs transition-opacity transform -translate-x-1/2 -translate-y-12"
          style={{ left: tooltipPos.x, top: tooltipPos.y }}
        >
          <div className="flex items-center gap-1.5 font-bold mb-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
            <span>3D Vocal Biometric Element</span>
          </div>
          <div className="text-slate-200">{hoveredInfo}</div>
          <div className="text-[10px] text-slate-400 mt-1">Click to drill down & inspect • Shift+Click to compare</div>
        </div>
      )}
    </div>
  );
};
