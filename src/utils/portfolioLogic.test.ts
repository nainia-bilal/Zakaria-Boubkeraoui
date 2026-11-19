import test from 'node:test';
import assert from 'node:assert/strict';
import {
  filterProjects,
  validateContactForm,
  formatMetricNumber,
  getCategoryLabel,
  type ProjectItem,
} from './portfolioLogic';

const mockProjects: ProjectItem[] = [
  {
    id: 'p1',
    title: 'Brand Identity Kit',
    category: 'branding',
    categoryLabel: 'Personal Branding',
    year: '2024',
    tools: ['Canva', 'PicsArt'],
    image: '/sel.png',
    link: 'https://canva.link/123',
    description: 'Complete personal brand identity.',
  },
  {
    id: 'p2',
    title: 'Cinematic Fitness Reel',
    category: 'video',
    categoryLabel: 'Video Editing',
    year: '2024',
    tools: ['CapCut', 'InShot'],
    image: '/profil.jpeg',
    link: 'https://drive.google.com/123',
    description: 'High-energy workout reel with dynamic cuts.',
  },
  {
    id: 'p3',
    title: 'Pitch Deck Design',
    category: 'presentations',
    categoryLabel: 'Presentations',
    year: '2023',
    tools: ['Canva'],
    image: '/NES.png',
    link: 'https://canva.link/456',
    description: 'Modern, minimalist investor pitch deck.',
  },
];

test('filterProjects handles category filtering', () => {
  const allResult = filterProjects(mockProjects, 'all');
  assert.equal(allResult.length, 3);

  const videoResult = filterProjects(mockProjects, 'video');
  assert.equal(videoResult.length, 1);
  assert.equal(videoResult[0].id, 'p2');

  const brandingResult = filterProjects(mockProjects, 'branding');
  assert.equal(brandingResult.length, 1);
  assert.equal(brandingResult[0].title, 'Brand Identity Kit');
});

test('filterProjects handles text search queries', () => {
  const searchByTool = filterProjects(mockProjects, 'all', 'CapCut');
  assert.equal(searchByTool.length, 1);
  assert.equal(searchByTool[0].id, 'p2');

  const searchByText = filterProjects(mockProjects, 'all', 'investor');
  assert.equal(searchByText.length, 1);
  assert.equal(searchByText[0].id, 'p3');

  const noMatches = filterProjects(mockProjects, 'all', 'nonexistentquery');
  assert.equal(noMatches.length, 0);
});

test('validateContactForm checks required fields', () => {
  const invalidEmpty = validateContactForm({
    name: '',
    email: '',
    message: '',
  });
  assert.equal(invalidEmpty.isValid, false);
  assert.ok(invalidEmpty.errors.name);
  assert.ok(invalidEmpty.errors.email);
  assert.ok(invalidEmpty.errors.message);

  const invalidEmail = validateContactForm({
    name: 'Zakaria',
    email: 'not-an-email',
    message: 'Hello, I want to collaborate on a new project video.',
  });
  assert.equal(invalidEmail.isValid, false);
  assert.ok(invalidEmail.errors.email);
  assert.equal(invalidEmail.errors.name, undefined);

  const validData = validateContactForm({
    name: 'Yassine',
    email: 'yassine@example.com',
    subject: 'Video Editing Inquiry',
    message: 'We loved your reels and want to hire you for our brand campaign!',
  });
  assert.equal(validData.isValid, true);
  assert.equal(Object.keys(validData.errors).length, 0);
});

test('formatMetricNumber formats numbers correctly', () => {
  assert.equal(formatMetricNumber(30), '30+');
  assert.equal(formatMetricNumber(0), '0');
  assert.equal(formatMetricNumber(2, ' yrs'), '2 yrs');
});

test('getCategoryLabel returns localized labels', () => {
  assert.equal(getCategoryLabel('video', 'en'), 'Videos');
  assert.equal(getCategoryLabel('video', 'fr'), 'Vidéos');
  assert.equal(getCategoryLabel('video', 'ar'), 'الفيديوهات');
  assert.equal(getCategoryLabel('photo', 'en'), 'Photography');
  assert.equal(getCategoryLabel('photo', 'ar'), 'التصوير');
});
