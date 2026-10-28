// Vista previa al compartir el link (WhatsApp, Instagram, redes): escribe en el <head> de cada página
// el título real (sin "{nombre}", que los buscadores y WhatsApp no ven porque no corren el JS), la
// descripción y las etiquetas Open Graph. Con --capturas también genera las imágenes de 1200×630 en
// capturas/og/ (necesita Playwright, como scripts/capturas.mjs).
// Uso: node scripts/vista-previa.mjs [--capturas]
// Las direcciones apuntan a donde se publica el catálogo (la Vitrina). Para entregar una plantilla a
// un cliente, se corre de nuevo con SITIO=https://su-dominio.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import { PLANTILLAS } from "../catalogo.js";

const SITIO = (process.env.SITIO ?? "https://vitrina-iota-ten.vercel.app/plantillas").replace(/\/$/, "");
const INICIO = "<!-- vista-previa -->";
const FIN = "<!-- /vista-previa -->";

const TIPO = { web: "Web de pedidos", carta: "Carta", app: "App" };

/** Escapa lo que va dentro de un atributo o del <title>. */
const esc = (s) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

function etiquetas({ titulo, descripcion, url, imagen, alt }) {
  return [
    INICIO,
    `<meta name="description" content="${esc(descripcion)}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:locale" content="es_AR" />`,
    `<meta property="og:site_name" content="Plantillas para gastronomía · MrK" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta property="og:title" content="${esc(titulo)}" />`,
    `<meta property="og:description" content="${esc(descripcion)}" />`,
    `<meta property="og:image" content="${imagen}" />`,
    `<meta property="og:image:type" content="image/jpeg" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta property="og:image:alt" content="${esc(alt)}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    FIN,
  ];
}

/** Reemplaza el título y el bloque de vista previa (o lo agrega antes de </head>), respetando la sangría. */
function escribir(ruta, titulo, datos) {
  let html = readFileSync(ruta, "utf8");
  html = html.replace(/<title>[^<]*<\/title>/, `<title>${esc(titulo)}</title>`);
  // La descripción vacía de la plantilla la reemplaza la del bloque.
  html = html.replace(/\n[ \t]*<meta name="description" content="" \/>/, "");
  const sangria = (html.match(/\n([ \t]*)<title>/) ?? [, "    "])[1];
  const bloque = etiquetas({ titulo, ...datos }).map((l) => sangria + l).join("\n");
  const viejo = new RegExp(`[ \\t]*${INICIO}[\\s\\S]*?${FIN}`);
  html = viejo.test(html) ? html.replace(viejo, bloque) : html.replace(/\n([ \t]*)<\/head>/, `\n${bloque}\n$1</head>`);
  writeFileSync(ruta, html);
}

for (const p of PLANTILLAS) {
  const contenido = JSON.parse(readFileSync(`contenido/${p.contenido}.json`, "utf8"));
  const nombre = contenido.nombre;
  const imagen = `${SITIO}/capturas/og/${p.id}.jpg`;
  const alt = `${nombre}: ${p.estilo}`;
  const lema = contenido.eslogan ? `${contenido.eslogan} ` : "";
  const paginas = [["index.html", `${nombre} · ${p.tipo === "web" ? "Pedidos" : TIPO[p.tipo]}`, `${lema}${TIPO[p.tipo]} de ejemplo, plantilla ${p.nombre} por MrK.`]];
  if (p.salon) paginas.push(["carta.html", `Carta · ${nombre}`, `${lema}Carta del salón de ejemplo, plantilla ${p.nombre} por MrK.`]);
  for (const [archivo, titulo, descripcion] of paginas) {
    const url = `${SITIO}/plantillas/${p.id}/${archivo === "index.html" ? "" : "carta.html"}`;
    escribir(`plantillas/${p.id}/${archivo}`, titulo, { descripcion, url, imagen, alt });
  }
}

// El catálogo.
{
  const titulo = "Plantillas para gastronomía · Vitrina por MrK";
  const html = readFileSync("index.html", "utf8");
  const descripcion = html.match(/<meta name="description" content="([^"]+)"/)?.[1] ?? "";
  writeFileSync("index.html", html.replace(/\n[ \t]*<meta name="description" content="[^"]*" \/>/, ""));
  escribir("index.html", titulo, {
    descripcion,
    url: `${SITIO}/`,
    imagen: `${SITIO}/capturas/og/catalogo.jpg`,
    alt: "Plantillas para gastronomía: webs de pedidos, cartas y apps para cafeterías, rotiserías y pizzerías.",
  });
}
console.log(`Vista previa escrita en ${PLANTILLAS.length} plantillas y el catálogo.`);

if (process.argv.includes("--capturas")) {
  const require = createRequire(import.meta.url);
  const { chromium } = require(process.env.PW ?? "playwright");
  const PUERTO = 8767;
  const servidor = spawn("python3", ["-m", "http.server", String(PUERTO)], { stdio: "ignore" });
  await new Promise((r) => setTimeout(r, 800));
  mkdirSync("capturas/og", { recursive: true });
  const navegador = await chromium.launch(process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {});
  try {
    const destinos = [...PLANTILLAS.map((p) => [p.id, `/plantillas/${p.id}/`]), ["catalogo", "/"]];
    for (const [id, ruta] of destinos) {
      const pagina = await navegador.newPage({ viewport: { width: 1200, height: 630 } });
      await pagina.addInitScript(() => localStorage.setItem("tema", "claro"));
      await pagina.goto(`http://localhost:${PUERTO}${ruta}`, { waitUntil: "networkidle" });
      await pagina.evaluate(() => document.fonts.ready);
      await pagina.waitForTimeout(1200);
      // Sin el aviso de demo, el botón de volver ni barras fijas encima de la portada.
      await pagina.addStyleTag({ content: ".aviso-demo,.volver{display:none!important} *{animation-play-state:paused!important}" });
      await pagina.evaluate(() =>
        document.querySelectorAll("body *").forEach((e) => {
          if (getComputedStyle(e).position === "fixed") e.style.display = "none";
        }),
      );
      await pagina.screenshot({ path: `capturas/og/${id}.jpg`, type: "jpeg", quality: 82 });
      console.log(`capturas/og/${id}.jpg`);
      await pagina.close();
    }
  } finally {
    await navegador.close();
    servidor.kill();
  }
}
