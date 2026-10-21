// Página del catálogo: tarjetas con captura que se recorre al pasar el mouse, filtros por tipo y
// rubro, y un selector para ver cada plantilla con el contenido de otro local.
import { CONTENIDOS, PLANES, PLANTILLAS, RUBROS, TIPOS } from "./catalogo.js";

const grilla = document.getElementById("grilla");
const filtro = { tipo: "todos", rubro: "todos" };

const el = (etiqueta, atributos = {}, ...hijos) => {
  const e = document.createElement(etiqueta);
  for (const [k, v] of Object.entries(atributos)) {
    if (v === undefined || v === null || v === false) continue;
    if (k.startsWith("data-") || k.startsWith("aria-") || k === "role") e.setAttribute(k, v);
    else e[k] = v;
  }
  e.append(...hijos.flat().filter((h) => h !== null && h !== undefined && h !== false));
  return e;
};

function enlace(p, contenido, pagina = "") {
  const base = `plantillas/${p.id}/${pagina}`;
  return contenido && contenido !== p.contenido ? `${base}?contenido=${contenido}` : base;
}

function tarjeta(p) {
  let contenido = p.contenido;
  const ver = el("a", { className: "boton boton-principal", href: enlace(p, contenido) }, p.tipo === "app" ? "Abrir la app" : "Ver la página");
  const salon = p.salon ? el("a", { className: "boton", href: enlace(p, contenido, "carta.html") }, "Carta del salón") : null;
  const selector =
    p.tipo === "app"
      ? null
      : el(
          "label",
          { className: "probar" },
          el("span", {}, "Probar con"),
          el(
            "select",
            {
              onchange: (e) => {
                contenido = e.target.value;
                ver.href = enlace(p, contenido);
                if (salon) salon.href = enlace(p, contenido, "carta.html");
              },
            },
            Object.entries(CONTENIDOS).map(([id, nombre]) => el("option", { value: id, selected: id === p.contenido }, nombre)),
          ),
        );

  return el(
    "article",
    { className: "tarjeta", "data-tipo": p.tipo },
    el(
      "a",
      { className: "captura", href: enlace(p, contenido), "aria-label": `Ver ${p.nombre}` },
      el("span", { className: "captura-barra", "aria-hidden": "true" }, el("i"), el("i"), el("i")),
      el("img", { src: `capturas/${p.id}.jpg`, alt: `Captura de la plantilla ${p.nombre}`, loading: "lazy", width: 640 }),
    ),
    el(
      "div",
      { className: "tarjeta-texto" },
      el("p", { className: "tarjeta-tipo" }, `${TIPOS[p.tipo]} · ${p.rubros.map((r) => RUBROS[r]).join(", ")}`),
      el("h2", {}, p.nombre),
      el("p", { className: "tarjeta-estilo" }, p.estilo),
      el("ul", { className: "tarjeta-interacciones", "aria-label": "Interacciones" }, p.interacciones.map((i) => el("li", {}, i))),
      el("p", { className: "tarjeta-planes" }, p.planes.map((pl) => el("span", {}, PLANES[pl]))),
      el("div", { className: "tarjeta-acciones" }, ver, salon, selector),
    ),
  );
}

function botones(contenedor, opciones, clave) {
  const cuenta = (valor) => PLANTILLAS.filter((p) => valor === "todos" || (clave === "tipo" ? p.tipo === valor : p.rubros.includes(valor))).length;
  contenedor.replaceChildren(
    ...opciones
      .filter(([valor]) => cuenta(valor) > 0)
      .map(([valor, texto]) =>
        el("button", { type: "button", role: "radio", "aria-checked": String(filtro[clave] === valor), onclick: () => ((filtro[clave] = valor), pintar()) }, texto, el("span", {}, String(cuenta(valor)))),
      ),
  );
}

function pintar() {
  botones(document.getElementById("filtro-tipo"), [["todos", "Todas"], ...Object.entries(TIPOS)], "tipo");
  botones(document.getElementById("filtro-rubro"), [["todos", "Todos los rubros"], ...Object.entries(RUBROS)], "rubro");
  const visibles = PLANTILLAS.filter((p) => (filtro.tipo === "todos" || p.tipo === filtro.tipo) && (filtro.rubro === "todos" || p.rubros.includes(filtro.rubro)));
  grilla.replaceChildren(...(visibles.length ? visibles.map(tarjeta) : [el("p", { className: "vacio" }, "No hay plantillas con esos filtros todavía.")]));
}

pintar();
