import React, { useState } from 'react';
import { type ProjectItem } from '../utils/portfolioLogic';

interface DarkroomPhotoViewerProps {
  currentPhoto: ProjectItem;
  photoList: ProjectItem[];
  onSelectPhoto: (p: ProjectItem) => void;
  currentLang: 'en' | 'fr' | 'ar';
}

type ColorGradeMode = 'master' | 'warm-lut' | 'noir' | 'raw';

const PHOTO_SPECS: Record<
  string,
  {
    lighting: string;
    cameraLens: string;
    gradingStyle: string;
    aspectRatio: string;
  }
> = {
  'tanguif-caftan-editorial': {
    lighting: 'Golden Hour Ambient + Soft Moroccan Lantern Fill',
    cameraLens: '85mm f/1.4 · ISO 100 · 1/250s',
    gradingStyle: 'Royal Warmth & Velvet Texture Master',
    aspectRatio: 'aspect-[9/16] sm:aspect-[4/3]',
  },
  'omar-fashion-portrait': {
    lighting: 'Hard Key Rim Light + High Contrast Studio Fill',
    cameraLens: '50mm f/1.8 · ISO 200 · 1/320s',
    gradingStyle: 'Urban Moody Film · Deep Shadows',
    aspectRatio: 'aspect-[9/16] sm:aspect-[4/3]',
  },
  'soukaina-lifestyle-series': {
    lighting: 'Natural Daylight + Reflector Bounce',
    cameraLens: '35mm f/1.4 · ISO 100 · 1/500s',
    gradingStyle: 'Sun-Kissed Aesthetic & Clean Skin Tones',
    aspectRatio: 'aspect-[9/16] sm:aspect-[4/3]',
  },
};

