// Plantilla "Noche": hamburguesería, bar, comida de noche. Carbón, brasas y humo, tipografía condensada.
import { webLocal } from "../../nucleo/web.js";

// Burger doble sobre la plancha, con humo que sube y una calcomanía con el nombre.
const BURGER = `<svg viewBox="0 0 360 340" fill="none" stroke="#141110" stroke-width="3.5" stroke-linejoin="round" stroke-linecap="round">
  <path class="humo" d="M120 70q-18-20 0-40t0-40" stroke="currentColor" stroke-width="5" opacity=".35"/>
  <path class="humo humo-2" d="M180 60q-18-20 0-40t0-40" stroke="currentColor" stroke-width="5" opacity=".35"/>
  <path class="humo humo-3" d="M240 70q-18-20 0-40t0-40" stroke="currentColor" stroke-width="5" opacity=".35"/>
  <path d="M60 156c0-50 54-78 120-78s120 28 120 78z" fill="#e0a24f"/>
  <path d="M100 112l6-2M140 98l6 1M184 94l6 0M226 102l6 2M262 120l5 3M120 128l6-1M206 120l6 1" stroke="#fff4dc" stroke-width="4"/>
  <path d="M48 166q20-14 40 0t44 0 44 0 44 0 44 0 48 0" stroke="#5aa04a" stroke-width="10"/>
  <path d="M52 172h256l-14 18-16-12-14 16-18-14H150l-18 18-16-16-18 12-14-16-20 14z" fill="#f2b632"/>
  <rect x="56" y="180" width="248" height="28" rx="14" fill="#4a2616"/>
  <path d="M74 190h30M130 196h24M180 190h36M240 196h28" stroke="#2a140b" stroke-width="3"/>
  <path d="M52 210h256l-12 16-16-12-16 14-16-12H150l-16 14-16-14-18 12-16-14-16 12z" fill="#f2b632"/>
  <rect x="56" y="218" width="248" height="28" rx="14" fill="#4a2616"/>
  <path d="M66 254h228a12 12 0 0 1 12 12v4a20 20 0 0 1-20 20H74a20 20 0 0 1-20-20v-4a12 12 0 0 1 12-12z" fill="#e0a24f"/>
  <path d="M30 304h300" stroke-width="5"/>
  <g class="sticker">
    <circle cx="300" cy="96" r="44" fill="var(--marca, #b3261e)" stroke="#141110"/>
    <text x="300" y="90" text-anchor="middle" font-family="Anton, Impact, sans-serif" font-size="18" fill="#fff" stroke="none">{cartel}</text>
    <text x="300" y="112" text-anchor="middle" font-family="Space Grotesk, sans-serif" font-size="11" font-weight="700" fill="#fff" stroke="none" letter-spacing="2">SMASH</text>
  </g>
</svg>`;

webLocal({
  dibujo: BURGER,
  textos: { destacados: "Las que la rompen", carta: "El menú", historia: "La historia", datos: "Dónde estamos", verCarta: "Ver el menú", pedir: "Pedir ya" },
});
