import React from 'react';
import { TRANSLATIONS } from '../data/portfolioData';

interface FooterProps {
  currentLang: 'en' | 'fr' | 'ar';
}

export const Footer: React.FC<FooterProps> = ({ currentLang }) => {
  const t = TRANSLATIONS[currentLang];

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="w-full bg-[#f7f7f4] border-t-2 border-black/80 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-xs font-mono text-neutral-600">
        <div className="flex items-center gap-2">
          <span className="font-bold text-black">ZAKARIA BOUBKERAOUI</span>
          <span>·</span>
          <span>CASABLANCA, MOROCCO</span>
        </div>

        <div className="flex items-center gap-6">
          <a
            href="https://www.linkedin.com/in/zakaria-boubkeraoui-2a55a13a9"
            target="_blank"
            rel="noreferrer"
            className="hover:text-black hover:underline transition-colors"
          >
            LinkedIn
          </a>
          <a
            href="https://www.instagram.com/_d_zekoo"
            target="_blank"
            rel="noreferrer"
            className="hover:text-black hover:underline transition-colors"
          >
            Instagram
          </a>
          <a
            href="mailto:zaki200615@gmail.com"
            className="hover:text-black hover:underline transition-colors"
          >
            Email
          </a>
        </div>

        <div className="flex items-center gap-4">
          <span>{t.copyright}</span>
          <button
            onClick={scrollToTop}
            className="px-2.5 py-1 bg-black text-white text-[11px] hover:bg-neutral-800 transition-colors"
            aria-label="Scroll to top"
          >
            ↑ TOP
          </button>
        </div>
      </div>
    </footer>
  );
};
