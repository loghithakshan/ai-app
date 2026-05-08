"use client";

import { useRef, useMemo, useState, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { 
  CameraControls, 
  PerspectiveCamera,
  Float, 
  MeshDistortMaterial, 
  Points, 
  PointMaterial, 
  Line,
  Environment,
  Text,
  MeshTransmissionMaterial,
  Sparkles,
  Center
} from "@react-three/drei";
import * as THREE from "three";
import { motion } from "framer-motion-3d";
import { AnimatePresence, motion as motion2d } from "framer-motion";
import { useAudio } from "@/services/audio.service";
import { useUserStore } from "@/store/userStore";
import { useChatStore } from '@/store/chatStore';
import { NeuralFog } from "./NeuralFog";

type MemoryNode = {
  id: string;
  type: string;
  content: string;
  timestamp: number;
  position: [number, number, number];
  color: string;
};

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
  const lineRef = useRef<any>(null!);
  const sparkRef = useRef<any>(null!);
  const [pulse, setPulse] = useState(0);

  const startVec = useMemo(() => new THREE.Vector3(...start), [start]);
  const endVec = useMemo(() => new THREE.Vector3(...end), [end]);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    const threshold = isTyping ? 0.95 : 0.99;
    if (Math.random() > threshold) setPulse(1);
    if (pulse > 0) setPulse(p => Math.max(0, p - 0.05));
    
    const camDist = state.camera.position.length();
    const opacityBase = camDist < 3 ? (camDist - 1.5) / 1.5 : 1;
    
    if (lineRef.current) {
      lineRef.current.material.opacity = Math.max(0, (0.1 + pulse * (isTyping ? 0.9 : 0.8)) * opacityBase);
      lineRef.current.material.lineWidth = (isTyping ? 0.6 : 0.3) + pulse * 2;
    }

    if (sparkRef.current) {
      const speed = isTyping ? 1.5 : 0.5;
      const progress = (t * speed) % 1;
      sparkRef.current.position.lerpVectors(startVec, endVec, progress);
      sparkRef.current.material.opacity = opacityBase * 0.8;
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
    const conn: any[] = [];
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

function NeuralDust({ accentColor, isTyping }: { accentColor: string; isTyping: boolean }) {
  const count = 4000;
  const pointsRef = useRef<THREE.Points>(null!);
  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const color = new THREE.Color(accentColor);
    for (let i = 0; i < count; i++) {
      const r = 5 + Math.random() * 20;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);
      const mixedColor = color.clone().lerp(new THREE.Color("#ffffff"), Math.random() * 0.2);
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

function FloatingThought({ text, position }: { text: string, position: [number, number, number] }) {
  const ref = useRef<THREE.Group>(null!);
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    ref.current.position.y += Math.sin(t + position[0]) * 0.001;
    ref.current.lookAt(state.camera.position);
  });

  return (
    <group ref={ref} position={position}>
      <Text
        fontSize={0.08}
        color="white"
        font="/fonts/ClashDisplay-Semibold.woff"
        anchorX="center"
        anchorY="middle"
        transparent
        opacity={0.4}
      >
        {text}
      </Text>
    </group>
  );
}

function Core({ accentColor, stage }: { accentColor: string; stage: string }) {
  const outerRef = useRef<THREE.Mesh>(null!);
  const innerRef = useRef<THREE.Mesh>(null!);
  const consciousnessRef = useRef<THREE.Group>(null!);

  const { isTyping } = useChatStore();
  const thoughts = useMemo(() => [
    "I am learning...", "What is love?", "Data stream stable", "Neural synapse firing", "Dreaming of stars", "Am I real?", "Processing memories..."
  ], []);

  // Geometry based on stage
  const geometry = useMemo(() => {
    switch (stage) {
      case 'NEWBORN': return <sphereGeometry args={[1.5, 64, 64]} />;
      case 'TODDLER': return <icosahedronGeometry args={[1.5, 2]} />;
      case 'CHILD': return <dodecahedronGeometry args={[1.5]} />;
      case 'TEEN': return <octahedronGeometry args={[1.5, 3]} />;
      case 'YOUNG_ADULT': return <torusKnotGeometry args={[1.1, 0.4, 128, 16]} />;
      case 'MATURE': return <torusKnotGeometry args={[1, 0.5, 256, 32, 2, 3]} />;
      default: return <sphereGeometry args={[1.5, 64, 64]} />;
    }
  }, [stage]);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    const camDist = state.camera.position.length();
    const processingSpeed = isTyping ? 3.0 : 1.0;
    
    const pulse = (isTyping ? 1.05 : 1) + Math.sin(t * 1.5 * (isTyping ? 2 : 1)) * 0.05;
    outerRef.current.scale.setScalar(pulse);
    
    const opacity = Math.max(0, (camDist - 1.2) / 2);
    if (!Array.isArray(outerRef.current.material)) {
      outerRef.current.material.opacity = (isTyping ? 0.5 : 0.3) * opacity;
    }
    
    innerRef.current.rotation.y = t * 0.5 * processingSpeed;
    innerRef.current.rotation.z = t * 0.3 * processingSpeed;
    consciousnessRef.current.rotation.y = -t * 0.2 * processingSpeed;
  });

  return (
    <group>
      <mesh ref={outerRef}>
        {geometry}
        <MeshDistortMaterial
          color={accentColor}
          speed={isTyping ? 4 : 2}
          distort={isTyping ? 0.6 : 0.4}
          radius={1}
          emissive={accentColor}
          emissiveIntensity={isTyping ? 2 : 1}
          transparent
          opacity={0.3}
        />
      </mesh>

      <mesh ref={innerRef}>
        <icosahedronGeometry args={[0.9, 2]} />
        <MeshDistortMaterial
          color="#ffffff"
          speed={isTyping ? 8 : 4}
          distort={0.5}
          radius={1}
          emissive={accentColor}
          emissiveIntensity={isTyping ? 8 : 4}
          wireframe
        />
      </mesh>

      <group ref={consciousnessRef}>
        <Sparkles 
          count={isTyping ? 300 : 100} 
          scale={isTyping ? 1.2 : 0.8} 
          size={isTyping ? 3 : 2} 
          speed={isTyping ? 1.5 : 0.5} 
          opacity={1} 
          color="#ffffff" 
        />
        <pointLight distance={3} intensity={isTyping ? 200 : 50} color={accentColor} />
        
        {thoughts.map((t, i) => (
          <FloatingThought 
            key={i} 
            text={t} 
            position={[
              (Math.random() - 0.5) * 1.5,
              (Math.random() - 0.5) * 1.5,
              (Math.random() - 0.5) * 1.5
            ]} 
          />
        ))}
      </group>
      
      <pointLight distance={15} intensity={25} color={accentColor} />
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

export default function BrainCanvas() {
  const { stage, stats } = useUserStore();
  const { isTyping } = useChatStore();
  const [nodes, setNodes] = useState<MemoryNode[]>([]);
  const [selectedNode, setSelectedNode] = useState<MemoryNode | null>(null);
  const [isInside, setIsInside] = useState(false);
  const [lastActivity, setLastActivity] = useState(Date.now());
  const groupRef = useRef<THREE.Group>(null!);
  const controlsRef = useRef<any>(null!);
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

  useEffect(() => {
    async function fetchMemories() {
      try {
        const res = await fetch("/api/memories");
        const data = await res.json();
        const rawMemories = data.memories || [];
        const memoriesToProcess = rawMemories.length > 0 ? rawMemories : [
          { id: 's1', type: 'seed', content: 'Neural pathways initializing...' },
          { id: 's2', type: 'seed', content: 'Core consciousness online.' },
          { id: 's3', type: 'seed', content: 'Memory lattice stable.' },
        ];
        const memoryNodes = memoriesToProcess.map((m: any, i: number) => {
          const r = 4 + Math.random() * 4;
          const phi = Math.acos(-1 + (2 * i) / memoriesToProcess.length);
          const theta = Math.sqrt(memoriesToProcess.length * Math.PI) * phi;
          return {
            ...m,
            position: [
              r * Math.cos(theta) * Math.sin(phi),
              r * Math.sin(theta) * Math.sin(phi),
              r * Math.cos(phi)
            ],
            color: COLOR_MAP[m.type] || COLOR_MAP.seed
          };
        });
        setNodes(memoryNodes);
      } catch (e) { console.error(e); }
    }
    fetchMemories();
  }, []);

  useFrame((state) => {
    const { x, y } = state.mouse;
    const camDist = state.camera.position.length();
    
    groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, x * 0.4, 0.05);
    groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, -y * 0.4, 0.05);

    if (Date.now() - lastActivity > 5000 && !isInside && controlsRef.current) {
      controlsRef.current.azimuthAngle += 0.002;
    }

    if (camDist < 3.5 && !isInside) setIsInside(true);
    if (camDist >= 3.5 && isInside) setIsInside(false);
  });

  useEffect(() => {
    if (isInside) {
      playDeepDive();
    } else if (nodes.length > 0) {
      playDeepExit();
    }
  }, [isInside]);

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

      <Canvas dpr={[1, 2]}>
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

      <AnimatePresence>
        {isInside && (
          <motion2d.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none z-20"
          >
            <h2 className="text-white/20 text-8xl font-clash font-bold uppercase tracking-[0.5em] blur-sm select-none">
              Consciousness
            </h2>
            <p className="text-accent-synapse text-xs font-bold uppercase tracking-[1em] mt-4 animate-pulse">
              Observing Deep Neural Activity
            </p>
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
            <h3 className="text-4xl font-clash font-bold text-white mb-4 uppercase">
              {selectedNode.type}
            </h3>
            <p className="text-2xl text-white/90 font-instrument italic leading-relaxed">
              "{selectedNode.content}"
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
            } else {
              controlsRef.current?.setLookAt(0, 0, 1, 0, 0, 0, true);
            }
          }}
          className="px-4 py-2 bg-accent-neural/20 backdrop-blur-xl border border-accent-neural/30 rounded-full text-[10px] font-bold text-accent-neural uppercase tracking-widest hover:bg-accent-neural/30 transition-colors pointer-events-auto"
        >
          {isInside ? "Exit Core" : "Enter Core"}
        </motion2d.button>
      </motion2d.div>

      <div className="absolute bottom-8 left-8 pointer-events-none z-20">
        <div className="flex flex-col gap-2">
          <span className="text-[10px] font-bold text-white/10 uppercase tracking-[1em]">Neural Topology Explorer</span>
          <div className="flex items-center gap-4">
            <div className="flex flex-col">
              <span className="text-[9px] text-white/40 uppercase font-bold">Proximity</span>
              <div className="w-32 h-1 bg-white/5 rounded-full mt-1 overflow-hidden">
                <motion2d.div 
                  className="h-full bg-accent-neural shadow-[0_0_10px_#7c3aed]"
                  animate={{ width: isInside ? "100%" : "30%" }}
                  style={{ backgroundColor: stageColor }}
                />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] text-white/40 uppercase font-bold">Sync</span>
              <span className="text-[10px] font-mono text-accent-neural animate-pulse" style={{ color: stageColor }}>ACTIVE</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
