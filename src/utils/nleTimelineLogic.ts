import { type ProjectItem } from './portfolioLogic';

export interface TimelineClip {
  id: string;
  label: string;
  startPercent: number;
  widthPercent: number;
  tone: 'video-main' | 'video-overlay' | 'audio-voice' | 'audio-music';
}

export interface TimelineTrack {
  id: 'V2' | 'V1' | 'A1' | 'A2';
  name: string;
  type: 'video' | 'audio';
  clips: TimelineClip[];
}

export interface RulerTick {
  label: string;
  percent: number;
  isMajor: boolean;
}

/**
 * Parses a duration string like "1:35" or "0:44" into total seconds.
 * Falls back to 30 seconds if missing or invalid.
 */
export function parseDurationToSeconds(durationStr?: string): number {
  if (!durationStr || typeof durationStr !== 'string') return 30;
  const parts = durationStr.trim().split(':').map((n) => Number(n));
  if (parts.some((n) => Number.isNaN(n) || n < 0)) return 30;

  if (parts.length === 2) {
    const [mins, secs] = parts;
    const total = mins * 60 + secs;
    return total > 0 ? total : 30;
  }
  if (parts.length === 3) {
    const [hrs, mins, secs] = parts;
    const total = hrs * 3600 + mins * 60 + secs;
    return total > 0 ? total : 30;
  }
  return 30;
}

/**
 * Formats seconds into SMPTE-style editing timecode: MM:SS:FF (default 30fps).
 */
