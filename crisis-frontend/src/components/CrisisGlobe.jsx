'use client';
import { useRef, useState, useMemo, useEffect, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import {
  Compass,
  ShieldAlert,
  ArrowUpRight,
} from 'lucide-react';

// ─── Active Crisis Hotspots Data ───────────────────────────────────────────
export const CRISIS_HOTSPOTS = [
  {
    id: 'ukraine',
    name: 'Ukraine–Russia War',
    lat: 49.0,
    lng: 32.0,
    severity: 'critical',
    category: 'Armed Conflict',
    description: 'Interstate conflict with widespread infrastructure disruption, energy shocks, and grain supply bottlenecks.',
    affected: '~44M population',
    since: 'Feb 2022',
    chokepointImpact: 'Black Sea Grain Corridor',
    presetQuery: 'Black Sea grain corridor closed indefinitely amid escalated conflict',
  },
  {
    id: 'gaza',
    name: 'Gaza–Israel Conflict',
    lat: 31.4,
    lng: 34.4,
    severity: 'critical',
    category: 'Armed Conflict',
    description: 'Active hostilities with regional contagion risk and severe humanitarian supply shortages.',
    affected: '~2.3M population',
    since: 'Oct 2023',
    chokepointImpact: 'Eastern Mediterranean',
    presetQuery: 'Escalation of Middle East conflict threatens Eastern Mediterranean energy infrastructure',
  },
  {
    id: 'sudan',
    name: 'Sudan Civil War',
    lat: 15.5,
    lng: 32.5,
    severity: 'critical',
    category: 'Civil War',
    description: 'Severe armed clash between SAF and RSF causing mass refugee displacement and catastrophic famine risk.',
    affected: '~25M at risk',
    since: 'Apr 2023',
    chokepointImpact: 'Port Sudan / Red Sea Coast',
    presetQuery: 'Sudan conflict triggers humanitarian crisis and displacement across Chad and Egypt',
  },
  {
    id: 'red_sea',
    name: 'Red Sea & Bab el-Mandeb',
    lat: 13.0,
    lng: 43.3,
    severity: 'critical',
    category: 'Maritime Chokepoint',
    description: 'Houthi anti-ship missile strikes forcing ~65% of container ships to re-route via Cape of Good Hope (+14 days).',
    affected: '12% of global maritime trade',
    since: 'Nov 2023',
    chokepointImpact: 'Bab el-Mandeb Strait',
    presetQuery: 'Red Sea shipping attacks halt Suez Canal container traffic, spiking freight rates 250%',
  },
  {
    id: 'hormuz',
    name: 'Strait of Hormuz Alert',
    lat: 26.5,
    lng: 56.3,
    severity: 'high',
    category: 'Maritime Chokepoint',
    description: 'Chokepoint handling ~21M barrels of crude oil/day (20% of global petroleum). Heightened naval seizure risks.',
    affected: '20% of global oil transit',
    since: 'Ongoing',
    chokepointImpact: 'Strait of Hormuz',
    presetQuery: 'Iran closes Strait of Hormuz, cutting 20% of global oil transit',
  },
  {
    id: 'taiwan_strait',
    name: 'Taiwan Strait Standoff',
    lat: 24.0,
    lng: 120.5,
    severity: 'high',
    category: 'Geopolitical Tension',
    description: 'High military maneuvers across primary trade route for advanced semiconductor exports and maritime freight.',
    affected: '60% of advanced semiconductor supply',
    since: 'Ongoing',
    chokepointImpact: 'Taiwan Strait',
    presetQuery: 'Taiwan Strait naval blockade halts semiconductor exports',
  },
  {
    id: 'myanmar',
    name: 'Myanmar Civil War',
    lat: 19.8,
    lng: 96.1,
    severity: 'high',
    category: 'Civil War',
    description: 'Multiple front battle between resistance coalitions and military junta impacting rare-earth supplies.',
    affected: '~18.6M in need',
    since: 'Feb 2021',
    chokepointImpact: 'Bay of Bengal Trade',
    presetQuery: 'Myanmar supply chain breakdown halts Southeast Asian rare earth mineral refining',
  },
  {
    id: 'sahel',
    name: 'Sahel Regional Crisis',
    lat: 14.0,
    lng: 2.0,
    severity: 'high',
    category: 'Insurgency',
    description: 'Coups and security vacuum across Mali, Niger, and Burkina Faso disrupting uranium exports and ECOWAS trade.',
    affected: '~30M affected',
    since: '2021',
    chokepointImpact: 'West Africa Transit',
    presetQuery: 'West African corridor destabilization halts Niger uranium and gold mining exports',
  },
  {
    id: 'drc',
    name: 'DR Congo – M23 Conflict',
    lat: -1.6,
    lng: 29.2,
    severity: 'high',
    category: 'Armed Conflict',
    description: 'Offensives in North Kivu threatening cobalt and coltan mining logistics critical for battery supply chains.',
    affected: '~7M displaced',
    since: '2022',
    chokepointImpact: 'Great Lakes Logistics Corridor',
    presetQuery: 'DRC eastern conflict disrupts key global cobalt and coltan supply chains',
  },
  {
    id: 'south_china_sea',
    name: 'South China Sea Territorial Standoff',
    lat: 14.5,
    lng: 114.5,
    severity: 'elevated',
    category: 'Maritime Dispute',
    description: 'Confrontations between coast guards around Second Thomas Shoal and Scarborough Shoal along $3.4T trade lane.',
    affected: '$3.4 Trillion annual commerce',
    since: 'Ongoing',
    chokepointImpact: 'South China Sea sea lines',
    presetQuery: 'Maritime confrontation in South China Sea sparks high-risk trade insurance premiums',
  },
  {
    id: 'haiti',
    name: 'Haiti State Fragility',
    lat: 18.9,
    lng: -72.3,
    severity: 'high',
    category: 'State Collapse',
    description: 'Widespread gang control over seaports and national fuel terminals triggering humanitarian emergency.',
    affected: '~5.5M in need',
    since: '2021',
    chokepointImpact: 'Caribbean Sea Shipping',
    presetQuery: 'Caribbean seaport shutdown creates Caribbean regional logistics bottleneck',
  },
  {
    id: 'panama',
    name: 'Panama Canal Transit Restrictions',
    lat: 9.1,
    lng: -79.7,
    severity: 'elevated',
    category: 'Maritime Chokepoint',
    description: 'Freshwater reservoir deficits causing slot restrictions and draft reductions on US-Asia cargo lanes.',
    affected: '5% of global maritime commerce',
    since: 'Seasonal / Persistent',
    chokepointImpact: 'Panama Canal',
    presetQuery: 'Severe drought in Panama Canal halts 30% of global container transit',
  },
];

const SEVERITY_CONFIG = {
  critical: { color: '#ef4444', label: 'CRITICAL', bg: 'bg-red-50 text-red-700 border-red-200' },
  high: { color: '#f59e0b', label: 'HIGH', bg: 'bg-amber-50 text-amber-800 border-amber-200' },
  elevated: { color: '#2563eb', label: 'ELEVATED', bg: 'bg-blue-50 text-blue-700 border-blue-200' },
};

// ─── Mathematical Utility: Coordinates to 3D Sphere ─────────────────────────
function latLngToVector3(lat, lng, radius) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -(radius * Math.sin(phi) * Math.cos(theta)),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
}

