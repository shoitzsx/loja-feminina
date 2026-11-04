"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { shouldRender3D } from "@/lib/hero3d-config";
import { Hero3DBoundary } from "./Hero3DBoundary";

// Three.js é carregado sob demanda, só quando o 3D pode rodar.
const Hero3D = dynamic(() => import("./Hero3D"), { ssr: false });

function detectWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("webgl2") ?? canvas.getContext("webgl");
    context?.getExtension("WEBGL_lose_context")?.loseContext();
    return Boolean(context);
  } catch {
    return false;
  }
}

export function Hero3DLoader() {
  const [env, setEnv] = useState<{ reducedMotion: boolean; webgl: boolean } | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setEnv({
      reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
      webgl: detectWebGL()
    });
  }, []);

  if (!env || failed) return null;
  if (!shouldRender3D({ prefersReducedMotion: env.reducedMotion, hasWebGL: env.webgl })) return null;

  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden="true">
      <Hero3DBoundary onError={() => setFailed(true)}>
        <Hero3D onFail={() => setFailed(true)} />
      </Hero3DBoundary>
    </div>
  );
}
