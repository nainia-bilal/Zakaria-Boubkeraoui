import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Repeat,
  Film,
  Music,
  Type,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  ZoomIn,
  ZoomOut,
  ArrowLeft,
  ExternalLink,
  Search,
  Trash2,
  Plus,
  RotateCcw,
  Sparkles,
  Scissors,
} from 'lucide-react';
import { type ProjectItem } from '../utils/portfolioLogic';
import {
  parseDurationToSeconds,
  formatTimecode,
  calculatePlayheadPercent,
  calculateTimeFromScrubRatio,
  generateTimelineRulerTicks,
  buildProjectTracks,
  buildVideoCssFilter,
  getEffectPresetValues,
  getNextEffectPreset,
  getNextSoundBed,
  addCutMarkerAtTime,
  DEFAULT_TEXT_OVERLAY,
  DEFAULT_EFFECT_SETTINGS,
  DEFAULT_AUDIO_SETTINGS,
  type VideoTextOverlay,
  type VideoEffectSettings,
  type VideoAudioSettings,
  type CutMarker,
} from '../utils/nleTimelineLogic';
import { NleSoundBedEngine } from '../utils/nleAudioSynth';
import { VideoInspectorPanel, EFFECT_PRESETS, SOUND_BEDS, type InspectorTabId } from './VideoInspectorPanel';

interface VideoEditorWorkspaceProps {
  videos: ProjectItem[];
  selectedVideo: ProjectItem;
  onSelectVideo: (video: ProjectItem) => void;
  onExitStudio?: () => void;
  onRemoveVideo?: (videoId: string) => void;
  onOpenAddDrive?: () => void;
  onRestoreDefaults?: () => void;
  hasRemovedDefaults?: boolean;
  driveVaultUrl?: string;
  currentLang: 'en' | 'fr' | 'ar';
}

const WAVEFORM_HEIGHTS = [28, 52, 74, 42, 86, 60, 35, 90, 68, 48, 78, 55, 32, 82, 64, 44, 72, 50, 88, 38, 62, 76, 40, 58];
const DEFAULT_DRIVE_VAULT_URL = 'https://drive.google.com/drive/folders/15x_vZ97LLGQ1aJeQYS8_ejOTzOalYXNe';

