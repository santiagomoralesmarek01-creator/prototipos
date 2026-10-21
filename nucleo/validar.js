// Revisa un contenido antes de entregarlo. Sin DOM: lo usan los tests y scripts/entregar.mjs.
// Devuelve la lista de problemas (vacía si está todo bien).

const ETIQUETAS = ["vegano", "vegetariano", "sin-tacc"];
const PLANES = ["carta", "local", "plus"];
const HORA = /^([01]\d|2[0-3]):[0-5]\d$/;

export function validarContenido(local) {
  const errores = [];
  const falta = (campo) => errores.push(`Falta "${campo}".`);

  for (const campo of ["slug", "nombre", "whatsapp", "direccion"]) if (!local[campo]) falta(campo);
  if (local.slug && !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(local.slug)) errores.push(`"slug" tiene que ir en minúsculas y con guiones: "${local.slug}".`);
  if (local.whatsapp && !/^549\d{10}$/.test(local.whatsapp)) errores.push(`"whatsapp" tiene que ser 549 + área + número, sólo dígitos: "${local.whatsapp}".`);
  if (local.plan && !PLANES.includes(local.plan)) errores.push(`"plan" tiene que ser ${PLANES.join(", ")}.`);
  if (local.sitio && !/^https:\/\/[^/]+$/.test(local.sitio)) errores.push(`"sitio" va con https:// y sin barra final: "${local.sitio}".`);
  if (!Array.isArray(local.mediosDePago) || !local.mediosDePago.length) falta("mediosDePago");
  if (!local.envio || typeof local.envio.disponible !== "boolean") falta("envio.disponible");

  for (const t of local.turnos ?? []) {
    if (!t.dias?.length || t.dias.some((d) => !Number.isInteger(d) || d < 0 || d > 6)) errores.push(`Turno con días inválidos: ${JSON.stringify(t.dias)} (0 = domingo … 6 = sábado).`);
    if (!HORA.test(t.abre ?? "") || !HORA.test(t.cierra ?? "")) errores.push(`Turno con horas inválidas: ${t.abre}–${t.cierra} (formato HH:MM).`);
  }

  const ids = new Set();
  if (!Array.isArray(local.categorias) || !local.categorias.length) falta("categorias");
  for (const c of local.categorias ?? []) {
    if (!c.id || !c.nombre) errores.push(`Categoría sin id o nombre: ${JSON.stringify(c.nombre ?? c.id)}.`);
    if (!c.productos?.length) errores.push(`La categoría "${c.nombre}" no tiene productos.`);
    for (const p of c.productos ?? []) {
      if (!p.id || !p.nombre) errores.push(`Producto sin id o nombre en "${c.nombre}".`);
      if (ids.has(p.id)) errores.push(`Id de producto repetido: "${p.id}".`);
      ids.add(p.id);
      if (!Number.isInteger(p.precio) || p.precio <= 0) errores.push(`"${p.nombre}": el precio tiene que ser un entero en pesos, sin centavos.`);
      for (const e of p.etiquetas ?? []) if (!ETIQUETAS.includes(e)) errores.push(`"${p.nombre}": etiqueta desconocida "${e}" (${ETIQUETAS.join(", ")}).`);
    }
  }

  for (const id of local.destacados ?? []) {
    if (!ids.has(id)) errores.push(`Destacado que no está en la carta: "${id}".`);
  }
  if (local.marca?.color && !/^#[0-9a-f]{6}$/i.test(local.marca.color)) errores.push(`"marca.color" tiene que ser #rrggbb.`);
  if (local.marca?.colorOscuro && !/^#[0-9a-f]{6}$/i.test(local.marca.colorOscuro)) errores.push(`"marca.colorOscuro" tiene que ser #rrggbb.`);
  return errores;
}

/** Contraste WCAG entre dos colores #rrggbb (1 a 21). */
export function contraste(a, b) {
  const luz = (hex) => {
    const [r, g, bl] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
    return 0.2126 * r + 0.7152 * g + 0.0722 * bl;
  };
  const [x, y] = [luz(a), luz(b)].sort((m, n) => n - m);
  return (x + 0.05) / (y + 0.05);
}
