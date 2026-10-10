import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Volume2, VolumeX, Play, Pause, Film, ChevronLeft, ChevronRight, Award } from 'lucide-react';
import { soundService } from '../utils/audioService';

export interface MediaSlide {
  id: string;
  title: string;
  location: string;
  tag: string;
  imageUrl: string;
  description: string;
}

export const DANGOTE_MEDIA_SLIDES: MediaSlide[] = [
  {
    id: 'dangote-lekki-refinery',
    title: 'Dangote Petroleum Refinery & Petrochemicals',
    location: 'Lekki Free Trade Zone, Lagos, Nigeria',
    tag: '650,000 BPD SINGLE-TRAIN',
    imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80',
    description: 'The world’s largest single-train crude distillation facility delivering energy independence to Africa.',
  },
  {
    id: 'dangote-ipo-roadshow',
    title: 'Dangote Refinery PLC Global IPO Roadshow',
    location: 'New York & Lagos Financial Centers',
    tag: 'NGX: DANGREFINERY',
    imageUrl: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80',
    description: 'Institutional partnerships, VIP consortium tranches, and sovereign retail share allocations.',
  },
  {
    id: 'dangote-petrochemical-hub',
    title: 'Polypropylene & Fertilizer Petrochemical Complex',
    location: 'Lekki Industrial Corridor',
    tag: 'PETROCHEMICAL YIELD',
    imageUrl: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=1200&q=80',
    description: 'Annual production of 900,000 metric tons of polypropylene and downstream polymers.',
  },
  {
    id: 'dangote-pms-distribution',
    title: 'Subsea Pipeline & Marine Export Terminal',
    location: 'Atlantic Ocean Offshore Mooring',
    tag: 'DAILY REFINERY DIVIDENDS',
    imageUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=80',
    description: 'World-class marine loading terminal handling ultra-large crude carriers (VLCC) daily.',
  },
];

interface AutoMediaBannerProps {
  onOpenRescue?: () => void;
}

