import React from 'react';
import { TRANSLATIONS } from '../data/portfolioData';

interface ResumeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLang: 'en' | 'fr' | 'ar';
}

export const ResumeModal: React.FC<ResumeModalProps> = ({ isOpen, onClose, currentLang }) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative max-w-4xl w-full bg-white border-4 border-black p-6 sm:p-10 shadow-[10px_10px_0px_#000] my-8 rounded-none text-black print:border-none print:shadow-none print:m-0"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Controls */}
        <div className="flex items-center justify-between pb-6 border-b-2 border-black mb-8 print:hidden">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-red-600 rounded-full border border-black"></span>
            <span className="font-mono text-xs uppercase tracking-wider font-bold">
              CURRICULUM VITAE // 2026
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-black text-white hover:bg-neutral-800 font-mono text-xs font-bold uppercase flex items-center gap-1.5 transition-colors"
            >
              <span>🖨️</span>
              <span>{currentLang === 'ar' ? 'طباعة / حفظ PDF' : 'Print / Save PDF'}</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 bg-neutral-200 text-black flex items-center justify-center font-mono font-bold hover:bg-red-600 hover:text-white transition-colors"
              aria-label="Close CV modal"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Resume Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-8 border-b-2 border-black">
          <div>
            <h1 className="font-display font-black text-3xl sm:text-4xl uppercase tracking-tight text-black">
              Zakaria Boubkeraoui
            </h1>
            <p className="font-mono text-sm sm:text-base text-red-600 font-bold mt-1 uppercase">
              Junior Digital Marketer & Content Creator
            </p>
            <p className="text-xs font-mono text-neutral-600 mt-1">
              Casablanca, Morocco · Available for Remote & Freelance
            </p>
          </div>

          <div className="text-right sm:text-right font-mono text-xs space-y-1 text-neutral-700">
            <div>Email: zaki200615@gmail.com</div>
            <div>Instagram: @_d_zekoo</div>
            <div>LinkedIn: /in/zakaria-boubkeraoui</div>
          </div>
        </div>

        {/* Resume Body */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 py-8">
          {/* Main Column */}
          <div className="md:col-span-8 space-y-8">
            {/* Professional Summary */}
            <div>
              <h2 className="font-display font-black text-lg uppercase tracking-tight text-black border-b border-black pb-1 mb-3">
                {currentLang === 'ar' ? 'الملخص المهني' : currentLang === 'fr' ? 'Profil Professionnel' : 'Professional Profile'}
              </h2>
              <p className="text-sm text-neutral-700 leading-relaxed">
                Junior Digital Marketer and Content Creator passionate about visual storytelling, video editing, and creative content strategy. Skilled in high-energy mobile video production (CapCut, InShot), graphic design (Canva, PicsArt), and digital marketing campaigns tailored to lifestyle and creator brands.
              </p>
            </div>

            {/* Experience */}
            <div>
              <h2 className="font-display font-black text-lg uppercase tracking-tight text-black border-b border-black pb-1 mb-4">
                {currentLang === 'ar' ? 'الخبرة المهنية' : currentLang === 'fr' ? 'Expérience Professionnelle' : 'Professional Experience'}
              </h2>

              <div className="space-y-5">
                <div>
                  <div className="flex items-baseline justify-between">
                    <h3 className="font-display font-bold text-base text-black">
                      Freelance Content Creator & Marketer
                    </h3>
                    <span className="font-mono text-xs font-bold text-neutral-500">2023 - Present</span>
                  </div>
                  <p className="text-xs font-mono text-neutral-600">Self-Employed · Remote</p>
                  <ul className="list-disc list-inside text-xs text-neutral-700 mt-2 space-y-1">
                    <li>Delivered 30+ completed visual projects for fitness, apparel, and lifestyle creators.</li>
                    <li>Designed cohesive personal brand packages, including typography, colors, and templates.</li>
                    <li>Produced high-retention short-form video reels for Instagram, TikTok, and YouTube.</li>
                  </ul>
                </div>

                <div>
                  <div className="flex items-baseline justify-between">
                    <h3 className="font-display font-bold text-base text-black">
                      Video Editor & Social Media Strategist
                    </h3>
                    <span className="font-mono text-xs font-bold text-neutral-500">2024</span>
                  </div>
                  <p className="text-xs font-mono text-neutral-600">Creator Partnerships</p>
                  <ul className="list-disc list-inside text-xs text-neutral-700 mt-2 space-y-1">
                    <li>Directed color grading, audio synchronization, and motion graphics for workout reels.</li>
                    <li>Formulated viral hook strategies improving average video completion rate.</li>
                  </ul>
                </div>

                <div>
                  <div className="flex items-baseline justify-between">
                    <h3 className="font-display font-bold text-base text-black">
                      Brand Identity & Presentation Designer
                    </h3>
                    <span className="font-mono text-xs font-bold text-neutral-500">2023 - 2024</span>
                  </div>
                  <p className="text-xs font-mono text-neutral-600">Independent Decks & Media</p>
                  <ul className="list-disc list-inside text-xs text-neutral-700 mt-2 space-y-1">
                    <li>Crafted investor pitch presentations and brand proposals with clear narrative flow.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Column */}
          <div className="md:col-span-4 space-y-8">
            {/* Education */}
            <div>
              <h2 className="font-display font-black text-lg uppercase tracking-tight text-black border-b border-black pb-1 mb-3">
                {currentLang === 'ar' ? 'التعليم والتكوين' : currentLang === 'fr' ? 'Formation' : 'Education'}
              </h2>
              <div>
                <h3 className="font-display font-bold text-sm text-black">
                  Digital Marketing & Communication
                </h3>
                <p className="text-xs font-mono text-neutral-600">Higher Institute Studies</p>
                <p className="text-xs font-mono text-neutral-500">2023 - 2026</p>
              </div>
            </div>

            {/* Core Tools */}
            <div>
              <h2 className="font-display font-black text-lg uppercase tracking-tight text-black border-b border-black pb-1 mb-3">
                {currentLang === 'ar' ? 'الأدوات والبرامج' : currentLang === 'fr' ? 'Logiciels Maîtrisés' : 'Tools & Software'}
              </h2>
              <div className="space-y-1.5 font-mono text-xs">
                <div className="flex justify-between"><span>CapCut</span><span className="font-bold">92%</span></div>
                <div className="flex justify-between"><span>Canva</span><span className="font-bold">90%</span></div>
                <div className="flex justify-between"><span>InShot</span><span className="font-bold">88%</span></div>
                <div className="flex justify-between"><span>PicsArt</span><span className="font-bold">84%</span></div>
                <div className="flex justify-between"><span>Meitu</span><span className="font-bold">82%</span></div>
                <div className="flex justify-between"><span>Photoshop / Pr</span><span className="font-bold">80%</span></div>
              </div>
            </div>

            {/* Languages */}
            <div>
              <h2 className="font-display font-black text-lg uppercase tracking-tight text-black border-b border-black pb-1 mb-3">
                {currentLang === 'ar' ? 'اللغات' : currentLang === 'fr' ? 'Langues' : 'Languages'}
              </h2>
              <ul className="font-mono text-xs space-y-1 text-neutral-700">
                <li>Arabic — Native</li>
                <li>French — Professional Proficiency</li>
                <li>English — Professional Working</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
