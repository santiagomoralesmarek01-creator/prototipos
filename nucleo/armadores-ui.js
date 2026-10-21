// Interfaz de los armadores (ver nucleo/armadores.js). Cada uno devuelve una <section class="armador">
// lista para insertar; el aspecto base está en nucleo/armadores.css y cada plantilla lo ajusta
// con sus variables.
import { box, burger, cafe, juntada, menu, mitades, pizza, vianda } from "./armadores.js";
import { dibujoPara, svgDibujo } from "./dibujos.js";
import { formatearPesos } from "./formato.js";
import { crear, svg } from "./pagina.js";

/** Todos los armadores del contenido, en el orden en que están. */
export function armadores(local, carrito) {
  return (local.armadores ?? []).map((cfg) => ARMADORES[cfg.tipo]?.(local, cfg, carrito)).filter(Boolean);
}

const ARMADORES = { vianda: armadorVianda, box: armadorBox, burger: armadorBurger, mitades: armadorMitades, juntada: armadorJuntada, cafe: armadorCafe, pizza: armadorPizza, menu: armadorMenu };

function cabeza(cfg, tituloPorDefecto, bajadaPorDefecto) {
  return crear(
    "header",
    { className: "armador-cabeza" },
    crear("p", { className: "armador-volanta" }, cfg.volanta ?? "Pedido a tu medida"),
    crear("h2", { className: "armador-titulo" }, cfg.titulo ?? tituloPorDefecto),
    crear("p", { className: "armador-bajada" }, cfg.bajada ?? bajadaPorDefecto),
  );
}

function resumen(titulo) {
  const precio = crear("strong", { className: "armador-precio" });
  const nota = crear("span", { className: "armador-nota" });
  const boton = crear("button", { type: "button", className: "armador-sumar" }, "Sumar al pedido");
  const caja = crear("div", { className: "armador-resumen", "aria-live": "polite" }, crear("p", { className: "armador-resumen-titulo" }, titulo), crear("div", {}, precio, nota), boton);
  return { caja, precio, nota, boton };
}

// Colores de comida (dorados, tostados, tomate, verdura, crema), para los lugares de la caja y los
// táperes. Cada producto tiene siempre el mismo; un producto puede fijar el suyo con `color`.
const COLORES_COMIDA = ["#e8b25b", "#d79a48", "#c9714a", "#e2a05a", "#f2c26b", "#b5532f", "#9cc56b", "#e45b4b", "#f4d9a6", "#a8672f", "#f0a38a", "#7b4a2c"];

/** Color estable para un producto. */
export function colorDe(id, producto) {
  if (producto?.color) return producto.color;
  let h = 0;
  for (const c of id) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return COLORES_COMIDA[h % COLORES_COMIDA.length];
}

// ---------- Vianda semanal ----------

const TAPER = `<svg viewBox="0 0 100 70" aria-hidden="true"><rect class="taper-tapa" x="6" y="8" width="88" height="12" rx="5"/><path class="taper-cuerpo" d="M10 22h80l-5 40a6 6 0 0 1-6 5H21a6 6 0 0 1-6-5z"/><path class="taper-comida" d="M18 36c10-8 18 4 28-2s18-8 26 0 12 2 12 2l-3 24a4 4 0 0 1-4 4H25a4 4 0 0 1-4-4z"/></svg>`;

function armadorVianda(local, cfg, carrito) {
  const opciones = vianda.opciones(local, cfg);
  if (!opciones.length) return null;
  const dias = vianda.dias(cfg);
  let eleccion = {};

  const grilla = crear("ol", { className: "vianda-dias" });
  const r = resumen("Tu semana");
  const pista = crear("p", { className: "armador-pista" });

  function pintar() {
    grilla.replaceChildren(
      ...dias.map((d) => {
        const elegido = opciones.find((p) => p.id === eleccion[d]);
        const dibujo = svg(TAPER);
        if (elegido) dibujo.style.setProperty("--comida", colorDe(elegido.id));
        const select = crear(
          "select",
          { "aria-label": `Plato del ${vianda.nombreDia(d).toLowerCase()}`, onchange: (e) => ((eleccion = { ...eleccion, [d]: e.target.value || undefined }), pintar()) },
          crear("option", { value: "" }, "Sin vianda"),
          opciones.map((p) => crear("option", { value: p.id, selected: p.id === eleccion[d] }, `${p.nombre} · ${formatearPesos(p.precio)}`)),
        );
        return crear("li", { className: "vianda-dia", "data-lleno": elegido ? "" : null }, crear("span", { className: "vianda-dia-nombre" }, vianda.nombreDia(d)), dibujo, crear("span", { className: "vianda-plato" }, elegido?.nombre ?? "Elegí un plato"), select);
      }),
    );

    const c = vianda.calcular(local, cfg, eleccion);
    const n = c.platos.length;
    r.precio.textContent = n ? formatearPesos(c.total) : "Elegí al menos un día";
    r.nota.textContent = c.ahorro ? `Antes ${formatearPesos(c.subtotal)} · ahorrás ${formatearPesos(c.ahorro)} (${c.porcentaje} %)` : n ? `${n} ${n === 1 ? "vianda" : "viandas"}` : "";
    r.boton.disabled = !n;
    const proximo = (cfg.descuentos ?? []).filter((x) => x.desde > n).sort((a, b) => a.desde - b.desde)[0];
    pista.textContent = proximo ? `Con ${proximo.desde} días tenés ${proximo.porcentaje} % de descuento${n ? `: te ${proximo.desde - n === 1 ? "falta 1" : `faltan ${proximo.desde - n}`}` : ""}.` : n ? "Tenés el mejor descuento." : "";
  }

  r.boton.addEventListener("click", () => {
    const id = vianda.id(cfg, eleccion);
    if (!id) return;
    carrito.agregar(id);
    eleccion = {};
    pintar();
  });

  const rapido = crear(
    "button",
    {
      type: "button",
      className: "armador-secundario",
      onclick: () => {
        // Completa la semana sin repetir plato dos días seguidos.
        eleccion = Object.fromEntries(dias.map((d, i) => [d, opciones[i % opciones.length].id]));
        pintar();
      },
    },
    "Completar la semana",
  );

  pintar();
  return crear("section", { className: "armador armador-vianda", id: "armador-vianda" }, cabeza(cfg, "Armá tu semana", "Elegí un plato para cada día y te lo llevamos el lunes, listo para la heladera."), grilla, crear("div", { className: "armador-acciones" }, rapido, pista), r.caja);
}

// ---------- Box para llenar ----------

