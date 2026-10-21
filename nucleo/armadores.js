// Pedidos interactivos ("armadores"), configurados en el contenido: `armadores: [{ tipo, … }]`.
// Sin DOM. Lo que arma el cliente viaja en el carrito como un id de texto ("vianda:1=mila,3=tarta")
// y `resolverArmado` lo convierte en un producto más ({ id, nombre, precio, detalle }), así el
// carrito, los totales y el mensaje de WhatsApp lo tratan igual que a cualquier producto.
//
// Tipos:
// - "vianda": un plato por día de la semana, con descuento según cuántos días.
// - "box": caja de N lugares que se llena con productos (pastelería, facturas, alfajores),
//   con descuento por tamaño y opción de regalo con tarjeta.
// - "burger": hamburguesa capa por capa: pan, medallones, quesos y extras, cada uno con su precio.
// - "mitades": pizza mitad y mitad, dibujada; se cobra la mitad más cara (o el promedio).
// - "juntada": cuántas pizzas pedir según la cantidad de personas y el hambre; suma productos
//   comunes de la carta (no lleva id propio).

const DIAS_CORTOS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const DIAS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

/** Redondea para abajo a múltiplos de `paso` (los descuentos nunca terminan en $37). */
export const redondear = (monto, paso = 100) => Math.floor(monto / paso) * paso;

function productosDe(local, categorias) {
  return local.categorias.filter((c) => categorias.includes(c.id)).flatMap((c) => c.productos);
}

function producto(local, id) {
  for (const c of local.categorias) {
    const p = c.productos.find((x) => x.id === id);
    if (p) return p;
  }
  return undefined;
}

export function armadorDe(local, tipo) {
  return (local.armadores ?? []).find((a) => a.tipo === tipo);
}

// ---------- Vianda semanal ----------

export const vianda = {
  dias: (cfg) => cfg.dias ?? [1, 2, 3, 4, 5],
  nombreDia: (d) => DIAS[d],
  diaCorto: (d) => DIAS_CORTOS[d],

  /** Platos que se pueden elegir (los agotados no). */
  opciones: (local, cfg) => productosDe(local, cfg.categorias).filter((p) => !p.agotado),

  /** Porcentaje de descuento según la cantidad de días elegidos. */
  porcentaje(cfg, cantidad) {
    return (cfg.descuentos ?? []).filter((d) => cantidad >= d.desde).reduce((max, d) => Math.max(max, d.porcentaje), 0);
  },

  /** eleccion: { [dia]: productoId }. */
  calcular(local, cfg, eleccion) {
    const platos = this.dias(cfg).filter((d) => eleccion[d]).map((d) => ({ dia: d, producto: producto(local, eleccion[d]) }));
    const subtotal = platos.reduce((s, x) => s + (x.producto?.precio ?? 0), 0);
    const porcentaje = this.porcentaje(cfg, platos.length);
    const total = porcentaje ? redondear(subtotal * (1 - porcentaje / 100)) : subtotal;
    return { platos, subtotal, porcentaje, total, ahorro: subtotal - total };
  },

  id(cfg, eleccion) {
    const partes = this.dias(cfg)
      .filter((d) => eleccion[d])
      .map((d) => `${d}=${eleccion[d]}`);
    return partes.length ? `vianda:${partes.join(",")}` : null;
  },

  leer(id) {
    if (!id.startsWith("vianda:")) return null;
    const eleccion = {};
    for (const parte of id.slice(7).split(",")) {
      const [dia, plato] = parte.split("=");
      if (!/^[0-6]$/.test(dia) || !plato) return null;
      eleccion[Number(dia)] = plato;
    }
    return eleccion;
  },

  resolver(local, cfg, id) {
    const eleccion = this.leer(id);
    if (!eleccion) return undefined;
    const r = this.calcular(local, cfg, eleccion);
    const validos = r.platos.filter((x) => x.producto && !x.producto.agotado && productosDe(local, cfg.categorias).includes(x.producto));
    if (!validos.length || validos.length !== r.platos.length) return undefined;
    return {
      id,
      nombre: `${cfg.nombre ?? "Viandas de la semana"} (${r.platos.length} ${r.platos.length === 1 ? "día" : "días"})`,
      precio: r.total,
      detalle: r.platos.map((x) => `${DIAS_CORTOS[x.dia]}: ${x.producto.nombre}`).join(" · ") + (r.porcentaje ? ` (−${r.porcentaje} %)` : ""),
    };
  },
};

// ---------- Box para llenar ----------

