// Arma las páginas completas a partir del contenido. Las plantillas llaman a una de estas funciones
// con sus opciones (dibujo de portada, textos) y le dan el estilo con su CSS.
//
// - webLocal: web de pedidos de los planes Local y Local Plus (portada, destacados, armadores,
//   carta con carrito, historia y datos). Con <body data-modo="salon"> es la carta del salón
//   (la del QR de las mesas): la misma carta, para mirar y pedirle al mozo.
// - cartaSola: el plan Carta. Carta para mirar, con portada y datos del local.
import { armadores } from "./armadores-ui.js";
import { crearCarrito } from "./carrito.js";
import { botonTema, cargarContenido, crear, enlace, firma, svg } from "./pagina.js";
import { tomaPedidos } from "./pedido.js";
import { carta, datos, destacados, estado, whatsapp } from "./secciones.js";

const TEXTOS = {
  verCarta: "Ver la carta",
  pedir: "Pedir por WhatsApp",
  destacados: "Los más pedidos",
  carta: "La carta",
  historia: "Nuestra historia",
  datos: "Dónde y cuándo",
  salon: "Elegí tranquilo y pedile al mozo.",
  cartaDelSalon: "Carta del salón",
  webDelLocal: "Pedir para llevar",
};

/** Sección dentro de una banda de ancho completo (.banda-<id>), para que cada plantilla le dé fondo. */
function seccion(id, titulo, ...contenido) {
  return crear(
    "div",
    { className: `banda banda-${id}` },
    crear(
      "section",
      { className: `seccion seccion-${id}`, id, "aria-labelledby": titulo ? `${id}-titulo` : null },
      titulo ? crear("h2", { className: "seccion-titulo", id: `${id}-titulo` }, titulo) : null,
      ...contenido,
    ),
  );
}

function cabecera(local, enlaces) {
  return crear(
    "header",
    { className: "cabecera" },
    crear("a", { className: "cabecera-marca", href: "#inicio" }, local.nombre),
    enlaces.length ? crear("nav", { className: "cabecera-nav", "aria-label": "Secciones" }, enlaces.map(([href, texto]) => crear("a", { href }, texto))) : null,
    botonTema(),
  );
}

/** Los dibujos de portada pueden llevar {cartel}: el nombre del local sin el rubro ("DON TITO"). */
export function textoCartel(local) {
  if (local.cartel) return local.cartel;
  const sinRubro = local.nombre.replace(/^(rotiser[ií]a|caf[eé]|pizzer[ií]a|cervecer[ií]a|helader[ií]a|bodeg[oó]n|parrilla|panader[ií]a|bar)\s+/i, "");
  return sinRubro.replace(/\s+(burgers?|caf[eé]|helader[ií]a)$/i, "").toUpperCase();
}

const conCartel = (dibujo, local) => dibujo.replaceAll("{cartel}", textoCartel(local).replace(/[<&>]/g, ""));

function cinta(local) {
  const palabras = local.cinta?.length ? local.cinta : local.categorias.map((c) => c.nombre);
  const fila = () => crear("span", {}, palabras.map((p) => crear("span", { className: "cinta-palabra" }, p)));
  return crear("div", { className: "cinta", "aria-hidden": "true" }, crear("div", { className: "cinta-pista" }, fila(), fila()));
}

function cifras(local) {
  if (!local.cifras?.length) return null;
  return crear(
    "ul",
    { className: "cifras" },
    local.cifras.map((c) => crear("li", {}, crear("strong", {}, c.valor), crear("span", {}, c.texto))),
  );
}

function historia(local) {
  if (!local.historia?.length) return null;
  return local.historia.map((p) => crear("p", {}, p));
}

function pie(local, extra) {
  return crear("footer", { className: "pie" }, crear("p", { className: "pie-nombre" }, local.nombre), crear("p", { className: "pie-direccion" }, local.direccion), extra, firma());
}

/**
 * Web de pedidos (o carta del salón con data-modo="salon").
 * opciones.dibujo: SVG (texto) de la portada. opciones.textos: reemplaza títulos de TEXTOS.
 * opciones.puntos: línea de puntos en la carta.
 */
