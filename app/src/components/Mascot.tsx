import type { ReactNode } from 'react'

export type MascotId = 'fantasma' | 'roxinha'

type Entry = { id: MascotId; label: string; about: string; art: ReactNode }

const HEADSET_TAIL = <circle cx="113" cy="149" r="6" fill="#F2C14E" strokeWidth="4" />

/** The two mascots. Both share the same group and class names, so the same eight animations drive either one. */
export const MASCOTS: readonly Entry[] = [
  {
    id: 'fantasma',
    label: 'Fantasminha',
    about: 'Branco, de olhar arteiro e fones azul e framboesa.',
    art: (
      <>
        <g className="g-body">
          <path d="M58 168 V100 a42 42 0 0 1 84 0 V168 q-7 -9 -14 0 t-14 0 t-14 0 t-14 0 t-14 0 t-14 0 Z" fill="#FCFBFF" strokeWidth="5" />
        </g>
        <g className="g-face">
          <path className="g-brow g-brow--l" d="M77 99 L93 104" fill="none" strokeWidth="4" />
          <path className="g-brow g-brow--r" d="M123 99 L107 104" fill="none" strokeWidth="4" />
          <g className="g-eye g-eye--l">
            <path d="M79 109 Q86 106 93 109 Q93 120 86 120 Q79 120 79 109 Z" fill="#241A35" strokeWidth="2" />
            <circle cx="89" cy="113" r="1.8" fill="#FCFBFF" stroke="none" />
          </g>
          <g className="g-eye g-eye--r">
            <path d="M107 109 Q114 106 121 109 Q121 120 114 120 Q107 120 107 109 Z" fill="#241A35" strokeWidth="2" />
            <circle cx="117" cy="113" r="1.8" fill="#FCFBFF" stroke="none" />
          </g>
          <ellipse cx="74" cy="128" rx="7" ry="4" fill="#F3A9C4" stroke="none" />
          <ellipse cx="126" cy="128" rx="7" ry="4" fill="#F3A9C4" stroke="none" />
          <path d="M91 128 Q101 134 111 125" fill="none" strokeWidth="3.5" />
          <path d="M104 131 L106 136 L109 129" fill="#FCFBFF" strokeWidth="2" />
        </g>
        <g className="g-headset">
          <path d="M52 112 C52 46 148 46 148 112" fill="none" strokeWidth="15" />
          <path d="M52 112 C52 46 148 46 148 112" fill="none" stroke="#F2C14E" strokeWidth="7" />
          <rect className="g-cup--l" x="40" y="96" width="22" height="38" rx="10" fill="#17666E" strokeWidth="5" />
          <rect className="g-cup--r" x="138" y="96" width="22" height="38" rx="10" fill="#BF3468" strokeWidth="5" />
          <path d="M152 132 C154 152 132 156 116 150" fill="none" strokeWidth="8" />
          <path d="M152 132 C154 152 132 156 116 150" fill="none" stroke="#F2C14E" strokeWidth="3" />
          {HEADSET_TAIL}
        </g>
      </>
    ),
  },
  {
    id: 'roxinha',
    label: 'Roxinha',
    about: 'Irmãzinha do fantasminha: roxa, com chifrinhos e laço framboesa.',
    art: (
      <>
        <g className="g-body">
          <path d="M60 78 Q66 58 78 56 Q88 60 90 72 Z" fill="#F6E6C8" strokeWidth="4.5" />
          <path d="M140 78 Q134 58 122 56 Q112 60 110 72 Z" fill="#F6E6C8" strokeWidth="4.5" />
          <path d="M58 168 V100 a42 42 0 0 1 84 0 V168 q-7 -9 -14 0 t-14 0 t-14 0 t-14 0 t-14 0 t-14 0 Z" fill="#6A4BA3" strokeWidth="5" />
          <path d="M70 94 Q72 74 90 68" fill="none" stroke="#8C6FC4" strokeWidth="4" />
        </g>
        <g className="g-face">
          <path className="g-brow g-brow--l" d="M77 98 L93 103" fill="none" stroke="#FCFBFF" strokeWidth="4" />
          <path className="g-brow g-brow--r" d="M123 98 L107 103" fill="none" stroke="#FCFBFF" strokeWidth="4" />
          <g className="g-eye g-eye--l">
            <path d="M79 108 Q86 105 93 108 Q93 120 86 120 Q79 120 79 108 Z" fill="#FCFBFF" strokeWidth="2" />
            <ellipse cx="88" cy="113" rx="3.2" ry="4.4" fill="#241A35" stroke="none" />
          </g>
          <g className="g-eye g-eye--r">
            <path d="M107 108 Q114 105 121 108 Q121 120 114 120 Q107 120 107 108 Z" fill="#FCFBFF" strokeWidth="2" />
            <ellipse cx="116" cy="113" rx="3.2" ry="4.4" fill="#241A35" stroke="none" />
          </g>
          <ellipse cx="74" cy="128" rx="7" ry="4" fill="#E77FA3" stroke="none" />
          <ellipse cx="126" cy="128" rx="7" ry="4" fill="#E77FA3" stroke="none" />
          <path d="M91 125 Q101 134 111 128" fill="none" stroke="#FCFBFF" strokeWidth="3.5" />
          <path d="M95 129 L97 135 L100 130" fill="#FCFBFF" stroke="#241A35" strokeWidth="1.5" />
        </g>
        <g className="g-headset">
          <path d="M52 112 C52 46 148 46 148 112" fill="none" strokeWidth="15" />
          <path d="M52 112 C52 46 148 46 148 112" fill="none" stroke="#F2C14E" strokeWidth="7" />
          <rect className="g-cup--l" x="40" y="96" width="22" height="38" rx="10" fill="#BF3468" strokeWidth="5" />
          <rect className="g-cup--r" x="138" y="96" width="22" height="38" rx="10" fill="#17666E" strokeWidth="5" />
          <path d="M48 134 C46 152 68 156 84 150" fill="none" strokeWidth="8" />
          <path d="M48 134 C46 152 68 156 84 150" fill="none" stroke="#F2C14E" strokeWidth="3" />
          <circle cx="87" cy="149" r="6" fill="#F2C14E" strokeWidth="4" />
          <path d="M100 54 L88 46 Q86 56 88 64 Z M100 54 L112 46 Q114 56 112 64 Z" fill="#BF3468" strokeWidth="3.5" />
          <circle cx="100" cy="55" r="4.5" fill="#F2C14E" strokeWidth="3" />
        </g>
      </>
    ),
  },
]

export const DEFAULT_MASCOT: MascotId = 'fantasma'

export function Mascot({ id, size = 40, className }: { id: MascotId; size?: number; className?: string }) {
  const entry = MASCOTS.find((m) => m.id === id) ?? MASCOTS[0]
  return (
    <svg className={className ? `mascot ${className}` : 'mascot'} viewBox="0 0 200 200" width={size} height={size} aria-hidden="true">
      <g className="g-all" stroke="#241A35" strokeLinejoin="round" strokeLinecap="round">
        {entry.art}
      </g>
    </svg>
  )
}