export function AutoMediaBanner({ onOpenRescue }: AutoMediaBannerProps) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [useFallback, setUseFallback] = useState(false);
  const [slideIndex, setSlideIndex] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Video source stream
  const videoSrc = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4";

  // Auto-play video on mount
  useEffect(() => {
    if (videoRef.current) {
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn("Video autoplay prevented or unavailable, switching to animated presentation mode:", err);
          setUseFallback(true);
        });
      }
    }
  }, []);

  // Continuous slide cycling if in presentation mode or playing
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % DANGOTE_MEDIA_SLIDES.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [isPlaying]);

  const toggleSound = () => {
    soundService.playClick();
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
    }
    setIsMuted(!isMuted);
  };

  const togglePlay = () => {
    soundService.playClick();
    if (videoRef.current && !useFallback) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(() => setUseFallback(true));
      }
    }
    setIsPlaying(!isPlaying);
  };

  const handleNextSlide = () => {
    soundService.playClick();
    setSlideIndex((prev) => (prev + 1) % DANGOTE_MEDIA_SLIDES.length);
  };

  const handlePrevSlide = () => {
    soundService.playClick();
    setSlideIndex((prev) => (prev - 1 + DANGOTE_MEDIA_SLIDES.length) % DANGOTE_MEDIA_SLIDES.length);
  };

  const currentSlide = DANGOTE_MEDIA_SLIDES[slideIndex];

  return (
    <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-cyan-500/30 bg-[#080d2b] group">
      <div className="relative h-64 w-full overflow-hidden bg-black">
        {/* HTML5 Video or Animated Ken-Burns Slide Presentation */}
        {!useFallback ? (
          <video
            ref={videoRef}
            src={videoSrc}
            autoPlay
            loop
            muted={isMuted}
            playsInline
            onError={() => setUseFallback(true)}
            className="w-full h-full object-cover filter brightness-[0.95] contrast-[1.05]"
          />
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide.id}
              initial={{ opacity: 0, scale: 1.15 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="absolute inset-0"
            >
              <motion.img
                src={currentSlide.imageUrl}
                alt={currentSlide.title}
                animate={{
                  scale: [1, 1.1, 1],
                  x: [0, -8, 0],
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  repeatType: 'reverse',
                  ease: 'easeInOut',
                }}
                className="w-full h-full object-cover filter brightness-[0.88] contrast-[1.05]"
              />
            </motion.div>
          </AnimatePresence>
        )}

        {/* Cinematic Vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#060a24] via-[#060a24]/20 to-black/50 pointer-events-none" />

        {/* Top Controls: Mute/Sound & Play/Pause */}
        <div className="absolute top-3 left-3 z-20 flex items-center gap-2">
          {!useFallback && (
            <button
              onClick={toggleSound}
              className="bg-black/60 hover:bg-black/80 text-white px-3 py-1.5 rounded-full backdrop-blur-md border border-white/20 transition flex items-center gap-1.5 text-[10px] font-bold shadow-lg"
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400" />}
              <span>{isMuted ? 'Unmute' : 'Sound ON'}</span>
            </button>
          )}

          <button
            onClick={togglePlay}
            className="bg-black/60 hover:bg-black/80 text-white p-2 rounded-full backdrop-blur-md border border-white/20 transition shadow-lg"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5 text-cyan-300" /> : <Play className="w-3.5 h-3.5 text-cyan-300" />}
          </button>
        </div>

        {/* Top Right Rescue Prize Button */}
        {onOpenRescue && (
          <div className="absolute top-3 right-3 z-20">
            <button
              onClick={onOpenRescue}
              className="bg-gradient-to-tr from-pink-600 via-purple-600 to-amber-500 text-white text-[10px] font-extrabold px-3.5 py-1.5 rounded-full shadow-lg flex items-center gap-1 hover:scale-105 transition animate-pulse"
            >
              <Sparkles className="w-3.5 h-3.5" /> PRIZES
            </button>
          </div>
        )}

        {/* Navigation Arrows for Presentation */}
        {useFallback && (
          <>
            <button
              onClick={handlePrevSlide}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-7 h-7 rounded-full bg-black/40 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-sm border border-white/10 transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNextSlide}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-7 h-7 rounded-full bg-black/40 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-sm border border-white/10 transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </>
        )}

        {/* Bottom Information Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4 z-10 space-y-1 bg-gradient-to-t from-[#060a24] via-[#060a24]/80 to-transparent pt-8">
          <div className="flex items-center gap-2">
            <span className="text-[9px] uppercase font-black tracking-widest text-amber-300 bg-amber-950/90 px-2.5 py-0.5 rounded-full border border-amber-500/40 flex items-center gap-1">
              <Film className="w-3 h-3 text-amber-400" /> DANGOTE MEDIA
            </span>
            <span className="text-[10px] text-slate-300 font-semibold">{useFallback ? currentSlide.location : 'Lekki Free Trade Zone, Lagos'}</span>
          </div>

          <h2 className="text-base font-black text-white tracking-tight drop-shadow-md">
            {useFallback ? currentSlide.title : 'Dangote Petroleum Refinery & Petrochemicals'}
          </h2>

          <p className="text-[11px] text-slate-300 leading-tight line-clamp-1 font-medium">
            {useFallback ? currentSlide.description : 'The world’s largest 650,000 BPD single-train crude distillation refinery and petrochemical complex.'}
          </p>

          {/* Slide Indicator Dots */}
          <div className="flex items-center gap-1 pt-1.5">
            {DANGOTE_MEDIA_SLIDES.map((slide, idx) => (
              <button
                key={slide.id}
                onClick={() => {
                  soundService.playClick();
                  setSlideIndex(idx);
                }}
                className={`h-1 rounded-full transition-all duration-300 ${
                  slideIndex === idx ? 'w-5 bg-amber-400' : 'w-1.5 bg-white/30'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}


