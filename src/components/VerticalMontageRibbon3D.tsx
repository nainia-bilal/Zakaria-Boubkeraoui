import React, { useEffect, useState } from 'react';

interface VerticalMontageRibbon3DProps {
  currentLang: 'en' | 'fr' | 'ar';
  onSelectProjectById?: (id: string) => void;
}

export const VerticalMontageRibbon3D: React.FC<VerticalMontageRibbon3DProps> = ({
  currentLang,
  onSelectProjectById,
}) => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (totalScroll > 0) {
        const current = window.scrollY / totalScroll;
        setScrollProgress(Math.min(Math.max(current, 0), 1));
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Compute dynamic SMPTE timecode based on scroll position
  const totalFrames = Math.floor(scrollProgress * 24 * 120); // 2 minutes @ 24fps
  const hours = String(Math.floor(totalFrames / (24 * 3600))).padStart(2, '0');
  const minutes = String(Math.floor((totalFrames % (24 * 3600)) / (24 * 60))).padStart(2, '0');
  const seconds = String(Math.floor((totalFrames % (24 * 60)) / 24)).padStart(2, '0');
  const frames = String(totalFrames % 24).padStart(2, '0');
  const currentTimecode = `${hours}:${minutes}:${seconds}:${frames}`;

  const filmCuts = [
    { id: 'cinematic-fitness-reel', title: 'Fitness Reel', img: '/profil.jpeg', code: '00:00:15' },
    { id: 'brand-identity-kit', title: 'Brand Identity', img: '/sel.png', code: '00:00:35' },
    { id: 'social-media-campaign', title: 'Social Campaign', img: '/Design1.png', code: '00:01:02' },
    { id: 'photography-portfolio', title: 'Photography', img: '/Design2.png', code: '00:01:28' },
    { id: 'lifestyle-content-series', title: 'Lifestyle Reel', img: '/Design3.png', code: '00:01:54' },
    { id: 'pitch-deck-design', title: 'Pitch Deck', img: '/NES.png', code: '00:02:18' },
    { id: 'visual-brand-pitch', title: 'Brand Pitch', img: '/sting.png', code: '00:02:40' },
  ];

  return (
    <>
      {/* Desktop & Tablet: Floating 3D Vertical Filmstrip Transport in bottom corner */}
      <aside
        className={`fixed bottom-6 z-40 hidden md:flex flex-col items-end transition-all duration-300 ease-out select-none ${
          currentLang === 'ar' ? 'left-6 items-start' : 'right-6 items-end'
        }`}
        style={{ perspective: '1000px' }}
        aria-label="3D Video Editing Filmstrip Spine"
      >
        {/* The 3D Filmstrip Body when expanded */}
        {isExpanded && (
          <div
            className="mb-3 relative w-48 bg-[#0a0a0d] border-2 border-black rounded-xs shadow-[0_20px_45px_rgba(0,0,0,0.55)] p-2.5 transition-transform duration-300 ease-out"
            style={{
              transform: `rotateY(${currentLang === 'ar' ? '10deg' : '-10deg'}) rotateX(${
                (scrollProgress - 0.5) * 10
              }deg) translateZ(10px)`,
              transformStyle: 'preserve-3d',
            }}
          >
            {/* Film Header Details */}
            <div className="flex items-center justify-between text-[8px] font-mono text-neutral-400 pb-1.5 mb-1.5 border-b border-white/10">
              <span className="text-amber-400 font-bold">KODAK 35MM · 500T</span>
              <span className="text-neutral-500">24 FPS</span>
            </div>

            {/* Scroll Progress Playhead Bar on the film strip */}
            <div className="relative w-full h-1.5 bg-white/10 mb-2 rounded-full overflow-hidden">
              <div
                className="h-full bg-red-600 transition-all duration-150"
                style={{ width: `${scrollProgress * 100}%` }}
              />
            </div>

            {/* Film Frames Column */}
            <div className="space-y-2 max-h-[46vh] overflow-y-auto no-scrollbar pr-0.5">
              {filmCuts.map((cut, idx) => {
                const isCurrent =
                  Math.abs(scrollProgress - idx / (filmCuts.length - 1)) < 0.16;

                return (
                  <div
                    key={cut.id}
                    onMouseEnter={() => setHoveredIdx(idx)}
                    onMouseLeave={() => setHoveredIdx(null)}
                    onClick={() => {
                      if (onSelectProjectById) onSelectProjectById(cut.id);
                    }}
                    className={`relative p-1 border rounded-xs transition-all duration-200 cursor-pointer ${
                      isCurrent || hoveredIdx === idx
                        ? 'border-red-500 bg-red-950/30 scale-102 shadow-md'
                        : 'border-white/10 bg-[#141418] hover:border-white/40'
                    }`}
                  >
                    {/* Sprocket Holes on sides */}
                    <div className="flex items-center justify-between pb-1 px-0.5">
                      <div className="flex gap-1">
                        <span className="w-1.5 h-1.5 bg-neutral-300 rounded-[0.5px]" />
                        <span className="w-1.5 h-1.5 bg-neutral-300 rounded-[0.5px]" />
                      </div>
                      <span className="text-[7px] font-mono text-neutral-400 tabular-nums">
                        {cut.code}
                      </span>
                      <div className="flex gap-1">
                        <span className="w-1.5 h-1.5 bg-neutral-300 rounded-[0.5px]" />
                        <span className="w-1.5 h-1.5 bg-neutral-300 rounded-[0.5px]" />
                      </div>
                    </div>

                    {/* Frame Visual Thumbnail */}
                    <div className="aspect-[16/9] w-full bg-black overflow-hidden relative border border-white/10">
                      <img
                        src={cut.img}
                        alt={cut.title}
                        className="w-full h-full object-cover filter contrast-110 hover:scale-110 transition-transform"
                        loading="lazy"
                      />
                      {isCurrent && (
                        <div className="absolute top-0.5 left-0.5 bg-red-600 text-white text-[7px] font-mono px-1 font-bold">
                          PLAYHEAD
                        </div>
                      )}
                    </div>

                    {/* Label & Audio waveform */}
                    <div className="mt-1 flex items-center justify-between text-[8px] font-mono text-neutral-300">
                      <span className="truncate max-w-[100px] font-bold">{cut.title}</span>
                      <span className="text-[7px] text-cyan-400">CUT #{idx + 1}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Film Strip Footer Tape */}
            <div className="mt-2 pt-1 border-t border-white/10 text-center">
              <span className="text-[8px] font-mono text-neutral-400 tracking-wider">
                EDIT TIMELINE · V1
              </span>
            </div>
          </div>
        )}

        {/* Floating Transport Bar Button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 bg-[#0c0d10] border-2 border-black text-white px-3 py-2 rounded-xs text-[11px] font-mono shadow-2xl hover:border-red-600 transition-all cursor-pointer group"
          title={isExpanded ? 'Collapse 3D Filmstrip' : 'Expand 3D Filmstrip Timeline'}
          aria-expanded={isExpanded}
        >
          <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
          <span className="text-red-500 font-bold">REC 3D</span>
          <span className="tabular-nums font-bold text-neutral-200">{currentTimecode}</span>
          <span className="text-[11px] text-amber-400">🎞</span>
          <span className="text-[10px] bg-white/15 px-1.5 py-0.5 rounded-[2px] font-bold text-neutral-300 group-hover:text-white">
            {isExpanded ? '✕ CLOSE' : '▲ 3D FILM'}
          </span>
        </button>
      </aside>

      {/* Mobile & Small Screen: Sleek Floating 3D Montage Badge */}
      <div
        className={`fixed bottom-4 z-40 md:hidden flex items-center gap-2 ${
          currentLang === 'ar' ? 'left-4' : 'right-4'
        }`}
      >
        <button
          onClick={() => {
            const el = document.getElementById('filmstrip-timeline');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
          className="flex items-center gap-2 bg-[#0c0d10]/95 backdrop-blur-md text-white border border-white/20 px-3 py-1.5 rounded-full shadow-2xl active:scale-95 transition-all"
          aria-label="Jump to 3D Filmstrip Timeline"
        >
          <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
          <span className="text-[10px] font-mono font-bold text-red-500">3D FILM</span>
          <span className="text-[10px] font-mono text-neutral-300 tabular-nums">
            {currentTimecode}
          </span>
          <span className="text-[10px] text-amber-400">🎞</span>
        </button>
      </div>
    </>
  );
};
