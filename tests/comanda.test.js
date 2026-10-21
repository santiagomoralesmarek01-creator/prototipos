import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { avanzar, minutosEsperando, moverA, pedidoAlAzar, resumenDelDia, retroceder, turnoDeEjemplo, urgencia } from "../plantillas/app-comanda/comandas.js";

const local = JSON.parse(readFileSync(new URL("../contenido/pizzeria-el-molde.json", import.meta.url)));
const MIN = 60000;

test("comanda: avanzar, retroceder y mover anotan las horas", () => {
  const p = { id: "p1", numero: 1, items: [{ nombre: "Muzza", cantidad: 2, precio: 1000 }], estado: "nuevo", creado: 0 };
  const enCocina = avanzar(p, 2 * MIN);
  assert.equal(enCocina.estado, "cocina");
  assert.equal(enCocina.empezado, 2 * MIN);
  const listo = moverA(p, "entregado", 10 * MIN);
  assert.equal(listo.estado, "entregado");
  assert.equal(listo.listo, 10 * MIN);
  const vuelta = retroceder(listo);
  assert.equal(vuelta.estado, "listo");
  assert.equal(vuelta.entregado, undefined);
  assert.equal(moverA(listo, "nuevo").empezado, undefined);
});

test("comanda: demoras y urgencia", () => {
  const p = { estado: "cocina", creado: 0 };
  assert.equal(minutosEsperando(p, 14 * MIN), 14);
  assert.equal(urgencia(p, 14 * MIN), "ok");
  assert.equal(urgencia(p, 15 * MIN), "demorado");
  assert.equal(urgencia(p, 30 * MIN), "atrasado");
  assert.equal(urgencia({ ...p, estado: "listo", listo: 40 * MIN }, 60 * MIN), "ok");
});

test("comanda: pedidos de ejemplo con la carta del local y resumen", () => {
  const ahora = 10_000 * MIN;
  const turno = turnoDeEjemplo(local, ahora, 3);
  assert.equal(turno.length, 12);
  assert.deepEqual(turnoDeEjemplo(local, ahora, 3), turno, "misma semilla, mismos pedidos");
  const nombres = new Set(local.categorias.flatMap((c) => c.productos).filter((p) => !p.agotado).map((p) => p.nombre));
  for (const p of turno) for (const i of p.items) assert.ok(nombres.has(i.nombre), i.nombre);
  const r = resumenDelDia(turno);
  assert.equal(r.pedidos, 12);
  assert.equal(r.pendientes, 6);
  assert.ok(r.demora >= 10 && r.demora <= 24);
  assert.equal(pedidoAlAzar({ ...local, envio: { disponible: false } }, 1, 0, () => 0.99).entrega, "retiro");
});
