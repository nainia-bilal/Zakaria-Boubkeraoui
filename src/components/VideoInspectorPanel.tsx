import React, { useState } from 'react';
import { Type, Sparkles, Volume2, RotateCcw } from 'lucide-react';
import {
  type VideoTextOverlay,
  type VideoEffectSettings,
  type VideoAudioSettings,
  type EffectPresetId,
  type SoundBedId,
  getEffectPresetValues,
} from '../utils/nleTimelineLogic';

export type InspectorTabId = 'text' | 'effects' | 'audio';

interface VideoInspectorPanelProps {
  textOverlay: VideoTextOverlay;
  onChangeTextOverlay: (next: VideoTextOverlay) => void;
  effects: VideoEffectSettings;
  onChangeEffects: (next: VideoEffectSettings) => void;
  audioSettings: VideoAudioSettings;
  onChangeAudioSettings: (next: VideoAudioSettings) => void;
  onResetAll: () => void;
  hasCustomEdits: boolean;
  activeTab?: InspectorTabId;
  onChangeActiveTab?: (tab: InspectorTabId) => void;
  currentLang: 'en' | 'fr' | 'ar';
}

export const EFFECT_PRESETS: { id: EffectPresetId; label: string }[] = [
  { id: 'none', label: 'Original' },
  { id: 'cinema-bw', label: 'Cinema B&W' },
  { id: 'warm-film', label: 'Warm Film' },
  { id: 'vhs-retro', label: 'VHS Retro' },
  { id: 'crisp-pop', label: 'Crisp Pop' },
];

export const SOUND_BEDS: { id: SoundBedId; label: string; desc: string }[] = [
  { id: 'none', label: 'Original Audio', desc: 'Video track only' },
  { id: 'lofi-beat', label: 'Lo-Fi Chords', desc: 'Soft warm bed' },
  { id: 'cinematic-pad', label: 'Cinema Drone', desc: 'Deep ambient' },
  { id: 'upbeat-pulse', label: 'Synth Pulse', desc: 'Rhythmic bass' },
];

const TEXT_COLORS: { hex: string; label: string }[] = [
  { hex: '#FFFFFF', label: 'Text color White' },
  { hex: '#DC2626', label: 'Text color Red' },
  { hex: '#FACC15', label: 'Text color Yellow' },
  { hex: '#171717', label: 'Text color Black' },
];

