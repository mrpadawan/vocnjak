import { useCallback, useState } from 'react';
import About from './components/About';
import Attractions from './components/Attractions';
import Directory from './components/Directory';
import ExternalLinks from './components/ExternalLinks';
import Footer from './components/Footer';
import FootballClub from './components/FootballClub';
import Hero from './components/Hero';
import IntroGate from './components/IntroGate';
import Navbar from './components/Navbar';
import VillageMap from './components/map/VillageMap';
import { LangProvider, useI18n } from './lib/i18n';
import { ThemeProvider } from './lib/theme';

function SkipLink() {
  const { t } = useI18n();
  return (
    <a
      href="#main"
      className="fixed left-3 top-3 z-[200] -translate-y-20 rounded-full bg-sun-400 px-4 py-2 text-sm font-extrabold text-leaf-950 shadow-lg transition focus:translate-y-0"
    >
      {t('nav.skip')}
    </a>
  );
}

export default function App() {
  // The selected place is shared: cards select it, the 3D map reacts to it.
  const [activeId, setActiveId] = useState<string | null>(null);

  const showOnMap = useCallback((id: string) => {
    setActiveId(id);
    document.getElementById('mapa')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, []);

  return (
    <LangProvider>
      <ThemeProvider>
        <IntroGate>
          <SkipLink />
          <Navbar />
          <main id="main">
            <Hero />
            <Attractions onShowOnMap={showOnMap} />
            <Directory onShowOnMap={showOnMap} />
            <About />
            <VillageMap activeId={activeId} onSelect={setActiveId} />
            <FootballClub />
            <ExternalLinks />
          </main>
          <Footer />
        </IntroGate>
      </ThemeProvider>
    </LangProvider>
  );
}
