// Genera capturas/<id>.jpg (página completa a 1280 px, achicada a la mitad) de cada plantilla del
// catálogo. Necesita Playwright: `npm i -g playwright` o la variable PW con la ruta al paquete.
// Uso: npm run capturas            (levanta un servidor en el puerto 8766 mientras tanto)
import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import { PLANTILLAS } from "../catalogo.js";

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PW ?? "playwright");
const PUERTO = 8766;

const servidor = spawn("python3", ["-m", "http.server", String(PUERTO)], { stdio: "ignore" });
await new Promise((r) => setTimeout(r, 800));

const navegador = await chromium.launch();
try {
  for (const p of PLANTILLAS) {
    const pagina = await navegador.newPage({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 0.5 });
    await pagina.addInitScript(() => localStorage.setItem("tema", "claro"));
    await pagina.goto(`http://localhost:${PUERTO}/plantillas/${p.id}/`, { waitUntil: "networkidle" });
    await pagina.waitForTimeout(700);
    // Sin el aviso de demo ni animaciones a medio camino.
    await pagina.addStyleTag({ content: ".aviso-demo{display:none} *{animation-play-state:paused!important}" });
    await pagina.screenshot({ path: `capturas/${p.id}.jpg`, fullPage: true, type: "jpeg", quality: 72 });
    console.log("capturas/" + p.id + ".jpg");
    await pagina.close();
  }
} finally {
  await navegador.close();
  servidor.kill();
}
