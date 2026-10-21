// Plantilla "Diario": casa de comidas y rotisería con estética de tapa de diario. Papel, tinta,
// cabecera gótica, titulares en Old Standard y la carta a columnas con filetes.
import { svgDibujo } from "../../nucleo/dibujos.js";
import { formatearPesos } from "../../nucleo/formato.js";
import { crear, svg } from "../../nucleo/pagina.js";
import { webLocal } from "../../nucleo/web.js";

const ZONA = "America/Argentina/Buenos_Aires";
const fechaDeHoy = () => new Intl.DateTimeFormat("es-AR", { timeZone: ZONA, weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(new Date());

/** "Año XXXIV" si la primera cifra es el año de apertura (1991 → hoy). */
function anio(local) {
  const desde = Number(local.cifras?.[0]?.valor);
  if (!(desde > 1900 && desde < 2100)) return null;
  const n = new Date().getFullYear() - desde;
  const romano = (x) => [["L", 50], ["XL", 40], ["X", 10], ["IX", 9], ["V", 5], ["IV", 4], ["I", 1]].reduce((s, [l, v]) => { while (x >= v) { s += l; x -= v; } return s; }, "");
  return n > 0 && n < 90 ? `Año ${romano(n)}` : null;
}

// Tapa: cabecera gótica con fecha; titular a la izquierda y el aviso del menú del día a la derecha.
function portada(p) {
  const l = p.local;
  const menu = l.armadores?.find((a) => a.tipo === "menu");
  const aviso = crear(
    "aside",
    { className: "aviso" },
    crear("p", { className: "aviso-volanta" }, menu ? "Menú del día" : "La especialidad"),
    svg(svgDibujo("olla", "aviso-dibujo")),
    menu ? crear("p", { className: "aviso-precio" }, formatearPesos(menu.precio)) : null,
    crear("p", { className: "aviso-texto" }, menu ? menu.bajada ?? "Plato, guarnición, bebida y postre." : l.descripcion),
    p.armador ?? p.verCarta,
  );
  return crear(
    "div",
    { className: "diario" },
    crear(
      "div",
      { className: "diario-cabecera" },
      crear("span", {}, anio(l) ?? l.direccion.split(",").pop().trim()),
      // El tamaño de la cabecera sale del largo del nombre: entra siempre en un renglón.
      crear("p", { className: "diario-nombre", style: `--letras: ${l.nombre.length}` }, l.nombre),
      crear("span", {}, fechaDeHoy()),
    ),
    crear("div", { className: "diario-filete" }, p.estado, crear("span", {}, `Edición para llevar · ${l.envio.disponible ? `envíos a ${l.envio.zona ?? "domicilio"}` : "retiro en el local"}`)),
    crear("div", { className: "diario-tapa" }, crear("div", { className: "diario-nota" }, p.titulo, p.bajada, crear("div", { className: "portada-botones" }, p.verCarta, p.pedir)), aviso),
  );
}

webLocal({
  portada,
  cinta: false,
  textos: { destacados: "Lo más pedido de la semana", carta: "La carta completa", historia: "Una historia de barrio", datos: "Horarios y repartos", verCarta: "Ver la carta", pedir: "Pedir por WhatsApp" },
});