export const VideoInspectorPanel: React.FC<VideoInspectorPanelProps> = ({
  textOverlay,
  onChangeTextOverlay,
  effects,
  onChangeEffects,
  audioSettings,
  onChangeAudioSettings,
  onResetAll,
  hasCustomEdits,
  activeTab: controlledTab,
  onChangeActiveTab,
  currentLang,
}) => {
  const [internalTab, setInternalTab] = useState<InspectorTabId>('text');
  const activeTab = controlledTab ?? internalTab;
  const setActiveTab = (tab: InspectorTabId) => {
    setInternalTab(tab);
    onChangeActiveTab?.(tab);
  };

  const labels = {
    inspectorTitle:
      currentLang === 'ar'
        ? 'لوحة التعديل'
        : currentLang === 'fr'
        ? 'Inspecteur'
        : 'Inspector',
    textTab: currentLang === 'ar' ? 'نص' : currentLang === 'fr' ? 'Texte' : 'Text',
    effectsTab: currentLang === 'ar' ? 'تأثيرات' : currentLang === 'fr' ? 'Effets' : 'Effects',
    audioTab: currentLang === 'ar' ? 'صوت' : currentLang === 'fr' ? 'Audio' : 'Audio',
    previewNote:
      currentLang === 'ar'
        ? 'معاينة تفاعلية فقط · الفيديو الأصلي محفوظ'
        : currentLang === 'fr'
        ? 'Aperçu en direct · Fichier original intact'
        : 'Live UX preview · Original video untouched',
    resetAll: currentLang === 'ar' ? 'إعادة ضبط' : currentLang === 'fr' ? 'Réinitialiser' : 'Reset Edits',
  };

  return (
    <aside
      aria-label={labels.inspectorTitle}
      className="lg:col-span-3 bg-[#F4F3EE] border-t lg:border-t-0 lg:border-l border-neutral-300 flex flex-col justify-between lg:max-h-[420px]"
    >
      {/* Inspector Header + Segmented Tabs */}
      <div className="px-3 py-2.5 bg-white border-b border-neutral-200 space-y-2 shrink-0">
        <div className="flex items-center justify-between gap-2">
          <h4 className="font-display font-bold text-xs uppercase tracking-wider text-neutral-900">
            {labels.inspectorTitle}
          </h4>
          {hasCustomEdits && (
            <button
              type="button"
              onClick={onResetAll}
              className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-red-600 hover:text-red-700 cursor-pointer whitespace-nowrap"
            >
              <RotateCcw className="w-3 h-3" />
              <span>{labels.resetAll}</span>
            </button>
          )}
        </div>

        <div
          role="tablist"
          aria-label="Video editing tools"
          className="grid grid-cols-3 gap-1 p-1 bg-[#F4F3EE] border border-neutral-300 rounded-md"
        >
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'text'}
            onClick={() => setActiveTab('text')}
            className={`py-1 px-2 rounded-sm text-[11px] font-mono font-bold inline-flex items-center justify-center gap-1 cursor-pointer whitespace-nowrap ${
              activeTab === 'text'
                ? 'bg-white text-neutral-900 shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <Type className="w-3 h-3" />
            <span>{labels.textTab}</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'effects'}
            onClick={() => setActiveTab('effects')}
            className={`py-1 px-2 rounded-sm text-[11px] font-mono font-bold inline-flex items-center justify-center gap-1 cursor-pointer whitespace-nowrap ${
              activeTab === 'effects'
                ? 'bg-white text-neutral-900 shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <Sparkles className="w-3 h-3" />
            <span>{labels.effectsTab}</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'audio'}
            onClick={() => setActiveTab('audio')}
            className={`py-1 px-2 rounded-sm text-[11px] font-mono font-bold inline-flex items-center justify-center gap-1 cursor-pointer whitespace-nowrap ${
              activeTab === 'audio'
                ? 'bg-white text-neutral-900 shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <Volume2 className="w-3 h-3" />
            <span>{labels.audioTab}</span>
          </button>
        </div>
      </div>

      {/* Scrollable Inspector Controls Body */}
      <div className="p-2.5 space-y-2.5 overflow-y-auto flex-1">
        {activeTab === 'text' && (
          <div className="space-y-2.5" role="tabpanel" aria-label="Text overlay controls">
            <label className="flex items-center justify-between gap-2 bg-white border border-neutral-300 rounded-md px-2.5 py-1.5 cursor-pointer">
              <span className="text-xs font-mono font-bold text-neutral-800">
                Enable Overlay Text
              </span>
              <input
                type="checkbox"
                checked={textOverlay.enabled}
                onChange={(e) =>
                  onChangeTextOverlay({ ...textOverlay, enabled: e.target.checked })
                }
                aria-label="Enable overlay text"
                className="w-4 h-4 accent-red-600 cursor-pointer"
              />
            </label>

            <div className="space-y-1">
              <label
                htmlFor="nle-text-input"
                className="block text-[11px] font-mono font-semibold text-neutral-600"
              >
                Caption / Title Text
              </label>
              <input
                id="nle-text-input"
                type="text"
                maxLength={42}
                value={textOverlay.content}
                onChange={(e) =>
                  onChangeTextOverlay({
                    ...textOverlay,
                    enabled: true,
                    content: e.target.value,
                  })
                }
                placeholder="Type your overlay text..."
                className="w-full px-2.5 py-1.5 bg-white border border-neutral-300 rounded-md text-xs font-mono text-neutral-900 focus:outline-none focus:border-neutral-900"
              />
            </div>

            <div className="space-y-1">
              <span className="block text-[11px] font-mono font-semibold text-neutral-600">
                Position
              </span>
              <div className="grid grid-cols-3 gap-1.5">
                {(['top', 'center', 'bottom'] as const).map((pos) => (
                  <button
                    key={pos}
                    type="button"
                    onClick={() =>
                      onChangeTextOverlay({ ...textOverlay, enabled: true, position: pos })
                    }
                    className={`py-1 text-[11px] font-mono font-bold capitalize rounded-sm border cursor-pointer ${
                      textOverlay.position === pos
                        ? 'bg-neutral-900 text-white border-neutral-900'
                        : 'bg-white text-neutral-700 border-neutral-300 hover:border-neutral-500'
                    }`}
                  >
                    {pos}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <span className="block text-[11px] font-mono font-semibold text-neutral-600">
                Typography Style
              </span>
              <div className="grid grid-cols-3 gap-1.5">
                {(['caption', 'bold', 'minimal'] as const).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() =>
                      onChangeTextOverlay({ ...textOverlay, enabled: true, style: st })
                    }
                    className={`py-1 text-[11px] font-mono font-bold capitalize rounded-sm border cursor-pointer ${
                      textOverlay.style === st
                        ? 'bg-neutral-900 text-white border-neutral-900'
                        : 'bg-white text-neutral-700 border-neutral-300 hover:border-neutral-500'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <span className="block text-[11px] font-mono font-semibold text-neutral-600">
                Text Color
              </span>
              <div className="flex items-center gap-2">
                {TEXT_COLORS.map((swatch) => {
                  const selected = textOverlay.color === swatch.hex;
                  return (
                    <button
                      key={swatch.hex}
                      type="button"
                      aria-label={swatch.label}
                      aria-pressed={selected}
                      onClick={() =>
                        onChangeTextOverlay({
                          ...textOverlay,
                          enabled: true,
                          color: swatch.hex,
                        })
                      }
                      style={{ backgroundColor: swatch.hex }}
                      className={`w-6 h-6 rounded-full border-2 cursor-pointer ${
                        selected
                          ? 'border-red-600 scale-110 ring-2 ring-red-600/30'
                          : 'border-neutral-400 hover:scale-105'
                      }`}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'effects' && (
          <div className="space-y-2" role="tabpanel" aria-label="Video effects controls">
            <div className="space-y-1">
              <span className="block text-[11px] font-mono font-semibold text-neutral-600">
                Filter Presets
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                {EFFECT_PRESETS.map((preset) => {
                  const active = effects.preset === preset.id;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      aria-pressed={active}
                      onClick={() => onChangeEffects(getEffectPresetValues(preset.id))}
                      className={`px-2 py-1 text-[11px] font-mono font-bold rounded-sm border cursor-pointer whitespace-nowrap ${
                        active
                          ? 'bg-red-600 text-white border-red-600'
                          : 'bg-white text-neutral-800 border-neutral-300 hover:border-neutral-500'
                      }`}
                    >
                      {preset.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-1.5 bg-white border border-neutral-300 rounded-md p-2">
              <div>
                <div className="flex justify-between text-[11px] font-mono text-neutral-700">
                  <label htmlFor="nle-brightness">Brightness</label>
                  <span className="tabular-nums font-bold">{effects.brightness}%</span>
                </div>
                <input
                  id="nle-brightness"
                  type="range"
                  min={50}
                  max={150}
                  value={effects.brightness}
                  onChange={(e) =>
                    onChangeEffects({ ...effects, brightness: Number(e.target.value) })
                  }
                  className="w-full h-1.5 accent-red-600 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] font-mono text-neutral-700">
                  <label htmlFor="nle-contrast">Contrast</label>
                  <span className="tabular-nums font-bold">{effects.contrast}%</span>
                </div>
                <input
                  id="nle-contrast"
                  type="range"
                  min={50}
                  max={160}
                  value={effects.contrast}
                  onChange={(e) =>
                    onChangeEffects({ ...effects, contrast: Number(e.target.value) })
                  }
                  className="w-full h-1.5 accent-red-600 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] font-mono text-neutral-700">
                  <label htmlFor="nle-saturate">Saturation</label>
                  <span className="tabular-nums font-bold">{effects.saturate}%</span>
                </div>
                <input
                  id="nle-saturate"
                  type="range"
                  min={0}
                  max={200}
                  value={effects.saturate}
                  onChange={(e) =>
                    onChangeEffects({ ...effects, saturate: Number(e.target.value) })
                  }
                  className="w-full h-1.5 accent-red-600 cursor-pointer"
                />
              </div>
            </div>

            <label className="flex items-center justify-between gap-2 bg-white border border-neutral-300 rounded-md px-2.5 py-1.5 cursor-pointer">
              <span className="text-xs font-mono font-bold text-neutral-800">
                Cinematic Vignette
              </span>
              <input
                type="checkbox"
                checked={effects.vignette}
                onChange={(e) => onChangeEffects({ ...effects, vignette: e.target.checked })}
                aria-label="Cinematic Vignette"
                className="w-4 h-4 accent-red-600 cursor-pointer"
              />
            </label>
          </div>
        )}

        {activeTab === 'audio' && (
          <div className="space-y-2.5" role="tabpanel" aria-label="Audio mixer controls">
            <div className="bg-white border border-neutral-300 rounded-md p-2">
              <div className="flex justify-between text-[11px] font-mono text-neutral-800 mb-0.5">
                <label htmlFor="nle-original-vol" className="font-bold">
                  Original Video Audio
                </label>
                <span className="tabular-nums font-bold">{audioSettings.originalVolume}%</span>
              </div>
              <input
                id="nle-original-vol"
                type="range"
                min={0}
                max={100}
                value={audioSettings.originalVolume}
                onChange={(e) =>
                  onChangeAudioSettings({
                    ...audioSettings,
                    originalVolume: Number(e.target.value),
                  })
                }
                className="w-full h-1.5 accent-neutral-900 cursor-pointer"
              />
            </div>

            <div className="space-y-1">
              <span className="block text-[11px] font-mono font-semibold text-neutral-600">
                Replace / Mix Sound Bed
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                {SOUND_BEDS.map((bed) => {
                  const selected = audioSettings.ambientTrack === bed.id;
                  return (
                    <button
                      key={bed.id}
                      type="button"
                      onClick={() =>
                        onChangeAudioSettings({
                          ...audioSettings,
                          ambientTrack: bed.id,
                        })
                      }
                      aria-pressed={selected}
                      className={`text-left px-2 py-1.5 rounded-md border cursor-pointer flex flex-col justify-center ${
                        selected
                          ? 'bg-white border-red-600 text-neutral-900 shadow-xs'
                          : 'bg-white/75 border-neutral-300 text-neutral-700 hover:bg-white'
                      }`}
                    >
                      <span className="text-[11px] font-mono font-bold truncate">{bed.label}</span>
                      <span className="text-[9px] font-mono text-neutral-500 truncate">
                        {bed.desc}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {audioSettings.ambientTrack !== 'none' && (
              <div className="bg-white border border-neutral-300 rounded-md p-2">
                <div className="flex justify-between text-[11px] font-mono text-neutral-800 mb-0.5">
                  <label htmlFor="nle-bed-vol" className="font-bold">
                    Sound Bed Volume
                  </label>
                  <span className="tabular-nums font-bold">{audioSettings.ambientVolume}%</span>
                </div>
                <input
                  id="nle-bed-vol"
                  type="range"
                  min={0}
                  max={100}
                  value={audioSettings.ambientVolume}
                  onChange={(e) =>
                    onChangeAudioSettings({
                      ...audioSettings,
                      ambientVolume: Number(e.target.value),
                    })
                  }
                  className="w-full h-1.5 accent-red-600 cursor-pointer"
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Quiet Non-Destructive Footer Note */}
      <div className="px-3 py-1.5 bg-white border-t border-neutral-200 text-[10px] font-mono text-neutral-500 shrink-0">
        {labels.previewNote}
      </div>
    </aside>
  );
};

export default VideoInspectorPanel;
