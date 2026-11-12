import React, { useState } from 'react';
import { POLAROIDS, TRANSLATIONS } from '../data/portfolioData';

interface TheStuSectionProps {
  currentLang: 'en' | 'fr' | 'ar';
}

export const TheStuSection: React.FC<TheStuSectionProps> = ({ currentLang }) => {
  const t = TRANSLATIONS[currentLang];
  const [activePhoto, setActivePhoto] = useState<string | null>(null);

  return (
    <section className="py-10 sm:py-16 md:py-20 px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden" id="the-stu">
      <div className="text-center mb-8 sm:mb-10">
        <div className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-mono font-bold uppercase tracking-wider text-red-600 mb-1">
          <span>CREATIVE ENVIRONMENT</span>
          <span>·</span>
          <span>BTS</span>
        </div>
        <h2 className="font-display font-black text-3xl sm:text-5xl md:text-6xl tracking-tighter text-black uppercase break-words">
          {t.theStu}
        </h2>
        <p className="font-mono text-xs sm:text-sm text-neutral-600 max-w-xl mx-auto mt-2">
          {t.theStuDesc}
        </p>
      </div>

      {/* Polaroid Grid with Washi Tape and Tilted Angles as in Pinterest pin */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-6 pt-4">
        {POLAROIDS.map((p) => {
          return (
            <div
              key={p.id}
              className={`relative bg-white p-3 sm:p-3.5 pb-5 sm:pb-6 border border-black/15 shadow-[0_6px_16px_rgba(0,0,0,0.08)] transform sm:${p.rotation} hover:rotate-0 hover:scale-103 hover:z-20 transition-all duration-300 group cursor-pointer max-w-sm mx-auto w-full`}
              onClick={() => setActivePhoto(p.image)}
            >
              {/* Washi masking tape on top center */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-6 masking-tape border border-black/10 transform rotate-1 pointer-events-none z-10 opacity-90"></div>

              {/* Photo viewport */}
              <div className="aspect-[4/5] bg-neutral-100 overflow-hidden relative">
                <img
                  src={p.image}
                  alt={p.caption}
                  className="w-full h-full object-cover filter contrast-105 group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-2 right-2 bg-black/75 text-white text-[9px] font-mono px-1.5 py-0.5 rounded-xs">
                  {p.tag}
                </div>
              </div>

              {/* Polaroid Bottom Caption in Space Mono */}
              <div className="mt-3.5 flex items-center justify-between text-neutral-800">
                <span className="font-mono text-xs font-bold truncate">{p.caption}</span>
                <span className="text-[10px] font-mono text-neutral-400 shrink-0 ml-2">#06</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Lightbox for clicked polaroid */}
      {activePhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setActivePhoto(null)}
        >
          <div
            className="relative max-w-2xl w-full bg-white p-4 pb-8 shadow-2xl rounded-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setActivePhoto(null)}
              className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-sm font-bold hover:bg-neutral-800 transition-colors"
              aria-label="Close preview"
            >
              ✕
            </button>
            <div className="aspect-[4/3] bg-neutral-900 overflow-hidden rounded-xs mt-4">
              <img src={activePhoto} alt="Studio Preview" className="w-full h-full object-contain" />
            </div>
            <p className="mt-3 text-center font-mono text-xs text-neutral-600">
              Studio Artifact · Zakaria Boubkeraoui Archive
            </p>
          </div>
        </div>
      )}
    </section>
  );
};
