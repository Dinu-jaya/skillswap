/**
 * useFileUpload.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Reusable React hook encapsulating the full file lifecycle:
 *   select → validate → preview → upload → result / error / cancel
 *
 * Chat.jsx imports this hook and no longer manages any upload state directly.
 * Upload is handled by Firebase Storage via storageService.uploadAttachment.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useState, useRef, useCallback } from 'react';
import { uploadAttachment } from '../firebase/storageService';
import { validateFile, isImageMime } from '../utils/fileValidation';

/**
 * @returns {{
 *   file:         File | null,
 *   previewUrl:   string | null,
 *   isUploading:  boolean,
 *   progress:     number,
 *   error:        string | null,
 *   selectFile:   (file: File) => void,
 *   removeFile:   () => void,
 *   cancelUpload: () => void,
 *   clearError:   () => void,
 *   startUpload:  (conversationId: string) => Promise<import('../firebase/storageService').AttachmentMeta>,
 * }}
 */
export function useFileUpload() {
  const [file,        setFile]        = useState(null);
  const [previewUrl,  setPreviewUrl]  = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [progress,    setProgress]    = useState(0);
  const [error,       setError]       = useState(null);

  // Holds the cancel() fn returned by uploadAttachment
  const cancelRef = useRef(null);

  /**
   * Validate and stage a file for upload. Does NOT start the upload.
   * Generates a local preview URL for images.
   */
  const selectFile = useCallback((incomingFile) => {
    if (!incomingFile) return;

    console.log('[useFileUpload] File selected:', incomingFile.name, incomingFile.type);

    try {
      validateFile(incomingFile);
    } catch (err) {
      console.warn('[useFileUpload] Validation failed:', err.message);
      setError(err.message);
      return;
    }

    setFile(incomingFile);
    setError(null);
    setProgress(0);

    // Local preview for images — no upload needed to show thumbnail
    if (isImageMime(incomingFile.type)) {
      const reader = new FileReader();
      reader.onloadend = () => setPreviewUrl(reader.result);
      reader.readAsDataURL(incomingFile);
    } else {
      setPreviewUrl(null);
    }

    console.log('[useFileUpload] File validated and staged.');
  }, []);

  /** Clear the staged file and abort any in-flight upload. */
  const removeFile = useCallback(() => {
    if (cancelRef.current) {
      cancelRef.current();
      cancelRef.current = null;
    }
    setFile(null);
    setPreviewUrl(null);
    setIsUploading(false);
    setProgress(0);
    setError(null);
  }, []);

  /** Abort the in-flight upload (real network cancellation via Firebase task). */
  const cancelUpload = useCallback(() => {
    if (cancelRef.current) {
      cancelRef.current();
      cancelRef.current = null;
    }
    setIsUploading(false);
    setProgress(0);
    setError('Upload cancelled.');
  }, []);

  /** Clear the error banner. */
  const clearError = useCallback(() => setError(null), []);

  /**
   * Start uploading the staged file to Firebase Storage.
   * Resolves with AttachmentMeta on success.
   * Throws on failure or cancellation.
   *
   * @param {string} conversationId - required for the storage path
   * @returns {Promise<import('../firebase/storageService').AttachmentMeta>}
   */
  const startUpload = useCallback(async (conversationId) => {
    if (!file) throw new Error('No file staged for upload.');
    if (!conversationId) throw new Error('conversationId is required for upload.');

    setIsUploading(true);
    setProgress(0);
    setError(null);

    const { upload, cancel } = uploadAttachment(file, conversationId, setProgress);
    cancelRef.current = cancel;

    try {
      const result = await upload;
      cancelRef.current = null;
      console.log('[useFileUpload] Upload complete:', result);
      return result;
    } catch (err) {
      cancelRef.current = null;
      if (err.name !== 'AbortError') {
        setError(err.message);
      }
      throw err;
    } finally {
      setIsUploading(false);
      setProgress(0);
    }
  }, [file]);

  return {
    file,
    previewUrl,
    isUploading,
    progress,
    error,
    selectFile,
    removeFile,
    cancelUpload,
    clearError,
    startUpload,
  };
}
