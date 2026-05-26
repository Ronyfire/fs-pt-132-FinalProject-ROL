import "../styles/components/rakki.css";

/* ─── Mapa de tamaños ─── */
const SIZE_MAP = {
  sm: "rakki-sm",
  md: "rakki-md",
  lg: "rakki-lg",
  xl: "rakki-xl",
};

const SIZE_PX = { sm: 80, md: 120, lg: 180, xl: 250 };

/* ─── Silueta base — sin brazos/rostro, van por pose ─── */
const BaseRakki = ({ children }) => (
  <g>
    {/* Cola (detrás del cuerpo) */}
    <path
      d="M 118 155 Q 155 168 155 142 Q 155 130 145 132"
      fill="none"
      stroke="#1a1a2e"
      strokeWidth={5}
      strokeLinecap="round"
    />

    {/* Piernas */}
    <ellipse
      cx="88" cy="172" rx="7" ry="4"
      fill="#FFE4D0" stroke="#1a1a2e" strokeWidth="2.5"
    />
    <ellipse
      cx="112" cy="172" rx="7" ry="4"
      fill="#FFE4D0" stroke="#1a1a2e" strokeWidth="2.5"
    />

    {/* Cuerpo */}
    <ellipse
      cx="100" cy="148" rx="28" ry="24"
      fill="#FFE4D0" stroke="#1a1a2e" strokeWidth="2.5"
    />

    {/* Orejas externas */}
    <polygon
      points="67,50 55,22 85,42"
      fill="#FFE4D0" stroke="#1a1a2e"
      strokeWidth="2.5" strokeLinejoin="round"
    />
    <polygon
      points="133,50 145,22 115,42"
      fill="#FFE4D0" stroke="#1a1a2e"
      strokeWidth="2.5" strokeLinejoin="round"
    />

    {/* Orejas internas */}
    <polygon points="70,48 60,28 82,43" fill="#F5A0C0" />
    <polygon points="130,48 140,28 118,43" fill="#F5A0C0" />

    {/* Cabeza */}
    <ellipse
      cx="100" cy="72" rx="30" ry="28"
      fill="#FFE4D0" stroke="#1a1a2e" strokeWidth="2.5"
    />

    {/* Rubor */}
    <ellipse cx="77" cy="76" rx="5" ry="3" fill="rgba(245,160,192,0.35)" />
    <ellipse cx="123" cy="76" rx="5" ry="3" fill="rgba(245,160,192,0.35)" />

    {/* Nariz */}
    <ellipse
      cx="100" cy="80" rx="3" ry="2"
      fill="#F5A0C0" stroke="#1a1a2e" strokeWidth="1"
    />

    {children}
  </g>
);

/* ─── Sets de ojos reutilizables ─── */

/** Ojos redondos abiertos con pupila + brillo. */
const NormalEyes = () => (
  <g>
    <ellipse cx="85" cy="66" rx="5" ry="6" fill="#FFF" stroke="#1a1a2e" strokeWidth="2" />
    <ellipse cx="115" cy="66" rx="5" ry="6" fill="#FFF" stroke="#1a1a2e" strokeWidth="2" />
    <circle cx="85" cy="67" r="2.5" fill="#1a1a2e" />
    <circle cx="115" cy="67" r="2.5" fill="#1a1a2e" />
    <circle cx="83.5" cy="65" r="1.2" fill="#FFF" />
    <circle cx="113.5" cy="65" r="1.2" fill="#FFF" />
  </g>
);

/** Ojos felices cerrados en arco. */
const HappyEyes = () => (
  <g>
    <path d="M 80 66 Q 85 58 90 66" fill="none" stroke="#1a1a2e" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M 110 66 Q 115 58 120 66" fill="none" stroke="#1a1a2e" strokeWidth="2.5" strokeLinecap="round" />
  </g>
);

/* ─── Poses ─── */

