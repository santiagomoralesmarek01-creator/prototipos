// Lista del catálogo: una entrada por plantilla. Para sumar una, agregala acá y corré
// `npm run capturas` (necesita Playwright) para generar su captura en capturas/<id>.jpg.
export const PLANTILLAS = [
  {
    id: "local-barrio",
    nombre: "Barrio",
    tipo: "web",
    rubros: ["rotiseria"],
    planes: ["local", "plus"],
    estilo: "Papel crema, terracota y títulos en slab. Frente del local dibujado con el nombre en el cartel.",
    interacciones: ["Semana de viandas con descuento por días", "Carta con filtros y pedido por WhatsApp", "Carta del salón para el QR"],
    contenido: "rotiseria-don-tito",
    salon: true,
  },
  {
    id: "local-cafe",
    nombre: "Brote",
    tipo: "web",
    rubros: ["cafeteria"],
    planes: ["local", "plus"],
    estilo: "Crema y salvia, serif en cursiva, bordes ondulados. Mesa de café con taza humeante.",
    interacciones: ["Box de merienda para llenar, con opción de regalo", "Carta con filtros y pedido por WhatsApp", "Carta del salón para el QR"],
    contenido: "cafe-brote",
    salon: true,
  },
  {
    id: "local-horno",
    nombre: "Horno",
    tipo: "web",
    rubros: ["pizzeria"],
    planes: ["local", "plus"],
    estilo: "Pizzería porteña: verde botella, bronce, piso a cuadros y tipografía condensada. Horno con fuego animado.",
    interacciones: ["Pizza mitad y mitad dibujada", "Calculadora de pizzas para la juntada", "Carta del salón para el QR"],
    contenido: "pizzeria-el-molde",
    salon: true,
  },
  {
    id: "local-noche",
    nombre: "Noche",
    tipo: "web",
    rubros: ["hamburgueseria", "bar"],
    planes: ["local", "plus"],
    estilo: "Carbón, brasas y humo, tipografía muy condensada. Oscura por naturaleza, con modo claro de papel.",
    interacciones: ["Burger capa por capa con precio en vivo", "Carta con filtros y pedido por WhatsApp", "Carta del salón para el QR"],
    contenido: "humo-burgers",
    salon: true,
  },
  {
    id: "carta-clasica",
    nombre: "Clásica",
    tipo: "carta",
    rubros: ["restaurante", "bodegon"],
    planes: ["carta"],
    estilo: "Carta impresa: papel marfil con doble filete, serif de imprenta y línea de puntos hasta el precio.",
    interacciones: ["Índice de categorías que sigue la lectura", "Filtros vegetariano, vegano y sin TACC", "Agotados tachados"],
    contenido: "bodegon-el-farol",
  },
  {
    id: "app-comanda",
    nombre: "Comanda",
    tipo: "app",
    rubros: ["pizzeria", "rotiseria", "cafeteria", "hamburgueseria"],
    planes: ["extra"],
    estilo: "Tablero de cocina para tablet: tickets de comandera con borde dentado y reloj de demora.",
    interacciones: ["Arrastrar tickets entre columnas", "Demoras en ámbar y rojo", "Números del turno y pedidos simulados"],
    contenido: "pizzeria-el-molde",
  },
];

export const RUBROS = {
  cafeteria: "Cafetería",
  rotiseria: "Rotisería",
  pizzeria: "Pizzería",
  hamburgueseria: "Hamburguesería",
  restaurante: "Restaurante",
  bodegon: "Bodegón",
  bar: "Bar",
  heladeria: "Heladería",
  cerveceria: "Cervecería",
};

export const TIPOS = { web: "Web de pedidos", carta: "Carta", app: "App" };

export const PLANES = { carta: "Plan Carta", local: "Plan Local", plus: "Local Plus", extra: "Extra" };

/** Contenidos de ejemplo para probar cada plantilla con otro rubro. */
export const CONTENIDOS = {
  "rotiseria-don-tito": "Rotisería Don Tito",
  "cafe-brote": "Café Brote",
  "pizzeria-el-molde": "Pizzería El Molde",
  "humo-burgers": "Humo Burgers",
  "bodegon-el-farol": "Bodegón El Farol",
  "cerveceria-la-tiza": "Cervecería La Tiza",
  "copo-heladeria": "Copo Heladería",
};