/** Dibujo del producto por su nombre (medialuna, galletita, budín…), o null si no hay uno parecido. */
function dibujoDe(producto) {
  const nombre = dibujoPara({ id: producto.id, nombre: producto.nombre });
  return nombre ? svg(svgDibujo(nombre, "box-dibujo")) : null;
}

function armadorBox(local, cfg, carrito) {
  const opciones = box.opciones(local, cfg);
  if (!opciones.length) return null;
  const tamanios = box.tamanios(cfg);
  let lugares = tamanios[0].lugares;
  let items = [];
  let regalo = false;

  const tamanio = crear("div", { className: "box-tamanios", role: "radiogroup", "aria-label": "Tamaño de la caja" });
  const caja = crear("div", { className: "box-caja" });
  const lista = crear("ul", { className: "box-opciones" });
  const tarjeta = cfg.regalo !== undefined ? crear("label", { className: "box-regalo" }, crear("input", { type: "checkbox", onchange: (e) => ((regalo = e.target.checked), pintar()) }), `Para regalo, con moño y tarjeta (+${formatearPesos(cfg.regalo)})`) : null;
  const r = resumen("Tu caja");

  function pintar() {
    tamanio.replaceChildren(
      ...tamanios.map((t) =>
        crear(
          "button",
          {
            type: "button",
            role: "radio",
            "aria-checked": String(t.lugares === lugares),
            onclick: () => {
              lugares = t.lugares;
              items = items.slice(0, lugares);
              pintar();
            },
          },
          `${t.lugares} lugares`,
          t.descuento ? crear("small", {}, `−${t.descuento} %`) : null,
        ),
      ),
    );

    caja.style.setProperty("--columnas", String(lugares <= 4 ? 2 : lugares <= 6 ? 3 : 4));
    caja.replaceChildren(
      ...Array.from({ length: lugares }, (_, i) => {
        const id = items[i];
        const p = id && opciones.find((o) => o.id === id);
        return p
          ? crear(
              "button",
              { type: "button", className: "box-lugar", "data-lleno": "", style: `--color:${colorDe(p.id)}`, "aria-label": `Sacar ${p.nombre}`, onclick: () => ((items = items.filter((_, j) => j !== i)), pintar()) },
              dibujoDe(p) ?? crear("span", { className: "box-inicial", "aria-hidden": "true" }, p.nombre[0]),
              crear("span", { className: "box-nombre" }, p.nombre),
            )
          : crear("span", { className: "box-lugar", "aria-hidden": "true" });
      }),
    );

    const lleno = items.length >= lugares;
    lista.replaceChildren(
      ...opciones.map((p) => {
        const n = items.filter((i) => i === p.id).length;
        return crear(
          "li",
          {},
          crear(
            "button",
            { type: "button", className: "box-opcion", disabled: lleno, style: `--color:${colorDe(p.id)}`, onclick: () => ((items = [...items, p.id]), pintar()) },
            crear("span", { className: "box-punto", "aria-hidden": "true" }),
            crear("span", {}, p.nombre),
            crear("small", {}, formatearPesos(p.precio)),
            n ? crear("span", { className: "box-cuenta" }, `× ${n}`) : null,
          ),
        );
      }),
    );

    const c = box.calcular(local, cfg, lugares, items, regalo);
    r.precio.textContent = formatearPesos(c.total);
    r.nota.textContent = c.faltan ? `Te ${c.faltan === 1 ? "falta 1 lugar" : `faltan ${c.faltan} lugares`}` : c.ahorro ? `Ahorrás ${formatearPesos(c.ahorro)} con la caja de ${lugares}` : "Caja completa";
    r.boton.disabled = !c.completo;
    r.boton.textContent = c.completo ? "Sumar al pedido" : "Completá la caja";
  }

  r.boton.addEventListener("click", () => {
    const id = box.id(lugares, items, regalo);
    if (!id) return;
    carrito.agregar(id);
    items = [];
    pintar();
  });

  pintar();
  return crear(
    "section",
    { className: "armador armador-box", id: "armador-box" },
    cabeza(cfg, "Armá tu caja", "Elegí qué va en cada lugar. Tocá uno lleno para sacarlo."),
    crear("div", { className: "box-cuerpo" }, crear("div", { className: "box-izq" }, tamanio, caja), crear("div", { className: "box-der" }, lista, tarjeta)),
    r.caja,
  );
}

// ---------- Burger capa por capa ----------

const FORMAS = {
  medallon: (y, c) => `<rect x="14" y="${y - 13}" width="172" height="15" rx="7" fill="${c ?? "#5b3320"}"/><path d="M24 ${y - 9}h20M60 ${y - 6}h16M100 ${y - 9}h22M140 ${y - 6}h18" stroke="rgb(0 0 0 / .25)" stroke-width="2" stroke-linecap="round"/>`,
  // Feta que se derrite: un poco más ancha que el medallón, con gotas redondeadas que caen.
  queso: (y, c) =>
    `<path d="M10 ${y - 7}h180v4c0 3-4 3-6 3h-22c-4 0-5 2-5 6s-3 6-6 6-6-2-6-6-1-6-5-6H96c-4 0-5 2-5 4s-3 4-5 4-5-2-5-4-1-4-5-4H40c-4 0-5 3-5 7s-3 6-6 6-6-2-6-6-1-7-5-7h-2c-3 0-6 0-6-3z" fill="${c ?? "#f2b632"}"/>`,
  panceta: (y, c) => `<path d="M16 ${y - 4}q15-8 30 0t30 0 30 0 30 0 30 0 18 0" fill="none" stroke="${c ?? "#c2453a"}" stroke-width="6" stroke-linecap="round"/>`,
  hoja: (y, c) => `<path d="M12 ${y - 3}q12-10 22 0t22 0 22 0 22 0 22 0 22 0 22 0 22 0" fill="none" stroke="${c ?? "#5aa04a"}" stroke-width="7" stroke-linecap="round"/>`,
  tomate: (y, c) => `<rect x="30" y="${y - 7}" width="62" height="8" rx="4" fill="${c ?? "#e2483d"}"/><rect x="104" y="${y - 7}" width="62" height="8" rx="4" fill="${c ?? "#e2483d"}"/>`,
  cebolla: (y, c) => `<path d="M30 ${y - 3}a14 6 0 0 1 28 0M70 ${y - 3}a14 6 0 0 1 28 0M110 ${y - 3}a14 6 0 0 1 28 0M146 ${y - 3}a12 5 0 0 1 24 0" fill="none" stroke="${c ?? "#c9a0d6"}" stroke-width="4"/>`,
  salsa: (y, c) => `<path d="M18 ${y - 3}h164q-6 5-14 3t-16 3-18-2-20 3-22-3-20 2-18-1-20 2z" fill="${c ?? "#e0702a"}"/>`,
  huevo: (y) => `<ellipse cx="100" cy="${y - 5}" rx="58" ry="7" fill="#fff8ec"/><circle cx="100" cy="${y - 6}" r="8" fill="#f2a52c"/>`,
  pepino: (y, c) => `<g fill="${c ?? "#8bb05a"}"><ellipse cx="50" cy="${y - 3}" rx="16" ry="4"/><ellipse cx="100" cy="${y - 3}" rx="16" ry="4"/><ellipse cx="150" cy="${y - 3}" rx="16" ry="4"/></g>`,
};
/** Color de cada forma cuando la capa no trae `color` (para el dibujo y la muestra de la lista). */
const COLOR_FORMA = { medallon: "#5b3320", queso: "#f2b632", panceta: "#c2453a", hoja: "#5aa04a", tomate: "#e2483d", cebolla: "#c9a0d6", salsa: "#e0702a", huevo: "#f2a52c", pepino: "#8bb05a" };
const ALTO = { medallon: 16, queso: 6, panceta: 8, hoja: 8, tomate: 9, cebolla: 6, salsa: 5, huevo: 10, pepino: 6 };

