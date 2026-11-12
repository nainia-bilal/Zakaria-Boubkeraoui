import React, { useState } from 'react';
import { type ProjectItem } from '../utils/portfolioLogic';

interface DesignStudioViewerProps {
  currentDesign: ProjectItem;
  designList: ProjectItem[];
  onSelectDesign: (p: ProjectItem) => void;
  currentLang: 'en' | 'fr' | 'ar';
}

// Color palettes and design specs tailored to each design project from Zack's Google Drive
const DESIGN_METADATA: Record<
  string,
  {
    format: string;
    aspect: string;
    palette: string[];
    fonts: string[];
    deliverables: string[];
  }
> = {
  'anfa-digital-wings': {
    format: 'Academy Campaign & Course System (1080×1920)',
    aspect: 'aspect-[9/16] sm:aspect-[4/3]',
    palette: ['#0284C7', '#0F172A', '#38BDF8', '#F8FAFC', '#F59E0B'],
    fonts: ['Cabinet Grotesk', 'Syne Heavy', 'Inter'],
    deliverables: ['Course Deck System', 'Story Ads', 'Certificate Design'],
  },
  'scavolini-luxury-interior': {
    format: 'Luxury Showroom & Catalog Deck (1920×1080)',
    aspect: 'aspect-[9/16] sm:aspect-[16/10]',
    palette: ['#292524', '#D4AF37', '#78716C', '#FAFAF9', '#0C0A09'],
    fonts: ['Playfair Display', 'Clash Display', 'Cinzel'],
    deliverables: ['Catalog Layout', 'Carousel Grid', 'Print Lookbook'],
  },
  'smm-hadi-wla-hadi': {
    format: 'Agency Visual System & Social Deck (1080×1920)',
    aspect: 'aspect-[9/16] sm:aspect-[4/3]',
    palette: ['#7C3AED', '#EC4899', '#1E1B4B', '#FFFFFF', '#10B981'],
    fonts: ['Outfit Black', 'Clash Display', 'Space Mono'],
    deliverables: ['Comparison Carousels', 'Story Ads', 'Vector Identity'],
  },
};

