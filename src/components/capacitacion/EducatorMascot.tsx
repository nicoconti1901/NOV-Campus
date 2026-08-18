"use client";

type Props = {
  className?: string;
};

/** Cartoon educator mascot — vector animation (Lottie-style: light, sharp, looping). */
export function EducatorMascot({ className = "" }: Props) {
  return (
    <div className={`educator-mascot relative mx-auto w-[168px] sm:w-[200px] ${className}`} aria-hidden>
      <svg viewBox="0 0 200 220" className="h-auto w-full overflow-visible" fill="none">
        <ellipse cx="100" cy="208" rx="48" ry="8" className="educator-shadow" fill="rgba(237,50,41,0.25)" />

        <g className="educator-body">
          {/* Arms behind torso so shoulders tuck cleanly into the body */}
          <g className="educator-arm-left">
            <path
              d="M78 132 L58 158"
              stroke="#1a1a24"
              strokeWidth="15"
              strokeLinecap="round"
            />
            <circle cx="56" cy="160" r="8" fill="#F5D0B0" />
          </g>

          <g className="educator-arm-right">
            <path
              d="M122 132 L148 118"
              stroke="#1a1a24"
              strokeWidth="15"
              strokeLinecap="round"
            />
            <circle cx="150" cy="116" r="8" fill="#F5D0B0" />
            <g className="educator-pointer">
              <rect x="147" y="84" width="5" height="30" rx="2" fill="#ED3229" />
              <rect x="147" y="80" width="5" height="5" rx="1" fill="#fff" />
            </g>
          </g>

          {/* Torso covers arm roots */}
          <rect x="70" y="116" width="60" height="58" rx="16" fill="#1a1a24" />
          <rect x="70" y="116" width="60" height="58" rx="16" fill="url(#torsoGlow)" />
          <path d="M100 116 L107 144 L100 154 L93 144 Z" fill="#ED3229" />
          <path d="M70 128 H130" stroke="#ED3229" strokeWidth="2" opacity="0.35" />

          {/* Legs */}
          <path d="M86 172 V198" stroke="#11111d" strokeWidth="13" strokeLinecap="round" />
          <path d="M114 172 V198" stroke="#11111d" strokeWidth="13" strokeLinecap="round" />
          <ellipse cx="86" cy="200" rx="11" ry="5" fill="#0a0a12" />
          <ellipse cx="114" cy="200" rx="11" ry="5" fill="#0a0a12" />

          {/* Head */}
          <g className="educator-head">
            <circle cx="100" cy="78" r="36" fill="#F5D0B0" />
            <path
              d="M66 72 C68 42 132 42 134 72 C120 58 80 58 66 72 Z"
              fill="#1a1a24"
            />
            <path d="M70 78 C74 66 90 62 100 62" stroke="#1a1a24" strokeWidth="8" strokeLinecap="round" />
            <circle cx="86" cy="80" r="9" stroke="#11111d" strokeWidth="2.5" fill="rgba(255,255,255,0.15)" />
            <circle cx="114" cy="80" r="9" stroke="#11111d" strokeWidth="2.5" fill="rgba(255,255,255,0.15)" />
            <path d="M95 80 H105" stroke="#11111d" strokeWidth="2.5" />
            <path d="M77 80 H72" stroke="#11111d" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M123 80 H128" stroke="#11111d" strokeWidth="2.5" strokeLinecap="round" />
            <g className="educator-eyes">
              <circle cx="86" cy="80" r="2.5" fill="#11111d" />
              <circle cx="114" cy="80" r="2.5" fill="#11111d" />
            </g>
            <path d="M90 94 Q100 102 110 94" stroke="#11111d" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            <circle cx="76" cy="90" r="4" fill="#ED3229" opacity="0.35" />
            <circle cx="124" cy="90" r="4" fill="#ED3229" opacity="0.35" />
          </g>

          {/* Book near left hand */}
          <g className="educator-book">
            <rect x="34" y="148" width="34" height="26" rx="3" fill="#ED3229" />
            <rect x="36" y="150" width="14" height="22" rx="2" fill="#fff" opacity="0.92" />
            <rect x="52" y="150" width="14" height="22" rx="2" fill="#fff5f4" opacity="0.85" />
            <path d="M50 150 V172" stroke="#C42720" strokeWidth="1.5" />
            <path d="M40 155 H48 M40 160 H48 M40 165 H46" stroke="#ED3229" strokeWidth="1.2" opacity="0.7" />
          </g>
        </g>

        <defs>
          <linearGradient id="torsoGlow" x1="70" y1="116" x2="130" y2="174" gradientUnits="userSpaceOnUse">
            <stop stopColor="#ED3229" stopOpacity="0.2" />
            <stop offset="1" stopColor="#1a1a24" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
