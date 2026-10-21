// Plantilla "Clásica" (plan Carta): carta impresa de restaurante o bodegón. Papel, doble filete,
// serif de imprenta y línea de puntos hasta el precio.
import { cartaSola } from "../../nucleo/web.js";

// Farol de esquina con ornamento: el emblema de la portada.
const EMBLEMA = `<svg viewBox="0 0 200 150" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
  <path d="M20 75h50M130 75h50"/>
  <path d="M70 75c-8-10-20-10-24-2s6 14 12 6M130 75c8-10 20-10 24-2s-6 14-12 6"/>
  <circle cx="18" cy="75" r="2.5" fill="currentColor"/><circle cx="182" cy="75" r="2.5" fill="currentColor"/>
  <path d="M100 8v14"/>
  <path d="M86 22h28l-4 8H90z" class="relleno-acento"/>
  <path d="M90 30l-6 48h32l-6-48z" class="relleno-luz"/>
  <path d="M100 30v48M87 54h26"/>
  <path d="M82 78h36l-4 8H86z" class="relleno-acento"/>
  <path d="M100 86v20M92 106h16"/>
  <path d="M100 116c-10 0-14 8-8 12 4 3 8 0 8-4 0 4 4 7 8 4 6-4 2-12-8-12z" class="relleno-acento"/>
</svg>`;

cartaSola({ dibujo: EMBLEMA, puntos: true, volanta: "Carta", textos: { destacados: "Recomendados de la casa", datos: "Visítenos" } });
