type Props = {
  className?: string;
};

/** Escena vectorial: capacitador + operario frente a un tablero HSE, con torre de perforación de fondo. */
export function TrainingScene({ className = "" }: Props) {
  return (
    <div className={`w-full max-w-[340px] ${className}`} aria-hidden>
      <svg viewBox="0 0 320 200" className="h-auto w-full overflow-visible" fill="none">
        <ellipse cx="160" cy="96" rx="150" ry="92" fill="url(#sceneGlow)" />

        {/* Torre de perforación de fondo */}
        <g stroke="#8b9098" strokeWidth="2" opacity="0.18" strokeLinecap="round">
          <path d="M210 176 L246 16" />
          <path d="M296 176 L260 16" />
          <path d="M246 16 H260" />
          <path d="M218 140 H288" />
          <path d="M226 104 H280" />
          <path d="M233 72 H273" />
          <path d="M241 40 H265" />
          <path d="M218 140 L280 104" />
          <path d="M288 140 L226 104" />
          <path d="M226 104 L273 72" />
        </g>
        <rect x="248" y="8" width="10" height="8" rx="2" fill="#ED3229" opacity="0.4" />

        <path d="M0 176 H320" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />

        {/* Tablero de capacitación */}
        <g>
          <path d="M152 108 L146 176" stroke="#61666E" strokeWidth="3" strokeLinecap="round" />
          <path d="M168 108 L174 176" stroke="#61666E" strokeWidth="3" strokeLinecap="round" />
          <path d="M150 142 H170" stroke="#61666E" strokeWidth="2.5" strokeLinecap="round" />

          <rect
            x="112"
            y="30"
            width="96"
            height="78"
            rx="8"
            fill="rgba(255,255,255,0.06)"
            stroke="rgba(255,255,255,0.16)"
            strokeWidth="1.5"
          />
          <rect x="122" y="40" width="32" height="4" rx="2" fill="#ED3229" />
          <rect x="158" y="40" width="14" height="4" rx="2" fill="rgba(255,255,255,0.2)" />

          {/* Torre esquemática dentro del tablero */}
          <g stroke="#8b9098" strokeWidth="2" strokeLinecap="round">
            <path d="M124 98 L135 56" />
            <path d="M146 98 L135 56" />
            <path d="M127 86 H143" />
            <path d="M129 74 H141" />
            <path d="M131 64 H139" />
          </g>
          <path d="M120 98 H150" stroke="#61666E" strokeWidth="2.5" strokeLinecap="round" />
          <rect x="132" y="51" width="6" height="4" rx="1" fill="#ED3229" />

          {/* Checklist con tildes que se dibujan en loop */}
          {[62, 78, 94].map((y, index) => (
            <g key={y}>
              <rect x="170" y={y - 2} width="26" height="3" rx="1.5" fill="rgba(255,255,255,0.28)" />
              <path
                d={`M155 ${y} l4 4 l8 -9`}
                stroke="#ED3229"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="crew-check"
                style={{ animationDelay: `${index * 0.45}s` }}
              />
            </g>
          ))}
        </g>

        {/* Capacitador */}
        <ellipse cx="62" cy="178" rx="24" ry="4.5" className="crew-shadow-a" fill="rgba(0,0,0,0.45)" />
        <g className="crew-a">
          <path d="M48 108 L38 138" stroke="#262b32" strokeWidth="12" strokeLinecap="round" />
          <circle cx="37" cy="140" r="6" fill="#F5D0B0" />

          <path d="M54 146 V172" stroke="#23282f" strokeWidth="11" strokeLinecap="round" />
          <path d="M70 146 V172" stroke="#23282f" strokeWidth="11" strokeLinecap="round" />
          <ellipse cx="54" cy="174" rx="9" ry="4" fill="#15181c" />
          <ellipse cx="70" cy="174" rx="9" ry="4" fill="#15181c" />

          <rect x="44" y="96" width="36" height="54" rx="13" fill="#2f353d" />
          <path d="M44 114 H80" stroke="rgba(255,255,255,0.55)" strokeWidth="3" />
          <path d="M44 124 H80" stroke="rgba(255,255,255,0.28)" strokeWidth="2" />
          <path d="M62 100 V146" stroke="#ED3229" strokeWidth="1.5" opacity="0.5" />

          <g className="crew-point">
            <path d="M76 108 L100 92" stroke="#343a43" strokeWidth="12" strokeLinecap="round" />
            <circle cx="102" cy="90" r="6.5" fill="#F5D0B0" />
            <path d="M104 88 L146 66" stroke="rgba(255,255,255,0.85)" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="147" cy="65" r="3" fill="#ED3229" />
          </g>

          <g>
            <circle cx="62" cy="74" r="16" fill="#F5D0B0" />
            <circle cx="60" cy="74" r="1.9" fill="#15181c" />
            <circle cx="69" cy="74" r="1.9" fill="#15181c" />
            <path d="M60 82 Q65 86 70 81" stroke="#15181c" strokeWidth="2" strokeLinecap="round" />
            <path d="M44 70 A18 18 0 0 1 80 70 Z" fill="#ED3229" />
            <path d="M62 53 V68" stroke="#C42720" strokeWidth="2" opacity="0.6" />
            <rect x="40" y="67" width="48" height="5" rx="2.5" fill="#ED3229" />
          </g>
        </g>

        {/* Operario en capacitación */}
        <ellipse cx="258" cy="178" rx="22" ry="4" className="crew-shadow-b" fill="rgba(0,0,0,0.45)" />
        <g className="crew-b">
          <path d="M272 112 L280 136" stroke="#3f464e" strokeWidth="11" strokeLinecap="round" />
          <circle cx="281" cy="138" r="5.5" fill="#F5D0B0" />

          <path d="M250 148 V172" stroke="#2b3037" strokeWidth="10" strokeLinecap="round" />
          <path d="M266 148 V172" stroke="#2b3037" strokeWidth="10" strokeLinecap="round" />
          <ellipse cx="250" cy="174" rx="8" ry="3.5" fill="#15181c" />
          <ellipse cx="266" cy="174" rx="8" ry="3.5" fill="#15181c" />

          <rect x="241" y="100" width="34" height="50" rx="12" fill="#4a5159" />
          <path d="M241 116 H275" stroke="rgba(255,255,255,0.5)" strokeWidth="3" />
          <path d="M241 126 H275" stroke="rgba(255,255,255,0.25)" strokeWidth="2" />

          <g className="crew-clip">
            <rect x="216" y="124" width="30" height="36" rx="3" fill="#e9ecf0" />
            <rect x="225" y="120" width="12" height="6" rx="2" fill="#ED3229" />
            <path
              d="M222 136 H240 M222 143 H236 M222 150 H239"
              stroke="#9aa1ab"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </g>
          <path d="M244 112 L232 130" stroke="#545b64" strokeWidth="11" strokeLinecap="round" />
          <circle cx="231" cy="132" r="6" fill="#F5D0B0" />

          <g className="crew-nod">
            <circle cx="258" cy="78" r="15" fill="#F5D0B0" />
            <circle cx="250" cy="78" r="1.9" fill="#15181c" />
            <circle cx="259" cy="78" r="1.9" fill="#15181c" />
            <path d="M249 86 Q254 89 259 85" stroke="#15181c" strokeWidth="2" strokeLinecap="round" />
            <path d="M241 74 A17 17 0 0 1 275 74 Z" fill="#E8B93A" />
            <path d="M258 58 V72" stroke="#c79a24" strokeWidth="2" opacity="0.6" />
            <rect x="235" y="71" width="46" height="5" rx="2.5" fill="#E8B93A" />
          </g>
        </g>

        <defs>
          <radialGradient id="sceneGlow" cx="0.5" cy="0.5" r="0.5">
            <stop stopColor="#ED3229" stopOpacity="0.14" />
            <stop offset="1" stopColor="#ED3229" stopOpacity="0" />
          </radialGradient>
        </defs>
      </svg>
    </div>
  );
}