const Waving = () => (
  <BaseRakki>
    {/* Brazo izquierdo — levantado saludando */}
    <path d="M 72 142 Q 50 120 46 98" fill="none" stroke="#1a1a2e" strokeWidth="3" strokeLinecap="round" />
    <circle cx="46" cy="95" r="6" fill="#FFE4D0" stroke="#1a1a2e" strokeWidth="2.5" />
    <path d="M 34 80 Q 30 72 36 66" fill="none" stroke="#1a1a2e" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
    <path d="M 28 95 Q 24 87 30 81" fill="none" stroke="#1a1a2e" strokeWidth="2" strokeLinecap="round" opacity="0.5" />

    {/* Brazo derecho — al costado */}
    <path d="M 128 142 Q 145 150 150 162" fill="none" stroke="#1a1a2e" strokeWidth="3" strokeLinecap="round" />
    <circle cx="150" cy="165" r="5" fill="#FFE4D0" stroke="#1a1a2e" strokeWidth="2.5" />

    <HappyEyes />
    <path d="M 88 84 Q 100 94 112 84" fill="none" stroke="#1a1a2e" strokeWidth="2.5" strokeLinecap="round" />
  </BaseRakki>
);

const Playing = () => (
  <BaseRakki>
    {/* Brazos sosteniendo el control */}
    <path d="M 72 140 Q 60 150 72 156" fill="none" stroke="#1a1a2e" strokeWidth="3" strokeLinecap="round" />
    <circle cx="74" cy="158" r="5" fill="#FFE4D0" stroke="#1a1a2e" strokeWidth="2.5" />
    <path d="M 128 140 Q 140 150 128 156" fill="none" stroke="#1a1a2e" strokeWidth="3" strokeLinecap="round" />
    <circle cx="126" cy="158" r="5" fill="#FFE4D0" stroke="#1a1a2e" strokeWidth="2.5" />

    {/* Control de juegos */}
    <rect x="82" y="152" width="36" height="16" rx="5" fill="#1a1a2e" stroke="#1a1a2e" strokeWidth="2" />
    <circle cx="92" cy="160" r="2.5" fill="none" stroke="#1a1a2e" strokeWidth="1.5" />
    <circle cx="108" cy="160" r="2.5" fill="none" stroke="#1a1a2e" strokeWidth="1.5" />
    <circle cx="92" cy="155" r="1.5" fill="#F5A0C0" />
    <circle cx="108" cy="155" r="1.5" fill="var(--green, #7DD750)" />

    <NormalEyes />
    {/* Boca feliz con lengua afuera */}
    <path d="M 90 84 Q 100 90 110 84" fill="none" stroke="#1a1a2e" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M 96 86 Q 100 92 104 86" fill="#F5A0C0" stroke="#1a1a2e" strokeWidth="1.5" strokeLinecap="round" />
  </BaseRakki>
);

const Tablet = () => (
  <BaseRakki>
    {/* Brazos sosteniendo la tablet */}
    <path d="M 72 138 Q 65 150 78 148" fill="none" stroke="#1a1a2e" strokeWidth="3" strokeLinecap="round" />
    <circle cx="80" cy="148" r="5" fill="#FFE4D0" stroke="#1a1a2e" strokeWidth="2.5" />
    <path d="M 128 138 Q 135 150 122 148" fill="none" stroke="#1a1a2e" strokeWidth="3" strokeLinecap="round" />
    <circle cx="120" cy="148" r="5" fill="#FFE4D0" stroke="#1a1a2e" strokeWidth="2.5" />

    {/* Tablet */}
    <rect x="82" y="140" width="36" height="28" rx="3" fill="#FFF" stroke="#1a1a2e" strokeWidth="2" />
    <rect x="86" y="144" width="28" height="20" rx="1" fill="#1a1a2e" />
    <circle cx="100" cy="164" r="1.5" fill="currentColor" />

    {/* Ojos mirando hacia abajo */}
    <ellipse cx="85" cy="66" rx="5" ry="6" fill="#FFF" stroke="#1a1a2e" strokeWidth="2" />
    <ellipse cx="115" cy="66" rx="5" ry="6" fill="#FFF" stroke="#1a1a2e" strokeWidth="2" />
    <circle cx="85" cy="68" r="2.5" fill="#1a1a2e" />
    <circle cx="115" cy="68" r="2.5" fill="#1a1a2e" />
    <circle cx="83.5" cy="66" r="1.2" fill="#FFF" />
    <circle cx="113.5" cy="66" r="1.2" fill="#FFF" />

    <path d="M 94 82 Q 100 86 106 82" fill="none" stroke="#1a1a2e" strokeWidth="2" strokeLinecap="round" />
  </BaseRakki>
);

