// Carrito y hoja de pedido por WhatsApp, iguales en todas las plantillas de los planes Local y
// Local Plus. El aspecto sale de las variables de cada plantilla (ver nucleo/base.css).
import { formatearPesos } from "./formato.js";
import { armarMensaje, calcularTotal, cambiarCantidad, cantidadTotal, costoEnvio, lineasValidas, linkWhatsApp } from "./pedido.js";
import { crear } from "./pagina.js";

export function crearCarrito(local) {
  const clave = `carrito:${local.slug}`;
  let carrito = leer();
  const alCambiar = new Set();

  function leer() {
    try {
      return JSON.parse(localStorage.getItem(clave) ?? "[]");
    } catch {
      return [];
    }
  }

  function guardar(nuevo) {
    carrito = lineasValidas(local, nuevo).map(({ productoId, cantidad }) => ({ productoId, cantidad }));
    try {
      localStorage.setItem(clave, JSON.stringify(carrito));
    } catch {}
    pintarBarra();
    if (hoja.open) pintarHoja();
    for (const f of alCambiar) f();
  }

  const cantidadDe = (id) => carrito.find((l) => l.productoId === id)?.cantidad ?? 0;

  // ---------- Botón de cada producto: "Agregar" o "− 2 +" ----------
  // `fijo`: los de la carta se repintan solos al cambiar el carrito; los de la hoja no hace falta,
  // porque la hoja entera se vuelve a pintar.
  function control(producto, fijo = true) {
    const caja = crear("div", { className: "control" });
    const pintar = () => {
      const n = cantidadDe(producto.id);
      if (producto.agotado) return caja.replaceChildren(crear("span", { className: "control-agotado" }, "Agotado"));
      if (!n) {
        return caja.replaceChildren(
          crear("button", { type: "button", className: "control-agregar", "aria-label": `Agregar ${producto.nombre}`, onclick: () => guardar(cambiarCantidad(carrito, producto.id, 1)) }, "Agregar"),
        );
      }
      caja.replaceChildren(
        crear("button", { type: "button", className: "control-paso", "aria-label": `Quitar un ${producto.nombre}`, onclick: () => guardar(cambiarCantidad(carrito, producto.id, -1)) }, "−"),
        crear("span", { className: "control-cantidad", "aria-live": "polite" }, String(n)),
        crear("button", { type: "button", className: "control-paso", "aria-label": `Sumar un ${producto.nombre}`, onclick: () => guardar(cambiarCantidad(carrito, producto.id, 1)) }, "+"),
      );
    };
    if (fijo) alCambiar.add(pintar);
    pintar();
    return caja;
  }

  // ---------- Barra fija de abajo ----------
  const barra = crear("button", { type: "button", className: "pedido-barra", hidden: true, onclick: () => abrir() });
  function pintarBarra() {
    const n = cantidadTotal(local, carrito);
    barra.hidden = n === 0;
    barra.replaceChildren(
      crear("span", { className: "pedido-barra-cantidad" }, String(n)),
      crear("span", {}, "Ver pedido"),
      crear("strong", {}, formatearPesos(calcularTotal(local, carrito))),
    );
  }

  // ---------- Hoja de pedido ----------
  const hoja = crear("dialog", { className: "pedido-hoja", "aria-labelledby": "pedido-titulo" });
  const datos = { nombre: "", entrega: "retiro", direccion: "", pago: local.mediosDePago[0], aclaraciones: "" };

  function campo(etiqueta, control) {
    return crear("label", { className: "pedido-campo" }, crear("span", {}, etiqueta), control);
  }

  function pintarHoja() {
    const lineas = lineasValidas(local, carrito);
    const cerrar = crear("button", { type: "button", className: "pedido-cerrar", onclick: () => hoja.close() }, "Cerrar");
    if (!lineas.length) {
      hoja.replaceChildren(crear("div", { className: "pedido-cabeza" }, crear("h2", { id: "pedido-titulo" }, "Tu pedido"), cerrar), crear("p", { className: "pedido-vacio" }, "Todavía no agregaste nada."));
      return;
    }

    const lista = crear(
      "ul",
      { className: "pedido-lineas" },
      lineas.map((l) =>
        crear(
          "li",
          {},
          crear("span", { className: "pedido-linea-nombre" }, l.producto.nombre, l.producto.detalle ? crear("small", {}, l.producto.detalle) : null),
          control(l.producto, false),
          crear("span", { className: "pedido-linea-precio" }, formatearPesos(l.subtotal)),
        ),
      ),
    );

    const entrega = crear("fieldset", { className: "pedido-entrega" }, crear("legend", {}, "Entrega"));
    for (const [valor, texto] of [["retiro", "Retiro en el local"], ["envio", local.envio.costo ? `Envío (${formatearPesos(local.envio.costo)})` : "Envío"]]) {
      if (valor === "envio" && !local.envio.disponible) continue;
      entrega.append(
        crear(
          "label",
          { className: "pedido-opcion" },
          crear("input", { type: "radio", name: "entrega", value: valor, checked: datos.entrega === valor, onchange: () => ((datos.entrega = valor), pintarHoja()) }),
          texto,
        ),
      );
    }
    if (local.envio.disponible && local.envio.zona) entrega.append(crear("p", { className: "pedido-nota" }, `Zona de envío: ${local.envio.zona}`));

    const formulario = crear(
      "form",
      { className: "pedido-form", onsubmit: (e) => enviar(e) },
      campo("Tu nombre", crear("input", { name: "nombre", required: true, autocomplete: "name", value: datos.nombre, oninput: (e) => (datos.nombre = e.target.value) })),
      entrega,
      datos.entrega === "envio"
        ? campo("Dirección", crear("input", { name: "direccion", required: true, autocomplete: "street-address", value: datos.direccion, oninput: (e) => (datos.direccion = e.target.value) }))
        : null,
      campo(
        "Forma de pago",
        crear("select", { name: "pago", onchange: (e) => (datos.pago = e.target.value) }, local.mediosDePago.map((m) => crear("option", { value: m, selected: m === datos.pago }, m))),
      ),
      campo("Aclaraciones (opcional)", crear("textarea", { name: "aclaraciones", rows: 2, value: datos.aclaraciones, oninput: (e) => (datos.aclaraciones = e.target.value) })),
      crear(
        "div",
        { className: "pedido-total" },
        costoEnvio(local, datos.entrega) ? crear("span", {}, `Incluye envío de ${formatearPesos(costoEnvio(local, datos.entrega))}`) : null,
        crear("strong", {}, `Total ${formatearPesos(calcularTotal(local, carrito, datos.entrega))}`),
      ),
      crear("button", { type: "submit", className: "pedido-enviar" }, "Enviar pedido por WhatsApp"),
    );

    hoja.replaceChildren(crear("div", { className: "pedido-cabeza" }, crear("h2", { id: "pedido-titulo" }, "Tu pedido"), cerrar), lista, formulario);
  }

  function enviar(evento) {
    evento.preventDefault();
    const mensaje = armarMensaje(local, carrito, { ...datos, nombre: datos.nombre.trim(), aclaraciones: datos.aclaraciones.trim() });
    window.open(linkWhatsApp(local.whatsapp, mensaje), "_blank", "noopener");
  }

  function abrir() {
    pintarHoja();
    hoja.showModal();
  }

  hoja.addEventListener("click", (e) => {
    if (e.target === hoja) hoja.close();
  });

  document.body.append(barra, hoja);
  pintarBarra();
  /** Suma un producto (o un armado, por su id) y avisa con la barra. */
  function agregar(id, cantidad = 1) {
    guardar(cambiarCantidad(carrito, id, cantidad));
    barra.classList.remove("pedido-barra-salta");
    void barra.offsetWidth;
    barra.classList.add("pedido-barra-salta");
  }

  return { control, abrir, agregar };
}
