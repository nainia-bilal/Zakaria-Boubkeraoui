import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TRANSLATIONS } from '../data/portfolioData';
import ModelViewer from './ModelViewer';
import Text3DFlip from '@/registry/magicui/text-3d-flip';

interface HeroDraftHeaderProps {
  currentLang: 'en' | 'fr' | 'ar';
}

export const HeroDraftHeader: React.FC<HeroDraftHeaderProps> = ({ currentLang }) => {
  const t = TRANSLATIONS[currentLang];
  const [isHovered, setIsHovered] = useState(false);

  return (
    <section className="pt-16 sm:pt-20 pb-6 px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto select-none overflow-hidden" id="top">
      {/* Top micro metadata header row with clean mobile wrapping */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-1.5 text-[11px] sm:text-xs font-mono font-bold tracking-wider text-black/80 pb-2.5 border-b-2 border-black/80 text-center sm:text-left">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 bg-red-600 rounded-xs shrink-0"></span>
          <span className="truncate">{t.designerIllustrator}</span>
        </div>
        <div className="flex items-center gap-2 text-neutral-600">
          <span>MOROCCO · CASABLANCA</span>
          <span className="text-black/30">/</span>
          <span>{t.portfolioYear}</span>
        </div>
      </div>

      {/* Oversized PORTFOLIO headline with Magic UI Text3DFlip & avatar badge */}
      <div
        className="relative pt-4 sm:pt-6 pb-2 text-center max-w-full overflow-hidden"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => setIsHovered((prev) => !prev)}
      >
        <div className="inline-flex items-center justify-center flex-nowrap font-display font-black text-[2.5rem] xs:text-[3.2rem] sm:text-7xl md:text-8xl lg:text-[8.5rem] leading-none tracking-tighter text-black select-none max-w-full cursor-pointer group">
          {/* First 5 letters: PORTF with Text3DFlip */}
          <Text3DFlip
            rotateDirection="top"
            staggerDuration={0.03}
            staggerFrom="first"
            transition={{ type: 'spring', damping: 25, stiffness: 160 }}
            textClassName="text-black transition-colors"
            flipTextClassName="text-red-600"
            isFlipped={isHovered}
            startIndex={0}
            totalLetters={8}
          >
            PORTF
          </Text3DFlip>

          {/* Center avatar sticker badge replacing O/middle with synchronized 3D flip & doodle arrow */}
          <div className="relative inline-flex items-center justify-center mx-1 sm:mx-2.5 shrink-0">
            <motion.div
              animate={
                isHovered
                  ? {
                      rotateX: 360,
                      scale: 1.08,
                      borderColor: '#dc2626',
                      boxShadow: '0 8px 24px rgba(220, 38, 38, 0.4)',
                    }
                  : {
                      rotateX: 0,
                      scale: 1,
                      borderColor: '#000000',
                      boxShadow: '3px 3px 0px #000000',
                    }
              }
              transition={{
                type: 'spring',
                damping: 25,
                stiffness: 160,
                delay: 4 * 0.03,
              }}
              style={{ perspective: 800, transformStyle: 'preserve-3d' }}
              className="w-10 h-10 xs:w-12 xs:h-12 sm:w-18 sm:h-18 md:w-22 md:h-22 lg:w-26 lg:h-26 rounded-full border-2 sm:border-3 bg-white overflow-hidden flex items-center justify-center"
            >
              <img
                src="/profil.jpeg"
                alt="Zakaria Boubkeraoui"
                className="w-full h-full object-cover grayscale contrast-125 hover:grayscale-0 transition-all duration-300"
              />
            </motion.div>

            {/* Hand-drawn scribble arrow pointing to face */}
            <div className="absolute -bottom-5 sm:-bottom-7 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none">
              <svg
                width="18"
                height="22"
                viewBox="0 0 24 28"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-black transform -rotate-6 w-3.5 h-4 sm:w-5 sm:h-6"
              >
                <path
                  d="M18 24C12 24 6 18 6 10M6 10L2 14M6 10L10 14"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>

          {/* Final 3 letters: LIO with Text3DFlip following in cadence */}
          <Text3DFlip
            rotateDirection="top"
            staggerDuration={0.03}
            staggerFrom="first"
            transition={{ type: 'spring', damping: 25, stiffness: 160 }}
            textClassName="text-black transition-colors"
            flipTextClassName="text-red-600"
            isFlipped={isHovered}
            startIndex={5}
            totalLetters={8}
          >
            LIO
          </Text3DFlip>
        </div>

        {/* React Bits <ModelViewer /> 3D Cinema Camera */}
        <div className="relative flex flex-col items-center justify-center my-2 sm:my-3 select-none">
          <ModelViewer
            url="camera"
            width="100%"
            height={270}
            environment="studio"
            environmentIntensity={1.2}
            exposure={1.1}
            autoRotate={true}
            autoRotateSpeed={0.5}
            autoRotateDelay={2}
            dragRotate={true}
            turntable={false}
            zoom={true}
            minZoom={0.7}
            maxZoom={1.8}
            startAngle={-25}
            tilt={8}
            hoverTilt={0.2}
            float={0.25}
            shadow={true}
            shadowOpacity={0.4}
            fit={0.82}
            className="w-full max-w-[340px] sm:max-w-[440px] mx-auto cursor-grab active:cursor-grabbing"
          />

          {/* Interactive 3D Camera metadata badge */}
          <div className="flex items-center gap-2 mt-1 px-3.5 py-1 bg-white/95 border border-black/20 rounded-full text-[10px] sm:text-[11px] font-mono shadow-xs backdrop-blur-xs">
            <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
            <span className="font-bold text-neutral-900 uppercase tracking-wider">
              {currentLang === 'ar' ? 'كاميرا سينمائية 3D' : currentLang === 'fr' ? 'Caméra Cinéma 3D' : '3D Cinema Camera'}
            </span>
            <span className="text-neutral-400">·</span>
            <span className="text-neutral-600 font-semibold">
              {currentLang === 'ar' ? 'اسحب للتدوير 360°' : 'Drag to Rotate 360°'}
            </span>
          </div>
        </div>

        {/* Centered ornamental stars and clover symbols (✦ ✦ ♣) */}
        <div className="pt-2 sm:pt-4 flex items-center justify-center gap-3 sm:gap-4 text-lg sm:text-2xl text-black">
          <span className="transform hover:scale-125 transition-transform cursor-default">✦</span>
          <span className="transform hover:scale-125 transition-transform cursor-default text-red-600">✦</span>
          <span className="transform hover:scale-125 transition-transform cursor-default">♣</span>
        </div>
      </div>
    </section>
  );
};
