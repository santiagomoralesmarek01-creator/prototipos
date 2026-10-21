// App "Comanda": tablero de pedidos para la cocina del local. Los pedidos se guardan en el
// dispositivo; en la demo se arma un turno de ejemplo con la carta del local y se pueden simular más.
import { formatearPesos } from "../../nucleo/formato.js";
import { botonTema, cargarContenido, crear, firma } from "../../nucleo/pagina.js";
import { avanzar, DEMORA, ESTADOS, minutosEsperando, moverA, pedidoAlAzar, resumenDelDia, retroceder, totalPedido, turnoDeEjemplo, urgencia } from "./comandas.js";

const local = await cargarContenido();
const CLAVE = `comanda:${local.slug}`;
const ENTREGAS = { salon: "Salón", retiro: "Retiro", envio: "Envío" };

// Si lo guardado es de otro turno (más de 3 horas sin pedidos nuevos), arranca un turno de ejemplo nuevo.
const guardados = leer();
const vigentes = guardados?.length && Math.max(...guardados.map((p) => p.creado)) > Date.now() - 3 * 3600_000;
let pedidos = vigentes ? guardados : turnoDeEjemplo(local);
let filtro = "todos";
let automaticos = false;
let temporizador = null;

function leer() {
  try {
    return JSON.parse(localStorage.getItem(CLAVE));
  } catch {
    return null;
  }
}

function guardar() {
  try {
    localStorage.setItem(CLAVE, JSON.stringify(pedidos));
  } catch {}
  pintar();
}

const actualizar = (id, cambio) => {
  pedidos = pedidos.map((p) => (p.id === id ? cambio(p) : p));
  guardar();
};

function nuevoPedido() {
  const numero = Math.max(100, ...pedidos.map((p) => p.numero)) + 1;
  pedidos = [...pedidos, pedidoAlAzar(local, numero, Date.now())];
  guardar();
  const tarjeta = document.querySelector(`[data-id="p${numero}"]`);
  tarjeta?.classList.add("ticket-nuevo");
}

// ---------- Estructura ----------

const reloj = crear("time", { className: "reloj" });
const numeros = crear("dl", { className: "numeros" });
const tablero = crear("div", { className: "tablero" });
const filtros = crear("div", { className: "filtros", role: "group", "aria-label": "Filtrar por entrega" });

document.body.append(
  crear(
    "header",
    { className: "barra" },
    crear("div", { className: "barra-marca" }, crear("span", { className: "barra-app" }, "Comanda"), crear("strong", {}, local.nombre)),
    reloj,
    crear(
      "div",
      { className: "barra-acciones" },
      crear("button", { type: "button", className: "boton boton-principal", onclick: nuevoPedido }, "Simular pedido"),
      crear("label", { className: "interruptor" }, crear("input", { type: "checkbox", onchange: (e) => alternarAutomaticos(e.target.checked) }), "Pedidos automáticos"),
      botonTema(),
    ),
  ),
  crear("main", {}, numeros, filtros, tablero),
  crear(
    "footer",
    { className: "pie" },
    crear("p", {}, `Demora: ámbar a los ${DEMORA.aviso} minutos y rojo a los ${DEMORA.atraso}. Arrastrá los tickets entre columnas o usá los botones.`),
    crear(
      "button",
      {
        type: "button",
        className: "boton-texto",
        onclick: () => {
          pedidos = turnoDeEjemplo(local);
          guardar();
        },
      },
      "Reiniciar la demo",
    ),
    firma(),
  ),
);

function alternarAutomaticos(activo) {
  automaticos = activo;
  clearInterval(temporizador);
  if (activo) temporizador = setInterval(nuevoPedido, 20000);
}

// ---------- Pintar ----------

function pintarNumeros() {
  const r = resumenDelDia(pedidos);
  const dato = (valor, texto, clase = "") => crear("div", { className: `numero ${clase}` }, crear("dt", {}, texto), crear("dd", {}, valor));
  numeros.replaceChildren(
    dato(String(r.pedidos), "Pedidos del turno"),
    dato(formatearPesos(r.facturado), "Facturado"),
    dato(formatearPesos(r.ticket), "Ticket promedio"),
    dato(`${r.demora} min`, "Demora promedio", r.demora >= DEMORA.aviso ? "numero-alerta" : ""),
    dato(String(r.pendientes), "En espera", r.pendientes > 5 ? "numero-alerta" : ""),
  );
}