export const box = {
  opciones: (local, cfg) => productosDe(local, cfg.categorias).filter((p) => !p.agotado),
  tamanios: (cfg) => cfg.tamanios ?? [{ lugares: 6, descuento: 0 }],

  /** items: ids de productos (se pueden repetir), uno por lugar ocupado. */
  calcular(local, cfg, lugares, items, regalo = false) {
    const tam = this.tamanios(cfg).find((t) => t.lugares === lugares);
    const productos = items.map((id) => producto(local, id));
    const subtotal = productos.reduce((s, p) => s + (p?.precio ?? 0), 0);
    const porcentaje = tam?.descuento ?? 0;
    const conDescuento = porcentaje ? redondear(subtotal * (1 - porcentaje / 100)) : subtotal;
    const extraRegalo = regalo ? (cfg.regalo ?? 0) : 0;
    return { completo: !!tam && items.length === lugares, faltan: Math.max(0, lugares - items.length), subtotal, porcentaje, ahorro: subtotal - conDescuento, total: conDescuento + extraRegalo, extraRegalo };
  },

  id(lugares, items, regalo = false) {
    if (!items.length) return null;
    return `${regalo ? "box-regalo" : "box"}:${lugares}:${[...items].sort().join("+")}`;
  },

  leer(id) {
    const m = /^(box|box-regalo):(\d+):(.+)$/.exec(id);
    if (!m) return null;
    return { regalo: m[1] === "box-regalo", lugares: Number(m[2]), items: m[3].split("+") };
  },

  resolver(local, cfg, id) {
    const b = this.leer(id);
    if (!b) return undefined;
    const permitidos = new Set(this.opciones(local, cfg).map((p) => p.id));
    if (!b.items.every((i) => permitidos.has(i))) return undefined;
    const r = this.calcular(local, cfg, b.lugares, b.items, b.regalo);
    if (!r.completo) return undefined;
    const cuenta = new Map();
    for (const i of b.items) cuenta.set(i, (cuenta.get(i) ?? 0) + 1);
    const detalle = [...cuenta].map(([i, n]) => `${n} ${producto(local, i).nombre}`).join(", ");
    return {
      id,
      nombre: `${cfg.nombre ?? "Box"} de ${b.lugares}${b.regalo ? ", para regalo" : ""}`,
      precio: r.total,
      detalle: detalle + (r.porcentaje ? ` (−${r.porcentaje} %)` : ""),
    };
  },
};

// ---------- Burger capa por capa ----------
// cfg: { panes: [{ id, nombre, precio }], capas: [{ id, nombre, precio, min?, max, color? }] }
// El precio de la burger es el del pan más el de cada capa por la cantidad.

export const burger = {
  inicial(cfg) {
    const eleccion = { pan: cfg.panes[0].id };
    for (const c of cfg.capas) eleccion[c.id] = c.inicial ?? c.min ?? 0;
    return eleccion;
  },

  cambiar(cfg, eleccion, capaId, paso) {
    const capa = cfg.capas.find((c) => c.id === capaId);
    if (!capa) return eleccion;
    const valor = Math.min(capa.max, Math.max(capa.min ?? 0, (eleccion[capaId] ?? 0) + paso));
    return { ...eleccion, [capaId]: valor };
  },

  calcular(cfg, eleccion) {
    const pan = cfg.panes.find((p) => p.id === eleccion.pan) ?? cfg.panes[0];
    const capas = cfg.capas.map((c) => ({ ...c, cantidad: eleccion[c.id] ?? 0 })).filter((c) => c.cantidad > 0);
    const total = pan.precio + capas.reduce((s, c) => s + c.precio * c.cantidad, 0);
    return { pan, capas, total };
  },

  valida(cfg, eleccion) {
    if (!cfg.panes.some((p) => p.id === eleccion.pan)) return false;
    return cfg.capas.every((c) => {
      const n = eleccion[c.id] ?? 0;
      return Number.isInteger(n) && n >= (c.min ?? 0) && n <= c.max;
    });
  },

  id(cfg, eleccion) {
    const capas = cfg.capas.filter((c) => (eleccion[c.id] ?? 0) > 0).map((c) => `${c.id}=${eleccion[c.id]}`);
    return `burger:${eleccion.pan}${capas.length ? ";" + capas.join(";") : ""}`;
  },

  leer(cfg, id) {
    if (!id.startsWith("burger:")) return null;
    const [pan, ...capas] = id.slice(7).split(";");
    const eleccion = { pan };
    for (const c of cfg.capas) eleccion[c.id] = 0;
    for (const parte of capas) {
      const [capa, n] = parte.split("=");
      if (!(capa in eleccion) || !/^\d+$/.test(n ?? "")) return null;
      eleccion[capa] = Number(n);
    }
    return eleccion;
  },

  /** Texto de lo que lleva: "Pan de papa · 2 medallones · 2 cheddar · panceta". */
  describir(cfg, eleccion) {
    const r = this.calcular(cfg, eleccion);
    return [r.pan.nombre, ...r.capas.map((c) => (c.cantidad > 1 ? `${c.cantidad} × ${c.nombre.toLowerCase()}` : c.nombre.toLowerCase()))].join(" · ");
  },

  resolver(local, cfg, id) {
    const eleccion = this.leer(cfg, id);
    if (!eleccion || !this.valida(cfg, eleccion)) return undefined;
    return { id, nombre: cfg.nombre ?? "Burger armada", precio: this.calcular(cfg, eleccion).total, detalle: this.describir(cfg, eleccion) };
  },
};

