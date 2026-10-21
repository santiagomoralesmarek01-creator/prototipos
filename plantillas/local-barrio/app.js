// Plantilla "Barrio": rotisería, empanadas, comida para llevar. Cálida, papel y terracota.
import { webLocal } from "../../nucleo/web.js";

// Frente del local con toldo a rayas, vidriera y la puerta.
const FRENTE = `<svg viewBox="0 0 340 280" fill="none" stroke="currentColor" stroke-width="3" stroke-linejoin="round" stroke-linecap="round">
  <ellipse cx="170" cy="262" rx="160" ry="10" fill="currentColor" opacity=".08" stroke="none"/>
  <rect x="34" y="74" width="272" height="186" class="relleno-papel"/>
  <path d="M34 74h272" />
  <path d="M22 74h296l-12 40H34z" fill="#fff"/>
  <path d="M22 74h37l-4 40H34zM96 74h37l-1 40H98zM170 74h37l2 40h-37zM244 74h37l6 40h-37z" class="relleno-acento"/>
  <path d="M34 114q9 12 18 0 9 12 18 0 9 12 18 0 9 12 18 0 9 12 18 0 9 12 18 0 9 12 18 0 9 12 18 0 9 12 18 0 9 12 18 0 9 12 18 0 9 12 18 0 9 12 18 0 9 12 18 0 9 12 18 0" fill="#fff"/>
  <rect x="52" y="140" width="140" height="84" rx="4" fill="#cfe3e8"/>
  <path d="M52 182h140M122 140v84"/>
  <path d="M62 178c6-12 26-12 32 0zM90 178c6-12 26-12 32 0z" fill="#e8b25b"/>
  <path d="M132 178c6-12 26-12 32 0zM156 178c6-12 26-12 32 0z" fill="#d79a48"/>
  <path d="M64 220c6-12 26-12 32 0zM132 220l20-22 20 22z" fill="#e8b25b"/>
  <path d="M60 150l20 20M140 150l14 14" stroke="#fff" stroke-width="4" opacity=".7"/>
  <rect x="212" y="140" width="76" height="120" fill="#7a4a2c"/>
  <rect x="222" y="152" width="56" height="44" rx="3" fill="#cfe3e8"/>
  <circle cx="276" cy="210" r="3.5" fill="#f2b632"/>
  <rect x="80" y="18" width="180" height="42" rx="21" fill="#fff"/>
  <text x="170" y="46" text-anchor="middle" font-family="Bitter, Georgia, serif" font-weight="800" font-size="20" fill="#2a1f1a" stroke="none" letter-spacing="1">{cartel}</text>
  <path d="M120 60v14M220 60v14"/>
  <path d="M24 260c0-18 8-26 16-26s16 8 16 26z" fill="#5aa04a"/>
  <path d="M300 260c0-22 10-32 18-32s14 10 14 32z" fill="#3f8a4a"/>
  <path d="M12 260h320"/>
</svg>`;

webLocal({ dibujo: FRENTE, textos: { destacados: "Lo que más sale", carta: "Todo lo que cocinamos" } });
