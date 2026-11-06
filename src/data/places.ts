import { same, type L } from '../lib/i18n';
import { ROAD, SCENE, TRSIC, alongPath, googleMapsSearch } from './geo';

export type PlaceKind =
  | 'nature'
  | 'viewpoint'
  | 'culture'
  | 'sport'
  | 'food'
  | 'shop'
  | 'service'
  | 'education'
  | 'animals'
  | 'local';

/** Which little building the 3D map draws. `landmark` = has its own dedicated model. */
export type PlaceStyle = 'landmark' | 'school' | 'shop' | 'cafe' | 'garage' | 'hut' | 'house' | 'monument' | 'shelter' | 'field';

export type ArtVariant =
  | 'orchard'
  | 'viewpoint'
  | 'church'
  | 'stream'
  | 'culture'
  | 'stadium'
  | 'market'
  | 'memorial'
  | 'workshop'
  | 'shelter'
  | 'field';
export type ArtTone = 'day' | 'dawn' | 'dusk';

export interface PlaceImage {
  variant: ArtVariant;
  tone: ArtTone;
  caption: L;
}

export interface Place {
  id: string;
  name: L;
  kind: PlaceKind;
  style: PlaceStyle;
  tagline: L;
  description: L;
  /**
   * Scene coordinates [x, z] in the 3D valley. Only Tršić is placed from real coordinates; everything
   * else is approximate (`approx`) until exact Google Maps coordinates are filled in.
   */
  position: [number, number];
  approx: boolean;
  facts: { label: L; value: L }[];
  images: PlaceImage[];
  /** Shown as a big card in "Attractions" (otherwise it lives in the places directory). */
  featured: boolean;
  /** Walking time badge. */
  walk?: L;
  /** Text Google Maps is searched with. */
  mapsQuery: string;
}

export const KIND_META: Record<PlaceKind, { label: L; emoji: string; color: string }> = {
  nature: { label: { sr: 'Priroda', en: 'Nature' }, emoji: '🌳', color: '#3a9d54' },
  viewpoint: { label: { sr: 'Vidikovci', en: 'Viewpoints' }, emoji: '🔭', color: '#2f8fd1' },
  culture: { label: { sr: 'Kultura i spomenici', en: 'Culture & monuments' }, emoji: '⛪', color: '#7a3b8f' },
  sport: { label: { sr: 'Sport i rekreacija', en: 'Sport & leisure' }, emoji: '⚽', color: '#e0392f' },
  food: { label: { sr: 'Hrana i piće', en: 'Food & drink' }, emoji: '🍽️', color: '#eba50f' },
  shop: { label: { sr: 'Prodavnice', en: 'Shops' }, emoji: '🛒', color: '#e27d1f' },
  service: { label: { sr: 'Servisi i zanati', en: 'Services & trades' }, emoji: '🔧', color: '#4b6a8a' },
  education: { label: { sr: 'Obrazovanje', en: 'Education' }, emoji: '🏫', color: '#c0392b' },
  animals: { label: { sr: 'Životinje', en: 'Animals' }, emoji: '🐕', color: '#8a5a2b' },
  local: { label: { sr: 'Lokalni biznisi', en: 'Local businesses' }, emoji: '🏷️', color: '#5f7d6e' },
};

/* ───────────── helpers for the many small places ───────────── */

const GENERIC_INFO: L = {
  sr: 'Radno vreme, kontakt i recenzije potražite na Google Maps.',
  en: 'Opening hours, contact details and reviews are on Google Maps.',
};

const at = (t: number, off: number) => alongPath(ROAD, t, off);

const loc = (sr: string, en = sr) => ({ label: { sr: 'Lokacija', en: 'Location' }, value: { sr, en } });
const cat = (kind: PlaceKind) => ({ label: { sr: 'Vrsta', en: 'Type' }, value: KIND_META[kind].label });

interface SmallOpts {
  id: string;
  name: L;
  kind: PlaceKind;
  style: PlaceStyle;
  variant: ArtVariant;
  pos: [number, number];
  tagline?: L;
  description?: L;
  where?: { sr: string; en: string };
  mapsQuery?: string;
}