/** Dibujo de la burger: de abajo hacia arriba, el pan, cada capa repetida según la cantidad y la tapa. */
export function dibujoBurger(cfg, eleccion) {
  const r = burger.calcular(cfg, eleccion);
  // Como en una burger de verdad: cada medallón lleva su feta de queso arriba; el resto va encima.
  const repetir = (c) => Array.from({ length: c.cantidad }, () => c);
  const medallones = r.capas.filter((c) => c.forma === "medallon").flatMap(repetir);
  const fetas = r.capas.filter((c) => c.forma === "queso").flatMap(repetir);
  const pisos = medallones.flatMap((m, i) => (fetas[i] ? [m, fetas[i]] : [m]));
  pisos.push(...fetas.slice(medallones.length), ...r.capas.filter((c) => c.forma !== "medallon" && c.forma !== "queso").flatMap(repetir));
  const alto = 40 + pisos.reduce((s, c) => s + (ALTO[c.forma] ?? 8), 0) + 60;
  const colorPan = r.pan.color ?? "#d99a4e";
  let y = alto - 14;
  let partes = `<path d="M16 ${y - 18}h168v8a12 12 0 0 1-12 12H28a12 12 0 0 1-12-12z" fill="${colorPan}"/>`;
  y -= 20;
  for (const c of pisos) {
    partes += `<g class="burger-capa">${(FORMAS[c.forma] ?? FORMAS.salsa)(y, c.color)}</g>`;
    y -= ALTO[c.forma] ?? 8;
  }
  partes += `<path class="burger-tapa" d="M14 ${y}c0-34 40-52 86-52s86 18 86 52z" fill="${colorPan}"/>`;
  if (r.pan.semillas !== false) {
    for (const [x, dy] of [[60, 26], [86, 36], [112, 30], [138, 22], [100, 18], [74, 14], [124, 12]]) partes += `<ellipse cx="${x}" cy="${y - dy}" rx="3" ry="1.6" fill="#fff4dc"/>`;
  }
  return svg(`<svg class="burger-dibujo" viewBox="0 ${y - 60} 200 ${alto - y + 60}" role="img" aria-label="${burger.describir(cfg, eleccion)}">${partes}</svg>`);
}

function armadorBurger(local, cfg, carrito) {
  let eleccion = burger.inicial(cfg);
  const escena = crear("div", { className: "burger-escena" });
  const panes = crear("div", { className: "burger-panes", role: "radiogroup", "aria-label": "Pan" });
  const capas = crear("ul", { className: "burger-capas" });
  const r = resumen("Tu burger");

  function pintar() {
    escena.replaceChildren(dibujoBurger(cfg, eleccion));
    panes.replaceChildren(
      ...cfg.panes.map((p) =>
        crear(
          "button",
          { type: "button", role: "radio", "aria-checked": String(p.id === eleccion.pan), onclick: () => ((eleccion = { ...eleccion, pan: p.id }), pintar()) },
          p.nombre,
          crear("small", {}, formatearPesos(p.precio)),
        ),
      ),
    );
    capas.replaceChildren(
      ...cfg.capas.map((c) => {
        const n = eleccion[c.id] ?? 0;
        return crear(
          "li",
          { className: "burger-capa-fila" },
          crear("span", { className: "burger-muestra", style: `--color:${c.color ?? COLOR_FORMA[c.forma] ?? "currentColor"}`, "aria-hidden": "true" }),
          crear("span", { className: "burger-capa-nombre" }, c.nombre, crear("small", {}, `${formatearPesos(c.precio)} c/u${c.max > 1 ? ` · hasta ${c.max}` : ""}`)),
          crear(
            "span",
            { className: "control" },
            crear("button", { type: "button", className: "control-paso", disabled: n <= (c.min ?? 0), "aria-label": `Menos ${c.nombre}`, onclick: () => ((eleccion = burger.cambiar(cfg, eleccion, c.id, -1)), pintar()) }, "−"),
            crear("span", { className: "control-cantidad" }, String(n)),
            crear("button", { type: "button", className: "control-paso", disabled: n >= c.max, "aria-label": `Más ${c.nombre}`, onclick: () => ((eleccion = burger.cambiar(cfg, eleccion, c.id, 1)), pintar()) }, "+"),
          ),
        );
      }),
    );
    const c = burger.calcular(cfg, eleccion);
    r.precio.textContent = formatearPesos(c.total);
    r.nota.textContent = burger.describir(cfg, eleccion);
  }

  r.boton.addEventListener("click", () => {
    carrito.agregar(burger.id(cfg, eleccion));
    eleccion = burger.inicial(cfg);
    pintar();
  });

  pintar();
  return crear(
    "section",
    { className: "armador armador-burger", id: "armador-burger" },
    cabeza(cfg, "Armá tu burger", "Sumá capas y mirala crecer. El precio se arma solo."),
    crear("div", { className: "burger-cuerpo" }, escena, crear("div", { className: "burger-opciones" }, panes, capas)),
    r.caja,
  );
}

// ---------- Pizza por mitades ----------

