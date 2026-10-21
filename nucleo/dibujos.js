// Dibujos de comida para las categorías y los destacados: planos, con contorno del color del texto
// (currentColor), viewBox 64 × 64. Una categoría elige el suyo con `ilustracion` en el contenido;
// si no tiene, se adivina por el nombre (ver `dibujoPara`).

const C = `stroke="currentColor" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"`;

export const DIBUJOS = {
  empanada: `<path d="M8 40c0-14 11-24 24-24s24 10 24 24z" fill="#e8b25b" ${C}/><path d="M10 40q4-5 8 0t8 0 8 0 8 0 8 0 6 0" fill="none" ${C}/><path d="M22 28q4-3 8 0M34 26q4-3 8 0" fill="none" ${C}/>`,
  milanesa: `<path d="M10 38c-2-10 8-20 24-20s24 6 22 16-14 14-26 14-18-2-20-10z" fill="#d79a48" ${C}/><circle cx="22" cy="32" r="1.5" fill="currentColor"/><circle cx="34" cy="28" r="1.5" fill="currentColor"/><circle cx="42" cy="36" r="1.5" fill="currentColor"/><path d="M46 20l8-6 4 4-6 8z" fill="#f4d35e" ${C}/>`,
  tarta: `<path d="M8 34h48l-4 14H12z" fill="#d79a48" ${C}/><path d="M8 34c4-10 14-14 24-14s20 4 24 14z" fill="#9cc56b" ${C}/><path d="M18 30l6-4M30 28l4-4M40 30l6-4" ${C}/>`,
  pollo: `<path d="M14 40c-4-12 6-22 18-22s22 8 18 20-12 12-20 12-14-2-16-10z" fill="#c97b3a" ${C}/><path d="M46 22l6-8M52 14a3 3 0 1 1 3 4" fill="none" ${C}/><path d="M22 34q6-6 14 0" fill="none" ${C}/>`,
  bebida: `<path d="M22 14h20l-3 40H25z" fill="#e45b4b" ${C}/><path d="M23 26h18" ${C}/><path d="M32 6v8M32 6h8" ${C}/><rect x="26" y="32" width="12" height="10" rx="2" fill="#fff" ${C}/>`,
  taza: `<path d="M12 24h34v14a14 14 0 0 1-14 14h-6a14 14 0 0 1-14-14z" fill="#f4ede2" ${C}/><path d="M46 28h4a6 6 0 0 1 0 12h-5" fill="none" ${C}/><path d="M15 28h28" stroke="#7b4a2c" stroke-width="5"/><path d="M24 8q-4 4 0 8M32 6q-4 4 0 8" fill="none" ${C}/><path d="M8 56h44" ${C}/>`,
  medialuna: `<path d="M8 40c6-14 16-20 24-20s18 6 24 20c-6-4-10-4-14-2l-4-10-6 12-6-12-4 10c-4-2-8-2-14 2z" fill="#e6a74a" ${C}/>`,
  porcion: `<path d="M10 44l40-24v24z" fill="#f6d7a7" ${C}/><path d="M10 44l40-24v8L10 52z" fill="#8a4b2a" ${C}/><path d="M10 52h40v-8" fill="none" ${C}/><circle cx="40" cy="22" r="4" fill="#e45b4b" ${C}/>`,
  tostado: `<path d="M10 22h44l-4 8H14z" fill="#e8b25b" ${C}/><path d="M12 30h40v6H12z" fill="#f4d35e" ${C}/><path d="M12 36h40l-4 8H16z" fill="#e8b25b" ${C}/><path d="M18 30l4 4 4-4 4 4 4-4 4 4 4-4" fill="none" stroke="#e45b4b" stroke-width="2"/>`,
  cafetera: `<path d="M20 14h24l-4 12H24z" fill="#9aa5ad" ${C}/><path d="M24 26h16l6 26H18z" fill="#c4ccd1" ${C}/><path d="M44 32l8-4" ${C}/><path d="M28 8h8v6h-8z" fill="#333" ${C}/>`,
  pizza: `<circle cx="32" cy="32" r="24" fill="#e8b25b" ${C}/><circle cx="32" cy="32" r="18" fill="#f2c94c"/><circle cx="24" cy="26" r="4" fill="#d1453b" ${C}/><circle cx="38" cy="24" r="4" fill="#d1453b" ${C}/><circle cx="36" cy="40" r="4" fill="#d1453b" ${C}/><circle cx="24" cy="40" r="2" fill="#3b7a3a"/><path d="M32 8v48M8 32h48" stroke="currentColor" stroke-width="1.2" opacity=".5"/>`,
  burger: `<path d="M10 28c0-10 10-16 22-16s22 6 22 16z" fill="#e0a24f" ${C}/><path d="M8 32h48" stroke="#5aa04a" stroke-width="5" stroke-linecap="round"/><rect x="10" y="34" width="44" height="8" rx="4" fill="#6b3a20" ${C}/><path d="M10 44h44l-6 6H16z" fill="#f2b632" ${C}/><path d="M10 50h44v2a4 4 0 0 1-4 4H14a4 4 0 0 1-4-4z" fill="#e0a24f" ${C}/>`,
  papas: `<path d="M20 22l2-12M26 22l1-14M32 22v-12M38 22l-1-13M44 22l-2-11" stroke="#f2c94c" stroke-width="5" stroke-linecap="round"/><path d="M16 22h32l-4 32H20z" fill="#d1453b" ${C}/><path d="M24 34a8 8 0 0 0 16 0" fill="none" stroke="#fff" stroke-width="2.5"/>`,
  helado: `<path d="M22 32l10 26 10-26z" fill="#e3b06b" ${C}/><path d="M24 36l14 8M26 44l10-6" stroke="currentColor" stroke-width="1.4"/><circle cx="26" cy="26" r="9" fill="#f4a3b5" ${C}/><circle cx="38" cy="26" r="9" fill="#9ad0c2" ${C}/><circle cx="32" cy="16" r="9" fill="#7b4a2c" ${C}/>`,
  cerveza: `<path d="M16 18h28v34a4 4 0 0 1-4 4H20a4 4 0 0 1-4-4z" fill="#f2b632" ${C}/><path d="M44 24h4a6 6 0 0 1 6 6v8a6 6 0 0 1-6 6h-4" fill="none" ${C}/><path d="M14 18a6 6 0 0 1 8-8 7 7 0 0 1 12 0 6 6 0 0 1 10 8z" fill="#fff" ${C}/><path d="M24 28v20M32 28v20" stroke="#fff" stroke-width="2" opacity=".6"/>`,
  copa: `<path d="M18 8h28c0 16-6 24-14 24S18 24 18 8z" fill="#8e2c48" ${C}/><path d="M32 32v18M22 54h20" ${C}/><path d="M19 16h26" ${C}/>`,
  pasta: `<path d="M8 34h48a24 18 0 0 1-48 0z" fill="#f4ede2" ${C}/><path d="M14 34c4-10 8-2 12-8s8 4 12-4 8 6 12 2 2 6 0 10" fill="#f2c94c" ${C}/><circle cx="26" cy="30" r="4" fill="#d1453b" ${C}/><circle cx="38" cy="28" r="4" fill="#d1453b" ${C}/>`,
  ensalada: `<path d="M8 32h48a24 18 0 0 1-48 0z" fill="#f4ede2" ${C}/><path d="M12 32c2-10 10-14 16-10 4-8 14-8 18 0 6-2 10 4 8 10z" fill="#7cbf5a" ${C}/><circle cx="24" cy="28" r="3" fill="#e45b4b"/><circle cx="40" cy="26" r="3" fill="#e45b4b"/>`,
  postre: `<path d="M14 46h36l-4-24H18z" fill="#f2c26b" ${C}/><path d="M18 22c4-6 24-6 28 0z" fill="#8a4b2a" ${C}/><path d="M10 50h44" ${C}/><path d="M20 30q4 4 8 0 4 4 8 0 4 4 8 0" fill="none" stroke="#8a4b2a" stroke-width="2"/>`,
  sandwich: `<path d="M8 40l24-26 24 26z" fill="#f4dfb5" ${C}/><path d="M12 40h40" stroke="#5aa04a" stroke-width="4"/><path d="M10 44h44l-2 6H12z" fill="#e8a0a0" ${C}/>`,
  sushi: `<circle cx="32" cy="34" r="20" fill="#2d3a2e" ${C}/><circle cx="32" cy="34" r="14" fill="#fff"/><circle cx="32" cy="34" r="7" fill="#f08a5d" ${C}/>`,
  parrilla: `<path d="M8 40h48" ${C}/><path d="M14 40v14M50 40v14" ${C}/><path d="M12 26h40v14H12z" fill="#555" ${C}/><path d="M18 26c0-6 8-8 14-6s12 2 14 6" fill="#b5532f" ${C}/><path d="M20 12q-3 4 0 8M32 10q-3 4 0 8M44 12q-3 4 0 8" fill="none" ${C}/>`,
  vaso: `<path d="M18 14h28l-4 40H22z" fill="#cfe6f2" ${C}/><path d="M20 28h24l-2 24H22z" fill="#f2b632"/><circle cx="28" cy="38" r="2" fill="#fff"/><circle cx="36" cy="44" r="1.5" fill="#fff"/>`,
  olla: `<path d="M10 28h44v14a14 14 0 0 1-14 14H24a14 14 0 0 1-14-14z" fill="#8a5a3a" ${C}/><path d="M6 28h52" ${C}/><path d="M12 28c4-8 12-10 20-10s16 2 20 10" fill="#c9714a" ${C}/><circle cx="24" cy="24" r="2.4" fill="#e8b25b"/><circle cx="36" cy="22" r="2.4" fill="#5aa04a"/><circle cx="42" cy="25" r="2" fill="#e8b25b"/><path d="M26 12q-3 3 0 6M38 10q-3 3 0 6" fill="none" ${C}/>`,
  pure: `<path d="M8 36h48a24 16 0 0 1-48 0z" fill="#f4ede2" ${C}/><path d="M14 36c2-10 10-14 18-14s16 4 18 14z" fill="#f4dd8a" ${C}/><path d="M24 28q8-6 16 0" fill="none" stroke="#c9a23a" stroke-width="2"/><rect x="29" y="22" width="6" height="4" rx="1" fill="#f8f1d0"/>`,
  fruta: `<circle cx="26" cy="36" r="14" fill="#e45b4b" ${C}/><circle cx="42" cy="38" r="12" fill="#f2a52c" ${C}/><path d="M26 22q2-8 8-10" fill="none" ${C}/><path d="M30 16q6-4 10 0-6 4-10 0z" fill="#5aa04a" ${C}/>`,
  faina: `<path d="M10 22l44 8-30 24z" fill="#b5642a" ${C}/><path d="M10 22l44 8-30 18z" fill="#eab04a" ${C}/><path d="M10 22c14-6 32-2 44 8" fill="none" stroke="#b5642a" stroke-width="4" stroke-linecap="round"/><circle cx="26" cy="30" r="1.8" fill="#5b3320"/><circle cx="36" cy="34" r="1.6" fill="#5b3320"/><circle cx="28" cy="38" r="1.4" fill="#5b3320"/><circle cx="42" cy="31" r="1.4" fill="#5b3320"/>`,
  galleta: `<circle cx="32" cy="34" r="20" fill="#d99a4e" ${C}/><circle cx="24" cy="28" r="3" fill="#5b3320"/><circle cx="38" cy="26" r="2.6" fill="#5b3320"/><circle cx="34" cy="40" r="3" fill="#5b3320"/><circle cx="22" cy="40" r="2.2" fill="#5b3320"/><circle cx="43" cy="36" r="2" fill="#5b3320"/>`,
  brownie: `<path d="M12 26l20-8 20 8v20l-20 8-20-8z" fill="#5b3320" ${C}/><path d="M12 26l20 8 20-8M32 34v20" fill="none" ${C}/><path d="M20 26l6 2M34 22l5 2M40 28l-4 1" stroke="#a8673a" stroke-width="2"/>`,
  budin: `<path d="M10 28c0-6 6-10 22-10s22 4 22 10v18a4 4 0 0 1-4 4H14a4 4 0 0 1-4-4z" fill="#e8b25b" ${C}/><path d="M10 28c6 4 14 5 22 5s16-1 22-5" fill="none" ${C}/><path d="M18 24l4 3M30 22l4 3M42 24l4 3" stroke="#8a4b2a" stroke-width="2"/>`,
  horno: `<path d="M8 50c0-22 10-34 24-34s24 12 24 34z" fill="#c9714a" ${C}/><path d="M20 50c0-10 5-16 12-16s12 6 12 16z" fill="#2a1f1a"/><path d="M26 50c2-6 4-8 6-8s4 2 6 8" fill="#f2b632"/><path d="M6 50h52" ${C}/>`,
};

