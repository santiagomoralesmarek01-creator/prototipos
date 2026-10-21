// Plantilla "Horno": pizzería porteña. Verde botella, bronce, piso a cuadros y tipografía condensada.
import { formatearPesos } from "../../nucleo/formato.js";
import { estadoDelLocal } from "../../nucleo/horario.js";
import { crear } from "../../nucleo/pagina.js";
import { webLocal } from "../../nucleo/web.js";

// Boca del horno con fuego, la pala sacando una pizza y el cartel de chapa con el nombre.
const HORNO = `<svg viewBox="0 0 360 320" fill="none" stroke="#1b1712" stroke-width="3" stroke-linejoin="round" stroke-linecap="round">
  <rect x="96" y="8" width="168" height="44" rx="6" fill="#c9a24a"/>
  <rect x="104" y="15" width="152" height="30" rx="3" fill="none" stroke="#7a5a1c" stroke-width="2"/>
  <text x="180" y="38" text-anchor="middle" font-family="Oswald, Impact, sans-serif" font-weight="700" font-size="20" letter-spacing="3" fill="#1b1712" stroke="none">{cartel}</text>
  <path d="M140 52v18M220 52v18"/>
  <path d="M40 300V170c0-58 63-100 140-100s140 42 140 100v130z" fill="#a4482c"/>
  <path d="M60 170c0-46 54-82 120-82s120 36 120 82" stroke="#7d3520" stroke-width="2"/>
  <path d="M74 120l14 10M110 92l8 14M180 80v16M250 92l-8 14M286 120l-14 10" stroke="#7d3520" stroke-width="2"/>
  <path d="M96 260v-58c0-38 38-66 84-66s84 28 84 66v58z" fill="#1b1712"/>
  <path d="M120 258c4-22 18-30 22-48 8 14 4 22 14 30 2-16 12-24 10-42 16 18 14 34 18 44 6-10 4-20 12-28 6 16 18 26 14 44z" fill="#f2a52c" stroke="none" class="fuego"/>
  <path d="M146 258c2-12 10-16 12-26 6 8 2 14 8 18 2-10 8-14 8-22 8 10 8 20 10 30z" fill="#ffe08a" stroke="none" class="fuego fuego-2"/>
  <path d="M20 300h320"/>
  <g class="pala">
    <path d="M206 236l140 64" stroke="#8a5a2b" stroke-width="9"/>
    <ellipse cx="190" cy="240" rx="62" ry="17" fill="#c89a6a"/>
    <ellipse cx="190" cy="232" rx="54" ry="13" fill="#d99a4e"/>
    <ellipse cx="190" cy="230" rx="46" ry="10" fill="#f6d98c" stroke="none"/>
    <circle cx="170" cy="229" r="5" fill="#d1453b" stroke="none"/><circle cx="196" cy="226" r="5" fill="#d1453b" stroke="none"/><circle cx="214" cy="232" r="5" fill="#d1453b" stroke="none"/>
    <ellipse cx="184" cy="234" rx="3" ry="2.5" fill="#3a5a2a" stroke="none"/><ellipse cx="206" cy="229" rx="3" ry="2.5" fill="#3a5a2a" stroke="none"/>
  </g>
</svg>`;

// Portada: la pared verde del local, con el horno a la izquierda y el texto a la derecha.
// Los botones llevan al pedido interactivo y a WhatsApp; el estado ("abierto") va en la pizarra.
function portada(p) {
  const botones = crear("div", { className: "portada-botones" }, p.armador ?? p.verCarta, p.pedir);
  return crear("div", { className: "frente" }, p.dibujo, crear("div", { className: "portada-texto" }, p.titulo, p.bajada, botones));
}

// En lugar de la cinta: una pizarra de tiza fija con lo de hoy.
function pizarra(local) {
  const e = estadoDelLocal(local.turnos ?? []);
  const especialidad = (local.cinta ?? local.categorias.map((c) => c.nombre)).slice(0, 3).join(" · ");
  const renglon = (titulo, texto) => crear("div", { className: "pizarra-renglon" }, crear("dt", {}, titulo), crear("dd", {}, texto));
  return crear(
    "div",
    { className: "pizarra-marco" },
    crear(
      "dl",
      { className: "pizarra" },
      renglon("Hoy", e.texto.replace("·", "—")),
      renglon("De la casa", especialidad),
      renglon(local.envio.disponible ? "Envíos" : "Retiro", local.envio.disponible ? `${local.envio.zona ?? "Consultá la zona"}${local.envio.costo ? ` · ${formatearPesos(local.envio.costo)}` : ""}` : local.direccion),
    ),
  );
}

webLocal({
  dibujo: HORNO,
  portada,
  cinta: pizarra,
  textos: { destacados: "Las que más salen", carta: "La carta", historia: "Desde siempre", datos: "Dónde y cuándo", verCarta: "Ver la carta", pedir: "Pedir por WhatsApp" },
});
