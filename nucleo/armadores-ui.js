// Interfaz de los armadores (ver nucleo/armadores.js). Cada uno devuelve una <section class="armador">
// lista para insertar; el aspecto base está en nucleo/armadores.css y cada plantilla lo ajusta
// con sus variables.
import { box, burger, vianda } from "./armadores.js";
import { formatearPesos } from "./formato.js";
import { crear, svg } from "./pagina.js";

/** Todos los armadores del contenido, en el orden en que están. */
export function armadores(local, carrito) {
  return (local.armadores ?? []).map((cfg) => ARMADORES[cfg.tipo]?.(local, cfg, carrito)).filter(Boolean);
}

const ARMADORES = { vianda: armadorVianda, box: armadorBox, burger: armadorBurger };

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
              crear("span", { className: "box-inicial", "aria-hidden": "true" }, p.nombre[0]),
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
  queso: (y, c) => `<path d="M10 ${y - 6}h180l-10 6-12 8-10-8H74l-12 10-10-10H20z" fill="${c ?? "#f2b632"}"/>`,
  panceta: (y, c) => `<path d="M16 ${y - 4}q15-8 30 0t30 0 30 0 30 0 30 0 18 0" fill="none" stroke="${c ?? "#c2453a"}" stroke-width="6" stroke-linecap="round"/>`,
  hoja: (y, c) => `<path d="M12 ${y - 3}q12-10 22 0t22 0 22 0 22 0 22 0 22 0 22 0 22 0" fill="none" stroke="${c ?? "#5aa04a"}" stroke-width="7" stroke-linecap="round"/>`,
  tomate: (y, c) => `<rect x="30" y="${y - 7}" width="62" height="8" rx="4" fill="${c ?? "#e2483d"}"/><rect x="104" y="${y - 7}" width="62" height="8" rx="4" fill="${c ?? "#e2483d"}"/>`,
  cebolla: (y, c) => `<path d="M30 ${y - 3}a14 6 0 0 1 28 0M70 ${y - 3}a14 6 0 0 1 28 0M110 ${y - 3}a14 6 0 0 1 28 0M146 ${y - 3}a12 5 0 0 1 24 0" fill="none" stroke="${c ?? "#c9a0d6"}" stroke-width="4"/>`,
  salsa: (y, c) => `<path d="M18 ${y - 3}h164q-6 5-14 3t-16 3-18-2-20 3-22-3-20 2-18-1-20 2z" fill="${c ?? "#e0702a"}"/>`,
  huevo: (y) => `<ellipse cx="100" cy="${y - 5}" rx="58" ry="7" fill="#fff8ec"/><circle cx="100" cy="${y - 6}" r="8" fill="#f2a52c"/>`,
  pepino: (y, c) => `<g fill="${c ?? "#8bb05a"}"><ellipse cx="50" cy="${y - 3}" rx="16" ry="4"/><ellipse cx="100" cy="${y - 3}" rx="16" ry="4"/><ellipse cx="150" cy="${y - 3}" rx="16" ry="4"/></g>`,
};
const ALTO = { medallon: 16, queso: 8, panceta: 8, hoja: 8, tomate: 9, cebolla: 6, salsa: 5, huevo: 10, pepino: 6 };

/** Dibujo de la burger: de abajo hacia arriba, el pan, cada capa repetida según la cantidad y la tapa. */
export function dibujoBurger(cfg, eleccion) {
  const r = burger.calcular(cfg, eleccion);
  const pisos = r.capas.flatMap((c) => Array.from({ length: c.cantidad }, (_, i) => ({ ...c, nuevo: i === c.cantidad - 1 })));
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
          crear("span", { className: "burger-muestra", style: `--color:${c.color ?? "currentColor"}`, "aria-hidden": "true" }),
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
