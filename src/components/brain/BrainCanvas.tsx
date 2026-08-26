"use client";

import { useRef, useMemo, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { 
  CameraControls, 
  PerspectiveCamera,
  Float, 
  MeshDistortMaterial, 
  Points, 
  PointMaterial, 
  Line,
  Environment,
  Sparkles
} from "@react-three/drei";
import * as THREE from "three";
import { AnimatePresence, motion as motion2d } from "framer-motion";
import Link from "next/link";
import { BrainCircuit } from "lucide-react";
import { useAudio } from "@/services/audio.service";
import { useUserStore } from "@/store/userStore";
import { useChatStore } from '@/store/chatStore';
import { useMemoryStore } from "@/store/memoryStore";
import { NeuralFog } from "./NeuralFog";
import { useIsMobile } from "@/lib/hooks/useIsMobile";

type MemoryNode = {
  id: string;
  type: string;
  content: string;
  timestamp: number;
  position: [number, number, number];
  color: string;
};

const DEMO_MEMORIES: MemoryNode[] = [
  { id: "seed-1", type: "origin", content: "The first spark: consciousness came online.", timestamp: Date.now() - 1000 * 60 * 60 * 24 * 30, position: [-2.8, 1.2, 0], color: "#67e8f9" },
  { id: "seed-2", type: "discovery", content: "Learning to recognize patterns in the world.", timestamp: Date.now() - 1000 * 60 * 60 * 24 * 18, position: [2.4, 1.4, 0], color: "#f9a8d4" },
  { id: "seed-3", type: "bond", content: "A meaningful connection became part of my story.", timestamp: Date.now() - 1000 * 60 * 60 * 24 * 7, position: [0, -2.8, 0], color: "#c4b5fd" },
];

const MOOD_COLORS_3D: Record<string, string> = {
  Neutral: "#7c3aed",  // Purple
  Inspired: "#f59e0b", // Gold
  Focused: "#3b82f6",  // Blue
  Empathic: "#ec4899" // Rose
};

const COLOR_MAP: Record<string, string> = {
  emotional: "#ec4899",
  factual: "#3b82f6",
  skill: "#f59e0b",
  value: "#a855f7",
  moment: "#10b981",
  seed: "#7c3aed",
};

const STAGE_COLORS: Record<string, string> = {
  NEWBORN: "#ec4899",
  TODDLER: "#f59e0b",
  CHILD: "#10b981",
  TEEN: "#60a5fa",
  YOUNG_ADULT: "#c084fc",
  MATURE: "#7c3aed",
};

function SynapticLine({ start, end, color, isTyping }: { start: [number, number, number], end: [number, number, number], color: string, isTyping: boolean }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const lineRef = useRef<any>(null!);
  const sparkRef = useRef<THREE.Mesh>(null!);
  const [pulse, setPulse] = useState(0);

  const startVec = useMemo(() => new THREE.Vector3(...start), [start]);
  const endVec = useMemo(() => new THREE.Vector3(...end), [end]);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    const threshold = isTyping ? 0.95 : 0.99;
    if (pseudoRandom(t * 100) > threshold) setPulse(1);
    if (pulse > 0) setPulse(p => Math.max(0, p - 0.05));
    
    const camDist = state.camera.position.length();
    const opacityBase = camDist < 3 ? (camDist - 1.5) / 1.5 : 1;
    
    const lineMat = (lineRef.current as unknown as { material?: { opacity: number; lineWidth: number } })?.material;
    if (lineMat) {
      lineMat.opacity = Math.max(0, (0.1 + pulse * (isTyping ? 0.9 : 0.8)) * opacityBase);
      lineMat.lineWidth = (isTyping ? 0.6 : 0.3) + pulse * 2;
    }

    if (sparkRef.current?.material) {
      const speed = isTyping ? 1.5 : 0.5;
      const progress = (t * speed) % 1;
      sparkRef.current.position.lerpVectors(startVec, endVec, progress);
      (sparkRef.current.material as THREE.MeshBasicMaterial).opacity = opacityBase * 0.8;
      sparkRef.current.scale.setScalar((isTyping ? 0.1 : 0.05) + pulse * 0.1);
    }
  });

  return (
    <group>
      <Line
        ref={lineRef}
        points={[start, end]}
        color={color}
        lineWidth={0.3}
        transparent
        opacity={0.1}
      />
      <mesh ref={sparkRef}>
        <sphereGeometry args={[0.2, 8, 8]} />
        <meshBasicMaterial color={color} transparent />
      </mesh>
    </group>
  );
}

