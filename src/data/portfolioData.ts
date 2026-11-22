export type StationId =
  | 'inicio'
  | 'sobre-mi'
  | 'servicios'
  | 'preguntas'
  | 'contacto';

export interface CameraStation {
  id: StationId;
  index: string;
  label: string;
  cameraPos: [number, number, number];
  target: [number, number, number];
}

export interface ServiceItem {
  id: string;
  number: string;
  title: string;
  duration: string;
  modality: string;
  fee: string;
  description: string;
  highlights: string[];
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export const PROFILE = {
  name: 'Elena Mendoza',
  title: 'Psicóloga Organizacional · Col. M-28491',
  approach:
    'Psicología Organizacional Positiva, Seguridad Psicológica y Liderazgo Consciente',
  experience: '11 años acompañando organizaciones y equipos',
  location: 'Madrid (Presencial en empresas) y Consultoría Internacional Online',
  portraitSrc: '/src/assets/images/psychologist_portrait_1795386471256.jpg',
  readingBackdropSrc: '/src/assets/images/sanctuary_reading_bg_1795386472259.jpg',
  calLink: 'https://cal.com/elena-mendoza-organizacional/diagnostico-inicial',
  email: 'consultoria@elenamendoza-org.es',
};

export const STATIONS: CameraStation[] = [
  {
    id: 'inicio',
    index: '01',
    label: 'Inicio',
    cameraPos: [3.6, 1.9, 5.2],
    target: [0.3, 1.0, -0.4],
  },
  {
    id: 'sobre-mi',
    index: '02',
    label: 'Sobre mí',
    cameraPos: [-2.6, 1.7, 4.0],
    target: [-0.7, 1.15, -0.5],
  },
  {
    id: 'servicios',
    index: '03',
    label: 'Servicios',
    cameraPos: [2.7, 1.45, 2.7],
    target: [1.05, 0.85, -0.45],
  },
  {
    id: 'preguntas',
    index: '04',
    label: 'Preguntas',
    cameraPos: [0.2, 2.2, 4.6],
    target: [-0.15, 0.95, -0.8],
  },
  {
    id: 'contacto',
    index: '05',
    label: 'Contacto',
    cameraPos: [-1.35, 1.5, 3.1],
    target: [0.25, 0.85, -0.2],
  },
];

export const CREDENTIALS = [
  'Máster en Psicología del Trabajo, de las Organizaciones y RR. HH. (UAM)',
  'Psicóloga Colegiada (Col. M-28491) · Especialista en Riesgos Psicosociales',
  'Certificada en Liderazgo Consciente, Seguridad Psicológica y Facilitación Sistémica',
  'Consultora en Cultura Corporativa, Gestión del Cambio y Prevención del Burnout',
];

export const SERVICES: ServiceItem[] = [
  {
    id: 'cultura',
    number: '01',
    title: 'Diagnóstico de Clima y Cultura',
    duration: 'Ciclo de 3 a 5 semanas',
    modality: 'Presencial en empresa y Online',
    fee: 'Propuesta a medida',
    description:
      'Evaluación rigurosa y confidencial del bienestar laboral, fricciones operativas, comunicación interna y factores psicosociales para tomar decisiones con datos reales.',
    highlights: [
      'Encuestas anónimas y entrevistas cualitativas',
      'Mapa de seguridad psicológica por áreas',
      'Plan de acción práctico con KPIs humanos',
    ],
  },
  {
    id: 'liderazgo',
    number: '02',
    title: 'Acompañamiento y Coaching a Líderes',
    duration: 'Sesiones de 60 minutos',
    modality: 'Individual · Presencial y Online',
    fee: '110 € / sesión',
    description:
      'Espacio confidencial para directivos, mandos intermedios y founders que desean liderar con claridad, gestionar conflictos sin desgaste y prevenir la sobrecarga.',
    highlights: [
      'Comunicación asertiva y feedback constructivo',
      'Toma de decisiones en entornos de cambio',
      'Equilibrio sostenible de carga y delegación',
    ],
  },
  {
    id: 'talleres',
    number: '03',
    title: 'Talleres de Bienestar y Prevención del Burnout',
    duration: 'Módulos de 90 a 180 min',
    modality: 'Equipos (8–30 pers.) · Híbrido',
    fee: 'Desde 480 € / taller',
    description:
      'Sesiones vivenciales y basadas en evidencia para dotar a los equipos de herramientas de regulación del estrés, desconexión digital y cooperación saludable.',
    highlights: [
      'Gestión de energía y atención en jornadas híbridas',
      'Prevención temprana del agotamiento laboral',
      'Acuerdos de equipo para trabajar sin urgencia crónica',
    ],
  },
  {
    id: 'talento',
    number: '04',
    title: 'Selección por Competencias y Onboarding',
    duration: 'Acompañamiento por proceso',
    modality: 'Online y Presencial',
    fee: 'Propuesta según alcance',
    description:
      'Diseño de entrevistas estructuradas, evaluación de ajuste cultural y programas de acogida que reducen la rotación temprana y cuidan la experiencia del candidato.',
    highlights: [
      'Matrices de competencias libres de sesgos',
      'Informes claros de potencial y encaje de equipo',
      'Diseño de los primeros 90 días de incorporación',
    ],
  },
];

export const FAQS: FaqItem[] = [
  {
    id: 'primera-reunion',
    question: '¿Cómo es la primera reunión de diagnóstico inicial?',
    answer:
      'Es una conversación de 45 minutos sin compromiso con el equipo de Dirección o Recursos Humanos. Revisamos vuestro contexto actual, qué retos estáis observando en los equipos (rotación, sobrecarga, cambios organizativos o liderazgo) y definimos si tiene sentido iniciar un diagnóstico o una intervención focalizada.',
  },
  {
    id: 'tamano-empresa',
    question: '¿Trabajas tanto con startups en crecimiento como con empresas consolidadas?',
    answer:
      'Sí. Adapto la metodología al tamaño y madurez de cada organización: desde equipos de 15 personas que necesitan estructurar sus primeros acuerdos de cultura, hasta departamentos de más de 200 profesionales en procesos de transformación o fusión.',
  },
  {
    id: 'confidencialidad-org',
    question: '¿Cómo se garantiza la confidencialidad en evaluaciones de clima y coaching?',
    answer:
      'La confianza es la base de cualquier intervención organizacional. Las respuestas de encuestas y entrevistas se agregan siempre de forma anónima, y los procesos individuales de acompañamiento a líderes están protegidos por secreto profesional bajo el Código Deontológico y el RGPD.',
  },
  {
    id: 'equipos-hibridos',
    question: '¿Los talleres y diagnósticos funcionan para equipos remotos o distribuidos?',
    answer:
      'Sí. Gran parte de mi trabajo se realiza con equipos híbridos o distribuidos en varios países, combinando dinámicas participativas en salas virtuales, encuestas asincrónicas y sesiones presenciales puntuales cuando el equipo se reúne.',
  },
  {
    id: 'presupuesto',
    question: '¿Cómo se estructuran los honorarios y plazos de un proyecto?',
    answer:
      'Tras la reunión inicial entrego una propuesta clara con alcance, fases, entregables y presupuesto cerrado en 48 horas. Puede contratarse por taller puntual, bonos mensuales de acompañamiento a líderes o proyecto integral de cultura.',
  },
];

export const AVAILABLE_SLOTS = [
  { day: 'Martes 24 Nov', times: ['09:30', '12:00', '16:30'] },
  { day: 'Miércoles 25 Nov', times: ['10:00', '15:30', '17:30'] },
  { day: 'Jueves 26 Nov', times: ['09:00', '11:30', '16:00'] },
];