export const DarkroomPhotoViewer: React.FC<DarkroomPhotoViewerProps> = ({
  currentPhoto,
  photoList,
  onSelectPhoto,
  currentLang,
}) => {
  const [gradeMode, setGradeMode] = useState<ColorGradeMode>('master');
  const [zoomLevel, setZoomLevel] = useState<'fit' | 'zoom'>('fit');

  const specs = PHOTO_SPECS[currentPhoto.id] || {
    lighting: 'Studio Lighting Setup',
    cameraLens: '85mm Prime · ISO 100',
    gradingStyle: 'Cinematic Rec.709 Color Grade',
    aspectRatio: 'aspect-video',
  };

  // Dynamic live color grading CSS filters
  const getFilterStyle = (): string => {
    switch (gradeMode) {
      case 'warm-lut':
        return 'contrast(1.15) saturate(1.25) sepia(0.2) hue-rotate(-5deg)';
      case 'noir':
        return 'grayscale(1) contrast(1.4) brightness(0.95)';
      case 'raw':
        return 'contrast(0.95) saturate(0.9)';
      case 'master':
      default:
        return 'contrast(1.1) saturate(1.1)';
    }
  };

  return (
    <div
      id="photo-screen"
      className="relative w-full bg-[#0a0a0d] border-2 sm:border-3 border-black text-white p-3 sm:p-5 mb-8 sm:mb-10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] rounded-xs overflow-hidden select-none transition-all"
    >
      {/* Frame Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b border-white/15 text-[10px] sm:text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
          <span className="font-bold text-cyan-400 uppercase tracking-wider">
            {currentLang === 'ar' ? 'غرفة التحميض والتصوير الفوتوغرافي' : currentLang === 'fr' ? 'Darkroom & Retouche Photo' : 'Darkroom & Photo Retouch Studio'}
          </span>
          <span className="text-neutral-500">·</span>
          <span className="px-1.5 py-0.5 bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[9px] font-bold uppercase rounded-[2px]">
            HIGH-RES RAW
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 text-neutral-400">
          <span className="text-neutral-400 hidden sm:inline">{specs.cameraLens}</span>
          <span className="hidden sm:inline">·</span>
          <button
            onClick={() => setZoomLevel(zoomLevel === 'fit' ? 'zoom' : 'fit')}
            className="px-2 py-0.5 bg-white/10 hover:bg-white/20 text-neutral-200 text-[10px] rounded-[2px] transition-colors cursor-pointer"
            title="Toggle Loupe Texture Zoom"
          >
            {zoomLevel === 'fit' ? 'Inspect Loupe 🔍' : 'Reset View ✕'}
          </button>
          {currentPhoto.link && (
            <a
              href={currentPhoto.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 hover:text-white flex items-center gap-1 font-bold transition-colors ml-1"
              title="Open full photography album in Google Drive"
            >
              <span>Drive</span>
              <span>↗</span>
            </a>
          )}
        </div>
      </div>

      {/* Main Darkroom Viewport */}
      <div
        className={`relative w-full bg-[#0c0c10] mx-auto overflow-hidden border border-white/20 transition-all duration-300 flex items-center justify-center max-h-[560px] ${specs.aspectRatio}`}
        style={{
          boxShadow: '0 0 50px rgba(6, 182, 212, 0.2), inset 0 0 30px rgba(0,0,0,0.95)',
        }}
      >
        {/* Ambient Blur Backdrop */}
        <img
          src={currentPhoto.image}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover filter blur-3xl opacity-25 pointer-events-none scale-125"
        />

        {/* Foreground Main Image with Live Color Grading Filter */}
        <div
          className={`relative z-10 transition-transform duration-300 flex items-center justify-center p-2 sm:p-4 max-h-full max-w-full ${
            zoomLevel === 'zoom' ? 'scale-150 cursor-zoom-out' : 'scale-100 cursor-zoom-in'
          }`}
          onClick={() => setZoomLevel(zoomLevel === 'zoom' ? 'fit' : 'zoom')}
        >
          <img
            src={currentPhoto.image}
            alt={currentPhoto.title}
            style={{ filter: getFilterStyle() }}
            className="max-h-[460px] w-auto object-contain shadow-[0_25px_50px_rgba(0,0,0,0.9)] border border-white/20 rounded-xs transition-all duration-300"
          />
        </div>

        {/* Header Overlay Info */}
        <div className="absolute top-3 left-3 bg-black/85 backdrop-blur-md px-3 py-1.5 border border-white/20 text-[10px] sm:text-[11px] font-mono rounded-xs pointer-events-none flex items-center gap-2 z-20">
          <span className="text-cyan-400 font-bold">FRAME:</span>
          <span className="text-white font-bold tracking-tight">{currentPhoto.title}</span>
        </div>

        {/* Grade Indicator Pill */}
        <div className="absolute top-3 right-3 bg-black/85 backdrop-blur-md px-2.5 py-1 border border-white/20 text-[10px] font-mono rounded-xs pointer-events-none text-neutral-300 z-20 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
          <span className="text-cyan-300 uppercase font-bold">
            {gradeMode === 'master' ? 'Rec.709 Master' : gradeMode === 'warm-lut' ? 'Warm Film LUT' : gradeMode === 'noir' ? 'Noir Contrast' : 'RAW Neutral'}
          </span>
        </div>
      </div>

      {/* Interactive Color Grading Simulator & Switcher Bar */}
      <div className="mt-3 pt-3 border-t border-white/15 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 font-mono text-xs">
        {/* Left: Interactive Color Grade Switchers */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider mr-1">
            {currentLang === 'ar' ? 'فلاتر التدريج:' : 'Color Grade:'}
          </span>
          <button
            onClick={() => setGradeMode('master')}
            className={`px-2 py-1 text-[10px] font-bold rounded-xs transition-all cursor-pointer ${
              gradeMode === 'master'
                ? 'bg-cyan-500 text-black shadow-xs'
                : 'bg-white/10 text-neutral-300 hover:text-white hover:bg-white/15'
            }`}
          >
            Rec.709 Master
          </button>
          <button
            onClick={() => setGradeMode('warm-lut')}
            className={`px-2 py-1 text-[10px] font-bold rounded-xs transition-all cursor-pointer ${
              gradeMode === 'warm-lut'
                ? 'bg-amber-500 text-black shadow-xs'
                : 'bg-white/10 text-neutral-300 hover:text-white hover:bg-white/15'
            }`}
          >
            Warm Film LUT
          </button>
          <button
            onClick={() => setGradeMode('noir')}
            className={`px-2 py-1 text-[10px] font-bold rounded-xs transition-all cursor-pointer ${
              gradeMode === 'noir'
                ? 'bg-white text-black shadow-xs'
                : 'bg-white/10 text-neutral-300 hover:text-white hover:bg-white/15'
            }`}
          >
            Noir B&W
          </button>
          <button
            onClick={() => setGradeMode('raw')}
            className={`px-2 py-1 text-[10px] font-bold rounded-xs transition-all cursor-pointer ${
              gradeMode === 'raw'
                ? 'bg-neutral-600 text-white shadow-xs'
                : 'bg-white/10 text-neutral-300 hover:text-white hover:bg-white/15'
            }`}
          >
            RAW Neutral
          </button>
        </div>

        {/* Center: Lighting Setup spec */}
        <div className="hidden lg:flex items-center gap-1.5 text-[10px] text-neutral-400">
          <span className="text-neutral-500 font-bold">LIGHTING:</span>
          <span className="px-1.5 py-0.5 bg-white/5 border border-white/10 rounded-[2px]">
            {specs.lighting}
          </span>
        </div>

        {/* Right: Photo Switcher Buttons */}
        <div className="flex items-center gap-2 self-end md:self-center">
          <div className="flex items-center gap-1 bg-black/60 p-0.5 border border-white/10 rounded-xs">
            {photoList.map((pho, idx) => (
              <button
                key={pho.id}
                onClick={() => onSelectPhoto(pho)}
                className={`px-2 py-1 text-[10px] rounded-xs transition-all cursor-pointer ${
                  currentPhoto.id === pho.id
                    ? 'bg-cyan-500 text-black font-bold shadow-xs'
                    : 'text-neutral-400 hover:text-white hover:bg-white/5'
                }`}
                title={pho.title}
              >
                Photo 0{idx + 1}
              </button>
            ))}
          </div>

          <a
            href={currentPhoto.link}
            target="_blank"
            rel="noopener noreferrer"
            className="px-2.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 active:scale-95 text-black font-bold rounded-xs text-[11px] transition-all flex items-center gap-1 shadow-xs"
            title="Open photo album on Google Drive"
          >
            <span>Drive Album</span>
            <span>↗</span>
          </a>
        </div>
      </div>
    </div>
  );
};
