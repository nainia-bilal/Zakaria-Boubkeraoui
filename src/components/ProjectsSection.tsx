import React, { useState, useMemo, useEffect, useRef } from 'react';
import { ExternalLink, Plus, Trash2, RotateCcw, Upload, X, Film } from 'lucide-react';
import { PROJECTS, TRANSLATIONS } from '../data/portfolioData';
import { type ProjectItem } from '../utils/portfolioLogic';
import { buildCustomReelProject } from '../utils/nleTimelineLogic';
import { DepthCarousel } from './DepthCarousel';
import { VideoEditorWorkspace } from './VideoEditorWorkspace';

interface ProjectsSectionProps {
  currentLang: 'en' | 'fr' | 'ar';
  onSelectProject: (p: ProjectItem) => void;
}

const DRIVE_VAULT_URL = 'https://drive.google.com/drive/folders/15x_vZ97LLGQ1aJeQYS8_ejOTzOalYXNe';
const STORAGE_CUSTOM_REELS_KEY = 'zakaria_custom_drive_reels_v1';
const STORAGE_REMOVED_DEFAULTS_KEY = 'zakaria_removed_default_reels_v1';

function loadStoredCustomReels(): ProjectItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_CUSTOM_REELS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is ProjectItem =>
        Boolean(item && typeof item.id === 'string' && typeof item.title === 'string') &&
        !(typeof item.videoUrl === 'string' && item.videoUrl.startsWith('blob:'))
    );
  } catch {
    return [];
  }
}

function loadStoredRemovedDefaults(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_REMOVED_DEFAULTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === 'string') : [];
  } catch {
    return [];
  }
}