const Confused = () => (
  <BaseRakki>
    {/* Brazo derecho — mano en la barbilla */}
    <path d="M 128 140 Q 125 148 115 144" fill="none" stroke="#1a1a2e" strokeWidth="3" strokeLinecap="round" />
    <circle cx="113" cy="143" r="5" fill="#FFE4D0" stroke="#1a1a2e" strokeWidth="2.5" />

    {/* Brazo izquierdo — al costado */}
    <path d="M 72 142 Q 55 150 52 162" fill="none" stroke="#1a1a2e" strokeWidth="3" strokeLinecap="round" />
    <circle cx="52" cy="165" r="5" fill="#FFE4D0" stroke="#1a1a2e" strokeWidth="2.5" />

    {/* Ojos disparejos — uno normal, otro entrecerrado */}
    <ellipse cx="85" cy="65" rx="5" ry="6" fill="#FFF" stroke="#1a1a2e" strokeWidth="2" />
    <circle cx="85" cy="66" r="2.5" fill="#1a1a2e" />
    <circle cx="83.5" cy="64" r="1.2" fill="#FFF" />

    <path d="M 110 63 L 120 63" fill="none" stroke="#1a1a2e" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M 110 69 L 120 69" fill="none" stroke="#1a1a2e" strokeWidth="2.5" strokeLinecap="round" />

    {/* Boca ondulada de confusión */}
    <path d="M 88 84 Q 92 80 96 84 Q 100 88 104 84 Q 108 80 112 84" fill="none" stroke="#1a1a2e" strokeWidth="2.5" strokeLinecap="round" />

    {/* Signos de pregunta */}
    <text x="100" y="28" textAnchor="middle" fontSize="18" fontWeight="bold" fill="#F5A0C0">?</text>
    <text x="120" y="18" textAnchor="middle" fontSize="13" fontWeight="bold" fill="#F5A0C0">?</text>
    <text x="80" y="20" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#F5A0C0">?</text>
  </BaseRakki>
);

const Scared = () => (
  <BaseRakki>
    {/* Brazos arriba en rendición */}
    <path d="M 72 140 Q 55 115 50 100" fill="none" stroke="#1a1a2e" strokeWidth="3" strokeLinecap="round" />
    <circle cx="50" cy="97" r="6" fill="#FFE4D0" stroke="#1a1a2e" strokeWidth="2.5" />
    <path d="M 128 140 Q 145 115 150 100" fill="none" stroke="#1a1a2e" strokeWidth="3" strokeLinecap="round" />
    <circle cx="150" cy="97" r="6" fill="#FFE4D0" stroke="#1a1a2e" strokeWidth="2.5" />

    {/* Ojos muy abiertos de terror */}
    <ellipse cx="85" cy="65" rx="8" ry="9" fill="#FFF" stroke="#1a1a2e" strokeWidth="2" />
    <ellipse cx="115" cy="65" rx="8" ry="9" fill="#FFF" stroke="#1a1a2e" strokeWidth="2" />
    <circle cx="85" cy="66" r="3" fill="#1a1a2e" />
    <circle cx="115" cy="66" r="3" fill="#1a1a2e" />
    <circle cx="82" cy="63" r="1.5" fill="#FFF" />
    <circle cx="112" cy="63" r="1.5" fill="#FFF" />

    {/* Boca pequeña en 'o' */}
    <ellipse cx="100" cy="86" rx="4" ry="3" fill="#1a1a2e" stroke="#1a1a2e" strokeWidth="1.5" />

    {/* Gotas de sudor */}
    <path d="M 65 50 Q 63 55 65 60 Q 67 55 65 50" fill="#7DD750" />
    <path d="M 135 55 Q 133 60 135 65 Q 137 60 135 55" fill="#7DD750" />

    {/* Líneas de temblor */}
    <line x1="35" y1="120" x2="25" y2="115" stroke="#1a1a2e" strokeWidth="1.5" opacity="0.4" />
    <line x1="165" y1="120" x2="175" y2="115" stroke="#1a1a2e" strokeWidth="1.5" opacity="0.4" />
    <line x1="40" y1="145" x2="30" y2="145" stroke="#1a1a2e" strokeWidth="1.5" opacity="0.4" />
    <line x1="160" y1="145" x2="170" y2="145" stroke="#1a1a2e" strokeWidth="1.5" opacity="0.4" />
  </BaseRakki>
);

