// "Abierto ahora" y texto de horarios a partir de los turnos del contenido. Sin DOM.
// Turno: { dias: [0 = domingo … 6 = sábado], abre: "HH:MM", cierra: "HH:MM" }, hora argentina.

const DIAS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
const NOMBRES_PLURAL = ["Domingos", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábados"];
const ZONA = "America/Argentina/Buenos_Aires";

const aMinutos = (hora) => {
  const [h = 0, m = 0] = hora.split(":").map(Number);
  return h * 60 + m;
};

/** "00:00" (o cualquier cierre no posterior a la apertura) cuenta como medianoche. */
const cierreEnMinutos = (t) => {
  const m = aMinutos(t.cierra);
  return m === 0 || m <= aMinutos(t.abre) ? 24 * 60 : m;
};

/** "15:00" → "15", "19:30" → "19:30". */
const horaCorta = (hora) => (hora.endsWith(":00") ? String(Number(hora.slice(0, -3))) : hora.replace(/^0/, ""));

function ahoraEnArgentina(fecha) {
  const partes = new Intl.DateTimeFormat("en-US", { timeZone: ZONA, weekday: "short", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(fecha);
  const valor = (tipo) => partes.find((p) => p.type === tipo)?.value ?? "";
  const dia = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(valor("weekday"));
  return { dia, minutos: Number(valor("hour")) * 60 + Number(valor("minute")) };
}

/** { abierto, texto }: "Abierto · cierra a las 15", "Cerrado · abre mañana a las 8". */
export function estadoDelLocal(turnos, fecha = new Date()) {
  const { dia, minutos } = ahoraEnArgentina(fecha);

  const actual = turnos.find((t) => t.dias.includes(dia) && aMinutos(t.abre) <= minutos && minutos < cierreEnMinutos(t));
  if (actual) {
    const cierre = cierreEnMinutos(actual) === 24 * 60 ? "a medianoche" : `a las ${horaCorta(actual.cierra)}`;
    return { abierto: true, texto: `Abierto · cierra ${cierre}` };
  }

  for (let salto = 0; salto < 7; salto++) {
    const d = (dia + salto) % 7;
    const proximo = turnos
      .filter((t) => t.dias.includes(d) && (salto > 0 || aMinutos(t.abre) > minutos))
      .sort((a, b) => aMinutos(a.abre) - aMinutos(b.abre))[0];
    if (!proximo) continue;
    const cuando = salto === 0 ? "hoy" : salto === 1 ? "mañana" : `el ${DIAS[d]}`;
    return { abierto: false, texto: `Cerrado · abre ${cuando} a las ${horaCorta(proximo.abre)}` };
  }
  return { abierto: false, texto: "Cerrado" };
}

/** [1,2,3,4,5,6] → "Lunes a sábado"; [0] → "Domingos"; [1,3,5] → "Lunes, miércoles y viernes". */
function describirDias(dias) {
  const orden = [...new Set(dias)].sort((a, b) => ((a + 6) % 7) - ((b + 6) % 7));
  if (orden.length === 7) return "Todos los días";
  if (orden.length === 1) return NOMBRES_PLURAL[orden[0]];
  const pos = orden.map((d) => (d + 6) % 7);
  const corrido = pos.every((p, i) => i === 0 || p === pos[i - 1] + 1);
  const nombre = (d, i) => (i === 0 ? DIAS[d].replace(/^./, (c) => c.toUpperCase()) : DIAS[d]);
  if (corrido && orden.length >= 3) return `${nombre(orden[0], 0)} a ${DIAS[orden.at(-1)]}`;
  const nombres = orden.map(nombre);
  return `${nombres.slice(0, -1).join(", ")} y ${nombres.at(-1)}`;
}

/** Agrupa los días con los mismos horarios: "Lunes a sábado de 11 a 15 y de 19 a 23". */
export function describirTurnos(turnos) {
  const porDias = new Map();
  for (const t of turnos) {
    const clave = [...new Set(t.dias)].sort().join(",");
    const grupo = porDias.get(clave) ?? { dias: t.dias, franjas: [] };
    grupo.franjas.push(t);
    porDias.set(clave, grupo);
  }
  return [...porDias.values()]
    .sort((a, b) => Math.min(...a.dias.map((d) => (d + 6) % 7)) - Math.min(...b.dias.map((d) => (d + 6) % 7)))
    .map(({ dias, franjas }) => {
      const horas = franjas
        .sort((a, b) => aMinutos(a.abre) - aMinutos(b.abre))
        .map((f) => `de ${horaCorta(f.abre)} a ${cierreEnMinutos(f) === 24 * 60 ? "24" : horaCorta(f.cierra)}`)
        .join(" y ");
      return `${describirDias(dias)} ${horas}`;
    });
}

/** Los horarios escritos a mano o, si no hay, los armados desde los turnos. */
export function textoHorarios(local) {
  return local.horarios?.length ? local.horarios : describirTurnos(local.turnos ?? []);
}
