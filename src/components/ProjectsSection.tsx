import React, { useState, useMemo } from 'react';
import { PROJECTS, TRANSLATIONS } from '../data/portfolioData';
import { type ProjectItem } from '../utils/portfolioLogic';
import { CinemaScreenPlayer } from './CinemaScreenPlayer';
import { DesignStudioViewer } from './DesignStudioViewer';
import { DarkroomPhotoViewer } from './DarkroomPhotoViewer';

interface ProjectsSectionProps {
  currentLang: 'en' | 'fr' | 'ar';
  onSelectProject: (p: ProjectItem) => void;
}

export const ProjectsSection: React.FC<ProjectsSectionProps> = ({
  currentLang,
  onSelectProject,
}) => {
  const t = TRANSLATIONS[currentLang];

  // 3 Primary categories as explicitly requested
  const [activeCategory, setActiveCategory] = useState<'video' | 'design' | 'photo' | 'all'>('video');

  // Video projects (3)
  const videoProjects = useMemo(() => {
    return PROJECTS.filter((p) => p.category === 'video').slice(0, 3);
  }, []);

  // Design projects (3)
  const designProjects = useMemo(() => {
    return PROJECTS.filter((p) => p.category === 'design').slice(0, 3);
  }, []);

  // Photo projects (3)
  const photoProjects = useMemo(() => {
    return PROJECTS.filter((p) => p.category === 'photo').slice(0, 3);
  }, []);

  // Active showcase items for the 3 live in-portfolio viewports
  const [activeCinemaVideo, setActiveCinemaVideo] = useState<ProjectItem>(videoProjects[0]);
  const [activeStudioDesign, setActiveStudioDesign] = useState<ProjectItem>(designProjects[0]);
  const [activeDarkroomPhoto, setActiveDarkroomPhoto] = useState<ProjectItem>(photoProjects[0]);

  // Google Drive archive card configuration per category
  const driveVaultInfo = {
    video: {
      badge: currentLang === 'ar' ? 'أرشيف درايف للفيديو' : currentLang === 'fr' ? 'ARCHIVE DRIVE VIDÉO' : 'GOOGLE DRIVE VIDEO ARCHIVE',
      title: currentLang === 'ar' ? 'مكتبة الفيديوهات والريلز الكاملة' : currentLang === 'fr' ? 'Tous les Reels & Vidéos' : 'Full Video Vault & Reels',
      desc: currentLang === 'ar' ? 'أكثر من 25 فيديو قصير، ريلز سينمائية، وملفات العمل بدقة 4K جاهزة للمشاهدة.' : currentLang === 'fr' ? 'Plus de 25 reels, cuts dynamiques et vidéos publicitaires en 4K sur Google Drive.' : 'Over 25+ short-form reels, high-energy edits, and RAW timelines stored in 4K.',
      count: '25+ Videos',
      link: 'https://drive.google.com/drive/folders/15x_vZ97LLGQ1aJeQYS8_ejOTzOalYXNe',
    },
    design: {
      badge: currentLang === 'ar' ? 'أرشيف درايف للتصميم' : currentLang === 'fr' ? 'ARCHIVE DRIVE DESIGN' : 'GOOGLE DRIVE DESIGN ARCHIVE',
      title: currentLang === 'ar' ? 'مكتبة تصاميم الهوية والكاروسيل' : currentLang === 'fr' ? 'Tous les Designs & Brand Kits' : 'Full Design & Brand Vault',
      desc: currentLang === 'ar' ? 'أكثر من 30 هوية بصرية، قوالب سوشيال ميديا، وعروض تقديمية قابلة للتعديل.' : currentLang === 'fr' ? 'Plus de 30 chartes graphiques, carrousels et pitch decks professionnels.' : 'Over 30+ brand kits, pitch decks, carousels, and vector assets in full resolution.',
      count: '30+ Designs',
      link: 'https://drive.google.com/drive/folders/15x_vZ97LLGQ1aJeQYS8_ejOTzOalYXNe',
    },
    photo: {
      badge: currentLang === 'ar' ? 'أرشيف درايف للصور' : currentLang === 'fr' ? 'ARCHIVE DRIVE PHOTO' : 'GOOGLE DRIVE PHOTO ARCHIVE',
      title: currentLang === 'ar' ? 'مكتبة الصور وجلسات التصوير' : currentLang === 'fr' ? 'Toutes les Photos & Retouches' : 'Full Photo & Retouch Vault',
      desc: currentLang === 'ar' ? 'أكثر من 50 صورة احترافية عالية الدقة، تصحيح ألوان سينمائي، وجلسات تصوير كاملة.' : currentLang === 'fr' ? 'Plus de 50 photographies éditoriales, étalonnages RAW et shootings complets.' : 'Over 50+ editorial photos, color graded RAW captures, and streetwear shoots.',
      count: '50+ Photos',
      link: 'https://drive.google.com/drive/folders/15x_vZ97LLGQ1aJeQYS8_ejOTzOalYXNe',
    },
  };

  const handleVideoCardClick = (project: ProjectItem) => {
    setActiveCinemaVideo(project);
    const elem = document.getElementById('cinema-screen');
    if (elem) elem.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const handleDesignCardClick = (project: ProjectItem) => {
    setActiveStudioDesign(project);
    const elem = document.getElementById('design-screen');
    if (elem) elem.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const handlePhotoCardClick = (project: ProjectItem) => {
    setActiveDarkroomPhoto(project);
    const elem = document.getElementById('photo-screen');
    if (elem) elem.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const categories = [
    { key: 'video' as const, label: currentLang === 'ar' ? '1. الفيديوهات' : currentLang === 'fr' ? '1. Vidéos' : '1. Videos', count: 3 },
    { key: 'design' as const, label: currentLang === 'ar' ? '2. التصميم' : currentLang === 'fr' ? '2. Design' : '2. Design', count: 3 },
    { key: 'photo' as const, label: currentLang === 'ar' ? '3. التصوير' : currentLang === 'fr' ? '3. Photo' : '3. Photo', count: 3 },
    { key: 'all' as const, label: currentLang === 'ar' ? 'عرض الكل' : currentLang === 'fr' ? 'Tous' : 'View All', count: 9 },
  ];

  // Helper to render 3 project cards + 1 drive card
  const renderCategoryGrid = (
    catKey: 'video' | 'design' | 'photo',
    projects: ProjectItem[]
  ) => {
    const driveInfo = driveVaultInfo[catKey];

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-7">
        {/* 3 Project Cards */}
        {projects.map((project, idx) => {
          const isSelected =
            (catKey === 'video' && activeCinemaVideo.id === project.id) ||
            (catKey === 'design' && activeStudioDesign.id === project.id) ||
            (catKey === 'photo' && activeDarkroomPhoto.id === project.id);

          const ringClass =
            catKey === 'video'
              ? 'ring-2 ring-red-600'
              : catKey === 'design'
              ? 'ring-2 ring-amber-500'
              : 'ring-2 ring-cyan-500';

          const hoverShadow =
            catKey === 'video'
              ? 'hover:shadow-[7px_7px_0px_#dc2626]'
              : catKey === 'design'
              ? 'hover:shadow-[7px_7px_0px_#f59e0b]'
              : 'hover:shadow-[7px_7px_0px_#06b6d4]';

          return (
            <div
              key={project.id}
              onClick={() => {
                if (catKey === 'video') {
                  handleVideoCardClick(project);
                } else if (catKey === 'design') {
                  handleDesignCardClick(project);
                } else {
                  handlePhotoCardClick(project);
                }
              }}
              className={`bg-white border-2 border-black shadow-[4px_4px_0px_#000] ${hoverShadow} transition-all duration-200 flex flex-col group cursor-pointer relative ${
                isSelected ? ringClass : ''
              }`}
            >
              {/* Card Thumbnail */}
              <div className="aspect-[16/10] bg-neutral-900 border-b-2 border-black overflow-hidden relative">
                <img
                  src={project.image}
                  alt={project.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 filter contrast-105"
                />

                {/* Tag Header */}
                <div className="absolute top-2 left-2 bg-black text-white text-[10px] font-mono font-bold px-2 py-0.5 uppercase tracking-wider">
                  {`0${idx + 1}`} · {project.categoryLabel}
                </div>

                {/* Year or Video Duration */}
                <div className="absolute top-2 right-2 bg-white text-black text-[10px] font-mono font-bold px-2 py-0.5 border border-black flex items-center gap-1">
                  {catKey === 'video' ? (
                    <>
                      <span className="text-red-600 font-bold">▶</span>
                      <span>{project.duration || '0:15'}</span>
                    </>
                  ) : (
                    <span>{project.year}</span>
                  )}
                </div>

                {/* Interactive Live Screen Cue Overlay on Card */}
                <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span
                    className={`text-white text-xs font-mono font-bold px-3 py-1 border border-white flex items-center gap-1.5 shadow-lg ${
                      catKey === 'video'
                        ? 'bg-red-600'
                        : catKey === 'design'
                        ? 'bg-amber-600'
                        : 'bg-cyan-600'
                    }`}
                  >
                    <span>
                      {catKey === 'video'
                        ? 'PLAY IN CINEMA'
                        : catKey === 'design'
                        ? 'INSPECT ARTBOARD'
                        : 'OPEN IN DARKROOM'}
                    </span>
                    <span>{catKey === 'video' ? '▶' : catKey === 'design' ? '🔍' : '✦'}</span>
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h3
                    className={`font-display font-black text-lg text-black uppercase tracking-tight transition-colors ${
                      catKey === 'video'
                        ? 'group-hover:text-red-600'
                        : catKey === 'design'
                        ? 'group-hover:text-amber-600'
                        : 'group-hover:text-cyan-600'
                    }`}
                  >
                    {project.title}
                  </h3>
                  <p className="text-neutral-600 text-xs line-clamp-2 mt-1 leading-relaxed">
                    {project.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-black/10 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[11px] font-mono text-neutral-500 truncate max-w-[150px]">
                    {project.tools.map((tool, tIdx) => (
                      <React.Fragment key={tool}>
                        {tIdx > 0 && <span aria-hidden="true">·</span>}
                        <span>{tool}</span>
                      </React.Fragment>
                    ))}
                  </div>

                  <span
                    className={`font-mono text-xs font-bold group-hover:translate-x-1 transition-transform inline-flex items-center gap-1 shrink-0 ${
                      catKey === 'video'
                        ? 'text-red-600'
                        : catKey === 'design'
                        ? 'text-amber-600'
                        : 'text-cyan-600'
                    }`}
                  >
                    <span>
                      {catKey === 'video'
                        ? 'Watch ▶'
                        : catKey === 'design'
                        ? 'Inspect 🔍'
                        : 'View ✦'}
                    </span>
                  </span>
                </div>
              </div>
            </div>
          );
        })}

        {/* 4th Card: Dedicated Google Drive Vault Portal Card ("w hdahom rabea katdik l drive") */}
        <a
          href={driveInfo.link}
          target="_blank"
          rel="noopener noreferrer"
          className="relative bg-[#0c0d10] border-2 sm:border-3 border-black text-white shadow-[4px_4px_0px_#000] hover:shadow-[7px_7px_0px_#22c55e] p-5 flex flex-col justify-between group transition-all duration-300 rounded-xs overflow-hidden"
          title="Open Google Drive Archive Folder"
        >
          {/* Subtle Decorative Yellow Washi Tape on Top */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-24 h-6 bg-[#f59e0b]/90 border border-black/30 transform -rotate-1 shadow-xs pointer-events-none" />

          {/* Drive Badge & Icon Row */}
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-white/15 mb-4">
              <span className="text-[10px] font-mono font-bold text-emerald-400 tracking-wider">
                {driveInfo.badge}
              </span>
              <span className="px-2 py-0.5 bg-emerald-950 text-emerald-400 border border-emerald-500/40 text-[10px] font-mono font-bold rounded-xs">
                {driveInfo.count}
              </span>
            </div>

            {/* Google Drive Logo & Title */}
            <div className="flex items-start gap-3 my-2">
              <div className="w-12 h-12 bg-white/10 border border-white/20 p-2 rounded-xs shrink-0 flex items-center justify-center group-hover:scale-110 transition-transform">
                <img
                  src="/drive.webp"
                  alt="Google Drive"
                  className="w-8 h-8 object-contain"
                />
              </div>

              <div>
                <h3 className="font-display font-black text-base sm:text-lg text-white uppercase group-hover:text-emerald-400 transition-colors">
                  {driveInfo.title}
                </h3>
                <p className="text-neutral-400 font-mono text-[11px] mt-1 leading-snug">
                  {driveInfo.desc}
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Drive CTA */}
          <div className="mt-5 pt-3 border-t border-white/15 flex items-center justify-between text-xs font-mono font-bold">
            <span className="text-neutral-300 group-hover:text-white transition-colors">
              {currentLang === 'ar' ? 'فتح مجلد Drive' : currentLang === 'fr' ? 'Ouvrir sur Drive' : 'Explore on Drive'}
            </span>
            <span className="w-7 h-7 bg-emerald-500 text-black flex items-center justify-center rounded-xs group-hover:translate-x-1 transition-transform">
              ↗
            </span>
          </div>
        </a>
      </div>
    );
  };

  return (
    <section className="py-10 sm:py-16 md:py-20 px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden select-none" id="projects">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-6 mb-8 sm:mb-10 pb-4 sm:pb-6 border-b-2 border-black/80">
        <div>
          <div className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-mono font-bold uppercase tracking-wider text-red-600 mb-1">
            <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
            <span>SELECTED WORK · 3 CATEGORIES</span>
            <span>·</span>
            <span>3 IN-PORTFOLIO LIVE VIEWPORTS</span>
          </div>
          <h2 className="font-display font-black text-3xl sm:text-4xl md:text-6xl tracking-tighter text-black uppercase break-words">
            {t.selectedWork}
          </h2>
          <p className="font-mono text-xs sm:text-sm text-neutral-600 max-w-xl mt-1">
            {currentLang === 'ar'
              ? 'تصفح الفئات الثلاث مع شاشات العرض المباشرة: شاشة السينما للفيديوهات، استوديو التصميم والهوية، وغرفة التحميض للصور الفوتوغرافية، مع بطاقة درايف لكل فئة.'
              : currentLang === 'fr'
              ? 'Trois catégories avec écrans de visualisation directs : Écran Cinéma pour les vidéos, Studio Design pour l’identité, et Darkroom pour la photographie, chacun avec son accès Drive.'
              : 'Three distinct categories with live in-portfolio interactive viewports: Cinema Screen for Videos, Design Studio for Branding, and Darkroom for Photography.'}
          </p>
        </div>

        {/* 3 Categories Switcher Tabs */}
        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          {categories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 text-[11px] sm:text-xs font-mono uppercase font-bold border transition-all cursor-pointer ${
                activeCategory === cat.key
                  ? 'bg-black text-white border-black shadow-[3px_3px_0px_#dc2626]'
                  : 'bg-white text-neutral-700 border-black/20 hover:border-black'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* 1. VIDEOS CATEGORY (Features Cinema Screen + 3 Cards + 1 Drive Card) */}
      {(activeCategory === 'video' || activeCategory === 'all') && (
        <div className="mb-14 sm:mb-16">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-black/20">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-red-600 text-white text-[10px] font-mono font-bold uppercase">
                CATEGORY 01
              </span>
              <h3 className="font-display font-black text-xl sm:text-2xl text-black uppercase">
                {currentLang === 'ar' ? '1. مونتاج الفيديو والشاشة السينمائية' : currentLang === 'fr' ? '1. Vidéos & Écran de Cinéma' : '1. Videos & Cinema Screen'}
              </h3>
            </div>
            <span className="text-xs font-mono text-neutral-500">
              {currentLang === 'ar' ? 'اضغط على أي فيديو لمشاهدته مباشرة' : 'Click any video to play directly below'}
            </span>
          </div>

          {/* Dedicated Cinema Screen Viewport for In-Portfolio Video Watching */}
          <CinemaScreenPlayer
            currentVideo={activeCinemaVideo}
            videoList={videoProjects}
            onSelectVideo={(vid) => setActiveCinemaVideo(vid)}
            currentLang={currentLang}
          />

          {/* 3 Video Cards + 4th Drive Portal Card */}
          {renderCategoryGrid('video', videoProjects)}
        </div>
      )}

      {/* 2. DESIGN CATEGORY (Features Live Design Studio Screen + 3 Cards + 1 Drive Card) */}
      {(activeCategory === 'design' || activeCategory === 'all') && (
        <div className="mb-14 sm:mb-16">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-black/20">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-amber-600 text-white text-[10px] font-mono font-bold uppercase">
                CATEGORY 02
              </span>
              <h3 className="font-display font-black text-xl sm:text-2xl text-black uppercase">
                {currentLang === 'ar' ? '2. التصميم الجرافيكي واستوديو الهوية' : currentLang === 'fr' ? '2. Design Graphique & Studio Canvas' : '2. Design & Brand Studio'}
              </h3>
            </div>
            <span className="text-xs font-mono text-neutral-500">
              {currentLang === 'ar' ? 'اضغط على أي تصميم لمعاينته واستخراج ألوانه' : 'Click any design to inspect artboard & colors'}
            </span>
          </div>

          {/* Dedicated Live Design Studio Viewport */}
          <DesignStudioViewer
            currentDesign={activeStudioDesign}
            designList={designProjects}
            onSelectDesign={(des) => setActiveStudioDesign(des)}
            currentLang={currentLang}
          />

          {/* 3 Design Cards + 4th Drive Portal Card */}
          {renderCategoryGrid('design', designProjects)}
        </div>
      )}

      {/* 3. PHOTO CATEGORY (Features Live Darkroom Photo Screen + 3 Cards + 1 Drive Card) */}
      {(activeCategory === 'photo' || activeCategory === 'all') && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-black/20">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-cyan-600 text-white text-[10px] font-mono font-bold uppercase">
                CATEGORY 03
              </span>
              <h3 className="font-display font-black text-xl sm:text-2xl text-black uppercase">
                {currentLang === 'ar' ? '3. التصوير الفوتوغرافي وغرفة التحميض' : currentLang === 'fr' ? '3. Photographie & Darkroom Retouche' : '3. Photography & Darkroom Studio'}
              </h3>
            </div>
            <span className="text-xs font-mono text-neutral-500">
              {currentLang === 'ar' ? 'اضغط على أي صورة لتجربة فلاتر الألوان' : 'Click any photo to simulate color grades & loupe'}
            </span>
          </div>

          {/* Dedicated Live Darkroom Photo Viewport */}
          <DarkroomPhotoViewer
            currentPhoto={activeDarkroomPhoto}
            photoList={photoProjects}
            onSelectPhoto={(pho) => setActiveDarkroomPhoto(pho)}
            currentLang={currentLang}
          />

          {/* 3 Photo Cards + 4th Drive Portal Card */}
          {renderCategoryGrid('photo', photoProjects)}
        </div>
      )}
    </section>
  );
};
