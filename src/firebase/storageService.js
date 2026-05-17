/**
 * storageService.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Firebase Storage service for SkillSwap.
 *
 * Chat attachments:
 *   chat_attachments/{conversationId}/images/{timestamp}_{filename}
 *   chat_attachments/{conversationId}/documents/{timestamp}_{filename}
 *
 * Profile photos:
 *   profile_photos/{userId}/{timestamp}_{filename}
 *
 * Design decisions:
 *   • uploadBytesResumable — real progress tracking + true network cancellation
 *   • Returns { upload: Promise<AttachmentMeta>, cancel: () => void }
 *     so the call-site contract is identical to the old Cloudinary service
 *   • storagePath is stored in Firestore so delete can clean up Storage too
 *   • deleteAttachment silently ignores 'object-not-found' (safe for orphans)
 * ─────────────────────────────────────────────────────────────────────────────
 */

import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';
import { storage } from './firebase';
import { getFileCategory, validateFile } from '../utils/fileValidation';

// ─── Path helpers ─────────────────────────────────────────────────────────────

/**
 * Determines the storage sub-folder for a given MIME type.
 * @param {string} mimeType
 * @returns {'images'|'documents'}
 */
function getStorageFolder(mimeType = '') {
  return mimeType.startsWith('image/') ? 'images' : 'documents';
}

/**
 * Builds a unique, collision-resistant storage path.
 * @param {string} conversationId
 * @param {string} mimeType
 * @param {string} filename
 * @returns {string}
 */
function buildStoragePath(conversationId, mimeType, filename) {
  const folder    = getStorageFolder(mimeType);
  const timestamp = Date.now();
  // Sanitise the filename to remove characters unsafe in GCS object names
  const safe      = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
  return `chat_attachments/${conversationId}/${folder}/${timestamp}_${safe}`;
}

// ─── AttachmentMeta typedef ────────────────────────────────────────────────────

/**
 * @typedef {Object} AttachmentMeta
 * @property {'attachment'}                                          type
 * @property {'image'|'pdf'|'document'|'video'|'audio'|'archive'|'unknown'} fileCategory
 * @property {string}  fileName      - original filename
 * @property {string}  mimeType      - browser-reported MIME type
 * @property {number}  size          - file size in bytes
 * @property {string}  url           - Firebase Storage download URL
 * @property {string}  storagePath   - full GCS path (for delete)
 * @property {number}  uploadedAt    - JS timestamp at upload completion
 */

// ─── uploadAttachment ──────────────────────────────────────────────────────────

/**
 * Uploads a file to Firebase Storage under chat_attachments/{conversationId}/.
 *
 * @param {File}   file
 * @param {string} conversationId
 * @param {(pct: number) => void} [onProgress]
 * @param {boolean} [skipValidation]
 * @returns {{ upload: Promise<AttachmentMeta>, cancel: () => void }}
 */
export function uploadAttachment(
  file,
  conversationId,
  onProgress      = null,
  skipValidation  = false,
) {
  if (!conversationId) {
    throw new Error('[storageService] conversationId is required for upload.');
  }

  if (!skipValidation) {
    validateFile(file); // throws synchronously on invalid file
  }

  const mimeType    = file.type;
  const category    = getFileCategory(mimeType);
  const storagePath = buildStoragePath(conversationId, mimeType, file.name);
  const storageRef  = ref(storage, storagePath);

  console.log('[storageService] ── Upload Start ──────────────────────────────');
  console.log('[storageService]   File      :', file.name, `(${file.size} bytes)`);
  console.log('[storageService]   MIME      :', mimeType);
  console.log('[storageService]   Category  :', category);
  console.log('[storageService]   Path      :', storagePath);

  const uploadTask = uploadBytesResumable(storageRef, file, {
    contentType: mimeType,
  });

  const upload = new Promise((resolve, reject) => {
    uploadTask.on(
      'state_changed',
      // Progress snapshot
      (snapshot) => {
        if (onProgress && snapshot.totalBytes > 0) {
          const pct = Math.round(
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          );
          onProgress(pct);
        }
      },
      // Error handler
      (error) => {
        if (error.code === 'storage/canceled') {
          console.log('[storageService] Upload cancelled by user.');
          const err  = new Error('Upload cancelled.');
          err.name   = 'AbortError';
          reject(err);
        } else {
          console.error('[storageService] Upload error:', error.code, error.message);
          reject(new Error(error.message || 'Upload failed. Please try again.'));
        }
      },
      // Completion handler
      async () => {
        try {
          const url = await getDownloadURL(uploadTask.snapshot.ref);

          /** @type {AttachmentMeta} */
          const attachment = {
            type:        'attachment',
            fileCategory: category,
            fileName:    file.name,
            mimeType,
            size:        file.size,
            url,
            storagePath,
            uploadedAt:  Date.now(),
          };

          console.log('[storageService] ── Upload Complete ──────────────────────');
          console.log('[storageService]   URL         :', url);
          console.log('[storageService]   storagePath :', storagePath);
          console.log('[storageService]   Attachment  :', attachment);

          resolve(attachment);
        } catch (err) {
          reject(new Error('Failed to retrieve download URL: ' + err.message));
        }
      }
    );
  });

  return {
    upload,
    cancel: () => uploadTask.cancel(),
  };
}

