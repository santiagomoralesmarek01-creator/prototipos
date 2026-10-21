// Lógica del llamador, sin DOM: qué números se muestran y cuál es el último que salió.
// Lee los mismos pedidos que la app Comanda (ver ../app-comanda/comandas.js).

/** Pedidos en preparación (nuevos y en cocina), del más viejo al más nuevo. */
export function preparando(pedidos) {
  return pedidos.filter((p) => p.estado === "nuevo" || p.estado === "cocina").sort((a, b) => a.creado - b.creado);
}

/** Pedidos listos para retirar, el último que salió primero. A lo sumo `max`. */
export function listos(pedidos, max = 6) {
  return pedidos
    .filter((p) => p.estado === "listo")
    .sort((a, b) => (b.listo ?? 0) - (a.listo ?? 0))
    .slice(0, max);
}

/** Números que pasaron a "listo" entre dos lecturas: los que hay que anunciar. */
export function nuevosListos(antes, ahora) {
  const ya = new Set(antes.filter((p) => p.estado === "listo").map((p) => p.id));
  return ahora.filter((p) => p.estado === "listo" && !ya.has(p.id)).map((p) => p.numero);
}

/** Texto del cartel de abajo: los destacados del local con su precio. */
export function promociones(local, formatear) {
  const productos = local.categorias.flatMap((c) => c.productos);
  return (local.destacados ?? [])
    .map((id) => productos.find((p) => p.id === id))
    .filter((p) => p && !p.agotado)
    .map((p) => `${p.nombre} ${formatear(p.precio)}`);
}
