import type { ReactNode } from 'react'

export type MascotId = 'fantasma' | 'roxinha' | 'kuromi'

type Entry = { id: MascotId; label: string; about: string; stroke?: string; art: ReactNode }

const HEADSET_TAIL = <circle cx="113" cy="149" r="6" fill="#F2C14E" strokeWidth="4" />

/** The mascots. All share the same group and class names, so the same eight animations drive any one. */
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
  {
    id: 'kuromi',
    label: 'Kuromi da Maah',
    about: 'Desenho da Maah: capuz cinza, caveirinha rosa e fones lilás.',
    stroke: '#1F1D24',
    art: (
      <>
        <g className="g-body">
          {/* Capuz e rosto herdam juntos a ondulação de Flutuar. */}
          <path d="M 56.0,105.0 Q 40.0,76.0 30.0,46.0 Q 60.0,60.0 87.0,77.0 L 56.0,105.0" fill="#55535B" strokeWidth="3.5" />
          <path d="M 144.0,105.0 Q 160.0,76.0 170.0,46.0 Q 140.0,60.0 113.0,77.0 L 144.0,105.0" fill="#55535B" strokeWidth="3.5" />
          <circle cx="29" cy="44" r="7.5" fill="#55535B" strokeWidth="3.5" />
          <circle cx="171" cy="44" r="7.5" fill="#55535B" strokeWidth="3.5" />
          <ellipse cx="100" cy="124" rx="54" ry="47.5" fill="#55535B" strokeWidth="3.5" />
          <path d="M 100.0,84.0 C 108.0,84.0 113.0,89.0 113.0,95.0 C 113.0,99.0 110.5,101.5 107.0,102.5 L 107.0,105.5 C 107.0,107.0 106.0,108.0 104.5,108.0 L 95.5,108.0 C 94.0,108.0 93.0,107.0 93.0,105.5 L 93.0,102.5 C 89.5,101.5 87.0,99.0 87.0,95.0 C 87.0,89.0 92.0,84.0 100.0,84.0" fill="#F2A9C6" strokeWidth="2.5" />
          <ellipse cx="95" cy="95.5" rx="2.5" ry="3.25" fill="#1F1D24" stroke="none" />
          <ellipse cx="105" cy="95.5" rx="2.5" ry="3.25" fill="#1F1D24" stroke="none" />
          <path d="M 98.0,104.0 L 98.0,107.5 M 102.0,104.0 L 102.0,107.5" fill="none" strokeWidth="1.5" />
          <g className="g-face">
            {/* A base branca acompanha olhos, sobrancelhas, bochechas, nariz e boca em Espiar. */}
            <path d="M 100.0,117.0 C 93.0,105.0 75.0,101.0 64.0,112.0 C 54.0,122.0 54.0,140.0 64.0,150.5 C 74.0,161.0 88.0,164.0 100.0,164.0 C 112.0,164.0 126.0,161.0 136.0,150.5 C 146.0,140.0 146.0,122.0 136.0,112.0 C 125.0,101.0 107.0,105.0 100.0,117.0" fill="#FFFFFF" strokeWidth="3" />
            <ellipse cx="70" cy="149" rx="8" ry="5" fill="#F6BCD0" stroke="none" />
            <ellipse cx="130" cy="149" rx="8" ry="5" fill="#F6BCD0" stroke="none" />
            <g className="g-eye g-eye--l">
              <path d="M 73.5,126.0 L 88.5,131.5 C 89.0,138.5 86.0,143.5 81.0,143.5 C 75.5,143.5 72.0,137.5 72.5,131.0 L 73.5,126.0" fill="#1F1D24" strokeWidth="1.5" />
              <path d="M 71.5,125.0 L 66.0,121.5 M 72.0,129.0 L 66.0,128.0" fill="none" strokeWidth="2.25" />
            </g>
            <g className="g-brow g-brow--l">
              <path d="M 72.0,125.5 L 87.5,131.0" fill="none" strokeWidth="3" />
            </g>
            <g className="g-eye g-eye--r">
              <path d="M 126.5,126.0 L 111.5,131.5 C 111.0,138.5 114.0,143.5 119.0,143.5 C 124.5,143.5 128.0,137.5 127.5,131.0 L 126.5,126.0" fill="#1F1D24" strokeWidth="1.5" />
              <path d="M 128.5,125.0 L 134.0,121.5 M 128.0,129.0 L 134.0,128.0" fill="none" strokeWidth="2.25" />
            </g>
            <g className="g-brow g-brow--r">
              <path d="M 128.0,125.5 L 112.5,131.0" fill="none" strokeWidth="3" />
            </g>
            <ellipse cx="100" cy="144" rx="3.25" ry="2.5" fill="#F2A9C6" strokeWidth="1.75" />
            <path d="M 94.5,151.0 Q 100.0,156.5 105.5,151.0" fill="none" strokeWidth="2.25" />
          </g>
        </g>
        <g className="g-headset">
          <g strokeWidth="3">
            <path fill="#8F7BC6" d="M 77.26757017562991,57.346175865098004 A 6.0,11.0 -16.0 1,0 65.73242982437009,60.653824134901996 A 6.0,11.0 -16.0 1,0 77.26757017562991,57.346175865098004" />
            <path fill="#8F7BC6" d="M 134.2675701756299,60.653824134901996 A 6.0,11.0 16.0 1,0 122.73242982437009,57.346175865098004 A 6.0,11.0 16.0 1,0 134.2675701756299,60.653824134901996" />
          </g>
          <path fill="#F7F3FF" stroke="none" d="M 73.66283881586122,57.87981594941175 A 2.250000000000004,6.000000000000011 -16.0 1,0 69.33716118413878,59.12018405058825 A 2.250000000000004,6.000000000000011 -16.0 1,0 73.66283881586122,57.87981594941175" />
          <path fill="#F7F3FF" stroke="none" d="M 130.66283881586122,59.12018405058825 A 2.250000000000004,6.000000000000011 16.0 1,0 126.33716118413878,57.87981594941175 A 2.250000000000004,6.000000000000011 16.0 1,0 130.66283881586122,59.12018405058825" />
          <rect x="48" y="113" width="12" height="31" rx="5.5" fill="#2F2D35" strokeWidth="3" />
          <rect x="140" y="113" width="12" height="31" rx="5.5" fill="#2F2D35" strokeWidth="3" />
          <path d="M 46.0,118.0 C 46.0,81.0 74.0,67.0 100.0,67.0 C 126.0,67.0 154.0,81.0 154.0,118.0" fill="none" strokeWidth="13.5" />
          <path d="M 46.0,118.0 C 46.0,81.0 74.0,67.0 100.0,67.0 C 126.0,67.0 154.0,81.0 154.0,118.0" fill="none" stroke="#8F7BC6" strokeWidth="7.5" />
          <path d="M 54.0,90.0 C 62.0,77.0 80.0,70.5 100.0,70.5" fill="none" stroke="#BFB0EA" strokeWidth="1.75" opacity="0.8" />
          <path d="M 85.0,68.5 Q 100.0,65.0 115.0,68.5" fill="none" strokeWidth="18" />
          <path d="M 85.0,68.5 Q 100.0,65.0 115.0,68.5" fill="none" stroke="#F2A9C6" strokeWidth="12" />
          <g className="g-cup--l">
            <rect x="33" y="109" width="21" height="39" rx="9.5" fill="#8F7BC6" strokeWidth="3.5" />
            <path d="M 39.0,118.0 L 39.0,138.0" fill="none" stroke="#BFB0EA" strokeWidth="2.5" />
          </g>
          <g className="g-cup--r">
            <rect x="146" y="109" width="21" height="39" rx="9.5" fill="#8F7BC6" strokeWidth="3.5" />
            <path d="M 161.0,118.0 L 161.0,138.0" fill="none" stroke="#BFB0EA" strokeWidth="2.5" />
          </g>
          <path d="M 156.0,146.0 C 157.0,164.0 138.0,167.0 123.0,162.0" fill="none" strokeWidth="6.5" />
          <path d="M 156.0,146.0 C 157.0,164.0 138.0,167.0 123.0,162.0" fill="none" stroke="#8F7BC6" strokeWidth="2.5" />
          <path fill="#8F7BC6" strokeWidth="2.5" d="M 126.30692222079398,162.57249232139785 A 6.500000000000002,4.250000000000001 14.0 1,0 113.69307777920602,159.42750767860215 A 6.500000000000002,4.250000000000001 14.0 1,0 126.30692222079398,162.57249232139785" />
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
      <g className="g-all" stroke={entry.stroke ?? '#241A35'} strokeLinejoin="round" strokeLinecap="round">
        {entry.art}
      </g>
    </svg>
  )
}
