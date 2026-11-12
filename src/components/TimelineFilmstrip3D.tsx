import React, { useState, useRef, useEffect } from 'react';
import { TRANSLATIONS } from '../data/portfolioData';

interface TimelineFilmstrip3DProps {
  currentLang: 'en' | 'fr' | 'ar';
  onSelectProjectById?: (id: string) => void;
}

interface FilmFrame {
  id: string;
  frameNum: string;
  timecode: string;
  title: string;
  category: string;
  image: string;
  tool: string;
  cutType: string;
}

const FILM_FRAMES: FilmFrame[] = [
  {
    id: 'brand-identity-kit',
    frameNum: 'FR_01',
    timecode: '00:00:14:02',
    title: 'Brand Identity Kit',
    category: 'Branding',
    image: '/sel.png',
    tool: 'Canva / PicsArt',
    cutType: 'VECTOR & PALETTE',
  },
  {
    id: 'cinematic-fitness-reel',
    frameNum: 'FR_02',
    timecode: '00:00:28:18',
    title: 'Cinematic Fitness Reel',
    category: 'Video Edit',
    image: '/profil.jpeg',
    tool: 'CapCut / InShot',
    cutType: 'DYNAMIC CUT / 60FPS',
  },
  {
    id: 'social-media-campaign',
    frameNum: 'FR_03',
    timecode: '00:00:46:10',
    title: 'Social Media Campaign',
    category: 'Design',
    image: '/Design1.png',
    tool: 'Canva / Meitu',
    cutType: 'CAROUSEL & REEL',
  },
  {
    id: 'photography-portfolio',
    frameNum: 'FR_04',
    timecode: '00:01:05:04',
    title: 'Photography Portfolio',
    category: 'Photo / Color',
    image: '/Design2.png',
    tool: 'PicsArt / Retouch',
    cutType: 'COLOR GRADE REC.709',
  },
  {
    id: 'lifestyle-content-series',
    frameNum: 'FR_05',
    timecode: '00:01:24:12',
    title: 'Lifestyle Content Series',
    category: 'Video Edit',
    image: '/Design3.png',
    tool: 'CapCut / InShot',
    cutType: 'BEAT SYNC & HOOKS',
  },
  {
    id: 'pitch-deck-design',
    frameNum: 'FR_06',
    timecode: '00:01:42:20',
    title: 'Pitch Deck Design',
    category: 'Presentations',
    image: '/NES.png',
    tool: 'Canva / Keynote',
    cutType: 'DATA NARRATIVE',
  },
  {
    id: 'visual-brand-pitch',
    frameNum: 'FR_07',
    timecode: '00:02:02:08',
    title: 'Visual Brand Pitch',
    category: 'Creator Strategy',
    image: '/zack.png',
    tool: 'Personal Brand',
    cutType: 'CREATOR POSITIONING',
  },
];

