// Formato de precios. Sin DOM: lo usan las páginas, los tests y los scripts de Node.

/** 1500 → "$1.500". Formato fijo para que el mensaje de WhatsApp sea igual en todos los teléfonos. */
export function formatearPesos(monto) {
  const signo = monto < 0 ? "-" : "";
  const entero = Math.round(Math.abs(monto)).toString();
  return `${signo}$${entero.replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;
}

/** "Rotisería Don Tito" → "rotiseria-don-tito". */
export function aSlug(texto) {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
