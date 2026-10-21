// Plantilla "Brote": cafetería de especialidad, brunch, pastelería. Salvia, crema y serif cursiva.
import { crear } from "../../nucleo/pagina.js";
import { webLocal } from "../../nucleo/web.js";

// Mesa redonda con taza humeante, plato de medialunas, una porción de torta y una planta.
const MESA = `<svg viewBox="0 0 360 300" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round">
  <circle cx="180" cy="150" r="138" class="relleno-suave" stroke="none"/>
  <path d="M250 70c10-30 40-36 52-20-18 2-34 10-40 26M262 92c26-14 52-4 54 16-18-8-36-8-50-4M246 112c22 2 40 20 36 38-12-14-26-22-40-24" class="relleno-hoja"/>
  <path d="M256 62c-6 40-8 80-4 120" />
  <rect x="236" y="176" width="36" height="34" rx="6" class="relleno-maceta"/>
  <ellipse cx="180" cy="214" rx="150" ry="26" class="relleno-mesa"/>
  <path d="M30 214v8c0 14 67 26 150 26s150-12 150-26v-8"/>
  <path d="M170 248v40M140 288h80"/>
  <ellipse cx="112" cy="206" rx="58" ry="12" fill="#fff"/>
  <path d="M70 198c4-16 14-24 22-24s16 8 20 22c-6-4-10-4-12-2l-4-10-5 11-5-11-4 10c-3-2-8-2-12 4z" fill="#e6a74a"/>
  <path d="M104 200c4-16 14-24 22-24s16 8 20 22c-6-4-10-4-12-2l-4-10-5 11-5-11-4 10c-3-2-8-2-12 4z" fill="#e6a74a"/>
  <ellipse cx="208" cy="204" rx="34" ry="8" fill="#fff"/>
  <path d="M182 200v-34h46v34c0 6-10 10-23 10s-23-4-23-10z" fill="#fff"/>
  <path d="M228 174h8a10 10 0 0 1 0 20h-8"/>
  <ellipse cx="205" cy="168" rx="22" ry="5" fill="#7b4a2c"/>
  <path d="M196 150q-8-10 0-20t0-20M212 152q-8-10 0-20t0-20" class="humo"/>
  <path d="M120 150l40-20v22l-40 14z" fill="#f6d7a7"/>
  <path d="M120 150l40-20 4 4-40 20z" fill="#8a4b2a"/>
  <circle cx="150" cy="134" r="5" fill="#e45b4b"/>
</svg>`;

// Portada editorial, centrada: estado arriba, el título gigante en cursiva, la mesa debajo como una
// foto de revista, y un solo botón; el pedido interactivo va como enlace de texto.
function portada(p) {
  if (p.armador) p.armador.className = "enlace-armador";
  return crear(
    "div",
    { className: "portada-centro" },
    p.estado,
    p.titulo,
    p.bajada,
    crear("div", { className: "portada-acciones" }, p.verCarta, p.armador ?? p.pedir),
    p.dibujo,
  );
}

webLocal({
  dibujo: MESA,
  portada,
  cinta: false,
  textos: { destacados: "Lo que pide todo el mundo", carta: "La carta", historia: "Cómo empezamos", datos: "Pasá a visitarnos", verCarta: "Ver la carta", pedir: "Pedir para llevar" },
});
