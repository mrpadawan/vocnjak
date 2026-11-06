/**
 * All UI copy. `sr` is Serbian in Latin script (the default); the Cyrillic version is generated from it
 * automatically, so only `sr` and `en` ever need to be written. Lists are stored as `a|b|c`.
 */
export const STRINGS: Record<string, { sr: string; en: string }> = {
  'meta.name': { sr: 'Voćnjak', en: 'Voćnjak' },
  'meta.title': { sr: 'Voćnjak — selo kod Loznice', en: 'Voćnjak — a village near Loznica' },

  // navigation
  'nav.attractions': { sr: 'Atrakcije', en: 'Attractions' },
  'nav.places': { sr: 'Mesta', en: 'Places' },
  'nav.about': { sr: 'O selu', en: 'About' },
  'nav.map': { sr: '3D mapa', en: '3D map' },
  'nav.fk': { sr: 'FK Luk', en: 'FK Luk' },
  'nav.links': { sr: 'Linkovi', en: 'Links' },
  'nav.skip': { sr: 'Preskoči na sadržaj', en: 'Skip to content' },
  'nav.main': { sr: 'Glavna navigacija', en: 'Main navigation' },
  'nav.menuOpen': { sr: 'Otvori meni', en: 'Open menu' },
  'nav.menuClose': { sr: 'Zatvori meni', en: 'Close menu' },
  'nav.themeLight': { sr: 'Uključi svetlu temu', en: 'Switch to light theme' },
  'nav.themeDark': { sr: 'Uključi tamnu temu', en: 'Switch to dark theme' },
  'nav.language': { sr: 'Jezik i pismo', en: 'Language and script' },

  // splash
  'splash.welcome': { sr: 'Dobrodošli u', en: 'Welcome to' },
  'splash.skip': { sr: 'Preskoči →', en: 'Skip →' },
  'splash.region': { sr: 'Loznica · Srbija', en: 'Loznica · Serbia' },
  'splash.aria': { sr: 'Dobrodošli u Voćnjak', en: 'Welcome to Voćnjak' },

  // hero
  'hero.tagline': {
    sr: 'Selo između brda, šljivika i dobrih komšija. Istraži ga u 3D-u, navijaj za FK Luk i saznaj šta se dešava.',
    en: 'A village between hills, plum orchards and good neighbours. Explore it in 3D, cheer for FK Luk and see what is going on.',
  },
  'hero.pillLocation': { sr: '📍 Voćnjak, Loznica', en: '📍 Voćnjak, Loznica' },
  'hero.pillTrsic': { sr: '🚶 Tršić — 20 min pešice', en: '🚶 Tršić — 20 min on foot' },
  'hero.ctaMap': { sr: 'Istraži 3D mapu', en: 'Explore the 3D map' },
  'hero.ctaFk': { sr: '⚽ FK Luk', en: '⚽ FK Luk' },
  'hero.scroll': { sr: 'Skroluj na dole', en: 'Scroll down' },

  // attractions
  'att.eyebrow': { sr: 'Šta videti', en: 'What to see' },
  'att.title': { sr: 'Atrakcije Voćnjaka', en: 'Attractions of Voćnjak' },
  'att.intro1': {
    sr: 'Priroda, spomenici i mesta gde selo živi — a samo 20 minuta pešice od sela čeka te ',
    en: 'Nature, monuments and the places where the village lives — and just a 20-minute walk away waits ',
  },
  'att.introStrong': { sr: 'Tršić', en: 'Tršić' },
  'att.intro2': {
    sr: ', rodno selo Vuka Karadžića. Klikni na „Na mapi“ i kamera će te odvesti pravo tamo.',
    en: ', the birthplace of Vuk Karadžić. Click “On map” and the camera flies you right there.',
  },
  'att.onMap': { sr: 'Na mapi', en: 'On map' },
  'att.all': { sr: 'Sve', en: 'All' },
  'att.marquee': {
    sr: 'Tršić 20 min pešice|Šljive|Vidikovci|Vukov zavičaj|Fudbal nedeljom|Zvuk potoka|Dobri komšije',
    en: 'Tršić 20 min on foot|Plums|Viewpoints|Vuk’s homeland|Football on Sundays|Sound of the stream|Good neighbours',
  },

  // about the village
  'about.eyebrow': { sr: 'O selu', en: 'About the village' },
  'about.title': { sr: 'Priča o Voćnjaku', en: 'The story of Voćnjak' },
  'about.intro': {
    sr: 'Geografija, poreklo porodica, istorija od kamenog doba do danas, uprava i broj stanovnika — sve što treba znati o selu pod Gučevom.',
    en: 'Geography, family origins, history from the Stone Age to today, administration and population — everything worth knowing about the village under Gučevo.',
  },
  'about.census': { sr: 'Broj stanovnika po popisima', en: 'Population by census' },
  'about.sources': { sr: 'Izvori informacija', en: 'Sources' },

  // directory
  'dir.eyebrow': { sr: 'U selu', en: 'In the village' },
  'dir.title': { sr: 'Mesta i lokalni biznisi', en: 'Places & local businesses' },
  'dir.intro': {
    sr: 'Škola, prodavnice, kafići, servisi i ostalo što čini svakodnevicu Voćnjaka. Spisak je sa Google Maps.',
    en: 'The school, shops, cafés, workshops and everything else that makes up daily life in Voćnjak. The list comes from Google Maps.',
  },
  'dir.gmaps': { sr: 'Google Maps ↗', en: 'Google Maps ↗' },

  // map section
  'map.eyebrow': { sr: 'Interaktivna mapa', en: 'Interactive map' },
  'map.title': { sr: 'Voćnjak u 3D', en: 'Voćnjak in 3D' },
  'map.intro': {
    sr: 'Stilizovana 3D dolina sa mestima iz Voćnjaka i stazom do Tršića. Okreni je prstom ili mišem, pa klikni na pin da ti kamera doleti do mesta.',
    en: 'A stylised 3D valley with places from Voćnjak and the footpath to Tršić. Spin it with your finger or mouse, then click a pin and the camera flies there.',
  },
  'map.tab3d': { sr: '3D prikaz', en: '3D view' },
  'map.tabReal': { sr: 'Google mapa', en: 'Google map' },
  'map.tabs': { sr: 'Prikaz mape', en: 'Map view' },
  'map.loading': { sr: 'Gradimo dolinu…', en: 'Building the valley…' },
  'map.reset': { sr: '⟲ Vrati pogled', en: '⟲ Reset view' },
  'map.hint': { sr: 'Prevuci za rotaciju · Točkić za zum · Klikni pin', en: 'Drag to rotate · Scroll to zoom · Click a pin' },
  'map.chipsAria': { sr: 'Atrakcije u Voćnjaku', en: 'Attractions in Voćnjak' },
  'map.listBtn': { sr: '☰ Sva mesta', en: '☰ All places' },
  'map.listTitle': { sr: 'Sva mesta', en: 'All places' },
  'map.close': { sr: 'Zatvori', en: 'Close' },
  'map.fallback': {
    sr: '3D prikaz nije dostupan na ovom uređaju. Izaberi mesto sa liste ili otvori „Google mapa“.',
    en: '3D view is not available on this device. Pick a place from the list or open “Google map”.',
  },
  'map.north': { sr: 'S', en: 'N' },
  'map.compass': {
    sr: 'Kompas — sever je gore kada je pogled u početnom položaju',
    en: 'Compass — north is up when the view is in its starting position',
  },
  'map.realLabel': { sr: 'Mesto na mapi', en: 'Place on the map' },
  'map.realVillage': { sr: 'Voćnjak (celo selo)', en: 'Voćnjak (whole village)' },
  'map.loc.title': { sr: 'Lokacija', en: 'Location' },
  'map.loc.value': { sr: 'Voćnjak, Grad Loznica, Srbija', en: 'Voćnjak, City of Loznica, Serbia' },
  'map.loc.coords': {
    sr: 'Koordinate sela: {lat}° N, {lon}° E · Tršić je oko {walk} od sela.',
    en: 'Village coordinates: {lat}° N, {lon}° E · Tršić is about {walk} from the village.',
  },
  'map.loc.gmaps': { sr: '🗺️ Google Maps ↗', en: '🗺️ Google Maps ↗' },
  'map.loc.walk': { sr: '🚶 Pešice do Tršića ↗', en: '🚶 Walk to Tršić ↗' },
  'map.walk': { sr: '20 min pešice', en: '20 min on foot' },
  'map.note': {
    sr: 'Stilizovan prikaz: položaji mesta su očitani sa Google Maps, ali je centar sela uvećan, a okolina sabijena da bi sve stalo u jednu dolinu (zato je staza do Tršića na maketi kraća nego u stvarnosti). Tačan položaj svakog mesta otvara Google Maps.',
    en: 'Stylised view: place positions were read from Google Maps, but the village centre is magnified and the surroundings compressed so everything fits one valley (so the footpath to Tršić is shorter on the model than in reality). Google Maps opens the exact position of every place.',
  },

  // place modal
  'modal.prev': { sr: '← Prethodno', en: '← Previous' },
  'modal.next': { sr: 'Sledeće →', en: 'Next →' },
  'modal.imgPrev': { sr: 'Prethodna slika', en: 'Previous image' },
  'modal.imgNext': { sr: 'Sledeća slika', en: 'Next image' },
  'modal.imgN': { sr: 'Slika {n}', en: 'Image {n}' },
  'modal.gmaps': { sr: '📍 Otvori u Google Maps ↗', en: '📍 Open in Google Maps ↗' },
  'modal.approx': { sr: 'Položaj na 3D mapi je okviran.', en: 'Position on the 3D map is approximate.' },

  // football
  'fk.eyebrow': { sr: 'Fudbalski klub', en: 'Football club' },
  'fk.blurb': {
    sr: 'Rezultati, raspored i tabela FK Luk iz Voćnjaka. Podaci se automatski preuzimaju sa srbijasport.net.',
    en: 'Results, fixtures and the league table of FK Luk from Voćnjak. The data is pulled automatically from srbijasport.net.',
  },
  'fk.next': { sr: 'Sledeći meč', en: 'Next match' },
  'fk.noNext': { sr: 'Nema zakazanih utakmica', en: 'No fixtures scheduled' },
  'fk.round': { sr: '{n}. kolo', en: 'Matchday {n}' },
  'fk.countdown': { sr: 'Odbrojavanje do utakmice', en: 'Countdown to kick-off' },
  'fk.days': { sr: 'dana', en: 'days' },
  'fk.hours': { sr: 'sati', en: 'hours' },
  'fk.min': { sr: 'min', en: 'min' },
  'fk.sec': { sr: 'sek', en: 'sec' },
  'fk.results': { sr: 'Rezultati', en: 'Results' },
  'fk.fixtures': { sr: 'Raspored', en: 'Fixtures' },
  'fk.table': { sr: 'Tabela', en: 'Table' },
  'fk.form': { sr: 'Forma', en: 'Form' },
  'fk.formAria': { sr: 'Forma: poslednjih 5 utakmica', en: 'Form: last 5 matches' },
  'fk.W': { sr: 'P', en: 'W' },
  'fk.D': { sr: 'N', en: 'D' },
  'fk.L': { sr: 'I', en: 'L' },
  'fk.col.team': { sr: 'Tim', en: 'Team' },
  'fk.col.p': { sr: 'U', en: 'P' },
  'fk.col.w': { sr: 'P', en: 'W' },
  'fk.col.d': { sr: 'N', en: 'D' },
  'fk.col.l': { sr: 'I', en: 'L' },
  'fk.col.gd': { sr: 'GR', en: 'GD' },
  'fk.col.pts': { sr: 'Bod', en: 'Pts' },
  'fk.top': { sr: 'Najbolji igrači', en: 'Top players' },
  'fk.topNote': {
    sr: 'Igrači prema evidenciji kluba na srbijasport.net (spisak može biti zastareo).',
    en: 'Players as listed for the club on srbijasport.net (the list may be out of date).',
  },
  'fk.pos.Golman': { sr: 'Golman', en: 'Goalkeeper' },
  'fk.pos.Odbrana': { sr: 'Odbrana', en: 'Defender' },
  'fk.pos.Sredina': { sr: 'Sredina', en: 'Midfielder' },
  'fk.pos.Veza': { sr: 'Veza', en: 'Midfielder' },
  'fk.pos.Napad': { sr: 'Napad', en: 'Forward' },
  'fk.profile': { sr: 'Profil na srbijasport ↗', en: 'Profile on srbijasport ↗' },
  'fk.facts.founded': { sr: 'Osnovan', en: 'Founded' },
  'fk.facts.colors': { sr: 'Boje kluba', en: 'Club colours' },
  'fk.facts.colorsValue': { sr: 'plavo-bela, crvena', en: 'blue-white, red' },
  'fk.facts.stadium': { sr: 'Stadion', en: 'Stadium' },
  'fk.facts.stadiumValue': { sr: 'Stadion LUK, Voćnjak', en: 'LUK Stadium, Voćnjak' },
  'fk.facts.league': { sr: 'Takmičenje', en: 'Competition' },
  'fk.homeVenue': { sr: 'Stadion LUK, Voćnjak', en: 'LUK Stadium, Voćnjak' },
  'fk.source': { sr: 'Podaci preuzeti {date} sa', en: 'Data retrieved {date} from' },
  'fk.fullLeague': { sr: 'Cela liga', en: 'Full league' },

  // external links
  'links.eyebrow': { sr: 'Brzi linkovi', en: 'Quick links' },
  'links.title': { sr: 'Ostani u toku', en: 'Stay in the loop' },
  'links.intro': {
    sr: 'Zvanične informacije, vremenska prognoza i društvene mreže zajednice.',
    en: 'Official information, the weather forecast and the community’s social media.',
  },
  'links.now': { sr: 'Sada: {temp}°C', en: 'Now: {temp}°C' },
  'links.newTab': { sr: '(otvara se u novom tabu)', en: '(opens in a new tab)' },
  'links.loznica.label': { sr: 'Grad Loznica', en: 'City of Loznica' },
  'links.loznica.hint': { sr: 'Zvanični sajt lokalne samouprave', en: 'Official website of the local government' },
  'links.weather.label': { sr: 'Vreme u Loznici', en: 'Weather in Loznica' },
  'links.weather.hint': { sr: 'RHMZ prognoza za region', en: 'RHMZ forecast for the region' },
  'links.facebook.label': { sr: 'Facebook', en: 'Facebook' },
  'links.facebook.hint': { sr: 'Vesti, oglasi i događaji sela', en: 'Village news, notices and events' },
  'links.instagram.label': { sr: 'Instagram', en: 'Instagram' },
  'links.instagram.hint': { sr: 'Fotografije iz Voćnjaka', en: 'Photos from Voćnjak' },

  // footer
  'footer.tag': { sr: 'Voćnjak · Loznica · Srbija', en: 'Voćnjak · Loznica · Serbia' },
  'footer.madeBy': { sr: 'Sajt je napravio', en: 'Website made by' },
  'footer.copy': { sr: 'Zajednica sela Voćnjak', en: 'Voćnjak village community' },
};