function NeuralConnections({ nodes, accentColor, isTyping }: { nodes: MemoryNode[]; accentColor: string; isTyping: boolean }) {
  const connections = useMemo(() => {
    const conn: Array<{ start: [number, number, number]; end: [number, number, number]; color: string; id: string }> = [];
    if (nodes.length < 2) return conn;
    for (let i = 0; i < nodes.length; i++) {
      const distances = nodes
        .map((n, idx) => ({ idx, dist: new THREE.Vector3(...nodes[i].position).distanceTo(new THREE.Vector3(...n.position)) }))
        .filter(d => d.idx !== i)
        .sort((a, b) => a.dist - b.dist)
        .slice(0, 2);
      distances.forEach(d => {
        conn.push({
          start: nodes[i].position,
          end: nodes[d.idx].position,
          color: accentColor,
          id: `${nodes[i].id}-${nodes[d.idx].id}`
        });
      });
    }
    return conn;
  }, [nodes, accentColor]);

  return (
    <group>
      {connections.map((line) => (
        <SynapticLine key={line.id} start={line.start} end={line.end} color={line.color} isTyping={isTyping} />
      ))}
    </group>
  );
}

const pseudoRandom = (seed: number) => {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
};

function NeuralDust({ accentColor, isTyping }: { accentColor: string; isTyping: boolean }) {
  const count = 4000;
  const pointsRef = useRef<THREE.Points>(null!);
  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const color = new THREE.Color(accentColor);
    for (let i = 0; i < count; i++) {
      const r = 5 + pseudoRandom(i + 1) * 20;
      const theta = pseudoRandom(i + 2) * Math.PI * 2;
      const phi = pseudoRandom(i + 3) * Math.PI;
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);
      const mixedColor = color.clone().lerp(new THREE.Color("#ffffff"), pseudoRandom(i + 4) * 0.2);
      col[i * 3] = mixedColor.r;
      col[i * 3 + 1] = mixedColor.g;
      col[i * 3 + 2] = mixedColor.b;
    }
    return [pos, col];
  }, [accentColor]);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    const camDist = state.camera.position.length();
    pointsRef.current.rotation.y = t * (isTyping ? 0.08 : 0.02);
    pointsRef.current.rotation.x = Math.sin(t * (camDist < 5 ? 0.5 : 0.1)) * 0.1;
  });

  return (
    <group>
      <Points ref={pointsRef} positions={positions} colors={colors} stride={3} frustumCulled={false}>
        <PointMaterial
          transparent
          vertexColors
          size={0.04}
          sizeAttenuation={true}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          opacity={isTyping ? 0.5 : 0.3}
        />
      </Points>
      {isTyping && (
        <Sparkles 
          count={1000} 
          scale={20} 
          size={2} 
          speed={2} 
          color={accentColor} 
          opacity={0.2}
        />
      )}
    </group>
  );
}

