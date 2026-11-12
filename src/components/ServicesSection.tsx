import React from 'react';
import { SERVICES, TRANSLATIONS } from '../data/portfolioData';

interface ServicesSectionProps {
  currentLang: 'en' | 'fr' | 'ar';
  onOpenContact: () => void;
}

export const ServicesSection: React.FC<ServicesSectionProps> = ({
  currentLang,
  onOpenContact,
}) => {
  const t = TRANSLATIONS[currentLang];

  return (
    <section className="py-10 sm:py-16 md:py-20 px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden" id="services">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-6 mb-8 sm:mb-12 pb-4 sm:pb-6 border-b-2 border-black/80">
        <div>
          <div className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-mono font-bold uppercase tracking-wider text-red-600 mb-1">
            <span>CORE CAPABILITIES</span>
            <span>·</span>
            <span>SERVICES</span>
          </div>
          <h2 className="font-display font-black text-3xl sm:text-4xl md:text-6xl tracking-tighter text-black uppercase break-words">
            {t.whatIOffer}
          </h2>
          <p className="font-mono text-xs sm:text-sm text-neutral-600 max-w-xl mt-1">
            {t.servicesDesc}
          </p>
        </div>

        <button
          onClick={onOpenContact}
          className="px-5 py-2.5 bg-black hover:bg-neutral-800 text-white font-mono text-xs font-bold uppercase rounded-none shadow-[3px_3px_0px_#dc2626] active:translate-x-0.5 active:translate-y-0.5 transition-all whitespace-nowrap self-start md:self-end"
        >
          {currentLang === 'ar' ? 'طلب استشارة' : currentLang === 'fr' ? 'Réserver un Service' : 'Inquire for Booking'}
        </button>
      </div>

      <div className="divide-y-2 divide-black/80">
        {SERVICES.map((srv) => (
          <div
            key={srv.num}
            className="py-8 grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-8 items-start group hover:bg-black/3 transition-colors px-2 sm:px-4"
          >
            {/* Number index */}
            <div className="md:col-span-2 flex items-center gap-3">
              <span className="font-display font-black text-3xl sm:text-4xl text-neutral-400 group-hover:text-red-600 transition-colors">
                {srv.num}
              </span>
              <span className="hidden md:inline-block w-8 h-[2px] bg-black/20 group-hover:bg-red-600 transition-colors"></span>
            </div>

            {/* Service Title */}
            <div className="md:col-span-4">
              <h3 className="font-display font-black text-xl sm:text-2xl text-black uppercase tracking-tight group-hover:text-red-600 transition-colors">
                {srv.title[currentLang]}
              </h3>

              {/* Tools chips */}
              <div className="flex flex-wrap gap-1.5 mt-2.5">
                {srv.tools.map((tool) => (
                  <span
                    key={tool}
                    className="text-[11px] font-mono px-2 py-0.5 bg-neutral-200/80 text-neutral-800 uppercase"
                  >
                    {tool}
                  </span>
                ))}
              </div>
            </div>

            {/* Service Description */}
            <div className="md:col-span-6 text-neutral-700 text-sm sm:text-[15px] leading-relaxed">
              <p>{srv.desc[currentLang]}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
