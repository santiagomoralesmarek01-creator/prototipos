// Lógica del tablero de comandas, sin DOM: estados, demoras, simulación de pedidos y números del día.
// Un pedido: { id, numero, cliente, entrega: "salon" | "retiro" | "envio", mesa?, items: [{ nombre, cantidad, precio, nota? }],
//              estado, creado, empezado?, listo?, entregado? } (tiempos en milisegundos).

export const ESTADOS = [
  { id: "nuevo", nombre: "Nuevos", accion: "Empezar" },
  { id: "cocina", nombre: "En cocina", accion: "Listo" },
  { id: "listo", nombre: "Listos", accion: "Entregado" },
  { id: "entregado", nombre: "Entregados", accion: null },
];

const MARCA_DE_TIEMPO = { cocina: "empezado", listo: "listo", entregado: "entregado" };

/** Minutos a partir de los cuales un pedido se marca demorado y atrasado. */
export const DEMORA = { aviso: 15, atraso: 25 };

/** Pasa el pedido al estado siguiente y anota la hora. */
export function avanzar(pedido, ahora = Date.now()) {
  const i = ESTADOS.findIndex((e) => e.id === pedido.estado);
  const siguiente = ESTADOS[i + 1];
  if (!siguiente) return pedido;
  return { ...pedido, estado: siguiente.id, [MARCA_DE_TIEMPO[siguiente.id]]: ahora };
}

/** Lo vuelve al estado anterior (por si se tocó de más). */
export function retroceder(pedido) {
  const i = ESTADOS.findIndex((e) => e.id === pedido.estado);
  if (i <= 0) return pedido;
  const copia = { ...pedido, estado: ESTADOS[i - 1].id };
  delete copia[MARCA_DE_TIEMPO[pedido.estado]];
  return copia;
}

/** Mueve el pedido a un estado cualquiera (al arrastrar), completando las horas que falten. */
export function moverA(pedido, estado, ahora = Date.now()) {
  let p = pedido;
  const destino = ESTADOS.findIndex((e) => e.id === estado);
  while (ESTADOS.findIndex((e) => e.id === p.estado) < destino) p = avanzar(p, ahora);
  while (ESTADOS.findIndex((e) => e.id === p.estado) > destino) p = retroceder(p);
  return p;
}

/** Minutos que lleva el pedido esperando (hasta que sale de cocina). */
export function minutosEsperando(pedido, ahora = Date.now()) {
  const fin = pedido.listo ?? ahora;
  return Math.max(0, Math.floor((fin - pedido.creado) / 60000));
}

export function urgencia(pedido, ahora = Date.now()) {
  if (pedido.estado === "listo" || pedido.estado === "entregado") return "ok";
  const m = minutosEsperando(pedido, ahora);
  return m >= DEMORA.atraso ? "atrasado" : m >= DEMORA.aviso ? "demorado" : "ok";
}

export const totalPedido = (pedido) => pedido.items.reduce((s, i) => s + i.precio * i.cantidad, 0);

/** Números del día: cantidad, facturado, ticket promedio y minutos promedio hasta "listo". */
export function resumenDelDia(pedidos) {
  const facturado = pedidos.reduce((s, p) => s + totalPedido(p), 0);
  const terminados = pedidos.filter((p) => p.listo);
  const demora = terminados.length ? Math.round(terminados.reduce((s, p) => s + (p.listo - p.creado), 0) / terminados.length / 60000) : 0;
  return {
    pedidos: pedidos.length,
    facturado,
    ticket: pedidos.length ? Math.round(facturado / pedidos.length) : 0,
    demora,
    pendientes: pedidos.filter((p) => p.estado === "nuevo" || p.estado === "cocina").length,
  };
}

// ---------- Simulación ----------
// Para la demo: pedidos creíbles a partir de la carta del local. Generador con semilla, así la
// misma semilla da los mismos pedidos (y los tests no dependen del azar).

export function azar(semilla = 1) {
  let s = semilla >>> 0 || 1;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
}

const NOMBRES = ["Lucía", "Martín", "Sofi", "Nico", "Caro", "Juan", "Valen", "Agus", "Flor", "Tomi", "Belu", "Facu", "Meli", "Rodri", "Juli", "Pato"];
const NOTAS = ["Sin cebolla", "Bien cocida", "Sin sal", "Cortada en 8", "Con mucho limón", "Para celíacos, con cuidado", "Salsa aparte"];

export function pedidoAlAzar(local, numero, creado, rnd = Math.random) {
  const productos = local.categorias.flatMap((c) => c.productos).filter((p) => !p.agotado);
  const elegir = (lista) => lista[Math.floor(rnd() * lista.length)];
  const cuantos = 1 + Math.floor(rnd() * 4);
  const items = [];
  for (let i = 0; i < cuantos; i++) {
    const p = elegir(productos);
    const ya = items.find((x) => x.nombre === p.nombre);
    if (ya) ya.cantidad += 1;
    else items.push({ nombre: p.nombre, cantidad: 1 + Math.floor(rnd() * 2), precio: p.precio, ...(rnd() < 0.18 ? { nota: elegir(NOTAS) } : {}) });
  }
  const tipos = local.envio?.disponible ? ["salon", "retiro", "envio"] : ["salon", "retiro"];
  const entrega = elegir(tipos);
  return {
    id: `p${numero}`,
    numero,
    cliente: elegir(NOMBRES),
    entrega,
    ...(entrega === "salon" ? { mesa: 1 + Math.floor(rnd() * 14) } : {}),
    items,
    estado: "nuevo",
    creado,
  };
}

/** Un turno ya empezado: pedidos repartidos entre los estados, con horas creíbles. */
export function turnoDeEjemplo(local, ahora = Date.now(), semilla = 7) {
  const rnd = azar(semilla);
  const pedidos = [];
  const reparto = ["entregado", "entregado", "entregado", "entregado", "listo", "listo", "cocina", "cocina", "cocina", "nuevo", "nuevo", "nuevo"];
  reparto.forEach((estado, i) => {
    const hace = (reparto.length - i) * 4 + Math.floor(rnd() * 4);
    let p = pedidoAlAzar(local, 101 + i, ahora - hace * 60000, rnd);
    if (estado !== "nuevo") p = { ...p, estado: "cocina", empezado: p.creado + 2 * 60000 };
    if (estado === "listo" || estado === "entregado") p = { ...p, estado: "listo", listo: p.creado + (10 + Math.floor(rnd() * 14)) * 60000 };
    if (estado === "entregado") p = { ...p, estado: "entregado", entregado: p.listo + 3 * 60000 };
    pedidos.push(p);
  });
  // Uno de los que están en cocina viene atrasado, para que se vea la alarma.
  const enCocina = pedidos.find((p) => p.estado === "cocina");
  if (enCocina) enCocina.creado = ahora - 27 * 60000;
  return pedidos;
}