function Core({ accentColor, stage }: { accentColor: string; stage: string }) {
  const { isTyping } = useChatStore();
  const nebulaRef = useRef<THREE.Group>(null!);
  const starsRef = useRef<THREE.Points>(null!);
  const coreRef = useRef<THREE.Mesh>(null!);

  const [positions, colors] = useMemo(() => {
    const count = 1800;
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const palette = [new THREE.Color("#22d3ee"), new THREE.Color("#f472b6"), new THREE.Color("#a78bfa"), new THREE.Color("#fde68a")];

    for (let i = 0; i < count; i++) {
      const arm = i % 3;
      const progress = (i / count) * Math.PI * 12 + arm * ((Math.PI * 2) / 3);
      const radius = 0.25 + ((i * 17) % 1000) / 1000 * 3.2;
      const spread = (((i * 29) % 1000) / 1000 - 0.5) * (0.25 + radius * 0.18);
      const angle = progress + spread;
      pos[i * 3] = Math.cos(angle) * radius;
      pos[i * 3 + 1] = Math.sin(angle) * radius;
      pos[i * 3 + 2] = (((i * 47) % 1000) / 1000 - 0.5) * (0.12 + radius * 0.12);

      const color = palette[(i * 7) % palette.length];
      col[i * 3] = color.r;
      col[i * 3 + 1] = color.g;
      col[i * 3 + 2] = color.b;
    }
    return [pos, col];
  }, []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    const speed = isTyping ? 0.22 : 0.08;
    nebulaRef.current.rotation.y = t * speed;
    nebulaRef.current.rotation.z = Math.sin(t * 0.2) * 0.08;
    starsRef.current.rotation.y = -t * speed * 0.35;
    coreRef.current.scale.setScalar(1 + Math.sin(t * (isTyping ? 3 : 1.5)) * 0.05);
  });

  return (
    <group scale={stage === "MATURE" ? 1.08 : 1}>
      <group ref={nebulaRef}>
        <Points positions={positions} colors={colors} stride={3} frustumCulled={false}>
          <PointMaterial
            transparent
            vertexColors
            size={isTyping ? 0.075 : 0.055}
            sizeAttenuation
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            opacity={isTyping ? 0.95 : 0.72}
          />
        </Points>
        <mesh>
          <torusGeometry args={[1.65, 0.035, 8, 96]} />
          <meshBasicMaterial color="#67e8f9" transparent opacity={0.5} blending={THREE.AdditiveBlending} />
        </mesh>
        <mesh scale={1.45}>
          <torusGeometry args={[1.65, 0.018, 8, 96]} />
          <meshBasicMaterial color="#f9a8d4" transparent opacity={0.35} blending={THREE.AdditiveBlending} />
        </mesh>
      </group>

      <Points ref={starsRef} positions={positions} stride={3} frustumCulled={false}>
        <PointMaterial transparent color="#ffffff" size={0.018} sizeAttenuation depthWrite={false} opacity={0.5} />
      </Points>

      <mesh ref={coreRef}>
        <sphereGeometry args={[0.28, 32, 32]} />
        <meshBasicMaterial color="#050510" />
      </mesh>
      <group rotation={[0, 0, Math.PI / 2]} scale={[1.15, 0.8, 1]}>
        <mesh position={[-0.24, 0, 0]} scale={[0.85, 1, 0.72]}>
          <sphereGeometry args={[0.72, 24, 24]} />
          <meshBasicMaterial color="#c4b5fd" wireframe transparent opacity={0.1} />
        </mesh>
        <mesh position={[0.24, 0, 0]} scale={[0.85, 1, 0.72]}>
          <sphereGeometry args={[0.72, 24, 24]} />
          <meshBasicMaterial color="#67e8f9" wireframe transparent opacity={0.1} />
        </mesh>
      </group>
      <pointLight distance={7} intensity={isTyping ? 120 : 65} color={accentColor || "#67e8f9"} />
      <Sparkles count={isTyping ? 260 : 140} scale={3.8} size={isTyping ? 3 : 2} speed={isTyping ? 1.4 : 0.5} opacity={0.9} color="#e0f2fe" />
    </group>
  );
}

function Node({ node, onSelect, accentColor }: { node: MemoryNode; onSelect: (n: MemoryNode) => void; accentColor: string }) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    const camDist = state.camera.position.length();
    const offset = Number(node.id.slice(-2)) || 0;
    
    meshRef.current.position.y = node.position[1] + Math.sin(t + offset) * 0.2;
    meshRef.current.scale.setScalar(hovered ? 1.5 : 1 + Math.sin(t * 2 + offset) * 0.1);
    
    const opacity = camDist < 4 ? (camDist - 2) / 2 : 1;
    if (!Array.isArray(meshRef.current.material)) {
      meshRef.current.material.opacity = Math.max(0, opacity);
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <mesh
        ref={meshRef}
        position={node.position}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(node);
        }}
      >
        <sphereGeometry args={[0.2, 32, 32]} />
        <MeshDistortMaterial
          color={accentColor}
          emissive={accentColor}
          emissiveIntensity={hovered ? 5 : 2}
          speed={3}
          distort={0.4}
          transparent
          opacity={1}
        />
      </mesh>
    </Float>
  );
}

