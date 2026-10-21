// Sin imports: lo usan las páginas y los scripts de Node.

/**
 * Normaliza un número argentino al formato de WhatsApp (549 + área + número, sólo dígitos).
 * Acepta "11 6247-4436", "011 15 6247-4436", "+54 9 11 6247 4436", "5491162474436".
 * Devuelve null si no tiene la cantidad de dígitos de un celular argentino.
 */
export function normalizarWhatsapp(numero) {
  let d = String(numero).replace(/\D/g, "");
  if (d.startsWith("549")) d = d.slice(3);
  else if (d.startsWith("54")) d = d.slice(2);
  d = d.replace(/^0/, "");
  // El "15" de los celulares va después del código de área (2 a 4 dígitos): 11 15 6247-4436.
  if (d.length === 12) {
    for (const area of [2, 3, 4]) {
      if (d.slice(area, area + 2) === "15") {
        d = d.slice(0, area) + d.slice(area + 2);
        break;
      }
    }
  }
  return d.length === 10 ? `549${d}` : null;
}
