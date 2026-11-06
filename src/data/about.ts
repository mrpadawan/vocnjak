import type { L } from '../lib/i18n';

/** Long-form content for the "About the village" section (Serbian Latin + English; Cyrillic is derived). */

export interface Block {
  title: L;
  body: L;
}
export interface Stat {
  value: L;
  label: L;
}
export interface TimelineEvent {
  when: L;
  title: L;
  body: L;
  /** Sombre styling for tragic events. */
  somber?: boolean;
}
export interface AboutTab {
  id: 'geo' | 'people' | 'history' | 'admin' | 'demo';
  emoji: string;
  label: L;
  intro?: L;
  stats?: Stat[];
  census?: boolean;
  events?: TimelineEvent[];
  blocks?: Block[];
  extraTitle?: L;
  extra?: Block[];
}

const s = (v: string): L => ({ sr: v, en: v });

export const census: { year: number; pop: number }[] = [
  { year: 1948, pop: 709 },
  { year: 1961, pop: 773 },
  { year: 1981, pop: 1069 },
  { year: 2002, pop: 1204 },
  { year: 2011, pop: 1158 },
  { year: 2022, pop: 1106 },
];

export const aboutTabs: AboutTab[] = [
  /* ───────────────────────── geography ───────────────────────── */
  {
    id: 'geo',
    emoji: '⛰️',
    label: { sr: 'Geografija', en: 'Geography' },
    stats: [
      { value: s('189 m'), label: { sr: 'prosečna nadmorska visina', en: 'average altitude' } },
      { value: s('Gučevo'), label: { sr: 'severne padine planine', en: 'northern slopes of the mountain' } },
      { value: s('4–5 km'), label: { sr: 'do centra Loznice', en: 'to the centre of Loznica' } },
      { value: s('Tršić · Baščeluk'), label: { sr: 'susedna naselja', en: 'neighbouring settlements' } },
    ],
    blocks: [
      {
        title: { sr: 'Položaj i reljef', en: 'Position and relief' },
        body: {
          sr: 'Naselje leži na prosečnoj nadmorskoj visini od 189 metara, na severnim padinama planine Gučevo. Njegove kote i brda postepeno padaju ka susednom istorijskom selu Tršić. Voćnjak se nalazi tačno između atara Tršića i lozničkog urbanog naselja Baščeluk.',
          en: 'The village lies at an average altitude of 189 metres, on the northern slopes of Mount Gučevo. Its ridges and hills fall gradually towards the neighbouring historic village of Tršić. Voćnjak sits exactly between the lands of Tršić and Baščeluk, an urban district of Loznica.',
        },
      },
      {
        title: { sr: 'Tip naselja', en: 'Type of settlement' },
        body: {
          sr: 'Voćnjak je izvorno bio selo razbijenog (disperzivnog) tipa, što je karakteristično za brdsko-planinske predele Jadra i Rađevine. Kuće su pratile dolinske strane potoka i rečnih tokova. Tokom poslednjih decenija, zbog urbanizacije i širenja Loznice, delovi naselja najbliži gradu su se zgusnuli i dobili formu pravog prigradskog naselja.',
          en: 'Voćnjak was originally a scattered (dispersed) village, typical of the hilly and mountainous parts of Jadar and Rađevina. Houses followed the valley sides of streams and rivers. Over recent decades, as Loznica urbanised and grew, the parts of the village closest to town became denser and took the form of a true suburb.',
        },
      },
      {
        title: { sr: 'Hidrografija', en: 'Rivers and streams' },
        body: {
          sr: 'Ključna hidrološka osovina je reka Štira, desna pritoka Drine. Pored nje, kroz atar sela teku i manji potoci, od kojih je najznačajniji potok Budimlija. Ovi tokovi su u prošlosti često plavili plodne delove doline, ali su ujedno obezbeđivali pijaću vodu i pokretali rane vodenice.',
          en: 'The key waterway is the river Štira, a right tributary of the Drina. Smaller streams also run through the village land, the most important being the Budimlija stream. In the past these waters often flooded the fertile parts of the valley, but they also supplied drinking water and drove the early water mills.',
        },
      },
      {
        title: { sr: 'Atar i resursi', en: 'Land and resources' },
        body: {
          sr: 'Selo nema velike kompaktne komplekse državnih šuma, ali je u prošlosti obilovalo zajedničkim utrinama (seoskim pašnjacima). Meštani su stoku besplatno izvodili na ispašu na lokalitete: Ribarsko brdo, Ostružnjak, Botaline njive, Jošnjak i Jošin vinograd. Državni porez na ove utrine selo je plaćalo kolektivno.',
          en: 'The village has no large compact state forests, but in the past it was rich in common pastures. Villagers grazed their livestock free of charge at Ribarsko brdo, Ostružnjak, Botaline njive, Jošnjak and Jošin vinograd. The village paid the state tax on these commons collectively.',
        },
      },
    ],
  },

  /* ───────────────────────── people ───────────────────────── */
  {
    id: 'people',
    emoji: '👪',
    label: { sr: 'Poreklo porodica', en: 'Family origins' },
    intro: {
      sr: 'Prema antropogeografskim istraživanjima tima Jovana Cvijića (koja je u svojim delima priredila dr Vidosava Nikolić-Stojančević), današnje stanovništvo Voćnjaka je rezultat tri velika migraciona talasa. Starosedelaca iz srednjeg veka gotovo da nema — naselje su u 18. i ranom 19. veku podigli doseljenici.',
      en: 'According to the anthropogeographic research of Jovan Cvijić’s team (edited in her works by Dr Vidosava Nikolić-Stojančević), the present population of Voćnjak is the result of three great waves of migration. Almost no medieval natives remain — the village was built in the 18th and early 19th centuries by newcomers.',
    },
    blocks: [
      {
        title: { sr: '1. Hercegovačko-crnogorski talas', en: '1. The Herzegovinian–Montenegrin wave' },
        body: {
          sr: 'Doseljenici iz krševitih predela Stare Hercegovine i Crne Gore doneli su specifične običaje i čvrstu porodičnu strukturu. Oni su krčili šume i pretvarali ih u obradivo zemljište.',
          en: 'Settlers from the rocky lands of Old Herzegovina and Montenegro brought distinctive customs and a strong family structure. They cleared forests and turned them into arable land.',
        },
      },
      {
        title: { sr: '2. Rađevski talas', en: '2. The Rađevina wave' },
        body: {
          sr: 'Stanovništvo iz susedne, planinske Rađevine spuštalo se u niže predele, privučeno blažom klimom i blizinom lozničke čaršije.',
          en: 'People from neighbouring, mountainous Rađevina moved down to the lowlands, drawn by the milder climate and the nearness of Loznica’s market town.',
        },
      },
      {
        title: { sr: '3. Bosanski talas (Podrinje i Srebrenica)', en: '3. The Bosnian wave (Podrinje and Srebrenica)' },
        body: {
          sr: 'Prelasci preko Drine bili su česti tokom srpskih ustanaka, kada su cele porodice prebegavale u Srbiju tražeći bezbednost pod okriljem ustaničke države.',
          en: 'Crossings of the Drina were frequent during the Serbian uprisings, when whole families fled into Serbia seeking safety under the protection of the insurgent state.',
        },
      },
    ],
  },

  /* ───────────────────────── history ───────────────────────── */
  {
    id: 'history',
    emoji: '📜',
    label: { sr: 'Istorija', en: 'History' },
    intro: {
      sr: 'Od starčevačkih ratara do danas — kada zakoračite u Voćnjak, stojite na zemlji koju su gazile mnoge epohe.',
      en: 'From the Starčevo farmers to today — when you step into Voćnjak you stand on ground trodden by many eras.',
    },
    events: [
      {
        when: { sr: '4500 – 1000. p.n.e.', en: '4500 – 1000 BC' },
        title: { sr: 'Praistorija: kameno i bronzano doba', en: 'Prehistory: the Stone and Bronze Ages' },
        body: {
          sr: 'Širi prostor oko Voćnjaka bio je naseljen još u mlađem kamenom dobu (neolitu), što potvrđuju nalazi starčevačke kulture u Jadru. Dolina reke Štire i plodni obodi Gučeva pružali su praistorijskom čoveku sve što mu je potrebno: izvore čiste vode, zaklon od vetrova i šume bogate divljači. U neposrednom komšiluku, na lokalitetu Paulje kod Brezjaka, arheolozi su otkrili jednu od najvećih nekropola iz bronzanog doba na Balkanu — dokaz napredne zajednice koja je izrađivala vrhunski bronzani nakit i oružje pre oko 3500 godina.',
          en: 'The wider area around Voćnjak was settled as early as the Neolithic, as finds of the Starčevo culture in Jadar confirm. The valley of the Štira and the fertile edges of Gučevo gave prehistoric people everything they needed: springs of clean water, shelter from the winds and forests rich in game. Right next door, at the Paulje site near Brezjak, archaeologists uncovered one of the largest Bronze Age necropolises in the Balkans — evidence of an advanced community that made superb bronze jewellery and weapons some 3,500 years ago.',
        },
      },
      {
        when: { sr: 'Pre Rimljana', en: 'Before the Romans' },
        title: { sr: 'Iliri i poreklo imena kraja', en: 'The Illyrians and the origin of the region’s name' },
        body: {
          sr: 'Glavnu reč su vodila ilirska plemena (najviše Autarijati i Partini). Ona su podizala utvrđenja na uzvišenjima, takozvane gradine. I samo ime reke i oblasti Jadar potiče iz ilirskog jezika (hidronim vezan za vodu), što je dokaz da kulturni kontinuitet ovog mesta nikada nije potpuno prekinut.',
          en: 'Illyrian tribes held sway (above all the Autariatae and the Partini). They built fortifications on high ground, known as gradine. Even the name of the river and region, Jadar, comes from the Illyrian language (a water-related hydronym) — proof that cultural continuity here was never fully broken.',
        },
      },
      {
        when: { sr: '1. – 4. vek', en: '1st – 4th century' },
        title: { sr: 'Rimski period: putna stanica i vinogradi', en: 'The Roman era: a road station and vineyards' },
        body: {
          sr: 'Sa dolaskom rimskih legija kraj ulazi u sastav provincije Dalmacije. Odmah ispod atara Voćnjaka, na mestu današnje Loznice, nalazila se putna stanica „Ad Drinum“ (kod Drine), zabeležena kao stanica na „15 milja“ od sledećeg važnog čvorišta, dok su se obližnji rudnici (Zajača, Krupanj) uveliko eksploatisali. U 3. veku, za vreme cara Proba, na padinama Gučeva počinje masovna sadnja vinove loze — što korespondira sa starim toponimima poput Jošinog vinograda i svedoči o vekovnoj tradiciji uzgajanja voća i grožđa na ovom tlu.',
          en: 'With the arrival of the Roman legions the area became part of the province of Dalmatia. Just below Voćnjak’s lands, where Loznica stands today, was the road station “Ad Drinum” (“by the Drina”), recorded as a station “15 miles” from the next important junction, while nearby mines (Zajača, Krupanj) were heavily worked. In the 3rd century, under Emperor Probus, vines began to be planted en masse on the slopes of Gučevo — matching old place names such as Jošin vinograd and testifying to a centuries-old tradition of growing fruit and grapes here.',
        },
      },
      {
        when: { sr: 'Srednji vek', en: 'Middle Ages' },
        title: { sr: 'Nemanjići i rudarstvo', en: 'The Nemanjić dynasty and mining' },
        body: {
          sr: 'Prostor postaje deo stabilne srpske države. Loznica i njeno zaleđe se pod tim imenom prvi put pominju 1317. godine u povelji kralja Milutina, kada je Katarina, supruga kralja Dragutina, podigla obližnji manastir Tronošu. Turski i dubrovački spisi iz 15. veka opisuju kraj kao izuzetno bogat, zelen i gusto naseljen — zbog rudnika Zajača kroz njega su prolazili karavani dubrovačkih trgovaca.',
          en: 'The area became part of a stable Serbian state. Loznica and its hinterland are first mentioned under that name in 1317, in a charter of King Milutin, when Katarina, wife of King Dragutin, founded the nearby Tronoša monastery. Ottoman and Ragusan records of the 15th century describe the region as exceptionally rich, green and densely populated — thanks to the Zajača mine, caravans of Ragusan merchants passed through.',
        },
      },
      {
        when: { sr: '18. – rani 19. vek', en: '18th – early 19th century' },
        title: { sr: 'Nastanak današnjeg sela', en: 'The birth of today’s village' },
        body: {
          sr: 'Doseljenici iz tri migraciona talasa podižu savremeni Voćnjak. Narodna predanja govore o starijem životu na ovom prostoru — pogledajte „Predanja“ ispod.',
          en: 'Settlers from the three migration waves build modern Voćnjak. Folk tradition speaks of older life on this ground — see “Legends” below.',
        },
      },
      {
        when: { sr: '1834.', en: '1834' },
        title: { sr: 'Kneževina Srbija', en: 'The Principality of Serbia' },
        body: {
          sr: 'Nakon Drugog srpskog ustanka i postepenog oslobađanja od osmanske vlasti, Jadar je 1834. godine formalno pripojen Kneževini Srbiji, za vreme vladavine kneza Miloša Obrenovića. Ukidaju se turski feudalni posedi (spahiluci) i zemlja u Voćnjaku postaje trajno vlasništvo seljaka koji su je obrađivali, što je podstaklo ekonomski zamah i stabilizaciju sela.',
          en: 'After the Second Serbian Uprising and the gradual end of Ottoman rule, Jadar was formally annexed to the Principality of Serbia in 1834, under Prince Miloš Obrenović. Turkish feudal estates (spahiluks) were abolished and the land in Voćnjak became the permanent property of the peasants who worked it, spurring economic growth and stability.',
        },
      },
      {
        when: { sr: '1914.', en: '1914' },
        title: { sr: 'Prvi svetski rat', en: 'The First World War' },
        body: {
          sr: 'Zbog položaja podno planine Gučevo, Voćnjak se u jesen 1914. našao u neposrednom zaleđu jedne od najkrvavijih bitaka Velikog rata — Bitke na Gučevu (deo Drinske bitke). Selo je trpelo strahovita razaranja austrougarske artiljerije, stanovništvo je delom izbeglo, a muški deo populacije masovno je stradao u sastavu Podrinjskog konjičkog i pešadijskog puka.',
          en: 'Because it lies at the foot of Mount Gučevo, in autumn 1914 Voćnjak found itself right behind the front of one of the bloodiest battles of the Great War — the Battle of Gučevo (part of the Battle of the Drina). The village suffered terrible destruction from Austro-Hungarian artillery, part of the population fled, and many of the men fell serving in the Podrinje cavalry and infantry regiments.',
        },
      },
      {
        when: { sr: 'Jun 1944.', en: 'June 1944' },
        somber: true,
        title: { sr: 'Tragična 1944. godina', en: 'The tragic year 1944' },
        body: {
          sr: 'Tokom Drugog svetskog rata Jadar je bio poprište sukoba partizana, četnika i nemačkih okupacionih snaga. Pred sam kraj rata, u junu 1944. godine, u Voćnjaku je izvršen masovni zločin nad civilima od strane lokalnih oružanih formacija. Stradale su cele porodice Mihailović (otac Čedomir, majka Desanka, sinovi Milorad i Milutin i ćerka Milica, koja je bila trudna) i Jakovljević (Miodrag, Živana i njihov maloletni sin Milenko). Ovaj događaj je ostavio dubok i bolan trag u kolektivnom sećanju sela.',
          en: 'During the Second World War, Jadar was a theatre of conflict between Partisans, Chetniks and German occupation forces. Just before the end of the war, in June 1944, a massacre of civilians was carried out in Voćnjak by local armed formations. Entire families were killed: the Mihailović family (father Čedomir, mother Desanka, sons Milorad and Milutin, and daughter Milica, who was pregnant) and the Jakovljević family (Miodrag, Živana and their minor son Milenko). The event left a deep and painful mark on the village’s collective memory.',
        },
      },
    ],
    extraTitle: { sr: 'Predanja i legende', en: 'Legends and folk tradition' },
    extra: [
      {
        title: { sr: 'Dvorovi nepoznatog Bana', en: 'The court of an unknown Ban' },
        body: {
          sr: 'Centralni toponim sela je Banovo brdo. Prema lokalnoj legendi, tu su se nalazile ruševine dvorova izvesnog vlastelina — „bana“. Oko ruševina rasli su divlji, stari zasadi jabuka, krušaka i šljiva. Narod je verovao da je upravo po tim „banovim voćnjacima“ čitavo naselje kasnije dobilo ime Voćnjak.',
          en: 'The village’s central place name is Banovo brdo (“the Ban’s hill”). According to local legend, the ruins of the court of a certain nobleman — a “ban” — stood there. Around the ruins grew wild, old plantings of apples, pears and plums. People believed that it was from these “Ban’s orchards” that the whole settlement later took the name Voćnjak (“orchard”).',
        },
      },
      {
        title: { sr: 'Bugari i pepeljarski kazani', en: 'The Bulgarians and the ash cauldrons' },
        body: {
          sr: 'Drugi važan lokalitet je Bugarsko gumno. Predanje kaže da su tu u dalekoj prošlosti boravili Bugari koji su sekli samoniklu drvenastu biljku rujevinu i sagorevanjem („žegli“) pravili pepeo za industrijsku ili zanatsku upotrebu. Kao dokaz, meštani su generacijama prenosili priče o velikim, starim pepeljarskim kazanima pronalaženim na tom mestu.',
          en: 'Another important site is Bugarsko gumno (“the Bulgarians’ threshing floor”). Tradition says that in the distant past Bulgarians lived there, cutting the wild woody plant rujevina and burning it (“žegli”) to make ash for industrial or craft use. As evidence, villagers handed down for generations stories of large, ancient ash-making cauldrons found at that spot.',
        },
      },
      {
        title: { sr: 'Šta kriju legende?', en: 'What the legends may hide' },
        body: {
          sr: 'Kada znamo dublju istoriju kraja, legenda o Banovom brdu dobija mnogo realniji smisao. Iako meštani u 19. veku nisu znali tačne podatke, temelji i stare zidine koje su zaticali na brdu verovatno su bili ostaci rimske osmatračnice, srednjovekovne vlasteoske kule ili turskog odbrambenog čardaka koji je kontrolisao prolaz kroz dolinu Štire ka Tršiću. Zato, kada danas zakoračite u Voćnjak, stojite na zemlji koju su gazili starčevački ratari, ilirski ratnici, rimski vinogradari i srednjovekovni srpski rudari.',
          en: 'Knowing the region’s deeper history, the legend of Banovo brdo makes much more sense. Although 19th-century villagers did not know the facts, the foundations and old walls they found on the hill were probably the remains of a Roman watchtower, a medieval nobleman’s tower or an Ottoman defensive čardak that controlled the passage through the Štira valley towards Tršić. So when you step into Voćnjak today, you stand on ground trodden by Starčevo farmers, Illyrian warriors, Roman vine-growers and medieval Serbian miners.',
        },
      },
    ],
  },

  /* ───────────────────────── administration ───────────────────────── */
  {
    id: 'admin',
    emoji: '🏛️',
    label: { sr: 'Uprava', en: 'Administration' },
    blocks: [
      {
        title: { sr: 'Istorijski status', en: 'Historical status' },
        body: {
          sr: 'U Kraljevini Srbiji i Kraljevini SHS, Voćnjak je bio u sastavu Jadranskog sreza koji je pripadao Podrinjskom okrugu (kasnije Drinskoj banovini).',
          en: 'In the Kingdom of Serbia and the Kingdom of Serbs, Croats and Slovenes, Voćnjak belonged to the Jadar district (srez), which was part of the Podrinje county (later the Drina Banovina).',
        },
      },
      {
        title: { sr: 'Savremeni status', en: 'Present status' },
        body: {
          sr: 'Danas Voćnjak pravno nema status samostalne opštine, već ima status naseljenog mesta (sela) koje administrativno pripada Gradu Loznici (Mačvanski upravni okrug).',
          en: 'Today Voćnjak is legally not a municipality in its own right, but a settlement (village) that administratively belongs to the City of Loznica (Mačva administrative district).',
        },
      },
      {
        title: { sr: 'Lokalna samouprava', en: 'Local government' },
        body: {
          sr: 'Na lokalnom nivou, meštani svoja prava ostvaruju kroz Mesnu zajednicu Voćnjak. Savet mesne zajednice se bira na lokalnim izborima i zadužen je za rešavanje komunalnih pitanja: asfaltiranje ulica, ulična rasveta, vodosnabdevanje i ekološka pitanja vezana za reku Štiru.',
          en: 'Locally, residents exercise their rights through the Voćnjak Local Community (Mesna zajednica). Its council is elected in local elections and handles municipal matters: paving streets, street lighting, water supply and environmental issues concerning the river Štira.',
        },
      },
      {
        title: { sr: 'Izborna geometrija', en: 'Electoral geography' },
        body: {
          sr: 'Na parlamentarnim i lokalnim izborima, Voćnjak čini jedno ili više zasebnih biračkih mesta u okviru izborne jedinice Loznica. Glasačko telo obično prati opšte političke trendove zapadne Srbije.',
          en: 'In parliamentary and local elections, Voćnjak forms one or more separate polling stations within the Loznica electoral unit. The electorate usually follows the general political trends of western Serbia.',
        },
      },
    ],
  },

  /* ───────────────────────── demographics ───────────────────────── */
  {
    id: 'demo',
    emoji: '📊',
    label: { sr: 'Stanovništvo', en: 'Population' },
    intro: {
      sr: 'Za razliku od većine sela u Srbiji koja odumiru, Voćnjak je zahvaljujući neposrednoj blizini Loznice (svega oko 4–5 km od centra grada) beležio stalan demografski rast tokom druge polovine 20. veka.',
      en: 'Unlike most villages in Serbia, which are dying out, Voćnjak — thanks to its closeness to Loznica (only about 4–5 km from the town centre) — recorded steady demographic growth through the second half of the 20th century.',
    },
    census: true,
    stats: [
      { value: s('99,7%'), label: { sr: 'Srba prema zvaničnim podacima', en: 'Serbs, according to official data' } },
      { value: s('37,3'), label: { sr: 'prosečna starost stanovnika', en: 'average age of residents' } },
      { value: s('349'), label: { sr: 'domaćinstava (2002)', en: 'households (2002)' } },
      { value: s('1.106'), label: { sr: 'stanovnika (2022)', en: 'residents (2022)' } },
    ],
    blocks: [
      {
        title: { sr: 'Etnički sastav', en: 'Ethnic composition' },
        body: {
          sr: 'Prema zvaničnim podacima stanovništvo je izuzetno homogeno — preko 99,7% čine Srbi, dok je prosek starosti oko 37,3 godine, što ga čini demografski znatno mlađim od republičkog proseka.',
          en: 'According to official data the population is extremely homogeneous — over 99.7% are Serbs — and the average age is about 37.3 years, making it demographically much younger than the national average.',
        },
      },
      {
        title: { sr: 'Privredna transformacija', en: 'Economic transformation' },
        body: {
          sr: 'Nekada čisto poljoprivredno selo (voćarstvo, stočarstvo, ratarstvo), danas je potpuno promenilo strukturu. Otvaranjem fabrika u Loznici tokom SFRJ (poput hemijskog giganta „Viskoza“), meštani su masovno postali radnici-seljaci. Danas se samo mali procenat domaćinstava bavi isključivo poljoprivredom, dok većina radi u uslužnim, trgovinskim i industrijskim sektorima u Loznici, a imanja u Voćnjaku služe kao mesto stanovanja i dodatni izvor prihoda.',
          en: 'Once a purely agricultural village (fruit growing, livestock, crops), it has completely changed its structure. When factories opened in Loznica during socialist Yugoslavia (such as the chemical giant “Viskoza”), villagers massively became worker-peasants. Today only a small percentage of households live exclusively from farming, while most work in services, trade and industry in Loznica, and the farms in Voćnjak serve as homes and an additional source of income.',
        },
      },
    ],
  },
];