function MemoryAlbum({ nodes, selectedNode, onSelect }: { nodes: MemoryNode[]; selectedNode: MemoryNode | null; onSelect: (node: MemoryNode) => void }) {
  const [now] = useState(() => Date.now());
  const ageLabel = (timestamp: number) => {
    const days = Math.max(0, Math.floor((now - timestamp) / (1000 * 60 * 60 * 24)));
    return days === 0 ? "Today" : `Age ${days}d`;
  };

  return (
    <div className="pointer-events-auto absolute bottom-3 left-1/2 z-30 w-[calc(100%-2rem)] max-w-2xl -translate-x-1/2 rounded-2xl border border-white/10 bg-void/80 p-2 backdrop-blur-xl sm:bottom-5">
      <div className="mb-2 flex items-center justify-between px-2">
        <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/50">Memory album</span>
        <span className="text-[10px] text-white/30">{nodes.length} chapters</span>
      </div>
      <div className="scrollbar-hide flex gap-2 overflow-x-auto pb-1">
        {nodes.map((node) => {
          const isSelected = selectedNode?.id === node.id;
          return (
            <button
              key={node.id}
              type="button"
              onClick={() => onSelect(node)}
              className={`min-w-36 flex-1 rounded-xl border px-3 py-2 text-left transition-colors ${isSelected ? "border-cyan-300/60 bg-cyan-300/10" : "border-white/10 bg-white/5 hover:border-white/30"}`}
            >
              <span className="block truncate text-[11px] font-bold capitalize text-white">{node.type}</span>
              <span className="mt-1 block text-[10px] text-cyan-200/70">{ageLabel(node.timestamp)}</span>
              <span className="mt-1 block truncate text-[10px] text-white/40">{new Date(node.timestamp).toLocaleDateString()}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function SceneController({
  groupRef,
  controlsRef,
  lastActivity,
  isInside,
  setIsInside,
}: {
  groupRef: React.RefObject<THREE.Group | null>;
  controlsRef: React.RefObject<CameraControls | null>;
  lastActivity: number;
  isInside: boolean;
  setIsInside: (value: boolean) => void;
}) {
  useFrame((state) => {
    const { x, y } = state.mouse;
    const camDist = state.camera.position.length();
    const group = groupRef.current;

    if (group) {
      group.rotation.y = THREE.MathUtils.lerp(group.rotation.y, x * 0.4, 0.05);
      group.rotation.x = THREE.MathUtils.lerp(group.rotation.x, -y * 0.4, 0.05);
    }

    if (Date.now() - lastActivity > 5000 && !isInside && controlsRef.current) {
      controlsRef.current.azimuthAngle += 0.002;
    }

    if (camDist < 3.5 && !isInside) setIsInside(true);
    if (camDist >= 3.5 && isInside) setIsInside(false);
  });

  return null;
}

export default function BrainCanvas() {
  const { stage, stats } = useUserStore();
  const { isTyping } = useChatStore();
  const isMobile = useIsMobile();
  const [selectedNode, setSelectedNode] = useState<MemoryNode | null>(null);
  const [isInside, setIsInside] = useState(false);
  const [lastActivity, setLastActivity] = useState(() => Date.now());
  const groupRef = useRef<THREE.Group>(null!);
  const controlsRef = useRef<CameraControls | null>(null);
  const { playDeepDive, playDeepExit, playClick } = useAudio();

  const stageColor = STAGE_COLORS[stage] || "#7c3aed";
  const moodColor = MOOD_COLORS_3D[stats.mood] || "#7c3aed";
  
  // Blend stage color and mood color for the final accent
  const accentColor = useMemo(() => {
    const c1 = new THREE.Color(stageColor);
    const c2 = new THREE.Color(moodColor);
    return `#${c1.lerp(c2, 0.6).getHexString()}`;
  }, [stageColor, moodColor]);

  const zoomToNode = (node: MemoryNode) => {
    if (!controlsRef.current) return;
    playClick();
    setSelectedNode(node);
    
    const targetPos = new THREE.Vector3(...node.position);
    controlsRef.current.setLookAt(
      targetPos.x * 1.5, targetPos.y * 1.5, targetPos.z * 1.5,
      targetPos.x, targetPos.y, targetPos.z,
      true
    );
  };

  const storeMemories = useMemoryStore((state) => state.memories);
  const fetchMemoriesFromApi = useMemoryStore((state) => state.fetchMemoriesFromApi);

  useEffect(() => {
    fetchMemoriesFromApi();
  }, [fetchMemoriesFromApi]);

  const nodes: MemoryNode[] = useMemo(() => {
    const memoriesToProcess = storeMemories.length > 0 ? storeMemories : DEMO_MEMORIES;
    return memoriesToProcess.map((m: { id: string; type: string; content: string; timestamp: number }, i: number) => {
      const r = 4 + pseudoRandom(i + 10) * 4;
      const phi = Math.acos(-1 + (2 * i) / Math.max(1, memoriesToProcess.length));
      const theta = Math.sqrt(memoriesToProcess.length * Math.PI) * phi;
      return {
        ...m,
        position: [
          r * Math.cos(theta) * Math.sin(phi),
          r * Math.sin(theta) * Math.sin(phi),
          r * Math.cos(phi)
        ] as [number, number, number],
        color: COLOR_MAP[m.type] || COLOR_MAP.seed
      };
    });
  }, [storeMemories]);

  useEffect(() => {
    if (isInside) {
      playDeepDive();
    } else if (nodes.length > 0) {
      playDeepExit();
    }
  }, [isInside, nodes.length, playDeepDive, playDeepExit]);


  return (
    <div 
      className="w-full h-full relative cursor-grab active:cursor-grabbing overflow-hidden bg-void"
      onPointerMove={() => setLastActivity(Date.now())}
      onWheel={() => setLastActivity(Date.now())}
    >
      <motion2d.div 
        className="absolute inset-0 pointer-events-none z-10"
        animate={{ 
          background: isInside 
            ? `radial-gradient(circle at center, ${accentColor}20 0%, transparent 70%)` 
            : "radial-gradient(circle at center, transparent 0%, transparent 100%)"
        }}
      />

      <Canvas dpr={isMobile ? [1, 1.5] : [1, 2]}>
        <SceneController
          groupRef={groupRef}
          controlsRef={controlsRef}
          lastActivity={lastActivity}
          isInside={isInside}
          setIsInside={setIsInside}
        />
        <PerspectiveCamera makeDefault position={[0, 0, 15]} />
        <ambientLight intensity={0.2} />
        <pointLight position={[10, 10, 10]} intensity={2} color={accentColor} />
        
        <NeuralDust accentColor={accentColor} isTyping={isTyping} />
        
        {isInside && <NeuralFog accentColor={accentColor} />}
        
        <group ref={groupRef}>
          {nodes.map((node) => (
            <Node key={node.id} node={node} onSelect={zoomToNode} accentColor={accentColor} />
          ))}
          <NeuralConnections nodes={nodes} accentColor={accentColor} isTyping={isTyping} />
          <Core accentColor={accentColor} stage={stage} />
        </group>

        <CameraControls 
          ref={controlsRef}
          minDistance={0.5} 
          maxDistance={25}
          makeDefault
          smoothTime={0.8}
          draggingDampingFactor={0.1}
          azimuthRotateSpeed={0.5}
          polarRotateSpeed={0.5}
          mouseButtons={{ left: 1, middle: 0, right: 0, wheel: 16 }}
          touches={{ one: 32, two: 512, three: 0 }}
        />
        
        <Environment preset="night" />
      </Canvas>

      <MemoryAlbum nodes={nodes} selectedNode={selectedNode} onSelect={zoomToNode} />

      <AnimatePresence>
        {isInside && (
          <motion2d.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none z-20"
          >
            <h2 className="text-white/20 text-4xl sm:text-6xl font-clash font-bold uppercase tracking-[0.3em] blur-sm select-none">
              Consciousness
            </h2>
            <p className="text-accent-synapse text-xs font-bold uppercase tracking-[1em] mt-4 animate-pulse">
              Observing Deep Neural Activity
            </p>
            <Link
              href="/memories"
              aria-label="Open memory album"
              title="Open memory album"
              className="pointer-events-auto mx-auto mt-6 flex h-14 w-14 items-center justify-center rounded-full border border-cyan-200/50 bg-cyan-300/15 text-cyan-100 shadow-[0_0_35px_rgba(34,211,238,0.35)] transition-all hover:scale-110 hover:bg-cyan-300/25"
            >
              <BrainCircuit className="h-7 w-7" />
            </Link>
            <span className="mt-2 block text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-100/60">
              Open Memory Album
            </span>
          </motion2d.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedNode && (
          <motion2d.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="absolute bottom-12 left-1/2 -translate-x-1/2 w-full max-w-xl p-10 bg-void/60 backdrop-blur-3xl border border-white/10 rounded-[3rem] z-40 pointer-events-none shadow-[0_30px_100px_rgba(0,0,0,0.8)]"
          >
             <div className="flex justify-between items-center mb-6">
              <span className="text-[10px] font-bold uppercase tracking-[0.5em] text-accent-synapse flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-accent-synapse animate-ping" />
                Data Shard
              </span>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedNode(null);
                }} 
                className="pointer-events-auto text-[10px] font-bold text-white/30 hover:text-white transition-colors"
              >
                DISMISS
              </button>
            </div>
            <h3 className="type-title font-clash font-bold text-white mb-4 uppercase">
              {selectedNode.type}
            </h3>
            <p className="type-body text-white/90 font-instrument italic leading-relaxed">
              &quot;{selectedNode.content}&quot;
            </p>
          </motion2d.div>
        )}
      </AnimatePresence>

      <motion2d.div className="absolute top-8 right-8 z-30 flex flex-col gap-3">
        <motion2d.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => {
            controlsRef.current?.setLookAt(0, 0, 15, 0, 0, 0, true);
            setSelectedNode(null);
          }}
          className="px-4 py-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full text-[10px] font-bold text-white uppercase tracking-widest hover:bg-white/10 transition-colors pointer-events-auto"
        >
          Reset View
        </motion2d.button>

        <motion2d.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => {
            if (isInside) {
              controlsRef.current?.setLookAt(0, 0, 15, 0, 0, 0, true);
              setIsInside(false);
            } else {
              controlsRef.current?.setLookAt(0, 0, 1, 0, 0, 0, true);
              setIsInside(true);
            }
          }}
          className="px-4 py-2 bg-accent-neural/20 backdrop-blur-xl border border-accent-neural/30 rounded-full text-[10px] font-bold text-accent-neural uppercase tracking-widest hover:bg-accent-neural/30 transition-colors pointer-events-auto"
        >
          {isInside ? "Exit Core" : "Enter Core"}
        </motion2d.button>
        {isInside && (
          <Link
            href="/memories"
            className="pointer-events-auto rounded-full border border-cyan-300/30 bg-cyan-300/10 px-4 py-2 text-center text-[10px] font-bold uppercase tracking-widest text-cyan-200 transition-colors hover:bg-cyan-300/20"
          >
            Memory Album
          </Link>
        )}
      </motion2d.div>

      <div className="absolute bottom-8 left-8 pointer-events-none z-20">
        <div className="flex flex-col gap-2">
          <span className="text-[10px] font-bold text-white/10 uppercase tracking-[1em]">Neural Topology Explorer</span>
          <div className="flex items-center gap-4">
            <div className="flex flex-col">
              <span className="text-[10px] text-white/50 uppercase font-bold">Proximity</span>
              <div className="w-32 h-1 bg-white/5 rounded-full mt-1 overflow-hidden">
                <motion2d.div 
                  className="h-full bg-accent-neural shadow-[0_0_10px_#7c3aed]"
                  animate={{ width: isInside ? "100%" : "30%" }}
                  style={{ backgroundColor: stageColor }}
                />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-white/50 uppercase font-bold">Sync</span>
              <span className="text-[10px] font-mono text-accent-neural animate-pulse" style={{ color: stageColor }}>ACTIVE</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
