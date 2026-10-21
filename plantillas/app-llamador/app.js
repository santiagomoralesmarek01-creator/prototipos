// App "Llamador": la pantalla de la tele del local. Muestra en grande los pedidos listos para
// retirar y, al costado, los que se están preparando. Lee los pedidos de la app Comanda (mismo
// dispositivo): si la cocina marca "Listo", el número aparece acá solo.
import { avanzar, turnoDeEjemplo } from "../app-comanda/comandas.js";
import { formatearPesos } from "../../nucleo/formato.js";
import { botonTema, cargarContenido, crear, firma } from "../../nucleo/pagina.js";
import { listos, nuevosListos, preparando, promociones } from "./llamador.js";

const local = await cargarContenido();
const CLAVE = `comanda:${local.slug}`;

function leer() {
  try {
    const guardados = JSON.parse(localStorage.getItem(CLAVE));
    if (guardados?.length) return guardados;
  } catch {}
  return null;
}

let pedidos = leer() ?? turnoDeEjemplo(local);
let sonido = false;

// ---------- Estructura ----------

const reloj = crear("time", { className: "reloj" });
const tablero = crear("div", { className: "tablero-listos", "aria-live": "polite" });
const enCocina = crear("ol", { className: "lista-cocina" });
const anuncio = crear("div", { className: "anuncio", "aria-live": "assertive" });
const promos = promociones(local, formatearPesos);

document.body.append(
  crear(
    "header",
    { className: "barra" },
    crear("div", { className: "barra-marca" }, crear("span", {}, "Llamador"), crear("strong", {}, local.nombre)),
    reloj,
    crear(
      "div",
      { className: "barra-acciones" },
      crear(
        "button",
        {
          type: "button",
          className: "boton",
          onclick: (e) => {
            sonido = !sonido;
            e.currentTarget.textContent = sonido ? "Sonido activado" : "Activar sonido";
            e.currentTarget.setAttribute("aria-pressed", String(sonido));
          },
          "aria-pressed": "false",
        },
        "Activar sonido",
      ),
      crear("button", { type: "button", className: "boton", onclick: () => document.documentElement.requestFullscreen?.() }, "Pantalla completa"),
      crear("button", { type: "button", className: "boton boton-principal", onclick: simular }, "Simular pedido listo"),
      botonTema(),
    ),
  ),
  crear(
    "main",
    { className: "pantalla" },
    crear("section", { className: "zona-listos", "aria-labelledby": "t-listos" }, crear("h1", { id: "t-listos" }, "Listos para retirar"), tablero),
    crear("section", { className: "zona-cocina", "aria-labelledby": "t-cocina" }, crear("h2", { id: "t-cocina" }, "Preparando"), enCocina),
    anuncio,
  ),
  promos.length
    ? crear("div", { className: "promos", "aria-hidden": "true" }, crear("div", { className: "promos-pista" }, Array.from({ length: 2 * Math.ceil(10 / promos.length) }, () => promos).flat().map((t) => crear("span", {}, t))))
    : null,
  crear(
    "footer",
    { className: "pie" },
    crear("p", {}, "Abrí la app Comanda en este mismo dispositivo: cuando la cocina marca un pedido como listo, aparece acá."),
    crear("a", { href: "../app-comanda/" }, "Abrir Comanda"),
    firma(),
  ),
);

// ---------- Pintar ----------

/** Un número en fichas que se dan vuelta, como un cartel de aeropuerto. */
function flaps(numero, nuevo) {
  return crear(
    "div",
    { className: `flaps${nuevo ? " flaps-nuevo" : ""}` },
    String(numero)
      .split("")
      .map((d, i) => crear("span", { className: "flap", style: `--i: ${i}` }, d)),
  );
}

function pintar(recien = []) {
  const ls = listos(pedidos);
  tablero.replaceChildren(
    ...(ls.length
      ? ls.map((p, i) => crear("div", { className: `turno${i === 0 ? " turno-ultimo" : ""}` }, flaps(p.numero, recien.includes(p.numero)), crear("span", { className: "turno-nombre" }, p.cliente)))
      : [crear("p", { className: "vacio" }, "Todavía no hay pedidos listos.")]),
  );
  const prep = preparando(pedidos);
  enCocina.replaceChildren(...(prep.length ? prep.map((p) => crear("li", {}, crear("strong", {}, String(p.numero)), crear("span", {}, p.cliente))) : [crear("li", { className: "vacio" }, "Nada en preparación")]));
  reloj.textContent = new Intl.DateTimeFormat("es-AR", { hour: "2-digit", minute: "2-digit", hourCycle: "h23", timeZone: "America/Argentina/Buenos_Aires" }).format(new Date());
}

function anunciar(numeros) {
  if (!numeros.length) return;
  anuncio.textContent = `Pedido ${numeros.join(", ")} listo`;
  anuncio.classList.remove("anuncio-visible");
  void anuncio.offsetWidth;
  anuncio.classList.add("anuncio-visible");
  if (sonido) campana();
}

/** Dos notas cortas, como un timbre de mostrador. */
function campana() {
  try {
    const ctx = new AudioContext();
    [880, 660].forEach((f, i) => {
      const osc = ctx.createOscillator();
      const vol = ctx.createGain();
      osc.frequency.value = f;
      vol.gain.setValueAtTime(0.0001, ctx.currentTime + i * 0.22);
      vol.gain.exponentialRampToValueAtTime(0.3, ctx.currentTime + i * 0.22 + 0.02);
      vol.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + i * 0.22 + 0.5);
      osc.connect(vol).connect(ctx.destination);
      osc.start(ctx.currentTime + i * 0.22);
      osc.stop(ctx.currentTime + i * 0.22 + 0.55);
    });
  } catch {}
}

function actualizar(nuevos) {
  const recien = nuevosListos(pedidos, nuevos);
  pedidos = nuevos;
  pintar(recien);
  anunciar(recien);
}

/** Demo: el pedido en cocina más viejo pasa a listo (y se guarda, así Comanda también lo ve). */
function simular() {
  const siguiente = preparando(pedidos).find((p) => p.estado === "cocina") ?? preparando(pedidos)[0];
  if (!siguiente) return;
  let p = siguiente;
  while (p.estado !== "listo") p = avanzar(p);
  const nuevos = pedidos.map((x) => (x.id === p.id ? p : x));
  try {
    localStorage.setItem(CLAVE, JSON.stringify(nuevos));
  } catch {}
  actualizar(nuevos);
}

// Cuando Comanda (en otra pestaña) cambia los pedidos, el navegador avisa con "storage".
addEventListener("storage", (e) => {
  if (e.key === CLAVE) actualizar(leer() ?? pedidos);
});

pintar();
setInterval(() => pintar(), 30000);
