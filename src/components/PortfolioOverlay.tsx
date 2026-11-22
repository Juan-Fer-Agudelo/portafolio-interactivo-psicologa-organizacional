import { useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  Calendar,
  Check,
  ChevronDown,
  ExternalLink,
  Mail,
  MapPin,
  ShieldCheck,
} from 'lucide-react';
import {
  AVAILABLE_SLOTS,
  CREDENTIALS,
  FAQS,
  PROFILE,
  SERVICES,
  StationId,
} from '../data/portfolioData';

interface PortfolioOverlayProps {
  readingMode: boolean;
  onToggleReadingMode: () => void;
  onNavigate: (id: StationId) => void;
}

export function PortfolioOverlay({
  readingMode,
  onToggleReadingMode,
  onNavigate,
}: PortfolioOverlayProps) {
  const [openFaqId, setOpenFaqId] = useState<string>(FAQS[0].id);
  const [selectedService, setSelectedService] = useState<string>(SERVICES[0].title);
  const [selectedModality, setSelectedModality] = useState<'Presencial (Empresa / Estudio)' | 'Online (Videollamada)'>('Presencial (Empresa / Estudio)');
  const [selectedDay, setSelectedDay] = useState(AVAILABLE_SLOTS[0].day);
  const [selectedTime, setSelectedTime] = useState(AVAILABLE_SLOTS[0].times[0]);
  const [slotConfirmed, setSlotConfirmed] = useState(false);

  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formMessage, setFormMessage] = useState('');
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formError, setFormError] = useState('');
  const [portraitFailed, setPortraitFailed] = useState(false);

  const handleBookService = (serviceTitle: string) => {
    setSelectedService(serviceTitle);
    setSlotConfirmed(false);
    onNavigate('contacto');
  };

  const handleConfirmSlot = () => {
    setSlotConfirmed(true);
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formEmail.trim()) {
      setFormError('Por favor, indica tu nombre y un correo electrónico de contacto.');
      return;
    }
    setFormError('');
    setFormSubmitted(true);
  };

  const activeDayObj =
    AVAILABLE_SLOTS.find((d) => d.day === selectedDay) ?? AVAILABLE_SLOTS[0];

  return (
    <main className="relative z-10 pointer-events-none">
      {/* SECTION 01: INICIO (HERO) */}
      <section
        id="inicio"
        aria-labelledby="hero-title"
        className="mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-4 pt-24 pb-28 sm:px-6"
      >
        <div className="pointer-events-auto max-w-xl rounded-2xl border border-[#1F2421]/10 bg-[#F4F2EE]/92 p-6 shadow-sm sm:p-9">
          <p className="text-xs font-medium tracking-wide text-[#4A6B5D]">
            {PROFILE.title}
          </p>

          <h1
            id="hero-title"
            className="mt-3 font-display text-4xl font-normal leading-[1.12] tracking-tight text-[#1F2421] sm:text-5xl"
          >
            Cultura organizacional sana, liderazgo cercano y equipos sostenibles.
          </h1>

          <p className="mt-4 text-base leading-relaxed text-[#5A635E]">
            {PROFILE.approach}. Acompaño a empresas, áreas de Personas y líderes
            a diagnosticar su clima laboral, prevenir el desgaste profesional y
            construir entornos donde trabajar con claridad y bienestar.
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => onNavigate('contacto')}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-[#2F483E] px-5 py-2.5 text-sm font-medium text-[#F4F2EE] transition-colors hover:bg-[#23372F] whitespace-nowrap cursor-pointer"
            >
              <span>Agendar reunión inicial</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>

            <button
              type="button"
              onClick={onToggleReadingMode}
              aria-pressed={readingMode}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-[#1F2421]/20 bg-[#EBE7DF] px-4 py-2.5 text-sm font-medium text-[#1F2421] transition-colors hover:bg-[#E2DDD2] whitespace-nowrap cursor-pointer"
            >
              <BookOpen className="h-4 w-4 text-[#2F483E]" aria-hidden="true" />
              <span>
                {readingMode ? 'Volver a vista 3D' : 'Modo lectura / Sin animaciones 3D'}
              </span>
            </button>
          </div>

          {/* Unboxed clean metadata strip */}
          <div className="mt-7 flex flex-wrap items-center gap-x-2.5 gap-y-1 border-t border-[#1F2421]/10 pt-5 text-xs text-[#5A635E]">
            <span>{PROFILE.experience}</span>
            <span aria-hidden="true">·</span>
            <span>{PROFILE.location}</span>
            <span aria-hidden="true">·</span>
            <span>Diagnóstico, coaching y talleres</span>
          </div>
        </div>
      </section>

      {/* SECTION 02: SOBRE MÍ */}
      <section
        id="sobre-mi"
        aria-labelledby="about-title"
        className="mx-auto flex min-h-[90vh] max-w-6xl items-center justify-end px-4 py-20 sm:px-6"
      >
        <div className="pointer-events-auto grid w-full max-w-4xl grid-cols-1 items-stretch gap-6 rounded-2xl border border-[#1F2421]/10 bg-[#F4F2EE]/94 p-6 shadow-sm sm:p-8 lg:grid-cols-12">
          {/* Portrait Column */}
          <div className="lg:col-span-5">
            {!portraitFailed ? (
              <img
                src={PROFILE.portraitSrc}
                alt="Retrato de Elena Mendoza, psicóloga organizacional, en su estudio"
                referrerPolicy="no-referrer"
                onError={() => setPortraitFailed(true)}
                className="h-72 w-full rounded-xl object-cover object-top lg:h-full"
              />
            ) : (
              <div className="flex h-72 w-full flex-col items-center justify-center rounded-xl bg-[#EBE7DF] p-6 text-center lg:h-full">
                <span className="font-display text-xl text-[#2F483E]">
                  {PROFILE.name}
                </span>
                <span className="mt-1 text-xs text-[#5A635E]">{PROFILE.title}</span>
              </div>
            )}
          </div>

          {/* Organizational Biography Column */}
          <div className="flex flex-col justify-between lg:col-span-7">
            <div>
              <p className="text-xs font-medium text-[#4A6B5D]">
                02. Sobre mí y enfoque organizacional
              </p>
              <h2
                id="about-title"
                className="mt-2 font-display text-3xl font-normal leading-tight text-[#1F2421]"
              >
                Rigor psicosocial al servicio de personas y resultados sostenibles.
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-[#5A635E] sm:text-base">
                Concibo la psicología organizacional como un puente real entre
                el cuidado de las personas y la salud del proyecto empresarial.
                Mi trabajo integra la evaluación psicosocial basada en evidencia
                con la facilitación sistémica y el desarrollo de liderazgo
                consciente.
              </p>
              <p className="mt-3 text-sm leading-relaxed text-[#5A635E] sm:text-base">
                Evito fórmulas genéricas: escucho la cultura particular de cada
                organización para diseñar intervenciones prácticas, medibles y
                respetuosas con el ritmo del equipo.
              </p>
            </div>

            <div className="mt-6 border-t border-[#1F2421]/10 pt-5">
              <h3 className="text-xs font-semibold tracking-wide text-[#1F2421]">
                Formación y acreditaciones
              </h3>
              <ul className="mt-3 space-y-2 text-sm text-[#5A635E]">
                {CREDENTIALS.map((cred) => (
                  <li key={cred} className="flex items-start gap-2.5">
                    <Check
                      className="mt-0.5 h-4 w-4 shrink-0 text-[#2F483E]"
                      aria-hidden="true"
                    />
                    <span>{cred}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 03: SERVICIOS Y MODALIDADES */}
      <section
        id="servicios"
        aria-labelledby="services-title"
        className="mx-auto flex min-h-[90vh] max-w-6xl flex-col justify-center px-4 py-20 sm:px-6"
      >
        <div className="pointer-events-auto max-w-2xl rounded-2xl border border-[#1F2421]/10 bg-[#F4F2EE]/94 p-6 shadow-sm sm:p-8">
          <p className="text-xs font-medium text-[#4A6B5D]">
            03. Servicios y modalidades
          </p>
          <h2
            id="services-title"
            className="mt-2 font-display text-3xl font-normal leading-tight text-[#1F2421]"
          >
            Intervenciones diseñadas para la realidad de tu equipo.
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-[#5A635E] sm:text-base">
            Cada programa se adapta al tamaño, cultura y etapa de tu empresa,
            tanto en formato presencial en oficinas como para equipos remotos e
            híbridos.
          </p>
        </div>

        <div className="pointer-events-auto mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
          {SERVICES.map((service) => (
            <article
              key={service.id}
              className="flex flex-col justify-between rounded-2xl border border-[#1F2421]/10 bg-[#F4F2EE]/94 p-6 shadow-sm"
            >
              <div>
                <div className="flex items-baseline justify-between gap-4">
                  <h3 className="font-display text-xl font-normal text-[#1F2421]">
                    <span className="tabular-nums text-sm text-[#4A6B5D] mr-2">
                      {service.number}.
                    </span>
                    {service.title}
                  </h3>
                </div>

                {/* Unboxed metadata with typographic separators */}
                <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[#5A635E]">
                  <span className="tabular-nums">{service.duration}</span>
                  <span aria-hidden="true">·</span>
                  <span>{service.modality}</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-medium text-[#1F2421] tabular-nums">
                    {service.fee}
                  </span>
                </div>

                <p className="mt-4 text-sm leading-relaxed text-[#5A635E]">
                  {service.description}
                </p>

                <ul className="mt-4 space-y-1.5 text-sm text-[#1F2421]/85">
                  {service.highlights.map((item) => (
                    <li key={item} className="flex items-center gap-2">
                      <span
                        className="h-1 w-1 rounded-full bg-[#2F483E]"
                        aria-hidden="true"
                      />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-6 border-t border-[#1F2421]/10 pt-4">
                <button
                  type="button"
                  onClick={() => handleBookService(service.title)}
                  className="inline-flex min-h-[40px] items-center gap-2 text-sm font-medium text-[#2F483E] transition-colors hover:text-[#1F2421] cursor-pointer"
                >
                  <span>Solicitar propuesta o reunión</span>
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* SECTION 04: PREGUNTAS FRECUENTES */}
      <section
        id="preguntas"
        aria-labelledby="faq-title"
        className="mx-auto flex min-h-[85vh] max-w-6xl items-center justify-center px-4 py-20 sm:px-6"
      >
        <div className="pointer-events-auto w-full max-w-3xl rounded-2xl border border-[#1F2421]/10 bg-[#F4F2EE]/95 p-6 shadow-sm sm:p-9">
          <p className="text-xs font-medium text-[#4A6B5D]">
            04. Recursos y preguntas frecuentes
          </p>
          <h2
            id="faq-title"
            className="mt-2 font-display text-3xl font-normal leading-tight text-[#1F2421]"
          >
            Dudas habituales sobre consultoría y procesos de equipo.
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-[#5A635E] sm:text-base">
            Aquí encontrarás respuestas claras sobre cómo iniciamos un
            diagnóstico, confidencialidad de datos y formatos para equipos
            híbridos.
          </p>

          <div className="mt-6 divide-y divide-[#1F2421]/10 border-t border-b border-[#1F2421]/10">
            {FAQS.map((faq) => {
              const isOpen = openFaqId === faq.id;
              return (
                <div key={faq.id} className="py-1">
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={`faq-panel-${faq.id}`}
                    onClick={() => setOpenFaqId(isOpen ? '' : faq.id)}
                    className="flex min-h-[52px] w-full items-center justify-between gap-4 py-3 text-left text-sm font-medium text-[#1F2421] sm:text-base cursor-pointer"
                  >
                    <span>{faq.question}</span>
                    <ChevronDown
                      className={`h-4 w-4 shrink-0 text-[#5A635E] transition-transform duration-150 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                      aria-hidden="true"
                    />
                  </button>
                  {isOpen && (
                    <div
                      id={`faq-panel-${faq.id}`}
                      className="pb-4 pr-6 text-sm leading-relaxed text-[#5A635E]"
                    >
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SECTION 05: CONTACTO Y AGENDAMIENTO */}
      <section
        id="contacto"
        aria-labelledby="contact-title"
        className="mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-4 pt-20 pb-32 sm:px-6"
      >
        <div className="pointer-events-auto grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Left: Direct Agenda / Cal.com Slot Picker */}
          <div className="flex flex-col justify-between rounded-2xl border border-[#1F2421]/10 bg-[#F4F2EE]/95 p-6 shadow-sm sm:p-8 lg:col-span-6">
            <div>
              <p className="text-xs font-medium text-[#4A6B5D]">
                05. Agenda online directa
              </p>
              <h2
                id="contact-title"
                className="mt-2 font-display text-3xl font-normal leading-tight text-[#1F2421]"
              >
                Agenda una reunión exploratoria.
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-[#5A635E]">
                Elige modalidad, servicio y un horario disponible de 45 min, o
                abre el calendario completo en Cal.com.
              </p>

              {/* Modality Switch */}
              <div className="mt-5">
                <span className="block text-xs font-medium text-[#1F2421]">
                  Modalidad preferida
                </span>
                <div className="mt-2 grid grid-cols-2 gap-2 rounded-lg bg-[#EBE7DF] p-1">
                  {(['Presencial (Empresa / Estudio)', 'Online (Videollamada)'] as const).map(
                    (mod) => (
                      <button
                        key={mod}
                        type="button"
                        onClick={() => {
                          setSelectedModality(mod);
                          setSlotConfirmed(false);
                        }}
                        className={`min-h-[40px] rounded-md px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                          selectedModality === mod
                            ? 'bg-[#F4F2EE] text-[#1F2421] shadow-sm'
                            : 'text-[#5A635E] hover:text-[#1F2421]'
                        }`}
                      >
                        {mod}
                      </button>
                    ),
                  )}
                </div>
              </div>

              {/* Service Selector */}
              <div className="mt-4">
                <label
                  htmlFor="booking-service"
                  className="block text-xs font-medium text-[#1F2421]"
                >
                  Área de intervención
                </label>
                <select
                  id="booking-service"
                  value={selectedService}
                  onChange={(e) => {
                    setSelectedService(e.target.value);
                    setSlotConfirmed(false);
                  }}
                  className="mt-1.5 min-h-[44px] w-full rounded-lg border border-[#1F2421]/15 bg-white px-3 py-2 text-sm text-[#1F2421]"
                >
                  {SERVICES.map((s) => (
                    <option key={s.id} value={s.title}>
                      {s.title} ({s.duration} · {s.fee})
                    </option>
                  ))}
                </select>
              </div>

              {/* Day & Time Picker */}
              <div className="mt-4">
                <span className="block text-xs font-medium text-[#1F2421]">
                  Próximos huecos disponibles
                </span>
                <div className="mt-2 flex flex-wrap gap-2">
                  {AVAILABLE_SLOTS.map((slot) => (
                    <button
                      key={slot.day}
                      type="button"
                      onClick={() => {
                        setSelectedDay(slot.day);
                        setSelectedTime(slot.times[0]);
                        setSlotConfirmed(false);
                      }}
                      className={`min-h-[38px] rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                        selectedDay === slot.day
                          ? 'border-[#2F483E] bg-[#2F483E] text-[#F4F2EE]'
                          : 'border-[#1F2421]/15 bg-white text-[#1F2421] hover:bg-[#EBE7DF]'
                      }`}
                    >
                      {slot.day}
                    </button>
                  ))}
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  {activeDayObj.times.map((time) => (
                    <button
                      key={time}
                      type="button"
                      onClick={() => {
                        setSelectedTime(time);
                        setSlotConfirmed(false);
                      }}
                      className={`min-h-[38px] rounded-lg border px-3.5 py-1.5 text-xs font-medium tabular-nums transition-colors cursor-pointer ${
                        selectedTime === time
                          ? 'border-[#2F483E] bg-[#2F483E]/12 text-[#2F483E]'
                          : 'border-[#1F2421]/15 bg-white text-[#5A635E] hover:text-[#1F2421]'
                      }`}
                    >
                      {time} h
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-3 border-t border-[#1F2421]/10 pt-5">
              {slotConfirmed ? (
                <div
                  role="status"
                  className="rounded-lg border border-[#2F483E]/25 bg-[#2F483E]/8 p-3.5 text-sm text-[#1F2421]"
                >
                  <p className="font-medium text-[#2F483E]">
                    Pre-reserva preparada: {selectedDay} a las {selectedTime} h
                  </p>
                  <p className="mt-1 text-xs text-[#5A635E]">
                    {selectedService} · {selectedModality}. Completa tus datos en el
                    formulario o finaliza en Cal.com.
                  </p>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleConfirmSlot}
                  className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg bg-[#2F483E] px-5 py-2.5 text-sm font-medium text-[#F4F2EE] transition-colors hover:bg-[#23372F] cursor-pointer"
                >
                  <Calendar className="h-4 w-4" aria-hidden="true" />
                  <span>
                    Seleccionar {selectedDay} · {selectedTime} h
                  </span>
                </button>
              )}

              <a
                href={PROFILE.calLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg border border-[#1F2421]/20 bg-white px-4 py-2.5 text-sm font-medium text-[#1F2421] transition-colors hover:bg-[#EBE7DF]"
              >
                <span>Abrir agenda externa (Cal.com)</span>
                <ExternalLink className="h-4 w-4 text-[#5A635E]" aria-hidden="true" />
              </a>
            </div>
          </div>

          {/* Right: Simple Non-Clinical Contact Form */}
          <div className="flex flex-col justify-between rounded-2xl border border-[#1F2421]/10 bg-[#F4F2EE]/95 p-6 shadow-sm sm:p-8 lg:col-span-6">
            <div>
              <h3 className="font-display text-2xl font-normal text-[#1F2421]">
                Solicita información para tu organización
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[#5A635E]">
                Responderé personalmente en menos de 24 horas laborables.
              </p>

              <div className="mt-4 flex items-start gap-2.5 rounded-lg bg-[#EBE7DF] p-3 text-xs leading-relaxed text-[#5A635E]">
                <ShieldCheck
                  className="mt-0.5 h-4 w-4 shrink-0 text-[#2F483E]"
                  aria-hidden="true"
                />
                <span>
                  Por confidencialidad, este formulario es solo para coordinar
                  reuniones o solicitar propuestas. No incluyas datos personales
                  ni información sensible de integrantes del equipo.
                </span>
              </div>

              {formSubmitted ? (
                <div
                  role="status"
                  className="mt-6 rounded-xl border border-[#2F483E]/25 bg-white p-6"
                >
                  <div className="flex items-center gap-2 text-[#2F483E]">
                    <Check className="h-5 w-5" aria-hidden="true" />
                    <h4 className="font-display text-lg font-medium">
                      Solicitud recibida
                    </h4>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-[#5A635E]">
                    Gracias, {formName}. Te responderé al correo{' '}
                    <span className="font-medium text-[#1F2421]">{formEmail}</span>{' '}
                    con disponibilidad y propuesta inicial para{' '}
                    <span className="font-medium text-[#1F2421]">
                      {selectedService} ({selectedModality})
                    </span>
                    .
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setFormSubmitted(false);
                      setFormMessage('');
                    }}
                    className="mt-4 min-h-[40px] rounded-lg border border-[#1F2421]/20 px-4 py-2 text-xs font-medium text-[#1F2421] hover:bg-[#EBE7DF] cursor-pointer"
                  >
                    Enviar otra consulta
                  </button>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="mt-5 space-y-4" noValidate>
                  <div>
                    <label
                      htmlFor="contact-name"
                      className="block text-xs font-medium text-[#1F2421]"
                    >
                      Nombre y organización / cargo
                    </label>
                    <input
                      id="contact-name"
                      type="text"
                      required
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="Ej. Laura García · People Lead"
                      className="mt-1.5 min-h-[44px] w-full rounded-lg border border-[#1F2421]/15 bg-white px-3.5 py-2 text-sm text-[#1F2421] placeholder:text-[#5A635E]/60"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="contact-email"
                      className="block text-xs font-medium text-[#1F2421]"
                    >
                      Correo electrónico profesional
                    </label>
                    <input
                      id="contact-email"
                      type="email"
                      required
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      placeholder="nombre@empresa.com"
                      className="mt-1.5 min-h-[44px] w-full rounded-lg border border-[#1F2421]/15 bg-white px-3.5 py-2 text-sm text-[#1F2421] placeholder:text-[#5A635E]/60"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="contact-message"
                      className="block text-xs font-medium text-[#1F2421]"
                    >
                      Tamaño del equipo, contexto general o preferencia horaria (opcional)
                    </label>
                    <textarea
                      id="contact-message"
                      rows={3}
                      value={formMessage}
                      onChange={(e) => setFormMessage(e.target.value)}
                      placeholder="Ej. Equipo híbrido de 40 personas; nos interesa evaluar clima y talleres para mandos."
                      className="mt-1.5 w-full rounded-lg border border-[#1F2421]/15 bg-white px-3.5 py-2.5 text-sm text-[#1F2421] placeholder:text-[#5A635E]/60"
                    />
                  </div>

                  {formError && (
                    <p role="alert" className="text-xs font-medium text-[#9B2C2C]">
                      {formError}
                    </p>
                  )}

                  <button
                    type="submit"
                    className="flex min-h-[44px] w-full items-center justify-center rounded-lg bg-[#2F483E] px-5 py-2.5 text-sm font-medium text-[#F4F2EE] transition-colors hover:bg-[#23372F] cursor-pointer"
                  >
                    Solicitar reunión o propuesta
                  </button>
                </form>
              )}
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-[#1F2421]/10 pt-4 text-xs text-[#5A635E]">
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-[#2F483E]" aria-hidden="true" />
                C/ Zurbano, Chamberí · Madrid
              </span>
              <a
                href={`mailto:${PROFILE.email}`}
                className="inline-flex items-center gap-1.5 hover:text-[#1F2421]"
              >
                <Mail className="h-3.5 w-3.5 text-[#2F483E]" aria-hidden="true" />
                {PROFILE.email}
              </a>
            </div>
          </div>
        </div>

        {/* Clean Footer */}
        <footer className="pointer-events-auto mt-14 flex flex-wrap items-center justify-between gap-4 border-t border-[#1F2421]/10 pt-6 text-xs text-[#5A635E]">
          <p>
            © {new Date().getFullYear()} {PROFILE.name} · {PROFILE.title}
          </p>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={onToggleReadingMode}
              className="underline underline-offset-4 hover:text-[#1F2421] cursor-pointer"
            >
              {readingMode ? 'Activar escena 3D' : 'Cambiar a modo lectura estático'}
            </button>
          </div>
        </footer>
      </section>
    </main>
  );
}
