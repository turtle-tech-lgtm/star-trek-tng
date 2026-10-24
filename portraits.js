/* ============================================================================
   STAR TREK: TNG — SVG PORTRAITS FOR BRIDGE CREW & VIEWSCREEN HAILS
   ============================================================================ */

const TNG_PORTRAITS = {
  picard: `
    <svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="bgP" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stop-color="#283558"/>
          <stop offset="100%" stop-color="#070a14"/>
        </radialGradient>
      </defs>
      <rect width="120" height="120" fill="url(#bgP)"/>
      <!-- TNG Command Red Uniform -->
      <path d="M18 120 C22 86, 98 86, 102 120 Z" fill="#a81c2e"/>
      <path d="M22 92 L60 105 L98 92 L95 82 L25 82 Z" fill="#11131a"/>
      <!-- 4 Gold Captain Pips -->
      <circle cx="74" cy="87" r="1.9" fill="#ffd24d"/>
      <circle cx="79" cy="87" r="1.9" fill="#ffd24d"/>
      <circle cx="84" cy="87" r="1.9" fill="#ffd24d"/>
      <circle cx="89" cy="87" r="1.9" fill="#ffd24d"/>
      <!-- Combadge -->
      <ellipse cx="42" cy="103" rx="6" ry="4" fill="#ffd24d"/>
      <path d="M42 96 L46 108 L42 105 L38 108 Z" fill="#d4d8e2"/>
      <!-- Neck & Head -->
      <rect x="51" y="70" width="18" height="16" rx="5" fill="#e0b194"/>
      <!-- Silver side hair fringe -->
      <path d="M35 46 C33 56, 36 66, 40 66 L42 46 Z" fill="#c7ccd6"/>
      <path d="M85 46 C87 56, 84 66, 80 66 L78 46 Z" fill="#c7ccd6"/>
      <ellipse cx="60" cy="49" rx="22" ry="26" fill="#ebbda0"/>
      <!-- Brow & Eyes -->
      <path d="M46 44 L55 46" stroke="#6e574b" stroke-width="2.2" stroke-linecap="round"/>
      <path d="M74 44 L65 46" stroke="#6e574b" stroke-width="2.2" stroke-linecap="round"/>
      <circle cx="51" cy="49" r="2.3" fill="#232c3d"/>
      <circle cx="69" cy="49" r="2.3" fill="#232c3d"/>
      <path d="M60 50 L58 58 L62 59" fill="none" stroke="#c49276" stroke-width="1.8"/>
      <path d="M52 65 Q60 67 68 65" fill="none" stroke="#9e6b52" stroke-width="2.2" stroke-linecap="round"/>
    </svg>
  `,

  riker: `
    <svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
      <rect width="120" height="120" fill="#0b1124"/>
      <path d="M16 120 C20 85, 100 85, 104 120 Z" fill="#a81c2e"/>
      <path d="M22 92 L60 105 L98 92 L95 82 L25 82 Z" fill="#11131a"/>
      <!-- 3 Commander Pips -->
      <circle cx="76" cy="87" r="2" fill="#ffd24d"/>
      <circle cx="82" cy="87" r="2" fill="#ffd24d"/>
      <circle cx="88" cy="87" r="2" fill="#ffd24d"/>
      <ellipse cx="42" cy="103" rx="6" ry="4" fill="#ffd24d"/>
      <path d="M42 96 L46 108 L42 105 L38 108 Z" fill="#d4d8e2"/>
      <rect x="51" y="70" width="18" height="16" rx="5" fill="#e5b595"/>
      <ellipse cx="60" cy="49" rx="22" ry="25" fill="#ecc0a1"/>
      <!-- Dark Hair & Riker Beard -->
      <path d="M37 44 C36 23, 84 23, 83 44 C78 32, 42 32, 37 44 Z" fill="#2c221e"/>
      <path d="M39 52 C40 72, 52 77, 60 77 C68 77, 80 72, 81 52 L77 52 C75 64, 68 68, 60 68 C52 68, 45 64, 43 52 Z" fill="#2c221e"/>
      <path d="M49 61 Q60 58 71 61" stroke="#2c221e" stroke-width="3.5" fill="none"/>
      <path d="M53 64 Q60 67 67 64" stroke="#fff" stroke-width="1.8" fill="none"/>
      <circle cx="51" cy="48" r="2.3" fill="#24385a"/>
      <circle cx="69" cy="48" r="2.3" fill="#24385a"/>
    </svg>
  `,

  data: `
    <svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
      <rect width="120" height="120" fill="#0a1322"/>
      <!-- Operations Gold Uniform -->
      <path d="M18 120 C22 86, 98 86, 102 120 Z" fill="#d49b1a"/>
      <path d="M22 92 L60 105 L98 92 L95 82 L25 82 Z" fill="#11131a"/>
      <!-- 2 Full + 1 Hollow Pip -->
      <circle cx="76" cy="87" r="2" fill="#ffd24d"/>
      <circle cx="82" cy="87" r="2" fill="#ffd24d"/>
      <circle cx="88" cy="87" r="1.8" fill="none" stroke="#ffd24d" stroke-width="1.2"/>
      <ellipse cx="42" cy="103" rx="6" ry="4" fill="#ffd24d"/>
      <path d="M42 96 L46 108 L42 105 L38 108 Z" fill="#d4d8e2"/>
      <rect x="51" y="70" width="18" height="16" rx="5" fill="#d8cf9c"/>
      <ellipse cx="60" cy="49" rx="21" ry="25" fill="#e6deaa"/>
      <!-- Slicked dark hair -->
      <path d="M39 42 C39 22, 81 22, 81 42 C74 29, 46 29, 39 42 Z" fill="#18181c"/>
      <!-- Golden Android Eyes -->
      <circle cx="51" cy="48" r="3" fill="#ffee44"/>
      <circle cx="69" cy="48" r="3" fill="#ffee44"/>
      <circle cx="51" cy="48" r="1.2" fill="#111"/>
      <circle cx="69" cy="48" r="1.2" fill="#111"/>
      <path d="M53 64 L67 64" stroke="#8f8860" stroke-width="2" stroke-linecap="round"/>
    </svg>
  `,

  worf: `
    <svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
      <rect width="120" height="120" fill="#170c12"/>
      <!-- Operations Gold Uniform -->
      <path d="M16 120 C20 84, 100 84, 104 120 Z" fill="#c98e16"/>
      <path d="M22 92 L60 105 L98 92 L95 82 L25 82 Z" fill="#11131a"/>
      <!-- Klingon Baldric Sash -->
      <path d="M28 84 L78 120 L90 120 L40 82 Z" fill="#7c6d5c" stroke="#d4af37" stroke-width="2"/>
      <!-- Long Klingon Hair -->
      <path d="M32 42 C26 68, 30 92, 36 96 L84 96 C90 92, 94 68, 88 42 Z" fill="#1a1412"/>
      <rect x="51" y="70" width="18" height="16" rx="5" fill="#8f5d41"/>
      <ellipse cx="60" cy="50" rx="22" ry="25" fill="#9c6647"/>
      <!-- Klingon Cranial Ridges -->
      <path d="M50 28 L60 31 L70 28" stroke="#663c25" stroke-width="2.5" fill="none"/>
      <path d="M48 33 L60 37 L72 33" stroke="#663c25" stroke-width="2.5" fill="none"/>
      <path d="M49 38 L60 42 L71 38" stroke="#663c25" stroke-width="2.5" fill="none"/>
      <!-- Beard & Mustache -->
      <path d="M41 56 C43 74, 77 74, 79 56 L73 56 C71 67, 49 67, 47 56 Z" fill="#1a1412"/>
      <path d="M47 61 Q60 56 73 61" stroke="#1a1412" stroke-width="3.5" fill="none"/>
      <!-- Fierce Brow & Eyes -->
      <path d="M44 44 L56 48" stroke="#2a160d" stroke-width="2.6"/>
      <path d="M76 44 L64 48" stroke="#2a160d" stroke-width="2.6"/>
      <circle cx="51" cy="49" r="2.2" fill="#111"/>
      <circle cx="69" cy="49" r="2.2" fill="#111"/>
    </svg>
  `,

  geordi: `
    <svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
      <rect width="120" height="120" fill="#0d1526"/>
      <path d="M18 120 C22 86, 98 86, 102 120 Z" fill="#d49b1a"/>
      <path d="M22 92 L60 105 L98 92 L95 82 L25 82 Z" fill="#11131a"/>
      <ellipse cx="42" cy="103" rx="6" ry="4" fill="#ffd24d"/>
      <path d="M42 96 L46 108 L42 105 L38 108 Z" fill="#d4d8e2"/>
      <rect x="51" y="70" width="18" height="16" rx="5" fill="#6b442b"/>
      <ellipse cx="60" cy="49" rx="21" ry="25" fill="#784c31"/>
      <path d="M39 40 C40 21, 80 21, 81 40 Z" fill="#151313"/>
      <!-- Iconic Gold VISOR -->
      <rect x="37" y="42" width="46" height="10" rx="5" fill="#ffcc33" stroke="#fff" stroke-width="1.2"/>
      <line x1="40" y1="47" x2="80" y2="47" stroke="#cc2222" stroke-width="2"/>
      <path d="M52 63 Q60 68 68 63" stroke="#3a2010" stroke-width="2.2" fill="none" stroke-linecap="round"/>
    </svg>
  `,

  troi: `
    <svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
      <rect width="120" height="120" fill="#141028"/>
      <!-- Wavy Betazoid Hair -->
      <path d="M28 45 C22 72, 26 98, 35 104 L85 104 C94 98, 98 72, 92 45 C88 22, 32 22, 28 45 Z" fill="#23171a"/>
      <path d="M18 120 C22 86, 98 86, 102 120 Z" fill="#206878"/>
      <path d="M26 92 L60 106 L94 92 L90 83 L30 83 Z" fill="#121521"/>
      <ellipse cx="42" cy="103" rx="6" ry="4" fill="#ffd24d"/>
      <path d="M42 96 L46 108 L42 105 L38 108 Z" fill="#d4d8e2"/>
      <rect x="52" y="70" width="16" height="16" rx="5" fill="#e6b89c"/>
      <ellipse cx="60" cy="50" rx="20" ry="24" fill="#f0c4a8"/>
      <!-- Large dark Betazoid eyes -->
      <circle cx="51" cy="49" r="3" fill="#0d080c"/>
      <circle cx="69" cy="49" r="3" fill="#0d080c"/>
      <circle cx="52" cy="48" r="0.9" fill="#fff"/>
      <circle cx="70" cy="48" r="0.9" fill="#fff"/>
      <path d="M53 64 Q60 68 67 64" stroke="#b84a58" stroke-width="2.4" fill="none" stroke-linecap="round"/>
    </svg>
  `,

  crusher: `
    <svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
      <rect width="120" height="120" fill="#091926"/>
      <!-- Auburn Hair -->
      <path d="M31 44 C26 70, 30 94, 38 98 L82 98 C90 94, 94 70, 89 44 C84 22, 36 22, 31 44 Z" fill="#9e381e"/>
      <path d="M18 120 C22 86, 98 86, 102 120 Z" fill="#1b7895"/>
      <path d="M24 92 L60 105 L96 92 L92 82 L28 82 Z" fill="#11131a"/>
      <ellipse cx="42" cy="103" rx="6" ry="4" fill="#ffd24d"/>
      <path d="M42 96 L46 108 L42 105 L38 108 Z" fill="#d4d8e2"/>
      <rect x="52" y="70" width="16" height="16" rx="5" fill="#ecc2a8"/>
      <ellipse cx="60" cy="50" rx="20" ry="24" fill="#f5ceb4"/>
      <circle cx="51" cy="49" r="2.4" fill="#2c6b78"/>
      <circle cx="69" cy="49" r="2.4" fill="#2c6b78"/>
      <path d="M53 64 Q60 67 67 64" stroke="#c4515c" stroke-width="2.2" fill="none" stroke-linecap="round"/>
    </svg>
  `,

  tomalak: `
    <svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
      <rect width="120" height="120" fill="#071f14"/>
      <!-- Romulan Padded Sash Uniform -->
      <path d="M10 120 L22 80 L98 80 L110 120 Z" fill="#3d4b44" stroke="#688273" stroke-width="2"/>
      <path d="M22 80 L60 108 L98 80 Z" fill="#192920"/>
      <rect x="51" y="68" width="18" height="16" fill="#c7b89b"/>
      <!-- Pointed Romulan Ears -->
      <polygon points="36,48 28,36 40,42" fill="#d4c5a9"/>
      <polygon points="84,48 92,36 80,42" fill="#d4c5a9"/>
      <ellipse cx="60" cy="49" rx="21" ry="25" fill="#d4c5a9"/>
      <!-- Romulan Bowl Helmet Hair & V-Brow -->
      <path d="M38 40 C38 20, 82 20, 82 40 L60 44 Z" fill="#222624"/>
      <path d="M44 42 L60 48 L76 42" stroke="#5c5346" stroke-width="3" fill="none"/>
      <circle cx="51" cy="49" r="2.2" fill="#1c2e24"/>
      <circle cx="69" cy="49" r="2.2" fill="#1c2e24"/>
      <path d="M52 64 Q60 61 68 64" stroke="#6e5a4f" stroke-width="2.2" fill="none"/>
    </svg>
  `,

  duras: `
    <svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
      <rect width="120" height="120" fill="#240808"/>
      <path d="M12 120 L24 80 L96 80 L108 120 Z" fill="#3a2f2d" stroke="#8c7853" stroke-width="2"/>
      <path d="M28 40 C22 72, 26 98, 34 102 L86 102 C94 98, 98 72, 92 40 Z" fill="#161210"/>
      <ellipse cx="60" cy="50" rx="22" ry="25" fill="#966345"/>
      <path d="M48 28 L60 34 L72 28 M47 34 L60 40 L73 34" stroke="#5e3722" stroke-width="2.8" fill="none"/>
      <path d="M42 56 C44 74, 76 74, 78 56 L72 56 C70 67, 50 67, 48 56 Z" fill="#161210"/>
      <circle cx="50" cy="49" r="2.3" fill="#ff3300"/>
      <circle cx="70" cy="49" r="2.3" fill="#ff3300"/>
      <path d="M51 63 L69 61" stroke="#30150a" stroke-width="2.5"/>
    </svg>
  `,

  borg: `
    <svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
      <rect width="120" height="120" fill="#04180c"/>
      <!-- Borg Cybernetic Armor -->
      <path d="M16 120 C20 82, 100 82, 104 120 Z" fill="#1c2420" stroke="#33cc66" stroke-width="1.5"/>
      <rect x="48" y="68" width="24" height="18" fill="#66756e"/>
      <ellipse cx="60" cy="49" rx="22" ry="26" fill="#bfc9c4"/>
      <!-- Borg Cortical & Ocular Laser Implant -->
      <path d="M60 23 C76 23, 84 36, 82 58 L62 56 L62 38 Z" fill="#232b28" stroke="#44ff88" stroke-width="1.2"/>
      <circle cx="70" cy="48" r="6" fill="#111" stroke="#55ff99" stroke-width="1.5"/>
      <circle cx="70" cy="48" r="2.8" fill="#ff1122"/>
      <!-- Laser beam glow -->
      <line x1="70" y1="48" x2="115" y2="56" stroke="#ff2233" stroke-width="1.6" stroke-opacity="0.8"/>
      <circle cx="50" cy="48" r="2.2" fill="#22332c"/>
      <path d="M51 64 L69 64" stroke="#4e5954" stroke-width="2"/>
    </svg>
  `,

  macet: `
    <svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
      <rect width="120" height="120" fill="#211608"/>
      <path d="M14 120 L26 80 L94 80 L106 120 Z" fill="#3d352e" stroke="#b88b4a" stroke-width="2"/>
      <!-- Cardassian Neck Ridges -->
      <path d="M42 66 L36 86 L84 86 L78 66 Z" fill="#9c8f84" stroke="#6e6259" stroke-width="2"/>
      <ellipse cx="60" cy="49" rx="21" ry="25" fill="#b3a598"/>
      <!-- Cardassian Forehead Spoon Crest -->
      <ellipse cx="60" cy="36" rx="4.5" ry="7" fill="#8c7d70" stroke="#5e5248" stroke-width="1.5"/>
      <path d="M38 40 C38 20, 82 20, 82 40 C74 28, 46 28, 38 40 Z" fill="#1e1b18"/>
      <circle cx="51" cy="49" r="2.2" fill="#1f1a17"/>
      <circle cx="69" cy="49" r="2.2" fill="#1f1a17"/>
      <path d="M52 64 L68 64" stroke="#5e5248" stroke-width="2"/>
    </svg>
  `,

  crystalline: `
    <svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
      <rect width="120" height="120" fill="#050b1c"/>
      <g stroke="#88eeff" stroke-width="1.6" fill="rgba(136, 238, 255, 0.18)">
        <polygon points="60,8 68,48 108,35 74,60 105,90 66,72 60,112 54,72 15,90 46,60 12,35 52,48"/>
        <polygon points="60,22 72,52 98,60 72,68 60,98 48,68 22,60 48,52" fill="rgba(200, 250, 255, 0.35)"/>
        <circle cx="60" cy="60" r="9" fill="#ffffff"/>
      </g>
    </svg>
  `,

  starfleet: `
    <svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
      <rect width="120" height="120" fill="#081229"/>
      <circle cx="60" cy="60" r="42" fill="#10234d" stroke="#ff9900" stroke-width="2.5"/>
      <path d="M60 22 L82 92 L60 75 L38 92 Z" fill="#ffd24d" stroke="#ffffff" stroke-width="1.5"/>
    </svg>
  `,

  borgQueen: `
    <svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="queenGlow" cx="50%" cy="40%" r="65%">
          <stop offset="0%" stop-color="#114428"/>
          <stop offset="100%" stop-color="#030b06"/>
        </radialGradient>
      </defs>
      <rect width="120" height="120" fill="url(#queenGlow)"/>
      <!-- Cybernetic Neural Tendrils & Spine -->
      <path d="M22 18 Q42 36 45 55 M98 18 Q78 36 75 55 M14 40 Q36 52 42 64 M106 40 Q84 52 78 64" stroke="#33ff88" stroke-width="1.6" fill="none" opacity="0.7"/>
      <!-- Metallic Borg Collar & Shoulders -->
      <path d="M12 120 C18 82, 102 82, 108 120 Z" fill="#141d19" stroke="#33ff88" stroke-width="2"/>
      <path d="M35 84 L60 112 L85 84 Z" fill="#08120d" stroke="#44ff99" stroke-width="1.2"/>
      <!-- Exposed Cybernetic Spinal Column Neck -->
      <rect x="52" y="68" width="16" height="20" fill="#2c3a34" stroke="#55ffaa" stroke-width="1"/>
      <line x1="52" y1="73" x2="68" y2="73" stroke="#33ff88" stroke-width="1.2"/>
      <line x1="52" y1="78" x2="68" y2="78" stroke="#33ff88" stroke-width="1.2"/>
      <line x1="52" y1="83" x2="68" y2="83" stroke="#33ff88" stroke-width="1.2"/>
      <!-- Cranial Crown & Pale Visage -->
      <path d="M36 44 C34 14, 86 14, 84 44 L78 52 L42 52 Z" fill="#23302b" stroke="#44ff99" stroke-width="1.5"/>
      <ellipse cx="60" cy="50" rx="19" ry="23" fill="#c7d4ce"/>
      <!-- Cranial Circuit Lines -->
      <path d="M44 34 L54 42 L60 30 L66 42 L76 34" fill="none" stroke="#33ff88" stroke-width="1.4"/>
      <circle cx="60" cy="30" r="3" fill="#55ffaa"/>
      <!-- Glowing Emerald Borg Queen Eyes -->
      <circle cx="51" cy="49" r="3" fill="#081a10"/>
      <circle cx="69" cy="49" r="3" fill="#081a10"/>
      <circle cx="51" cy="49" r="1.7" fill="#44ff88"/>
      <circle cx="69" cy="49" r="1.7" fill="#44ff88"/>
      <!-- Cold Metallic Smirk -->
      <path d="M52 63 Q60 66 68 63" stroke="#3c5249" stroke-width="2.2" fill="none"/>
    </svg>
  `
};

window.TNG_PORTRAITS = TNG_PORTRAITS;
