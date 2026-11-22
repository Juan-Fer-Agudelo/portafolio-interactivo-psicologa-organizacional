import { useState } from 'react';
import { BookOpen, Box, ChevronDown, ChevronUp } from 'lucide-react';
import { STATIONS, StationId } from '../data/portfolioData';

interface StationDockProps {
  activeStation: StationId;
  readingMode: boolean;
  onSelectStation: (id: StationId) => void;
  onToggleReadingMode: () => void;
}

export function StationDock({
  activeStation,
  readingMode,
  onSelectStation,
  onToggleReadingMode,
}: StationDockProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="fixed bottom-4 left-1/2 z-30 -translate-x-1/2 w-[min(900px,94vw)] pointer-events-none">
      <div className="flex flex-col items-center">
        {/* Collapse / Expand Toggle */}
        <button
          type="button"
          onClick={() => setCollapsed((prev) => !prev)}
          aria-expanded={!collapsed}
          className="pointer-events-auto mb-1.5 inline-flex items-center gap-1.5 rounded-t-lg border border-b-0 border-[#1F2421]/15 bg-[#F4F2EE]/95 px-3 py-1 text-xs font-medium text-[#5A635E] shadow-sm transition-colors hover:text-[#1F2421] whitespace-nowrap cursor-pointer"
        >
          {collapsed ? (
            <>
              <ChevronUp className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Mostrar guía</span>
            </>
          ) : (
            <>
              <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Ocultar barra</span>
            </>
          )}
        </button>

        {/* Compact Horizontal Dock (Solid/RGBA surface — zero backdrop-filter over WebGL) */}
        {!collapsed && (
          <div
            role="region"
            aria-label="Navegación de cámara 3D y modo lectura"
            className="pointer-events-auto flex w-full flex-wrap items-center justify-between gap-2 rounded-xl border border-[#1F2421]/12 bg-[#F4F2EE]/95 px-3 py-2 shadow-md"
          >
            <div className="flex items-center gap-1 overflow-x-auto py-0.5">
              {STATIONS.map((station) => {
                const isActive = activeStation === station.id;
                return (
                  <button
                    key={station.id}
                    type="button"
                    onClick={() => onSelectStation(station.id)}
                    className={`min-h-[36px] rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      isActive
                        ? 'bg-[#2F483E] text-[#F4F2EE]'
                        : 'text-[#5A635E] hover:bg-[#EBE7DF] hover:text-[#1F2421]'
                    }`}
                  >
                    <span className="tabular-nums opacity-75 mr-1.5">{station.index}</span>
                    <span>{station.label}</span>
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={onToggleReadingMode}
              aria-pressed={readingMode}
              className={`min-h-[36px] inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                readingMode
                  ? 'border-[#2F483E] bg-[#2F483E]/10 text-[#2F483E]'
                  : 'border-[#1F2421]/15 bg-[#EBE7DF]/70 text-[#1F2421] hover:bg-[#EBE7DF]'
              }`}
            >
              {readingMode ? (
                <>
                  <Box className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Activar escena 3D</span>
                </>
              ) : (
                <>
                  <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Modo lectura (sin 3D)</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
