/**
 * AttachmentRenderer.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Single source of truth for rendering ALL attachment types.
 *
 * Architecture:
 *   switch(attachment.fileCategory) drives rendering — no scattered if(pdf).
 *
 * Supported categories (implemented):
 *   image | pdf | document
 *
 * Future-ready stubs (designed, not yet wired to uploads):
 *   video | audio | archive | unknown
 *
 * Each category gets its own dedicated renderer component.
 * Adding a new type = add a case + a renderer. Nothing else changes.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import {
  FileText, FileType2, Film, Music, Archive,
  Download, ExternalLink, AlertCircle,
} from 'lucide-react';
import { formatFileSize } from '../utils/fileValidation';

// ─── Shared helpers ────────────────────────────────────────────────────────────

function openUrl(url) {
  console.log('[AttachmentRenderer] Opening URL:', url);
  window.open(url, '_blank');
}

function getActionClass(isMe) {
  return isMe
    ? 'text-zinc-700 hover:text-zinc-950 hover:bg-zinc-950/20'
    : 'text-zinc-500 hover:text-cyan-400 hover:bg-white/[0.08]';
}

// ─── Generic file card (PDF / DOC / Video / Audio / Archive) ─────────────────

function FileCard({ icon: Icon, iconClass, accentClass, label, attachment, isMe }) {
  const ac = getActionClass(isMe);
  return (
    <div className={`flex items-center gap-3 p-3 rounded-xl ${
      isMe ? 'bg-zinc-950/25' : 'bg-white/[0.06]'
    }`}>
      {/* File icon */}
      <div className={`p-2.5 rounded-lg shrink-0 ${isMe ? 'bg-zinc-950/30' : accentClass}`}>
        <Icon size={22} className={isMe ? 'text-zinc-800' : iconClass} />
      </div>

      {/* Filename + size */}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold truncate leading-tight">
          {attachment.originalName || 'File'}
        </p>
        <p className="text-[10px] opacity-50 mt-0.5">
          {attachment.bytes != null ? `${formatFileSize(attachment.bytes)} · ` : ''}
          {label}
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-0.5 shrink-0">
        <button
          onClick={(e) => { e.stopPropagation(); openUrl(attachment.url); }}
          className={`p-2 rounded-lg transition-colors ${ac}`}
          title="Open in new tab"
        >
          <ExternalLink size={15} />
        </button>
        <a
          href={attachment.url}
          download={attachment.originalName || true}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className={`p-2 rounded-lg transition-colors ${ac}`}
          title="Download"
        >
          <Download size={15} />
        </a>
      </div>
    </div>
  );
}

// ─── Category-specific renderers ──────────────────────────────────────────────

function ImageRenderer({ attachment, isMe }) {
  return (
    <div
      className="relative group cursor-pointer"
      onClick={() => openUrl(attachment.url)}
    >
      <img
        src={attachment.url}
        alt={attachment.originalName || 'Image'}
        className="max-h-64 w-full rounded-xl object-cover transition-all group-hover:brightness-90"
        loading="lazy"
      />
      <div className="absolute inset-0 flex items-center justify-center gap-2 rounded-xl bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        <ExternalLink size={16} className="text-white" />
        <span className="text-white text-xs font-medium">Open full size</span>
      </div>
    </div>
  );
}

function PdfRenderer({ attachment, isMe }) {
  return (
    <FileCard
      icon={FileType2}
      iconClass="text-red-400"
      accentClass="bg-red-500/10 border border-red-500/20"
      label="PDF"
      attachment={attachment}
      isMe={isMe}
    />
  );
}

function DocumentRenderer({ attachment, isMe }) {
  const ext = attachment.originalName?.split('.').pop()?.toUpperCase() || 'DOC';
  return (
    <FileCard
      icon={FileText}
      iconClass="text-cyan-400"
      accentClass="bg-cyan-500/10 border border-cyan-500/20"
      label={ext}
      attachment={attachment}
      isMe={isMe}
    />
  );
}

// ─── Future-ready stubs (not yet wired to uploads) ────────────────────────────

function VideoRenderer({ attachment, isMe }) {
  return (
    <FileCard
      icon={Film}
      iconClass="text-purple-400"
      accentClass="bg-purple-500/10 border border-purple-500/20"
      label="VIDEO"
      attachment={attachment}
      isMe={isMe}
    />
  );
}

function AudioRenderer({ attachment, isMe }) {
  return (
    <FileCard
      icon={Music}
      iconClass="text-green-400"
      accentClass="bg-green-500/10 border border-green-500/20"
      label="AUDIO"
      attachment={attachment}
      isMe={isMe}
    />
  );
}

function ArchiveRenderer({ attachment, isMe }) {
  return (
    <FileCard
      icon={Archive}
      iconClass="text-amber-400"
      accentClass="bg-amber-500/10 border border-amber-500/20"
      label="ARCHIVE"
      attachment={attachment}
      isMe={isMe}
    />
  );
}

function UnknownRenderer({ isMe }) {
  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs italic opacity-60 ${
      isMe ? 'text-zinc-800' : 'text-zinc-500'
    }`}>
      <AlertCircle size={13} />
      <span>Unsupported attachment type</span>
    </div>
  );
}

// ─── Main dispatcher ──────────────────────────────────────────────────────────

/**
 * Renders an attachment based on its fileCategory.
 * All rendering decisions live here — nowhere else.
 *
 * @param {{ attachment: import('../services/uploadService').AttachmentMeta, isMe: boolean }} props
 */
export default function AttachmentRenderer({ attachment, isMe }) {
  if (!attachment?.url) return null;

  console.log('[AttachmentRenderer] Rendering:', {
    fileCategory: attachment.fileCategory,
    url:          attachment.url,
    resourceType: attachment.resourceType,
    mimeType:     attachment.mimeType,
  });

  const wrap = (children) => <div className="p-1.5">{children}</div>;

  switch (attachment.fileCategory) {
    case 'image':
      return wrap(<ImageRenderer    attachment={attachment} isMe={isMe} />);
    case 'pdf':
      return wrap(<PdfRenderer      attachment={attachment} isMe={isMe} />);
    case 'document':
      return wrap(<DocumentRenderer attachment={attachment} isMe={isMe} />);
    case 'video':
      return wrap(<VideoRenderer    attachment={attachment} isMe={isMe} />);
    case 'audio':
      return wrap(<AudioRenderer    attachment={attachment} isMe={isMe} />);
    case 'archive':
      return wrap(<ArchiveRenderer  attachment={attachment} isMe={isMe} />);
    default:
      return wrap(<UnknownRenderer isMe={isMe} />);
  }
}
