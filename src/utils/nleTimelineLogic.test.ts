import test from 'node:test';
import assert from 'node:assert/strict';
import {
  parseDurationToSeconds,
  formatTimecode,
  formatCompactTime,
  calculatePlayheadPercent,
  calculateTimeFromScrubRatio,
  generateTimelineRulerTicks,
  buildProjectTracks,
  getEffectPresetValues,
  buildVideoCssFilter,
  DEFAULT_EFFECT_SETTINGS,
  extractGoogleDriveFileId,
  isGoogleDriveFolderUrl,
  buildCustomReelProject,
  getNextEffectPreset,
  getNextSoundBed,
  addCutMarkerAtTime,
} from './nleTimelineLogic';
import { PROJECTS } from '../data/portfolioData';

test('parseDurationToSeconds converts MM:SS and HH:MM:SS cleanly with fallback', () => {
  assert.equal(parseDurationToSeconds('0:59'), 59);
  assert.equal(parseDurationToSeconds('1:35'), 95);
  assert.equal(parseDurationToSeconds('01:02:05'), 3725);
  assert.equal(parseDurationToSeconds(undefined), 30);
  assert.equal(parseDurationToSeconds('invalid'), 30);
  assert.equal(parseDurationToSeconds('0:00'), 30);
});

test('formatTimecode renders SMPTE MM:SS:FF accurately', () => {
  assert.equal(formatTimecode(0, 30), '00:00:00');
  assert.equal(formatTimecode(1.5, 30), '00:01:15');
  assert.equal(formatTimecode(65, 30), '01:05:00');
  assert.equal(formatTimecode(-4, 30), '00:00:00');
});

test('formatCompactTime formats clean MM:SS labels', () => {
  assert.equal(formatCompactTime(0), '0:00');
  assert.equal(formatCompactTime(9), '0:09');
  assert.equal(formatCompactTime(95), '1:35');
});

test('calculatePlayheadPercent clamps strictly between 0 and 100', () => {
  assert.equal(calculatePlayheadPercent(0, 60), 0);
  assert.equal(calculatePlayheadPercent(30, 60), 50);
  assert.equal(calculatePlayheadPercent(60, 60), 100);
  assert.equal(calculatePlayheadPercent(90, 60), 100);
  assert.equal(calculatePlayheadPercent(-5, 60), 0);
  assert.equal(calculatePlayheadPercent(10, 0), 0);
});

test('calculateTimeFromScrubRatio maps normalized position to bounded video seconds', () => {
  assert.equal(calculateTimeFromScrubRatio(0, 100), 0);
  assert.equal(calculateTimeFromScrubRatio(0.25, 100), 25);
  assert.equal(calculateTimeFromScrubRatio(1, 100), 100);
  assert.equal(calculateTimeFromScrubRatio(1.5, 100), 100);
  assert.equal(calculateTimeFromScrubRatio(-0.2, 100), 0);
});

test('generateTimelineRulerTicks creates bounded evenly spaced markers', () => {
  const ticks = generateTimelineRulerTicks(60, 4);
  assert.equal(ticks.length, 5);
  assert.deepEqual(
    ticks.map((t) => ({ label: t.label, percent: t.percent })),
    [
      { label: '0:00', percent: 0 },
      { label: '0:15', percent: 25 },
      { label: '0:30', percent: 50 },
      { label: '0:45', percent: 75 },
      { label: '1:00', percent: 100 },
    ]
  );
});

test('buildProjectTracks returns 4 NLE tracks and reflects user edits', () => {
  const sampleVideo = PROJECTS.find((p) => p.category === 'video')!;
  const tracks = buildProjectTracks(sampleVideo, {
    customText: 'CASABLANCA',
    effectLabel: 'Cinema B&W',
    soundBedLabel: 'Lo-Fi Beat',
  });
  assert.equal(tracks.length, 4);
  assert.deepEqual(
    tracks.map((t) => t.id),
    ['V2', 'V1', 'A1', 'A2']
  );
  assert.equal(tracks[0].clips[0].label, 'Text: CASABLANCA');
  assert.equal(tracks[0].clips[2].label, 'FX: Cinema B&W');
  assert.equal(tracks[3].clips[0].label, 'Custom Audio · Lo-Fi Beat');
  const v1TotalWidth = tracks[1].clips.reduce((sum, c) => sum + c.widthPercent, 0);
  assert.ok(v1TotalWidth >= 95 && v1TotalWidth <= 101);
});

