# Plan de trabajo

## Hecho

- Núcleo compartido (carta, carrito, WhatsApp, horarios, tema, firma, validación).
- Armadores: semana de viandas, box para llenar (con regalo), burger capa por capa.
- Plantilla `local-barrio` (rotisería), revisada en celular/escritorio y claro/oscuro.
- Contenidos: bodegon-el-farol, cerveceria-la-tiza, copo-heladeria, rotiseria-don-tito, cafe-brote, humo-burgers.

## Sigue (en este orden)

1. Tests del núcleo (`tests/*.test.js` con `node --test`): horario, pedido, armadores, validar contenidos.
2. Plantilla `local-cafe` (cafetería, box de merienda).
3. Pizzería: contenido + armadores nuevos `mitades` (pizza por mitades dibujada) y `juntada`
   (calculadora de pizzas por cantidad de personas), y plantilla `local-horno`.
4. Plantilla `local-noche` (hamburguesería, burger capa por capa).
5. Plantillas de plan Carta: `carta-clasica`, `carta-pizarra`, `carta-minimal`.
6. Catálogo (`index.html` en la raíz): todas las plantillas con captura, filtros por rubro y plan,
   y "probar con otro contenido". Pensado para sumarlo a Vitrina como una carpeta.
7. Capturas en `capturas/` (para el catálogo y para mostrarle al cliente).
8. `scripts/entregar.mjs`: plantilla + contenido → carpeta lista para publicar (valida el contenido).
9. Más plantillas y armadores por rubro (ideas abajo), siempre al nivel de Vitrina.

## Ideas de pedidos interactivos

- Rotisería: armá tu docena (ya en Carta Local), semana de viandas (hecho), menú del día (plato + guarnición + bebida).
- Cafetería: armá tu desayuno (ya en Café Almendra), box de merienda (hecho), café a tu medida (tamaño, leche, extras, taza dibujada).
- Pizzería: mitades (ya en Carta Local), pizza por ingredientes, calculadora para la juntada, combo pizza + fainá + bebida.
- Hamburguesería: burger capa por capa (hecho). Heladería: armá tu pote. Panadería: docena de facturas.
  Parrilla: parrillada por personas. Sushi: combinado pieza por pieza. Pastas: pasta + salsa.
