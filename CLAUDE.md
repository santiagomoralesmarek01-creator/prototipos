# Prototipos gastronómicos

Plantillas de web y carta para comercios gastronómicos, listas para entregar cambiando sólo el
contenido (un JSON con el mismo formato que Carta Local, `src/tipos.ts` de ese repo).
HTML, CSS y JS de navegador, **sin build**: lo entregado funciona en cualquier hosting
(condición de baja de la propuesta comercial).

## Estructura

- `nucleo/`: lo compartido. Lógica sin DOM (`formato`, `horario`, `pedido`, `whatsapp`, `validar`,
  `armadores`) y páginas (`pagina`, `carrito`, `secciones`, `web`, `armadores-ui`, `dibujos`).
- `plantillas/<nombre>/`: `index.html` (+ `carta.html` en las de plan Local), `app.js`, `estilo.css`.
  La plantilla sólo aporta su HTML, su CSS, su dibujo de portada y textos; `nucleo/web.js` arma las secciones.
- `contenido/<slug>.json`: contenidos de ejemplo. Una plantilla se prueba con otro con `?contenido=<slug>`
  y el plan Carta con `?plan=carta`.
- Armadores (pedidos interactivos) en `armadores: [{ tipo, … }]` del contenido: `vianda`, `box`, `burger`.

## Reglas

- Planes (ver `carta-local/docs/propuesta.md`): **Carta** (carta para mirar, sin pedidos),
  **Local** y **Local Plus** (web + carta con pedido por WhatsApp; misma web, cambia el servicio).
- Rubros principales: cafeterías, rotiserías y pizzerías.
- Nivel de diseño: el de Vitrina y de las entregas reales (La Esquina en `carta-local/sitios/demo`,
  Café Almendra). Cada plantilla con identidad propia: tipografías, paleta, dibujo de portada,
  bandas con fondo y guardas. Nada genérico.
- Revisar cada plantilla con capturas: celular (390 px) y escritorio (1280 px), claro y oscuro.
- Textos en español rioplatense (vos), sin emojis. Precios enteros en pesos.
- Todas las páginas llevan la firma "Hecho por MrK" (`FIRMA` en `nucleo/pagina.js`).

## Probar

```bash
python3 -m http.server 8765   # http://localhost:8765/plantillas/local-barrio/
node --test tests/            # lógica del núcleo
```
