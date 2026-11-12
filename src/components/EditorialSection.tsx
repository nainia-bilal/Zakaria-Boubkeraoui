import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

interface EditorialSectionProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
  parallaxIntensity?: 'none' | 'subtle' | 'medium';
  slideDirection?: 'up' | 'none';
  delay?: number;
}

export const EditorialSection: React.FC<EditorialSectionProps> = ({
  children,
  className = '',
  id,
  parallaxIntensity = 'subtle',
  slideDirection = 'up',
  delay = 0,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Track scroll progress of this specific section across the viewport
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  // Calculate subtle parallax based on intensity
  const parallaxRange =
    parallaxIntensity === 'medium'
      ? [30, -30]
      : parallaxIntensity === 'subtle'
      ? [18, -18]
      : [0, 0];

  const y = useTransform(scrollYProgress, [0, 1], parallaxRange);

  return (
    <div ref={containerRef} id={id} className={`relative will-change-transform ${className}`}>
      <motion.div
        style={{ y: parallaxIntensity !== 'none' ? y : undefined }}
        initial={
          slideDirection === 'up'
            ? { opacity: 0, y: 32 }
            : { opacity: 0 }
        }
        whileInView={{
          opacity: 1,
          y: 0,
        }}
        viewport={{ once: true, amount: 0.1 }}
        transition={{
          duration: 0.75,
          delay,
          ease: [0.22, 1, 0.36, 1], // Custom editorial bezier curve
        }}
        className="w-full"
      >
        {children}
      </motion.div>
    </div>
  );
};
