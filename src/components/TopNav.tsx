import React, { useState } from 'react';
import { TRANSLATIONS } from '../data/portfolioData';

interface TopNavProps {
  currentLang: 'en' | 'fr' | 'ar';
  setLang: (lang: 'en' | 'fr' | 'ar') => void;
  onOpenContact: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({ currentLang, setLang, onOpenContact }) => {
  const t = TRANSLATIONS[currentLang];
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: '#about', label: currentLang === 'ar' ? 'نبذة عني' : currentLang === 'fr' ? 'À propos' : 'About' },
    { href: '#the-stu', label: currentLang === 'ar' ? 'الاستوديو' : currentLang === 'fr' ? 'Le Studio' : 'The Stu' },
    { href: '#projects', label: currentLang === 'ar' ? 'المشاريع' : currentLang === 'fr' ? 'Projets' : 'Selected Work' },
    { href: '#services', label: currentLang === 'ar' ? 'الخدمات' : currentLang === 'fr' ? 'Services' : 'Services' },
    { href: '#contact', label: currentLang === 'ar' ? 'تواصل' : currentLang === 'fr' ? 'Contact' : 'Contact' },
  ];

  const handleLinkClick = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-[#f7f7f4]/95 border-b border-black/10 transition-colors">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-3 sm:gap-6">
          {/* Zone 1: Brand wordmark */}
          <a
            href="#top"
            className="flex items-center gap-2 font-display text-base sm:text-lg tracking-tight text-black hover:opacity-80 transition-opacity whitespace-nowrap shrink-0 group"
            aria-label="Zakaria Boubkeraoui Home"
          >
            <span className="w-7 h-7 sm:w-8 sm:h-8 rounded bg-black text-white flex items-center justify-center font-display font-bold text-xs tracking-wider group-hover:scale-105 transition-transform">
              ZB
            </span>
            <span className="font-extrabold text-xs sm:text-base tracking-tighter truncate max-w-[120px] xs:max-w-[180px] sm:max-w-none">
              ZAKARIA BOUBKERAOUI
            </span>
          </a>

          {/* Zone 2: Desktop Navigation links */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-7 text-xs font-mono uppercase tracking-wider text-neutral-600">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="hover:text-black transition-colors whitespace-nowrap shrink-0"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Zone 3: Language toggle & Primary Action & Mobile Hamburger */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Segmented language buttons */}
            <div className="flex items-center bg-black/5 p-0.5 sm:p-1 rounded-md border border-black/10">
              {(['en', 'fr', 'ar'] as const).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setLang(lang)}
                  className={`px-2 sm:px-2.5 py-0.5 sm:py-1 text-[10px] sm:text-[11px] font-mono uppercase font-bold rounded transition-all ${
                    currentLang === lang
                      ? 'bg-black text-white shadow-xs'
                      : 'text-neutral-600 hover:text-black'
                  }`}
                  aria-label={`Switch to ${lang}`}
                >
                  {lang}
                </button>
              ))}
            </div>

            {/* Desktop Let's Talk CTA */}
            <button
              onClick={onOpenContact}
              className="hidden sm:inline-block px-3.5 sm:px-4 py-1.5 sm:py-2 bg-black text-white text-xs font-mono font-bold uppercase rounded hover:bg-neutral-800 active:scale-95 transition-all whitespace-nowrap shrink-0"
            >
              {currentLang === 'ar' ? 'تواصل معي' : currentLang === 'fr' ? 'Discuter' : "Let's Talk"}
            </button>

            {/* Mobile Navigation Toggle (Hamburger button) */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden w-8 h-8 flex items-center justify-center bg-black text-white rounded shrink-0 hover:bg-neutral-800 active:scale-95 transition-all focus:outline-none"
              aria-expanded={isMobileMenuOpen}
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Navigation Menu */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <div
            className="w-full max-w-sm ml-auto h-full bg-[#f7f7f4] border-l-2 border-black p-6 shadow-2xl flex flex-col justify-between overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              {/* Header inside drawer */}
              <div className="flex items-center justify-between pb-4 border-b-2 border-black/80 mb-6">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded bg-black text-white flex items-center justify-center font-display font-bold text-xs">
                    ZB
                  </span>
                  <span className="font-display font-black text-sm tracking-tight text-black">
                    NAVIGATION
                  </span>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-8 h-8 rounded bg-black text-white flex items-center justify-center text-xs font-mono font-bold"
                  aria-label="Close navigation menu"
                >
                  ✕
                </button>
              </div>

              {/* Navigation Links */}
              <nav className="flex flex-col space-y-3">
                {navLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={handleLinkClick}
                    className="flex items-center justify-between p-3 bg-white border border-black/15 font-display font-black text-base text-black uppercase tracking-tight hover:border-black hover:bg-neutral-50 active:scale-98 transition-all min-h-[44px]"
                  >
                    <span>{link.label}</span>
                    <span className="text-red-600 font-mono text-xs">→</span>
                  </a>
                ))}
              </nav>

              {/* Mobile CTA */}
              <div className="mt-6">
                <button
                  onClick={() => {
                    handleLinkClick();
                    onOpenContact();
                  }}
                  className="w-full py-3 bg-red-600 text-white font-mono text-xs font-bold uppercase shadow-[3px_3px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition-all text-center min-h-[44px]"
                >
                  {currentLang === 'ar' ? 'تواصل معي الآن' : currentLang === 'fr' ? 'Discuter du Projet' : "Let's Talk →"}
                </button>
              </div>
            </div>

            {/* Bottom Drawer Footer */}
            <div className="pt-6 border-t border-black/10 text-center font-mono text-[11px] text-neutral-500">
              <p>Zakaria Boubkeraoui · 2026</p>
              <div className="flex justify-center gap-4 mt-2 text-neutral-700">
                <a href="https://www.instagram.com/_d_zekoo" target="_blank" rel="noreferrer" className="hover:text-black">
                  Instagram
                </a>
                <span>·</span>
                <a href="https://www.linkedin.com/in/zakaria-boubkeraoui-2a55a13a9" target="_blank" rel="noreferrer" className="hover:text-black">
                  LinkedIn
                </a>
                <span>·</span>
                <a href="mailto:zaki200615@gmail.com" className="hover:text-black">
                  Email
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
