import { useEffect, useRef, useState } from 'react';
import { PROFILE } from '../data/portfolioData';
import { SanctuaryEngine } from '../three/SanctuaryEngine';

interface SanctuaryCanvasProps {
  readingMode: boolean;
  prefersReducedMotion: boolean;
  scrollProgressRef: React.MutableRefObject<number>;
}

export function SanctuaryCanvas({
  readingMode,
  prefersReducedMotion,
  scrollProgressRef,
}: SanctuaryCanvasProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const engineRef = useRef<SanctuaryEngine | null>(null);
  const [webglError, setWebglError] = useState(false);

  useEffect(() => {
    if (readingMode) {
      if (engineRef.current) {
        engineRef.current.dispose();
        engineRef.current = null;
      }
      return;
    }

    const container = mountRef.current;
    if (!container) return;

    let rafSync = 0;
    try {
      const engine = new SanctuaryEngine(container, prefersReducedMotion, {
        onContextLost: () => setWebglError(true),
        onContextRestored: () => setWebglError(false),
      });
      engineRef.current = engine;

      const syncScroll = () => {
        if (engineRef.current) {
          engineRef.current.setScrollProgress(scrollProgressRef.current);
          rafSync = requestAnimationFrame(syncScroll);
        }
      };
      rafSync = requestAnimationFrame(syncScroll);
    } catch {
      setWebglError(true);
    }

    return () => {
      cancelAnimationFrame(rafSync);
      if (engineRef.current) {
        engineRef.current.dispose();
        engineRef.current = null;
      }
    };
  }, [readingMode, prefersReducedMotion, scrollProgressRef]);

  useEffect(() => {
    engineRef.current?.setReducedMotion(prefersReducedMotion);
  }, [prefersReducedMotion]);

  return (
    <div
      className="fixed inset-0 z-0 overflow-hidden bg-[#EEEAE1]"
      aria-hidden="true"
    >
      {/* Dedicated WebGL Mount Container (isolated from React HUD state) */}
      {!readingMode && !webglError && (
        <div ref={mountRef} className="h-full w-full" />
      )}

      {/* Graceful Static Reading Mode / WebGL Fallback Backdrop */}
      {(readingMode || webglError) && (
        <div className="relative h-full w-full">
          <img
            src={PROFILE.readingBackdropSrc}
            alt="Estudio luminoso de consultoría en psicología organizacional"
            referrerPolicy="no-referrer"
            className="h-full w-full object-cover object-center opacity-55"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#F4F2EE]/85 via-[#F4F2EE]/75 to-[#F4F2EE]/95" />
        </div>
      )}
    </div>
  );
}
