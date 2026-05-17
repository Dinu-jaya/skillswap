import React from 'react';
import { getAvatarSrc } from '../utils/avatarMap';
import { User } from 'lucide-react';

/**
 * Reusable Avatar component.
 *
 * Rendering priority:
 *   1. avatarUrl  → custom uploaded photo (Firebase Storage URL)
 *   2. avatarId   → preset image from AVATAR_MAP
 *   3. neither    → User icon fallback
 *
 * @param {string}  avatarId  - Preset ID from AVATAR_MAP (e.g. 'boy1').
 * @param {string}  avatarUrl - Custom photo URL (Firebase Storage download URL).
 * @param {number}  size      - Diameter in pixels (default 40).
 * @param {string}  className - Additional Tailwind classes.
 */
const Avatar = ({ avatarId, avatarUrl = null, size = 40, className = '' }) => {
  // Priority 1: custom uploaded photo
  const src = avatarUrl || getAvatarSrc(avatarId);

  if (!src) {
    return (
      <div
        className={`bg-slate-800 border border-white/10 flex items-center justify-center text-slate-500 shrink-0 ${className}`}
        style={{ width: size, height: size }}
      >
        <User size={Math.round(size * 0.55)} />
      </div>
    );
  }

  return (
    <div
      className={`relative overflow-hidden border border-white/10 shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      <img
        src={src}
        alt="avatar"
        className="w-full h-full object-cover"
        onError={(e) => {
          // If the custom URL is broken, hide img so the fallback User icon shows
          e.currentTarget.style.display = 'none';
        }}
      />
    </div>
  );
};

export default Avatar;