// ─── Crisis Hotspot Marker ──────────────────────────────────────────────────
function HotspotMarker({ hotspot, radius, isSelected, isHovered, onSelect, onHover, onUnhover }) {
  const meshRef = useRef();
  const ringRef = useRef();
  const outerRingRef = useRef();

  const position = useMemo(
    () => latLngToVector3(hotspot.lat, hotspot.lng, radius + 0.012),
    [hotspot.lat, hotspot.lng, radius]
  );
  const color = SEVERITY_CONFIG[hotspot.severity]?.color || '#ef4444';

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const pulse = Math.sin(t * 3.5 + hotspot.lat * 0.2) * 0.5 + 0.5;

    if (meshRef.current) {
      const baseScale = isSelected ? 1.7 : isHovered ? 1.4 : 1.0;
      meshRef.current.scale.setScalar(baseScale + pulse * 0.2);
    }

    if (ringRef.current) {
      const s = 1.0 + pulse * 1.8;
      ringRef.current.scale.setScalar(s);
      ringRef.current.material.opacity = 0.7 - pulse * 0.5;
    }

    if (outerRingRef.current) {
      const s = 1.6 + pulse * 2.8;
      outerRingRef.current.scale.setScalar(s);
      outerRingRef.current.material.opacity = 0.35 - pulse * 0.3;
    }
  });

  return (
    <group position={position}>
      {/* Core Glowing Dot */}
      <mesh
        ref={meshRef}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(hotspot);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          onHover(hotspot);
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          onUnhover();
        }}
      >
        <sphereGeometry args={[0.024, 16, 16]} />
        <meshBasicMaterial color={color} />
      </mesh>

      {/* Primary Pulse Ring */}
      <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.024, 0.038, 28]} />
        <meshBasicMaterial color={color} transparent opacity={0.65} side={THREE.DoubleSide} />
      </mesh>

      {/* Secondary Outer Pulse Ring */}
      <mesh ref={outerRingRef} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.038, 0.052, 28]} />
        <meshBasicMaterial color={color} transparent opacity={0.35} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

