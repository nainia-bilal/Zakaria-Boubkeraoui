import React from 'react';
import { TRANSLATIONS } from '../data/portfolioData';

interface DarkStreetwearSectionProps {
  currentLang: 'en' | 'fr' | 'ar';
  onOpenContact: () => void;
}

export const DarkStreetwearSection: React.FC<DarkStreetwearSectionProps> = ({
  currentLang,
  onOpenContact,
}) => {
  const t = TRANSLATIONS[currentLang];

  const stats = [
    { value: '30+', label: t.projectsDelivered },
    { value: '10+', label: t.toolsMastered },
    { value: '3', label: t.languagesSpoken },
    { value: '2+', label: t.yearsCreating },
  ];

  return (
    <section className="relative bg-dark-grid text-white py-12 sm:py-16 overflow-hidden select-none" id="streetwear">
      {/* Background oversized marquee typography matching Pinterest pin */}
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex items-center justify-center opacity-10 pointer-events-none whitespace-nowrap overflow-hidden select-none">
        <span className="font-display font-black text-5xl sm:text-7xl md:text-8xl lg:text-[10rem] tracking-tighter text-neutral-300 uppercase leading-none select-none">
          ZAKARIA BOUBKERAOUI · ✦ ✦ ♣ · ZAKARIA BOUBKERAOUI
        </span>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10 flex flex-col items-center">
        {/* Availability tag */}
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-950/80 border border-red-500/60 rounded-full text-red-400 text-xs font-mono tracking-wider mb-6">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
          <span>{t.availableFreelance}</span>
        </div>

        {/* Center Cutout Portrait with RED Sticker Outline Cut (direct match to pin!) */}
        <div className="relative my-4 group">
          {/* Subtle red aura behind portrait */}
          <div className="absolute inset-0 bg-red-600/30 blur-2xl rounded-full transform scale-95 group-hover:scale-105 transition-transform duration-500"></div>

          <div className="relative w-64 sm:w-80 md:w-96 aspect-[3/4] flex items-center justify-center">
            {/* Cutout portrait with red sticker outline cut filter */}
            <img
              src="/profil.jpeg"
              alt="Zakaria Boubkeraoui Cutout"
              className="w-full h-full object-cover object-top rounded-2xl border-4 border-red-600 shadow-[0_0_30px_rgba(239,68,68,0.45)] group-hover:scale-102 transition-transform duration-300"
            />
          </div>

          {/* Ornamental symbols below photo */}
          <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-[#0c0c0e] px-4 py-1.5 border border-white/20 rounded-full text-sm sm:text-base text-neutral-300 shadow-lg">
            <span>✦</span>
            <span className="text-red-500 font-bold">✦</span>
            <span>♣</span>
          </div>
        </div>

        {/* Creator Name & High-impact tagline */}
        <div className="text-center mt-8 max-w-2xl">
          <h3 className="font-display font-black text-2xl sm:text-4xl tracking-tight text-white uppercase">
            Zakaria Boubkeraoui
          </h3>
          <p className="font-mono text-xs sm:text-sm text-neutral-400 mt-2">
            Junior Digital Marketer · Video Editor · Content Strategist
          </p>
          <p className="text-sm sm:text-base text-neutral-300 mt-3 font-normal leading-relaxed">
            {currentLang === 'ar'
              ? 'تحويل الأفكار والقصص إلى محتوى بصري جذاب واحترافي يحقق التفاعل ويبني الثقة للعلامات الشخصية والتجارية.'
              : currentLang === 'fr'
              ? 'Transformer vos idées en récits visuels percutants, reels dynamiques et contenus à fort engagement.'
              : 'Transforming ideas into aesthetic, high-converting visuals and dynamic content that commands attention.'}
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={onOpenContact}
              className="px-6 py-2.5 bg-red-600 hover:bg-red-500 text-white font-mono text-xs font-bold uppercase rounded-md shadow-lg shadow-red-600/30 active:scale-95 transition-all"
            >
              {currentLang === 'ar' ? 'ابدأ مشروعك الآن' : currentLang === 'fr' ? 'Lancer un Projet' : 'Start a Project'}
            </button>
            <a
              href="#projects"
              className="px-6 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border border-white/20 font-mono text-xs font-bold uppercase rounded-md transition-all"
            >
              {currentLang === 'ar' ? 'تصفح الأعمال' : currentLang === 'fr' ? 'Voir les Travaux' : 'Explore Work'}
            </a>
          </div>
        </div>

        {/* 4-Column Key Metrics Strip (As specified in portfolio & design constitution) */}
        <div className="w-full max-w-4xl grid grid-cols-2 sm:grid-cols-4 gap-4 mt-12 pt-8 border-t border-white/10">
          {stats.map((s, idx) => (
            <div
              key={idx}
              className="p-4 bg-white/5 border border-white/10 rounded-lg text-center backdrop-blur-xs hover:border-red-500/50 transition-colors"
            >
              <div className="font-display font-black text-3xl sm:text-4xl text-white tracking-tight tabular-nums">
                {s.value}
              </div>
              <div className="font-mono text-xs text-neutral-400 mt-1 uppercase tracking-wider">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

