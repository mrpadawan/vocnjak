import { useI18n } from '../lib/i18n';
import { Apple } from './art/Fruit';

const LINKEDIN = 'https://www.linkedin.com/in/nmatic';

export default function Footer() {
  const { t, tx } = useI18n();
  return (
    <footer className="bg-leaf-950 text-leaf-100">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-6 py-12 text-center sm:flex-row sm:justify-between sm:text-left">
        <div className="flex items-center gap-3">
          <Apple className="size-10" />
          <div>
            <p className="font-display text-2xl font-extrabold text-white">{t('meta.name')}</p>
            <p className="text-sm text-leaf-300">{t('footer.tag')}</p>
          </div>
        </div>
        <p className="text-sm text-leaf-300">
          {t('footer.madeBy')}{' '}
          <a
            href={LINKEDIN}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${tx('Nikola Matić')} — LinkedIn`}
            className="group inline-flex items-center gap-1.5 font-extrabold text-sun-300 underline decoration-2 underline-offset-4 transition hover:text-white"
          >
            {tx('Nikola Matić')}
            <svg viewBox="0 0 24 24" className="size-4 transition group-hover:scale-110" fill="currentColor" aria-hidden>
              <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z" />
            </svg>
          </a>
        </p>
        <p className="text-sm font-semibold text-leaf-300">
          © {new Date().getFullYear()} {t('footer.copy')}
        </p>
      </div>
    </footer>
  );
}
