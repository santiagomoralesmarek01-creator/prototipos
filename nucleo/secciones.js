// Bloques que arman todas las plantillas: la carta (con o sin pedido), los destacados y los
// datos del local. Cada plantilla les da su aspecto con CSS sobre estas clases:
// .carta-nav, .carta-filtros, .carta-categoria, .carta-producto, .destacados, .datos…
import { dibujoPizza } from "./armadores-ui.js";
import { dibujoPara, svgDibujo } from "./dibujos.js";
import { formatearPesos } from "./formato.js";
import { estadoDelLocal, textoHorarios } from "./horario.js";
import { linkWhatsApp } from "./pedido.js";
import { crear, etiquetas, ETIQUETAS, linkMapa, seguirCategorias, svg } from "./pagina.js";

/** El dibujo de una categoría como elemento, o null. */
function dibujo(categoria, clase) {
  const nombre = dibujoPara(categoria);
  return nombre ? svg(svgDibujo(nombre, clase)) : null;
}

const idCategoria = (c) => `cat-${c.id}`;

/**
 * La carta completa. Opciones:
 * - carrito: el de nucleo/carrito.js; si falta, la carta es para mirar (plan Carta o salón).
 * - filtros: botones Vegetariano / Vegano / Sin TACC (sólo si algún producto los tiene).
 * - puntos: línea de puntos entre el nombre y el precio, estilo carta impresa.
 * Devuelve { nav, filtros, cuerpo } para que la plantilla los ubique.
 */
export function carta(local, { carrito, filtros = true, puntos = false } = {}) {
  const nav = crear(
    "nav",
    { className: "carta-nav", "aria-label": "Categorías" },
    crear("ul", {}, local.categorias.map((c) => crear("li", {}, crear("a", { href: `#${idCategoria(c)}` }, c.nombre)))),
  );

  const cuerpo = crear(
    "div",
    { className: "carta-cuerpo" },
    local.categorias.map((c) =>
      crear(
        "section",
        { className: "carta-categoria", id: idCategoria(c), "aria-labelledby": `${idCategoria(c)}-titulo` },
        crear("h2", { className: "carta-categoria-titulo", id: `${idCategoria(c)}-titulo` }, dibujo(c, "carta-categoria-dibujo"), crear("span", {}, c.nombre)),
        crear("ul", { className: "carta-lista" }, c.productos.map((p) => fila(p, { carrito, puntos }))),
      ),
    ),
  );

  let barraFiltros = null;
  const presentes = Object.keys(ETIQUETAS).filter((e) => local.categorias.some((c) => c.productos.some((p) => p.etiquetas?.includes(e))));
  if (filtros && presentes.length) {
    let activo = "";
    const botones = [["", "Todo"], ...presentes.map((e) => [e, ETIQUETAS[e]])].map(([valor, texto]) =>
      crear("button", { type: "button", "aria-pressed": String(valor === activo), onclick: () => elegir(valor) }, texto),
    );
    function elegir(valor) {
      activo = valor;
      botones.forEach((b, i) => b.setAttribute("aria-pressed", String(i === ["", ...presentes].indexOf(valor))));
      for (const li of cuerpo.querySelectorAll(".carta-producto")) li.hidden = !!valor && !li.dataset.etiquetas.split(" ").includes(valor);
      for (const sec of cuerpo.querySelectorAll(".carta-categoria")) sec.hidden = ![...sec.querySelectorAll(".carta-producto")].some((li) => !li.hidden);
    }
    barraFiltros = crear("div", { className: "carta-filtros", role: "group", "aria-label": "Filtrar la carta" }, botones);
  }

  requestAnimationFrame(() => seguirCategorias(nav));
  return { nav, filtros: barraFiltros, cuerpo };
}

function fila(p, { carrito, puntos }) {
  return crear(
    "li",
    { className: "carta-producto", "data-etiquetas": (p.etiquetas ?? []).join(" "), "data-agotado": p.agotado ? "" : null },
    p.foto ? crear("img", { className: "carta-producto-foto", src: p.foto, alt: "", loading: "lazy", width: 96, height: 96 }) : null,
    crear(
      "div",
      { className: "carta-producto-texto" },
      crear("h3", { className: "carta-producto-nombre" }, p.nombre, puntos ? crear("span", { className: "carta-puntos", "aria-hidden": "true" }) : null),
      p.descripcion ? crear("p", { className: "carta-producto-desc" }, p.descripcion) : null,
      etiquetas(p, "carta-producto-etiquetas"),
    ),
    crear("span", { className: "carta-producto-precio" }, p.agotado && !carrito ? "Agotado" : formatearPesos(p.precio)),
    carrito ? carrito.control(p) : null,
  );
}

