export interface ProjectItem {
  id: string;
  title: string;
  category: 'all' | 'video' | 'design' | 'photo' | 'presentations' | 'branding';
  categoryLabel: string;
  year: string;
  tools: string[];
  image: string;
  link: string;
  description: string;
  featured?: boolean;
  videoUrl?: string;
  duration?: string;
}

export interface ContactFormData {
  name: string;
  email: string;
  subject?: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

/**
 * Filter projects based on category and optional search term
 */
export function filterProjects(
  projects: ProjectItem[],
  selectedCategory: string,
  searchQuery: string = ''
): ProjectItem[] {
  const query = searchQuery.trim().toLowerCase();

  return projects.filter((project) => {
    const matchesCategory =
      selectedCategory === 'all' ||
      project.category.toLowerCase() === selectedCategory.toLowerCase();

    if (!matchesCategory) return false;
    if (!query) return true;

    const matchesTitle = project.title.toLowerCase().includes(query);
    const matchesDesc = project.description.toLowerCase().includes(query);
    const matchesTool = project.tools.some((t) => t.toLowerCase().includes(query));

    return matchesTitle || matchesDesc || matchesTool;
  });
}

/**
 * Validates the contact form inputs
 */
export function validateContactForm(data: ContactFormData): ValidationResult {
  const errors: Record<string, string> = {};

  if (!data.name || data.name.trim().length < 2) {
    errors.name = 'Please provide a valid name (at least 2 characters).';
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!data.email || !emailPattern.test(data.email.trim())) {
    errors.email = 'Please provide a valid email address.';
  }

  if (!data.message || data.message.trim().length < 10) {
    errors.message = 'Please provide a message with at least 10 characters.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Format project count metric
 */
export function formatMetricNumber(val: number, suffix: string = '+'): string {
  if (val <= 0) return '0';
  return `${val}${suffix}`;
}

/**
 * Get category display label based on key
 */
export function getCategoryLabel(categoryKey: string, lang: 'en' | 'fr' | 'ar' = 'en'): string {
  const dict: Record<string, Record<string, string>> = {
    all: { en: 'All', fr: 'Tous', ar: 'الكل' },
    video: { en: 'Videos', fr: 'Vidéos', ar: 'الفيديوهات' },
    design: { en: 'Design', fr: 'Design', ar: 'التصميم' },
    photo: { en: 'Photography', fr: 'Photographie', ar: 'التصوير' },
    presentations: { en: 'Presentations', fr: 'Présentations', ar: 'عروض تقديمية' },
    branding: { en: 'Personal Branding', fr: 'Personal Branding', ar: 'الهوية الشخصية' },
  };

  return dict[categoryKey]?.[lang] || categoryKey;
}
