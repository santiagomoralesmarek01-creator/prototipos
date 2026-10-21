// Plantilla "Giro": pizzería de delivery, moderna y a todo color. Rojo tomate, crema y mostaza,
// tipografía ancha (Unbounded) y la pizza estrella del local girando, cortada por el borde.
import { dibujoPizza } from "../../nucleo/armadores-ui.js";
import { formatearPesos } from "../../nucleo/formato.js";
import { crear } from "../../nucleo/pagina.js";
import { webLocal } from "../../nucleo/web.js";

/** La pizza estrella: la primera destacada que tenga ingredientes cargados (o la primera con cubierta). */
function pizzaEstrella(local) {
  const productos = local.categorias.flatMap((c) => c.productos);
  const ids = local.destacados ?? [];
  return ids.map((id) => productos.find((p) => p.id === id)).find((p) => p?.cubierta) ?? productos.find((p) => p.cubierta);
}

// Portada partida: el panel rojo con el texto y, a la derecha, la pizza estrella enorme girando.
function portada(p) {
  const estrella = pizzaEstrella(p.local);
  const pizza = estrella ? dibujoPizza(estrella, estrella) : null;
  pizza?.setAttribute("aria-hidden", "true");
  return crear(
    "div",
    { className: "giro" },
    crear("div", { className: "giro-texto" }, p.estado, p.titulo, p.bajada, crear("div", { className: "portada-botones" }, p.armador ?? p.verCarta, p.pedir)),
    pizza
      ? crear(
          "div",
          { className: "giro-pizza" },
          pizza,
          crear("p", { className: "giro-etiqueta" }, crear("span", {}, "La que más sale"), crear("strong", {}, estrella.nombre), crear("span", {}, formatearPesos(estrella.precio))),
        )
      : null,
  );
}

// En lugar de la cinta: cómo se pide, en tres pasos.
function pasos(local) {
  const armador = local.armadores?.[0];
  const paso = (n, titulo, texto, href) => crear(href ? "a" : "div", { className: "paso", href }, crear("span", { className: "paso-numero" }, String(n)), crear("strong", {}, titulo), crear("span", {}, texto));
  return crear(
    "div",
    { className: "pasos" },
    paso(1, "Elegí", `${local.categorias.length} secciones en la carta`, "#carta"),
    armador ? paso(2, "Armá", armador.titulo ?? "A tu manera", `#armador-${armador.tipo}`) : paso(2, "Sumá", "Lo que quieras al pedido", "#carta"),
    paso(3, "Pedí", local.envio.disponible ? `Por WhatsApp · envío a ${local.envio.zona?.toLowerCase() ?? "tu casa"}` : "Por WhatsApp y retirá", null),
  );
}

webLocal({
  portada,
  cinta: pasos,
  textos: { destacados: "Las que más salen", carta: "La carta", historia: "Quiénes somos", datos: "Horarios y envíos", verCarta: "Ver la carta", pedir: "Pedir ya" },
});
