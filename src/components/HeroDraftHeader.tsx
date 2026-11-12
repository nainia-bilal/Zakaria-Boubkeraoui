import React from 'react';
import { TRANSLATIONS } from '../data/portfolioData';
import { Hero3DCanvas } from './Hero3DCanvas';

interface HeroDraftHeaderProps {
  currentLang: 'en' | 'fr' | 'ar';
}

export const HeroDraftHeader: React.FC<HeroDraftHeaderProps> = ({ currentLang }) => {
  const t = TRANSLATIONS[currentLang];

  return (
    <section className="pt-6 sm:pt-10 pb-6 px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto select-none overflow-hidden" id="top">
      {/* Top micro metadata header row with clean mobile wrapping */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-1.5 text-[11px] sm:text-xs font-mono font-bold tracking-wider text-black/80 pb-2.5 border-b-2 border-black/80 text-center sm:text-left">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 bg-red-600 rounded-xs shrink-0"></span>
          <span className="truncate">{t.designerIllustrator}</span>
        </div>
        <div className="flex items-center gap-2 text-neutral-600">
          <span>MOROCCO · CASABLANCA</span>
          <span className="text-black/30">/</span>
          <span>{t.portfolioYear}</span>
        </div>
      </div>

      {/* Oversized PORTFOLIO headline with avatar badge & hand-drawn doodle arrow (Fluidly scaled for mobile) */}
      <div className="relative pt-4 sm:pt-6 pb-2 text-center max-w-full overflow-hidden">
        <div className="inline-flex items-center justify-center flex-nowrap font-display font-black text-[2.5rem] xs:text-[3.2rem] sm:text-7xl md:text-8xl lg:text-[8.5rem] leading-none tracking-tighter text-black select-none max-w-full">
          <span>PORTF</span>

          {/* Center avatar sticker badge replacing O/middle with doodle arrow */}
          <div className="relative inline-flex items-center justify-center mx-1 sm:mx-2.5 shrink-0 group">
            <div className="w-10 h-10 xs:w-12 xs:h-12 sm:w-18 sm:h-18 md:w-22 md:h-22 lg:w-26 lg:h-26 rounded-full border-2 sm:border-3 border-black bg-white shadow-[2px_2px_0px_#000] sm:shadow-[3px_3px_0px_#000] overflow-hidden flex items-center justify-center transition-transform group-hover:rotate-6">
              <img
                src="/profil.jpeg"
                alt="Zakaria Boubkeraoui"
                className="w-full h-full object-cover grayscale contrast-125 hover:grayscale-0 transition-all duration-300"
              />
            </div>

            {/* Hand-drawn scribble arrow pointing to face */}
            <div className="absolute -bottom-5 sm:-bottom-7 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none">
              <svg
                width="18"
                height="22"
                viewBox="0 0 24 28"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-black transform -rotate-6 w-3.5 h-4 sm:w-5 sm:h-6"
              >
                <path
                  d="M18 24C12 24 6 18 6 10M6 10L2 14M6 10L10 14"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>

          <span>LIO</span>
        </div>

        {/* 3D WebGL Hero Canvas & Interactive Rotation */}
        <Hero3DCanvas currentLang={currentLang} />

        {/* Centered ornamental stars and clover symbols (✦ ✦ ♣) */}
        <div className="pt-2 sm:pt-4 flex items-center justify-center gap-3 sm:gap-4 text-lg sm:text-2xl text-black">
          <span className="transform hover:scale-125 transition-transform cursor-default">✦</span>
          <span className="transform hover:scale-125 transition-transform cursor-default text-red-600">✦</span>
          <span className="transform hover:scale-125 transition-transform cursor-default">♣</span>
        </div>
      </div>
    </section>
  );
};