export const DesignStudioViewer: React.FC<DesignStudioViewerProps> = ({
  currentDesign,
  designList,
  onSelectDesign,
  currentLang,
}) => {
  const [zoomLevel, setZoomLevel] = useState<'fit' | 'fill' | 'zoom'>('fit');
  const [copiedColor, setCopiedColor] = useState<string | null>(null);
  const [showGrid, setShowGrid] = useState(true);

  const meta = DESIGN_METADATA[currentDesign.id] || {
    format: 'Graphic Design Layout (1920×1080)',
    aspect: 'aspect-video',
    palette: ['#E11D48', '#111827', '#F59E0B', '#FFFFFF'],
    fonts: ['Clash Display', 'Inter'],
    deliverables: ['High-Res Vector Export', 'Print Ready CMYK', 'Web RGB'],
  };

  const handleCopyColor = (hex: string) => {
    navigator.clipboard?.writeText(hex);
    setCopiedColor(hex);
    setTimeout(() => setCopiedColor(null), 2000);
  };

  return (
    <div
      id="design-screen"
      className="relative w-full bg-[#0a0a0d] border-2 sm:border-3 border-black text-white p-3 sm:p-5 mb-8 sm:mb-10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] rounded-xs overflow-hidden select-none transition-all"
    >
      {/* Frame Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b border-white/15 text-[10px] sm:text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
          <span className="font-bold text-amber-400 uppercase tracking-wider">
            {currentLang === 'ar' ? 'استوديو التصميم والهوية المباشر' : currentLang === 'fr' ? 'Studio de Design Graphique' : 'Live Design & Brand Studio'}
          </span>
          <span className="text-neutral-500">·</span>
          <span className="px-1.5 py-0.5 bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[9px] font-bold uppercase rounded-[2px]">
            {meta.format.split(' ')[0]}
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 text-neutral-400">
          <button
            onClick={() => setShowGrid(!showGrid)}
            className={`px-2 py-0.5 text-[10px] rounded-[2px] transition-colors cursor-pointer border ${
              showGrid
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-white/10 text-neutral-400 border-white/10'
            }`}
            title="Toggle Artboard Layout Grid"
          >
            {showGrid ? 'Grid ON ▦' : 'Grid OFF ▢'}
          </button>

          <button
            onClick={() => {
              const next = zoomLevel === 'fit' ? 'fill' : zoomLevel === 'fill' ? 'zoom' : 'fit';
              setZoomLevel(next);
            }}
            className="px-2 py-0.5 bg-white/10 hover:bg-white/20 text-neutral-200 text-[10px] rounded-[2px] transition-colors cursor-pointer"
            title="Toggle Artboard Zoom"
          >
            {zoomLevel === 'fit' ? 'Fit (100%)' : zoomLevel === 'fill' ? 'Fill (125%)' : 'Loupe (175%)'}
          </button>

          {currentDesign.link && (
            <a
              href={currentDesign.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-400 hover:text-white flex items-center gap-1 font-bold transition-colors ml-1"
              title={currentDesign.link.includes('drive.google.com') ? 'Open full design file in Google Drive' : 'Open in Canva'}
            >
              <span>{currentDesign.link.includes('drive.google.com') ? 'Drive' : 'Canva'}</span>
              <span>↗</span>
            </a>
          )}
        </div>
      </div>

      {/* Main Artboard Canvas Viewport */}
      <div
        className={`relative w-full bg-[#121217] mx-auto overflow-hidden border border-white/20 transition-all duration-300 flex items-center justify-center max-h-[560px] ${meta.aspect}`}
        style={{
          boxShadow: '0 0 45px rgba(245, 158, 11, 0.15), inset 0 0 30px rgba(0,0,0,0.9)',
          backgroundImage: showGrid
            ? 'linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)'
            : 'none',
          backgroundSize: '32px 32px',
        }}
      >
        {/* Subtle Ambient Blurred Backdrop */}
        <img
          src={currentDesign.image}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover filter blur-3xl opacity-20 pointer-events-none scale-125"
        />

        {/* Artboard Frame & Image */}
        <div
          className={`relative z-10 transition-transform duration-300 flex items-center justify-center p-2 sm:p-4 max-h-full max-w-full ${
            zoomLevel === 'zoom'
              ? 'scale-150 cursor-zoom-out'
              : zoomLevel === 'fill'
              ? 'scale-110 cursor-zoom-in'
              : 'scale-100 cursor-zoom-in'
          }`}
          onClick={() => {
            setZoomLevel(zoomLevel === 'zoom' ? 'fit' : 'zoom');
          }}
        >
          <img
            src={currentDesign.image}
            alt={currentDesign.title}
            className="max-h-[460px] w-auto object-contain shadow-[0_25px_50px_rgba(0,0,0,0.8)] border border-white/20 rounded-xs"
          />

          {/* Interactive Zoom Cue Overlay */}
          <div className="absolute bottom-6 right-6 bg-black/80 backdrop-blur-md px-2 py-1 text-[9px] font-mono border border-white/20 text-neutral-300 rounded-[2px] opacity-0 hover:opacity-100 transition-opacity pointer-events-none">
            Click to {zoomLevel === 'zoom' ? 'Zoom Out' : 'Inspect Details'} 🔍
          </div>
        </div>

        {/* Header Overlay Pill */}
        <div className="absolute top-3 left-3 bg-black/85 backdrop-blur-md px-3 py-1.5 border border-white/20 text-[10px] sm:text-[11px] font-mono rounded-xs pointer-events-none flex items-center gap-2 z-20">
          <span className="text-amber-400 font-bold">ARTBOARD:</span>
          <span className="text-white font-bold tracking-tight">{currentDesign.title}</span>
        </div>

        {/* Resolution spec pill */}
        <div className="absolute top-3 right-3 bg-black/85 backdrop-blur-md px-2 py-1 border border-white/20 text-[10px] font-mono rounded-xs pointer-events-none text-neutral-300 z-20">
          <span>{meta.format.split('(')[1]?.replace(')', '') || '1080P'}</span>
        </div>
      </div>

      {/* Palette Extractor & Deliverables Bar */}
      <div className="mt-3 pt-3 border-t border-white/15 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 font-mono text-xs">
        {/* Left: Swatches with Click-to-Copy */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">
            {currentLang === 'ar' ? 'الألوان:' : 'Palette:'}
          </span>
          <div className="flex items-center gap-1.5">
            {meta.palette.map((hex) => (
              <button
                key={hex}
                onClick={() => handleCopyColor(hex)}
                className="group relative flex items-center gap-1 px-1.5 py-0.5 bg-white/5 hover:bg-white/15 border border-white/15 rounded-xs transition-colors cursor-pointer text-[10px]"
                title={`Click to copy ${hex}`}
              >
                <span
                  className="w-3 h-3 rounded-[2px] border border-black/40 shadow-xs"
                  style={{ backgroundColor: hex }}
                />
                <span className="text-neutral-300 group-hover:text-white font-mono uppercase">
                  {copiedColor === hex ? 'COPIED!' : hex}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Center: Deliverables tags */}
        <div className="hidden lg:flex items-center gap-1.5 text-[10px] text-neutral-400">
          <span className="text-neutral-500 font-bold">ASSETS:</span>
          {meta.deliverables.map((d, idx) => (
            <span key={d} className="px-1.5 py-0.5 bg-white/5 border border-white/10 rounded-[2px]">
              {d}
            </span>
          ))}
        </div>

        {/* Right: Design Selector Switchers & Canva button */}
        <div className="flex items-center gap-2 self-end md:self-center">
          <div className="flex items-center gap-1 bg-black/60 p-0.5 border border-white/10 rounded-xs">
            {designList.map((des, idx) => (
              <button
                key={des.id}
                onClick={() => onSelectDesign(des)}
                className={`px-2 py-1 text-[10px] rounded-xs transition-all cursor-pointer ${
                  currentDesign.id === des.id
                    ? 'bg-amber-500 text-black font-bold shadow-xs'
                    : 'text-neutral-400 hover:text-white hover:bg-white/5'
                }`}
                title={des.title}
              >
                Design 0{idx + 1}
              </button>
            ))}
          </div>

          {currentDesign.link && (
            <a
              href={currentDesign.link}
              target="_blank"
              rel="noopener noreferrer"
              className="px-2.5 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:opacity-90 active:scale-95 text-black font-bold rounded-xs text-[11px] transition-all flex items-center gap-1 shadow-xs"
              title={currentDesign.link.includes('drive.google.com') ? 'Open full high-resolution design file on Google Drive' : 'Open in Canva'}
            >
              <span>{currentDesign.link.includes('drive.google.com') ? 'Drive Project' : 'Canva Project'}</span>
              <span>↗</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
};
