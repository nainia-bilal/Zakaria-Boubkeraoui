import React, { useState } from 'react';
import { SERVICES, TRANSLATIONS } from '../data/portfolioData';
import ScrollStack, { ScrollStackItem } from './ScrollStack';

interface ServicesSectionProps {
  currentLang: 'en' | 'fr' | 'ar';
  onOpenContact: () => void;
}

// Visual deliverables and theme colors per service card
const SERVICE_METADATA = [
  {
    num: '01',
    accentColor: '#dc2626',
    accentBg: 'bg-red-600',
    accentText: 'text-red-600',
    borderColor: 'border-red-600',
    shadowColor: 'shadow-[4px_4px_0px_#dc2626]',
    categoryBadge: 'VIDEO & MOTION',
    deliverables: {
      en: ['Dynamic 60FPS Reel Cuts', 'Color Grading (Rec.709 & Film LUTs)', 'Kinetic Captions & Sound FX', 'Multi-platform Export (9:16 & 16:9)'],
      fr: ['Montages Reels 60FPS dynamiques', 'Étalonnage cinématographique LUTs', 'Sous-titres animés & Sound FX', 'Export multi-plateforme 9:16 & 16:9'],
      ar: ['مونتاج ريلز سريع بدقة 60FPS', 'تصحيح وتدريج الألوان السينمائية', 'مؤثرات صوتية ونصوص متحركة', 'تصدير مخصص لكل المنصات'],
    },
  },
  {
    num: '02',
    accentColor: '#d97706',
    accentBg: 'bg-amber-600',
    accentText: 'text-amber-600',
    borderColor: 'border-amber-600',
    shadowColor: 'shadow-[4px_4px_0px_#d97706]',
    categoryBadge: 'STRATEGY & GROWTH',
    deliverables: {
      en: ['3-Second Hook Formulation', 'Weekly Content Calendar', 'Audience Retention Strategies', 'Storyboarding & Directing'],
      fr: ['Formulation de Hooks percutants', 'Calendrier éditorial hebdomadaire', 'Optimisation du taux de rétention', 'Storyboarding et direction créative'],
      ar: ['صياغة خطافات بصرية قوية', 'جدول محتوى أسبوعي مدروس', 'استراتيجيات زيادة وقت المشاهدة', 'كتابة السيناريو والتخطيط البصري'],
    },
  },
  {
    num: '03',
    accentColor: '#7c3aed',
    accentBg: 'bg-purple-600',
    accentText: 'text-purple-600',
    borderColor: 'border-purple-600',
    shadowColor: 'shadow-[4px_4px_0px_#7c3aed]',
    categoryBadge: 'VISUAL ASSETS',
    deliverables: {
      en: ['Seamless Instagram Carousels', 'High-CTR YouTube Thumbnails', 'Branded Story Frame Systems', 'Creative Collages & Retouching'],
      fr: ['Carrousels Instagram continus', 'Miniatures YouTube à fort CTR', 'Systèmes de stories coordonnées', 'Collages et retouches créatives'],
      ar: ['منشورات كاروسيل متصلة وجذابة', 'صور مصغرة لليوتيوب بنقر مرتفع', 'قوالب ستوري بهوية موحدة', 'كولاج فني وتعديل الصور'],
    },
  },
  {
    num: '04',
    accentColor: '#059669',
    accentBg: 'bg-emerald-600',
    accentText: 'text-emerald-600',
    borderColor: 'border-emerald-600',
    shadowColor: 'shadow-[4px_4px_0px_#059669]',
    categoryBadge: 'BRAND IDENTITY',
    deliverables: {
      en: ['Typography Pairing & Palettes', 'Creator Identity Guidelines', 'Moodboards & Aesthetic Rules', 'Social Media Asset Toolkit'],
      fr: ['Combinaisons typographiques & palettes', 'Charte graphique pour créateurs', 'Moodboards et direction stylistique', 'Pack complet d’assets réseaux sociaux'],
      ar: ['تناسق الخطوط والألوان المميزة', 'دليل الهوية البصرية لصناع المحتوى', 'لوحات المزاج والأسلوب الجمالي', 'حزمة قوالب وأيقونات رقمية متكاملة'],
    },
  },
  {
    num: '05',
    accentColor: '#2563eb',
    accentBg: 'bg-blue-600',
    accentText: 'text-blue-600',
    borderColor: 'border-blue-600',
    shadowColor: 'shadow-[4px_4px_0px_#2563eb]',
    categoryBadge: 'PITCH & DECKS',
    deliverables: {
      en: ['Investor-Ready Pitch Decks', 'Brand Partnership Proposals', 'Keynote & Presentation Design', 'Data Visualization & Storytelling'],
      fr: ['Pitch decks pour investisseurs', 'Dossiers de partenariat de marque', 'Design de présentations Keynote', 'Visualisation de données claire'],
      ar: ['عروض استثمارية رفيعة المستوى', 'ملفات اقتراح الشراكات التجارية', 'تصميم عروض تقديمية تفاعلية', 'تبسيط البيانات المعقدة بصرياً'],
    },
  },
];