// ─── Real Earth Spheres with NASA Textures ───────────────────────────────────
function EarthSphereWithTextures({ radius, cloudsRef }) {
  const [earthMap, cloudsMap] = useTexture([
    '/textures/earth-blue-marble.jpg',
    '/textures/earth-clouds.png',
  ]);

  return (
    <>
      {/* Real Earth Globe Sphere with NASA Blue Marble */}
      <mesh receiveShadow castShadow>
        <sphereGeometry args={[radius, 64, 64]} />
        <meshStandardMaterial
          map={earthMap}
          roughness={0.7}
          metalness={0.02}
        />
      </mesh>

      {/* Semi-transparent Clouds Layer */}
      <mesh ref={cloudsRef}>
        <sphereGeometry args={[radius + 0.012, 64, 64]} />
        <meshStandardMaterial
          map={cloudsMap}
          transparent
          opacity={0.32}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </>
  );
}

function FallbackEarthSphere({ radius }) {
  return (
    <mesh>
      <sphereGeometry args={[radius, 48, 48]} />
      <meshStandardMaterial color="#1d4ed8" roughness={0.7} />
    </mesh>
  );
}

// ─── Photorealistic Earth Scene ─────────────────────────────────────────────
function PhotorealisticEarth({ radius, hoveredHotspot, selectedHotspot, onSelectHotspot, onHoverHotspot, onUnhoverHotspot, isAutoRotating }) {
  const earthGroupRef = useRef();
  const cloudsRef = useRef();
  const targetRotationRef = useRef(null);

  // When a hotspot is selected, calculate target rotation to smoothly focus on it
  useEffect(() => {
    if (selectedHotspot) {
      const targetY = -(selectedHotspot.lng + 90) * (Math.PI / 180);
      const targetX = (selectedHotspot.lat - 10) * (Math.PI / 180);
      targetRotationRef.current = { x: targetX, y: targetY };
    }
  }, [selectedHotspot]);

  // Frame update: rotate clouds & gentle earth auto-rotation or smooth tween to hotspot
  useFrame((_, delta) => {
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y += delta * 0.02;
    }

    if (earthGroupRef.current) {
      if (targetRotationRef.current) {
        // Smoothly lerp towards target hotspot rotation
        const currentY = earthGroupRef.current.rotation.y;
        const currentX = earthGroupRef.current.rotation.x;
        const diffY = targetRotationRef.current.y - currentY;
        const diffX = targetRotationRef.current.x - currentX;

        earthGroupRef.current.rotation.y += diffY * 0.08;
        earthGroupRef.current.rotation.x += diffX * 0.08;

        if (Math.abs(diffY) < 0.002 && Math.abs(diffX) < 0.002) {
          targetRotationRef.current = null; // Reached target
        }
      } else if (isAutoRotating && !hoveredHotspot) {
        earthGroupRef.current.rotation.y += delta * 0.05;
      }
    }
  });

  return (
    <>
      {/* Studio Lighting tailored for realistic earth view in clean light UI */}
      <ambientLight intensity={1.8} />
      <directionalLight position={[5, 3, 5]} intensity={2.4} color="#ffffff" />
      <directionalLight position={[-5, 2, -3]} intensity={1.0} color="#e0f2fe" />
      <pointLight position={[0, 0, 4]} intensity={0.6} color="#ffffff" />

      {/* Main Earth Group */}
      <group ref={earthGroupRef}>
        <Suspense fallback={<FallbackEarthSphere radius={radius} />}>
          <EarthSphereWithTextures radius={radius} cloudsRef={cloudsRef} />
        </Suspense>

        {/* Atmosphere Halo / Fresnel Rim */}
        <mesh>
          <sphereGeometry args={[radius + 0.032, 64, 64]} />
          <meshBasicMaterial
            color="#38bdf8"
            transparent
            opacity={0.16}
            side={THREE.BackSide}
          />
        </mesh>

        {/* Crisis Hotspot Pins */}
        {CRISIS_HOTSPOTS.map((hotspot) => (
          <HotspotMarker
            key={hotspot.id}
            hotspot={hotspot}
            radius={radius}
            isSelected={selectedHotspot?.id === hotspot.id}
            isHovered={hoveredHotspot?.id === hotspot.id}
            onSelect={onSelectHotspot}
            onHover={onHoverHotspot}
            onUnhover={onUnhoverHotspot}
          />
        ))}
      </group>
    </>
  );
}