/** Capa de queso: un círculo apenas ondulado, centrado en la pizza de 240 × 240. */
function queso(radio) {
  const puntos = Array.from({ length: 36 }, (_, i) => {
    const a = (i / 36) * Math.PI * 2;
    const r = radio * (1 + 0.025 * Math.sin(a * 5) + 0.015 * Math.cos(a * 3));
    return `${(120 + r * Math.cos(a)).toFixed(1)} ${(120 + r * Math.sin(a)).toFixed(1)}`;
  });
  return `<path d="M${puntos.join("L")}Z" fill="#f6d98c" stroke="none" stroke-linejoin="round"/>`;
}

// Lugares fijos de los ingredientes en cada mitad (x, y sobre la pizza de 240 × 240, mitad izquierda).
const LUGARES = [[70, 70], [52, 118], [82, 160], [100, 104], [62, 190], [104, 52], [96, 200], [40, 152], [108, 148]];
const INGREDIENTE = {
  tomate: (x, y) => `<circle cx="${x}" cy="${y}" r="13" fill="#d1453b" stroke="#a8322a" stroke-width="2"/><circle cx="${x - 4}" cy="${y - 3}" r="2" fill="#f7c5a8"/>`,
  jamon: (x, y) => `<path d="M${x - 14} ${y - 6}q8-8 22-2t6 14-20 4-8-16z" fill="#ef9aa0" stroke="#c9707a" stroke-width="2"/>`,
  morron: (x, y) => `<path d="M${x - 14} ${y}q14-12 28 0" fill="none" stroke="#d1453b" stroke-width="6" stroke-linecap="round"/>`,
  aceitunas: (x, y) => `<ellipse cx="${x}" cy="${y}" rx="6" ry="7.5" fill="#3a5a2a"/><ellipse cx="${x}" cy="${y}" rx="2" ry="3" fill="#c8455a"/>`,
  cebolla: (x, y) => `<path d="M${x - 12} ${y + 4}a12 9 0 0 1 24 0M${x - 7} ${y + 4}a7 5 0 0 1 14 0" fill="none" stroke="#c9a0d6" stroke-width="3"/>`,
  calabresa: (x, y) => `<circle cx="${x}" cy="${y}" r="11" fill="#b5332b"/><circle cx="${x - 3}" cy="${y - 2}" r="1.8" fill="#f2c5a0"/><circle cx="${x + 4}" cy="${y + 3}" r="1.8" fill="#f2c5a0"/>`,
  rucula: (x, y) => `<path d="M${x - 14} ${y + 4}q6-14 14-6 6-12 14 2-10 10-28 4z" fill="#5aa04a" stroke="#3f7a33" stroke-width="1.5"/>`,
  huevo: (x, y) => `<ellipse cx="${x}" cy="${y}" rx="13" ry="11" fill="#fffaf0"/><circle cx="${x}" cy="${y}" r="5" fill="#f2a52c"/>`,
  albahaca: (x, y) => `<path d="M${x - 8} ${y + 6}q-2-16 8-16 10 0 8 16-8 4-16 0z" fill="#4c9a3f"/>`,
  champignon: (x, y) => `<path d="M${x - 11} ${y}a11 9 0 0 1 22 0z" fill="#d8c3a5" stroke="#9c8466" stroke-width="2"/><rect x="${x - 4}" y="${y}" width="8" height="8" fill="#e9dcc6"/>`,
  anana: (x, y) => `<path d="M${x - 10} ${y - 6}h20l-4 14h-12z" fill="#f4cf4a" stroke="#d2a92a" stroke-width="2"/>`,
  ajo: (x, y) => `<circle cx="${x}" cy="${y}" r="4" fill="#fff8e6"/><circle cx="${x + 8}" cy="${y + 5}" r="3" fill="#fff8e6"/>`,
  provolone: (x, y) => `<ellipse cx="${x}" cy="${y}" rx="14" ry="10" fill="#f6e2a8" opacity=".9"/>`,
  palmitos: (x, y) => `<circle cx="${x}" cy="${y}" r="9" fill="#f3efd9" stroke="#cfc6a0" stroke-width="2"/><circle cx="${x}" cy="${y}" r="4" fill="none" stroke="#cfc6a0" stroke-width="1.5"/>`,
};

function mitadPizza(producto, lado) {
  const espejo = lado === "der" ? ' transform="matrix(-1 0 0 1 240 0)"' : "";
  const cubierta = producto?.cubierta ?? [];
  let piezas = "";
  cubierta.forEach((ing, i) => {
    const dibujo = INGREDIENTE[ing];
    if (!dibujo) return;
    // Cada ingrediente toma lugares alternados para mezclarse con los otros.
    LUGARES.forEach(([x, y], j) => {
      if (j % cubierta.length === i) piezas += dibujo(x, y);
    });
  });
  return `<g clip-path="url(#mitad-${lado})"><g${espejo}>${piezas}</g></g>`;
}

/** Pizza de 240 × 240 con un gusto por mitad. `activa`: la mitad que se está eligiendo. */
export function dibujoPizza(izq, der, activa) {
  const sombra = (lado) => (activa === lado ? `<path d="${lado === "izq" ? "M120 14a106 106 0 0 0 0 212z" : "M120 14a106 106 0 0 1 0 212z"}" fill="none" stroke="#fff" stroke-width="5" stroke-dasharray="10 8" class="pizza-activa"/>` : "");
  return svg(`<svg class="pizza-dibujo" viewBox="0 0 240 240" role="img" aria-label="Pizza mitad ${izq?.nombre ?? "sin elegir"} y mitad ${der?.nombre ?? "sin elegir"}">
    <defs><clipPath id="mitad-izq"><rect x="0" y="0" width="120" height="240"/></clipPath><clipPath id="mitad-der"><rect x="120" y="0" width="120" height="240"/></clipPath></defs>
    <circle cx="120" cy="120" r="114" fill="#d99a4e" stroke="#a8692c" stroke-width="3"/>
    <circle cx="120" cy="120" r="100" fill="#d1453b"/>
    ${queso(88)}
    <circle cx="82" cy="88" r="10" fill="#fbe7b0"/><circle cx="160" cy="152" r="12" fill="#fbe7b0"/><circle cx="152" cy="70" r="8" fill="#fbe7b0"/><circle cx="88" cy="170" r="9" fill="#fbe7b0"/>
    ${mitadPizza(izq, "izq")}${mitadPizza(der, "der")}
    ${izq === der ? "" : `<path d="M120 10v220" stroke="#a8692c" stroke-width="2" stroke-dasharray="4 6"/>`}
    ${sombra("izq")}${sombra("der")}
  </svg>`);
}