export const ProjectsSection: React.FC<ProjectsSectionProps> = ({
  currentLang,
  onSelectProject: _onSelectProject,
}) => {
  const t = TRANSLATIONS[currentLang];
  const fileInputRef = useRef<HTMLInputElement>(null);

  const defaultVideoReels = useMemo(
    () => PROJECTS.filter((p) => p.category === 'video').slice(0, 8),
    []
  );

  const [customReels, setCustomReels] = useState<ProjectItem[]>(loadStoredCustomReels);
  const [removedDefaultIds, setRemovedDefaultIds] = useState<string[]>(loadStoredRemovedDefaults);

  const videoProjects = useMemo(() => {
    const activeDefaults = defaultVideoReels.filter((p) => !removedDefaultIds.includes(p.id));
    return [...activeDefaults, ...customReels];
  }, [defaultVideoReels, removedDefaultIds, customReels]);

  // Interactive NLE Video Editing Workspace mode: transforms on video card click or toggle
  const [isEditingStudioOpen, setIsEditingStudioOpen] = useState<boolean>(false);
  const [activeVideoId, setActiveVideoId] = useState<string>(() => videoProjects[0]?.id || '');

  // Inline Drive Reel Importer panel state
  const [isAddDriveOpen, setIsAddDriveOpen] = useState<boolean>(false);
  const [driveUrlInput, setDriveUrlInput] = useState('');
  const [driveTitleInput, setDriveTitleInput] = useState('');
  const [driveDurationInput, setDriveDurationInput] = useState('');
  const [driveFormError, setDriveFormError] = useState<string | null>(null);
  const [driveFormNotice, setDriveFormNotice] = useState<string | null>(null);

  // Sync localStorage cleanly
  useEffect(() => {
    try {
      const persistable = customReels.filter(
        (r) => !(typeof r.videoUrl === 'string' && r.videoUrl.startsWith('blob:'))
      );
      window.localStorage.setItem(STORAGE_CUSTOM_REELS_KEY, JSON.stringify(persistable));
    } catch {
      // Ignore storage quota issues gracefully
    }
  }, [customReels]);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_REMOVED_DEFAULTS_KEY, JSON.stringify(removedDefaultIds));
    } catch {
      // Ignore storage quota issues gracefully
    }
  }, [removedDefaultIds]);

  const activeCinemaVideo = useMemo(() => {
    if (videoProjects.length === 0) return null;
    return videoProjects.find((v) => v.id === activeVideoId) || videoProjects[0];
  }, [videoProjects, activeVideoId]);

  const activeIndex = useMemo(() => {
    if (!activeCinemaVideo) return 0;
    const idx = videoProjects.findIndex((v) => v.id === activeCinemaVideo.id);
    return idx >= 0 ? idx : 0;
  }, [videoProjects, activeCinemaVideo]);

  const handleVideoCardClick = (project: ProjectItem) => {
    setActiveVideoId(project.id);
    setIsEditingStudioOpen(true);
    setTimeout(() => {
      const elem = document.getElementById('video-workspace-anchor');
      if (elem) elem.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  };

  const handleOpenAddDriveDrawer = () => {
    setIsAddDriveOpen(true);
    setDriveFormError(null);
    setTimeout(() => {
      const elem = document.getElementById('drive-reel-importer');
      if (elem) elem.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 50);
  };

  const handleAddDriveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setDriveFormError(null);
    setDriveFormNotice(null);

    const uniqueSuffix = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
    const result = buildCustomReelProject({
      urlOrId: driveUrlInput,
      title: driveTitleInput,
      duration: driveDurationInput,
      id: `custom-reel-${uniqueSuffix}`,
    });

    if (!result.project) {
      setDriveFormError(result.error || 'Please provide a valid Google Drive video link.');
      return;
    }

    const newProject = result.project;
    setCustomReels((prev) => [...prev, newProject]);
    setActiveVideoId(newProject.id);
    setDriveUrlInput('');
    setDriveTitleInput('');
    setDriveDurationInput('');
    setIsAddDriveOpen(false);
    setDriveFormNotice(`Added "${newProject.title}" to workspace.`);
  };

  const handleLocalFilePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDriveFormError(null);
    setDriveFormNotice(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const objectUrl = URL.createObjectURL(file);
    const cleanName = file.name.replace(/\.[^/.]+$/, '');
    const result = buildCustomReelProject({
      urlOrId: objectUrl,
      title: driveTitleInput.trim() || cleanName,
      duration: driveDurationInput.trim() || '0:45',
      id: `local-reel-${Date.now().toString(36)}`,
    });

    if (result.project) {
      setCustomReels((prev) => [...prev, result.project!]);
      setActiveVideoId(result.project.id);
      setDriveTitleInput('');
      setDriveDurationInput('');
      setIsAddDriveOpen(false);
      setDriveFormNotice(`Added "${result.project.title}" from file to workspace.`);
    }

    e.target.value = '';
  };

  const handleRemoveReel = (videoId: string) => {
    setDriveFormNotice(null);
    const isDefault = defaultVideoReels.some((d) => d.id === videoId);

    // Pick next sensible active clip before updating lists
    const currentIdx = videoProjects.findIndex((v) => v.id === videoId);
    const remaining = videoProjects.filter((v) => v.id !== videoId);
    if (remaining.length > 0 && activeCinemaVideo?.id === videoId) {
      const nextClip = remaining[Math.min(currentIdx, remaining.length - 1)];
      setActiveVideoId(nextClip.id);
    }

    if (isDefault) {
      setRemovedDefaultIds((prev) => (prev.includes(videoId) ? prev : [...prev, videoId]));
    } else {
      setCustomReels((prev) => {
        const target = prev.find((r) => r.id === videoId);
        if (target?.videoUrl?.startsWith('blob:')) {
          URL.revokeObjectURL(target.videoUrl);
        }
        return prev.filter((r) => r.id !== videoId);
      });
    }
  };

  const handleRestoreDefaultReels = () => {
    setRemovedDefaultIds([]);
    setDriveFormNotice('Restored all 8 default reels.');
    if (!activeCinemaVideo && defaultVideoReels[0]) {
      setActiveVideoId(defaultVideoReels[0].id);
    }
  };

  return (
    <section
      className="py-10 sm:py-16 md:py-20 px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden select-none scroll-mt-24"
      id="projects"
    >
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-6 mb-8 sm:mb-10 pb-4 sm:pb-6 border-b-2 border-black/80">
        <div>
          <div className="inline-flex items-center gap-2 text-[11px] sm:text-xs font-mono font-bold uppercase tracking-wider text-red-600 mb-1">
            <span>Selected Work</span>
            <span aria-hidden="true">·</span>
            <span className="tabular-nums">{videoProjects.length} Video Reels</span>
            <span aria-hidden="true">·</span>
            <span>Interactive Editing Studio</span>
          </div>
          <h2 className="font-display font-black text-3xl sm:text-4xl md:text-6xl tracking-tighter text-black uppercase break-words">
            {t.selectedWork}
          </h2>
          <p className="font-mono text-xs sm:text-sm text-neutral-600 max-w-2xl mt-1">
            {currentLang === 'ar'
              ? 'اضغط على أي فيديو ليتحول العرض إلى استوديو مونتاج تفاعلي، أو أضف وأزل فيديوهات مباشرة من Google Drive.'
              : currentLang === 'fr'
              ? 'Cliquez sur n’importe quel reel pour ouvrir l’atelier de montage, ou ajoutez et gérez vos vidéos depuis Google Drive.'
              : 'Click any reel to launch the interactive NLE editing workspace, or add and remove custom reels directly from Google Drive.'}
          </p>
        </div>

        {/* Interactive View Switcher */}
        <div className="inline-flex items-center p-1 bg-neutral-200/80 border border-neutral-300 rounded-md gap-1 self-start md:self-auto shrink-0">
          <button
            type="button"
            onClick={() => setIsEditingStudioOpen(false)}
            className={`px-3 py-1.5 text-xs font-mono font-bold rounded-sm transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              !isEditingStudioOpen
                ? 'bg-white text-neutral-900 shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            {currentLang === 'ar' ? 'بطاقات 3D' : currentLang === 'fr' ? 'Carrousel 3D' : '3D Carousel'}
          </button>
          <button
            type="button"
            onClick={() => setIsEditingStudioOpen(true)}
            className={`px-3 py-1.5 text-xs font-mono font-bold rounded-sm transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              isEditingStudioOpen
                ? 'bg-red-600 text-white shadow-xs'
                : 'text-neutral-700 hover:text-neutral-900'
            }`}
          >
            {currentLang === 'ar' ? 'وضع المونتاج' : currentLang === 'fr' ? 'Atelier Montage' : 'Editing Studio'}
          </button>
        </div>
      </div>

      {/* VIDEO REELS & NLE EDITING WORKSPACE */}
      <div className="mb-8 scroll-mt-24" id="video-workspace-anchor">
        {/* Subheader */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5 pb-3 border-b border-black/20">
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-mono font-bold uppercase text-red-600">
              01. Video Editing
            </span>
            <span aria-hidden="true" className="text-neutral-400">·</span>
            <h3 className="font-display font-black text-xl sm:text-2xl text-black uppercase">
              {isEditingStudioOpen
                ? currentLang === 'ar'
                  ? 'استوديو المونتاج الحي'
                  : currentLang === 'fr'
                  ? 'Atelier de Montage Actif'
                  : 'Interactive NLE Workspace'
                : currentLang === 'ar'
                ? 'معرض الريلز ثلاثي الأبعاد'
                : currentLang === 'fr'
                ? 'Carrousel 3D des Reels'
                : '3D Video Reels Showcase'}
            </h3>
          </div>

          <span className="text-xs font-mono text-neutral-600 tabular-nums">
            {videoProjects.length} {currentLang === 'ar' ? 'ريلز في الاستوديو' : 'Reels in Workspace'}
          </span>
        </div>

        {/* Empty Workspace State if user removed all reels */}
        {!activeCinemaVideo ? (
          <div className="bg-[#F9F9F6] border-2 border-neutral-900 rounded-lg p-10 text-center mb-8 shadow-[6px_6px_0px_#121212]">
            <Film className="w-10 h-10 text-neutral-400 mx-auto mb-3" />
            <h4 className="font-display font-black text-xl uppercase text-neutral-900">
              Workspace Reel Bin Empty
            </h4>
            <p className="font-mono text-xs text-neutral-600 max-w-md mx-auto mt-1.5 mb-5">
              Restore the 8 portfolio reels or add a video directly from Google Drive to preview and edit.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleOpenAddDriveDrawer}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-mono font-bold rounded-md cursor-pointer whitespace-nowrap"
              >
                <Plus className="w-4 h-4" />
                <span>Add Video from Drive</span>
              </button>
              <button
                type="button"
                onClick={handleRestoreDefaultReels}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-neutral-100 border border-neutral-300 text-neutral-900 text-xs font-mono font-bold rounded-md cursor-pointer whitespace-nowrap"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Restore 8 Default Reels</span>
              </button>
            </div>
          </div>
        ) : isEditingStudioOpen ? (
          /* TRANSFORMED NLE VIDEO EDITING WORKSPACE */
          <div className="mb-8">
            <VideoEditorWorkspace
              videos={videoProjects}
              selectedVideo={activeCinemaVideo}
              onSelectVideo={(vid) => setActiveVideoId(vid.id)}
              onExitStudio={() => setIsEditingStudioOpen(false)}
              onRemoveVideo={handleRemoveReel}
              onOpenAddDrive={handleOpenAddDriveDrawer}
              onRestoreDefaults={handleRestoreDefaultReels}
              hasRemovedDefaults={removedDefaultIds.length > 0}
              driveVaultUrl={DRIVE_VAULT_URL}
              currentLang={currentLang}
            />
          </div>
        ) : (
          /* 3D DEPTH CAROUSEL BROWSE MODE */
          <div className="bg-[#07080b] border-2 sm:border-3 border-black text-white p-4 sm:p-6 mb-8 rounded-xs shadow-[6px_6px_0px_#000] relative overflow-hidden">
            {/* Top Bar inside DepthCarousel Container */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 mb-4 border-b border-white/15 text-[11px] font-mono">
              <div className="flex items-center gap-2">
                <span className="text-red-500 font-bold uppercase tracking-wider">
                  3D Depth Carousel
                </span>
                <span className="text-neutral-500">·</span>
                <span className="text-neutral-300 tabular-nums">
                  {videoProjects.length} {currentLang === 'ar' ? 'مشاريع فيديو' : 'Video Projects'}
                </span>
              </div>
              <div className="flex items-center gap-3 text-neutral-400 text-[11px]">
                <span>
                  {currentLang === 'ar' ? 'اضغط لفتح استوديو المونتاج' : 'Click any card to open Editing Studio'}
                </span>
                <span className="text-red-400 font-bold tabular-nums">
                  #{activeIndex + 1} / {videoProjects.length}
                </span>
              </div>
            </div>

            {/* DepthCarousel Mount */}
            <div className="w-full relative py-2 sm:py-4" style={{ height: '560px' }}>
              <DepthCarousel
                items={videoProjects}
                cardWidth={310}
                cardHeight={470}
                depth={230}
                spread={95}
                tilt={22}
                tiltDirection="right"
                perspective={1400}
                visibleCards={4}
                falloff={0.2}
                blur={6}
                loop={videoProjects.length > 1}
                showControls={videoProjects.length > 1}
                showIndicators={videoProjects.length > 1}
                activeIndex={activeIndex}
                onCardSelect={(item) => handleVideoCardClick(item as unknown as ProjectItem)}
                onChange={(idx) => {
                  const targetVideo = videoProjects[idx];
                  if (targetVideo && targetVideo.id !== activeCinemaVideo.id) {
                    setActiveVideoId(targetVideo.id);
                  }
                }}
              />
            </div>

            {/* Active Video Title & Quick Actions Row under carousel */}
            <div className="mt-4 pt-3 border-t border-white/15 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono">
              <div className="flex items-center gap-2.5 truncate max-w-full">
                <span className="text-red-500 font-bold shrink-0 tabular-nums">
                  {String(activeIndex + 1).padStart(2, '0')}
                </span>
                <span aria-hidden="true" className="text-neutral-500">·</span>
                <span className="text-white font-display font-black text-sm uppercase truncate">
                  {activeCinemaVideo.title}
                </span>
                <span className="text-neutral-400 text-[11px] hidden md:inline tabular-nums">
                  ({activeCinemaVideo.duration || '0:30'})
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => handleVideoCardClick(activeCinemaVideo)}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 active:scale-95 text-white font-bold rounded-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-xs whitespace-nowrap"
                >
                  <span>▶</span>
                  <span>
                    {currentLang === 'ar'
                      ? 'فتح في استوديو المونتاج'
                      : currentLang === 'fr'
                      ? 'Ouvrir dans l’Atelier'
                      : 'Open in Editing Studio'}
                  </span>
                </button>
                <a
                  href={activeCinemaVideo.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 bg-white/10 hover:bg-white/20 text-neutral-200 hover:text-white rounded-xs transition-colors flex items-center gap-1 whitespace-nowrap"
                >
                  <span>Drive</span>
                  <span>↗</span>
                </a>
                <button
                  type="button"
                  onClick={() => handleRemoveReel(activeCinemaVideo.id)}
                  aria-label={`Remove ${activeCinemaVideo.title}`}
                  title={`Remove ${activeCinemaVideo.title}`}
                  className="px-3 py-2 bg-white/10 hover:bg-red-600/80 text-neutral-200 hover:text-white rounded-xs transition-colors flex items-center gap-1 cursor-pointer whitespace-nowrap"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* GOOGLE DRIVE VAULT & ADD / REMOVE REELS CONTROLS BELOW WORKSPACE */}
        <div
          id="drive-reel-importer"
          className="bg-[#F9F9F6] border-2 border-neutral-900 text-neutral-900 p-5 sm:p-6 shadow-[5px_5px_0px_#121212] rounded-lg space-y-5"
        >
          {/* Top Action Row: Choose Video from Google Drive + Add to Workspace */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-white border border-neutral-300 p-2 rounded-md shrink-0 flex items-center justify-center">
                <img
                  src="/drive.webp"
                  alt="Google Drive"
                  className="w-8 h-8 object-contain"
                />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono text-neutral-500">
                  <span className="font-bold text-neutral-900 uppercase">Google Drive Reel Picker</span>
                  <span aria-hidden="true">·</span>
                  <span className="tabular-nums">{videoProjects.length} Active Workspace Reels</span>
                </div>
                <h4 className="font-display font-black text-lg sm:text-xl text-neutral-900 uppercase tracking-tight mt-0.5">
                  {currentLang === 'ar'
                    ? 'اختر فيديو مباشرة من Drive وأضفه مع الـ 8 ريلز'
                    : currentLang === 'fr'
                    ? 'Importer une vidéo depuis Google Drive vers l’atelier'
                    : 'Choose & Add Any Video from Google Drive'}
                </h4>
                <p className="text-neutral-600 font-mono text-xs max-w-2xl mt-1 leading-relaxed">
                  {currentLang === 'ar'
                    ? 'افتح مجلد Google Drive لاختيار الفيديو الذي تريده، ثم أضف رابطه أو اختر الملف ليظهر فوراً ضمن الريلز في الاستوديو مع إمكانية الإزالة في أي وقت.'
                    : currentLang === 'fr'
                    ? 'Ouvrez le dossier Google Drive pour choisir une vidéo, puis ajoutez son lien ou fichier pour l’afficher et l’éditer avec les 8 reels.'
                    : 'Open the Google Drive archive to pick a video, then add its Drive link (or downloaded MP4) so it appears alongside the 8 reels in the workspace.'}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <a
                href={DRIVE_VAULT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white hover:bg-neutral-100 border-2 border-neutral-900 text-neutral-900 font-mono font-bold text-xs rounded-md transition-colors whitespace-nowrap shrink-0"
              >
                <span>
                  {currentLang === 'ar'
                    ? 'الذهاب إلى Google Drive'
                    : currentLang === 'fr'
                    ? 'Ouvrir Google Drive'
                    : 'Open Google Drive'}
                </span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <button
                type="button"
                onClick={() => {
                  setIsAddDriveOpen((prev) => !prev);
                  setDriveFormError(null);
                }}
                aria-expanded={isAddDriveOpen}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-mono font-bold text-xs rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 shadow-xs"
              >
                {isAddDriveOpen ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                <span>
                  {isAddDriveOpen
                    ? 'Close Importer'
                    : currentLang === 'ar'
                    ? 'إضافة فيديو من Drive'
                    : currentLang === 'fr'
                    ? 'Ajouter depuis Drive'
                    : 'Add Video from Drive'}
                </span>
              </button>

              {removedDefaultIds.length > 0 && (
                <button
                  type="button"
                  onClick={handleRestoreDefaultReels}
                  className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-neutral-200 hover:bg-neutral-300 text-neutral-900 font-mono font-bold text-xs rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Restore 8 Reels</span>
                </button>
              )}
            </div>
          </div>

          {/* Inline Notification */}
          {driveFormNotice && (
            <div
              role="status"
              className="px-3.5 py-2 bg-white border border-neutral-300 rounded-md text-xs font-mono text-neutral-800 flex items-center justify-between gap-2"
            >
              <span>{driveFormNotice}</span>
              <button
                type="button"
                onClick={() => setDriveFormNotice(null)}
                aria-label="Dismiss notification"
                className="text-neutral-500 hover:text-neutral-900 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Collapsible Inline Drive Link / File Add Form */}
          {isAddDriveOpen && (
            <form
              onSubmit={handleAddDriveSubmit}
              noValidate
              className="p-4 sm:p-5 bg-white border border-neutral-300 rounded-md space-y-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-neutral-200">
                <span className="text-xs font-mono font-bold uppercase text-neutral-900">
                  Add Reel to Workspace
                </span>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 border border-neutral-300 text-neutral-800 text-[11px] font-mono font-semibold rounded-sm cursor-pointer whitespace-nowrap"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Pick Local Video (.mp4/.mov)</span>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/*"
                  onChange={handleLocalFilePick}
                  aria-label="Upload local video file to workspace"
                  className="hidden"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                <div className="md:col-span-6">
                  <label
                    htmlFor="drive-reel-url"
                    className="block text-[11px] font-mono font-semibold text-neutral-700 mb-1"
                  >
                    Google Drive Video Link or File ID *
                  </label>
                  <input
                    id="drive-reel-url"
                    type="text"
                    value={driveUrlInput}
                    onChange={(e) => {
                      setDriveUrlInput(e.target.value);
                      if (driveFormError) setDriveFormError(null);
                    }}
                    placeholder="https://drive.google.com/file/d/.../view"
                    className="w-full px-3 py-2 bg-[#F9F9F6] border border-neutral-300 rounded-sm text-xs font-mono text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-900"
                  />
                </div>

                <div className="md:col-span-4">
                  <label
                    htmlFor="drive-reel-title"
                    className="block text-[11px] font-mono font-semibold text-neutral-700 mb-1"
                  >
                    Reel Title (Optional)
                  </label>
                  <input
                    id="drive-reel-title"
                    type="text"
                    value={driveTitleInput}
                    onChange={(e) => setDriveTitleInput(e.target.value)}
                    placeholder="e.g. Casablanca Commercial Cut"
                    className="w-full px-3 py-2 bg-[#F9F9F6] border border-neutral-300 rounded-sm text-xs font-mono text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-900"
                  />
                </div>

                <div className="md:col-span-2">
                  <label
                    htmlFor="drive-reel-duration"
                    className="block text-[11px] font-mono font-semibold text-neutral-700 mb-1"
                  >
                    Duration
                  </label>
                  <input
                    id="drive-reel-duration"
                    type="text"
                    value={driveDurationInput}
                    onChange={(e) => setDriveDurationInput(e.target.value)}
                    placeholder="0:45"
                    className="w-full px-3 py-2 bg-[#F9F9F6] border border-neutral-300 rounded-sm text-xs font-mono text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-900 tabular-nums"
                  />
                </div>
              </div>

              {driveFormError && (
                <p
                  role="alert"
                  className="text-xs font-mono font-semibold text-red-700 bg-red-50 border border-red-200 px-3 py-2 rounded-sm"
                >
                  {driveFormError}
                </p>
              )}

              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <p className="text-[11px] font-mono text-neutral-500">
                  Tip: On Google Drive, click any video &rarr; Share &rarr; Copy link, then paste it above.
                </p>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddDriveOpen(false);
                      setDriveFormError(null);
                    }}
                    className="px-3.5 py-2 bg-neutral-100 hover:bg-neutral-200 border border-neutral-300 text-neutral-800 text-xs font-mono font-semibold rounded-sm cursor-pointer whitespace-nowrap"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-mono font-bold rounded-sm cursor-pointer whitespace-nowrap"
                  >
                    Add to Workspace
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};
export default ProjectsSection;
