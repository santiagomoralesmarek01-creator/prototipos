# Prototipos gastronómicos

Webs de pedidos, cartas y apps listas para entregar a cafeterías, rotiserías y pizzerías.
El diseño ya está hecho: para un cliente nuevo se cambia **sólo el contenido** (un JSON con su carta,
precios, horarios y color). HTML, CSS y JavaScript sin frameworks ni build: lo que se entrega
funciona en cualquier hosting.

Catálogo con todas las opciones: `index.html` (también publicado en Vitrina, en `/plantillas/`).

## Plantillas

| Plantilla | Tipo | Rubro | Plan | Pedido interactivo |
|---|---|---|---|---|
| Barrio (`local-barrio`) | Web de pedidos + carta del salón | Rotisería | Local / Local Plus | Semana de viandas con descuento por días |
| Brote (`local-cafe`) | Web de pedidos + carta del salón | Cafetería | Local / Local Plus | Box de merienda para llenar, con regalo |
| Horno (`local-horno`) | Web de pedidos + carta del salón | Pizzería | Local / Local Plus | Pizza mitad y mitad dibujada y calculadora para la juntada |
| Noche (`local-noche`) | Web de pedidos + carta del salón | Hamburguesería, bar | Local / Local Plus | Burger capa por capa |
| Clásica (`carta-clasica`) | Carta | Restaurante, bodegón | Carta | — (índice, filtros, agotados) |
| Comanda (`app-comanda`) | App | Todos | Extra | Tablero de pedidos para la cocina |

Cualquier plantilla se ve con otro contenido: `plantillas/local-horno/?contenido=cafe-brote`.
Con `?plan=carta` se ve cómo queda en el plan Carta (sin pedidos).

## Contenido de un local

`contenido/<slug>.json`, mismo formato que Carta Local (ver `src/tipos.ts` en ese repo): nombre,
WhatsApp, dirección, turnos, envío, medios de pago, categorías y productos (precios enteros en pesos),
destacados, historia, cifras y `marca.color` / `marca.colorOscuro`. Además:

- `armadores`: pedidos interactivos. Tipos: `vianda`, `box`, `burger`, `mitades`, `juntada`
  (ver los ejemplos en `contenido/` y los comentarios de `nucleo/armadores.js`).
- `ilustracion` en una categoría elige su dibujo (`nucleo/dibujos.js`); si falta, se adivina por el nombre.
- `cartel`: el texto del cartel en el dibujo de portada (por defecto, el nombre sin el rubro).

## Probar

```bash
npm run dev          # http://localhost:8765 (catálogo) — necesita python3
npm test             # lógica del núcleo, armadores, comanda y validación de todos los contenidos
npm run capturas     # regenera capturas/ (necesita Playwright)
```

## Entregar a un cliente

1. Copiar `contenido/<parecido>.json` a `contenido/<slug-del-cliente>.json` y completarlo.
2. `npm test` valida el contenido (ids, precios, horarios, destacados, contraste del color).
3. Copiar `nucleo/`, la carpeta de la plantilla y el contenido; en el `index.html` (y `carta.html`)
   apuntar `data-contenido` al JSON del cliente y sacar `data-catalogo`.
4. Publicar en Vercel con el dominio del local. El QR de las mesas va a `https://<dominio>/carta.html`.

Para producción con panel del dueño (cambiar precios desde el celular), el diseño se pasa a
`carta-local/sitios/<local>/`, que comparte el mismo formato de contenido.