function armadorMitades(local, cfg, carrito) {
  const opciones = mitades.opciones(local, cfg);
  if (opciones.length < 2) return null;
  let eleccion = { izq: opciones[0].id, der: opciones[1].id };
  let activa = "der";

  const escena = crear("div", { className: "pizza-escena" });
  const lados = crear("div", { className: "pizza-lados", role: "radiogroup", "aria-label": "Qué mitad estás eligiendo" });
  const gustos = crear("ul", { className: "pizza-gustos" });
  const r = resumen("Tu pizza");

  function pintar() {
    const izq = opciones.find((p) => p.id === eleccion.izq);
    const der = opciones.find((p) => p.id === eleccion.der);
    const dibujo = dibujoPizza(izq, der, activa);
    // Tocar una mitad de la pizza la elige.
    dibujo.addEventListener("click", (e) => {
      const caja = dibujo.getBoundingClientRect();
      activa = e.clientX - caja.left < caja.width / 2 ? "izq" : "der";
      pintar();
    });
    escena.replaceChildren(dibujo);

    lados.replaceChildren(
      ...[["izq", "Mitad izquierda", izq], ["der", "Mitad derecha", der]].map(([lado, texto, p]) =>
        crear("button", { type: "button", role: "radio", "aria-checked": String(activa === lado), onclick: () => ((activa = lado), pintar()) }, crear("small", {}, texto), p?.nombre ?? "Elegí"),
      ),
    );

    gustos.replaceChildren(
      ...opciones.map((p) => {
        const elegida = eleccion[activa] === p.id;
        const otra = eleccion[activa === "izq" ? "der" : "izq"] === p.id;
        return crear(
          "li",
          {},
          crear(
            "button",
            { type: "button", className: "pizza-gusto", "aria-pressed": String(elegida), onclick: () => ((eleccion = { ...eleccion, [activa]: p.id }), pintar()) },
            crear("span", { className: "pizza-gusto-nombre" }, p.nombre, otra ? crear("small", {}, " · en la otra mitad") : null),
            p.descripcion ? crear("small", { className: "pizza-gusto-desc" }, p.descripcion) : null,
            crear("span", { className: "pizza-gusto-precio" }, formatearPesos(p.precio)),
          ),
        );
      }),
    );

    const igual = eleccion.izq === eleccion.der;
    r.precio.textContent = formatearPesos(igual ? izq.precio : mitades.precio(cfg, izq, der));
    r.nota.textContent = igual ? `Entera de ${izq.nombre}` : `${izq.nombre} y ${der.nombre}. ${cfg.precio === "promedio" ? "Se cobra el promedio." : "Se cobra la mitad más cara."}`;
  }

  r.boton.addEventListener("click", () => {
    // Si eligió el mismo gusto en las dos mitades, es la pizza entera de la carta.
    carrito.agregar(eleccion.izq === eleccion.der ? eleccion.izq : mitades.id(eleccion.izq, eleccion.der));
  });

  pintar();
  return crear(
    "section",
    { className: "armador armador-mitades", id: "armador-mitades" },
    cabeza(cfg, "Armala por mitades", "Tocá una mitad de la pizza y elegí el gusto. Mirá cómo queda antes de pedirla."),
    crear("div", { className: "pizza-cuerpo" }, escena, crear("div", { className: "pizza-opciones" }, lados, gustos)),
    r.caja,
  );
}

// ---------- Juntada ----------

function armadorJuntada(local, cfg, carrito) {
  const opciones = juntada.opciones(local, cfg);
  if (!opciones.length) return null;
  const niveles = juntada.niveles(cfg);
  let personas = cfg.personas ?? 8;
  let hambre = niveles[1]?.id ?? niveles[0].id;
  let gustos = opciones.slice(0, 2).map((p) => p.id);
  let conExtras = true;

  const contador = crear("div", { className: "juntada-personas" });
  const nivel = crear("div", { className: "juntada-hambre", role: "radiogroup", "aria-label": "Cuánta hambre hay" });
  const chips = crear("ul", { className: "juntada-gustos" });
  const mesa = crear("div", { className: "juntada-mesa" });
  const extras = crear("div", { className: "juntada-extras" });
  const r = resumen("La juntada");

  function calculo() {
    const total = juntada.pizzasNecesarias(cfg, personas, hambre);
    const reparto = juntada.repartir(total, gustos);
    const sugeridos = conExtras ? juntada.sugerencias(local, cfg, personas, total) : [];
    return { total, reparto, sugeridos };
  }

  function pintar() {
    const rango = crear("input", { type: "range", min: 2, max: cfg.maxPersonas ?? 40, value: personas, "aria-label": "Cuántas personas", oninput: (e) => ((personas = Number(e.target.value)), pintar()) });
    contador.replaceChildren(
      crear("button", { type: "button", className: "control-paso", "aria-label": "Una persona menos", disabled: personas <= 2, onclick: () => ((personas -= 1), pintar()) }, "−"),
      crear("div", { className: "juntada-numero" }, crear("strong", {}, String(personas)), crear("span", {}, "personas")),
      crear("button", { type: "button", className: "control-paso", "aria-label": "Una persona más", disabled: personas >= (cfg.maxPersonas ?? 40), onclick: () => ((personas += 1), pintar()) }, "+"),
      rango,
    );
    nivel.replaceChildren(...niveles.map((n) => crear("button", { type: "button", role: "radio", "aria-checked": String(n.id === hambre), onclick: () => ((hambre = n.id), pintar()) }, n.nombre, crear("small", {}, `${n.porciones} porciones c/u`))));

    chips.replaceChildren(
      ...opciones.map((p) =>
        crear(
          "li",
          {},
          crear(
            "button",
            {
              type: "button",
              className: "juntada-gusto",
              "aria-pressed": String(gustos.includes(p.id)),
              onclick: () => {
                gustos = gustos.includes(p.id) ? gustos.filter((g) => g !== p.id) : [...gustos, p.id];
                pintar();
              },
            },
            p.nombre,
          ),
        ),
      ),
    );

    const { total, reparto, sugeridos } = calculo();
    mesa.replaceChildren(
      ...[
      crear("p", { className: "juntada-titulo" }, `Para ${personas} necesitan `, crear("strong", {}, `${total} ${total === 1 ? "pizza" : "pizzas"}`)),
      crear(
        "ul",
        { className: "juntada-pizzas" },
        Object.entries(reparto).flatMap(([id, n]) => {
          const p = opciones.find((o) => o.id === id);
          return Array.from({ length: n }, (_, i) => crear("li", { style: `--i:${i}`, title: p.nombre }, dibujoPizza(p, p), crear("span", {}, p.nombre)));
        }),
      ),
      gustos.length ? null : crear("p", { className: "armador-pista" }, "Elegí al menos un gusto."),
      ].filter(Boolean),
    );

    const lista = juntada.sugerencias(local, cfg, personas, total);
    extras.replaceChildren(
      ...(lista.length
        ? [crear(
            "label",
            { className: "box-regalo" },
            crear("input", { type: "checkbox", checked: conExtras, onchange: (e) => ((conExtras = e.target.checked), pintar()) }),
            `Sumar ${lista.map((s) => `${s.cantidad} ${s.producto.nombre.toLowerCase()}`).join(" y ")}`,
          )]
        : []),
    );

    r.precio.textContent = gustos.length ? formatearPesos(juntada.total(local, reparto, sugeridos)) : "—";
    r.nota.textContent = gustos.length ? `${total} pizzas${sugeridos.length ? " y extras" : ""} · ${formatearPesos(Math.round(juntada.total(local, reparto, sugeridos) / personas))} por persona` : "";
    r.boton.disabled = !gustos.length;
    r.boton.textContent = "Sumar todo al pedido";
  }

  r.boton.addEventListener("click", () => {
    const { reparto, sugeridos } = calculo();
    for (const [id, n] of Object.entries(reparto)) if (n) carrito.agregar(id, n);
    for (const s of sugeridos) carrito.agregar(s.producto.id, s.cantidad);
  });

  pintar();
  return crear(
    "section",
    { className: "armador armador-juntada", id: "armador-juntada" },
    cabeza(cfg, "¿Cuántas pizzas pido?", "Decinos cuántos son y cuánta hambre hay. Te armamos el pedido para la juntada."),
    crear("div", { className: "juntada-cuerpo" }, crear("div", { className: "juntada-controles" }, contador, nivel, chips, extras), mesa),
    r.caja,
  );
}