test('getEffectPresetValues and buildVideoCssFilter produce valid CSS filters', () => {
  const bw = getEffectPresetValues('cinema-bw');
  assert.equal(bw.saturate, 0);
  assert.equal(bw.vignette, true);
  assert.equal(buildVideoCssFilter(bw), 'brightness(102%) contrast(128%) saturate(0%)');

  const warm = getEffectPresetValues('warm-film');
  assert.ok(buildVideoCssFilter(warm).includes('sepia(18%)'));

  const clamped = buildVideoCssFilter({
    ...DEFAULT_EFFECT_SETTINGS,
    brightness: 300,
    contrast: 10,
    saturate: -20,
  });
  assert.equal(clamped, 'brightness(180%) contrast(40%) saturate(0%)');
});

test('extractGoogleDriveFileId parses share URLs, query URLs, raw IDs and rejects folders/invalid strings', () => {
  assert.equal(
    extractGoogleDriveFileId('https://drive.google.com/file/d/1D4YbfSOw47NdR8U8xLQhC75OV3zc-qE1/view?usp=sharing'),
    '1D4YbfSOw47NdR8U8xLQhC75OV3zc-qE1'
  );
  assert.equal(
    extractGoogleDriveFileId('https://drive.google.com/open?id=1YU_It_8lEanEUTaBB1W5zSC_pFuFe9AJ'),
    '1YU_It_8lEanEUTaBB1W5zSC_pFuFe9AJ'
  );
  assert.equal(
    extractGoogleDriveFileId('1-WukCM3TKqmbahiNeJa7OBR7WsybDOmW'),
    '1-WukCM3TKqmbahiNeJa7OBR7WsybDOmW'
  );
  assert.equal(
    isGoogleDriveFolderUrl('https://drive.google.com/drive/folders/15x_vZ97LLGQ1aJeQYS8_ejOTzOalYXNe'),
    true
  );
  assert.equal(
    extractGoogleDriveFileId('https://drive.google.com/drive/folders/15x_vZ97LLGQ1aJeQYS8_ejOTzOalYXNe'),
    null
  );
  assert.equal(extractGoogleDriveFileId('not a valid link'), null);
  assert.equal(extractGoogleDriveFileId(''), null);
});

test('buildCustomReelProject creates Drive or direct video items and rejects invalid/empty inputs', () => {
  const emptyResult = buildCustomReelProject({ urlOrId: '   ' });
  assert.equal(emptyResult.project, null);
  assert.ok(emptyResult.error);

  const folderResult = buildCustomReelProject({
    urlOrId: 'https://drive.google.com/drive/folders/15x_vZ97LLGQ1aJeQYS8_ejOTzOalYXNe',
  });
  assert.equal(folderResult.project, null);
  assert.ok(folderResult.error?.includes('folder'));

  const driveResult = buildCustomReelProject({
    urlOrId: 'https://drive.google.com/file/d/1D4YbfSOw47NdR8U8xLQhC75OV3zc-qE1/view',
    title: 'Casablanca Client Reel',
    duration: '1:08',
    id: 'drive-test-1',
  });
  assert.ok(driveResult.project);
  assert.equal(driveResult.project.title, 'Casablanca Client Reel');
  assert.equal(driveResult.project.duration, '1:08');
  assert.equal(driveResult.project.driveEmbedUrl, 'https://drive.google.com/file/d/1D4YbfSOw47NdR8U8xLQhC75OV3zc-qE1/preview');
  assert.equal(driveResult.project.isCustomAdded, true);

  const mp4Result = buildCustomReelProject({
    urlOrId: 'blob:http://localhost:3000/test-reel',
    title: 'Local Uploaded Reel',
    id: 'blob-test-1',
  });
  assert.ok(mp4Result.project);
  assert.equal(mp4Result.project.videoUrl, 'blob:http://localhost:3000/test-reel');
});

test('getNextEffectPreset and getNextSoundBed cycle through options predictably', () => {
  assert.equal(getNextEffectPreset('none'), 'warm-film');
  assert.equal(getNextEffectPreset('warm-film'), 'cinema-bw');
  assert.equal(getNextEffectPreset('crisp-pop'), 'none');

  assert.equal(getNextSoundBed('none'), 'lofi-beat');
  assert.equal(getNextSoundBed('lofi-beat'), 'cinematic-pad');
  assert.equal(getNextSoundBed('upbeat-pulse'), 'none');
});

test('addCutMarkerAtTime adds sorted markers and prevents near-duplicate stacking', () => {
  let markers = addCutMarkerAtTime([], 30, 60);
  assert.equal(markers.length, 1);
  assert.equal(markers[0].percent, 50);
  assert.equal(markers[0].label, 'Cut @ 0:30');

  // Near-duplicate ignored
  markers = addCutMarkerAtTime(markers, 30.2, 60);
  assert.equal(markers.length, 1);

  // Earlier marker sorted first
  markers = addCutMarkerAtTime(markers, 15, 60);
  assert.equal(markers.length, 2);
  assert.deepEqual(
    markers.map((m) => m.percent),
    [25, 50]
  );
});
