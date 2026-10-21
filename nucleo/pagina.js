// Lo compartido por todas las plantillas en el navegador: cargar el contenido, crear elementos,
// modo claro/oscuro, color de marca, aviso de demo y la firma.

/** Firma al pie de todas las páginas. Para cambiar el texto o sumarle un enlace, se edita acá. */
export const FIRMA = { texto: "Hecho por", autor: "MrK", enlace: "" };

export const ETIQUETAS = { vegano: "Vegano", vegetariano: "Vegetariano", "sin-tacc": "Sin TACC" };

const parametros = new URLSearchParams(location.search);

/**
 * crear("p", { className: "x", onclick }, "texto", hijo). Los atributos que no son propiedades
 * (data-*, aria-*) se pasan igual y van con setAttribute.
 */
export function crear(etiqueta, atributos = {}, ...hijos) {
  const el = document.createElement(etiqueta);
  for (const [clave, valor] of Object.entries(atributos)) {
    if (valor === undefined || valor === null || valor === false) continue;
    if (clave.startsWith("data-") || clave.startsWith("aria-") || clave === "role" || clave === "for") el.setAttribute(clave, valor);
    else el[clave] = valor;
  }
  el.append(...hijos.flat().filter((h) => h !== undefined && h !== null && h !== false));
  return el;
}

/** Elemento SVG desde un texto (los dibujos de cada plantilla). */
export function svg(codigo) {
  const plantilla = document.createElement("template");
  plantilla.innerHTML = codigo.trim();
  return plantilla.content.firstElementChild;
}

/**
 * Lee el contenido del local. La ruta sale de <body data-contenido="…">. En el repo de prototipos
 * (body con data-catalogo) se puede probar otro contenido con ?contenido=<nombre> y el plan Carta
 * con ?plan=carta; en una entrega esos parámetros no hacen nada.
 */
export async function cargarContenido() {
  const base = document.body.dataset.contenido;
  let ruta = base;
  const catalogo = "catalogo" in document.body.dataset;
  const otro = parametros.get("contenido");
  if (catalogo && otro && /^[a-z0-9-]+$/.test(otro)) ruta = base.replace(/[^/]+\.json$/, `${otro}.json`);

  try {
    const respuesta = await fetch(ruta, { cache: "no-cache" });
    if (!respuesta.ok) throw new Error(String(respuesta.status));
    const local = await respuesta.json();
    if (catalogo && parametros.get("plan")) local.plan = parametros.get("plan");
    prepararPagina(local);
    return local;
  } catch {
    document.body.replaceChildren(crear("p", { className: "sin-datos" }, "No pudimos cargar la carta. Probá de nuevo en un rato."));
    throw new Error(`No se pudo leer ${ruta}`);
  }
}

/** Mantiene ?contenido y ?plan al pasar de la web a la carta (sólo en el catálogo). */
export function enlace(pagina) {
  if (!("catalogo" in document.body.dataset)) return pagina;
  const p = new URLSearchParams();
  for (const clave of ["contenido", "plan"]) if (parametros.get(clave)) p.set(clave, parametros.get(clave));
  return p.size ? `${pagina}?${p}` : pagina;
}

function prepararPagina(local) {
  const raiz = document.documentElement;
  if (local.marca?.color) raiz.style.setProperty("--marca", local.marca.color);
  if (local.marca?.colorOscuro) raiz.style.setProperty("--marca-oscuro", local.marca.colorOscuro);
  // Los <title> de las plantillas llevan {nombre}: "Carta · {nombre}".
  document.title = document.title.replace("{nombre}", local.nombre);
  const descripcion = document.querySelector('meta[name="description"]');
  if (descripcion && local.descripcion) descripcion.content = local.descripcion;
  if (local.demo) document.body.prepend(crear("p", { className: "aviso-demo" }, "Local de demostración: el negocio y los precios son ficticios."));
}

// ---------- Modo claro / oscuro ----------
// Sigue al teléfono; el botón lo cambia y se recuerda en el dispositivo.

const CLAVE_TEMA = "tema";
const oscuroDelSistema = matchMedia("(prefers-color-scheme: dark)");

function leerTema() {
  try {
    return localStorage.getItem(CLAVE_TEMA);
  } catch {
    return null;
  }
}

export function aplicarTema() {
  document.documentElement.dataset.tema = leerTema() ?? (oscuroDelSistema.matches ? "oscuro" : "claro");
}

/** Botón que alterna el tema. Devuelve el elemento para que cada plantilla lo ubique donde quiera. */
export function botonTema() {
  const boton = crear("button", { type: "button", className: "boton-tema" });
  const pintar = () => {
    const oscuro = document.documentElement.dataset.tema === "oscuro";
    boton.textContent = oscuro ? "Modo claro" : "Modo oscuro";
    boton.setAttribute("aria-pressed", String(oscuro));
  };
  boton.addEventListener("click", () => {
    const nuevo = document.documentElement.dataset.tema === "oscuro" ? "claro" : "oscuro";
    try {
      localStorage.setItem(CLAVE_TEMA, nuevo);
    } catch {}
    aplicarTema();
    pintar();
  });
  oscuroDelSistema.addEventListener("change", () => {
    if (!leerTema()) {
      aplicarTema();
      pintar();
    }
  });
  pintar();
  return boton;
}

export function firma() {
  const autor = FIRMA.enlace ? crear("a", { href: FIRMA.enlace, target: "_blank", rel: "noopener" }, FIRMA.autor) : crear("strong", {}, FIRMA.autor);
  return crear("p", { className: "firma" }, `${FIRMA.texto} `, autor);
}

export const movimientoReducido = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Link a Google Maps con la dirección. */
export const linkMapa = (direccion) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(direccion)}`;

/** Lista de etiquetas de un producto ("Vegano · Sin TACC"), o null si no tiene. */
export function etiquetas(producto, clase = "etiquetas") {
  if (!producto.etiquetas?.length) return null;
  return crear("span", { className: clase }, producto.etiquetas.map((e) => ETIQUETAS[e]).join(" · "));
}

/** Marca la categoría visible en una barra de pestañas: enlaces con href="#<id>" dentro de `nav`. */
export function seguirCategorias(nav) {
  const enlaces = [...nav.querySelectorAll("a[href^='#']")];
  const observador = new IntersectionObserver(
    (entradas) => {
      for (const e of entradas) {
        if (!e.isIntersecting) continue;
        for (const a of enlaces) {
          const activo = a.getAttribute("href") === `#${e.target.id}`;
          a.toggleAttribute("aria-current", activo);
          if (activo) a.scrollIntoView({ block: "nearest", inline: "center", behavior: movimientoReducido() ? "auto" : "smooth" });
        }
      }
    },
    { rootMargin: "-30% 0px -65% 0px" },
  );
  for (const a of enlaces) {
    const destino = document.getElementById(a.getAttribute("href").slice(1));
    if (destino) observador.observe(destino);
  }
}

aplicarTema();
