import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { MetricHistoryPoint, CameraPreset, AppSettings, Visualization3DMode } from '../../types';
import { audioSynth } from '../../services/audioSynth';
import { Dna, BarChart3, Share2, Network, Shield, Eye } from 'lucide-react';

interface VoiceGuardScene3DProps {
  currentMetrics: MetricHistoryPoint;
  history: MetricHistoryPoint[];
  cameraPreset: CameraPreset;
  onPresetChange: (preset: CameraPreset) => void;
  isChallengeActive: boolean;
  challengeProgress: number;
  settings: AppSettings;
  onMetricSelect?: (metricKey: string) => void;
  active3DMode: Visualization3DMode;
  onModeChange: (mode: Visualization3DMode) => void;
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
  active3DMode,
  onModeChange,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);

  // Group references for multi-mode 3D rendering
  const biometricsGroupRef = useRef<THREE.Group | null>(null);
  const dnaHelixGroupRef = useRef<THREE.Group | null>(null);
  const freqTowerGroupRef = useRef<THREE.Group | null>(null);
  const fraudRingGroupRef = useRef<THREE.Group | null>(null);
  const neuralNetGroupRef = useRef<THREE.Group | null>(null);

  // Dynamic mesh references
  const riskCoreRef = useRef<THREE.Mesh | null>(null);
  const outerRing1Ref = useRef<THREE.Mesh | null>(null);
  const outerRing2Ref = useRef<THREE.Mesh | null>(null);
  const jitterLineRef = useRef<THREE.Line | null>(null);
  const shimmerParticlesRef = useRef<THREE.Points | null>(null);
  const formantPointsRef = useRef<THREE.Points | null>(null);
  const shockwaveRef = useRef<THREE.Mesh | null>(null);
  const couplingRingsRef = useRef<THREE.Group | null>(null);
  const threatDomeRef = useRef<THREE.Mesh | null>(null);
  const ripplesGroupRef = useRef<THREE.Group | null>(null);

  const [hoveredInfo, setHoveredInfo] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Camera preset animations
  const targetCameraPos = useRef(new THREE.Vector3(0, 1.8, 11));
  const targetLookAt = useRef(new THREE.Vector3(0, 0, 0));

  // Determine risk color
  const getRiskColor = (score: number) => {
    if (score <= 20) return new THREE.Color(0x00f0ff);
    if (score <= 40) return new THREE.Color(0x10b981);
    if (score <= 60) return new THREE.Color(0xfacc15);
    if (score <= 80) return new THREE.Color(0xf97316);
    return new THREE.Color(0xef4444);
  };

  // Camera preset positions
  useEffect(() => {
    switch (cameraPreset) {
      case 1:
        targetCameraPos.current.set(0, 1.8, 11);
        targetLookAt.current.set(0, 0, 0);
        break;
      case 2:
        targetCameraPos.current.set(0, 14, 0.1);
        targetLookAt.current.set(0, 0, 0);
        break;
      case 3:
        targetCameraPos.current.set(12, 1, 0);
        targetLookAt.current.set(0, 0, 0);
        break;
      case 4:
        targetCameraPos.current.set(8, 7, 8);
        targetLookAt.current.set(0, 0, 0);
        break;
      case 5:
        targetCameraPos.current.set(0, 0.5, 4.8);
        targetLookAt.current.set(0, 0, 0);
        break;
    }
  }, [cameraPreset]);

  // Mode visibility switcher
  useEffect(() => {
    if (biometricsGroupRef.current) biometricsGroupRef.current.visible = active3DMode === 'biometrics';
    if (dnaHelixGroupRef.current) dnaHelixGroupRef.current.visible = active3DMode === 'dna-helix';
    if (freqTowerGroupRef.current) freqTowerGroupRef.current.visible = active3DMode === 'frequency-tower';
    if (fraudRingGroupRef.current) fraudRingGroupRef.current.visible = active3DMode === 'fraud-ring';
    if (neuralNetGroupRef.current) neuralNetGroupRef.current.visible = active3DMode === 'neural-network';
  }, [active3DMode]);

  // Initial Scene Setup
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(settings.theme === 'light' ? 0xf1f5f9 : 0x050914);
    scene.fog = new THREE.FogExp2(settings.theme === 'light' ? 0xf1f5f9 : 0x050914, 0.035);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 1.8, 11);
    cameraRef.current = camera;

    const pixelRatio = settings.quality3D === 'high' ? Math.min(window.devicePixelRatio, 2) : 1.2;
    const renderer = new THREE.WebGLRenderer({ antialias: settings.quality3D !== 'low', alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(pixelRatio);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxDistance = 26;
    controls.minDistance = 2.2;
    controls.target.set(0, 0, 0);
    controlsRef.current = controls;

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x00f0ff, 2.0);
    dirLight1.position.set(6, 12, 8);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xef4444, 1.4);
    dirLight2.position.set(-6, -6, -6);
    scene.add(dirLight2);

    // Spatial Ground Grid
    const gridHelper = new THREE.GridHelper(24, 24, 0x1e293b, 0x0f172a);
    gridHelper.position.y = -2.8;
    scene.add(gridHelper);

    // --- 360° Threat Analysis Dome (Feature 1.6) ---
    const domeGeo = new THREE.SphereGeometry(12, 32, 24, 0, Math.PI * 2, 0, Math.PI / 2);
    const domeMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      wireframe: true,
      transparent: true,
      opacity: 0.12,
      side: THREE.BackSide,
    });
    const threatDome = new THREE.Mesh(domeGeo, domeMat);
    scene.add(threatDome);
    threatDomeRef.current = threatDome;

    // --- Animated Risk Ripples Group (Feature 1.3) ---
    const ripplesGroup = new THREE.Group();
    for (let r = 0; r < 4; r++) {
      const ringGeo = new THREE.RingGeometry(0.8 + r * 1.5, 0.85 + r * 1.5, 48);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0x00f0ff,
        transparent: true,
        opacity: 0.25 - r * 0.05,
        side: THREE.DoubleSide,
      });
      const rMesh = new THREE.Mesh(ringGeo, ringMat);
      rMesh.rotation.x = Math.PI / 2;
      rMesh.position.y = -2.75;
      ripplesGroup.add(rMesh);
    }
    scene.add(ripplesGroup);
    ripplesGroupRef.current = ripplesGroup;

    // ==========================================
    // MODE 1: VOCAL BIOMETRICS (Default)
    // ==========================================
    const bioGroup = new THREE.Group();
    bioGroup.name = 'biometricsGroup';

    // Central Core Orb & Rings
    const coreGeo = new THREE.SphereGeometry(1.05, 32, 32);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0x00f0ff,
      emissive: 0x00a8b8,
      emissiveIntensity: 0.8,
      roughness: 0.2,
      metalness: 0.85,
      wireframe: true,
    });
    const riskCore = new THREE.Mesh(coreGeo, coreMat);
    riskCore.name = 'riskCore';
    bioGroup.add(riskCore);
    riskCoreRef.current = riskCore;

    const ring1Geo = new THREE.TorusGeometry(1.85, 0.035, 16, 100);
    const ring1Mat = new THREE.MeshStandardMaterial({ color: 0x00f0ff, emissive: 0x00f0ff, emissiveIntensity: 0.5 });
    const outerRing1 = new THREE.Mesh(ring1Geo, ring1Mat);
    outerRing1.rotation.x = Math.PI / 2.5;
    bioGroup.add(outerRing1);
    outerRing1Ref.current = outerRing1;

    const ring2Geo = new THREE.TorusGeometry(2.35, 0.035, 16, 100);
    const ring2Mat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0284c7, emissiveIntensity: 0.4 });
    const outerRing2 = new THREE.Mesh(ring2Geo, ring2Mat);
    outerRing2.rotation.y = Math.PI / 3;
    bioGroup.add(outerRing2);
    outerRing2Ref.current = outerRing2;

    // Jitter 3D Ribbon
    const jitterGeo = new THREE.BufferGeometry();
    const jitterPtsCount = 60;
    const jitterPositions = new Float32Array(jitterPtsCount * 3);
    for (let i = 0; i < jitterPtsCount; i++) {
      jitterPositions[i * 3] = (i / jitterPtsCount) * 10 - 5;
      jitterPositions[i * 3 + 1] = -1.8;
      jitterPositions[i * 3 + 2] = 2.0;
    }
    jitterGeo.setAttribute('position', new THREE.BufferAttribute(jitterPositions, 3));
    const jitterMat = new THREE.LineBasicMaterial({ color: 0x10b981, linewidth: 3 });
    const jitterLine = new THREE.Line(jitterGeo, jitterMat);
    jitterLine.name = 'jitterLine';
    bioGroup.add(jitterLine);
    jitterLineRef.current = jitterLine;

    // Shimmer Particle Cloud
    const shimmerCount = 500;
    const shimmerGeo = new THREE.BufferGeometry();
    const shimmerPositions = new Float32Array(shimmerCount * 3);
    const shimmerColors = new Float32Array(shimmerCount * 3);
    for (let i = 0; i < shimmerCount; i++) {
      const radius = 0.5 + Math.random() * 1.8;
      const angle = Math.random() * Math.PI * 2;
      shimmerPositions[i * 3] = -4.5 + radius * Math.cos(angle);
      shimmerPositions[i * 3 + 1] = (Math.random() - 0.5) * 4;
      shimmerPositions[i * 3 + 2] = radius * Math.sin(angle);
      shimmerColors[i * 3] = 0.05;
      shimmerColors[i * 3 + 1] = 0.85;
      shimmerColors[i * 3 + 2] = 0.65;
    }
    shimmerGeo.setAttribute('position', new THREE.BufferAttribute(shimmerPositions, 3));
    shimmerGeo.setAttribute('color', new THREE.BufferAttribute(shimmerColors, 3));
    const shimmerParticles = new THREE.Points(shimmerGeo, new THREE.PointsMaterial({ size: 0.09, vertexColors: true, transparent: true, opacity: 0.8 }));
    shimmerParticles.name = 'shimmerParticles';
    bioGroup.add(shimmerParticles);
    shimmerParticlesRef.current = shimmerParticles;

    // Formant 3D Scatter with Vowel Triangle
    const formantGroup = new THREE.Group();
    formantGroup.position.set(4.5, 0, 0);
    const vTriangleGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-1.2, 1.5, -1.0),
      new THREE.Vector3(1.2, 1.2, 1.0),
      new THREE.Vector3(0, -1.5, 0.2),
      new THREE.Vector3(-1.2, 1.5, -1.0),
    ]);
    formantGroup.add(new THREE.Line(vTriangleGeo, new THREE.LineBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.65 })));

    const formantGeo = new THREE.BufferGeometry();
    const formantPtsCount = 40;
    formantGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(formantPtsCount * 3), 3));
    formantGeo.setAttribute('color', new THREE.BufferAttribute(new Float32Array(formantPtsCount * 3), 3));
    const formantPoints = new THREE.Points(formantGeo, new THREE.PointsMaterial({ size: 0.16, vertexColors: true, transparent: true, opacity: 0.9 }));
    formantPoints.name = 'formantPoints';
    formantGroup.add(formantPoints);
    formantPointsRef.current = formantPoints;
    bioGroup.add(formantGroup);

    // Coupling Arcs
    const couplingGroup = new THREE.Group();
    for (let b = 0; b < 3; b++) {
      const cMesh = new THREE.Mesh(
        new THREE.TorusGeometry(3.0 + b * 0.4, 0.015, 12, 64),
        new THREE.MeshBasicMaterial({ color: 0x10b981, transparent: true, opacity: 0.25 + b * 0.1 })
      );
      cMesh.rotation.x = Math.PI / 2;
      couplingGroup.add(cMesh);
    }
    bioGroup.add(couplingGroup);
    couplingRingsRef.current = couplingGroup;

    // Challenge Shockwave
    const shockGeo = new THREE.RingGeometry(0.1, 0.3, 64);
    const shockwave = new THREE.Mesh(shockGeo, new THREE.MeshBasicMaterial({ color: 0x00f0ff, side: THREE.DoubleSide, transparent: true, opacity: 0 }));
    shockwave.rotation.x = Math.PI / 2;
    bioGroup.add(shockwave);
    shockwaveRef.current = shockwave;

    scene.add(bioGroup);
    biometricsGroupRef.current = bioGroup;

    // ==========================================
    // MODE 2: VOICE SIGNATURE DNA HELIX (Feature 1.7)
    // ==========================================
    const dnaGroup = new THREE.Group();
    dnaGroup.name = 'dnaHelixGroup';
    dnaGroup.visible = false;

    const helixSteps = 80;
    const strand1Points: THREE.Vector3[] = [];
    const strand2Points: THREE.Vector3[] = [];

    for (let i = 0; i < helixSteps; i++) {
      const angle = (i / helixSteps) * Math.PI * 8;
      const y = (i / helixSteps) * 8 - 4;
      const radius = 1.4;
      strand1Points.push(new THREE.Vector3(Math.cos(angle) * radius, y, Math.sin(angle) * radius));
      strand2Points.push(new THREE.Vector3(Math.cos(angle + Math.PI) * radius, y, Math.sin(angle + Math.PI) * radius));

      // Connecting rungs every 4 steps
      if (i % 4 === 0) {
        const rungGeo = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(Math.cos(angle) * radius, y, Math.sin(angle) * radius),
          new THREE.Vector3(Math.cos(angle + Math.PI) * radius, y, Math.sin(angle + Math.PI) * radius),
        ]);
        const rungLine = new THREE.Line(rungGeo, new THREE.LineBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.5 }));
        dnaGroup.add(rungLine);
      }
    }

    const strand1Geo = new THREE.BufferGeometry().setFromPoints(strand1Points);
    const strand1 = new THREE.Line(strand1Geo, new THREE.LineBasicMaterial({ color: 0x00f0ff, linewidth: 3 }));
    dnaGroup.add(strand1);

    const strand2Geo = new THREE.BufferGeometry().setFromPoints(strand2Points);
    const strand2 = new THREE.Line(strand2Geo, new THREE.LineBasicMaterial({ color: 0x10b981, linewidth: 3 }));
    dnaGroup.add(strand2);

    scene.add(dnaGroup);
    dnaHelixGroupRef.current = dnaGroup;

    // ==========================================
    // MODE 3: FREQUENCY HEATMAP 3D TOWER (Feature 1.4)
    // ==========================================
    const towerGroup = new THREE.Group();
    towerGroup.name = 'freqTowerGroup';
    towerGroup.visible = false;

    const towerBars = 32;
    for (let tb = 0; tb < towerBars; tb++) {
      const barGeo = new THREE.BoxGeometry(0.22, 1, 0.22);
      const barMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color().setHSL(0.6 - (tb / towerBars) * 0.6, 0.9, 0.55),
        emissive: 0x002244,
        roughness: 0.3,
      });
      const barMesh = new THREE.Mesh(barGeo, barMat);
      barMesh.position.set((tb / towerBars) * 8 - 4, 0, 0);
      barMesh.name = `freqBar_${tb}`;
      towerGroup.add(barMesh);
    }
    scene.add(towerGroup);
    freqTowerGroupRef.current = towerGroup;

    // ==========================================
    // MODE 4: 3D CALL NETWORK GRAPH (FRAUD RING) (Feature 2.3)
    // ==========================================
    const fraudRingGroup = new THREE.Group();
    fraudRingGroup.name = 'fraudRingGroup';
    fraudRingGroup.visible = false;

    // Nodes
    const networkNodes = [
      { pos: new THREE.Vector3(0, 0, 0), isRingleader: true, label: 'SUSPECTED RINGLEADER (Spoofed Trunk)' },
      { pos: new THREE.Vector3(-3.2, 1.8, -1.5), isRingleader: false, label: 'Caller #1 (Mumbai, 4G)' },
      { pos: new THREE.Vector3(-2.8, -1.5, 1.2), isRingleader: false, label: 'Caller #2 (Delhi, Fiber)' },
      { pos: new THREE.Vector3(3.0, 2.0, 1.0), isRingleader: false, label: 'Caller #3 (Ahmedabad, SIP)' },
      { pos: new THREE.Vector3(3.5, -1.8, -1.0), isRingleader: false, label: 'Caller #4 (Tor Exit Relay)' },
      { pos: new THREE.Vector3(0, 3.2, -2.5), isRingleader: false, label: 'Caller #5 (Bengaluru)' },
    ];

    networkNodes.forEach((node) => {
      const nGeo = new THREE.SphereGeometry(node.isRingleader ? 0.6 : 0.3, 24, 24);
      const nMat = new THREE.MeshStandardMaterial({
        color: node.isRingleader ? 0xef4444 : 0xfacc15,
        emissive: node.isRingleader ? 0xef4444 : 0xb45309,
        emissiveIntensity: 0.7,
      });
      const nMesh = new THREE.Mesh(nGeo, nMat);
      nMesh.position.copy(node.pos);
      fraudRingGroup.add(nMesh);

      // Connecting edge to center ringleader
      if (!node.isRingleader) {
        const edgeGeo = new THREE.BufferGeometry().setFromPoints([networkNodes[0].pos, node.pos]);
        const edgeLine = new THREE.Line(edgeGeo, new THREE.LineBasicMaterial({ color: 0xef4444, transparent: true, opacity: 0.6 }));
        fraudRingGroup.add(edgeLine);
      }
    });
    scene.add(fraudRingGroup);
    fraudRingGroupRef.current = fraudRingGroup;

    // ==========================================
    // MODE 5: NEURAL NETWORK CONFIDENCE FLOW (Feature 1.5)
    // ==========================================
    const neuralGroup = new THREE.Group();
    neuralGroup.name = 'neuralNetGroup';
    neuralGroup.visible = false;

    // Layers: Input (4 nodes), Hidden (6 nodes), Decision Node (1 node)
    const layer1 = [-2, -0.7, 0.7, 2].map((y) => new THREE.Vector3(-4, y, 0));
    const layer2 = [-2.5, -1.5, -0.5, 0.5, 1.5, 2.5].map((y) => new THREE.Vector3(0, y, (Math.random() - 0.5) * 1.5));
    const decisionNodePos = new THREE.Vector3(4, 0, 0);

    // Nodes creation
    [...layer1, ...layer2, decisionNodePos].forEach((pos, idx) => {
      const isDecision = idx === layer1.length + layer2.length;
      const nodeGeo = new THREE.SphereGeometry(isDecision ? 0.55 : 0.22, 16, 16);
      const nodeMat = new THREE.MeshStandardMaterial({
        color: isDecision ? 0x10b981 : 0x00f0ff,
        emissive: isDecision ? 0x10b981 : 0x0088cc,
        emissiveIntensity: 0.8,
      });
      const nMesh = new THREE.Mesh(nodeGeo, nodeMat);
      nMesh.position.copy(pos);
      neuralGroup.add(nMesh);
    });

    // Connections Layer 1 to Layer 2
    layer1.forEach((p1) => {
      layer2.forEach((p2) => {
        const lineGeo = new THREE.BufferGeometry().setFromPoints([p1, p2]);
        const lineMat = new THREE.LineBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.2 });
        neuralGroup.add(new THREE.Line(lineGeo, lineMat));
      });
    });

    // Connections Layer 2 to Decision Node
    layer2.forEach((p2) => {
      const lineGeo = new THREE.BufferGeometry().setFromPoints([p2, decisionNodePos]);
      const lineMat = new THREE.LineBasicMaterial({ color: 0x10b981, transparent: true, opacity: 0.35 });
      neuralGroup.add(new THREE.Line(lineGeo, lineMat));
    });

    scene.add(neuralGroup);
    neuralNetGroupRef.current = neuralGroup;

    // Mouse events
    const raycaster = new THREE.Raycaster();
    const mousePos = new THREE.Vector2();

    const handleMouseMove = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mousePos.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mousePos.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      setTooltipPos({ x: event.clientX, y: event.clientY });
    };

    const canvasDom = renderer.domElement;
    canvasDom.addEventListener('mousemove', handleMouseMove);

    // Resize
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

      camera.position.lerp(targetCameraPos.current, 0.05);
      controls.target.lerp(targetLookAt.current, 0.05);
      controls.update();

      // Threat Dome slow rotation
      if (threatDomeRef.current) {
        threatDomeRef.current.rotation.y += delta * 0.05;
      }

      // Ripples pulsation
      if (ripplesGroupRef.current) {
        ripplesGroupRef.current.children.forEach((rMesh, i) => {
          const s = 1.0 + Math.sin(elapsedTime * 2.0 + i) * 0.15;
          rMesh.scale.set(s, s, 1);
        });
      }

      // Biometrics mode animations
      if (biometricsGroupRef.current?.visible) {
        if (outerRing1Ref.current) {
          outerRing1Ref.current.rotation.z += delta * 0.6;
          outerRing1Ref.current.rotation.x += delta * 0.2;
        }
        if (outerRing2Ref.current) {
          outerRing2Ref.current.rotation.y += delta * 0.4;
          outerRing2Ref.current.rotation.z -= delta * 0.3;
        }
        if (riskCoreRef.current) {
          const pulse = 1.0 + Math.sin(elapsedTime * 4.0) * 0.08;
          riskCoreRef.current.scale.set(pulse, pulse, pulse);
        }
        if (formantPointsRef.current) {
          formantPointsRef.current.rotation.y = elapsedTime * 0.15;
        }
        if (couplingRingsRef.current) {
          const cScore = currentMetrics.couplingScore;
          const s = 1.0 + Math.sin(elapsedTime * (1.5 + cScore * 3.5)) * (0.04 + cScore * 0.08);
          couplingRingsRef.current.scale.set(s, 1, s);
        }
        if (shockwaveRef.current) {
          if (isChallengeActive) {
            const radius = 0.5 + challengeProgress * 7.5;
            shockwaveRef.current.scale.set(radius, radius, 1);
            (shockwaveRef.current.material as THREE.MeshBasicMaterial).opacity = (1 - challengeProgress) * 0.9;
          } else {
            (shockwaveRef.current.material as THREE.MeshBasicMaterial).opacity = 0;
          }
        }
      }

      // DNA Helix animation
      if (dnaHelixGroupRef.current?.visible) {
        dnaHelixGroupRef.current.rotation.y += delta * 0.8;
      }

      // Frequency Tower animation
      if (freqTowerGroupRef.current?.visible) {
        freqTowerGroupRef.current.rotation.y += delta * 0.25;
        freqTowerGroupRef.current.children.forEach((bMesh, idx) => {
          if (bMesh instanceof THREE.Mesh) {
            const h = 0.5 + Math.abs(Math.sin(elapsedTime * 3.0 + idx * 0.4)) * 3.5;
            bMesh.scale.set(1, h, 1);
            bMesh.position.y = h / 2 - 2.0;
          }
        });
      }

      // Fraud Ring animation
      if (fraudRingGroupRef.current?.visible) {
        fraudRingGroupRef.current.rotation.y += delta * 0.3;
      }

      // Neural Net animation
      if (neuralNetGroupRef.current?.visible) {
        neuralNetGroupRef.current.rotation.y = Math.sin(elapsedTime * 0.5) * 0.2;
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      canvasDom.removeEventListener('mousemove', handleMouseMove);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [settings.quality3D, settings.theme]);

  // Update Dynamic Biometrics
  useEffect(() => {
    if (!sceneRef.current) return;

    const riskColor = getRiskColor(currentMetrics.riskScore);

    // Threat Dome color transition
    if (threatDomeRef.current) {
      (threatDomeRef.current.material as THREE.MeshBasicMaterial).color = riskColor;
      (threatDomeRef.current.material as THREE.MeshBasicMaterial).opacity =
        currentMetrics.riskScore > 80 ? 0.35 : 0.12;
    }

    // Central Core
    if (riskCoreRef.current) {
      const mat = riskCoreRef.current.material as THREE.MeshStandardMaterial;
      mat.color = riskColor;
      mat.emissive = riskColor;
      mat.emissiveIntensity = 0.5 + (currentMetrics.riskScore / 100) * 0.7;
    }
    if (outerRing1Ref.current) {
      (outerRing1Ref.current.material as THREE.MeshStandardMaterial).color = riskColor;
    }

    // Jitter Waveform
    if (jitterLineRef.current && history.length > 2) {
      const posAttr = jitterLineRef.current.geometry.attributes.position as THREE.BufferAttribute;
      const positions = posAttr.array as Float32Array;
      const maxPts = Math.min(60, positions.length / 3);
      const recent = history.slice(-maxPts);
      for (let i = 0; i < maxPts; i++) {
        const pt = recent[i] || currentMetrics;
        positions[i * 3] = (i / maxPts) * 10 - 5;
        positions[i * 3 + 1] = -1.8 + (pt.jitter / 5.0) * 1.5;
        positions[i * 3 + 2] = 2.0;
      }
      posAttr.needsUpdate = true;
      (jitterLineRef.current.material as THREE.LineBasicMaterial).color.setHex(
        currentMetrics.jitter > 3.5 ? 0xef4444 : currentMetrics.jitter > 2.4 ? 0xfacc15 : 0x10b981
      );
    }

    // Formant Points
    if (formantPointsRef.current && history.length > 2) {
      const posAttr = formantPointsRef.current.geometry.attributes.position as THREE.BufferAttribute;
      const colAttr = formantPointsRef.current.geometry.attributes.color as THREE.BufferAttribute;
      const positions = posAttr.array as Float32Array;
      const colors = colAttr.array as Float32Array;
      const ptCount = Math.min(40, positions.length / 3);
      const recent = history.slice(-ptCount);
      for (let i = 0; i < ptCount; i++) {
        const pt = recent[i] || currentMetrics;
        positions[i * 3] = ((pt.f1 - 550) / 250) * 1.5;
        positions[i * 3 + 1] = ((pt.f2 - 1550) / 950) * 1.5;
        positions[i * 3 + 2] = ((pt.f3 - 2350) / 1150) * 1.5;
        const col = pt.vowelZone === 'outlier' ? new THREE.Color(0xef4444) : new THREE.Color(0x00f0ff);
        colors[i * 3] = col.r;
        colors[i * 3 + 1] = col.g;
        colors[i * 3 + 2] = col.b;
      }
      posAttr.needsUpdate = true;
      colAttr.needsUpdate = true;
    }
  }, [currentMetrics, history]);

  return (
    <div className="relative w-full h-full overflow-hidden select-none" ref={containerRef}>
      {/* 3D Mode Selector Header Bar (Section 1 Unique Modes) */}
      <div className="absolute top-4 left-4 z-20 flex flex-wrap items-center gap-1.5 bg-slate-950/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700/60 shadow-xl text-xs font-mono">
        <span className="text-cyan-400 font-bold mr-1 flex items-center gap-1">
          <Eye className="w-3.5 h-3.5 animate-pulse text-cyan-400" />
          MODE:
        </span>
        {[
          { id: 'biometrics', label: 'Vocal Hologram', icon: Shield },
          { id: 'dna-helix', label: 'Voice DNA Helix', icon: Dna },
          { id: 'frequency-tower', label: '3D Freq Tower', icon: BarChart3 },
          { id: 'neural-network', label: 'Neural AI Flow', icon: Network },
          { id: 'fraud-ring', label: 'Fraud Ring Graph', icon: Share2 },
        ].map((m) => {
          const Icon = m.icon;
          return (
            <button
              key={m.id}
              onClick={() => onModeChange(m.id as Visualization3DMode)}
              className={`px-2.5 py-1 rounded-lg transition-all font-semibold flex items-center gap-1.5 ${
                active3DMode === m.id
                  ? 'bg-cyan-500/25 text-cyan-300 border border-cyan-400/60 shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{m.label}</span>
            </button>
          );
        })}
      </div>

      {/* Preset Camera Views (Bottom Left) */}
      <div className="absolute bottom-4 left-4 z-10 flex flex-wrap items-center gap-1.5 bg-slate-950/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700/60 shadow-xl text-xs font-mono">
        <span className="text-slate-400 font-medium mr-1">CAMERA:</span>
        {[
          { key: 1, label: '[1] Front' },
          { key: 2, label: '[2] Top' },
          { key: 3, label: '[3] Side' },
          { key: 4, label: '[4] Free' },
          { key: 5, label: '[5] Focus' },
        ].map((p) => (
          <button
            key={p.key}
            onClick={() => onPresetChange(p.key as CameraPreset)}
            className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-all ${
              cameraPreset === p.key
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>
    </div>
  );
};
