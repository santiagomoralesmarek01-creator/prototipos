import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { formatearPesos } from "../nucleo/formato.js";
import { describirTurnos, estadoDelLocal } from "../nucleo/horario.js";
import { armarMensaje, calcularTotal, cambiarCantidad, lineasValidas } from "../nucleo/pedido.js";
import { box, burger, juntada, mitades, vianda } from "../nucleo/armadores.js";
import { contraste, validarContenido } from "../nucleo/validar.js";
import { normalizarWhatsapp } from "../nucleo/whatsapp.js";

const leer = (slug) => JSON.parse(readFileSync(new URL(`../contenido/${slug}.json`, import.meta.url)));
const contenidos = readdirSync(new URL("../contenido/", import.meta.url)).filter((f) => f.endsWith(".json"));

test("formato de pesos", () => {
  assert.equal(formatearPesos(1500), "$1.500");
  assert.equal(formatearPesos(1234567), "$1.234.567");
  assert.equal(formatearPesos(900), "$900");
});

test("whatsapp argentino", () => {
  assert.equal(normalizarWhatsapp("11 15 6247-4436"), "5491162474436");
  assert.equal(normalizarWhatsapp("+54 9 351 456-7806"), "5493514567806");
  assert.equal(normalizarWhatsapp("1234"), null);
});

test("horarios: abierto, cerrado y texto", () => {
  const turnos = [{ dias: [1, 2, 3, 4, 5], abre: "11:00", cierra: "15:00" }];
  // Miércoles 21/10/2026 12:00 en Buenos Aires = 15:00 UTC.
  assert.deepEqual(estadoDelLocal(turnos, new Date("2026-10-21T15:00:00Z")), { abierto: true, texto: "Abierto · cierra a las 15" });
  assert.equal(estadoDelLocal(turnos, new Date("2026-10-21T19:00:00Z")).texto, "Cerrado · abre mañana a las 11");
  assert.equal(estadoDelLocal(turnos, new Date("2026-10-23T19:00:00Z")).texto, "Cerrado · abre el lunes a las 11");
  assert.deepEqual(describirTurnos([...turnos, { dias: [1, 2, 3, 4, 5], abre: "19:00", cierra: "00:00" }]), ["Lunes a viernes de 11 a 15 y de 19 a 24"]);
});

test("todos los contenidos de ejemplo son válidos", () => {
  for (const f of contenidos) {
    const local = JSON.parse(readFileSync(new URL(`../contenido/${f}`, import.meta.url)));
    assert.deepEqual(validarContenido(local), [], f);
    if (local.marca?.color) assert.ok(contraste(local.marca.color, "#ffffff") >= 4.5, `${f}: color de marca sin contraste con blanco`);
  }
});

test("pedido: carrito, total con envío y mensaje", () => {
  const local = leer("rotiseria-don-tito");
  let c = cambiarCantidad([], "emp-carne", 6);
  c = cambiarCantidad(c, "tarta-calabaza", 1); // agotada: no cuenta
  c = cambiarCantidad(c, "emp-carne", -2);
  assert.equal(lineasValidas(local, c).length, 1);
  assert.equal(calcularTotal(local, c, "envio"), 4 * 1800 + 1500);
  const m = armarMensaje(local, c, { nombre: "Ana", entrega: "envio", direccion: "Mitre 1", pago: "Efectivo" });
  assert.match(m, /4 x Carne suave — \$7\.200/);
  assert.match(m, /\*Total: \$8\.700\*/);
});

test("vianda: descuentos por días y viaje en el carrito", () => {
  const local = leer("rotiseria-don-tito");
  const cfg = local.armadores[0];
  const eleccion = { 1: "mila-papas", 2: "tarta-jyq", 3: "mila-papas" };
  const r = vianda.calcular(local, cfg, eleccion);
  assert.equal(r.porcentaje, 10);
  assert.equal(r.total, Math.floor((12500 * 2 + 14000) * 0.9 / 100) * 100);
  const id = vianda.id(cfg, eleccion);
  const [linea] = lineasValidas(local, [{ productoId: id, cantidad: 1 }]);
  assert.equal(linea.subtotal, r.total);
  assert.match(armarMensaje(local, [{ productoId: id, cantidad: 1 }], { nombre: "A", entrega: "retiro", pago: "Efectivo" }), /Lun: Milanesa con papas fritas/);
  // Un plato agotado o de otra categoría no vale.
  assert.equal(lineasValidas(local, [{ productoId: "vianda:1=tarta-calabaza", cantidad: 1 }]).length, 0);
  assert.equal(lineasValidas(local, [{ productoId: "vianda:1=coca", cantidad: 1 }]).length, 0);
});

test("box: sólo completo, con descuento y regalo", () => {
  const local = leer("cafe-brote");
  const cfg = local.armadores[0];
  const items = ["medialunas", "cookie", "cookie", "budin-limon", "medialunas", "cookie"];
  const r = box.calcular(local, cfg, 6, items, true);
  const suma = 3600 * 2 + 3200 * 3 + 3900;
  assert.equal(r.total, Math.floor((suma * 0.9) / 100) * 100 + 1500);
  assert.equal(lineasValidas(local, [{ productoId: box.id(6, items, true), cantidad: 1 }])[0].subtotal, r.total);
  assert.equal(lineasValidas(local, [{ productoId: box.id(6, items.slice(0, 4)), cantidad: 1 }]).length, 0);
});

test("burger: límites de capas y precio", () => {
  const local = leer("humo-burgers");
  const cfg = local.armadores[0];
  let e = burger.inicial(cfg);
  e = burger.cambiar(cfg, e, "medallon", -5);
  assert.equal(e.medallon, 1);
  e = burger.cambiar(cfg, e, "medallon", 10);
  assert.equal(e.medallon, 4);
  const id = burger.id(cfg, e);
  assert.deepEqual(burger.leer(cfg, id), e);
  assert.equal(lineasValidas(local, [{ productoId: id, cantidad: 2 }])[0].subtotal, burger.calcular(cfg, e).total * 2);
  assert.equal(lineasValidas(local, [{ productoId: "burger:papa;medallon=9", cantidad: 1 }]).length, 0);
});

test("mitades: cobra la más cara, mismo id en cualquier orden", () => {
  const local = leer("pizzeria-el-molde");
  assert.equal(mitades.id("rucula", "muzzarella"), mitades.id("muzzarella", "rucula"));
  const [l] = lineasValidas(local, [{ productoId: mitades.id("muzzarella", "rucula"), cantidad: 1 }]);
  assert.equal(l.subtotal, 18500);
  assert.equal(lineasValidas(local, [{ productoId: "mitades:muzzarella+huevo", cantidad: 1 }]).length, 0); // agotada
  assert.equal(mitades.precio({ precio: "promedio" }, { precio: 13500 }, { precio: 18500 }), 16000);
});

test("juntada: pizzas por personas, reparto y sugerencias", () => {
  const local = leer("pizzeria-el-molde");
  const cfg = local.armadores.find((a) => a.tipo === "juntada");
  assert.equal(juntada.pizzasNecesarias(cfg, 8, "normal"), 3);
  assert.equal(juntada.pizzasNecesarias(cfg, 10, "mucho"), 5);
  assert.deepEqual(juntada.repartir(5, ["a", "b"]), { a: 3, b: 2 });
  const s = juntada.sugerencias(local, cfg, 8, 3);
  assert.deepEqual(s.map((x) => [x.producto.id, x.cantidad]), [["faina", 3], ["gaseosa-molde", 2]]);
});