function small(o: SmallOpts): Place {
  return {
    id: o.id,
    name: o.name,
    kind: o.kind,
    style: o.style,
    tagline: o.tagline ?? KIND_META[o.kind].label,
    description: o.description ?? {
      sr: `${o.name.sr} u Voćnjaku. ${GENERIC_INFO.sr}`,
      en: `${o.name.en} in Voćnjak. ${GENERIC_INFO.en}`,
    },
    position: o.pos,
    approx: true,
    facts: [cat(o.kind), loc(o.where?.sr ?? 'Voćnjak', o.where?.en ?? 'Voćnjak')],
    images: [{ variant: o.variant, tone: 'day', caption: o.name }],
    featured: false,
    mapsQuery: o.mapsQuery ?? `${o.name.sr} Voćnjak Loznica`,
  };
}

/* ───────────── places ───────────── */

const rawPlaces: Place[] = [
  // ——— attractions ———
  {
    id: 'trsic',
    name: { sr: 'Tršić — Vukov zavičaj', en: 'Tršić — Vuk’s homeland' },
    kind: 'culture',
    style: 'landmark',
    tagline: { sr: 'Rodno selo Vuka Karadžića, 20 min pešice', en: 'Birthplace of Vuk Karadžić, 20 min on foot' },
    description: {
      sr: 'Najpoznatija atrakcija u okolini: Tršić je rodno mesto Vuka Stefanovića Karadžića, reformatora srpskog jezika i pisma. Od Voćnjaka do sela vodi prijatna šetnja od oko 20 minuta — preko potoka i livada. U spomen-kompleksu su rodna kuća i spomenik, a svake godine u septembru održava se čuveni Vukov sabor.',
      en: 'The best-known attraction in the area: Tršić is the birthplace of Vuk Stefanović Karadžić, reformer of the Serbian language and alphabet. A pleasant walk of about 20 minutes leads from Voćnjak to the village, across a stream and meadows. The memorial complex has his birth house and a monument, and every September the famous Vuk’s Assembly (Vukov sabor) takes place here.',
    },
    position: [TRSIC[0], TRSIC[1]],
    approx: false,
    walk: { sr: '20 min pešice', en: '20 min on foot' },
    facts: [
      { label: { sr: 'Od Voćnjaka', en: 'From Voćnjak' }, value: { sr: '≈ 20 min pešice', en: '≈ 20 min on foot' } },
      { label: { sr: 'Rastojanje', en: 'Distance' }, value: { sr: 'oko 1,5 km', en: 'about 1.5 km' } },
      { label: { sr: 'Rodno mesto', en: 'Birthplace of' }, value: { sr: 'Vuk Karadžić (1787)', en: 'Vuk Karadžić (1787)' } },
      { label: { sr: 'Vukov sabor', en: 'Vuk’s Assembly' }, value: { sr: 'Svake godine u septembru', en: 'Every September' } },
    ],
    images: [
      { variant: 'memorial', tone: 'day', caption: { sr: 'Spomen-kompleks u Tršiću', en: 'Memorial complex in Tršić' } },
      { variant: 'memorial', tone: 'dawn', caption: { sr: 'Jutro u Vukovom zavičaju', en: 'Morning in Vuk’s homeland' } },
      { variant: 'memorial', tone: 'dusk', caption: { sr: 'Sumrak nad Tršićem', en: 'Dusk over Tršić' } },
    ],
    featured: true,
    mapsQuery: 'Tršić, Loznica, Srbija',
  },
  {
    id: 'crkva',
    name: { sr: 'Crkva Svete Majke Angeline', en: 'Church of the Holy Mother Angelina' },
    kind: 'culture',
    style: 'landmark',
    tagline: { sr: 'Hram u Voćnjaku', en: 'The church of Voćnjak' },
    description: {
      sr: 'Crkva Svete Majke Angeline u Voćnjaku — mesto okupljanja za praznike i seoske slave, okruženo zelenilom i tišinom.',
      en: 'The Church of the Holy Mother Angelina in Voćnjak — a gathering place for holidays and the village’s feast days, surrounded by greenery and quiet.',
    },
    position: [9.6, -6.6],
    approx: true,
    facts: [cat('culture'), loc('Voćnjak')],
    images: [
      { variant: 'church', tone: 'day', caption: { sr: 'Crkva na brežuljku', en: 'The church on its hill' } },
      { variant: 'church', tone: 'dusk', caption: { sr: 'Zvono u sumrak', en: 'The bell at dusk' } },
      { variant: 'church', tone: 'dawn', caption: { sr: 'Magla oko zvonika', en: 'Mist around the bell tower' } },
    ],
    featured: true,
    mapsQuery: 'Crkva Svete Majke Angeline Voćnjak',
  },
  {
    id: 'most',
    name: { sr: 'Ognjenov most', en: 'Ognjenov Bridge' },
    kind: 'nature',
    style: 'landmark',
    tagline: { sr: 'Most preko potoka', en: 'The bridge over the stream' },
    description: {
      sr: 'Ognjenov most u Voćnjaku — preko potoka, na putu kroz selo. U blizini ima hlada i mesta za odmor.',
      en: 'Ognjenov Bridge in Voćnjak — over the stream, on the road through the village. There is shade and a place to rest nearby.',
    },
    position: [6.7, 4.4],
    approx: true,
    facts: [cat('nature'), loc('Voćnjak')],
    images: [
      { variant: 'stream', tone: 'day', caption: { sr: 'Potok kroz dolinu', en: 'The stream through the valley' } },
      { variant: 'stream', tone: 'dawn', caption: { sr: 'Rosa na obali', en: 'Dew on the bank' } },
      { variant: 'stream', tone: 'dusk', caption: { sr: 'Veče kraj vode', en: 'Evening by the water' } },
    ],
    featured: true,
    mapsQuery: 'Ognjenov most Voćnjak',
  },
  {
    id: 'rogonjin-spomenik',
    name: { sr: 'Rogonjin spomenik', en: 'Rogonjin Monument' },
    kind: 'culture',
    style: 'monument',
    tagline: { sr: 'Spomenik u Voćnjaku', en: 'A monument in Voćnjak' },
    description: {
      sr: 'Rogonjin spomenik u Voćnjaku. Više o njemu i tačan položaj potražite na Google Maps.',
      en: 'The Rogonjin monument in Voćnjak. Find out more and the exact position on Google Maps.',
    },
    position: alongPath(
      // a spot beside the footpath towards Tršić
      [
        [-4.2, 0.2],
        [-1.6, 1.6],
        [1.8, 2.8],
      ],
      0.55,
      1.7,
    ),
    approx: true,
    facts: [cat('culture'), loc('Voćnjak')],
    images: [{ variant: 'memorial', tone: 'day', caption: { sr: 'Rogonjin spomenik', en: 'Rogonjin Monument' } }],
    featured: true,
    mapsQuery: 'Rogonjin spomenik Voćnjak',
  },
  {
    id: 'vidikovac',
    name: { sr: 'Vidikovac Sunčani breg', en: 'Sunny Hill Viewpoint' },
    kind: 'viewpoint',
    style: 'landmark',
    tagline: { sr: 'Cela dolina kao na dlanu', en: 'The whole valley in the palm of your hand' },
    description: {
      sr: 'Drvena osmatračnica na bregu iznad sela. Odavde se vidi kako se potok vije kroz dolinu, a šljivici se spuštaju niz padine. Najlepše je u zoru, kad se magla još zadržava u kotlini.',
      en: 'A wooden lookout on the hill above the village. From here you can see the stream winding through the valley and the orchards stepping down the slopes. It is loveliest at dawn, when mist still lingers in the basin.',
    },
    position: [-1.6, -11.8],
    approx: true,
    facts: [
      { label: { sr: 'Najbolje vreme', en: 'Best time' }, value: { sr: 'Zora i sumrak', en: 'Dawn and dusk' } },
      { label: { sr: 'Težina', en: 'Difficulty' }, value: { sr: 'Lagana staza', en: 'Easy trail' } },
    ],
    images: [
      { variant: 'viewpoint', tone: 'dawn', caption: { sr: 'Zora sa osmatračnice', en: 'Dawn from the lookout' } },
      { variant: 'viewpoint', tone: 'day', caption: { sr: 'Pogled preko doline', en: 'View across the valley' } },
      { variant: 'viewpoint', tone: 'dusk', caption: { sr: 'Sumrak nad bregovima', en: 'Dusk over the hills' } },
    ],
    featured: true,
    mapsQuery: 'Voćnjak, Loznica, Srbija',
  },
  {
    id: 'sljivik',
    name: { sr: 'Stari voćnjak', en: 'The old orchard' },
    kind: 'nature',
    style: 'landmark',
    tagline: { sr: 'Šljive, jabuke i miris jeseni', en: 'Plums, apples and the scent of autumn' },
    description: {
      sr: 'Redovi voćaka na južnoj padini — srce sela po kojem je i dobilo ime. U maju sve miriše na cvetove, u septembru se bere, a u oktobru se pale kazani.',
      en: 'Rows of fruit trees on the southern slope — the heart of the village that gave it its name. In May everything smells of blossom, in September the harvest begins, and in October the distilling cauldrons are lit.',
    },
    position: [-2.2, 10.8],
    approx: true,
    facts: [
      { label: { sr: 'Berba', en: 'Harvest' }, value: { sr: 'Avgust – oktobar', en: 'August – October' } },
      { label: { sr: 'Vrste', en: 'Fruit' }, value: { sr: 'Šljive, jabuke, kruške', en: 'Plums, apples, pears' } },
    ],
    images: [
      { variant: 'orchard', tone: 'day', caption: { sr: 'Redovi voćaka', en: 'Rows of fruit trees' } },
      { variant: 'orchard', tone: 'dawn', caption: { sr: 'Jutro u voćnjaku', en: 'Morning in the orchard' } },
      { variant: 'orchard', tone: 'dusk', caption: { sr: 'Večernja šetnja', en: 'An evening stroll' } },
    ],
    featured: true,
    mapsQuery: 'Voćnjak, Loznica, Srbija',
  },
  {
    id: 'fido',
    name: same('Fido Shelter by Herz für Hunde Graz'),
    kind: 'animals',
    style: 'shelter',
    tagline: { sr: 'Sklonište za pse', en: 'Dog shelter' },
    description: {
      sr: 'Fido Shelter je sklonište za napuštene pse u Voćnjaku, koje podržava udruženje Herz für Hunde Graz. Posetioci su dobrodošli — a pomoć je uvek potrebna.',
      en: 'Fido Shelter is a shelter for abandoned dogs in Voćnjak, supported by the association Herz für Hunde Graz. Visitors are welcome — and help is always needed.',
    },
    position: [4.6, -6.2],
    approx: true,
    facts: [
      cat('animals'),
      loc('Voćnjak'),
      { label: { sr: 'Podrška', en: 'Supported by' }, value: same('Herz für Hunde Graz') },
    ],
    images: [{ variant: 'shelter', tone: 'day', caption: same('Fido Shelter') }],
    featured: true,
    mapsQuery: 'Fido Shelter Voćnjak Loznica',
  },
  {
    id: 'airsoft',
    name: same('Airsoft teren Komandos'),
    kind: 'sport',
    style: 'field',
    tagline: { sr: 'Airsoft za timove i prijatelje', en: 'Airsoft for teams and friends' },
    description: {
      sr: 'Airsoft teren „Komandos“ u Voćnjaku. Za termine, pravila i cene proverite Google Maps.',
      en: 'The “Komandos” airsoft field in Voćnjak. For bookings, rules and prices check Google Maps.',
    },
    position: [12.4, -1.2],
    approx: true,
    facts: [cat('sport'), loc('Voćnjak')],
    images: [{ variant: 'field', tone: 'day', caption: same('Airsoft teren Komandos') }],
    featured: true,
    mapsQuery: 'Airsoft teren Komandos Voćnjak',
  },

  // ——— directory (entrance → far end of the village) ———
  small({
    id: 'as-matic',
    name: same('AS Matić'),
    kind: 'local',
    style: 'garage',
    variant: 'workshop',
    pos: at(0.04, 1.8),
    where: { sr: 'Pored AS Perića', en: 'Next to AS Perić' },
  }),
  small({
    id: 'spomenik',
    name: { sr: 'Spomenik', en: 'Monument' },
    kind: 'culture',
    style: 'monument',
    variant: 'memorial',
    pos: at(0.13, -1.9),
    description: {
      sr: 'Spomenik (Споменик) na severnom ulazu u Voćnjak, uz put. Više informacija potražite na Google Maps.',
      en: 'A monument (Споменик) at the northern entrance to Voćnjak, beside the road. More information is on Google Maps.',
    },
    mapsQuery: 'Споменик Voćnjak Loznica',
  }),
  small({
    id: 'skola',
    name: { sr: 'O.Š. „Jovan Cvijić“', en: 'Primary school “Jovan Cvijić”' },
    kind: 'education',
    style: 'school',
    variant: 'culture',
    pos: at(0.22, -2.4),
    description: {
      sr: 'Osnovna škola „Jovan Cvijić“ — škola u Voćnjaku, nazvana po velikom srpskom geografu.',
      en: 'Primary school “Jovan Cvijić” — the school of Voćnjak, named after the great Serbian geographer.',
    },
    mapsQuery: 'O.Š. Jovan Cvijić Voćnjak',
  }),
  small({
    id: 'goca',
    name: same('Market Goca'),
    kind: 'shop',
    style: 'shop',
    variant: 'market',
    pos: at(0.3, 1.9),
    description: {
      sr: 'Market Goca — prodavnica u Voćnjaku za svakodnevne nabavke.',
      en: 'Market Goca — a shop in Voćnjak for everyday groceries.',
    },
  }),
  small({
    id: 'eurogril',
    name: same('Eurogril 5'),
    kind: 'food',
    style: 'cafe',
    variant: 'market',
    pos: at(0.36, -1.9),
    description: {
      sr: 'Eurogril 5 — roštilj i brza hrana u Voćnjaku.',
      en: 'Eurogril 5 — grill and fast food in Voćnjak.',
    },
  }),
  small({
    id: 'anegdota',
    name: same('Caffe Anegdota'),
    kind: 'food',
    style: 'cafe',
    variant: 'market',
    pos: at(0.41, 1.9),
    description: {
      sr: 'Caffe Anegdota — kafić u Voćnjaku, mesto za kafu i razgovor sa komšijama.',
      en: 'Caffe Anegdota — a café in Voćnjak, the place for coffee and a chat with the neighbours.',
    },
  }),
  small({
    id: 'gavric',
    name: same('Gavrić elektro'),
    kind: 'service',
    style: 'garage',
    variant: 'workshop',
    pos: at(0.52, 1.9),
    description: {
      sr: 'Gavrić elektro — električarske usluge i materijal u Voćnjaku.',
      en: 'Gavrić elektro — electrical services and supplies in Voćnjak.',
    },
  }),
  small({
    id: 'fdq',
    name: same('FDQ'),
    kind: 'local',
    style: 'hut',
    variant: 'workshop',
    pos: at(0.57, -1.9),
  }),
  small({
    id: 'antonic',
    name: { sr: 'Građevinska limarija Antonić', en: 'Antonić construction sheet-metal work' },
    kind: 'service',
    style: 'garage',
    variant: 'workshop',
    pos: at(0.62, 2.0),
    description: {
      sr: 'Građevinska limarija Antonić — limarski radovi za gradnju i krovove.',
      en: 'Građevinska limarija Antonić — sheet-metal work for construction and roofs.',
    },
  }),
  small({
    id: 'polovni-delovi',
    name: { sr: 'Polovni delovi VW, Audi, Škoda', en: 'Used parts VW, Audi, Škoda' },
    kind: 'service',
    style: 'garage',
    variant: 'workshop',
    pos: at(0.67, -2.0),
    description: {
      sr: 'Polovni delovi za VW, Audi i Škoda vozila u Voćnjaku.',
      en: 'Used parts for VW, Audi and Škoda vehicles in Voćnjak.',
    },
  }),
  small({
    id: 'djuric-klima',
    name: { sr: 'Servis Auto Klima Đurić', en: 'Auto A/C service Đurić' },
    kind: 'service',
    style: 'garage',
    variant: 'workshop',
    pos: at(0.72, 2.0),
    description: {
      sr: 'Servis Auto Klima Đurić — servis i punjenje auto klima uređaja.',
      en: 'Servis Auto Klima Đurić — car air-conditioning service and recharging.',
    },
  }),
  small({
    id: 'stefan-kop',
    name: same('Stefan_kop'),
    kind: 'local',
    style: 'hut',
    variant: 'workshop',
    pos: at(0.78, -2.1),
  }),
  small({
    id: 'jerinic',
    name: { sr: 'Domaćinstvo Jerinić', en: 'Jerinić homestead' },
    kind: 'local',
    style: 'house',
    variant: 'culture',
    pos: at(0.84, 2.6),
    description: {
      sr: 'Domaćinstvo Jerinić u Voćnjaku. Više informacija potražite na Google Maps.',
      en: 'The Jerinić homestead in Voćnjak. More information is on Google Maps.',
    },
  }),
  small({
    id: 'djukanovic',
    name: { sr: 'Zoran Đukanović', en: 'Zoran Đukanović' },
    kind: 'local',
    style: 'hut',
    variant: 'workshop',
    pos: at(0.89, -2.1),
    mapsQuery: 'Zoran Đukanović Voćnjak',
  }),
  small({
    id: 'as-peric',
    name: same('AS Perić'),
    kind: 'local',
    style: 'garage',
    variant: 'workshop',
    pos: at(0.97, 1.9),
    where: { sr: 'Na kraju sela', en: 'At the far end of the village' },
  }),
  {
    id: 'stadion',
    name: { sr: 'Stadion LUK (FK Luk)', en: 'LUK Stadium (FK Luk)' },
    kind: 'sport',
    style: 'landmark',
    tagline: { sr: 'Domaći teren FK Luk', en: 'Home ground of FK Luk' },
    description: {
      sr: 'Stadion „LUK“ u Voćnjaku — domaći teren FK Luk, kluba osnovanog 1990. godine. Utakmice Opštinske lige Loznica igraju se vikendom.',
      en: 'The “LUK” stadium in Voćnjak — the home ground of FK Luk, a club founded in 1990. Loznica Municipal League matches are played at weekends.',
    },
    position: [-11, 7.2],
    approx: true,
    facts: [
      { label: { sr: 'Klub', en: 'Club' }, value: { sr: 'FK Luk, osnovan 1990.', en: 'FK Luk, founded 1990' } },
      { label: { sr: 'Liga', en: 'League' }, value: { sr: 'Opštinska liga Loznica', en: 'Loznica Municipal League' } },
    ],
    images: [
      { variant: 'stadium', tone: 'day', caption: { sr: 'Teren pred meč', en: 'The pitch before kick-off' } },
      { variant: 'stadium', tone: 'dusk', caption: { sr: 'Pod reflektorima', en: 'Under the floodlights' } },
      { variant: 'stadium', tone: 'dawn', caption: { sr: 'Jutarnji trening', en: 'Morning training' } },
    ],
    featured: false,
    mapsQuery: 'Stadion LUK Voćnjak',
  },
];

/** Positions come from data/geo.ts (read from Google Maps, projected into the 3D valley). */
export const places: Place[] = rawPlaces.map((p) => ({ ...p, position: SCENE[p.id] ?? p.position }));

export const placeById = (id: string) => places.find((p) => p.id === id);
export const mapsUrl = (p: Place) => googleMapsSearch(p.mapsQuery);