/** Una pizza con sus ingredientes se dibuja tal cual; lo demás, con el dibujo del producto o de su categoría. */
function dibujoDestacado(p) {
  if (p.cubierta) {
    const pizza = dibujoPizza(p, p);
    pizza.classList.add("destacado-dibujo");
    pizza.setAttribute("aria-hidden", "true");
    return pizza;
  }
  const propio = dibujoPara({ id: p.id, nombre: p.nombre });
  return propio ? svg(svgDibujo(propio, "destacado-dibujo")) : dibujo(p.categoria, "destacado-dibujo");
}

/** Productos destacados (ids en `destacados`), con su control de pedido si hay carrito. */
export function destacados(local, { carrito } = {}) {
  const productos = (local.destacados ?? [])
    .map((id) => {
      const categoria = local.categorias.find((c) => c.productos.some((p) => p.id === id));
      return categoria && { ...categoria.productos.find((p) => p.id === id), categoria };
    })
    .filter(Boolean);
  if (!productos.length) return null;
  return crear(
    "ul",
    { className: "destacados" },
    productos.map((p, i) =>
      crear(
        "li",
        { className: "destacado", style: `--i:${i}` },
        crear("span", { className: "destacado-numero", "aria-hidden": "true" }, String(i + 1).padStart(2, "0")),
        dibujoDestacado(p),
        crear("h3", { className: "destacado-nombre" }, p.nombre),
        p.descripcion ? crear("p", { className: "destacado-desc" }, p.descripcion) : null,
        crear("span", { className: "destacado-precio" }, formatearPesos(p.precio)),
        carrito ? carrito.control(local.categorias.flatMap((c) => c.productos).find((x) => x.id === p.id)) : null,
      ),
    ),
  );
}

/** Píldora "Abierto · cierra a las 23", que se actualiza sola cada minuto. */
export function estado(local) {
  if (!local.turnos?.length) return null;
  const el = crear("p", { className: "estado" });
  const pintar = () => {
    const e = estadoDelLocal(local.turnos);
    el.textContent = e.texto;
    el.dataset.abierto = String(e.abierto);
  };
  pintar();
  setInterval(pintar, 60_000);
  return el;
}

/** Horarios, dirección, envío, pagos y contacto, en bloques .datos-bloque. */
export function datos(local) {
  const bloque = (titulo, ...contenido) => crear("div", { className: "datos-bloque" }, crear("h3", {}, titulo), ...contenido);
  return crear(
    "div",
    { className: "datos" },
    bloque("Horarios", crear("ul", {}, textoHorarios(local).map((h) => crear("li", {}, h))), estado(local)),
    bloque(
      "Dirección",
      crear("p", {}, local.direccion),
      crear("a", { className: "datos-enlace", href: linkMapa(local.direccion), target: "_blank", rel: "noopener" }, "Cómo llegar"),
    ),
    bloque(
      local.envio.disponible ? "Envíos" : "Retiro",
      crear(
        "p",
        {},
        local.envio.disponible
          ? `${local.envio.zona ?? "Consultanos la zona"}${local.envio.costo ? ` · ${formatearPesos(local.envio.costo)}` : " · sin cargo"}`
          : "Por ahora no hacemos envíos.",
      ),
    ),
    // Uno por renglón: separados con "·" el separador queda colgando al final de la línea.
    bloque("Medios de pago", crear("ul", {}, local.mediosDePago.map((m) => crear("li", {}, m)))),
    bloque(
      "Contacto",
      crear("a", { className: "datos-enlace", href: linkWhatsApp(local.whatsapp), target: "_blank", rel: "noopener" }, "WhatsApp"),
      local.instagram ? crear("a", { className: "datos-enlace", href: `https://instagram.com/${local.instagram}`, target: "_blank", rel: "noopener" }, `@${local.instagram}`) : null,
    ),
  );
}

/** Enlace de WhatsApp directo, para los botones de la portada. */
export const whatsapp = (local, texto = "Hola, quería hacer una consulta") => linkWhatsApp(local.whatsapp, texto);
