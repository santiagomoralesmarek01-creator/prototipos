// Plantilla "Muestrario" (plan Carta): heladerías, cafeterías, pastelerías. Cada sabor es una ficha
// de color, como un muestrario de pinturas; la portada es un abanico de fichas.
import { crear } from "../../nucleo/pagina.js";
import { cartaSola } from "../../nucleo/web.js";

// Color de cada sabor por su nombre. Un producto puede fijar el suyo con `color`.
const SABORES = [
  [/dulce de leche|ddl/i, "#c8894d"],
  [/chocolate|cacao|brownie/i, "#5b3320"],
  [/frutilla|fresa/i, "#e8506b"],
  [/frambuesa|frutos rojos|cereza/i, "#b8264a"],
  [/pistacho/i, "#9cbf6b"],
  [/lim[oó]n/i, "#f1e06a"],
  [/maracuy[aá]|mango/i, "#f2b632"],
  [/menta|matcha/i, "#9ad8c2"],
  [/banana/i, "#f3dc6b"],
  [/durazno|damasco/i, "#f6b48a"],
  [/granizado|crema|americana|vainilla|sambay/i, "#f3e6c8"],
  [/caf[eé]|tiramis/i, "#8a5a3c"],
  [/almendr|avellan|nuez|praline/i, "#b98a5a"],
];
const colorDe = (p) => p.color ?? SABORES.find(([re]) => re.test(p.nombre))?.[1];

/** Los productos que son sabores (tienen color): para el abanico de la portada. */
const sabores = (local) => local.categorias.flatMap((c) => c.productos).filter((p) => colorDe(p));

// Portada: el nombre grande y un abanico de fichas con los sabores de la semana.
function portada(p) {
  const fichas = sabores(p.local).slice(0, 7);
  const abanico = crear(
    "div",
    { className: "abanico", "aria-hidden": "true", style: `--fichas: ${fichas.length}` },
    fichas.map((s, i) =>
      crear("div", { className: "ficha", style: `--i: ${i}; --color: ${colorDe(s)}` }, crear("span", { className: "ficha-codigo" }, `${p.local.cartel ?? "N.º"} ${String(i + 1).padStart(2, "0")}`), crear("span", { className: "ficha-nombre" }, s.nombre)),
    ),
  );
  return crear("div", { className: "muestrario" }, crear("div", { className: "muestrario-texto" }, p.volanta, p.titulo, p.bajada, p.estado), abanico);
}

const local = await cartaSola({ portada, volanta: "Muestrario de sabores", textos: { destacados: "Esta semana", datos: "Dónde y cuándo" } });

// En la carta, cada sabor lleva su ficha de color al lado del nombre.
const productos = local.categorias.flatMap((c) => c.productos);
let n = 0;
for (const fila of document.querySelectorAll(".carta-producto")) {
  const nombre = fila.querySelector(".carta-producto-nombre")?.textContent;
  const producto = productos.find((x) => x.nombre === nombre);
  const color = producto && colorDe(producto);
  if (!color) continue;
  fila.classList.add("con-ficha");
  fila.style.setProperty("--color", color);
  fila.prepend(crear("span", { className: "ficha-chica", "aria-hidden": "true" }, String(++n).padStart(2, "0")));
}