const Spray = () => (
  <BaseRakki>
    {/* Brazo izquierdo — sosteniendo spray */}
    <path d="M 72 140 Q 60 145 65 155" fill="none" stroke="#1a1a2e" strokeWidth="3" strokeLinecap="round" />
    <circle cx="67" cy="157" r="5" fill="#FFE4D0" stroke="#1a1a2e" strokeWidth="2.5" />

    {/* Brazo derecho — estabilizando */}
    <path d="M 128 138 Q 140 148 130 158" fill="none" stroke="#1a1a2e" strokeWidth="3" strokeLinecap="round" />
    <circle cx="128" cy="160" r="5" fill="#FFE4D0" stroke="#1a1a2e" strokeWidth="2.5" />

    {/* Lata de spray */}
    <rect x="72" y="155" width="16" height="22" rx="3" fill="#F5A0C0" stroke="#1a1a2e" strokeWidth="2" />
    <rect x="76" y="153" width="8" height="4" rx="1" fill="currentColor" />
    <circle cx="80" cy="166" r="3" fill="#FFF" opacity="0.4" />

    {/* Líneas de spray */}
    <line x1="88" y1="162" x2="98" y2="158" stroke="#1a1a2e" strokeWidth="1.5" strokeLinecap="round" opacity="0.55" />
    <line x1="88" y1="165" x2="100" y2="166" stroke="#1a1a2e" strokeWidth="1.5" strokeLinecap="round" opacity="0.55" />
    <line x1="88" y1="168" x2="97" y2="174" stroke="#1a1a2e" strokeWidth="1.5" strokeLinecap="round" opacity="0.55" />

    <NormalEyes />
    {/* Boca recta y decidida */}
    <path d="M 92 84 L 108 84" fill="none" stroke="#1a1a2e" strokeWidth="2.5" strokeLinecap="round" />

    {/* Gafas protectoras en la cabeza */}
    <rect x="80" y="42" width="40" height="10" rx="5" fill="#F5A0C0" stroke="#1a1a2e" strokeWidth="2" />
    <line x1="100" y1="42" x2="100" y2="52" stroke="#1a1a2e" strokeWidth="2" />
  </BaseRakki>
);

const Celebrating = () => (
  <BaseRakki>
    {/* Brazos arriba */}
    <path d="M 72 140 Q 55 110 60 90" fill="none" stroke="#1a1a2e" strokeWidth="3" strokeLinecap="round" />
    <circle cx="60" cy="87" r="6" fill="#FFE4D0" stroke="#1a1a2e" strokeWidth="2.5" />
    <path d="M 128 140 Q 145 110 140 90" fill="none" stroke="#1a1a2e" strokeWidth="3" strokeLinecap="round" />
    <circle cx="140" cy="87" r="6" fill="#FFE4D0" stroke="#1a1a2e" strokeWidth="2.5" />

    {/* Ojos de estrella */}
    <text x="85" y="70" textAnchor="middle" fontSize={15} fill="#FFD700">★</text>
    <text x="115" y="70" textAnchor="middle" fontSize={15} fill="#FFD700">★</text>

    {/* Boca abierta riendo */}
    <path d="M 86 82 Q 100 96 114 82 Z" fill="#1a1a2e" stroke="#1a1a2e" strokeWidth="2" strokeLinejoin="round" />
    <path d="M 95 86 L 105 86" fill="none" stroke="#FFF" strokeWidth="1.5" strokeLinecap="round" />

    {/* Confeti */}
    <circle cx="30" cy="50" r="3" fill="#FFD700" />
    <circle cx="170" cy="40" r="2.5" fill="#F5A0C0" />
    <circle cx="45" cy="30" r="2" fill="var(--green, #7DD750)" />
    <circle cx="155" cy="55" r="3" fill="#FFD700" />
    <circle cx="40" cy="100" r="2" fill="#FFD700" />
    <circle cx="160" cy="105" r="2" fill="#F5A0C0" />

    <rect x="25" y="75" width="3" height="7" rx="1" fill="#F5A0C0" transform="rotate(30 26 78)" />
    <rect x="168" y="80" width="3" height="7" rx="1" fill="var(--green, #7DD750)" transform="rotate(-20 169 83)" />
  </BaseRakki>
);

