import React, { useState } from 'react';
import { motion, type Transition } from 'framer-motion';

export interface Text3DFlipProps {
  children: string;
  className?: string;
  textClassName?: string;
  flipTextClassName?: string;
  flipText?: string;
  rotateDirection?: 'top' | 'bottom' | 'left' | 'right';
  staggerDuration?: number;
  staggerFrom?: 'first' | 'last' | 'center' | number;
  transition?: Transition;
  isFlipped?: boolean;
  onHoverStart?: () => void;
  onHoverEnd?: () => void;
  startIndex?: number;
  totalLetters?: number;
  autoPlayInterval?: number; // Optional auto-trigger in milliseconds
}

export const Text3DFlip: React.FC<Text3DFlipProps> = ({
  children,
  className = '',
  textClassName = '',
  flipTextClassName = '',
  flipText,
  rotateDirection = 'top',
  staggerDuration = 0.03,
  staggerFrom = 'first',
  transition = { type: 'spring', damping: 25, stiffness: 160 },
  isFlipped: controlledIsFlipped,
  onHoverStart,
  onHoverEnd,
  startIndex = 0,
  totalLetters,
}) => {
  const [internalFlipped, setInternalFlipped] = useState(false);
  const isFlipped = controlledIsFlipped !== undefined ? controlledIsFlipped : internalFlipped;

  const characters = children.split('');
  const flipCharacters = (flipText || children).split('');
  const total = totalLetters ?? characters.length;

  const getStaggerDelay = (index: number) => {
    const globalIndex = startIndex + index;
    if (staggerFrom === 'last') {
      return (total - 1 - globalIndex) * staggerDuration;
    }
    if (staggerFrom === 'center') {
      const center = (total - 1) / 2;
      return Math.abs(globalIndex - center) * staggerDuration;
    }
    if (typeof staggerFrom === 'number') {
      return Math.abs(globalIndex - staggerFrom) * staggerDuration;
    }
    return globalIndex * staggerDuration;
  };

  const getMotionVariants = (index: number) => {
    const delay = getStaggerDelay(index);
    const charTransition: Transition = {
      ...transition,
      delay,
    };

    switch (rotateDirection) {
      case 'bottom':
        return {
          primary: {
            initial: { y: '0%', rotateX: 0, opacity: 1 },
            animate: isFlipped
              ? { y: '100%', rotateX: -90, opacity: 0 }
              : { y: '0%', rotateX: 0, opacity: 1 },
            transition: charTransition,
            origin: 'bottom center',
          },
          secondary: {
            initial: { y: '-100%', rotateX: 90, opacity: 0 },
            animate: isFlipped
              ? { y: '0%', rotateX: 0, opacity: 1 }
              : { y: '-100%', rotateX: 90, opacity: 0 },
            transition: charTransition,
            origin: 'top center',
          },
        };
      case 'left':
        return {
          primary: {
            initial: { x: '0%', rotateY: 0, opacity: 1 },
            animate: isFlipped
              ? { x: '-100%', rotateY: -90, opacity: 0 }
              : { x: '0%', rotateY: 0, opacity: 1 },
            transition: charTransition,
            origin: 'left center',
          },
          secondary: {
            initial: { x: '100%', rotateY: 90, opacity: 0 },
            animate: isFlipped
              ? { x: '0%', rotateY: 0, opacity: 1 }
              : { x: '100%', rotateY: 90, opacity: 0 },
            transition: charTransition,
            origin: 'right center',
          },
        };
      case 'right':
        return {
          primary: {
            initial: { x: '0%', rotateY: 0, opacity: 1 },
            animate: isFlipped
              ? { x: '100%', rotateY: 90, opacity: 0 }
              : { x: '0%', rotateY: 0, opacity: 1 },
            transition: charTransition,
            origin: 'right center',
          },
          secondary: {
            initial: { x: '-100%', rotateY: -90, opacity: 0 },
            animate: isFlipped
              ? { x: '0%', rotateY: 0, opacity: 1 }
              : { x: '-100%', rotateY: -90, opacity: 0 },
            transition: charTransition,
            origin: 'left center',
          },
        };
      case 'top':
      default:
        return {
          primary: {
            initial: { y: '0%', rotateX: 0, opacity: 1 },
            animate: isFlipped
              ? { y: '-100%', rotateX: 90, opacity: 0 }
              : { y: '0%', rotateX: 0, opacity: 1 },
            transition: charTransition,
            origin: 'top center',
          },
          secondary: {
            initial: { y: '100%', rotateX: -90, opacity: 0 },
            animate: isFlipped
              ? { y: '0%', rotateX: 0, opacity: 1 }
              : { y: '100%', rotateX: -90, opacity: 0 },
            transition: charTransition,
            origin: 'bottom center',
          },
        };
    }
  };

  const handleMouseEnter = () => {
    if (controlledIsFlipped === undefined) setInternalFlipped(true);
    onHoverStart?.();
  };

  const handleMouseLeave = () => {
    if (controlledIsFlipped === undefined) setInternalFlipped(false);
    onHoverEnd?.();
  };

  return (
    <span
      className={`inline-flex items-center cursor-pointer select-none ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={() => {
        if (controlledIsFlipped === undefined) setInternalFlipped((prev) => !prev);
      }}
    >
      {characters.map((char, index) => {
        if (char === ' ') {
          return (
            <span key={index} className="inline-block w-[0.25em]">
              &nbsp;
            </span>
          );
        }

        const variants = getMotionVariants(index);
        const flipChar = flipCharacters[index] || char;

        return (
          <span
            key={index}
            className="relative inline-block overflow-hidden"
            style={{
              perspective: 800,
              verticalAlign: 'baseline',
            }}
          >
            {/* Front primary character face */}
            <motion.span
              className={`inline-block ${textClassName}`}
              initial={variants.primary.initial}
              animate={variants.primary.animate}
              transition={variants.primary.transition}
              style={{
                transformOrigin: variants.primary.origin,
                willChange: 'transform, opacity',
              }}
            >
              {char}
            </motion.span>

            {/* Back flipped character face */}
            <motion.span
              className={`absolute inset-0 inline-flex items-center justify-center ${flipTextClassName}`}
              initial={variants.secondary.initial}
              animate={variants.secondary.animate}
              transition={variants.secondary.transition}
              style={{
                transformOrigin: variants.secondary.origin,
                willChange: 'transform, opacity',
              }}
            >
              {flipChar}
            </motion.span>
          </span>
        );
      })}
    </span>
  );
};

export default Text3DFlip;
