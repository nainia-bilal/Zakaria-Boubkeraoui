import React, { useRef, useState, useEffect } from 'react';
import { type ProjectItem } from '../utils/portfolioLogic';

interface CinemaScreenPlayerProps {
  currentVideo: ProjectItem;
  videoList: ProjectItem[];
  onSelectVideo: (p: ProjectItem) => void;
  currentLang: 'en' | 'fr' | 'ar';
}

export const CinemaScreenPlayer: React.FC<CinemaScreenPlayerProps> = ({
  currentVideo,
  videoList,
  onSelectVideo,
  currentLang,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [aspectRatio, setAspectRatio] = useState<'cinema' | 'original'>('cinema');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hasStartedPlaying, setHasStartedPlaying] = useState(false);

  // When currentVideo changes, switch source and play
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      setCurrentTime(0);
      if (hasStartedPlaying) {
        videoRef.current
          .play()
          .then(() => setIsPlaying(true))
          .catch(() => setIsPlaying(false));
      }
    }
  }, [currentVideo.id, hasStartedPlaying]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    setHasStartedPlaying(true);
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const cyclePlaybackRate = () => {
    if (!videoRef.current) return;
    const speeds = [1, 1.25, 1.5, 2];
    const nextIdx = (speeds.indexOf(playbackSpeed) + 1) % speeds.length;
    const nextSpeed = speeds[nextIdx];
    videoRef.current.playbackRate = nextSpeed;
    setPlaybackSpeed(nextSpeed);
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      if (videoRef.current.duration && !isNaN(videoRef.current.duration)) {
        setDuration(videoRef.current.duration);
      }
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = val;
      setCurrentTime(val);
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds < 0) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div
      ref={containerRef}
      id="cinema-screen"
      className="relative w-full bg-[#0a0a0d] border-2 sm:border-3 border-black text-white p-3 sm:p-5 mb-8 sm:mb-10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] rounded-xs overflow-hidden select-none transition-all"
    >
      {/* Cinema Screen Frame Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b border-white/15 text-[10px] sm:text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse" />
          <span className="font-bold text-red-500 uppercase tracking-wider">
            {currentLang === 'ar' ? 'شاشة العرض السينمائية المباشرة' : currentLang === 'fr' ? 'Écran Cinéma Direct' : 'In-Portfolio Cinema Screen'}
          </span>
          <span className="text-neutral-500">·</span>
          <span className="px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] font-bold uppercase rounded-[2px]">
            {currentLang === 'ar' ? 'فيديو حقيقي من Drive' : 'Real Drive Video'}
          </span>
        </div>

        <div className="flex items-center gap-3 text-neutral-400">
          <span className="text-amber-400 font-bold hidden sm:inline">PRO AUDIO · 1080P/4K</span>
          <span className="hidden sm:inline">·</span>
          <button
            onClick={() => setAspectRatio(aspectRatio === 'cinema' ? 'original' : 'cinema')}
            className="px-2 py-0.5 bg-white/10 hover:bg-white/20 text-neutral-200 text-[10px] rounded-[2px] transition-colors cursor-pointer"
            title="Toggle Aspect Ratio"
          >
            {aspectRatio === 'cinema' ? 'Cinema Wide' : 'Fit Reel'}
          </button>
          <a
            href={currentVideo.link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-red-400 hover:text-white flex items-center gap-1 font-bold transition-colors"
            title="Open original video directly in Google Drive"
          >
            <span>Drive</span>
            <span>↗</span>
          </a>
        </div>
      </div>

      {/* Screen Viewport with Ambient Lighting Reflection and Background Glow */}
      <div
        className={`relative w-full bg-black mx-auto overflow-hidden border border-white/20 transition-all duration-300 flex items-center justify-center ${
          aspectRatio === 'cinema' ? 'aspect-[16/10] sm:aspect-video max-h-[580px]' : 'aspect-square sm:aspect-video max-h-[620px]'
        }`}
        style={{
          boxShadow: isPlaying
            ? '0 0 50px rgba(220, 38, 38, 0.3), inset 0 0 30px rgba(0,0,0,0.85)'
            : 'inset 0 0 30px rgba(0,0,0,0.95)',
        }}
      >
        {/* Ambient Blurred Video Duplicate in background for vertical reels */}
        <video
          src={currentVideo.videoUrl}
          playsInline
          muted
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover filter blur-2xl opacity-30 pointer-events-none scale-110"
        />

        {/* Foreground Main HTML5 Video Player */}
        <video
          ref={videoRef}
          src={currentVideo.videoUrl}
          poster={currentVideo.image}
          playsInline
          preload="metadata"
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleTimeUpdate}
          onEnded={() => setIsPlaying(false)}
          onClick={togglePlay}
          className="relative z-10 w-full h-full object-contain cursor-pointer"
        />

        {/* Big Central Cinema Play Button Overlay when paused */}
        {!isPlaying && (
          <button
            onClick={togglePlay}
            className="absolute inset-0 m-auto w-16 h-16 sm:w-22 sm:h-22 bg-red-600/90 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-2xl sm:text-3xl shadow-[0_0_35px_rgba(220,38,38,0.7)] transform hover:scale-110 active:scale-95 transition-all cursor-pointer backdrop-blur-xs z-20 border-2 border-white/50"
            aria-label="Play Real Video on Cinema Screen"
          >
            ▶
          </button>
        )}

        {/* Video Info Overlay Banner */}
        <div className="absolute top-3 left-3 bg-black/85 backdrop-blur-md px-3 py-1.5 border border-white/20 text-[10px] sm:text-[11px] font-mono rounded-xs pointer-events-none flex items-center gap-2 z-20">
          <span className="text-red-500 font-bold">PLAYING:</span>
          <span className="text-white font-bold tracking-tight">{currentVideo.title}</span>
        </div>

        {/* Real Drive Duration pill */}
        <div className="absolute top-3 right-3 bg-black/85 backdrop-blur-md px-2 py-1 border border-white/20 text-[10px] font-mono rounded-xs pointer-events-none text-neutral-300 z-20">
          <span>LEN: {currentVideo.duration || '0:15'}</span>
        </div>
      </div>

      {/* Cinema Controls Bar */}
      <div className="mt-3 pt-3 border-t border-white/15 flex flex-col sm:flex-row items-center justify-between gap-3 font-mono text-xs">
        {/* Left: Play/Pause, Time, Mute, Speed */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-start">
          <button
            onClick={togglePlay}
            className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 active:scale-95 text-white font-bold rounded-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-[2px_2px_0px_#000]"
          >
            <span>{isPlaying ? '⏸' : '▶'}</span>
            <span>{isPlaying ? 'Pause' : 'Play'}</span>
          </button>

          <button
            onClick={toggleMute}
            className="px-2.5 py-1.5 bg-white/10 hover:bg-white/20 active:scale-95 text-white rounded-xs transition-colors cursor-pointer"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? '🔇 Muted' : '🔊 Sound'}
          </button>

          <button
            onClick={cyclePlaybackRate}
            className="px-2 py-1.5 bg-white/10 hover:bg-white/20 active:scale-95 text-neutral-300 hover:text-white rounded-xs transition-colors cursor-pointer text-[10px]"
            title="Playback Speed"
          >
            {playbackSpeed}x
          </button>

          <span className="text-neutral-400 tabular-nums text-[11px] min-w-[85px]">
            {formatTime(currentTime)} / {formatTime(duration || 15)}
          </span>
        </div>

        {/* Center: Scrubber Range */}
        <div className="w-full sm:flex-1 sm:max-w-md px-1 sm:px-4">
          <input
            type="range"
            min={0}
            max={duration || 15}
            step={0.1}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-red-600"
            aria-label="Cinema timeline scrubber"
          />
        </div>

        {/* Right: Video Selector Pills & Fullscreen */}
        <div className="flex items-center gap-2 self-end sm:self-center">
          <div className="flex items-center gap-1 bg-black/60 p-0.5 border border-white/10 rounded-xs overflow-x-auto max-w-[260px] sm:max-w-md no-scrollbar">
            {videoList.map((vid, idx) => (
              <button
                key={vid.id}
                onClick={() => {
                  setHasStartedPlaying(true);
                  onSelectVideo(vid);
                }}
                className={`px-2 py-1 text-[10px] rounded-xs transition-all cursor-pointer whitespace-nowrap ${
                  currentVideo.id === vid.id
                    ? 'bg-red-600 text-white font-bold shadow-xs'
                    : 'text-neutral-400 hover:text-white hover:bg-white/5'
                }`}
                title={vid.title}
              >
                0{idx + 1}
              </button>
            ))}
          </div>

          <button
            onClick={toggleFullscreen}
            className="px-2.5 py-1.5 bg-white/10 hover:bg-white/20 text-neutral-300 hover:text-white rounded-xs text-[11px] transition-colors cursor-pointer"
            title="Toggle Cinema Fullscreen"
          >
            {isFullscreen ? 'Exit ⛶' : 'Fullscreen ⛶'}
          </button>
        </div>
      </div>
    </div>
  );
};
