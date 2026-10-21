// Plantilla "Tostado": tostadores y cafeterías de especialidad. Ficha técnica de laboratorio:
// papel con grilla, tinta, un ocre, etiquetas en monoespaciada y la Chemex con anotaciones.
import { crear } from "../../nucleo/pagina.js";
import { webLocal } from "../../nucleo/web.js";

// Chemex con el filtro, la gota que cae y cotas de medida a los costados.
const CHEMEX = `<svg viewBox="0 0 300 340" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round">
  <g class="cotas" stroke-width="1" opacity=".55">
    <path d="M40 46v250M34 46h12M34 296h12"/>
    <path d="M70 318h160M70 312v12M230 312v12"/>
  </g>
  <text x="26" y="176" font-family="JetBrains Mono, monospace" font-size="10" fill="currentColor" stroke="none" transform="rotate(-90 26 176)" opacity=".7">600 ML</text>
  <text x="150" y="336" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="10" fill="currentColor" stroke="none" opacity=".7">92 °C · 1:16</text>
  <path d="M96 46h108l-38 104 38 104c4 12-4 42-54 42s-58-30-54-42l38-104z" class="vidrio"/>
  <path d="M100 52l40 92M200 52l-40 92" opacity=".35"/>
  <path d="M104 46l46 92 46-92z" class="filtro"/>
  <path d="M134 150h32l-6 18h-20z" class="madera"/>
  <path d="M150 168v8" class="cuerda" stroke-width="1.6"/>
  <ellipse class="gota" cx="150" cy="186" rx="3" ry="4.5" fill="currentColor" stroke="none"/>
  <path d="M104 262c10 10 82 10 92 0l-3 8c-6 18-80 18-86 0z" class="cafe"/>
  <path d="M110 254c12 6 68 6 80 0" opacity=".4"/>
  <g font-family="JetBrains Mono, monospace" font-size="9.5" fill="currentColor" stroke="none">
    <text x="214" y="80">FILTRO</text>
    <text x="214" y="160">CUELLO</text>
    <text x="214" y="262">{cartel}</text>
  </g>
  <path d="M206 77h-14M206 157h-38M206 259h-14" stroke-width="1" opacity=".6"/>
</svg>`;

// Ficha técnica: título a la izquierda; a la derecha, la Chemex en un recuadro y las cifras del
// local como tabla de especificaciones.
function portada(p) {
  const specs = (p.local.cifras ?? []).map((c, i) =>
    crear("div", { className: "ficha-fila" }, crear("dt", {}, `${String(i + 1).padStart(2, "0")} · ${c.texto}`), crear("dd", {}, c.valor)),
  );
  return crear(
    "div",
    { className: "ficha" },
    crear(
      "div",
      { className: "ficha-texto" },
      crear("p", { className: "ficha-etiqueta" }, `N.º 001 — ${p.local.nombre}`),
      p.titulo,
      p.bajada,
      crear("div", { className: "portada-botones" }, p.armador ?? p.verCarta, p.armador ? p.verCarta : p.pedir),
      p.estado,
    ),
    crear("div", { className: "ficha-lamina" }, crear("p", { className: "ficha-etiqueta" }, "Lámina A — Método"), p.dibujo, specs.length ? crear("dl", { className: "ficha-specs" }, specs) : null),
  );
}

webLocal({
  dibujo: CHEMEX,
  portada,
  cinta: false,
  textos: { destacados: "Lo que más sale de la barra", carta: "Carta de barra", historia: "El tostador", datos: "Dónde nos encontrás", verCarta: "Ver la carta", pedir: "Pedir por WhatsApp" },
});
