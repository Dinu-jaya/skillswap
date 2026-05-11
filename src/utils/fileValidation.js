/**
 * fileValidation.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Single source of truth for all file type, MIME, and size rules.
 * Import from here — never define MIME rules inline in components.
 * ─────────────────────────────────────────────────────────────────────────────
 */

/** Maximum allowed upload size: 10 MB */
export const MAX_FILE_SIZE = 10 * 1024 * 1024;

/**
 * Allowed MIME types → human-readable label.
 * Extend this object to support more file types everywhere automatically.
 */
export const ALLOWED_MIME_TYPES = {
  'image/jpeg':  'JPEG Image',
  'image/jpg':   'JPEG Image',
  'image/png':   'PNG Image',
  'image/webp':  'WebP Image',
  'image/gif':   'GIF Image',
  'application/pdf':   'PDF Document',
  'application/msword': 'Word Document (.doc)',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
    'Word Document (.docx)',
};

/** Allowed file extensions (without leading dot). */
export const ALLOWED_EXTENSIONS = new Set([
  'jpg', 'jpeg', 'png', 'webp', 'gif',
  'pdf',
  'doc', 'docx',
]);

/**
 * Accepts string that matches upload <input> accept attribute.
 * Keep in sync with ALLOWED_EXTENSIONS.
 */
export const FILE_INPUT_ACCEPT =
  '.jpg,.jpeg,.png,.webp,.gif,.pdf,.doc,.docx';

/**
 * Derives a high-level file category from a MIME type.
 * This drives rendering logic (switch on category) — not scattered if(pdf).
 *
 * @param {string} mimeType
 * @returns {'image'|'pdf'|'document'|'video'|'audio'|'archive'|'unknown'}
 */
export function getFileCategory(mimeType = '') {
  if (mimeType.startsWith('image/'))  return 'image';
  if (mimeType === 'application/pdf') return 'pdf';
  if (
    mimeType === 'application/msword' ||
    mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  )                                   return 'document';
  if (mimeType.startsWith('video/'))  return 'video';
  if (mimeType.startsWith('audio/'))  return 'audio';
  if (
    mimeType === 'application/zip' ||
    mimeType === 'application/x-rar-compressed' ||
    mimeType === 'application/x-tar'
  )                                   return 'archive';
  return 'unknown';
}

function getExtension(filename = '') {
  const parts = filename.split('.');
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
}

/**
 * Validates a File object. Throws a descriptive Error on any failure.
 * @param {File} file
 */
export function validateFile(file) {
  if (!(file instanceof File)) {
    throw new Error('Invalid input: expected a File object.');
  }
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(
      `File too large: ${formatFileSize(file.size)}. Maximum is 10 MB.`
    );
  }
  const ext = getExtension(file.name);
  if (!ALLOWED_EXTENSIONS.has(ext)) {
    throw new Error(
      `Unsupported file type ".${ext}". Allowed: JPG, PNG, WebP, GIF, PDF, DOC, DOCX.`
    );
  }
  if (!ALLOWED_MIME_TYPES[file.type]) {
    throw new Error(
      `Unsupported MIME type "${file.type}". Allowed: images (JPG/PNG/WebP/GIF), PDF, Word documents.`
    );
  }
}

/** Human-readable label for a MIME type. */
export function getMimeLabel(mimeType = '') {
  return ALLOWED_MIME_TYPES[mimeType] ?? mimeType;
}

/** True for image MIME types. */
export function isImageMime(mimeType = '') {
  return mimeType.startsWith('image/');
}

/**
 * Formats bytes into a human-readable string.
 * @param {number} bytes
 * @returns {string}
 */
export function formatFileSize(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  if (bytes < 1024)          return `${bytes} B`;
  if (bytes < 1024 * 1024)   return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}