// ---------- Café a tu medida ----------

/**
 * Taza (caliente) o vaso con hielo (frío), del tamaño elegido, con las capas de la bebida de abajo
 * hacia arriba: café, leche y espuma; arriba, los extras (crema, caramelo, canela).
 */
export function dibujoCafe(cfg, eleccion) {
  const r = cafe.calcular(cfg, eleccion);
  const escala = r.tamanio.escala ?? 1;
  const capas = r.bebida.capas ?? { cafe: 1, leche: 0, espuma: 0 };
  const shot = r.extras.some((x) => x.id === "shot");
  const conLeche = !!r.leche;
  const colorLeche = r.leche?.id === "avena" ? "#e6d1a8" : r.leche?.id === "almendras" ? "#efdcc0" : "#f1e2c8";
  const alto = Math.round(120 * escala);
  const ancho = Math.round(r.frio ? 78 * escala : 104 * escala);
  const x0 = 100 - ancho / 2;
  const base = 196;
  const tope = base - alto;
  // Lo que se llena: casi hasta el borde, salvo las bebidas cortas (`llenado` < 1, como el espresso).
  const lleno = (alto - 12) * (r.bebida.llenado ?? 1);
  const partes = [
    ["cafe", shot ? "#2f1a0e" : "#4a2a17", capas.cafe],
    ["leche", colorLeche, conLeche ? capas.leche : 0],
    ["espuma", "#fbf3e4", conLeche || r.bebida.id === "espresso" ? capas.espuma : 0],
  ];
  const totalProp = partes.reduce((s, p) => s + p[2], 0) || 1;
  let y = base - 6;
  let capasSvg = "";
  for (const [clase, color, prop] of partes) {
    if (!prop) continue;
    const h = (lleno * prop) / totalProp;
    // En el espresso, la espuma es la crema: dorada.
    const relleno = clase === "espuma" && r.bebida.id === "espresso" ? "#c98b47" : color;
    capasSvg += `<rect class="cafe-capa" x="${x0 + 4}" y="${(y - h).toFixed(1)}" width="${ancho - 8}" height="${h.toFixed(1)}" fill="${relleno}"/>`;
    y -= h;
  }
  let hielo = "";
  if (r.frio) {
    for (const [dx, dy, g] of [[-18, 30, 8], [10, 18, -10], [-6, 52, 14], [16, 62, -6]]) {
      hielo += `<rect x="${100 + dx * escala - 9}" y="${tope + dy * escala}" width="18" height="18" rx="4" fill="#ffffff" opacity=".55" stroke="#bfe3f2" stroke-width="1.5" transform="rotate(${g} ${100 + dx * escala} ${tope + dy * escala + 9})"/>`;
    }
  }
  let arriba = "";
  if (r.extras.some((x) => x.id === "crema")) arriba += `<path d="M${x0 + 6} ${tope + 12}c0-22 ${ancho - 12} -22 ${ancho - 12} 0z" fill="#fffaf2" stroke="#e7d9c3" stroke-width="2"/><path d="M${100 - 10} ${tope - 2}q10-14 20 0" fill="#fffaf2" stroke="#e7d9c3" stroke-width="2"/>`;
  if (r.extras.some((x) => x.id === "caramelo")) arriba += `<path d="M${x0 + 10} ${tope + 10}q${ancho / 4} -10 ${ancho / 2 - 10} 0t${ancho / 2 - 10} 0" fill="none" stroke="#c87a2a" stroke-width="4" stroke-linecap="round"/>`;
  if (r.extras.some((x) => x.id === "canela")) arriba += [[-14, 6], [6, 4], [16, 9], [-2, 10], [-22, 9]].map(([dx, dy]) => `<circle cx="${100 + dx}" cy="${tope + dy}" r="1.6" fill="#7a3e1a"/>`).join("");
  const vaso = r.frio
    ? `<path d="M${x0} ${tope}h${ancho}l-6 ${alto}h-${ancho - 12}z" fill="rgb(255 255 255 / .18)" stroke="currentColor" stroke-width="3" stroke-linejoin="round"/><path d="M${100 + 8} ${tope - 30}l-6 ${alto + 10}" stroke="#d1453b" stroke-width="5" stroke-linecap="round"/>`
    : `<path d="M${x0} ${tope}h${ancho}v${alto - 22}a22 22 0 0 1-22 22h-${ancho - 44}a22 22 0 0 1-22-22z" fill="none" stroke="currentColor" stroke-width="3"/><path d="M${x0 + ancho} ${tope + 22}h10a18 18 0 0 1 0 36h-12" fill="none" stroke="currentColor" stroke-width="3"/><ellipse cx="100" cy="${base + 8}" rx="${ancho / 2 + 26}" ry="8" fill="currentColor" opacity=".18"/>`;
  const humo = r.frio ? "" : `<path class="cafe-humo" d="M92 ${tope - 10}q-6-8 0-16t0-16M108 ${tope - 12}q-6-8 0-16t0-16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" opacity=".5"/>`;
  const clip = `cafe-clip-${r.frio ? "f" : "c"}`;
  const forma = r.frio ? `<path d="M${x0} ${tope}h${ancho}l-6 ${alto}h-${ancho - 12}z"/>` : `<path d="M${x0} ${tope}h${ancho}v${alto - 22}a22 22 0 0 1-22 22h-${ancho - 44}a22 22 0 0 1-22-22z"/>`;
  return svg(`<svg class="cafe-dibujo" viewBox="0 0 200 220" role="img" aria-label="${r.bebida.nombre}, ${cafe.describir(cfg, eleccion)}">
    <defs><clipPath id="${clip}">${forma}</clipPath></defs>
    ${humo}
    <g clip-path="url(#${clip})">${capasSvg}${hielo}</g>
    ${vaso}${arriba}
  </svg>`);
}

