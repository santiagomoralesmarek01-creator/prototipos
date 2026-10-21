# Plan de trabajo

## Hecho

- Núcleo compartido (carta, carrito, WhatsApp, horarios, tema, firma, validación).
- Armadores: semana de viandas, box para llenar (con regalo), burger capa por capa.
- Plantillas `local-barrio` (rotisería), `local-cafe` (cafetería) y `local-horno` (pizzería), revisadas en celular/escritorio y claro/oscuro.
- Armadores de pizzería: `mitades` (pizza dibujada mitad y mitad) y `juntada` (cuántas pizzas según personas y hambre).
- Tests del núcleo (`npm test`).
- Contenidos: bodegon-el-farol, cerveceria-la-tiza, copo-heladeria, rotiseria-don-tito, cafe-brote, humo-burgers.

## Sigue (en este orden)

Regla del usuario: **cada 5 páginas gastronómicas, 1 página de categoría "app"** (como Filo, Mercadito,
Miga o Domingo en Vitrina), en lo posible útil para el rubro gastronómico.

4. Plantilla `local-noche` (hamburguesería, burger capa por capa).
5. Plantillas de plan Carta: `carta-clasica`, `carta-pizarra`, `carta-minimal`.
6. Catálogo (`index.html` en la raíz): todas las plantillas con captura, filtros por rubro y plan,
   y "probar con otro contenido". Pensado para sumarlo a Vitrina como una carpeta.
7. Capturas en `capturas/` (para el catálogo y para mostrarle al cliente).
8. `scripts/entregar.mjs`: plantilla + contenido → carpeta lista para publicar (valida el contenido).
9. Integrar en Vitrina (repo `vitrina`, publicado en https://vitrina-iota-ten.vercel.app/): copiar el
   catálogo y las plantillas a `public/prototipos/` (se sirven tal cual, sin build) y sumar la sección
   a la galería. Pedir permiso de push al repo `vitrina`.
10. Más plantillas y armadores por rubro (ideas abajo), siempre al nivel de Vitrina.

## Ideas de pedidos interactivos

- Rotisería: armá tu docena (ya en Carta Local), semana de viandas (hecho), menú del día (plato + guarnición + bebida).
- Cafetería: armá tu desayuno (ya en Café Almendra), box de merienda (hecho), café a tu medida (tamaño, leche, extras, taza dibujada).
- Pizzería: mitades (ya en Carta Local), pizza por ingredientes, calculadora para la juntada, combo pizza + fainá + bebida.
- Hamburguesería: burger capa por capa (hecho). Heladería: armá tu pote. Panadería: docena de facturas.
  Parrilla: parrillada por personas. Sushi: combinado pieza por pieza. Pastas: pasta + salsa.