export async function webLocal(opciones = {}) {
  const local = await cargarContenido();
  const t = { ...TEXTOS, ...opciones.textos };
  const salon = document.body.dataset.modo === "salon";

  if (!salon && !tomaPedidos(local)) {
    // Plan Carta en una plantilla de Local: la dirección principal abre la carta.
    location.replace(enlace("carta.html"));
    return;
  }

  const carrito = salon ? null : crearCarrito(local);
  const { nav, filtros, cuerpo } = carta(local, { carrito, puntos: opciones.puntos });
  const listaArmadores = salon ? [] : armadores(local, carrito);

  const portada = crear(
    "section",
    { className: "portada", id: "inicio" },
    crear(
      "div",
      { className: "portada-texto" },
      estado(local),
      crear("h1", { className: "portada-titulo" }, local.eslogan ?? local.nombre),
      local.descripcion ? crear("p", { className: "portada-bajada" }, salon ? t.salon : local.descripcion) : null,
      crear(
        "div",
        { className: "portada-botones" },
        crear("a", { className: "boton boton-principal", href: "#carta" }, t.verCarta),
        salon ? null : crear("a", { className: "boton boton-secundario", href: whatsapp(local), target: "_blank", rel: "noopener" }, t.pedir),
      ),
    ),
    opciones.dibujo ? crear("div", { className: "portada-dibujo", "aria-hidden": "true" }, svg(conCartel(opciones.dibujo, local))) : null,
  );

  const enlaces = salon
    ? []
    : [
        ...listaArmadores.map((a, i) => [`#${a.id}`, local.armadores[i].menu ?? a.querySelector(".armador-titulo").textContent]),
        ["#carta", "Carta"],
        ["#datos", "Dónde estamos"],
      ];

  const partes = [
    cabecera(local, enlaces),
    crear(
      "main",
      {},
      portada,
      cinta(local),
      salon ? null : seccion("destacados", t.destacados, destacados(local, { carrito })),
      ...listaArmadores.map((a) => crear("div", { className: "banda banda-armador" }, crear("div", { className: "seccion seccion-armador" }, a))),
      seccion("carta", t.carta, crear("div", { className: "carta-barra" }, nav, filtros), cuerpo),
      local.cifras?.length || local.historia?.length ? seccion("historia", t.historia, cifras(local), crear("div", { className: "historia-texto" }, historia(local))) : null,
      seccion("datos", t.datos, datos(local)),
    ),
    pie(local, crear("a", { className: "pie-enlace", href: enlace(salon ? "index.html" : "carta.html") }, salon ? t.webDelLocal : t.cartaDelSalon)),
  ];
  document.body.append(...partes.filter(Boolean));
  return local;
}

/** Plan Carta: carta para mirar, con portada, filtros y datos del local. */
export async function cartaSola(opciones = {}) {
  const local = await cargarContenido();
  const t = { ...TEXTOS, ...opciones.textos };
  const { nav, filtros, cuerpo } = carta(local, { puntos: opciones.puntos });

  const portada = crear(
    "section",
    { className: "portada", id: "inicio" },
    opciones.dibujo ? crear("div", { className: "portada-dibujo", "aria-hidden": "true" }, svg(conCartel(opciones.dibujo, local))) : null,
    crear("p", { className: "portada-volanta" }, opciones.volanta ?? "Carta"),
    crear("h1", { className: "portada-titulo" }, local.nombre),
    local.eslogan ? crear("p", { className: "portada-bajada" }, local.eslogan) : null,
    estado(local),
  );

  const recomendados = destacados(local);
  document.body.append(
    crear(
      "header",
      { className: "cabecera" },
      crear("a", { className: "cabecera-marca", href: "#inicio" }, local.nombre),
      botonTema(),
    ),
    crear(
      "main",
      {},
      portada,
      recomendados ? seccion("destacados", opciones.textos?.destacados ?? "Recomendados de la casa", recomendados) : null,
      seccion("carta", null, crear("div", { className: "carta-barra" }, nav, filtros), cuerpo),
      seccion("datos", t.datos, datos(local)),
    ),
    pie(local),
  );
  return local;
}
