/** Italian provinces (sigla → name), used in address and quote forms. */
export const PROVINCES: [string, string][] = [
  ["AG", "Agrigento"], ["AL", "Alessandria"], ["AN", "Ancona"], ["AO", "Aosta"], ["AR", "Arezzo"],
  ["AP", "Ascoli Piceno"], ["AT", "Asti"], ["AV", "Avellino"], ["BA", "Bari"], ["BT", "Barletta-Andria-Trani"],
  ["BL", "Belluno"], ["BN", "Benevento"], ["BG", "Bergamo"], ["BI", "Biella"], ["BO", "Bologna"],
  ["BZ", "Bolzano"], ["BS", "Brescia"], ["BR", "Brindisi"], ["CA", "Cagliari"], ["CL", "Caltanissetta"],
  ["CB", "Campobasso"], ["CE", "Caserta"], ["CT", "Catania"], ["CZ", "Catanzaro"], ["CH", "Chieti"],
  ["CO", "Como"], ["CS", "Cosenza"], ["CR", "Cremona"], ["KR", "Crotone"], ["CN", "Cuneo"],
  ["EN", "Enna"], ["FM", "Fermo"], ["FE", "Ferrara"], ["FI", "Firenze"], ["FG", "Foggia"],
  ["FC", "Forlì-Cesena"], ["FR", "Frosinone"], ["GE", "Genova"], ["GO", "Gorizia"], ["GR", "Grosseto"],
  ["IM", "Imperia"], ["IS", "Isernia"], ["SP", "La Spezia"], ["AQ", "L'Aquila"], ["LT", "Latina"],
  ["LE", "Lecce"], ["LC", "Lecco"], ["LI", "Livorno"], ["LO", "Lodi"], ["LU", "Lucca"],
  ["MC", "Macerata"], ["MN", "Mantova"], ["MS", "Massa-Carrara"], ["MT", "Matera"], ["ME", "Messina"],
  ["MI", "Milano"], ["MO", "Modena"], ["MB", "Monza e Brianza"], ["NA", "Napoli"], ["NO", "Novara"],
  ["NU", "Nuoro"], ["OR", "Oristano"], ["PD", "Padova"], ["PA", "Palermo"], ["PR", "Parma"],
  ["PV", "Pavia"], ["PG", "Perugia"], ["PU", "Pesaro e Urbino"], ["PE", "Pescara"], ["PC", "Piacenza"],
  ["PI", "Pisa"], ["PT", "Pistoia"], ["PN", "Pordenone"], ["PZ", "Potenza"], ["PO", "Prato"],
  ["RG", "Ragusa"], ["RA", "Ravenna"], ["RC", "Reggio Calabria"], ["RE", "Reggio Emilia"], ["RI", "Rieti"],
  ["RN", "Rimini"], ["RM", "Roma"], ["RO", "Rovigo"], ["SA", "Salerno"], ["SS", "Sassari"],
  ["SV", "Savona"], ["SI", "Siena"], ["SR", "Siracusa"], ["SO", "Sondrio"], ["SU", "Sud Sardegna"],
  ["TA", "Taranto"], ["TE", "Teramo"], ["TR", "Terni"], ["TO", "Torino"], ["TP", "Trapani"],
  ["TN", "Trento"], ["TV", "Treviso"], ["TS", "Trieste"], ["UD", "Udine"], ["VA", "Varese"],
  ["VE", "Venezia"], ["VB", "Verbano-Cusio-Ossola"], ["VC", "Vercelli"], ["VR", "Verona"],
  ["VV", "Vibo Valentia"], ["VI", "Vicenza"], ["VT", "Viterbo"],
]

export const CARRIER_LABELS: Record<string, string> = {
  own_truck: "Nostri camion",
  pallet_carrier: "Corriere bancali",
  courier: "Corriere espresso",
}

/** Codice fiscale: 16 alphanumeric characters (or 11 digits for companies). */
export const isValidTaxCode = (v: string) =>
  /^[A-Z0-9]{16}$/i.test(v.trim()) || /^\d{11}$/.test(v.trim())

/** Partita IVA: 11 digits, optionally prefixed with IT. */
export const isValidVatNumber = (v: string) => /^(IT)?\d{11}$/i.test(v.replace(/\s/g, ""))

/** Codice destinatario SDI: 7 alphanumeric characters. */
export const isValidSdi = (v: string) => /^[A-Z0-9]{7}$/i.test(v.trim())

export const formatEuro = (amount: number) =>
  new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(amount)