/** Where the information comes from. */
export const aboutSources: { label: string; href: string }[] = [
  { label: 'Poreklo.rs — Poreklo prezimena, selo Voćnjak (Loznica)', href: 'https://www.poreklo.rs/2014/04/09/poreklo-prezimena-selo-vocnjak-loznica?script=lat' },
  { label: 'Wikipedia — Voćnjak (Loznica)', href: 'https://sh.wikipedia.org/wiki/Vo%C4%87njak_(Loznica)' },
  { label: 'Srpska enciklopedija — Voćnjak', href: 'https://srpskaenciklopedija.rs/books/slovo-v/page/vocnjak' },
  { label: 'Grad Loznica — Istorija grada', href: 'https://loznica.rs/o-loznici/istorija-grada/' },
  { label: 'Infolo — Loznica kroz istoriju', href: 'https://www.infolo.rs/loznica-kroz-istoriju/' },
  { label: 'Lotel — Arheološka istraživanja na lokalitetu Paulje u Jadru', href: 'https://lotel.rs/o-arheoloskim-istrazivanjima-na-lokalitetu-paulje-u-jadru/' },
  { label: 'Grad Loznica — Profil zajednice (PDF)', href: 'http://www.loznica.rs/cms/mestoZaUploadFajlove/Profil%20zajednice%20-%20%20%20srpski%20konacno%20051208.pdf' },
];
