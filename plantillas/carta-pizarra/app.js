// Plantilla "Pizarra" (plan Carta): bares, cervecerías, bodegones. La página entera es una pizarra:
// en modo oscuro, de tiza; en modo claro, un pizarrón blanco escrito con marcador.
import { crear } from "../../nucleo/pagina.js";
import { cartaSola } from "../../nucleo/web.js";

// Chopp con espuma dibujado en tiza, con un par de rayas de brillo.
const CHOPP = `<svg viewBox="0 0 160 170" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M34 50h72l-6 104H40z" class="tiza-relleno"/>
  <path d="M106 66h14a16 16 0 0 1 16 16v26a16 16 0 0 1-16 16h-16"/>
  <path d="M30 50c-6-14 8-26 20-20 4-12 22-14 28-4 8-10 26-6 28 6 12-2 18 12 10 20"/>
  <path d="M52 76v58M70 72v66M88 76v58" stroke-width="2" opacity=".55"/>
  <circle cx="60" cy="96" r="2.5" class="burbuja"/><circle cx="80" cy="112" r="2" class="burbuja"/><circle cx="66" cy="124" r="2.5" class="burbuja"/>
  <path d="M18 160h124" stroke-dasharray="2 8"/>
</svg>`;

// La pizarra colgada: un marco de madera con el nombre en tiza, la frase y el estado.
function portada(p) {
  return crear(
    "div",
    { className: "pizarra-colgada" },
    crear("span", { className: "clavo", "aria-hidden": "true" }),
    crear("div", { className: "pizarra-hoja" }, p.volanta, p.titulo, p.dibujo, p.bajada, p.estado),
  );
}

cartaSola({ dibujo: CHOPP, portada, puntos: true, volanta: "Hoy en la pizarra", textos: { destacados: "Lo que recomienda la casa", datos: "Cuándo venir" } });
