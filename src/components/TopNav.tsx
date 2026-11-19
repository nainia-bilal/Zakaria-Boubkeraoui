import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TRANSLATIONS } from '../data/portfolioData';

interface TopNavProps {
  currentLang: 'en' | 'fr' | 'ar';
  setLang: (lang: 'en' | 'fr' | 'ar') => void;
  onOpenContact: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({ currentLang, setLang, onOpenContact }) => {
  const t = TRANSLATIONS[currentLang];
  const [isExpanded, setIsExpanded] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('top');
  const islandRef = useRef<HTMLDivElement>(null);

  const navLinks = [
    { href: '#top', label: currentLang === 'ar' ? 'الرئيسية' : currentLang === 'fr' ? 'Accueil' : 'Home' },
    { href: '#about', label: currentLang === 'ar' ? 'نبذة' : currentLang === 'fr' ? 'À propos' : 'About' },
    { href: '#the-stu', label: currentLang === 'ar' ? 'الاستوديو' : currentLang === 'fr' ? 'Le Studio' : 'The Stu' },
    { href: '#projects', label: currentLang === 'ar' ? 'الأعمال' : currentLang === 'fr' ? 'Projets' : 'Work' },
    { href: '#services', label: currentLang === 'ar' ? 'الخدمات' : currentLang === 'fr' ? 'Services' : 'Services' },
    { href: '#contact', label: currentLang === 'ar' ? 'تواصل' : currentLang === 'fr' ? 'Contact' : 'Contact' },
  ];

  // Track scroll position & active section
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setIsScrolled(scrollY > 60);

      // Detect active section
      const sections = ['top', 'about', 'the-stu', 'projects', 'services', 'contact'];
      for (const sectionId of [...sections].reverse()) {
        const element = document.getElementById(sectionId);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 200) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close island on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (islandRef.current && !islandRef.current.contains(e.target as Node)) {
        setIsExpanded(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLinkClick = (href: string) => {
    setIsExpanded(false);
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const activeLabel =
    navLinks.find((l) => l.href === `#${activeSection}`)?.label || (currentLang === 'ar' ? 'الرئيسية' : 'Portfolio');

  return (
    <div className="fixed top-3 sm:top-5 left-0 right-0 z-50 flex justify-center pointer-events-none px-3">
      {/* Dynamic Island Floating Capsule */}
      <motion.nav
        ref={islandRef}
        layout
        transition={{
          type: 'spring',
          stiffness: 380,
          damping: 30,
        }}
        className={`pointer-events-auto bg-[#0a0a0c]/90 hover:bg-[#0a0a0c]/95 backdrop-blur-xl border border-white/15 text-white shadow-[0_12px_45px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.08)] transition-shadow duration-300 ${
          isExpanded
            ? 'rounded-[26px] p-4 sm:p-5 w-full max-w-[94vw] sm:max-w-xl md:max-w-2xl'
            : 'rounded-full px-2.5 sm:px-3 py-1.5 sm:py-2 flex items-center gap-2 sm:gap-3 max-w-[96vw]'
        }`}
        style={{
          boxShadow: isExpanded
            ? '0 24px 60px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.12), 0 0 25px rgba(220,38,38,0.15)'
            : '0 12px 36px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.08)',
        }}
      >
        <AnimatePresence mode="wait">
          {!isExpanded ? (
            /* COMPACT DYNAMIC ISLAND PILL */
            <motion.div
              key="compact"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="flex items-center justify-between w-full gap-2 sm:gap-3.5 select-none"
            >
              {/* Left Zone: ZB Avatar Badge + Online Status */}
              <button
                onClick={() => setIsExpanded(true)}
                className="flex items-center gap-2 group cursor-pointer text-left shrink-0"
                title="Expand Island Navigation"
              >
                <div className="relative w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-neutral-900 border border-white/20 overflow-hidden flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <img
                    src="/profil.jpeg"
                    alt="Zakaria"
                    className="w-full h-full object-cover grayscale contrast-125 group-hover:grayscale-0 transition-all"
                  />
                  {/* Glowing Status Dot */}
                  <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 border border-black animate-pulse" />
                </div>

                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <span className="font-display font-black text-xs sm:text-sm tracking-tight text-white group-hover:text-red-400 transition-colors">
                      ZAKARIA
                    </span>
                    <span className="text-[9px] font-mono font-bold text-neutral-400 hidden xs:inline-block">
                      · {t.portfolioYear}
                    </span>
                  </div>
                  {/* Dynamic context breadcrumb pill */}
                  <span className="text-[10px] font-mono text-neutral-400 truncate max-w-[80px] xs:max-w-[120px] sm:max-w-none flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-600 inline-block animate-ping" />
                    <span>{activeLabel}</span>
                  </span>
                </div>
              </button>

              {/* Center Zone: Desktop Quick Nav Links (Visible on desktop when compact) */}
              <div className="hidden lg:flex items-center gap-1 bg-white/5 border border-white/10 rounded-full px-2 py-0.5 text-[11px] font-mono uppercase tracking-wider">
                {navLinks.slice(1).map((link) => {
                  const isActive = activeSection === link.href.replace('#', '');
                  return (
                    <button
                      key={link.href}
                      onClick={() => handleLinkClick(link.href)}
                      className={`px-2.5 py-1 rounded-full transition-all cursor-pointer ${
                        isActive
                          ? 'bg-white text-black font-bold shadow-xs'
                          : 'text-neutral-300 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      {link.label}
                    </button>
                  );
                })}
              </div>

              {/* Right Zone: Expand Trigger + Language Switcher + Let's Talk CTA */}
              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                {/* Compact Language Selector */}
                <div className="flex items-center bg-white/10 border border-white/15 rounded-full p-0.5 text-[10px] sm:text-[11px] font-mono font-bold">
                  {(['en', 'fr', 'ar'] as const).map((lang) => (
                    <button
                      key={lang}
                      onClick={() => setLang(lang)}
                      className={`px-1.5 sm:px-2 py-0.5 rounded-full uppercase transition-all cursor-pointer ${
                        currentLang === lang
                          ? 'bg-red-600 text-white shadow-xs'
                          : 'text-neutral-400 hover:text-white'
                      }`}
                      aria-label={`Switch language to ${lang}`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>

                {/* Primary CTA Button */}
                <button
                  onClick={onOpenContact}
                  className="px-2.5 sm:px-3 py-1 bg-white hover:bg-neutral-200 text-black text-[11px] sm:text-xs font-mono font-bold uppercase rounded-full shadow-xs active:scale-95 transition-all whitespace-nowrap cursor-pointer flex items-center gap-1"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
                  <span className="hidden xs:inline">{currentLang === 'ar' ? 'تواصل' : "Let's Talk"}</span>
                  <span className="xs:hidden">Talk</span>
                </button>

                {/* Dynamic Island Expand Morph Button */}
                <button
                  onClick={() => setIsExpanded(true)}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-white flex items-center justify-center transition-colors cursor-pointer group"
                  aria-label="Expand Island Menu"
                >
                  <motion.div animate={{ rotate: isExpanded ? 180 : 0 }}>
                    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" className="text-white group-hover:scale-110 transition-transform">
                      <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </motion.div>
                </button>
              </div>
            </motion.div>
          ) : (
            /* EXPANDED DYNAMIC ISLAND CARD */
            <motion.div
              key="expanded"
              initial={{ opacity: 0, scale: 0.96, y: -8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -8 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col gap-4 w-full select-none"
            >
              {/* Expanded Island Header Row */}
              <div className="flex items-center justify-between pb-3 border-b border-white/15">
                <div className="flex items-center gap-2.5">
                  <div className="relative w-9 h-9 rounded-full bg-neutral-900 border border-white/20 overflow-hidden shrink-0">
                    <img src="/profil.jpeg" alt="Zakaria" className="w-full h-full object-cover" />
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border border-black animate-pulse" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-display font-black text-sm sm:text-base text-white tracking-tight">
                        ZAKARIA BOUBKERAOUI
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-red-600/20 border border-red-500/40 text-[9px] font-mono text-red-400 font-bold uppercase">
                        ONLINE
                      </span>
                    </div>
                    <p className="text-[10px] font-mono text-neutral-400">
                      {t.role} · Casablanca, Morocco
                    </p>
                  </div>
                </div>

                {/* Island Close / Collapse Button */}
                <button
                  onClick={() => setIsExpanded(false)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-white flex items-center justify-center text-xs font-mono font-bold transition-all cursor-pointer active:scale-95"
                  aria-label="Collapse Island Menu"
                >
                  ✕
                </button>
              </div>

              {/* Navigation Links Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {navLinks.map((link) => {
                  const isActive = activeSection === link.href.replace('#', '');
                  return (
                    <button
                      key={link.href}
                      onClick={() => handleLinkClick(link.href)}
                      className={`flex items-center justify-between p-2.5 sm:p-3 rounded-xl border transition-all text-left cursor-pointer group ${
                        isActive
                          ? 'bg-white text-black border-white shadow-md font-bold'
                          : 'bg-white/5 hover:bg-white/10 border-white/10 text-neutral-200'
                      }`}
                    >
                      <span className="font-mono text-xs sm:text-sm uppercase tracking-wider">
                        {link.label}
                      </span>
                      <span
                        className={`text-xs font-mono transition-transform group-hover:translate-x-0.5 ${
                          isActive ? 'text-red-600 font-bold' : 'text-neutral-500'
                        }`}
                      >
                        →
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Bottom Island Controls: Languages + Direct Action */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-white/15">
                {/* Language Switcher Pills */}
                <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-full p-1 self-start sm:self-auto">
                  <span className="text-[10px] font-mono uppercase text-neutral-400 px-2">
                    {currentLang === 'ar' ? 'اللغة' : 'LANG'}:
                  </span>
                  {(['en', 'fr', 'ar'] as const).map((lang) => (
                    <button
                      key={lang}
                      onClick={() => setLang(lang)}
                      className={`px-2.5 py-1 rounded-full text-xs font-mono uppercase font-bold transition-all cursor-pointer ${
                        currentLang === lang
                          ? 'bg-red-600 text-white shadow-xs'
                          : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>

                {/* Primary Action Button inside Expanded Island */}
                <div className="flex items-center gap-2">
                  <a
                    href="mailto:zaki200615@gmail.com"
                    className="px-3.5 py-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-white font-mono text-xs font-bold transition-colors text-center"
                  >
                    zaki200615@gmail.com
                  </a>
                  <button
                    onClick={() => {
                      setIsExpanded(false);
                      onOpenContact();
                    }}
                    className="flex-1 sm:flex-initial px-4 py-2 rounded-full bg-white hover:bg-neutral-200 text-black font-mono text-xs font-bold uppercase transition-all shadow-md active:scale-95 text-center cursor-pointer"
                  >
                    {currentLang === 'ar' ? 'تواصل معي الآن ←' : currentLang === 'fr' ? 'Me Contacter →' : "Let's Talk →"}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </div>
  );
};
