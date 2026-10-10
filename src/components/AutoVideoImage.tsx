import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Video } from 'lucide-react';

interface AutoVideoImageProps {
  src: string;
  alt: string;
  galleryImages?: string[];
  className?: string;
  showBadge?: boolean;
  intervalMs?: number;
}

export function AutoVideoImage({
  src,
  alt,
  galleryImages,
  className = 'w-full h-44 object-cover',
  showBadge = true,
  intervalMs = 4000,
}: AutoVideoImageProps) {
  // If galleryImages provided, combine primary src with galleryImages
  const images = galleryImages && galleryImages.length > 0
    ? [src, ...galleryImages.filter(img => img !== src)]
    : [src];

  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, intervalMs);
    return () => clearInterval(timer);
  }, [images.length, intervalMs]);

  const currentImg = images[index];

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <AnimatePresence mode="wait">
        <motion.div
          key={currentImg}
          initial={{ opacity: 0.2 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0.2 }}
          transition={{ duration: 1 }}
          className="w-full h-full absolute inset-0"
        >
          {/* Continuous Pan/Zoom Ken Burns motion effect */}
          <motion.img
            src={currentImg}
            alt={alt}
            animate={{
              scale: [1, 1.1, 1],
              x: [0, index % 2 === 0 ? -6 : 6, 0],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              repeatType: 'reverse',
              ease: 'easeInOut',
            }}
            className="w-full h-full object-cover"
          />
        </motion.div>
      </AnimatePresence>

      {/* Auto-Video Indicator Badge */}
      {showBadge && (
        <div className="absolute top-2 left-2 z-10 bg-black/70 backdrop-blur-md px-2 py-0.5 rounded-md border border-cyan-400/40 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
          <Video className="w-3 h-3 text-cyan-300" />
          <span className="text-[9px] font-black text-white tracking-widest uppercase">HD TOUR</span>
        </div>
      )}

      {/* Slide dots if multiple gallery images */}
      {images.length > 1 && (
        <div className="absolute bottom-2 right-2 z-10 flex gap-1 bg-black/60 px-1.5 py-1 rounded-full backdrop-blur-sm">
          {images.map((_, i) => (
            <div
              key={i}
              className={`w-1.5 h-1.5 rounded-full transition-all ${
                i === index ? 'bg-cyan-400 w-3' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