function pintarFiltros() {
  const cuenta = (tipo) => pedidos.filter((p) => p.estado !== "entregado" && (tipo === "todos" || p.entrega === tipo)).length;
  filtros.replaceChildren(
    ...[["todos", "Todos"], ...Object.entries(ENTREGAS)].map(([valor, texto]) =>
      crear("button", { type: "button", "aria-pressed": String(filtro === valor), onclick: () => ((filtro = valor), pintar()) }, texto, crear("span", {}, String(cuenta(valor)))),
    ),
  );
}

function ticket(p) {
  const minutos = minutosEsperando(p);
  const estado = ESTADOS.find((e) => e.id === p.estado);
  const t = crear(
    "article",
    { className: `ticket ticket-${urgencia(p)}`, draggable: true, "data-id": p.id, "aria-label": `Pedido ${p.numero}` },
    crear(
      "header",
      { className: "ticket-cabeza" },
      crear("strong", { className: "ticket-numero" }, `#${p.numero}`),
      crear("span", { className: `ticket-entrega entrega-${p.entrega}` }, p.entrega === "salon" ? `Mesa ${p.mesa}` : ENTREGAS[p.entrega]),
      p.estado === "entregado" ? null : crear("span", { className: "ticket-tiempo", title: "Minutos desde que entró" }, `${minutos}′`),
    ),
    crear("p", { className: "ticket-cliente" }, p.cliente),
    crear(
      "ul",
      { className: "ticket-items" },
      p.items.map((i) => crear("li", {}, crear("span", { className: "ticket-cantidad" }, `${i.cantidad}×`), crear("span", {}, i.nombre, i.nota ? crear("em", {}, i.nota) : null))),
    ),
    crear(
      "footer",
      { className: "ticket-pie" },
      crear("span", {}, formatearPesos(totalPedido(p))),
      p.estado !== "nuevo" ? crear("button", { type: "button", className: "boton-texto", "aria-label": `Volver el pedido ${p.numero} atrás`, onclick: () => actualizar(p.id, retroceder) }, "Deshacer") : null,
      estado.accion ? crear("button", { type: "button", className: "boton boton-ticket", onclick: () => actualizar(p.id, (x) => avanzar(x)) }, estado.accion) : null,
    ),
  );
  t.addEventListener("dragstart", (e) => {
    e.dataTransfer.setData("text/plain", p.id);
    t.classList.add("arrastrando");
  });
  t.addEventListener("dragend", () => t.classList.remove("arrastrando"));
  return t;
}

function pintarTablero() {
  const visibles = pedidos.filter((p) => filtro === "todos" || p.entrega === filtro);
  tablero.replaceChildren(
    ...ESTADOS.map((e) => {
      const propios = visibles
        .filter((p) => p.estado === e.id)
        // Los más viejos arriba; en entregados, los últimos arriba.
        .sort((a, b) => (e.id === "entregado" ? (b.entregado ?? 0) - (a.entregado ?? 0) : a.creado - b.creado));
      const columna = crear(
        "section",
        { className: `columna columna-${e.id}`, "aria-labelledby": `col-${e.id}` },
        crear("h2", { id: `col-${e.id}` }, e.nombre, crear("span", {}, String(propios.length))),
        crear("div", { className: "columna-lista" }, propios.length ? propios.map(ticket) : crear("p", { className: "columna-vacia" }, e.id === "nuevo" ? "Sin pedidos nuevos" : "Nada por acá")),
      );
      columna.addEventListener("dragover", (ev) => {
        ev.preventDefault();
        columna.classList.add("sobre");
      });
      columna.addEventListener("dragleave", () => columna.classList.remove("sobre"));
      columna.addEventListener("drop", (ev) => {
        ev.preventDefault();
        columna.classList.remove("sobre");
        const id = ev.dataTransfer.getData("text/plain");
        actualizar(id, (p) => moverA(p, e.id));
      });
      return columna;
    }),
  );
}

function pintarReloj() {
  reloj.textContent = new Intl.DateTimeFormat("es-AR", { hour: "2-digit", minute: "2-digit", hourCycle: "h23", timeZone: "America/Argentina/Buenos_Aires" }).format(new Date());
}

function pintar() {
  pintarNumeros();
  pintarFiltros();
  pintarTablero();
  pintarReloj();
}

pintar();
// Los minutos de cada ticket corren solos.
setInterval(pintar, 30000);
