/**
 * MessageBubble.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Renders a single chat message bubble.
 *
 * All attachment rendering is delegated to <AttachmentRenderer>.
 * This component only handles layout, timestamp, and text linkification.
 *
 * Supports three Firestore message shapes (oldest → newest):
 *
 *   [Legacy]  msg.attachment.{ url, name, type, size }
 *   [v2]      msg.{ fileUrl, fileName, mimeType, fileSize, resourceType, type }
 *   [v3 new]  msg.{ type:'attachment', attachment: AttachmentMeta }
 *
 * normalizeAttachment() maps all three shapes to a single AttachmentMeta object.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { motion } from 'framer-motion';
import { AlertCircle, ExternalLink, Trash2 } from 'lucide-react';
import { getFileCategory } from '../utils/fileValidation';
import AttachmentRenderer from './AttachmentRenderer';

// ─── URL linkifier ─────────────────────────────────────────────────────────────

const URL_REGEX = /https?:\/\/[^\s<>"]+[^\s<>".,;:!?)\]]/g;

function LinkifiedText({ text, isMe }) {
  if (!text) return null;

  const parts = [];
  let lastIndex = 0;
  const regex = new RegExp(URL_REGEX.source, 'g');
  let match;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ kind: 'text', value: text.slice(lastIndex, match.index) });
    }
    parts.push({ kind: 'url', value: match[0] });
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) {
    parts.push({ kind: 'text', value: text.slice(lastIndex) });
  }

  return (
    <span>
      {parts.map((part, i) =>
        part.kind === 'url' ? (
          <a
            key={i}
            href={part.value}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center gap-0.5 underline underline-offset-2 break-all transition-opacity hover:opacity-80 ${
              isMe ? 'text-zinc-800' : 'text-cyan-400'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {part.value}
            <ExternalLink size={10} className="shrink-0" />
          </a>
        ) : (
          <span key={i}>{part.value}</span>
        )
      )}
    </span>
  );
}

// ─── Schema normalizer ────────────────────────────────────────────────────────

/**
 * Converts any message shape into a normalized { text, attachment } pair.
 * attachment is an AttachmentMeta object (or null for text-only messages).
 *
 * Handles three Firestore schemas:
 *   [v3 Firebase]  msg.{ type:'attachment', attachment: AttachmentMeta }
 *                  AttachmentMeta: { type, fileCategory, fileName, mimeType, size, url, storagePath, uploadedAt }
 *   [v2 flat]      msg.{ fileUrl, fileName, mimeType, fileSize, ... }
 *   [Legacy]       msg.attachment.{ url, name, type, size }
 *
 * @param {object} msg
 * @returns {{ text: string, attachment: object|null }}
 */
function normalizeMessage(msg) {
  // ── v3 (Firebase Storage): type='attachment' + full AttachmentMeta ────────────────
  if (msg.type === 'attachment' && msg.attachment?.url) {
    console.log('[MessageBubble] v3 schema detected');
    const att = msg.attachment;
    return {
      text:       msg.text || '',
      attachment: {
        ...att,
        // Prefer new Firebase names; fall back to old Cloudinary names for old messages
        fileName: att.fileName || att.originalName || null,
        size:     att.size     ?? att.bytes          ?? null,
      },
    };
  }

  // ── v2 (flat fileUrl fields) ─────────────────────────────────────────────
  if (msg.fileUrl) {
    const mimeType = msg.mimeType || '';
    console.log('[MessageBubble] v2 schema detected, fileUrl:', msg.fileUrl);
    return {
      text: msg.text || '',
      attachment: {
        type:        'attachment',
        fileCategory: getFileCategory(mimeType),
        mimeType,
        url:         msg.fileUrl,
        storagePath: null,
        fileName:    msg.fileName  || null,
        size:        msg.fileSize  ?? null,
        uploadedAt:  null,
      },
    };
  }

  // ── Legacy: msg.attachment.url ──────────────────────────────────────────────
  if (msg.attachment?.url) {
    const mimeType = msg.attachment.type || '';
    console.log('[MessageBubble] Legacy schema detected, url:', msg.attachment.url);
    return {
      text: msg.text || '',
      attachment: {
        type:        'attachment',
        fileCategory: getFileCategory(mimeType),
        mimeType,
        url:         msg.attachment.url,
        storagePath: null,
        fileName:    msg.attachment.name || null,
        size:        msg.attachment.size ?? null,
        uploadedAt:  null,
      },
    };
  }

  // ── Pure text ─────────────────────────────────────────────────────────────
  return { text: msg.text || '', attachment: null };
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function MessageBubble({ msg, isMe, onDelete }) {
  try {
    const { text, attachment } = normalizeMessage(msg);

    const rawTs = msg.createdAt || msg.timestamp;
    const timeStr = rawTs
      ? (rawTs.toDate?.() || new Date(rawTs)).toLocaleTimeString([], {
          hour: '2-digit', minute: '2-digit',
        })
      : 'Sending…';

    const bubbleBase = isMe
      ? 'bg-cyan-400 text-zinc-950 rounded-tr-sm shadow-[0_0_20px_rgba(34,211,238,0.2)]'
      : 'bg-white/[0.06] border border-white/[0.07] text-zinc-200 rounded-tl-sm';

    return (
      <motion.div
        initial={{ opacity: 0, y: 8, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.2 }}
        className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} group`}
      >
        <div className={`relative max-w-[85%] md:max-w-[72%] min-w-[4rem]`}>
          <div className={`rounded-2xl overflow-hidden ${bubbleBase}`}>

          {/* Attachment — all rendering delegated to AttachmentRenderer */}
          {attachment && (
            <AttachmentRenderer attachment={attachment} isMe={isMe} />
          )}

          {/* Text / caption */}
          {text && (
            <div className={`px-4 py-2.5 text-sm leading-relaxed font-medium ${attachment ? 'pt-1 pb-3' : ''}`}>
              <LinkifiedText text={text} isMe={isMe} />
            </div>
          )}

          {/* Fallback: empty message */}
          {!text && !attachment && (
            <div className={`flex items-center gap-2 px-3 py-2 text-xs italic opacity-60 ${
              isMe ? 'text-zinc-800' : 'text-zinc-500'
            }`}>
              <AlertCircle size={13} />
              <span>Empty message</span>
            </div>
          )}
          </div>
          
          {/* Delete Button */}
          {isMe && onDelete && (
            <button
              onClick={onDelete}
              className="absolute top-1/2 -translate-y-1/2 right-full mr-2 p-1.5 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
              title="Delete message"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>

        <span className="text-[10px] text-zinc-600 mt-1 mx-1">{timeStr}</span>
      </motion.div>
    );
  } catch (err) {
    console.error('[MessageBubble] Render error:', err);
    return (
      <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} opacity-60`}>
        <div className="bg-zinc-800/50 border border-white/10 rounded-xl px-3 py-2 text-[11px] text-zinc-400 italic flex items-center gap-2">
          <AlertCircle size={12} />
          Message rendering error
        </div>
      </div>
    );
  }
}
