/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import Lenis from 'lenis';
import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { Header } from './components/Header';
import { PortfolioOverlay } from './components/PortfolioOverlay';
import { StationDock } from './components/StationDock';
import { STATIONS, StationId } from './data/portfolioData';

const SanctuaryCanvas = lazy(() =>
  import('./components/SanctuaryCanvas').then((m) => ({
    default: m.SanctuaryCanvas,
  })),
);

function SceneLoadingFallback() {
  return (
    <div
      className="fixed inset-0 z-0 flex items-center justify-center bg-[#EEEAE1]"
      aria-hidden="true"
    >
      <p className="font-display text-sm text-[#5A635E]">
        Preparando estudio de consultoría…
      </p>
    </div>
  );
}

export default function App() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  const [readingMode, setReadingMode] = useState<boolean>(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  const [activeStation, setActiveStation] = useState<StationId>('inicio');
  const scrollProgressRef = useRef(0);
  const lenisRef = useRef<Lenis | null>(null);

  // Sync OS prefers-reduced-motion changes
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
      if (e.matches) setReadingMode(true);
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  // Initialize Lenis smooth scroll + scroll progress tracking
  useEffect(() => {
    const updateProgress = () => {
      const maxScroll = Math.max(
        1,
        document.documentElement.scrollHeight - window.innerHeight,
      );
      scrollProgressRef.current = Math.min(
        1,
        Math.max(0, window.scrollY / maxScroll),
      );
    };

    updateProgress();

    if (readingMode || prefersReducedMotion) {
      window.addEventListener('scroll', updateProgress, { passive: true });
      return () => window.removeEventListener('scroll', updateProgress);
    }

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });
    lenisRef.current = lenis;

    lenis.on('scroll', () => {
      updateProgress();
    });

    let rafId = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [readingMode, prefersReducedMotion]);

  // Track active section with IntersectionObserver
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const id = entry.target.id as StationId;
            if (STATIONS.some((s) => s.id === id)) {
              setActiveStation(id);
            }
          }
        }
      },
      { threshold: 0.42 },
    );

    STATIONS.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const navigateToStation = useCallback(
    (id: StationId) => {
      setActiveStation(id);
      const targetEl = document.getElementById(id);
      if (!targetEl) return;

      if (lenisRef.current && !readingMode && !prefersReducedMotion) {
        lenisRef.current.scrollTo(targetEl, { offset: 0 });
      } else {
        targetEl.scrollIntoView({
          behavior: prefersReducedMotion || readingMode ? 'auto' : 'smooth',
        });
      }
    },
    [readingMode, prefersReducedMotion],
  );

  const toggleReadingMode = useCallback(() => {
    setReadingMode((prev) => !prev);
  }, []);

  return (
    <div className="relative min-h-screen bg-[#F4F2EE] text-[#1F2421]">
      <Suspense fallback={<SceneLoadingFallback />}>
        <SanctuaryCanvas
          readingMode={readingMode}
          prefersReducedMotion={prefersReducedMotion}
          scrollProgressRef={scrollProgressRef}
        />
      </Suspense>

      <Header activeStation={activeStation} onNavigate={navigateToStation} />

      <PortfolioOverlay
        readingMode={readingMode}
        onToggleReadingMode={toggleReadingMode}
        onNavigate={navigateToStation}
      />

      <StationDock
        activeStation={activeStation}
        readingMode={readingMode}
        onSelectStation={navigateToStation}
        onToggleReadingMode={toggleReadingMode}
      />
    </div>
  );
}
