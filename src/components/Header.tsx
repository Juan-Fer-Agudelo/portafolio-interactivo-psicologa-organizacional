import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { PROFILE, STATIONS, StationId } from '../data/portfolioData';

interface HeaderProps {
  activeStation: StationId;
  onNavigate: (id: StationId) => void;
}

export function Header({ activeStation, onNavigate }: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleNav = (id: StationId) => {
    setMobileOpen(false);
    onNavigate(id);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-30 border-b border-[#1F2421]/10 bg-[#F4F2EE]/95">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-8 px-4 py-3.5 sm:px-6">
        {/* Zone 1: Single-line Brand Wordmark */}
        <a
          href="#inicio"
          onClick={(e) => {
            e.preventDefault();
            handleNav('inicio');
          }}
          className="font-display text-lg font-medium tracking-tight text-[#1F2421] whitespace-nowrap shrink-0"
        >
          {PROFILE.name}
        </a>

        {/* Zone 2: Concise Single-Line Navigation Links */}
        <nav
          aria-label="Navegación principal"
          className="hidden md:flex items-center gap-6 text-sm font-medium text-[#5A635E]"
        >
          {STATIONS.map((station) => {
            const isActive = activeStation === station.id;
            return (
              <a
                key={station.id}
                href={`#${station.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  handleNav(station.id);
                }}
                className={`whitespace-nowrap shrink-0 py-1 transition-colors duration-150 border-b-2 ${
                  isActive
                    ? 'border-[#2F483E] text-[#1F2421]'
                    : 'border-transparent hover:text-[#1F2421] hover:border-[#2F483E]/40'
                }`}
              >
                {station.label}
              </a>
            );
          })}
        </nav>

        {/* Zone 3: Single Primary Action + Mobile Drawer Toggle */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => handleNav('contacto')}
            className="hidden sm:inline-flex items-center justify-center rounded-lg bg-[#2F483E] px-4 py-2 text-sm font-medium text-[#F4F2EE] transition-colors duration-150 hover:bg-[#23372F] whitespace-nowrap shrink-0 cursor-pointer"
          >
            Agendar reunión
          </button>

          <button
            type="button"
            aria-label={mobileOpen ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((prev) => !prev)}
            className="inline-flex md:hidden h-11 w-11 items-center justify-center rounded-lg border border-[#1F2421]/15 bg-[#F4F2EE] text-[#1F2421] cursor-pointer"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileOpen && (
        <nav
          aria-label="Menú móvil"
          className="md:hidden border-t border-[#1F2421]/10 bg-[#F4F2EE] px-4 py-3"
        >
          <div className="flex flex-col gap-1">
            {STATIONS.map((station) => (
              <a
                key={station.id}
                href={`#${station.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  handleNav(station.id);
                }}
                className={`flex min-h-[44px] items-center rounded-lg px-3 text-sm font-medium transition-colors ${
                  activeStation === station.id
                    ? 'bg-[#EBE7DF] text-[#1F2421]'
                    : 'text-[#5A635E] hover:bg-[#EBE7DF]/60 hover:text-[#1F2421]'
                }`}
              >
                {station.label}
              </a>
            ))}
            <button
              type="button"
              onClick={() => handleNav('contacto')}
              className="mt-2 flex min-h-[44px] w-full items-center justify-center rounded-lg bg-[#2F483E] px-4 py-2.5 text-sm font-medium text-[#F4F2EE] cursor-pointer"
            >
              Agendar primera consulta
            </button>
          </div>
        </nav>
      )}
    </header>
  );
}