function armadorCafe(local, cfg, carrito) {
  let e = cafe.inicial(cfg);
  const escena = crear("div", { className: "cafe-escena" });
  const opciones = crear("div", { className: "cafe-opciones" });
  const r = resumen("Tu café");

  const grupo = (titulo, lista, activo, elegir, rotulo) =>
    crear(
      "div",
      { className: "cafe-grupo" },
      crear("p", { className: "cafe-grupo-titulo" }, titulo),
      crear(
        "div",
        { className: "cafe-botones", role: "radiogroup", "aria-label": titulo },
        lista.map((x) => crear("button", { type: "button", role: "radio", "aria-checked": String(activo === x.id), onclick: () => elegir(x.id) }, x.nombre, rotulo(x) ? crear("small", {}, rotulo(x)) : null)),
      ),
    );

  function pintar() {
    escena.replaceChildren(dibujoCafe(cfg, e));
    const mas = (n) => (n ? `+${formatearPesos(n)}` : "");
    opciones.replaceChildren(
      ...[
        grupo("Bebida", cfg.bebidas, e.bebida, (id) => ((e = { ...e, bebida: id }), pintar()), (b) => formatearPesos(b.precio)),
        grupo("Tamaño", cfg.tamanios, e.tamanio, (id) => ((e = { ...e, tamanio: id }), pintar()), (t) => mas(t.extra)),
        cafe.llevaLeche(cfg, e) && cfg.leches?.length ? grupo("Leche", cfg.leches, e.leche, (id) => ((e = { ...e, leche: id }), pintar()), (l) => mas(l.extra)) : null,
        cfg.extras?.length
          ? crear(
              "div",
              { className: "cafe-grupo" },
              crear("p", { className: "cafe-grupo-titulo" }, "Extras"),
              crear(
                "div",
                { className: "cafe-botones" },
                cfg.extras.map((x) =>
                  crear(
                    "button",
                    {
                      type: "button",
                      "aria-pressed": String(e.extras.includes(x.id)),
                      onclick: () => ((e = { ...e, extras: e.extras.includes(x.id) ? e.extras.filter((y) => y !== x.id) : [...e.extras, x.id] }), pintar()),
                    },
                    x.nombre,
                    crear("small", {}, x.precio ? `+${formatearPesos(x.precio)}` : "sin cargo"),
                  ),
                ),
              ),
            )
          : null,
        cfg.frio
          ? crear(
              "div",
              { className: "cafe-grupo cafe-temperatura", role: "radiogroup", "aria-label": "Temperatura" },
              crear("button", { type: "button", role: "radio", "aria-checked": String(!e.frio), onclick: () => ((e = { ...e, frio: false }), pintar()) }, "Caliente"),
              crear("button", { type: "button", role: "radio", "aria-checked": String(e.frio), onclick: () => ((e = { ...e, frio: true }), pintar()) }, "Frío", cfg.frio.extra ? crear("small", {}, `+${formatearPesos(cfg.frio.extra)}`) : null),
            )
          : null,
      ].filter(Boolean),
    );
    const c = cafe.calcular(cfg, e);
    r.precio.textContent = formatearPesos(c.total);
    r.nota.textContent = `${c.bebida.nombre}${c.frio ? " frío" : ""} · ${cafe.describir(cfg, e)}`;
  }

  r.boton.addEventListener("click", () => carrito.agregar(cafe.id(cfg, e)));

  pintar();
  return crear(
    "section",
    { className: "armador armador-cafe", id: "armador-cafe" },
    cabeza(cfg, "Café a tu medida", "Elegí la bebida, el tamaño y la leche, y mirá cómo queda."),
    crear("div", { className: "cafe-cuerpo" }, escena, opciones),
    r.caja,
  );
}

// ---------- Pizza desde cero ----------

const SALSAS = { tomate: "#d1453b", blanca: "#f3ead6", picante: "#b5291f" };
const MASAS = { piedra: { color: "#e2a65a", borde: 8 }, molde: { color: "#d99a4e", borde: 16 }, integral: { color: "#a8713e", borde: 11 } };

/** Pizza entera vista desde arriba con la salsa, la masa y los ingredientes repartidos por toda la superficie. */
export function dibujoPizzaArmada(cfg, e) {
  const r = pizza.calcular(cfg, e);
  const masa = MASAS[r.masa.id] ?? MASAS.piedra;
  const salsa = SALSAS[r.salsa.id] ?? SALSAS.tomate;
  const interior = 114 - masa.borde;
  let piezas = "";
  r.ingredientes.forEach((ing, i) => {
    const dibujo = INGREDIENTE[ing.cubierta];
    if (!dibujo) return;
    // Mitad izquierda y su espejo: cada ingrediente toma lugares alternados según su orden.
    LUGARES.forEach(([x, y], j) => {
      if (j % r.ingredientes.length !== i) return;
      piezas += dibujo(x, y) + `<g transform="matrix(-1 0 0 1 240 0)">${dibujo(x + 6, 240 - y)}</g>`;
    });
  });
  return svg(`<svg class="pizza-dibujo pizza-armada" viewBox="0 0 240 240" role="img" aria-label="${pizza.describir(cfg, e)}">
    <circle cx="120" cy="120" r="114" fill="${masa.color}" stroke="#8a5424" stroke-width="3"/>
    <circle cx="120" cy="120" r="${interior}" fill="${salsa}"/>
    ${queso(interior - 10)}
    <circle cx="86" cy="92" r="9" fill="#fbe7b0"/><circle cx="158" cy="150" r="11" fill="#fbe7b0"/><circle cx="150" cy="74" r="7" fill="#fbe7b0"/><circle cx="92" cy="166" r="8" fill="#fbe7b0"/>
    <defs><clipPath id="pizza-armada-${r.masa.id}"><circle cx="120" cy="120" r="${interior}"/></clipPath></defs>
    <g clip-path="url(#pizza-armada-${r.masa.id})">${piezas}</g>
  </svg>`);
}

