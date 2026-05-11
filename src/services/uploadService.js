/**
 * uploadService.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Cloudinary upload service for SkillSwap.
 *
 * Design decisions:
 *   • Uses axios — no manual Content-Type headers (FormData sets boundary)
 *   • AbortController for real (not UI-only) cancellation
 *   • /image/upload for images, /raw/upload for all documents
 *   • use_filename + unique_filename preserves .pdf / .docx in the CDN URL
 *   • Returns a rich AttachmentMeta object — secure_url is NEVER modified
 *   • publicId is stored so future delete functionality is possible
 * ─────────────────────────────────────────────────────────────────────────────
 */

import axios from 'axios';
import { getFileCategory, validateFile } from '../utils/fileValidation';

const CLOUD_NAME    = 'dwg1vmmcv';
const UPLOAD_PRESET = 'skillswap_uploads';

/** Cloudinary upload API endpoint based on MIME type. */
function getUploadEndpoint(mimeType = '') {
  if (mimeType.startsWith('image/')) {
    return `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;
  }
  // PDF, DOC, DOCX → raw pipeline preserves binary content & extension
  return `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/raw/upload`;
}

/**
 * @typedef {Object} AttachmentMeta
 * @property {'attachment'}                                        type
 * @property {'image'|'pdf'|'document'|'video'|'audio'|'archive'|'unknown'} fileCategory
 * @property {string}  mimeType       - browser-reported MIME
 * @property {string}  resourceType   - Cloudinary's resource_type (ground truth)
 * @property {string}  url            - Cloudinary secure_url, never modified
 * @property {string}  publicId       - for future delete/transform support
 * @property {string}  format         - Cloudinary format field (e.g. 'pdf')
 * @property {number}  bytes          - file size from Cloudinary response
 * @property {string}  originalName   - original filename before upload
 * @property {number}  createdAt      - JS timestamp at upload completion
 */

/**
 * Uploads a file to Cloudinary.
 *
 * @param {File} file
 * @param {{ onProgress?: (pct: number) => void, skipValidation?: boolean }} options
 * @returns {{ upload: Promise<AttachmentMeta>, cancel: () => void }}
 */
export function uploadToCloudinary(file, { onProgress = null, skipValidation = false } = {}) {
  if (!skipValidation) {
    validateFile(file); // throws synchronously — no unhandled rejection
  }

  const mimeType = file.type;
  const category = getFileCategory(mimeType);
  const endpoint = getUploadEndpoint(mimeType);

  console.log('[UploadService] ── Upload Start ────────────────────────────────');
  console.log('[UploadService]   File          :', file.name, `(${file.size} bytes)`);
  console.log('[UploadService]   MIME          :', mimeType);
  console.log('[UploadService]   File category :', category);
  console.log('[UploadService]   Endpoint      :', endpoint);

  const controller = new AbortController();

  const formData = new FormData();
  formData.append('file',            file);
  formData.append('upload_preset',   UPLOAD_PRESET);
  formData.append('use_filename',    'true');   // preserves extension in CDN URL
  formData.append('unique_filename', 'true');   // avoids collisions
  // No Content-Type header — axios sets multipart/form-data with boundary automatically

  const upload = axios
    .post(endpoint, formData, {
      signal: controller.signal,
      onUploadProgress: (evt) => {
        if (onProgress && evt.total) {
          onProgress(Math.round((evt.loaded / evt.total) * 100));
        }
      },
    })
    .then((response) => {
      const data = response.data;

      console.log('[UploadService] ── Cloudinary Response ──────────────────────');
      console.log('[UploadService]   Full response :', data);
      console.log('[UploadService]   secure_url    :', data.secure_url);
      console.log('[UploadService]   resource_type :', data.resource_type);
      console.log('[UploadService]   format        :', data.format);
      console.log('[UploadService]   bytes         :', data.bytes);
      console.log('[UploadService]   public_id     :', data.public_id);

      // Warn if a document came back through the image pipeline (misconfigured preset)
      if (category !== 'image' && !data.secure_url?.includes('/raw/upload/')) {
        console.warn(
          '[UploadService] ⚠️  Expected /raw/upload/ for non-image. Got:',
          data.secure_url,
          '— check the upload preset is NOT locked to resource_type=image.'
        );
      }

      /** @type {AttachmentMeta} */
      const attachment = {
        type:         'attachment',
        fileCategory: category,
        mimeType,
        resourceType: data.resource_type,  // ground truth from Cloudinary
        url:          data.secure_url,      // ONLY URL source — never manually built
        publicId:     data.public_id,       // preserved for future delete support
        format:       data.format,
        bytes:        data.bytes,
        originalName: file.name,
        createdAt:    Date.now(),
      };

      console.log('[UploadService]   Attachment meta:', attachment);
      console.log('[UploadService] ────────────────────────────────────────────');

      return attachment;
    })
    .catch((error) => {
      if (axios.isCancel(error)) {
        console.log('[UploadService] Upload cancelled by user.');
        const err = new Error('Upload cancelled.');
        err.name = 'AbortError';
        throw err;
      }
      const message =
        error.response?.data?.error?.message ||
        error.message ||
        'Upload failed. Please try again.';
      console.error('[UploadService] Upload error:', message);
      throw new Error(message);
    });

  return {
    upload,
    cancel: () => controller.abort(),
  };
}
