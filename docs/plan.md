# Plan de trabajo

## Hecho

- Núcleo compartido (carta, carrito, WhatsApp, horarios, tema, firma, validación).
- Armadores: semana de viandas, box para llenar (con regalo), burger capa por capa.
- Plantillas `local-barrio` (rotisería), `local-cafe` (cafetería) y `local-horno` (pizzería), revisadas en celular/escritorio y claro/oscuro.
- Armadores de pizzería: `mitades` (pizza dibujada mitad y mitad) y `juntada` (cuántas pizzas según personas y hambre).
- Tests del núcleo (`npm test`).
- Plantillas `local-noche` (hamburguesería) y `carta-clasica` (plan Carta).
- App `app-comanda` (tablero de cocina), la primera de categoría app.
- Catálogo (`index.html`) con capturas (`npm run capturas`), filtros y "Probar con" otro contenido.
- Contenidos: bodegon-el-farol, cerveceria-la-tiza, copo-heladeria, rotiseria-don-tito, cafe-brote, humo-burgers.

## Sigue (en este orden)

Regla del usuario: **cada 5 páginas gastronómicas, 1 página de categoría "app"** (como Filo, Mercadito,
Miga o Domingo en Vitrina), en lo posible útil para el rubro gastronómico.

5. Plantillas de plan Carta que faltan: `carta-pizarra` (cervecería), `carta-minimal` (heladería/café).
8. `scripts/entregar.mjs`: plantilla + contenido → carpeta lista para publicar (valida el contenido).
9. Integrar en Vitrina (repo `vitrina`, publicado en https://vitrina-iota-ten.vercel.app/): copiar el
   catálogo y las plantillas a `public/prototipos/` (se sirven tal cual, sin build) y sumar la sección
   a la galería. Pedir permiso de push al repo `vitrina`.
10. Próxima app (después de 5 gastronómicas más): reservas de mesas con plano del salón, o
    "café a tu medida" como app de pedido en mostrador.
11. Más plantillas y armadores por rubro (ideas abajo), siempre al nivel de Vitrina.

## Ideas de pedidos interactivos

- Rotisería: armá tu docena (ya en Carta Local), semana de viandas (hecho), menú del día (plato + guarnición + bebida).
- Cafetería: armá tu desayuno (ya en Café Almendra), box de merienda (hecho), café a tu medida (tamaño, leche, extras, taza dibujada).
- Pizzería: mitades (ya en Carta Local), pizza por ingredientes, calculadora para la juntada, combo pizza + fainá + bebida.
- Hamburguesería: burger capa por capa (hecho). Heladería: armá tu pote. Panadería: docena de facturas.
  Parrilla: parrillada por personas. Sushi: combinado pieza por pieza. Pastas: pasta + salsa.
