import React from 'react';

interface TornPaperDividerProps {
  variant?: 'top-to-dark' | 'dark-to-bottom';
}

export const TornPaperDivider: React.FC<TornPaperDividerProps> = ({ variant = 'top-to-dark' }) => {
  if (variant === 'dark-to-bottom') {
    return (
      <div className="relative w-full overflow-hidden leading-none select-none z-10 -mt-1 pointer-events-none">
        <svg
          viewBox="0 0 1440 68"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          className="w-full h-8 sm:h-12 md:h-16 block"
        >
          {/* Subtle paper shadow */}
          <path
            d="M0 60L42 54L88 58L135 48L180 56L230 45L285 55L340 46L400 58L460 48L515 54L570 44L630 55L690 46L750 56L810 47L870 57L930 46L990 55L1050 48L1110 57L1170 46L1230 55L1290 48L1350 56L1400 48L1440 55V68H0V60Z"
            fill="rgba(0,0,0,0.35)"
          />
          {/* White torn paper boundary */}
          <path
            d="M0 50L38 42L82 48L128 36L176 46L224 35L278 45L332 36L390 48L448 38L506 46L562 34L622 47L680 37L740 48L800 37L858 48L918 36L976 47L1034 38L1094 48L1152 36L1212 47L1272 38L1332 48L1390 38L1440 46V68H0V50Z"
            fill="#f7f7f4"
          />
        </svg>
      </div>
    );
  }

  // top-to-dark torn transition
  return (
    <div className="relative w-full overflow-hidden leading-none select-none z-10 -mb-1 pointer-events-none">
      <svg
        viewBox="0 0 1440 72"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        className="w-full h-8 sm:h-12 md:h-16 block"
      >
        {/* Subtle shadow beneath torn edge */}
        <path
          d="M0 12L45 22L95 14L145 25L198 15L250 26L305 14L360 25L420 12L480 24L538 14L596 26L654 13L712 25L770 14L828 26L886 13L944 26L1002 14L1060 25L1118 13L1176 25L1234 14L1292 26L1350 14L1400 24L1440 14V72H0V12Z"
          fill="rgba(0,0,0,0.3)"
        />
        {/* Jagged dark edge matching dark section */}
        <path
          d="M0 18L40 28L88 20L138 31L190 21L242 32L298 20L352 31L412 18L472 30L530 20L588 32L646 19L704 31L762 20L820 32L878 19L936 32L994 20L1052 31L1110 19L1168 31L1226 20L1284 32L1342 20L1392 30L1440 20V72H0V18Z"
          fill="#0c0c0e"
        />
      </svg>
    </div>
  );
};