// ---------- Pizza por mitades ----------
// cfg: { categorias, precio: "mas-cara" (por defecto) | "promedio" }. Cada gusto puede tener
// `cubierta` (tomate, jamon, morron, aceitunas, cebolla, calabresa, rucula, huevo, albahaca) para el dibujo.

export const mitades = {
  opciones: (local, cfg) => productosDe(local, cfg.categorias).filter((p) => !p.agotado),

  precio(cfg, a, b) {
    if (cfg.precio === "promedio") return redondear((a.precio + b.precio) / 2);
    return Math.max(a.precio, b.precio);
  },

  id: (a, b) => `mitades:${[a, b].sort().join("+")}`,

  leer(id) {
    const m = /^mitades:([^+]+)\+([^+]+)$/.exec(id);
    return m ? [m[1], m[2]] : null;
  },

  resolver(local, cfg, id) {
    const par = this.leer(id);
    if (!par) return undefined;
    const [a, b] = par.map((x) => this.opciones(local, cfg).find((p) => p.id === x));
    if (!a || !b || a === b) return undefined;
    return { id, nombre: `Pizza mitad ${a.nombre} y mitad ${b.nombre}`, precio: this.precio(cfg, a, b), detalle: cfg.precio === "promedio" ? "Promedio de las dos mitades" : "Se cobra la mitad más cara" };
  },
};

// ---------- Juntada ----------
// cfg: { categorias, porciones: 8, hambre: [{ id, nombre, porciones }], sugerencias: [{ id, cada, por: "pizzas" | "personas" }] }

export const juntada = {
  opciones: (local, cfg) => productosDe(local, cfg.categorias).filter((p) => !p.agotado),
  niveles: (cfg) => cfg.hambre ?? [{ id: "poco", nombre: "Picamos algo", porciones: 2 }, { id: "normal", nombre: "Normal", porciones: 3 }, { id: "mucho", nombre: "Venimos con hambre", porciones: 4 }],

  /** Pizzas enteras para que nadie se quede con hambre. */
  pizzasNecesarias(cfg, personas, hambre) {
    const nivel = this.niveles(cfg).find((n) => n.id === hambre) ?? this.niveles(cfg)[1];
    return Math.max(1, Math.ceil((personas * nivel.porciones) / (cfg.porciones ?? 8)));
  },

  /** Reparte las pizzas entre los gustos elegidos, en orden, lo más parejo posible. */
  repartir(cantidad, gustos) {
    if (!gustos.length) return {};
    const reparto = Object.fromEntries(gustos.map((g) => [g, Math.floor(cantidad / gustos.length)]));
    for (let i = 0; i < cantidad % gustos.length; i++) reparto[gustos[i]] += 1;
    return reparto;
  },

  /** Lo que conviene sumar (fainá, bebidas): [{ producto, cantidad }]. */
  sugerencias(local, cfg, personas, pizzas) {
    return (cfg.sugerencias ?? []).flatMap((s) => {
      const p = producto(local, s.id);
      if (!p || p.agotado) return [];
      const base = s.por === "personas" ? personas : pizzas;
      return [{ producto: p, cantidad: Math.max(1, Math.ceil(base / s.cada)) }];
    });
  },

  total(local, reparto, extras = []) {
    const pizzas = Object.entries(reparto).reduce((s, [id, n]) => s + (producto(local, id)?.precio ?? 0) * n, 0);
    return pizzas + extras.reduce((s, e) => s + e.producto.precio * e.cantidad, 0);
  },

  resolver: () => undefined,
};

const TIPOS = { vianda, box, burger, mitades, juntada };
const PREFIJOS = { "vianda:": "vianda", "box:": "box", "box-regalo:": "box", "burger:": "burger", "mitades:": "mitades" };

/** El producto armado que corresponde a un id del carrito, o undefined si no es un armado válido. */
export function resolverArmado(local, id) {
  const prefijo = Object.keys(PREFIJOS).find((p) => id.startsWith(p));
  if (!prefijo) return undefined;
  const tipo = PREFIJOS[prefijo];
  const cfg = armadorDe(local, tipo);
  return cfg ? TIPOS[tipo].resolver(local, cfg, id) : undefined;
}