const Searching = () => (
  <BaseRakki>
    {/* Brazo izquierdo — mano sobre ojos, mirando a lo lejos */}
    <path d="M 72 138 Q 50 118 58 98" fill="none" stroke="#1a1a2e" strokeWidth="3" strokeLinecap="round" />
    <circle cx="60" cy="96" r="5" fill="#FFE4D0" stroke="#1a1a2e" strokeWidth="2.5" />

    {/* Brazo derecho — al costado */}
    <path d="M 128 140 Q 148 148 150 160" fill="none" stroke="#1a1a2e" strokeWidth="3" strokeLinecap="round" />
    <circle cx="150" cy="163" r="5" fill="#FFE4D0" stroke="#1a1a2e" strokeWidth="2.5" />

    {/* Ojo izquierdo medio oculto — asomo de ojo */}
    <path d="M 80 64 Q 85 60 90 64" fill="none" stroke="#1a1a2e" strokeWidth="2" strokeLinecap="round" opacity="0.5" />

    {/* Ojo derecho — entrecerrado */}
    <path d="M 110 63 L 120 63" fill="none" stroke="#1a1a2e" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M 110 69 L 120 69" fill="none" stroke="#1a1a2e" strokeWidth="2.5" strokeLinecap="round" />

    <path d="M 94 82 Q 100 86 106 82" fill="none" stroke="#1a1a2e" strokeWidth="2" strokeLinecap="round" />

    {/* Icono de lupa pequeño */}
    <circle cx="170" cy="55" r="7" fill="none" stroke="#1a1a2e" strokeWidth="2.5" opacity="0.45" />
    <line x1="175" y1="60" x2="182" y2="67" stroke="#1a1a2e" strokeWidth="3" strokeLinecap="round" opacity="0.45" />
  </BaseRakki>
);

const Pointing = () => (
  <BaseRakki>
    {/* Brazo izquierdo — señalando al costado */}
    <path d="M 72 140 Q 50 136 40 130" fill="none" stroke="#1a1a2e" strokeWidth="3" strokeLinecap="round" />
    <circle cx="38" cy="129" r="5" fill="#FFE4D0" stroke="#1a1a2e" strokeWidth="2.5" />
    <path d="M 33 129 L 22 126 L 33 133 Z" fill="#FFE4D0" stroke="#1a1a2e" strokeWidth="2" strokeLinejoin="round" />

    {/* Brazo derecho — en la cadera */}
    <path d="M 128 140 Q 145 138 142 155" fill="none" stroke="#1a1a2e" strokeWidth="3" strokeLinecap="round" />
    <circle cx="141" cy="158" r="5" fill="#FFE4D0" stroke="#1a1a2e" strokeWidth="2.5" />

    {/* Ojo izquierdo — guiño */}
    <path d="M 80 66 Q 85 58 90 66" fill="none" stroke="#1a1a2e" strokeWidth="2.5" strokeLinecap="round" />

    {/* Ojo derecho — abierto */}
    <ellipse cx="115" cy="66" rx="5" ry="6" fill="#FFF" stroke="#1a1a2e" strokeWidth="2" />
    <circle cx="115" cy="67" r="2.5" fill="#1a1a2e" />
    <circle cx="113.5" cy="65" r="1.2" fill="#FFF" />

    {/* Sonrisa pícara */}
    <path d="M 92 84 Q 100 90 112 82" fill="none" stroke="#1a1a2e" strokeWidth="2.5" strokeLinecap="round" />

    {/* Brillito */}
    <text x="28" y="115" textAnchor="middle" fontSize={12} fill="#FFD700">✦</text>
  </BaseRakki>
);

/* ─── Mapa de poses ─── */
const POSE_MAP = {
  waving:      Waving,
  playing:     Playing,
  tablet:      Tablet,
  confused:    Confused,
  scared:      Scared,
  spray:       Spray,
  celebrating: Celebrating,
  searching:   Searching,
  pointing:    Pointing,
};

/* ─── Componente principal ─── */
const Rakki = ({ pose = "waving", size = "md", className = "", text }) => {
  const sizeClass = SIZE_MAP[size] || SIZE_MAP.md;
  const PoseComponent = POSE_MAP[pose] || Waving;

  return (
    <div className={`rakki-wrapper ${sizeClass} ${className}`.trim()} style={{ width: SIZE_PX[size] || SIZE_PX.md }}>
      <svg
        className="rakki-svg"
        viewBox="0 0 200 200"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label={`Rakki ${pose}`}
      >
        <PoseComponent />
      </svg>
      {text && <p className="rakki-caption">{text}</p>}
    </div>
  );
};

export default Rakki;
