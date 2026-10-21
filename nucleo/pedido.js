// Carrito, totales y mensaje de WhatsApp. Sin DOM.
// Carrito: [{ productoId, cantidad }]. Los precios son enteros en pesos.
import { resolverArmado } from "./armadores.js";
import { formatearPesos } from "./formato.js";

/** Si el contenido toma pedidos. El plan Carta muestra la carta para mirar, sin carrito. */
export function tomaPedidos(local) {
  return local.plan !== "carta";
}

/** Un producto de la carta o uno armado con un armador (ver nucleo/armadores.js). */
export function buscarProducto(local, id) {
  if (id.includes(":")) return resolverArmado(local, id);
  for (const categoria of local.categorias) {
    const producto = categoria.productos.find((p) => p.id === id);
    if (producto) return producto;
  }
  return undefined;
}

/** Suma `cantidad` (o resta, si es negativa). Una cantidad final de 0 o menos lo quita. */
export function cambiarCantidad(carrito, productoId, cantidad) {
  const actual = carrito.find((l) => l.productoId === productoId);
  const nueva = (actual?.cantidad ?? 0) + cantidad;
  if (nueva <= 0) return carrito.filter((l) => l.productoId !== productoId);
  if (actual) return carrito.map((l) => (l.productoId === productoId ? { ...l, cantidad: nueva } : l));
  return [...carrito, { productoId, cantidad: nueva }];
}

/** Deja afuera lo que ya no está en la carta o se agotó. */
export function lineasValidas(local, carrito) {
  return carrito.flatMap((linea) => {
    const producto = buscarProducto(local, linea.productoId);
    if (!producto || producto.agotado || linea.cantidad <= 0) return [];
    return [{ ...linea, producto, subtotal: producto.precio * linea.cantidad }];
  });
}

export function cantidadTotal(local, carrito) {
  return lineasValidas(local, carrito).reduce((suma, l) => suma + l.cantidad, 0);
}

export function costoEnvio(local, entrega) {
  return entrega === "envio" && local.envio?.disponible ? (local.envio.costo ?? 0) : 0;
}

export function calcularTotal(local, carrito, entrega = "retiro") {
  return lineasValidas(local, carrito).reduce((suma, l) => suma + l.subtotal, 0) + costoEnvio(local, entrega);
}

/** Un solo mensaje, ordenado y con el total. cliente: { nombre, entrega, direccion?, pago, aclaraciones? } */
export function armarMensaje(local, carrito, cliente) {
  const renglones = [`*Pedido para ${local.nombre}*`, ""];
  for (const l of lineasValidas(local, carrito)) {
    renglones.push(`${l.cantidad} x ${l.producto.nombre} — ${formatearPesos(l.subtotal)}`);
    if (l.producto.detalle) renglones.push(`   _${l.producto.detalle}_`);
  }
  const envio = costoEnvio(local, cliente.entrega);
  if (envio > 0) renglones.push(`Envío — ${formatearPesos(envio)}`);

  renglones.push("", `*Total: ${formatearPesos(calcularTotal(local, carrito, cliente.entrega))}*`, "");
  renglones.push(`Nombre: ${cliente.nombre}`);
  renglones.push(cliente.entrega === "envio" ? `Envío a: ${cliente.direccion ?? ""}` : "Retiro en el local");
  renglones.push(`Pago: ${cliente.pago}`);
  if (cliente.aclaraciones) renglones.push(`Aclaraciones: ${cliente.aclaraciones}`);
  return renglones.join("\n");
}

export function linkWhatsApp(numero, mensaje = "") {
  const base = `https://wa.me/${numero.replace(/\D/g, "")}`;
  return mensaje ? `${base}?text=${encodeURIComponent(mensaje)}` : base;
}