const PISTAS = [
  [/empanad/i, "empanada"],
  [/fain[aá]/i, "faina"],
  [/pizz/i, "pizza"],
  [/milanes|minuta/i, "milanesa"],
  [/tarta|tortilla/i, "tarta"],
  [/pollo|spiedo/i, "pollo"],
  [/burger|hambur/i, "burger"],
  [/papa|frita|picar/i, "papas"],
  [/helad|pote|cucurucho|sabor/i, "helado"],
  [/cervez|canilla|birra/i, "cerveza"],
  [/vino|trago|coct/i, "copa"],
  [/pasta|ñoqui|raviol|canel|lasa|tallar|sorrent/i, "pasta"],
  [/guiso|locro|estofad|puchero|olla/i, "olla"],
  [/pur[eé]/i, "pure"],
  [/fruta/i, "fruta"],
  [/arroz con leche/i, "postre"],
  [/agua/i, "vaso"],
  [/ensalad|veggie|verde/i, "ensalada"],
  [/postre|dulce|flan/i, "postre"],
  [/caf[eé]|espresso/i, "taza"],
  [/cookie|galleta|alfajor/i, "galleta"],
  [/brownie/i, "brownie"],
  [/bud[ií]n|bizcocho|muffin/i, "budin"],
  [/medialun|factura|panader|pasteler/i, "medialuna"],
  [/torta|porci/i, "porcion"],
  [/tostad|brunch|desayun/i, "tostado"],
  [/s[aá]ndw|lomit/i, "sandwich"],
  [/sushi|roll|nikkei/i, "sushi"],
  [/parrill|carne|asado|principal/i, "parrilla"],
  [/fr[ií]o|jugo|limonad|sin alcohol/i, "vaso"],
  [/bebida/i, "bebida"],
  [/combo/i, "burger"],
  [/entrad/i, "empanada"],
];

/** El dibujo de una categoría: el que pide su `ilustracion` o uno parecido por el nombre. */
export function dibujoPara(categoria) {
  if (categoria.ilustracion && DIBUJOS[categoria.ilustracion]) return categoria.ilustracion;
  return PISTAS.find(([re]) => re.test(`${categoria.id} ${categoria.nombre}`))?.[1] ?? null;
}

export function svgDibujo(nombre, clase = "dibujo") {
  const d = DIBUJOS[nombre];
  return d ? `<svg class="${clase}" viewBox="0 0 64 64" aria-hidden="true">${d}</svg>` : "";
}
