"use client";

import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import { Suspense, useRef } from "react";
import { MathUtils, SRGBColorSpace, TextureLoader, type Mesh } from "three";
import { dprFor } from "@/lib/hero3d-config";

type ItemSpec = {
  src: string;
  /** posição como fração da largura/altura visível (0 = centro) */
  fx: number;
  fy: number;
  /** tamanho como fração do menor lado visível */
  size: number;
  depth: number;
  phase: number;
};

const ITEMS: ItemSpec[] = [
  { src: "/images/novas/3d-tecido-seda.png", fx: 0.27, fy: -0.02, size: 0.78, depth: -0.5, phase: 0 },
  { src: "/images/novas/3d-joia-colar.png", fx: 0.2, fy: 0.17, size: 0.52, depth: 0.2, phase: 1.7 },
  { src: "/images/novas/3d-brinco-cristal.png", fx: 0.36, fy: -0.19, size: 0.36, depth: 0.5, phase: 3.1 }
];

function FloatingItem({ src, fx, fy, size, depth, phase }: ItemSpec) {
  const texture = useLoader(TextureLoader, src);
  texture.colorSpace = SRGBColorSpace;
  const mesh = useRef<Mesh>(null);
  const viewport = useThree((state) => state.viewport);
  const baseY = fy * viewport.height;
  const side = Math.min(viewport.width, viewport.height) * size;

  useFrame(({ clock }) => {
    if (!mesh.current) return;
    const t = clock.elapsedTime + phase;
    mesh.current.position.y = baseY + Math.sin(t * 0.8) * side * 0.04;
    mesh.current.rotation.z = Math.sin(t * 0.5) * 0.08;
    mesh.current.rotation.y = Math.sin(t * 0.4) * 0.3;
  });

  return (
    <mesh ref={mesh} position={[fx * viewport.width, baseY, depth]} scale={[side, side, 1]}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial map={texture} transparent depthWrite={false} toneMapped={false} />
    </mesh>
  );
}

/** A câmera desce com o scroll e acompanha levemente o ponteiro. */
function Rig() {
  useFrame(({ camera, pointer }, delta) => {
    const targetY = -window.scrollY * 0.004;
    camera.position.y = MathUtils.damp(camera.position.y, targetY, 4, delta);
    camera.position.x = MathUtils.damp(camera.position.x, pointer.x * 0.25, 3, delta);
  });
  return null;
}

export default function Hero3D({ onFail }: { onFail: () => void }) {
  return (
    <Canvas
      dpr={dprFor(window.innerWidth)}
      camera={{ position: [0, 0, 7], fov: 40 }}
      gl={{ alpha: true, antialias: true, powerPreference: "low-power" }}
      style={{ pointerEvents: "none" }}
      onCreated={({ gl }) => {
        gl.domElement.addEventListener("webglcontextlost", (event) => {
          // Ao trocar de tema o canvas é descartado de propósito (e o contexto "perdido"): não é falha.
          if (!gl.domElement.isConnected) return;
          event.preventDefault();
          onFail();
        });
      }}
    >
      <Suspense fallback={null}>
        {ITEMS.map((item) => (
          <FloatingItem key={item.src} {...item} />
        ))}
      </Suspense>
      <Rig />
    </Canvas>
  );
}
