import { test } from "node:test";
import assert from "node:assert/strict";
import { listos, nuevosListos, preparando, promociones } from "../plantillas/app-llamador/llamador.js";
import { formatearPesos } from "../nucleo/formato.js";

const p = (id, estado, extra = {}) => ({ id, numero: Number(id.slice(1)), estado, creado: 0, ...extra });

test("llamador: listos del último al primero, preparando del más viejo", () => {
  const pedidos = [p("p1", "listo", { listo: 10 }), p("p2", "listo", { listo: 30 }), p("p3", "cocina", { creado: 5 }), p("p4", "nuevo", { creado: 2 }), p("p5", "entregado")];
  assert.deepEqual(listos(pedidos).map((x) => x.numero), [2, 1]);
  assert.deepEqual(preparando(pedidos).map((x) => x.numero), [4, 3]);
  assert.equal(listos(pedidos, 1).length, 1);
});

test("llamador: anuncia sólo los que recién pasaron a listo", () => {
  const antes = [p("p1", "listo"), p("p2", "cocina"), p("p3", "cocina")];
  const ahora = [p("p1", "listo"), p("p2", "listo"), p("p3", "cocina")];
  assert.deepEqual(nuevosListos(antes, ahora), [2]);
  assert.deepEqual(nuevosListos(ahora, ahora), []);
});

test("llamador: promociones con los destacados que no están agotados", () => {
  const local = { destacados: ["a", "b", "c"], categorias: [{ productos: [{ id: "a", nombre: "Muzza", precio: 1500 }, { id: "b", nombre: "Faina", precio: 900, agotado: true }] }] };
  assert.deepEqual(promociones(local, formatearPesos), ["Muzza $1.500"]);
});