export const TimelineFilmstrip3D: React.FC<TimelineFilmstrip3DProps> = ({
  currentLang,
  onSelectProjectById,
}) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');
  const [activeFrame, setActiveFrame] = useState<FilmFrame | null>(null);
  const [tilt, setTilt] = useState({ x: 8, y: -4 });
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const dragStartX = useRef(0);
  const dragStartScrollLeft = useRef(0);
  const hasMovedSignificantly = useRef(false);

  // Duplicated cards for seamless infinite scroll
  const displayedFrames = [...FILM_FRAMES, ...FILM_FRAMES, ...FILM_FRAMES];

  // Auto-scroll loop
  useEffect(() => {
    let animId = 0;
    const scrollTrack = trackRef.current;
    if (!scrollTrack) return;

    // Start in the middle loop section if at 0
    if (scrollTrack.scrollLeft === 0) {
      scrollTrack.scrollLeft = scrollTrack.scrollWidth / 3;
    }

    const step = () => {
      if (isPlaying && !isHovered && !isDragging && scrollTrack) {
        const speed = direction === 'forward' ? 1.2 : -1.2;
        scrollTrack.scrollLeft += speed;

        const maxScroll = (scrollTrack.scrollWidth / 3) * 2;
        const minScroll = scrollTrack.scrollWidth / 3;

        if (scrollTrack.scrollLeft >= maxScroll) {
          scrollTrack.scrollLeft -= minScroll;
        } else if (scrollTrack.scrollLeft <= 5) {
          scrollTrack.scrollLeft += minScroll;
        }
      }
      animId = requestAnimationFrame(step);
    };

    animId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, isHovered, isDragging, direction]);

  // Perspective 3D Tilt handlers
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({
      x: -y * 12 + 6,
      y: x * 14 - 3,
    });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 8, y: -4 });
    setIsHovered(false);
    setIsDragging(false);
  };

  // Manual Drag & Scroll scrub handlers
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!trackRef.current) return;
    setIsDragging(true);
    hasMovedSignificantly.current = false;
    dragStartX.current = e.clientX;
    dragStartScrollLeft.current = trackRef.current.scrollLeft;
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || !trackRef.current) return;
    const deltaX = e.clientX - dragStartX.current;
    if (Math.abs(deltaX) > 6) {
      hasMovedSignificantly.current = true;
    }
    trackRef.current.scrollLeft = dragStartScrollLeft.current - deltaX;
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  // Manual step buttons (Left / Right)
  const handleManualStep = (delta: number) => {
    if (!trackRef.current) return;
    trackRef.current.scrollBy({ left: delta, behavior: 'smooth' });
  };

  return (
    <section
      className="relative py-12 sm:py-16 md:py-20 px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden select-none"
      id="filmstrip-timeline"
    >
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 pb-4 border-b-2 border-black/80">
        <div>
          <div className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-mono font-bold uppercase tracking-wider text-red-600 mb-1">
            <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
            <span>3D EDITING TIMELINE</span>
            <span>·</span>
            <span>
              {currentLang === 'ar'
                ? 'شريط المونتاج 3D التلقائي'
                : currentLang === 'fr'
                ? 'Bande de Montage 3D Auto'
                : 'Auto 3D Filmstrip Timeline'}
            </span>
          </div>
          <h2 className="font-display font-black text-2xl sm:text-4xl md:text-5xl tracking-tighter text-black uppercase break-words">
            {currentLang === 'ar'
              ? 'شريط المونتاج السينمائي 3D'
              : currentLang === 'fr'
              ? 'Timeline de Montage Vidéo 3D'
              : '3D Video Editing Filmstrip'}
          </h2>
          <p className="font-mono text-xs sm:text-sm text-neutral-600 max-w-xl mt-1">
            {currentLang === 'ar'
              ? 'الكروت تدور تلقائياً من اليسار إلى اليمين، مع إمكانية السحب والتحكم الكامل والتوقف عند المشاهدة.'
              : currentLang === 'fr'
              ? 'Défilement automatique fluide de gauche à droite avec contrôle manuel complet (glisser, pause, flèches).'
              : 'Auto-scrolling video cuts passing smoothly with full interactive user scrub, drag, and direction controls.'}
          </p>
        </div>

        {/* Timeline HUD stats & interactive user controls */}
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-end">
          <div className="px-3 py-1 bg-black text-white text-[11px] font-mono rounded-xs flex items-center gap-2">
            <span className="text-red-500 font-bold">REC ●</span>
            <span>00:01:24:12</span>
            <span className="text-neutral-400">·</span>
            <span className="text-emerald-400 font-bold">
              {isPlaying && !isHovered ? 'AUTO' : 'MANUAL'}
            </span>
          </div>

          {/* Direction toggle */}
          <button
            onClick={() => setDirection(direction === 'forward' ? 'backward' : 'forward')}
            className="px-2.5 py-1 bg-white border border-black/20 text-black text-[11px] font-mono font-bold rounded-xs hover:border-black active:scale-95 transition-all"
            title="Switch scroll direction"
          >
            {direction === 'forward' ? '⇄ R → L' : '⇄ L → R'}
          </button>

          {/* Play/Pause toggle */}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="px-3 py-1 bg-white border border-black/20 text-black text-[11px] font-mono font-bold rounded-xs hover:border-black active:scale-95 transition-all"
            aria-label="Toggle timeline animation"
          >
            {isPlaying ? '⏸ Pause' : '▶ Play'}
          </button>

          {/* Manual Step Arrows */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => handleManualStep(-320)}
              className="w-7 h-7 bg-white border border-black/20 text-black font-mono font-bold text-xs flex items-center justify-center rounded-xs hover:bg-black hover:text-white active:scale-90 transition-all"
              title="Step Left"
              aria-label="Step Left"
            >
              ◀
            </button>
            <button
              onClick={() => handleManualStep(320)}
              className="w-7 h-7 bg-white border border-black/20 text-black font-mono font-bold text-xs flex items-center justify-center rounded-xs hover:bg-black hover:text-white active:scale-90 transition-all"
              title="Step Right"
              aria-label="Step Right"
            >
              ▶
            </button>
          </div>
        </div>
      </div>

      {/* 3D Floating Stage with Perspective View */}
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative w-full py-2 perspective-1000 transition-all duration-300"
        style={{ perspective: '1200px' }}
      >
        {/* 3D Tilted Filmstrip Track Container */}
        <div
          className="relative w-full bg-[#0a0a0c] border-2 sm:border-3 border-black text-white p-3 sm:p-5 shadow-[0_20px_45px_rgba(0,0,0,0.35)] rounded-xs transition-transform duration-200 ease-out"
          style={{
            transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) translateZ(10px)`,
            transformStyle: 'preserve-3d',
          }}
        >
          {/* Top 35mm Sprocket Perforations Track */}
          <div className="flex items-center justify-between pb-3 border-b border-white/15 overflow-hidden">
            <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
              {Array.from({ length: 32 }).map((_, i) => (
                <div
                  key={`top-sprocket-${i}`}
                  className="w-2.5 sm:w-3.5 h-3 sm:h-4 bg-[#f4f4f5] rounded-[1px] shadow-inner opacity-90 shrink-0"
                />
              ))}
            </div>
            <div className="hidden lg:flex items-center gap-4 text-[10px] font-mono text-neutral-400 uppercase tracking-widest pl-4">
              <span>KODAK 5219 · 500T</span>
              <span>·</span>
              <span>PRORES 422 HQ</span>
              <span>·</span>
              <span className="text-amber-400">SAFETY FILM 35MM</span>
            </div>
          </div>

          {/* Film Timeline Frames Row (Auto-scrolling with drag & touch controls) */}
          <div
            ref={trackRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => {
              setIsHovered(false);
              setIsDragging(false);
            }}
            className={`flex items-center gap-4 sm:gap-6 py-4 overflow-x-auto no-scrollbar touch-pan-x select-none ${
              isDragging ? 'cursor-grabbing' : 'cursor-grab'
            }`}
          >
            {displayedFrames.map((frame, idx) => (
              <div
                key={`${frame.id}-${idx}`}
                onClick={() => {
                  if (!hasMovedSignificantly.current) {
                    setActiveFrame(frame);
                    if (onSelectProjectById) onSelectProjectById(frame.id);
                  }
                }}
                className="group relative flex-none w-56 sm:w-64 bg-[#141417] border border-white/20 p-2.5 pb-3 rounded-xs shadow-md hover:border-red-500 hover:scale-105 hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                style={{ transform: 'translateZ(15px)' }}
              >
                {/* Frame Metadata Header */}
                <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400 pb-1.5 mb-1.5 border-b border-white/10">
                  <span className="text-red-500 font-bold">{frame.frameNum}</span>
                  <span className="tabular-nums text-neutral-300">{frame.timecode}</span>
                  <span className="text-amber-400">{frame.category}</span>
                </div>

                {/* Film Still Thumbnail */}
                <div className="aspect-[16/10] bg-black overflow-hidden relative border border-white/10">
                  <img
                    src={frame.image}
                    alt={frame.title}
                    draggable={false}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 filter contrast-110 pointer-events-none"
                  />
                  {/* Subtle red crosshair on hover */}
                  <div className="absolute inset-0 bg-red-600/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                    <span className="text-red-500 text-xs font-mono font-bold bg-black/80 px-2 py-0.5 border border-red-500">
                      INSPECT CUT
                    </span>
                  </div>
                </div>

                {/* Frame Details & Audio Track */}
                <div className="mt-2 space-y-1 text-left">
                  <h4 className="font-display font-black text-xs text-white uppercase truncate group-hover:text-red-400 transition-colors">
                    {frame.title}
                  </h4>
                  <div className="flex items-center justify-between text-[9px] font-mono text-neutral-400">
                    <span>{frame.tool}</span>
                    <span className="text-neutral-500">{frame.cutType}</span>
                  </div>

                  {/* Simulated Audio Waveform Bar */}
                  <div className="h-2 w-full bg-black/60 rounded-[1px] flex items-center gap-[2px] px-1 overflow-hidden">
                    {Array.from({ length: 28 }).map((_, barIdx) => {
                      const h = Math.abs(Math.sin((barIdx + (idx % 7) * 4) * 0.8)) * 100;
                      return (
                        <span
                          key={barIdx}
                          className="w-[2px] bg-cyan-400/80 rounded-[0.5px]"
                          style={{ height: `${Math.max(20, h)}%` }}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom 35mm Sprocket Perforations Track */}
          <div className="flex items-center justify-between pt-3 border-t border-white/15 overflow-hidden">
            <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
              {Array.from({ length: 32 }).map((_, i) => (
                <div
                  key={`bot-sprocket-${i}`}
                  className="w-2.5 sm:w-3.5 h-3 sm:h-4 bg-[#f4f4f5] rounded-[1px] shadow-inner opacity-90 shrink-0"
                />
              ))}
            </div>
            <div className="hidden lg:flex items-center gap-4 text-[10px] font-mono text-neutral-400 uppercase tracking-widest pl-4">
              <span>AUDIO: A1/A2 STEREO (-6dB)</span>
              <span>·</span>
              <span>AUTO SCROLL: ACTIVE</span>
              <span>·</span>
              <span className="text-red-500 font-bold">ZACK 06 ARCHIVE</span>
            </div>
          </div>
        </div>
      </div>

      {/* Frame Preview Modal */}
      {activeFrame && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setActiveFrame(null)}
        >
          <div
            className="relative max-w-xl w-full bg-[#121214] border-2 border-red-600 p-5 shadow-2xl rounded-xs text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/20 mb-4">
              <div className="flex items-center gap-2 text-xs font-mono text-red-500 font-bold">
                <span>{activeFrame.frameNum}</span>
                <span>·</span>
                <span className="text-white">{activeFrame.timecode}</span>
              </div>
              <button
                onClick={() => setActiveFrame(null)}
                className="w-7 h-7 bg-white text-black font-mono font-bold flex items-center justify-center rounded-xs hover:bg-red-600 hover:text-white transition-colors"
                aria-label="Close frame preview"
              >
                ✕
              </button>
            </div>

            <div className="aspect-[16/10] bg-black border border-white/20 overflow-hidden">
              <img
                src={activeFrame.image}
                alt={activeFrame.title}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="mt-4">
              <h3 className="font-display font-black text-lg text-white uppercase">
                {activeFrame.title}
              </h3>
              <p className="font-mono text-xs text-neutral-400 mt-1">
                {activeFrame.category} · {activeFrame.tool} · {activeFrame.cutType}
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
