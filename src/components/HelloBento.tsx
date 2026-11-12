import React, { useState } from 'react';
import { TRANSLATIONS, APP_ICONS, type AppIconInfo } from '../data/portfolioData';

interface HelloBentoProps {
  currentLang: 'en' | 'fr' | 'ar';
}

export const HelloBento: React.FC<HelloBentoProps> = ({ currentLang }) => {
  const t = TRANSLATIONS[currentLang];
  const [selectedTool, setSelectedTool] = useState<AppIconInfo>(APP_ICONS[0]);

  return (
    <section className="py-6 sm:py-8 px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden" id="about">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-10 items-start">
        {/* Left Column (Photoshop / Illustrator Red Transform Box with Cutout Photo) */}
        <div className="lg:col-span-4 flex flex-col items-center justify-center w-full">
          <div className="relative p-2.5 sm:p-3 w-full max-w-xs sm:max-w-sm border-2 border-dashed border-red-500/80 bg-white/40 shadow-sm backdrop-blur-xs">
            {/* 8 Transform Handle Anchor Points as in Illustrator/Photoshop */}
            <span className="absolute -top-1.5 -left-1.5 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-red-600 border border-white"></span>
            <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-red-600 border border-white"></span>
            <span className="absolute -top-1.5 -right-1.5 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-red-600 border border-white"></span>
            <span className="absolute top-1/2 -left-1.5 -translate-y-1/2 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-red-600 border border-white"></span>
            <span className="absolute top-1/2 -right-1.5 -translate-y-1/2 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-red-600 border border-white"></span>
            <span className="absolute -bottom-1.5 -left-1.5 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-red-600 border border-white"></span>
            <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-red-600 border border-white"></span>
            <span className="absolute -bottom-1.5 -right-1.5 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-red-600 border border-white"></span>

            {/* Transform selection tag */}
            <div className="absolute top-2 left-2 bg-red-600 text-white text-[9px] sm:text-[10px] font-mono px-1.5 py-0.5 tracking-wider uppercase">
              SELECTION: ZAKARIA · 100%
            </div>

            {/* Photo frame */}
            <div className="w-full aspect-[3/4] bg-neutral-200 overflow-hidden relative group">
              <img
                src="/profil.jpeg"
                alt="Zakaria Boubkeraoui Portrait"
                className="w-full h-full object-cover object-top filter grayscale contrast-110 group-hover:grayscale-0 transition-all duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-3 sm:p-4">
                <div className="text-white">
                  <p className="font-display font-bold text-xs sm:text-sm tracking-wide">ZAKARIA BOUBKERAOUI</p>
                  <p className="font-mono text-[10px] sm:text-[11px] text-neutral-300">CONTENT CREATOR / MARKETER</p>
                </div>
              </div>
            </div>

            {/* Micro coordinate markers */}
            <div className="flex items-center justify-between pt-1.5 sm:pt-2 text-[9px] sm:text-[10px] font-mono text-neutral-500">
              <span>W: 1080px</span>
              <span>X: 0 · Y: 0</span>
              <span>H: 1920px</span>
            </div>
          </div>
        </div>

        {/* Middle Column (HELLO + Bio Story + EDUCATION) */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-5 sm:space-y-6">
          <div>
            <h2 className="font-display font-black text-4xl sm:text-5xl lg:text-7xl tracking-tighter text-black leading-none uppercase break-words">
              {t.hello}
            </h2>
            <h3 className="font-display font-bold text-lg sm:text-xl text-neutral-800 mt-2">
              {t.hiImZakaria}
            </h3>

            <div className="mt-4 space-y-3 text-neutral-700 text-sm sm:text-[15px] leading-relaxed">
              <p className="font-medium text-black">{t.helloBio1}</p>
              <p>{t.helloBio2}</p>
              <p>{t.helloBio3}</p>
            </div>
          </div>

          {/* EDUCATION Section */}
          <div className="pt-6 border-t-2 border-black/80">
            <h4 className="font-display font-black text-xl tracking-tight text-black uppercase flex items-center gap-2">
              <span>{t.education}</span>
              <span className="text-red-600 text-xs font-mono font-bold">///</span>
            </h4>
            <div className="mt-2.5">
              <p className="font-display font-bold text-sm sm:text-base text-neutral-900">
                {t.eduDegree}
              </p>
              <p className="font-mono text-xs text-neutral-600 mt-0.5">
                {t.eduSchool}
              </p>
              <div className="mt-2 flex flex-wrap gap-2 text-[11px] font-mono text-neutral-700">
                <span className="bg-white/80 border border-black/10 px-2 py-0.5 rounded-xs">
                  {currentLang === 'ar' ? 'مونتاج متقدم' : 'Advanced Video Editing'}
                </span>
                <span className="bg-white/80 border border-black/10 px-2 py-0.5 rounded-xs">
                  {currentLang === 'ar' ? 'استراتيجية العلامة' : 'Brand Strategy'}
                </span>
                <span className="bg-white/80 border border-black/10 px-2 py-0.5 rounded-xs">
                  {currentLang === 'ar' ? 'سرد بصري' : 'Visual Storytelling'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (SKILLS Grid + EXPERIENCE List) */}
        <div className="lg:col-span-3 flex flex-col space-y-8">
          {/* SKILLS section with Adobe-style app icons */}
          <div>
            <h4 className="font-display font-black text-xl tracking-tight text-black uppercase flex items-center justify-between">
              <span>{t.skills}</span>
              <span className="text-xs font-mono font-normal text-neutral-500">8 APPS</span>
            </h4>

            {/* App Icon Grid (Ps, Ai, Ae, Pr, Cv, Cc, In, Pa) */}
            <div className="grid grid-cols-4 gap-2.5 mt-3">
              {APP_ICONS.map((app) => {
                const isSelected = selectedTool.name === app.name;
                return (
                  <button
                    key={app.name}
                    onClick={() => setSelectedTool(app)}
                    className={`aspect-square rounded-lg flex flex-col items-center justify-center transition-all cursor-pointer relative group ${
                      app.bgColor
                    } ${isSelected ? 'ring-2 ring-red-600 ring-offset-2 scale-105' : 'hover:scale-105'}`}
                    aria-label={`View ${app.name} skill level`}
                  >
                    <span className={`font-display font-black text-lg ${app.textColor}`}>
                      {app.code}
                    </span>
                    <span className="text-[9px] font-mono tracking-tighter text-white/80 mt-0.5">
                      {app.name}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Tool Detail Box */}
            <div className="mt-3 p-3 bg-white border border-black/10 rounded-lg shadow-2xs">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="font-bold text-black">{selectedTool.name}</span>
                <span className="text-red-600 font-bold">{selectedTool.level}%</span>
              </div>
              <p className="text-[11px] text-neutral-600 mt-1">{selectedTool.category}</p>
              <div className="w-full bg-neutral-200 h-1.5 rounded-full mt-2 overflow-hidden">
                <div
                  className="bg-black h-full rounded-full transition-all duration-500"
                  style={{ width: `${selectedTool.level}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* EXPERIENCE section */}
          <div className="pt-6 border-t-2 border-black/80">
            <h4 className="font-display font-black text-xl tracking-tight text-black uppercase">
              {t.experience}
            </h4>

            <div className="mt-3 space-y-4">
              <div className="border-l-2 border-red-600 pl-3">
                <div className="text-[11px] font-mono font-bold text-red-600">
                  {t.exp1Date}
                </div>
                <div className="font-display font-bold text-sm text-neutral-900 leading-tight">
                  {t.exp1Role}
                </div>
                <div className="text-xs font-mono text-neutral-600">{t.exp1Place}</div>
              </div>

              <div className="border-l-2 border-black/20 pl-3">
                <div className="text-[11px] font-mono font-bold text-neutral-600">
                  {t.exp2Date}
                </div>
                <div className="font-display font-bold text-sm text-neutral-900 leading-tight">
                  {t.exp2Role}
                </div>
                <div className="text-xs font-mono text-neutral-600">{t.exp2Place}</div>
              </div>

              <div className="border-l-2 border-black/20 pl-3">
                <div className="text-[11px] font-mono font-bold text-neutral-600">
                  {t.exp3Date}
                </div>
                <div className="font-display font-bold text-sm text-neutral-900 leading-tight">
                  {t.exp3Role}
                </div>
                <div className="text-xs font-mono text-neutral-600">{t.exp3Place}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