function armadorPizza(local, cfg, carrito) {
  let e = pizza.inicial(cfg);
  const escena = crear("div", { className: "pizza-escena" });
  const opciones = crear("div", { className: "cafe-opciones" });
  const r = resumen("Tu pizza");

  const grupo = (titulo, lista, activo, elegir, rotulo) =>
    crear(
      "div",
      { className: "cafe-grupo" },
      crear("p", { className: "cafe-grupo-titulo" }, titulo),
      crear("div", { className: "cafe-botones", role: "radiogroup", "aria-label": titulo }, lista.map((x) => crear("button", { type: "button", role: "radio", "aria-checked": String(activo === x.id), onclick: () => elegir(x.id) }, x.nombre, crear("small", {}, rotulo(x))))),
    );

  function pintar() {
    escena.replaceChildren(dibujoPizzaArmada(cfg, e));
    const c = pizza.calcular(cfg, e);
    opciones.replaceChildren(
      grupo("Masa", cfg.masas, e.masa, (id) => ((e = { ...e, masa: id }), pintar()), (m) => formatearPesos(m.precio)),
      grupo("Salsa", cfg.salsas, e.salsa, (id) => ((e = { ...e, salsa: id }), pintar()), (x) => (x.extra ? `+${formatearPesos(x.extra)}` : "incluida")),
      crear(
        "div",
        { className: "cafe-grupo" },
        crear("p", { className: "cafe-grupo-titulo" }, `Ingredientes · ${c.quedan === 0 ? "llegaste al máximo" : `te ${c.quedan === 1 ? "queda 1" : `quedan ${c.quedan}`}`}`),
        crear(
          "div",
          { className: "cafe-botones pizza-ingredientes" },
          cfg.ingredientes.map((i) => {
            const puesto = e.ingredientes.includes(i.id);
            return crear(
              "button",
              { type: "button", "aria-pressed": String(puesto), disabled: !puesto && c.quedan === 0, onclick: () => ((e = pizza.alternar(cfg, e, i.id)), pintar()) },
              i.nombre,
              crear("small", {}, `+${formatearPesos(i.precio)}`),
            );
          }),
        ),
      ),
    );
    r.precio.textContent = formatearPesos(c.total);
    r.nota.textContent = pizza.describir(cfg, e);
  }

  r.boton.addEventListener("click", () => {
    carrito.agregar(pizza.id(e));
    e = pizza.inicial(cfg);
    pintar();
  });

  pintar();
  return crear(
    "section",
    { className: "armador armador-pizza", id: "armador-pizza" },
    cabeza(cfg, "Armá tu pizza", "Elegí la masa, la salsa y los ingredientes."),
    crear("div", { className: "pizza-cuerpo" }, escena, opciones),
    r.caja,
  );
}

// ---------- Menú del día ----------

/** Día de la semana (0 = domingo) y fecha larga de hoy, en hora argentina. */
function hoyEnArgentina(fecha = new Date()) {
  const zona = "America/Argentina/Buenos_Aires";
  const dia = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(new Intl.DateTimeFormat("en-US", { timeZone: zona, weekday: "short" }).format(fecha));
  const texto = new Intl.DateTimeFormat("es-AR", { timeZone: zona, weekday: "long", day: "numeric", month: "long" }).format(fecha);
  return { dia, texto };
}

function armadorMenu(local, cfg, carrito) {
  const hoy = hoyEnArgentina();
  let eleccion = {};
  const pasos = crear("ol", { className: "menu-pasos" });
  const bandeja = crear("div", { className: "menu-bandeja", "aria-label": "Tu bandeja" });
  const r = resumen("Tu menú");

  function pintar() {
    pasos.replaceChildren(
      ...cfg.pasos.map((paso) =>
        crear(
          "li",
          { className: "menu-paso" },
          crear("p", { className: "cafe-grupo-titulo" }, paso.delDia ? `${paso.nombre} · el de hoy` : paso.nombre),
          crear(
            "div",
            { className: "cafe-botones", role: "radiogroup", "aria-label": paso.nombre },
            menu.opciones(paso, hoy.dia).map((o) =>
              crear(
                "button",
                { type: "button", role: "radio", "aria-checked": String(eleccion[paso.id] === o.id), onclick: () => ((eleccion = { ...eleccion, [paso.id]: o.id }), pintar()) },
                o.nombre,
                o.extra ? crear("small", {}, `+${formatearPesos(o.extra)}`) : null,
              ),
            ),
          ),
        ),
      ),
    );

    const c = menu.calcular(cfg, eleccion);
    bandeja.replaceChildren(
      ...c.elegidos.map(({ paso, opcion }, i) => {
        const nombreDibujo = opcion ? dibujoPara({ id: opcion.id, nombre: opcion.nombre }) : null;
        return crear(
          "div",
          { className: `menu-hueco${i === 0 ? " menu-hueco-plato" : ""}`, "data-lleno": opcion ? "" : null },
          nombreDibujo ? svg(svgDibujo(nombreDibujo, "menu-dibujo")) : null,
          crear("span", { className: "menu-hueco-nombre" }, opcion?.nombre ?? paso.nombre),
        );
      }),
    );
    r.precio.textContent = formatearPesos(c.total);
    r.nota.textContent = c.completo ? "Menú completo" : `Falta: ${c.faltan.join(", ").toLowerCase()}`;
    r.boton.disabled = !c.completo;
  }

  r.boton.addEventListener("click", () => {
    carrito.agregar(menu.id(cfg, eleccion));
    eleccion = {};
    pintar();
  });

  pintar();
  return crear(
    "section",
    { className: "armador armador-menu", id: "armador-menu" },
    cabeza({ ...cfg, volanta: cfg.volanta ? `${cfg.volanta} · ${hoy.texto}` : hoy.texto }, "Menú del día", "Plato, guarnición, bebida y postre a precio fijo."),
    crear("div", { className: "menu-cuerpo" }, bandeja, pasos),
    r.caja,
  );
}
