import React from 'react';
import { getAvatarSrc } from '../utils/avatarMap';
import { User } from 'lucide-react';

/**
 * Reusable Avatar component.
 *
 * @param {string}  avatarId  - Preset ID from AVATAR_MAP (e.g. 'boy1').
 * @param {number}  size      - Diameter in pixels (default 40).
 * @param {string}  className - Additional Tailwind classes.
 */
const Avatar = ({ avatarId, size = 40, className = '' }) => {
  const src = getAvatarSrc(avatarId);

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
      />
    </div>
  );
};

export default Avatar;