export const VideoEditorWorkspace: React.FC<VideoEditorWorkspaceProps> = ({
  videos,
  selectedVideo,
  onSelectVideo,
  onExitStudio,
  onRemoveVideo,
  onOpenAddDrive,
  onRestoreDefaults,
  hasRemovedDefaults = false,
  driveVaultUrl = DEFAULT_DRIVE_VAULT_URL,
  currentLang,
}) => {
  const workspaceRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const timelineTrackCanvasRef = useRef<HTMLDivElement>(null);
  const isScrubbingRef = useRef(false);
  const pendingSeekRef = useRef<number | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(() => parseDurationToSeconds(selectedVideo.duration));
  const [aspectMode, setAspectMode] = useState<'contain' | 'cover'>('contain');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [poolQuery, setPoolQuery] = useState('');
  const [timelineZoom, setTimelineZoom] = useState<1 | 1.5 | 2>(1);
  const [failedThumbs, setFailedThumbs] = useState<Record<string, boolean>>({});
  const isDriveEmbed = Boolean(selectedVideo.driveEmbedUrl && !selectedVideo.videoUrl);

  // Interactive non-destructive UX editing state (original video file stays untouched)
  const [textOverlay, setTextOverlay] = useState<VideoTextOverlay>(DEFAULT_TEXT_OVERLAY);
  const [effects, setEffects] = useState<VideoEffectSettings>(DEFAULT_EFFECT_SETTINGS);
  const [audioSettings, setAudioSettings] = useState<VideoAudioSettings>(DEFAULT_AUDIO_SETTINGS);
  const [inspectorTab, setInspectorTab] = useState<InspectorTabId>('text');
  const [cutMarkers, setCutMarkers] = useState<CutMarker[]>([]);
  const [lastActionFeedback, setLastActionFeedback] = useState<string>('Ready · Non-destructive preview');
  const soundEngineRef = useRef<NleSoundBedEngine | null>(null);

  // Interactive track state (real working NLE toggles)
  const [hideOverlayTrack, setHideOverlayTrack] = useState(false);
  const [lockMainTrack, setLockMainTrack] = useState(false);
  const [mutedAudioTracks, setMutedAudioTracks] = useState<{ A1: boolean; A2: boolean }>({
    A1: false,
    A2: false,
  });

  // Fallback duration when video changes
  const estimatedDuration = useMemo(
    () => parseDurationToSeconds(selectedVideo.duration),
    [selectedVideo.duration]
  );

  const effectiveDuration = duration > 0 ? duration : estimatedDuration;
  const playheadPercent = calculatePlayheadPercent(currentTime, effectiveDuration);

  const hasCustomEdits =
    textOverlay.enabled ||
    effects.preset !== 'none' ||
    effects.brightness !== 100 ||
    effects.contrast !== 100 ||
    effects.saturate !== 100 ||
    effects.vignette ||
    audioSettings.originalVolume !== 100 ||
    audioSettings.ambientTrack !== 'none';

  const activeEffectLabel = useMemo(() => {
    if (effects.preset !== 'none') {
      return EFFECT_PRESETS.find((p) => p.id === effects.preset)?.label;
    }
    if (effects.brightness !== 100 || effects.contrast !== 100 || effects.saturate !== 100 || effects.vignette) {
      return 'Custom Grade';
    }
    return undefined;
  }, [effects]);

  const activeSoundBedLabel = useMemo(() => {
    if (audioSettings.ambientTrack === 'none') return undefined;
    return SOUND_BEDS.find((b) => b.id === audioSettings.ambientTrack)?.label;
  }, [audioSettings.ambientTrack]);

  const tracks = useMemo(
    () =>
      buildProjectTracks(selectedVideo, {
        customText: textOverlay.enabled ? textOverlay.content : undefined,
        effectLabel: activeEffectLabel,
        soundBedLabel: activeSoundBedLabel,
      }),
    [selectedVideo, textOverlay.enabled, textOverlay.content, activeEffectLabel, activeSoundBedLabel]
  );
  const rulerTicks = useMemo(
    () => generateTimelineRulerTicks(effectiveDuration, timelineZoom === 2 ? 12 : 8),
    [effectiveDuration, timelineZoom]
  );

  const filteredPool = useMemo(() => {
    const q = poolQuery.trim().toLowerCase();
    if (!q) return videos;
    return videos.filter(
      (v) =>
        v.title.toLowerCase().includes(q) ||
        v.tools.some((t) => t.toLowerCase().includes(q))
    );
  }, [videos, poolQuery]);

  // Reset playback state cleanly whenever user picks a new clip from the Media Pool
  useEffect(() => {
    const vid = videoRef.current;
    pendingSeekRef.current = null;
    setCurrentTime(0);
    setCutMarkers([]);
    setDuration(parseDurationToSeconds(selectedVideo.duration));
    setLastActionFeedback(`Loaded · ${selectedVideo.title}`);
    if (vid) {
      vid.currentTime = 0;
      vid.playbackRate = playbackSpeed;
      vid.muted = isMuted || (mutedAudioTracks.A1 && mutedAudioTracks.A2);
      if (isPlaying) {
        vid.play().catch(() => setIsPlaying(false));
      }
    }
    // Intentionally trigger only when switching the active clip
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedVideo.id]);

  // Simulated timeline playhead advancement for Google Drive iframe clips
  useEffect(() => {
    if (!isDriveEmbed || !isPlaying) return;
    const stepMs = 100;
    const timer = window.setInterval(() => {
      setCurrentTime((prev) => {
        const next = prev + (stepMs / 1000) * playbackSpeed;
        if (next >= effectiveDuration) {
          if (isLooping) return 0;
          setIsPlaying(false);
          return effectiveDuration;
        }
        return next;
      });
    }, stepMs);
    return () => clearInterval(timer);
  }, [isDriveEmbed, isPlaying, playbackSpeed, effectiveDuration, isLooping]);

  // Link <video> metadata + timeupdate events + smooth 60fps rAF playhead sync
  useEffect(() => {
    if (isDriveEmbed) return;
    const vid = videoRef.current;
    if (!vid) return;

    const applyPendingSeekIfReady = () => {
      if (pendingSeekRef.current !== null && vid.readyState >= 1) {
        const target = pendingSeekRef.current;
        pendingSeekRef.current = null;
        vid.currentTime = target;
      }
    };

    const syncFromVideo = () => {
      applyPendingSeekIfReady();
      if (vid.duration && Number.isFinite(vid.duration) && vid.duration > 0) {
        setDuration(vid.duration);
      }
      if (!isScrubbingRef.current && pendingSeekRef.current === null) {
        setCurrentTime(vid.currentTime);
      }
    };

    const handleEnded = () => {
      if (!vid.loop) {
        setIsPlaying(false);
      }
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    vid.addEventListener('loadedmetadata', syncFromVideo);
    vid.addEventListener('canplay', applyPendingSeekIfReady);
    vid.addEventListener('durationchange', syncFromVideo);
    vid.addEventListener('timeupdate', syncFromVideo);
    vid.addEventListener('ended', handleEnded);
    vid.addEventListener('play', handlePlay);
    vid.addEventListener('pause', handlePause);

    let rafId = 0;
    const tick = () => {
      if (!vid.paused && !vid.ended && !isScrubbingRef.current && pendingSeekRef.current === null) {
        setCurrentTime(vid.currentTime);
      }
      rafId = requestAnimationFrame(tick);
    };

    if (isPlaying) {
      rafId = requestAnimationFrame(tick);
    }

    return () => {
      cancelAnimationFrame(rafId);
      vid.removeEventListener('loadedmetadata', syncFromVideo);
      vid.removeEventListener('canplay', applyPendingSeekIfReady);
      vid.removeEventListener('durationchange', syncFromVideo);
      vid.removeEventListener('timeupdate', syncFromVideo);
      vid.removeEventListener('ended', handleEnded);
      vid.removeEventListener('play', handlePlay);
      vid.removeEventListener('pause', handlePause);
    };
  }, [isDriveEmbed, isPlaying, selectedVideo.id]);

  // Sync mute & original video volume cleanly (non-destructive)
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted || mutedAudioTracks.A1 || audioSettings.originalVolume === 0;
      videoRef.current.volume = Math.min(1, Math.max(0, audioSettings.originalVolume / 100));
    }
  }, [isMuted, mutedAudioTracks.A1, audioSettings.originalVolume]);

  // Sync live synthesized Web Audio sound bed with playback & A2 track mute
  useEffect(() => {
    if (!soundEngineRef.current) {
      soundEngineRef.current = new NleSoundBedEngine();
    }
    const engine = soundEngineRef.current;
    const shouldPlayBed =
      isPlaying &&
      audioSettings.ambientTrack !== 'none' &&
      !isMuted &&
      !mutedAudioTracks.A2 &&
      audioSettings.ambientVolume > 0;

    if (shouldPlayBed) {
      engine.start(audioSettings.ambientTrack, audioSettings.ambientVolume);
    } else {
      engine.stop();
    }
  }, [
    isPlaying,
    audioSettings.ambientTrack,
    audioSettings.ambientVolume,
    isMuted,
    mutedAudioTracks.A2,
  ]);

  useEffect(() => {
    return () => {
      soundEngineRef.current?.dispose();
      soundEngineRef.current = null;
    };
  }, []);

  const handleResetEdits = useCallback(() => {
    setTextOverlay(DEFAULT_TEXT_OVERLAY);
    setEffects(DEFAULT_EFFECT_SETTINGS);
    setAudioSettings(DEFAULT_AUDIO_SETTINGS);
    setCutMarkers([]);
    setLastActionFeedback('Reset to original · 0 active edits');
  }, []);

  const handleUxAddText = useCallback(() => {
    setInspectorTab('text');
    setHideOverlayTrack(false);
    setTextOverlay((prev) => {
      const nextEnabled = !prev.enabled;
      const nextContent = prev.content.trim() ? prev.content : DEFAULT_TEXT_OVERLAY.content;
      setLastActionFeedback(
        nextEnabled ? `Text Added · "${nextContent}"` : 'Text overlay hidden'
      );
      return {
        ...prev,
        enabled: nextEnabled,
        content: nextContent,
      };
    });
  }, []);

  const handleUxApplyEffect = useCallback(() => {
    setInspectorTab('effects');
    const nextPresetId = getNextEffectPreset(effects.preset);
    const nextSettings = getEffectPresetValues(nextPresetId);
    const presetLabel = EFFECT_PRESETS.find((p) => p.id === nextPresetId)?.label || 'Original';
    setEffects(nextSettings);
    setLastActionFeedback(
      nextPresetId === 'none' ? 'Effect cleared · Original look' : `Applied Effect · ${presetLabel}`
    );
  }, [effects.preset]);

  const handleUxModifyAudio = useCallback(() => {
    setInspectorTab('audio');
    const nextBedId = getNextSoundBed(audioSettings.ambientTrack);
    const bedLabel = SOUND_BEDS.find((b) => b.id === nextBedId)?.label || 'Original Audio';
    setAudioSettings((prev) => ({
      ...prev,
      ambientTrack: nextBedId,
      ambientVolume: prev.ambientVolume > 0 ? prev.ambientVolume : 45,
    }));
    setLastActionFeedback(
      nextBedId === 'none' ? 'Audio restored · Original mix' : `Modified Audio · ${bedLabel}`
    );
  }, [audioSettings.ambientTrack]);

  const handleUxMarkCut = useCallback(() => {
    setCutMarkers((prev) => {
      const next = addCutMarkerAtTime(prev, currentTime, effectiveDuration);
      if (next.length === prev.length) {
        setLastActionFeedback(`Cut marker already near ${formatTimecode(currentTime)}`);
      } else {
        setLastActionFeedback(`Marked Cut · ${next.length} ${next.length === 1 ? 'marker' : 'markers'}`);
      }
      return next;
    });
  }, [currentTime, effectiveDuration]);

  const togglePlay = useCallback(() => {
    if (isDriveEmbed) {
      setIsPlaying((prev) => !prev);
      return;
    }
    const vid = videoRef.current;
    if (!vid) return;
    if (vid.paused) {
      vid
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    } else {
      vid.pause();
      setIsPlaying(false);
    }
  }, [isDriveEmbed]);

  const stepSeconds = useCallback(
    (delta: number) => {
      const vid = videoRef.current;
      const next = Math.min(effectiveDuration, Math.max(0, currentTime + delta));
      setCurrentTime(next);
      if (vid) {
        if (vid.readyState >= 1) {
          pendingSeekRef.current = null;
          vid.currentTime = next;
        } else {
          pendingSeekRef.current = next;
        }
      }
    },
    [currentTime, effectiveDuration]
  );

  const cycleSpeed = useCallback(() => {
    const speeds = [0.5, 1, 1.25, 1.5, 2];
    const next = speeds[(speeds.indexOf(playbackSpeed) + 1) % speeds.length];
    setPlaybackSpeed(next);
    if (videoRef.current) {
      videoRef.current.playbackRate = next;
    }
  }, [playbackSpeed]);

  const toggleFullscreen = useCallback(() => {
    const el = workspaceRef.current;
    if (!el) return;
    if (!document.fullscreenElement) {
      el.requestFullscreen()
        .then(() => setIsFullscreen(true))
        .catch(() => {});
    } else {
      document.exitFullscreen()
        .then(() => setIsFullscreen(false))
        .catch(() => {});
    }
  }, []);

  // Timeline scrub pointer handlers
  const seekAtClientX = useCallback(
    (clientX: number) => {
      const canvas = timelineTrackCanvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      if (rect.width <= 0) return;
      const ratio = (clientX - rect.left) / rect.width;
      const targetSeconds = calculateTimeFromScrubRatio(ratio, effectiveDuration);
      setCurrentTime(targetSeconds);
      const vid = videoRef.current;
      if (vid) {
        if (vid.readyState >= 1) {
          pendingSeekRef.current = null;
          vid.currentTime = targetSeconds;
        } else {
          pendingSeekRef.current = targetSeconds;
        }
      }
    },
    [effectiveDuration]
  );

  const handleTimelinePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (lockMainTrack) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    isScrubbingRef.current = true;
    seekAtClientX(e.clientX);
  };

  const handleTimelinePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isScrubbingRef.current) return;
    seekAtClientX(e.clientX);
  };

  const handleTimelinePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isScrubbingRef.current) return;
    isScrubbingRef.current = false;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  };

  const handleSelectPoolItem = (vid: ProjectItem) => {
    onSelectVideo(vid);
    if (vid.driveEmbedUrl && !vid.videoUrl) {
      setIsPlaying(true);
      return;
    }
    // Auto-start playback when switching clips inside the editing pool
    setTimeout(() => {
      if (videoRef.current) {
        videoRef.current
          .play()
          .then(() => setIsPlaying(true))
          .catch(() => setIsPlaying(false));
      }
    }, 40);
  };

  const labels = {
    studioTitle:
      currentLang === 'ar'
        ? 'استوديو المونتاج التفاعلي'
        : currentLang === 'fr'
        ? 'Atelier de Montage Vidéo'
        : 'NLE Editing Workspace',
    mediaPool: currentLang === 'ar' ? 'مكتبة المقاطع' : currentLang === 'fr' ? 'Médias du Projet' : 'Media Pool',
    programMonitor: currentLang === 'ar' ? 'شاشة العرض' : currentLang === 'fr' ? 'Moniteur Programme' : 'Program Monitor',
    timelineLabel: currentLang === 'ar' ? 'المخطط الزمني' : currentLang === 'fr' ? 'Timeline Active' : 'Active Timeline',
    exitLabel: currentLang === 'ar' ? 'العودة للكروت' : currentLang === 'fr' ? 'Vue Carrousel' : '3D Carousel View',
    searchPlaceholder: currentLang === 'ar' ? 'بحث في المقاطع...' : currentLang === 'fr' ? 'Filtrer les clips...' : 'Filter clips...',
  };

  return (
    <div
      ref={workspaceRef}
      data-testid="nle-editor-workspace"
      className="w-full bg-[#F9F9F6] border-2 border-neutral-900 text-neutral-900 shadow-[6px_6px_0px_#121212] rounded-lg overflow-hidden select-none"
    >
      {/* 1. TOP WORKSPACE TOOLBAR */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-white border-b border-neutral-300">
        <div className="flex items-center gap-3 min-w-0">
          {onExitStudio && (
            <button
              type="button"
              onClick={onExitStudio}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 border border-neutral-300 text-neutral-800 text-xs font-mono font-bold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{labels.exitLabel}</span>
            </button>
          )}

          <div className="min-w-0">
            <div className="flex items-center gap-2 text-[11px] font-mono text-neutral-500">
              <span className="font-semibold text-neutral-800">{labels.studioTitle}</span>
              <span aria-hidden="true">·</span>
              <span className="truncate">{selectedVideo.title}</span>
              <span aria-hidden="true" className="hidden sm:inline">·</span>
              <span className="hidden sm:inline tabular-nums">1080×1920 / 30fps</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <a
            href={selectedVideo.link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-neutral-100 border border-neutral-300 text-neutral-700 text-xs font-mono font-semibold rounded-md transition-colors whitespace-nowrap shrink-0"
          >
            <span>Google Drive</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <button
            type="button"
            onClick={toggleFullscreen}
            aria-label={isFullscreen ? 'Exit studio fullscreen' : 'Enter studio fullscreen'}
            className="inline-flex items-center justify-center w-8 h-8 bg-white hover:bg-neutral-100 border border-neutral-300 text-neutral-700 rounded-md transition-colors cursor-pointer shrink-0"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* 1B. UX-FOCUSED SIMULATED EDITING ACTION TOOLBAR */}
      <div
        role="toolbar"
        aria-label="Quick video editing actions"
        data-testid="nle-ux-toolbar"
        className="flex flex-wrap items-center justify-between gap-2.5 px-4 py-2.5 bg-[#F4F3EE] border-b border-neutral-300"
      >
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleUxAddText}
            aria-pressed={textOverlay.enabled}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold rounded-md border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              textOverlay.enabled
                ? 'bg-neutral-900 border-neutral-900 text-white shadow-xs'
                : 'bg-white hover:bg-neutral-100 border-neutral-300 text-neutral-800'
            }`}
          >
            <Type className="w-3.5 h-3.5" />
            <span>Add Text</span>
          </button>

          <button
            type="button"
            onClick={handleUxApplyEffect}
            aria-pressed={effects.preset !== 'none'}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold rounded-md border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              effects.preset !== 'none'
                ? 'bg-red-600 border-red-600 text-white shadow-xs'
                : 'bg-white hover:bg-neutral-100 border-neutral-300 text-neutral-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Apply Effect</span>
          </button>

          <button
            type="button"
            onClick={handleUxModifyAudio}
            aria-pressed={audioSettings.ambientTrack !== 'none'}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold rounded-md border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              audioSettings.ambientTrack !== 'none'
                ? 'bg-neutral-900 border-neutral-900 text-white shadow-xs'
                : 'bg-white hover:bg-neutral-100 border-neutral-300 text-neutral-800'
            }`}
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>Modify Audio</span>
          </button>

          <button
            type="button"
            onClick={handleUxMarkCut}
            aria-pressed={cutMarkers.length > 0}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold rounded-md border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              cutMarkers.length > 0
                ? 'bg-neutral-900 border-neutral-900 text-white shadow-xs'
                : 'bg-white hover:bg-neutral-100 border-neutral-300 text-neutral-800'
            }`}
          >
            <Scissors className="w-3.5 h-3.5" />
            <span>
              {cutMarkers.length > 0 ? `Mark Cut (${cutMarkers.length})` : 'Mark Cut'}
            </span>
          </button>

          {(hasCustomEdits || cutMarkers.length > 0) && (
            <button
              type="button"
              onClick={handleResetEdits}
              aria-label="Reset all simulated edits"
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-white hover:bg-red-50 border border-red-300 text-red-700 text-xs font-mono font-bold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>

        {/* Live Unboxed UI State Feedback */}
        <div
          data-testid="nle-ux-status"
          aria-live="polite"
          className="flex flex-wrap items-center gap-2 text-[11px] font-mono text-neutral-700"
        >
          <span className="font-semibold text-neutral-900">{lastActionFeedback}</span>
          {(activeEffectLabel || activeSoundBedLabel || textOverlay.enabled || cutMarkers.length > 0) && (
            <>
              <span aria-hidden="true" className="text-neutral-400">·</span>
              <span className="text-neutral-600 tabular-nums">
                {[
                  textOverlay.enabled ? 'Text On' : null,
                  activeEffectLabel ? `FX: ${activeEffectLabel}` : null,
                  activeSoundBedLabel ? `Audio: ${activeSoundBedLabel}` : null,
                  cutMarkers.length > 0 ? `${cutMarkers.length} Cut${cutMarkers.length > 1 ? 's' : ''}` : null,
                ]
                  .filter(Boolean)
                  .join(' · ')}
              </span>
            </>
          )}
        </div>
      </div>

      {/* 2. MAIN WORKSPACE GRID: MEDIA POOL + PREVIEW MONITOR + INSPECTOR */}
      <div className="grid grid-cols-1 lg:grid-cols-12 border-b border-neutral-300">
        {/* LEFT SIDEBAR: MEDIA POOL */}
        <aside
          aria-label={labels.mediaPool}
          className="lg:col-span-3 bg-[#F4F3EE] border-b lg:border-b-0 lg:border-r border-neutral-300 flex flex-col max-h-[250px] lg:max-h-[420px]"
        >
          {/* Media Pool Header & Search */}
          <div className="p-3 bg-white border-b border-neutral-200 space-y-2.5 shrink-0">
            <div className="flex items-center justify-between">
              <h4 className="font-display font-bold text-xs uppercase tracking-wider text-neutral-900">
                {labels.mediaPool}
              </h4>
              <span className="text-[11px] font-mono text-neutral-500 tabular-nums">
                {filteredPool.length} / {videos.length} clips
              </span>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={poolQuery}
                onChange={(e) => setPoolQuery(e.target.value)}
                placeholder={labels.searchPlaceholder}
                aria-label="Filter media pool videos"
                className="w-full pl-8 pr-3 py-1.5 bg-[#F9F9F6] border border-neutral-300 rounded-md text-xs text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-900"
              />
            </div>
          </div>

          {/* Scrollable Clip Bin */}
          <div className="p-2.5 space-y-1.5 overflow-y-auto flex-1">
            {filteredPool.length === 0 ? (
              <p className="text-xs font-mono text-neutral-500 p-3 text-center">
                No clips match &ldquo;{poolQuery}&rdquo;
              </p>
            ) : (
              filteredPool.map((vid, idx) => {
                const isActive = vid.id === selectedVideo.id;
                const hasFailedThumb = Boolean(failedThumbs[vid.id]) || !vid.image;
                return (
                  <div
                    key={vid.id}
                    className={`w-full flex items-center gap-1.5 p-1.5 rounded-md border transition-colors group ${
                      isActive
                        ? 'bg-white border-red-600 shadow-xs'
                        : 'bg-white/70 hover:bg-white border-neutral-200 hover:border-neutral-400'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => handleSelectPoolItem(vid)}
                      aria-current={isActive ? 'true' : undefined}
                      className="flex items-center gap-2.5 flex-1 min-w-0 text-left p-0.5 cursor-pointer"
                    >
                      {/* Thumbnail */}
                      <div className="relative w-14 h-10 rounded-sm overflow-hidden bg-neutral-200 border border-neutral-300 shrink-0 flex items-center justify-center">
                        {hasFailedThumb ? (
                          <Film className="w-4 h-4 text-neutral-500" />
                        ) : (
                          <img
                            src={vid.image}
                            alt={vid.title}
                            referrerPolicy="no-referrer"
                            onError={() =>
                              setFailedThumbs((prev) =>
                                prev[vid.id] ? prev : { ...prev, [vid.id]: true }
                              )
                            }
                            className="w-full h-full object-cover"
                          />
                        )}
                        <span className="absolute bottom-0.5 right-0.5 px-1 bg-neutral-900/80 text-white text-[9px] font-mono tabular-nums rounded-[2px]">
                          {vid.duration || '0:30'}
                        </span>
                      </div>

                      {/* Clip Metadata */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <span
                            className={`text-[10px] font-mono tabular-nums ${
                              isActive ? 'text-red-600 font-bold' : 'text-neutral-500'
                            }`}
                          >
                            Clip {String(idx + 1).padStart(2, '0')}
                            {vid.isCustomAdded ? ' · Drive' : ''}
                          </span>
                          {isActive && (
                            <span className="text-[10px] font-mono font-bold text-red-600">
                              Active
                            </span>
                          )}
                        </div>
                        <p className="text-xs font-semibold text-neutral-900 truncate mt-0.5">
                          {vid.title}
                        </p>
                        <p className="text-[10px] font-mono text-neutral-500 truncate">
                          {vid.tools.slice(0, 2).join(' · ')}
                        </p>
                      </div>
                    </button>

                    {onRemoveVideo && (
                      <button
                        type="button"
                        onClick={() => onRemoveVideo(vid.id)}
                        aria-label={`Remove ${vid.title} from Media Pool`}
                        title={`Remove ${vid.title}`}
                        className="w-7 h-7 inline-flex items-center justify-center rounded-sm border border-transparent hover:border-red-300 hover:bg-red-50 text-neutral-400 hover:text-red-600 transition-colors shrink-0 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Media Pool Action Footer: Direct Drive Link + Add Reel */}
          <div className="p-2.5 bg-white border-t border-neutral-200 flex flex-wrap items-center gap-1.5 shrink-0">
            {onOpenAddDrive && (
              <button
                type="button"
                onClick={onOpenAddDrive}
                className="flex-1 inline-flex items-center justify-center gap-1 px-2.5 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white text-[11px] font-mono font-bold rounded-sm transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add from Drive</span>
              </button>
            )}
            <a
              href={driveVaultUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Open Google Drive folder to choose a video"
              className="inline-flex items-center justify-center gap-1 px-2.5 py-1.5 bg-neutral-100 hover:bg-neutral-200 border border-neutral-300 text-neutral-800 text-[11px] font-mono font-semibold rounded-sm transition-colors whitespace-nowrap shrink-0"
            >
              <span>Drive</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            {hasRemovedDefaults && onRestoreDefaults && (
              <button
                type="button"
                onClick={onRestoreDefaults}
                aria-label="Restore 8 default reels"
                title="Restore 8 default reels"
                className="w-full inline-flex items-center justify-center gap-1 px-2 py-1 bg-neutral-100 hover:bg-neutral-200 border border-neutral-300 text-neutral-700 text-[10px] font-mono font-semibold rounded-sm transition-colors whitespace-nowrap cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Restore 8 Default Reels</span>
              </button>
            )}
          </div>
        </aside>

        {/* CENTER/MAIN VIEW: PREVIEW MONITOR */}
        <div className="lg:col-span-6 bg-[#F7F7F3] flex flex-col justify-between">
          {/* Monitor Sub-header */}
          <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2 bg-white border-b border-neutral-200 text-xs font-mono">
            <div className="flex items-center gap-2 text-neutral-700 min-w-0">
              <span className="font-bold text-neutral-900 shrink-0">{labels.programMonitor}</span>
              <span aria-hidden="true">·</span>
              <span className="text-neutral-500 truncate max-w-[180px] sm:max-w-[240px]">
                {selectedVideo.title}
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {!isDriveEmbed && (
                <button
                  type="button"
                  onClick={() => setAspectMode(aspectMode === 'contain' ? 'cover' : 'contain')}
                  className="px-2.5 py-1 bg-neutral-100 hover:bg-neutral-200 border border-neutral-300 text-neutral-700 text-[11px] font-mono rounded-sm transition-colors cursor-pointer whitespace-nowrap"
                >
                  {aspectMode === 'contain' ? 'Fit Frame' : 'Fill Frame'}
                </button>
              )}
              <span
                data-testid="nle-timecode-display"
                className="px-2.5 py-1 bg-neutral-900 text-white text-xs font-mono font-bold tabular-nums rounded-sm"
              >
                {formatTimecode(currentTime)}
              </span>
            </div>
          </div>

          {/* Neutral Framed Video Viewport */}
          <div className="p-3 sm:p-4 flex-1 flex items-center justify-center bg-[#EFECE6]">
            <div className="relative w-full max-w-2xl h-[240px] sm:h-[300px] lg:h-[310px] bg-neutral-950 border border-neutral-400 rounded-md overflow-hidden shadow-sm flex items-center justify-center">
              {isDriveEmbed ? (
                <div
                  className="w-full h-full"
                  style={{ filter: buildVideoCssFilter(effects) }}
                  data-testid="nle-preview-drive-frame"
                >
                  <iframe
                    src={selectedVideo.driveEmbedUrl}
                    title={selectedVideo.title}
                    allow="autoplay; fullscreen"
                    className="w-full h-full border-0"
                  />
                </div>
              ) : (
                <video
                  ref={videoRef}
                  src={selectedVideo.videoUrl}
                  poster={selectedVideo.image}
                  playsInline
                  loop={isLooping}
                  preload="metadata"
                  onClick={togglePlay}
                  data-testid="nle-preview-video"
                  style={{ filter: buildVideoCssFilter(effects) }}
                  className={`w-full h-full cursor-pointer ${
                    aspectMode === 'contain' ? 'object-contain' : 'object-cover'
                  }`}
                />
              )}

              {/* Subtle Cinematic Vignette Overlay when enabled */}
              {effects.vignette && (
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0"
                  style={{
                    background:
                      'radial-gradient(circle, rgba(0,0,0,0) 48%, rgba(0,0,0,0.62) 100%)',
                  }}
                />
              )}

              {/* Subtle Retro Scanlines Overlay for VHS Preset */}
              {effects.preset === 'vhs-retro' && (
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 opacity-20"
                  style={{
                    backgroundImage:
                      'repeating-linear-gradient(0deg, rgba(255,255,255,0.22) 0px, rgba(255,255,255,0.22) 1px, transparent 1px, transparent 3px)',
                  }}
                />
              )}

              {/* Live Non-Destructive User Text Overlay */}
              {textOverlay.enabled && textOverlay.content.trim() && !hideOverlayTrack && (
                <div
                  data-testid="nle-live-text-overlay"
                  className={`pointer-events-none absolute inset-x-4 flex justify-center z-10 ${
                    textOverlay.position === 'top'
                      ? 'top-4'
                      : textOverlay.position === 'center'
                      ? 'top-1/2 -translate-y-1/2'
                      : 'bottom-4'
                  }`}
                >
                  <span
                    style={{ color: textOverlay.color }}
                    className={`max-w-[90%] text-center break-words leading-tight ${
                      textOverlay.style === 'caption'
                        ? 'px-3 py-1 bg-black/75 rounded-sm font-mono font-bold text-sm sm:text-base shadow-md'
                        : textOverlay.style === 'bold'
                        ? 'font-display font-black text-xl sm:text-2xl uppercase tracking-tight drop-shadow-[0_2px_6px_rgba(0,0,0,0.85)]'
                        : 'font-mono font-semibold text-sm sm:text-base tracking-wide drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]'
                    }`}
                  >
                    {textOverlay.content}
                  </span>
                </div>
              )}

              {/* Subtle Title Overlay Preview when V2 Track is Visible & Custom Text disabled */}
              {!hideOverlayTrack && !isPlaying && !textOverlay.enabled && !isDriveEmbed && (
                <div className="pointer-events-none absolute bottom-3 left-3 right-3 flex items-end justify-between gap-2">
                  <div className="px-3 py-1.5 bg-white/95 border border-neutral-300 rounded-sm shadow-xs max-w-[80%]">
                    <p className="text-[11px] font-mono font-bold text-neutral-900 truncate">
                      {selectedVideo.title}
                    </p>
                    <p className="text-[10px] font-mono text-neutral-600 truncate">
                      {selectedVideo.tools.join(' · ')}
                    </p>
                  </div>
                </div>
              )}

              {/* Clean Center Play Trigger Overlay when paused on native <video> */}
              {!isPlaying && !isDriveEmbed && (
                <button
                  type="button"
                  onClick={togglePlay}
                  aria-label={`Play ${selectedVideo.title}`}
                  className="absolute inset-0 m-auto w-14 h-14 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-105 active:scale-95 cursor-pointer z-20"
                >
                  <Play className="w-6 h-6 fill-current ml-0.5" />
                </button>
              )}
            </div>
          </div>

          {/* Editing Tool Transport Controls Bar */}
          <div className="px-4 py-2.5 bg-white border-t border-neutral-200 flex flex-wrap items-center justify-between gap-3">
            {/* Left: Timecode Readout */}
            <div className="flex items-center gap-2 text-xs font-mono tabular-nums text-neutral-600">
              <span className="font-bold text-neutral-900">{formatTimecode(currentTime)}</span>
              <span>/</span>
              <span>{formatTimecode(effectiveDuration)}</span>
            </div>

            {/* Center: Core NLE Transport Buttons */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => stepSeconds(-5)}
                aria-label="Step back 5 seconds"
                className="w-9 h-9 inline-flex items-center justify-center bg-neutral-100 hover:bg-neutral-200 border border-neutral-300 text-neutral-800 rounded-md transition-colors cursor-pointer"
              >
                <SkipBack className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={togglePlay}
                aria-label={isPlaying ? 'Pause video' : 'Play video'}
                className="h-9 px-4 inline-flex items-center gap-1.5 bg-red-600 hover:bg-red-700 active:scale-95 text-white text-xs font-mono font-bold rounded-md transition-all cursor-pointer shadow-xs"
              >
                {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                <span>{isPlaying ? 'Pause' : 'Play'}</span>
              </button>

              <button
                type="button"
                onClick={() => stepSeconds(5)}
                aria-label="Step forward 5 seconds"
                className="w-9 h-9 inline-flex items-center justify-center bg-neutral-100 hover:bg-neutral-200 border border-neutral-300 text-neutral-800 rounded-md transition-colors cursor-pointer"
              >
                <SkipForward className="w-4 h-4" />
              </button>
            </div>

            {/* Right: Speed, Loop, Mute */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={cycleSpeed}
                aria-label={`Playback speed ${playbackSpeed}x`}
                className="h-9 px-2.5 bg-neutral-100 hover:bg-neutral-200 border border-neutral-300 text-neutral-800 text-xs font-mono font-bold tabular-nums rounded-md transition-colors cursor-pointer"
              >
                {playbackSpeed}x
              </button>

              <button
                type="button"
                onClick={() => setIsLooping(!isLooping)}
                aria-label="Toggle loop playback"
                aria-pressed={isLooping}
                className={`w-9 h-9 inline-flex items-center justify-center border rounded-md transition-colors cursor-pointer ${
                  isLooping
                    ? 'bg-neutral-900 border-neutral-900 text-white'
                    : 'bg-neutral-100 hover:bg-neutral-200 border-neutral-300 text-neutral-700'
                }`}
              >
                <Repeat className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setIsMuted(!isMuted)}
                aria-label={isMuted ? 'Unmute audio' : 'Mute audio'}
                aria-pressed={isMuted}
                className={`w-9 h-9 inline-flex items-center justify-center border rounded-md transition-colors cursor-pointer ${
                  isMuted
                    ? 'bg-red-50 border-red-300 text-red-700'
                    : 'bg-neutral-100 hover:bg-neutral-200 border-neutral-300 text-neutral-700'
                }`}
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT INSPECTOR SIDEBAR: NON-DESTRUCTIVE TEXT, EFFECTS & AUDIO */}
        <VideoInspectorPanel
          textOverlay={textOverlay}
          onChangeTextOverlay={setTextOverlay}
          effects={effects}
          onChangeEffects={setEffects}
          audioSettings={audioSettings}
          onChangeAudioSettings={setAudioSettings}
          onResetAll={handleResetEdits}
          hasCustomEdits={hasCustomEdits || cutMarkers.length > 0}
          activeTab={inspectorTab}
          onChangeActiveTab={setInspectorTab}
          currentLang={currentLang}
        />
      </div>

      {/* 3. ACTIVE TIMELINE (BOTTOM VIEW) */}
      <div className="bg-[#F4F3EE]" aria-label={labels.timelineLabel}>
        {/* Timeline Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2 bg-white border-b border-neutral-300 text-xs font-mono">
          <div className="flex items-center gap-2.5 text-neutral-700">
            <span className="font-bold text-neutral-900 uppercase tracking-wider">
              {labels.timelineLabel}
            </span>
            <span aria-hidden="true">·</span>
            <span className="text-neutral-500">4 Tracks (V2, V1, A1, A2)</span>
            <span aria-hidden="true" className="hidden sm:inline">·</span>
            <span className="hidden sm:inline text-neutral-500">
              Click or drag ruler to scrub playhead
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setTimelineZoom((z) => (z === 2 ? 1.5 : 1))}
              aria-label="Zoom out timeline"
              disabled={timelineZoom === 1}
              className="w-7 h-7 inline-flex items-center justify-center bg-neutral-100 hover:bg-neutral-200 disabled:opacity-40 border border-neutral-300 rounded-sm cursor-pointer"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] font-mono tabular-nums text-neutral-600 min-w-[36px] text-center">
              {timelineZoom}x
            </span>
            <button
              type="button"
              onClick={() => setTimelineZoom((z) => (z === 1 ? 1.5 : 2))}
              aria-label="Zoom in timeline"
              disabled={timelineZoom === 2}
              className="w-7 h-7 inline-flex items-center justify-center bg-neutral-100 hover:bg-neutral-200 disabled:opacity-40 border border-neutral-300 rounded-sm cursor-pointer"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Timeline Grid: Fixed Track Headers Left + Horizontally Scrollable Track Canvas Right */}
        <div className="flex relative">
          {/* Track Control Headers Column */}
          <div className="w-28 sm:w-36 shrink-0 bg-white border-r border-neutral-300 z-10">
            {/* Top spacer matching the Timecode Ruler height */}
            <div className="h-8 px-3 border-b border-neutral-300 flex items-center text-[10px] font-mono font-bold text-neutral-500 uppercase">
              Tracks
            </div>

            {tracks.map((track) => {
              const isV2Hidden = track.id === 'V2' && hideOverlayTrack;
              const isV1Locked = track.id === 'V1' && lockMainTrack;
              const isAudioMuted =
                (track.id === 'A1' && mutedAudioTracks.A1) ||
                (track.id === 'A2' && mutedAudioTracks.A2);

              return (
                <div
                  key={track.id}
                  className="h-11 px-2.5 border-b last:border-b-0 border-neutral-200 flex items-center justify-between gap-1.5"
                >
                  <div className="flex items-center gap-1.5 min-w-0">
                    {track.id === 'V2' && <Type className="w-3 h-3 text-neutral-500 shrink-0" />}
                    {track.id === 'V1' && <Film className="w-3 h-3 text-neutral-700 shrink-0" />}
                    {(track.id === 'A1' || track.id === 'A2') && (
                      <Music className="w-3 h-3 text-neutral-500 shrink-0" />
                    )}
                    <div className="min-w-0">
                      <span className="block text-[11px] font-mono font-bold text-neutral-900 leading-none">
                        {track.id}
                      </span>
                      <span className="hidden sm:block text-[9px] text-neutral-500 truncate mt-0.5">
                        {track.name}
                      </span>
                    </div>
                  </div>

                  {/* Working Track Toggle */}
                  {track.id === 'V2' && (
                    <button
                      type="button"
                      onClick={() => setHideOverlayTrack(!hideOverlayTrack)}
                      aria-label={isV2Hidden ? 'Show V2 Captions track' : 'Hide V2 Captions track'}
                      className={`w-6 h-6 inline-flex items-center justify-center rounded-sm border text-[10px] cursor-pointer ${
                        isV2Hidden
                          ? 'bg-neutral-200 border-neutral-300 text-neutral-500'
                          : 'bg-white border-neutral-300 text-neutral-700 hover:bg-neutral-100'
                      }`}
                    >
                      {isV2Hidden ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    </button>
                  )}

                  {track.id === 'V1' && (
                    <button
                      type="button"
                      onClick={() => setLockMainTrack(!lockMainTrack)}
                      aria-label={isV1Locked ? 'Unlock V1 timeline' : 'Lock V1 timeline'}
                      className={`w-6 h-6 inline-flex items-center justify-center rounded-sm border text-[10px] cursor-pointer ${
                        isV1Locked
                          ? 'bg-red-50 border-red-300 text-red-600'
                          : 'bg-white border-neutral-300 text-neutral-700 hover:bg-neutral-100'
                      }`}
                    >
                      {isV1Locked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                    </button>
                  )}

                  {(track.id === 'A1' || track.id === 'A2') && (
                    <button
                      type="button"
                      onClick={() =>
                        setMutedAudioTracks((prev) => ({
                          ...prev,
                          [track.id]: !prev[track.id as 'A1' | 'A2'],
                        }))
                      }
                      aria-label={`Mute ${track.id} audio track`}
                      aria-pressed={isAudioMuted}
                      className={`w-6 h-6 inline-flex items-center justify-center rounded-sm border text-[10px] font-mono font-bold cursor-pointer ${
                        isAudioMuted
                          ? 'bg-red-600 border-red-600 text-white'
                          : 'bg-white border-neutral-300 text-neutral-700 hover:bg-neutral-100'
                      }`}
                    >
                      M
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Right Track Lanes + Timecode Ruler + Moving Playhead */}
          <div className="flex-1 overflow-x-auto relative">
            <div
              ref={timelineTrackCanvasRef}
              onPointerDown={handleTimelinePointerDown}
              onPointerMove={handleTimelinePointerMove}
              onPointerUp={handleTimelinePointerUp}
              onPointerCancel={handleTimelinePointerUp}
              role="slider"
              aria-label="Timeline playhead scrubber"
              aria-valuemin={0}
              aria-valuemax={Math.round(effectiveDuration)}
              aria-valuenow={Math.round(currentTime)}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'ArrowLeft') {
                  e.preventDefault();
                  stepSeconds(-2);
                } else if (e.key === 'ArrowRight') {
                  e.preventDefault();
                  stepSeconds(2);
                } else if (e.key === ' ') {
                  e.preventDefault();
                  togglePlay();
                }
              }}
              style={{ width: `${timelineZoom * 100}%`, minWidth: '100%' }}
              className={`relative select-none ${
                lockMainTrack ? 'cursor-not-allowed' : 'cursor-pointer'
              }`}
            >
              {/* Interactive Timecode Ruler */}
              <div className="h-8 bg-[#EAE9E2] border-b border-neutral-300 relative overflow-hidden">
                {rulerTicks.map((tick, idx) => {
                  const isEdge = idx === 0 || idx === rulerTicks.length - 1;
                  const hideLabelOnMobile = !isEdge && idx % 2 === 1;
                  return (
                    <div
                      key={`${tick.label}-${idx}`}
                      style={{ left: `${tick.percent}%` }}
                      className={`absolute top-0 bottom-0 flex flex-col justify-between pointer-events-none ${
                        idx === rulerTicks.length - 1
                          ? '-translate-x-full pr-1.5'
                          : idx === 0
                          ? 'pl-2.5'
                          : '-translate-x-1/2'
                      }`}
                    >
                      <span
                        className={`text-[10px] font-mono tabular-nums text-neutral-600 pt-0.5 ${
                          hideLabelOnMobile ? 'hidden sm:inline' : ''
                        }`}
                      >
                        {tick.label}
                      </span>
                      <span
                        className={`w-px bg-neutral-400 mx-auto ${
                          tick.isMajor ? 'h-2.5' : 'h-1.5 opacity-60'
                        }`}
                      />
                    </div>
                  );
                })}
              </div>

              {/* Video & Audio Track Lanes */}
              <div className="relative bg-[#F7F6F2]">
                {tracks.map((track) => {
                  const isDimmed =
                    (track.id === 'V2' && hideOverlayTrack) ||
                    (track.id === 'A1' && mutedAudioTracks.A1) ||
                    (track.id === 'A2' && mutedAudioTracks.A2);

                  return (
                    <div
                      key={track.id}
                      className={`h-11 border-b last:border-b-0 border-neutral-200/90 relative transition-opacity ${
                        isDimmed ? 'opacity-35' : 'opacity-100'
                      }`}
                    >
                      {track.clips.map((clip) => {
                        const toneStyles =
                          clip.tone === 'video-main'
                            ? 'bg-white border-neutral-400 text-neutral-900 shadow-[inset_0_2px_0_#171717]'
                            : clip.tone === 'video-overlay'
                            ? 'bg-[#EBE9E1] border-neutral-400 text-neutral-800 shadow-[inset_0_2px_0_#dc2626]'
                            : clip.tone === 'audio-voice'
                            ? 'bg-[#E5ECE9] border-[#9BB6AA] text-neutral-800'
                            : 'bg-[#E6EAEF] border-[#A7B6C7] text-neutral-800';

                        return (
                          <div
                            key={clip.id}
                            style={{
                              left: `${clip.startPercent}%`,
                              width: `${clip.widthPercent}%`,
                            }}
                            className={`absolute top-1.5 bottom-1.5 px-2 rounded-[4px] border text-[10px] font-mono flex items-center justify-between overflow-hidden pointer-events-none ${toneStyles}`}
                          >
                            <span className="truncate font-semibold">{clip.label}</span>

                            {/* Subtle visual waveform bars on audio tracks */}
                            {track.type === 'audio' && (
                              <div
                                aria-hidden="true"
                                className="flex items-center gap-[2px] h-4 ml-2 shrink-0 opacity-65"
                              >
                                {WAVEFORM_HEIGHTS.slice(0, 14).map((h, wIdx) => (
                                  <span
                                    key={wIdx}
                                    style={{ height: `${Math.max(20, h)}%` }}
                                    className="w-[2px] bg-neutral-700 rounded-full"
                                  />
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>

              {/* SIMULATED CUT MARKERS ON TIMELINE */}
              {cutMarkers.map((marker) => (
                <div
                  key={marker.id}
                  data-testid="nle-cut-marker"
                  title={marker.label}
                  style={{ left: `${marker.percent}%` }}
                  className="absolute top-0 bottom-0 -translate-x-1/2 z-[25] pointer-events-none flex flex-col items-center"
                >
                  <div className="w-3 h-3 bg-neutral-900 border-2 border-white shadow-xs rotate-45 mt-5 shrink-0" />
                  <div className="w-px flex-1 border-l border-dashed border-neutral-900/75" />
                </div>
              ))}

              {/* CRUCIAL FEATURE: VERTICAL PLAYHEAD LINE WITH TOP MARKER CAP */}
              <div
                data-testid="nle-playhead"
                data-playhead-percent={playheadPercent.toFixed(2)}
                style={{ left: `${playheadPercent}%` }}
                className="absolute top-0 bottom-0 -translate-x-1/2 z-30 pointer-events-none flex flex-col items-center"
              >
                {/* Playhead Cap Handle at Top Ruler */}
                <div className="w-3.5 h-4 bg-red-600 text-white shadow-sm rounded-t-[2px] flex items-center justify-center shrink-0 clip-playhead-cap">
                  <span className="w-[2px] h-2 bg-white/80 rounded-full" />
                </div>
                {/* Playhead Vertical Hairline */}
                <div className="w-[2px] flex-1 bg-red-600 shadow-[0_0_6px_rgba(220,38,38,0.45)]" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoEditorWorkspace;
