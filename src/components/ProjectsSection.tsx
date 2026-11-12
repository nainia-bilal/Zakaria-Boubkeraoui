import React, { useState, useMemo } from 'react';
import { PROJECTS, TRANSLATIONS } from '../data/portfolioData';
import { type ProjectItem } from '../utils/portfolioLogic';
import { CinemaScreenPlayer } from './CinemaScreenPlayer';
import { DarkroomPhotoViewer } from './DarkroomPhotoViewer';
import { DepthCarousel } from './DepthCarousel';

interface ProjectsSectionProps {
  currentLang: 'en' | 'fr' | 'ar';
  onSelectProject: (p: ProjectItem) => void;
}

export const ProjectsSection: React.FC<ProjectsSectionProps> = ({
  currentLang,
  onSelectProject,
}) => {
  const t = TRANSLATIONS[currentLang];

  // Primary categories: 'video' (with DepthCarousel), 'photo', and 'all' (Design removed per user request)
  const [activeCategory, setActiveCategory] = useState<'video' | 'photo' | 'all'>('video');

  // 8 Video projects with real MP4s uploaded and formatted
  const videoProjects = useMemo(() => {
    return PROJECTS.filter((p) => p.category === 'video').slice(0, 8);
  }, []);

  // Photo projects (3)
  const photoProjects = useMemo(() => {
    return PROJECTS.filter((p) => p.category === 'photo').slice(0, 3);
  }, []);

  // Active showcase items for the live in-portfolio viewports
  const [activeCinemaVideo, setActiveCinemaVideo] = useState<ProjectItem>(videoProjects[0]);
  const [activeDarkroomPhoto, setActiveDarkroomPhoto] = useState<ProjectItem>(photoProjects[0]);

  // Google Drive archive links
  const driveVaultInfo = {
    video: {
      badge: currentLang === 'ar' ? 'أرشيف درايف للفيديو (25+ فيديو)' : currentLang === 'fr' ? 'ARCHIVE DRIVE VIDÉO (25+ VIDÉOS)' : 'GOOGLE DRIVE VIDEO ARCHIVE (25+ REELS)',
      title: currentLang === 'ar' ? 'مكتبة الفيديوهات والريلز الكاملة على Google Drive' : currentLang === 'fr' ? 'Archive Complète de Vidéos & Reels 4K' : 'Full Video Vault & 4K Reels Archive',
      desc: currentLang === 'ar'
        ? 'أكثر من 25 فيديو قصير، ريلز سينمائية، إعلانات تجارية، وملفات مونتاج خام بدقة 4K في مجلد درايف.'
        : currentLang === 'fr'
        ? 'Plus de 25 reels, timelines de montage RAW et spots publicitaires stockés en 4K sur Google Drive.'
        : 'Over 25+ short-form reels, commercial spots, high-energy cuts, and RAW editing timelines stored in 4K.',
      count: '25+ Videos',
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

  const handlePhotoCardClick = (project: ProjectItem) => {
    setActiveDarkroomPhoto(project);
    const elem = document.getElementById('photo-screen');
    if (elem) elem.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const categories = [
    { key: 'video' as const, label: currentLang === 'ar' ? '1. مونتاج الفيديو (8 ريلز)' : currentLang === 'fr' ? '1. Vidéos (8 Reels)' : '1. Videos (8 Reels)', count: 8 },
    { key: 'photo' as const, label: currentLang === 'ar' ? '2. التصوير الفوتوغرافي' : currentLang === 'fr' ? '2. Photographie' : '2. Photography', count: 3 },
    { key: 'all' as const, label: currentLang === 'ar' ? 'عرض الكل' : currentLang === 'fr' ? 'Tous' : 'View All', count: 11 },
  ];

  const activeIndex = videoProjects.findIndex((v) => v.id === activeCinemaVideo.id);

  return (
    <section className="py-10 sm:py-16 md:py-20 px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden select-none" id="projects">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-6 mb-8 sm:mb-10 pb-4 sm:pb-6 border-b-2 border-black/80">
        <div>
          <div className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-mono font-bold uppercase tracking-wider text-red-600 mb-1">
            <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
            <span>SELECTED WORK · 8 REAL VIDEO REELS</span>
            <span>·</span>
            <span>REACT BITS DEPTH CAROUSEL</span>
          </div>
          <h2 className="font-display font-black text-3xl sm:text-4xl md:text-6xl tracking-tighter text-black uppercase break-words">
            {t.selectedWork}
          </h2>
          <p className="font-mono text-xs sm:text-sm text-neutral-600 max-w-2xl mt-1">
            {currentLang === 'ar'
              ? 'تصفح فيديوهات المونتاج الحقيقية الثمانية عبر بطاقات 3D DepthCarousel التفاعلية مع شاشة السينما المباشرة ورابط مجلد Drive للأرشيف الكامل.'
              : currentLang === 'fr'
              ? 'Explorez 8 reels de montage réels via les cartes 3D DepthCarousel de React Bits, avec lecture directe sur l’écran de cinéma et accès Google Drive.'
              : 'Browse 8 real editing reels via React Bits 3D DepthCarousel cards with live Cinema Screen playback and full Google Drive vault archive.'}
          </p>
        </div>

        {/* Categories Switcher Tabs (Design removed per user instruction) */}
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

      {/* 1. VIDEOS CATEGORY (DepthCarousel + Cinema Screen + Drive Vault) */}
      {(activeCategory === 'video' || activeCategory === 'all') && (
        <div className="mb-14 sm:mb-16">
          {/* Subheader */}
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pb-2 border-b border-black/20">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-red-600 text-white text-[10px] font-mono font-bold uppercase">
                CATEGORY 01 · 8 REELS
              </span>
              <h3 className="font-display font-black text-xl sm:text-2xl text-black uppercase">
                {currentLang === 'ar' ? 'فيديوهات المونتاج و بطاقات 3D Depth Carousel' : currentLang === 'fr' ? 'Montage Vidéo & Cartes 3D Depth Carousel' : 'Video Editing & 3D Depth Carousel'}
              </h3>
            </div>
            <span className="text-xs font-mono text-neutral-600 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-600 animate-ping inline-block" />
              <span>{currentLang === 'ar' ? 'اسحب الكروت أو اضغط للمشاهدة على الشاشة' : 'Drag cards or click to play on Cinema Screen'}</span>
            </span>
          </div>

          {/* In-Portfolio Cinema Screen Viewport */}
          <CinemaScreenPlayer
            currentVideo={activeCinemaVideo}
            videoList={videoProjects}
            onSelectVideo={(vid) => setActiveCinemaVideo(vid)}
            currentLang={currentLang}
          />

          {/* React Bits <DepthCarousel /> Component Section */}
          <div className="bg-[#07080b] border-2 sm:border-3 border-black text-white p-4 sm:p-6 mb-8 rounded-xs shadow-[6px_6px_0px_#000] relative overflow-hidden">
            {/* Top Bar inside DepthCarousel Container */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 mb-4 border-b border-white/15 text-[11px] font-mono">
              <div className="flex items-center gap-2">
                <span className="text-red-500 font-bold uppercase tracking-wider">
                  ✦ REACT BITS &lt;DEPTH CAROUSEL /&gt;
                </span>
                <span className="text-neutral-500">|</span>
                <span className="text-neutral-300">
                  {videoProjects.length} {currentLang === 'ar' ? 'كروت فيديو ثلاثية الأبعاد' : '3D Video Cards'}
                </span>
              </div>
              <div className="flex items-center gap-2 text-neutral-400 text-[10px]">
                <span className="px-2 py-0.5 bg-white/10 rounded-xs">DRAG ↔ MOUSE / TOUCH</span>
                <span className="hidden sm:inline px-2 py-0.5 bg-white/10 rounded-xs">SCROLL WHEEL</span>
                <span className="px-2 py-0.5 bg-red-600/30 text-red-300 border border-red-500/40 rounded-xs font-bold">
                  ACTIVE: #{activeIndex >= 0 ? activeIndex + 1 : 1}
                </span>
              </div>
            </div>

            {/* DepthCarousel Mount */}
            <div className="w-full relative py-2 sm:py-4" style={{ height: '560px' }}>
              <DepthCarousel
                items={videoProjects}
                cardWidth={310}
                cardHeight={470}
                depth={230}
                spread={95}
                tilt={22}
                tiltDirection="right"
                perspective={1400}
                visibleCards={4}
                falloff={0.2}
                blur={6}
                loop={true}
                showControls={true}
                showIndicators={true}
                activeIndex={activeIndex >= 0 ? activeIndex : 0}
                onCardSelect={(item) => handleVideoCardClick(item as unknown as ProjectItem)}
                onChange={(idx) => {
                  const targetVideo = videoProjects[idx];
                  if (targetVideo && targetVideo.id !== activeCinemaVideo.id) {
                    setActiveCinemaVideo(targetVideo);
                  }
                }}
              />
            </div>

            {/* Active Video Title & Quick Actions Row under carousel */}
            <div className="mt-4 pt-3 border-t border-white/15 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono">
              <div className="flex items-center gap-2.5 truncate max-w-full">
                <span className="px-2 py-0.5 bg-red-600 text-white font-bold rounded-xs shrink-0">
                  REEL 0{activeIndex + 1}
                </span>
                <span className="text-white font-display font-black text-sm uppercase truncate">
                  {activeCinemaVideo.title}
                </span>
                <span className="text-neutral-400 text-[11px] hidden md:inline">
                  ({activeCinemaVideo.duration})
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleVideoCardClick(activeCinemaVideo)}
                  className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 active:scale-95 text-white font-bold rounded-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <span>▶</span>
                  <span>{currentLang === 'ar' ? 'تشغيل الفيديو الآن' : 'Watch on Cinema Screen'}</span>
                </button>
                <a
                  href={activeCinemaVideo.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-neutral-200 hover:text-white rounded-xs transition-colors flex items-center gap-1"
                >
                  <span>Drive</span>
                  <span>↗</span>
                </a>
              </div>
            </div>
          </div>

          {/* Dedicated Google Drive Vault Portal Banner ("wlbaqiiya fii driv") */}
          <div className="relative bg-[#0c0d12] border-2 sm:border-3 border-black text-white p-5 sm:p-6 shadow-[5px_5px_0px_#000] hover:shadow-[7px_7px_0px_#22c55e] transition-all rounded-xs overflow-hidden">
            {/* Washi Tape Accent */}
            <div className="absolute -top-3 right-10 w-28 h-6 bg-[#f59e0b] border border-black/40 transform rotate-2 pointer-events-none opacity-90" />

            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-white/10 border border-white/20 p-2.5 rounded-xs shrink-0 flex items-center justify-center">
                  <img
                    src="/drive.webp"
                    alt="Google Drive Vault"
                    className="w-9 h-9 object-contain"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-mono font-bold uppercase rounded-xs">
                      {driveVaultInfo.video.badge}
                    </span>
                    <span className="text-[11px] font-mono text-neutral-400">
                      · 25+ RAW 4K REELS & TIMELINES
                    </span>
                  </div>
                  <h4 className="font-display font-black text-lg sm:text-xl text-white uppercase tracking-tight">
                    {driveVaultInfo.video.title}
                  </h4>
                  <p className="text-neutral-400 font-mono text-xs max-w-2xl mt-1 leading-relaxed">
                    {driveVaultInfo.video.desc}
                  </p>
                </div>
              </div>

              <a
                href={driveVaultInfo.video.link}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full md:w-auto px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-mono font-black text-xs uppercase rounded-xs transition-all shadow-[3px_3px_0px_#000] active:scale-95 flex items-center justify-center gap-2 text-center shrink-0 cursor-pointer"
              >
                <span>{currentLang === 'ar' ? 'فتح الأرشيف الكامل على Drive' : 'Explore All 25+ Reels on Drive'}</span>
                <span className="text-sm font-bold">↗</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* 2. PHOTO CATEGORY (Photo Darkroom Viewer + 3 Photo Cards + Photo Drive Vault) */}
      {(activeCategory === 'photo' || activeCategory === 'all') && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-black/20">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-cyan-600 text-white text-[10px] font-mono font-bold uppercase">
                CATEGORY 02 · 3 SHOOTS
              </span>
              <h3 className="font-display font-black text-xl sm:text-2xl text-black uppercase">
                {currentLang === 'ar' ? '2. التصوير الفوتوغرافي وغرفة التحميض' : currentLang === 'fr' ? '2. Photographie & Darkroom Retouche' : '2. Photography & Darkroom Studio'}
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-7">
            {photoProjects.map((project, idx) => {
              const isSelected = activeDarkroomPhoto.id === project.id;

              return (
                <div
                  key={project.id}
                  onClick={() => handlePhotoCardClick(project)}
                  className={`bg-white border-2 border-black shadow-[4px_4px_0px_#000] hover:shadow-[7px_7px_0px_#06b6d4] transition-all duration-200 flex flex-col group cursor-pointer relative ${
                    isSelected ? 'ring-2 ring-cyan-500' : ''
                  }`}
                >
                  <div className="aspect-[16/10] bg-neutral-900 border-b-2 border-black overflow-hidden relative">
                    <img
                      src={project.image}
                      alt={project.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 filter contrast-105"
                    />
                    <div className="absolute top-2 left-2 bg-black text-white text-[10px] font-mono font-bold px-2 py-0.5 uppercase tracking-wider">
                      {`0${idx + 1}`} · {project.categoryLabel}
                    </div>
                    <div className="absolute top-2 right-2 bg-white text-black text-[10px] font-mono font-bold px-2 py-0.5 border border-black">
                      {project.year}
                    </div>
                  </div>

                  <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <h3 className="font-display font-black text-lg text-black uppercase tracking-tight group-hover:text-cyan-600 transition-colors">
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
                      <span className="font-mono text-xs font-bold text-cyan-600 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                        View ✦
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Photo Drive Portal Card */}
            <a
              href={driveVaultInfo.photo.link}
              target="_blank"
              rel="noopener noreferrer"
              className="relative bg-[#0c0d10] border-2 sm:border-3 border-black text-white shadow-[4px_4px_0px_#000] hover:shadow-[7px_7px_0px_#22c55e] p-5 flex flex-col justify-between group transition-all duration-300 rounded-xs overflow-hidden"
              title="Open Google Drive Archive Folder"
            >
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-white/15 mb-4">
                  <span className="text-[10px] font-mono font-bold text-emerald-400 tracking-wider">
                    {driveVaultInfo.photo.badge}
                  </span>
                  <span className="px-2 py-0.5 bg-emerald-950 text-emerald-400 border border-emerald-500/40 text-[10px] font-mono font-bold rounded-xs">
                    {driveVaultInfo.photo.count}
                  </span>
                </div>

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
                      {driveVaultInfo.photo.title}
                    </h3>
                    <p className="text-neutral-400 font-mono text-[11px] mt-1 leading-snug">
                      {driveVaultInfo.photo.desc}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-white/15 flex items-center justify-between text-xs font-mono font-bold">
                <span className="text-neutral-300 group-hover:text-white transition-colors">
                  {currentLang === 'ar' ? 'فتح مجلد الصور على Drive' : currentLang === 'fr' ? 'Ouvrir sur Drive' : 'Explore on Drive'}
                </span>
                <span className="w-7 h-7 bg-emerald-500 text-black flex items-center justify-center rounded-xs group-hover:translate-x-1 transition-transform">
                  ↗
                </span>
              </div>
            </a>
          </div>
        </div>
      )}
    </section>
  );
};
export default ProjectsSection;
