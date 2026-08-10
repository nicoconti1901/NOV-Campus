"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, AlertCircle } from "lucide-react";

type Props = {
  src: string;
  title?: string;
  onEnded?: () => void;
  className?: string;
};

type Phase = "loading" | "buffering" | "ready" | "error";

function formatSeconds(total: number) {
  if (!Number.isFinite(total) || total < 0) return "—";
  const s = Math.floor(total % 60);
  const m = Math.floor(total / 60) % 60;
  const h = Math.floor(total / 3600);
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function MaterialVideoPlayer({ src, title, onEnded, className }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [phase, setPhase] = useState<Phase>("loading");
  const [bufferPct, setBufferPct] = useState(0);
  const [duration, setDuration] = useState<number | null>(null);
  const [waitSeconds, setWaitSeconds] = useState(0);
  const startedAt = useRef<number>(Date.now());

  useEffect(() => {
    setPhase("loading");
    setBufferPct(0);
    setDuration(null);
    setWaitSeconds(0);
    startedAt.current = Date.now();
  }, [src]);

  useEffect(() => {
    if (phase === "ready" || phase === "error") return;
    const id = window.setInterval(() => {
      setWaitSeconds(Math.floor((Date.now() - startedAt.current) / 1000));
    }, 500);
    return () => window.clearInterval(id);
  }, [phase, src]);

  function updateBuffer() {
    const el = videoRef.current;
    if (!el || !el.duration || !Number.isFinite(el.duration)) return;
    if (el.buffered.length > 0) {
      const end = el.buffered.end(el.buffered.length - 1);
      setBufferPct(Math.min(100, Math.round((end / el.duration) * 100)));
    }
  }

  const showOverlay = phase === "loading" || phase === "buffering" || phase === "error";

  return (
    <div className={`relative overflow-hidden rounded-xl bg-black ${className ?? ""}`}>
      <video
        ref={videoRef}
        controls
        playsInline
        preload="auto"
        className="aspect-video w-full bg-black"
        src={src}
        title={title}
        onLoadStart={() => setPhase("loading")}
        onWaiting={() => setPhase((p) => (p === "error" ? p : "buffering"))}
        onLoadedMetadata={(e) => {
          const d = e.currentTarget.duration;
          if (Number.isFinite(d)) setDuration(d);
        }}
        onCanPlay={() => {
          updateBuffer();
          setPhase("ready");
        }}
        onPlaying={() => setPhase("ready")}
        onProgress={updateBuffer}
        onError={() => setPhase("error")}
        onEnded={onEnded}
      />

      {showOverlay && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-black/75 px-6 text-center text-white">
          {phase === "error" ? (
            <>
              <AlertCircle className="h-10 w-10 text-red-300" />
              <p className="text-base font-semibold">No se pudo cargar el video</p>
              <p className="max-w-md text-sm text-white/80">
                Revisá tu conexión e intentá de nuevo. Si el problema continúa, avisá al administrador.
              </p>
              <button
                type="button"
                onClick={() => {
                  setPhase("loading");
                  startedAt.current = Date.now();
                  setWaitSeconds(0);
                  videoRef.current?.load();
                }}
                className="mt-1 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-brand-dark hover:bg-white/90"
              >
                Reintentar
              </button>
            </>
          ) : (
            <>
              <Loader2 className="h-10 w-10 animate-spin text-white" />
              <p className="text-base font-semibold">
                {phase === "loading" ? "Cargando video…" : "Bufferizando reproducción…"}
              </p>
              <p className="max-w-md text-sm text-white/85">
                Los videos de capacitación pueden tardar en iniciar según tu conexión.
                {duration != null && duration > 0
                  ? ` Duración del video: ${formatSeconds(duration)}.`
                  : " Esperá a que el indicador avance."}
              </p>
              <div className="mt-1 w-full max-w-xs">
                <div className="mb-1.5 flex justify-between text-xs text-white/70">
                  <span>Progreso de carga</span>
                  <span>{bufferPct > 0 ? `${bufferPct}%` : "iniciando…"}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-white/20">
                  <div
                    className="h-full rounded-full bg-brand-red transition-all duration-300"
                    style={{ width: `${Math.max(bufferPct, phase === "loading" ? 8 : 4)}%` }}
                  />
                </div>
                <p className="mt-2 text-xs text-white/65">
                  Tiempo de espera: {waitSeconds}s
                  {waitSeconds >= 30
                    ? " — sigue cargando, no cierres esta página"
                    : waitSeconds >= 10
                      ? " — normal en videos grandes"
                      : ""}
                </p>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