export function formatTimecode(seconds: number, fps: number = 30): string {
  if (!Number.isFinite(seconds) || seconds < 0) {
    return '00:00:00';
  }
  const safeFps = fps > 0 ? fps : 30;
  const totalFrames = Math.floor(seconds * safeFps);
  const frames = totalFrames % safeFps;
  const totalWholeSeconds = Math.floor(seconds);
  const secs = totalWholeSeconds % 60;
  const mins = Math.floor(totalWholeSeconds / 60);

  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}:${String(frames).padStart(2, '0')}`;
}

/**
 * Formats seconds into compact MM:SS label for timeline ruler markers.
 */
export function formatCompactTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const whole = Math.floor(seconds);
  const mins = Math.floor(whole / 60);
  const secs = whole % 60;
  return `${mins}:${String(secs).padStart(2, '0')}`;
}

/**
 * Computes playhead horizontal percentage [0, 100] from currentTime and duration.
 */
export function calculatePlayheadPercent(currentTime: number, duration: number): number {
  if (!Number.isFinite(currentTime) || !Number.isFinite(duration) || duration <= 0) {
    return 0;
  }
  const ratio = currentTime / duration;
  return Math.min(100, Math.max(0, ratio * 100));
}

/**
 * Computes target video currentTime in seconds from a normalized [0..1] click/drag ratio.
 */
export function calculateTimeFromScrubRatio(ratio: number, duration: number): number {
  if (!Number.isFinite(ratio) || !Number.isFinite(duration) || duration <= 0) {
    return 0;
  }
  const clamped = Math.min(1, Math.max(0, ratio));
  return clamped * duration;
}

/**
 * Generates clean timeline ruler ticks across [0%, 100%].
 */
export function generateTimelineRulerTicks(duration: number, segmentCount: number = 8): RulerTick[] {
  const safeDuration = Number.isFinite(duration) && duration > 0 ? duration : 30;
  const count = Math.max(2, Math.floor(segmentCount));
  const ticks: RulerTick[] = [];

  for (let i = 0; i <= count; i++) {
    const ratio = i / count;
    ticks.push({
      label: formatCompactTime(ratio * safeDuration),
      percent: ratio * 100,
      isMajor: i % 2 === 0,
    });
  }
  return ticks;
}

export interface VideoTextOverlay {
  enabled: boolean;
  content: string;
  position: 'top' | 'center' | 'bottom';
  style: 'caption' | 'bold' | 'minimal';
  color: string;
}

export type EffectPresetId = 'none' | 'cinema-bw' | 'warm-film' | 'vhs-retro' | 'crisp-pop';

export interface VideoEffectSettings {
  preset: EffectPresetId;
  brightness: number; // 50..150 (%)
  contrast: number;   // 50..160 (%)
  saturate: number;   // 0..200 (%)
  vignette: boolean;
}

export type SoundBedId = 'none' | 'lofi-beat' | 'cinematic-pad' | 'upbeat-pulse';

export interface VideoAudioSettings {
  originalVolume: number; // 0..100
  ambientTrack: SoundBedId;
  ambientVolume: number;  // 0..100
}

export const DEFAULT_TEXT_OVERLAY: VideoTextOverlay = {
  enabled: false,
  content: 'ZAKARIA EDIT',
  position: 'bottom',
  style: 'caption',
  color: '#FFFFFF',
};

export const DEFAULT_EFFECT_SETTINGS: VideoEffectSettings = {
  preset: 'none',
  brightness: 100,
  contrast: 100,
  saturate: 100,
  vignette: false,
};

export const DEFAULT_AUDIO_SETTINGS: VideoAudioSettings = {
  originalVolume: 100,
  ambientTrack: 'none',
  ambientVolume: 45,
};

export function getEffectPresetValues(preset: EffectPresetId): VideoEffectSettings {
  switch (preset) {
    case 'cinema-bw':
      return { preset, brightness: 102, contrast: 128, saturate: 0, vignette: true };
    case 'warm-film':
      return { preset, brightness: 105, contrast: 112, saturate: 122, vignette: true };
    case 'vhs-retro':
      return { preset, brightness: 96, contrast: 120, saturate: 85, vignette: true };
    case 'crisp-pop':
      return { preset, brightness: 106, contrast: 118, saturate: 138, vignette: false };
    case 'none':
    default:
      return { ...DEFAULT_EFFECT_SETTINGS };
  }
}

export function buildVideoCssFilter(effects: VideoEffectSettings): string {
  const b = Math.min(180, Math.max(40, effects.brightness));
  const c = Math.min(180, Math.max(40, effects.contrast));
  const s = Math.min(200, Math.max(0, effects.saturate));
  const parts = [`brightness(${b}%)`, `contrast(${c}%)`, `saturate(${s}%)`];
  if (effects.preset === 'warm-film') {
    parts.push('sepia(18%)');
  } else if (effects.preset === 'vhs-retro') {
    parts.push('sepia(24%)', 'hue-rotate(-8deg)');
  }
  return parts.join(' ');
}

const EFFECT_CYCLE_ORDER: EffectPresetId[] = [
  'none',
  'warm-film',
  'cinema-bw',
  'vhs-retro',
  'crisp-pop',
];

export function getNextEffectPreset(current: EffectPresetId): EffectPresetId {
  const idx = EFFECT_CYCLE_ORDER.indexOf(current);
  if (idx === -1) return 'warm-film';
  return EFFECT_CYCLE_ORDER[(idx + 1) % EFFECT_CYCLE_ORDER.length];
}

const SOUND_BED_CYCLE_ORDER: SoundBedId[] = [
  'none',
  'lofi-beat',
  'cinematic-pad',
  'upbeat-pulse',
];

export function getNextSoundBed(current: SoundBedId): SoundBedId {
  const idx = SOUND_BED_CYCLE_ORDER.indexOf(current);
  if (idx === -1) return 'lofi-beat';
  return SOUND_BED_CYCLE_ORDER[(idx + 1) % SOUND_BED_CYCLE_ORDER.length];
}

export interface CutMarker {
  id: string;
  timeSeconds: number;
  percent: number;
  label: string;
}

export function addCutMarkerAtTime(
  existing: CutMarker[],
  timeSeconds: number,
  durationSeconds: number
): CutMarker[] {
  const percent = calculatePlayheadPercent(timeSeconds, durationSeconds);
  const roundedPercent = Math.round(percent * 10) / 10;
  // Avoid stacking duplicate markers right on top of each other (< 1% apart)
  if (existing.some((m) => Math.abs(m.percent - roundedPercent) < 1)) {
    return existing;
  }
  const safeTime = Math.max(0, Number.isFinite(timeSeconds) ? timeSeconds : 0);
  const nextMarker: CutMarker = {
    id: `cut-${existing.length + 1}-${Math.round(safeTime * 100)}`,
    timeSeconds: safeTime,
    percent: roundedPercent,
    label: `Cut @ ${formatCompactTime(safeTime)}`,
  };
  return [...existing, nextMarker].sort((a, b) => a.percent - b.percent);
}

export interface TimelineEditsSummary {
  customText?: string;
  effectLabel?: string;
  soundBedLabel?: string;
}

/**
 * Builds deterministic video & audio NLE tracks tailored to the selected video project
 * and optional user non-destructive studio edits.
 */
export function buildProjectTracks(
  project: ProjectItem,
  edits?: TimelineEditsSummary
): TimelineTrack[] {
  const primaryTool = project.tools[0] || 'CapCut';
  const secondaryTool = project.tools[1] || 'Color Grade';
  const motionTool = project.tools[2] || 'Motion Text';

  // Deterministic pseudo-variation based on project id length & chars
  const seed = project.id.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  const cutA = 22 + (seed % 8);
  const cutB = 26 + ((seed >> 1) % 8);
  const cutC = 24 + ((seed >> 2) % 6);
  const cutD = Math.max(10, 100 - (cutA + cutB + cutC));

  const customHookLabel = edits?.customText?.trim()
    ? `Text: ${edits.customText.trim()}`
    : 'Hook Title';
  const customFxLabel = edits?.effectLabel?.trim()
    ? `FX: ${edits.effectLabel.trim()}`
    : `${secondaryTool} LUT`;
  const musicLabel = edits?.soundBedLabel?.trim()
    ? `Custom Audio · ${edits.soundBedLabel.trim()}`
    : 'Master Stereo Track · 48kHz';

  return [
    {
      id: 'V2',
      name: 'Captions & FX',
      type: 'video',
      clips: [
        { id: `${project.id}-v2-1`, label: customHookLabel, startPercent: 2, widthPercent: 20, tone: 'video-overlay' },
        { id: `${project.id}-v2-2`, label: motionTool, startPercent: 26, widthPercent: 24, tone: 'video-overlay' },
        { id: `${project.id}-v2-3`, label: customFxLabel, startPercent: 56, widthPercent: 22, tone: 'video-overlay' },
        { id: `${project.id}-v2-4`, label: 'End CTA', startPercent: 83, widthPercent: 15, tone: 'video-overlay' },
      ],
    },
    {
      id: 'V1',
      name: 'Main Sequence',
      type: 'video',
      clips: [
        { id: `${project.id}-v1-1`, label: `A-Roll · ${primaryTool}`, startPercent: 0, widthPercent: cutA - 0.5, tone: 'video-main' },
        { id: `${project.id}-v1-2`, label: 'B-Roll Cut 02', startPercent: cutA, widthPercent: cutB - 0.5, tone: 'video-main' },
        { id: `${project.id}-v1-3`, label: 'Dynamic Speedramp', startPercent: cutA + cutB, widthPercent: cutC - 0.5, tone: 'video-main' },
        { id: `${project.id}-v1-4`, label: 'Outro Cut', startPercent: cutA + cutB + cutC, widthPercent: cutD, tone: 'video-main' },
      ],
    },
    {
      id: 'A1',
      name: 'Dialogue & SFX',
      type: 'audio',
      clips: [
        { id: `${project.id}-a1-1`, label: 'Whoosh Hit', startPercent: 0, widthPercent: 16, tone: 'audio-voice' },
        { id: `${project.id}-a1-2`, label: 'Voiceover Mix (-6dB)', startPercent: 17, widthPercent: 48, tone: 'audio-voice' },
        { id: `${project.id}-a1-3`, label: 'Riser & Cut SFX', startPercent: 67, widthPercent: 31, tone: 'audio-voice' },
      ],
    },
    {
      id: 'A2',
      name: 'Music Bed',
      type: 'audio',
      clips: [
        { id: `${project.id}-a2-1`, label: musicLabel, startPercent: 0, widthPercent: 100, tone: 'audio-music' },
      ],
    },
  ];
}

export function isGoogleDriveFolderUrl(input: string): boolean {
  const trimmed = input.trim();
  return /^https?:\/\/(drive|docs)\.google\.com\/.*\/folders\/[A-Za-z0-9_-]+/i.test(trimmed);
}

/**
 * Extracts a Google Drive file ID from common Drive share URLs (/file/d/<id>, ?id=<id>, /uc?id=<id>)
 * or validates a raw Drive file ID string. Returns null for folder URLs or invalid inputs.
 */
export function extractGoogleDriveFileId(input: string): string | null {
  if (!input || typeof input !== 'string') return null;
  const trimmed = input.trim();
  if (!trimmed || isGoogleDriveFolderUrl(trimmed)) return null;

  // 1. /file/d/<id> or /d/<id> on drive.google.com / docs.google.com
  const pathMatch = trimmed.match(
    /^https?:\/\/(?:drive|docs)\.google\.com\/(?:file\/d|open|document\/d|presentation\/d|uc)\/?([A-Za-z0-9_-]{15,64})?/i
  );
  if (pathMatch) {
    const filePathId = trimmed.match(/\/d\/([A-Za-z0-9_-]{15,64})(?:[/?#]|$)/i);
    if (filePathId?.[1]) return filePathId[1];

    const queryId = trimmed.match(/[?&]id=([A-Za-z0-9_-]{15,64})(?:[&#]|$)/i);
    if (queryId?.[1]) return queryId[1];

    return null;
  }

  // 2. Raw Google Drive file ID (alphanumeric, -, _, length 20..64, no URL delimiters)
  if (/^[A-Za-z0-9_-]{20,64}$/.test(trimmed)) {
    return trimmed;
  }

  return null;
}

export function isDirectVideoUrl(input: string): boolean {
  const trimmed = input.trim();
  if (!trimmed) return false;
  if (trimmed.startsWith('blob:') || trimmed.startsWith('/videos/') || trimmed.startsWith('/assets/')) {
    return true;
  }
  return /^https?:\/\/.+\.(mp4|webm|mov|m4v)(\?.*)?$/i.test(trimmed);
}

export interface CustomReelInput {
  urlOrId: string;
  title?: string;
  duration?: string;
  id?: string;
}

export interface CustomReelBuildResult {
  project: ProjectItem | null;
  error?: string;
}

/**
 * Validates and constructs a ProjectItem for a user-added Google Drive video or direct video file.
 */
export function buildCustomReelProject(params: CustomReelInput): CustomReelBuildResult {
  const raw = (params.urlOrId || '').trim();
  if (!raw) {
    return {
      project: null,
      error: 'Please paste a Google Drive video link (or file ID) or choose a video file.',
    };
  }

  if (isGoogleDriveFolderUrl(raw)) {
    return {
      project: null,
      error: 'That is a Drive folder link. Open Drive, choose a specific video, and paste its file link (/file/d/...).',
    };
  }

  const rawDuration = (params.duration || '').trim();
  const validDuration = /^\d{1,2}:\d{2}$/.test(rawDuration) ? rawDuration : '0:45';
  const cleanTitle = (params.title || '').trim();

  const driveId = extractGoogleDriveFileId(raw);
  if (driveId) {
    return {
      project: {
        id: params.id || `drive-reel-${driveId}`,
        title: cleanTitle || `Google Drive Reel (${driveId.slice(0, 6)})`,
        category: 'video',
        categoryLabel: 'Drive Reel',
        year: '2026',
        tools: ['Google Drive', 'Custom Reel', 'NLE Studio'],
        image: `https://drive.google.com/thumbnail?id=${driveId}&sz=w800`,
        driveEmbedUrl: `https://drive.google.com/file/d/${driveId}/preview`,
        duration: validDuration,
        link: `https://drive.google.com/file/d/${driveId}/view`,
        description: 'Custom reel imported directly from Google Drive into the interactive editing workspace.',
        featured: true,
        isCustomAdded: true,
      },
    };
  }

  if (isDirectVideoUrl(raw)) {
    return {
      project: {
        id: params.id || `custom-video-${Date.now()}`,
        title: cleanTitle || 'Imported Video Reel',
        category: 'video',
        categoryLabel: 'Custom Reel',
        year: '2026',
        tools: ['Custom Upload', 'NLE Studio'],
        image: '/videos/poster-omar.jpg',
        videoUrl: raw,
        duration: validDuration,
        link: raw.startsWith('blob:')
          ? 'https://drive.google.com/drive/folders/15x_vZ97LLGQ1aJeQYS8_ejOTzOalYXNe'
          : raw,
        description: 'Custom video reel added directly to the interactive editing workspace.',
        featured: true,
        isCustomAdded: true,
      },
    };
  }

  return {
    project: null,
    error: 'Invalid link. Paste a Google Drive file link (drive.google.com/file/d/.../view), a Drive file ID, or an MP4 URL.',
  };
}
