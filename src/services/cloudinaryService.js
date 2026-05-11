/**
 * cloudinaryService.js
 * ─────────────────────────────────────────────────────────────────────────────
 * DEPRECATED — kept only as a re-export shim for backward compatibility.
 *
 * All logic has been moved to:
 *   src/services/uploadService.js   — upload function + AttachmentMeta type
 *   src/utils/fileValidation.js     — validation, MIME rules, formatFileSize
 *
 * Do not add new code here. Import directly from the modules above.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export {
  uploadToCloudinary,
} from './uploadService';

export {
  validateFile,
  formatFileSize,
  isImageMime,
  getMimeLabel as getMimeTypeLabel,
  getFileCategory,
  ALLOWED_MIME_TYPES,
  ALLOWED_EXTENSIONS,
  MAX_FILE_SIZE,
} from '../utils/fileValidation';

// Provide the old mimeToMsgType shape for any legacy callers
export function mimeToMsgType(mimeType = '') {
  if (mimeType.startsWith('image/'))    return 'image';
  if (mimeType === 'application/pdf')   return 'pdf';
  return 'document';
}

// Provide the old mimeToCloudinaryResourceType for any legacy callers
export function mimeToCloudinaryResourceType(mimeType = '') {
  return mimeType.startsWith('image/') ? 'image' : 'raw';
}