// ─── deleteAttachment ──────────────────────────────────────────────────────────

/**
 * Deletes a file from Firebase Storage by its stored path.
 * Silently ignores 'object-not-found' so callers don't need to guard against
 * already-deleted or orphaned paths.
 *
 * @param {string} storagePath - the `storagePath` field from AttachmentMeta
 * @returns {Promise<void>}
 */
export async function deleteAttachment(storagePath) {
  if (!storagePath) return;

  try {
    await deleteObject(ref(storage, storagePath));
    console.log('[storageService] Deleted storage file:', storagePath);
  } catch (err) {
    if (err.code === 'storage/object-not-found') {
      console.warn('[storageService] File already gone (orphan safe):', storagePath);
    } else {
      console.error('[storageService] Delete error:', err.code, err.message);
      throw err;
    }
  }
}

// ─── getDownloadUrl (utility) ─────────────────────────────────────────────────

/**
 * Retrieves a fresh download URL for a known storage path.
 * Useful for regenerating expired URLs in the future.
 *
 * @param {string} path - full GCS path
 * @returns {Promise<string>}
 */
export async function getDownloadUrl(path) {
  return getDownloadURL(ref(storage, path));
}

// ─── Profile photo validation constants ──────────────────────────────────────

/** Max profile photo size: 5 MB */
const PROFILE_PHOTO_MAX_SIZE = 5 * 1024 * 1024;

/** Allowed profile photo MIME types */
const PROFILE_PHOTO_MIME = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
]);

/**
 * Validates a profile photo file. Throws a descriptive Error on failure.
 * Separate from the chat fileValidation to allow different rules (no PDF etc.)
 * @param {File} file
 */
function validateProfilePhoto(file) {
  if (!(file instanceof File)) throw new Error('Invalid file.');
  if (file.size > PROFILE_PHOTO_MAX_SIZE) {
    const mb = (file.size / (1024 * 1024)).toFixed(2);
    throw new Error(`Photo too large (${mb} MB). Maximum is 5 MB.`);
  }
  if (!PROFILE_PHOTO_MIME.has(file.type)) {
    throw new Error('Unsupported format. Please upload a JPG, PNG, or WebP image.');
  }
}

// ─── uploadProfilePhoto ───────────────────────────────────────────────────────

/**
 * @typedef {Object} ProfilePhotoResult
 * @property {string} url         - Firebase Storage download URL
 * @property {string} storagePath - GCS path stored in Firestore for future delete
 */

/**
 * Uploads a custom profile photo to Firebase Storage.
 *
 * Storage path: profile_photos/{userId}/{timestamp}_{filename}
 *
 * @param {File}   file
 * @param {string} userId
 * @param {(pct: number) => void} [onProgress]
 * @returns {{ upload: Promise<ProfilePhotoResult>, cancel: () => void }}
 */
export function uploadProfilePhoto(file, userId, onProgress = null) {
  if (!userId) throw new Error('[storageService] userId is required for profile photo upload.');

  // Validate before any network request
  validateProfilePhoto(file);

  const timestamp  = Date.now();
  const safeName   = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const storagePath = `profile_photos/${userId}/${timestamp}_${safeName}`;
  const storageRef  = ref(storage, storagePath);

  console.log('[storageService] ── Profile Photo Upload Start ─────────────────');
  console.log('[storageService]   File      :', file.name, `(${file.size} bytes)`);
  console.log('[storageService]   Path      :', storagePath);

  const uploadTask = uploadBytesResumable(storageRef, file, {
    contentType: file.type,
  });

  const upload = new Promise((resolve, reject) => {
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        if (onProgress && snapshot.totalBytes > 0) {
          const pct = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
          onProgress(pct);
        }
      },
      (error) => {
        if (error.code === 'storage/canceled') {
          console.log('[storageService] Profile photo upload cancelled.');
          const err = new Error('Upload cancelled.');
          err.name  = 'AbortError';
          reject(err);
        } else {
          console.error('[storageService] Profile photo error:', error.code, error.message);
          reject(new Error(error.message || 'Upload failed. Please try again.'));
        }
      },
      async () => {
        try {
          const url = await getDownloadURL(uploadTask.snapshot.ref);
          console.log('[storageService] Profile photo uploaded:', url);
          resolve({ url, storagePath });
        } catch (err) {
          reject(new Error('Failed to retrieve download URL: ' + err.message));
        }
      }
    );
  });

  return {
    upload,
    cancel: () => uploadTask.cancel(),
  };
}

// ─── deleteProfilePhoto ───────────────────────────────────────────────────────

/**
 * Deletes a profile photo from Firebase Storage.
 * Orphan-safe: silently ignores 'object-not-found'.
 *
 * @param {string} storagePath - the `avatarStoragePath` field from Firestore
 * @returns {Promise<void>}
 */
export async function deleteProfilePhoto(storagePath) {
  // Delegates to deleteAttachment which already has orphan-safe logic
  return deleteAttachment(storagePath);
}