// ─── Main CrisisGlobe Container Component ──────────────────────────────────
export default function CrisisGlobe({ onSelectPreset }) {
  const [selectedHotspot, setSelectedHotspot] = useState(CRISIS_HOTSPOTS[0]); // Ukraine default
  const [hoveredHotspot, setHoveredHotspot] = useState(null);
  const [isAutoRotating, setIsAutoRotating] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  const categories = ['ALL', 'Armed Conflict', 'Maritime Chokepoint', 'Civil War'];

  const filteredHotspots = useMemo(() => {
    if (categoryFilter === 'ALL') return CRISIS_HOTSPOTS;
    return CRISIS_HOTSPOTS.filter((h) => h.category === categoryFilter);
  }, [categoryFilter]);

  const handleSelectHotspot = (hotspot) => {
    setSelectedHotspot(hotspot);
    setIsAutoRotating(false);
  };

  const handleTriggerAnalysis = (query) => {
    if (onSelectPreset) {
      onSelectPreset(query);
    }
  };

  const displayHotspot = hoveredHotspot || selectedHotspot;

  return (
    <div className="crisis-globe-card">
      {/* 1. Header Bar: Title, Category Pills & Controls */}
      <div className="p-4 sm:p-5 border-b border-slate-200 bg-white flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="pulse-radar-dot" />
            <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              Interactive Real-Time Global Threat Map
            </h3>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              Photorealistic 3D Earth
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Real satellite planetary mapping with 12 active geopolitical conflicts, civil wars, and maritime transit chokepoints.
          </p>
        </div>

        {/* Severity Count Summaries */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg bg-red-50 text-red-700 border border-red-200">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            <span>4 Critical</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span>5 High</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            <span>3 Elevated</span>
          </div>
        </div>
      </div>

      {/* 2. Main Visualizer: Side-by-side Real Earth Globe + Hotspot Command Deck */}
      <div className="grid grid-cols-1 lg:grid-cols-12">
        {/* Left Column: Photorealistic 3D Earth Canvas */}
        <div className="lg:col-span-8 relative">
          <div className="crisis-globe-canvas-wrap">
            <Canvas
              camera={{ position: [0, 0, 2.6], fov: 45 }}
              dpr={[1, 2]}
              gl={{ antialias: true, alpha: true }}
            >
              <PhotorealisticEarth
                radius={1.0}
                hoveredHotspot={hoveredHotspot}
                selectedHotspot={selectedHotspot}
                onSelectHotspot={handleSelectHotspot}
                onHoverHotspot={setHoveredHotspot}
                onUnhoverHotspot={() => setHoveredHotspot(null)}
                isAutoRotating={isAutoRotating}
              />
              <OrbitControls
                enableZoom={true}
                enablePan={false}
                minDistance={1.8}
                maxDistance={4.2}
                rotateSpeed={0.6}
                zoomSpeed={0.8}
                onStart={() => setIsAutoRotating(false)}
              />
            </Canvas>

            {/* Float Controls: Auto-rotate toggle & hints */}
            <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm text-xs text-slate-600">
              <Compass className="w-3.5 h-3.5 text-blue-600" />
              <span>Drag to rotate • Scroll to zoom</span>
              <button
                onClick={() => setIsAutoRotating(!isAutoRotating)}
                className={`ml-2 px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                  isAutoRotating ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {isAutoRotating ? 'Pause Spin' : 'Auto Spin'}
              </button>
            </div>

            {/* Currently Focused Hotspot Overlay Tag */}
            {displayHotspot && (
              <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md border border-slate-200 shadow-sm rounded-xl p-3 flex items-center gap-3">
                <span
                  className="w-3 h-3 rounded-full animate-pulse shrink-0"
                  style={{ background: SEVERITY_CONFIG[displayHotspot.severity]?.color }}
                />
                <div>
                  <div className="text-xs font-bold text-slate-900">{displayHotspot.name}</div>
                  <div className="text-[11px] text-slate-500 font-medium">{displayHotspot.category} • {displayHotspot.chokepointImpact}</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Selected Hotspot Intelligence Brief & Quick Filter Deck */}
        <div className="lg:col-span-4 border-t lg:border-t-0 lg:border-l border-slate-200 bg-slate-50/70 p-4 sm:p-5 flex flex-col justify-between">
          <div className="space-y-4">
            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg transition-all ${
                    categoryFilter === cat
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Active Hotspot Dossier Card */}
            {selectedHotspot && (
              <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${SEVERITY_CONFIG[selectedHotspot.severity]?.bg}`}>
                      {selectedHotspot.severity} THREAT
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 mt-1.5">
                      {selectedHotspot.name}
                    </h4>
                  </div>
                  <span className="text-[11px] font-mono text-slate-500">
                    Since {selectedHotspot.since}
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {selectedHotspot.description}
                </p>

                <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100">
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <div className="text-[10px] font-semibold text-slate-400 uppercase">Impact Zone</div>
                    <div className="font-semibold text-slate-800 text-[11px] mt-0.5">
                      {selectedHotspot.chokepointImpact}
                    </div>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <div className="text-[10px] font-semibold text-slate-400 uppercase">Affected Scale</div>
                    <div className="font-semibold text-slate-800 text-[11px] mt-0.5">
                      {selectedHotspot.affected}
                    </div>
                  </div>
                </div>

                {/* 1-Click Action to Execute Threat Analysis */}
                <button
                  onClick={() => handleTriggerAnalysis(selectedHotspot.presetQuery)}
                  className="w-full mt-2 py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Execute Full AI Threat Synthesis</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Scrollable Hotspot Quick-Select Strip */}
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center justify-between">
                <span>Select Hotspot to Rotate Globe</span>
                <span>{filteredHotspots.length} Available</span>
              </div>

              <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                {filteredHotspots.map((h) => {
                  const isCur = selectedHotspot?.id === h.id;
                  const cfg = SEVERITY_CONFIG[h.severity];
                  return (
                    <button
                      key={h.id}
                      onClick={() => handleSelectHotspot(h)}
                      className={`w-full text-left px-2.5 py-2 rounded-lg text-xs transition-all flex items-center justify-between ${
                        isCur
                          ? 'bg-blue-50 border border-blue-300 font-semibold text-blue-900 shadow-xs'
                          : 'bg-white hover:bg-slate-100 border border-slate-200 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ background: cfg.color }} />
                        <span className="truncate">{h.name}</span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-500 uppercase">{h.category.split(' ')[0]}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
