// src/utils/avatarMap.js

// Static imports — Vite resolves these at build time
import boy1 from '../assets/avatars/boy1.png';
import boy2 from '../assets/avatars/boy2.png';
import boy3 from '../assets/avatars/boy3.png';
import boy4 from '../assets/avatars/boy4.png';
import girl1 from '../assets/avatars/girl1.png';
import girl2 from '../assets/avatars/girl2.png';
import girl3 from '../assets/avatars/girl3.png';
import girl4 from '../assets/avatars/girl4.png';

/** Map of avatar ID → resolved image URL */
export const AVATAR_MAP = {
  boy1,
  boy2,
  boy3,
  boy4,
  girl1,
  girl2,
  girl3,
  girl4,
};

/** Organised preset lists for the avatar picker UI */
export const avatarPresets = {
  boys: [
    { id: 'boy1', label: 'Boy 1', color: '#22d3ee' },
    { id: 'boy2', label: 'Boy 2', color: '#22d3ee' },
    { id: 'boy3', label: 'Boy 3', color: '#22d3ee' },
    { id: 'boy4', label: 'Boy 4', color: '#22d3ee' },
  ],
  girls: [
    { id: 'girl1', label: 'Girl 1', color: '#f472b6' },
    { id: 'girl2', label: 'Girl 2', color: '#a855f7' },
    { id: 'girl3', label: 'Girl 3', color: '#a3e635' },
    { id: 'girl4', label: 'Girl 4', color: '#fb923c' },
  ],
};

/**
 * Resolve an avatar ID to a usable image src.
 * Falls back to null if the ID is unknown.
 */
export const getAvatarSrc = (avatarId) => {
  if (!avatarId) return null;
  return AVATAR_MAP[avatarId] ?? null;
};
