// src/utils/skillUtils.js
// ─── Shared skill constants & utilities used by Profile + BrowseSkills ────────

export const SKILL_CATEGORIES = [
  'Engineering',
  'Design',
  'Marketing',
  'Creative',
  'Writing',
  'Data Science',
];

export const SKILL_LEVELS = ['Beginner', 'Intermediate', 'Advanced'];

// ─── Keyword → Category inference ─────────────────────────────────────────────

const CATEGORY_KEYWORDS = {
  Engineering: [
    'react', 'vue', 'angular', 'svelte', 'next', 'node', 'express', 'django', 'flask',
    'spring', 'java', 'python', 'javascript', 'typescript', 'golang', 'rust', 'c++',
    'c#', '.net', 'php', 'ruby', 'rails', 'laravel', 'swift', 'kotlin', 'flutter',
    'android', 'ios', 'html', 'css', 'sass', 'tailwind', 'bootstrap', 'webpack',
    'vite', 'docker', 'kubernetes', 'aws', 'gcp', 'azure', 'devops', 'git', 'linux',
    'sql', 'mongodb', 'redis', 'graphql', 'rest', 'api', 'backend', 'frontend',
    'fullstack', 'software', 'engineer', 'developer', 'programming', 'coding',
    'web', 'mobile', 'app', 'firebase', 'microservices', 'serverless',
  ],
  'Data Science': [
    'machine learning', 'deep learning', 'ai', 'neural', 'tensorflow', 'pytorch',
    'scikit', 'pandas', 'numpy', 'statistics', 'analytics', 'ml', 'nlp',
    'computer vision', 'big data', 'spark', 'tableau', 'power bi', 'excel',
    'data science', 'data analysis', 'data visualization', 'jupyter', 'matplotlib',
  ],
  Design: [
    'figma', 'sketch', 'adobe', 'photoshop', 'illustrator', 'xd', 'ui', 'ux',
    'design', 'graphic', 'logo', 'branding', 'typography', 'wireframe',
    'prototype', 'motion', 'animation', 'after effects', 'premiere', 'indesign',
    'canva', 'blender', '3d', 'modeling',
  ],
  Marketing: [
    'seo', 'sem', 'social media', 'marketing', 'ads', 'google ads',
    'facebook', 'instagram', 'tiktok', 'email', 'growth', 'funnel',
    'crm', 'hubspot', 'brand', 'pr', 'influencer', 'affiliate', 'content strategy',
  ],
  Creative: [
    'music', 'guitar', 'piano', 'violin', 'singing', 'vocals', 'drums', 'bass',
    'production', 'mixing', 'mastering', 'dj', 'podcast', 'video', 'youtube',
    'film', 'photography', 'drawing', 'painting', 'illustration',
    'art', 'craft', 'sculpture', 'ceramics', 'creative',
  ],
  Writing: [
    'writing', 'copywriting', 'blogging', 'journalism', 'content writing',
    'technical writing', 'proofreading', 'storytelling', 'screenplay',
    'novel', 'poetry', 'essay', 'documentation', 'ghostwriting',
  ],
};

/**
 * Infers a category from a skill name using keyword matching.
 * Returns 'Engineering' as a sensible fallback.
 */
export const inferCategory = (skillName) => {
  if (!skillName) return 'Engineering';
  const lower = skillName.toLowerCase();
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some((kw) => lower.includes(kw))) return category;
  }
  return 'Engineering';
};

// ─── Normalizer: string → structured object ────────────────────────────────────

/**
 * Converts a skill value (string OR object) into a fully-typed skill object.
 *
 * Handles legacy plain-string skills gracefully by auto-inferring category
 * and defaulting level to 'Intermediate'.
 *
 * @param {string|object} skill
 * @returns {{ name: string, category: string, level: string }}
 */
export const normalizeSkill = (skill) => {
  if (!skill) return null;

  // Already structured
  if (typeof skill === 'object' && skill !== null) {
    return {
      name: (skill.name || '').trim(),
      category: skill.category || inferCategory(skill.name),
      level: SKILL_LEVELS.includes(skill.level) ? skill.level : 'Intermediate',
    };
  }

  // Legacy plain string
  if (typeof skill === 'string') {
    const name = skill.trim();
    return {
      name,
      category: inferCategory(name),
      level: 'Intermediate',
    };
  }

  return null;
};

/**
 * Normalizes an array of skills (mixed string/object) into structured objects.
 * Filters out nulls and empty names. Removes duplicate names (case-insensitive).
 */
export const normalizeSkillArray = (arr) => {
  if (!Array.isArray(arr)) return [];
  const seen = new Set();
  return arr
    .map(normalizeSkill)
    .filter((s) => s && s.name)
    .filter((s) => {
      const key = s.name.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
};