export const ServicesSection: React.FC<ServicesSectionProps> = ({
  currentLang,
  onOpenContact,
}) => {
  const t = TRANSLATIONS[currentLang];
  const [scrollMode, setScrollMode] = useState<'window' | 'contained'>('window');

  const renderServiceCards = () => {
    return SERVICES.map((srv, idx) => {
      const meta = SERVICE_METADATA[idx] || SERVICE_METADATA[0];

      return (
        <ScrollStackItem
          key={srv.num}
          itemClassName="bg-white border-2 border-black overflow-hidden flex flex-col justify-between"
        >
          {/* Card Top Header Row */}
          <div>
            <div className="flex items-center justify-between pb-3 mb-4 border-b-2 border-black/10">
              <div className="flex items-center gap-2.5">
                <span
                  className="font-display font-black text-2xl sm:text-3xl tracking-tight text-white px-2.5 py-0.5 rounded-xs"
                  style={{ backgroundColor: meta.accentColor }}
                >
                  {srv.num}
                </span>
                <span className="text-[11px] font-mono font-bold tracking-wider uppercase text-neutral-500">
                  {meta.categoryBadge}
                </span>
              </div>

              {/* Software Tool Chips */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {srv.tools.map((tool) => (
                  <span
                    key={tool}
                    className="text-[10px] sm:text-[11px] font-mono font-bold px-2 py-0.5 bg-neutral-100 border border-black/15 text-neutral-800 rounded-xs"
                  >
                    {tool}
                  </span>
                ))}
              </div>
            </div>

            {/* Title & Core Description */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-6 items-start">
              <div className="md:col-span-5">
                <h3 className="font-display font-black text-xl sm:text-2xl md:text-3xl text-black uppercase tracking-tight leading-tight">
                  {srv.title[currentLang]}
                </h3>
                <p className="text-neutral-600 text-xs sm:text-sm font-mono mt-2 leading-relaxed">
                  {srv.desc[currentLang]}
                </p>
              </div>

              {/* Deliverables / Features Checklist */}
              <div className="md:col-span-7 bg-neutral-50/80 border border-black/10 p-3 sm:p-4 rounded-sm">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400 block mb-2">
                  {currentLang === 'ar' ? 'المخرجات الرئيسية' : currentLang === 'fr' ? 'LIVRABLES CLÉS' : 'KEY DELIVERABLES'}
                </span>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono text-neutral-800">
                  {meta.deliverables[currentLang].map((item, dIdx) => (
                    <li key={dIdx} className="flex items-start gap-1.5">
                      <span className="text-red-600 font-bold shrink-0">✔</span>
                      <span className="leading-snug">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Card Footer Action Bar */}
          <div className="pt-4 mt-4 border-t-2 border-black/10 flex items-center justify-between text-xs font-mono">
            <span className="text-neutral-500 hidden sm:inline-block">
              {currentLang === 'ar'
                ? 'جاهز للتنفيذ بجودة استثنائية'
                : currentLang === 'fr'
                ? 'Disponible pour mission freelance ou contrat'
                : 'Available for freelance sprint or monthly retainer'}
            </span>
            <button
              onClick={onOpenContact}
              className="px-4 py-2 font-mono text-xs font-bold uppercase text-white transition-all shadow-[2px_2px_0px_#000000] hover:translate-x-0.5 hover:translate-y-0.5 active:translate-x-1 active:translate-y-1 ml-auto"
              style={{ backgroundColor: meta.accentColor }}
            >
              {currentLang === 'ar' ? 'اطلب الخدمة الآن ←' : currentLang === 'fr' ? 'Réserver ce service →' : 'Inquire for Service →'}
            </button>
          </div>
        </ScrollStackItem>
      );
    });
  };

  return (
    <section className="py-10 sm:py-16 md:py-20 px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-visible" id="services">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-6 mb-8 sm:mb-10 pb-4 sm:pb-6 border-b-2 border-black/80">
        <div>
          <div className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-mono font-bold uppercase tracking-wider text-red-600 mb-1">
            <span className="w-2 h-2 bg-red-600 rounded-xs shrink-0 animate-pulse" />
            <span>CORE CAPABILITIES</span>
            <span>·</span>
            <span>REACT BITS SCROLLSTACK</span>
          </div>
          <h2 className="font-display font-black text-3xl sm:text-4xl md:text-6xl tracking-tighter text-black uppercase break-words">
            {t.whatIOffer}
          </h2>
          <p className="font-mono text-xs sm:text-sm text-neutral-600 max-w-xl mt-1">
            {currentLang === 'ar'
              ? 'تصفح الخدمات الـ 5 بأسلوب بطاقات الـ Scroll Stack التفاعلية، كل بطاقة تثبت وتتراكم بسلاسة أثناء التمرير.'
              : currentLang === 'fr'
              ? 'Parcourez les 5 expertises grâce aux cartes Scroll Stack de React Bits qui s’empilent avec inertie et perspective.'
              : 'Explore the 5 core creative capabilities with React Bits ScrollStack cards that pile, tilt, and dim seamlessly as you scroll.'}
          </p>
        </div>

        {/* Action Controls & Mode Switcher */}
        <div className="flex flex-wrap items-center gap-2 self-start md:self-end">
          {/* View Mode Toggle: Page Scroll vs Contained 600px Deck */}
          <div className="inline-flex items-center bg-white border border-black/20 p-1 text-[11px] font-mono">
            <button
              onClick={() => setScrollMode('window')}
              className={`px-2.5 py-1 font-bold uppercase transition-colors cursor-pointer ${
                scrollMode === 'window'
                  ? 'bg-black text-white'
                  : 'text-neutral-600 hover:text-black'
              }`}
            >
              {currentLang === 'ar' ? 'تراكم مع الصفحة' : 'Page Scroll Stack'}
            </button>
            <button
              onClick={() => setScrollMode('contained')}
              className={`px-2.5 py-1 font-bold uppercase transition-colors cursor-pointer ${
                scrollMode === 'contained'
                  ? 'bg-black text-white'
                  : 'text-neutral-600 hover:text-black'
              }`}
            >
              {currentLang === 'ar' ? 'نافذة تفاعلية (600px)' : 'Deck Box (600px)'}
            </button>
          </div>

          <button
            onClick={onOpenContact}
            className="px-4 py-2 bg-black hover:bg-neutral-800 text-white font-mono text-xs font-bold uppercase rounded-none shadow-[3px_3px_0px_#dc2626] active:translate-x-0.5 active:translate-y-0.5 transition-all whitespace-nowrap cursor-pointer"
          >
            {currentLang === 'ar' ? 'طلب استشارة' : currentLang === 'fr' ? 'Réserver un Service' : 'Inquire for Booking'}
          </button>
        </div>
      </div>

      {/* Render ScrollStack based on selected mode */}
      {scrollMode === 'window' ? (
        /* Window Scroll Mode: Cards pin and stack as the user scrolls down the page */
        <div className="relative w-full">
          <ScrollStack
            useWindowScroll={true}
            itemDistance={110}
            itemStackDistance={24}
            stackPosition="16%"
            itemScale={0.04}
            baseScale={0.82}
            dimAmount={0.12}
            tiltAmount={2}
            rotationAmount={1}
            holdDistance={260}
            smoothScroll={true}
            snap={false}
          >
            {renderServiceCards()}
          </ScrollStack>
        </div>
      ) : (
        /* Contained Mode: Interactive 600px Deck Box directly as in React Bits example */
        <div className="relative w-full h-[620px] rounded-lg overflow-hidden border-2 border-black bg-neutral-100 shadow-[6px_6px_0px_#000000]">
          <div className="px-4 py-2 bg-neutral-900 text-white text-[11px] font-mono font-bold flex items-center justify-between border-b-2 border-black">
            <span className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" />
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 inline-block" />
              <span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block" />
              <span className="ml-2 uppercase tracking-wider">SCROLLSTACK DECK · SCROLL INSIDE TO STACK</span>
            </span>
            <span className="text-neutral-400">5 CARDS PILED</span>
          </div>
          <div className="h-[570px] p-2 sm:p-4">
            <ScrollStack
              useWindowScroll={false}
              itemDistance={90}
              itemStackDistance={22}
              stackPosition="12%"
              itemScale={0.04}
              baseScale={0.84}
              dimAmount={0.15}
              tiltAmount={2}
              rotationAmount={1}
              holdDistance={180}
              smoothScroll={true}
              snap={false}
            >
              {renderServiceCards()}
            </ScrollStack>
          </div>
        </div>
      )}
    </section>
  );
};
