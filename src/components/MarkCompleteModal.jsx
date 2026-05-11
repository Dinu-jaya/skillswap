import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, Loader2, Link, StickyNote, AlertCircle } from 'lucide-react';
import { completeSession } from '../firebase/sessionService';

/**
 * MarkCompleteModal — allows marking a session as complete with notes + proof URL.
 *
 * Props:
 *  - session: Firestore session object | null
 *  - contractId: string
 *  - isOpen: bool
 *  - onClose: fn
 *  - onSuccess: fn(sessionId) — called after successful completion
 *  - showToast: fn(type, message)
 *  - totalSessions: number
 *  - completedSessions: number
 */
const MarkCompleteModal = ({
  session,
  contractId,
  isOpen,
  onClose,
  onSuccess,
  showToast,
  totalSessions = 0,
  completedSessions = 0,
}) => {
  const [notes, setNotes]       = useState('');
  const [proofUrl, setProofUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [urlError, setUrlError]   = useState('');

  // Reset fields when session changes or modal opens
  useEffect(() => {
    if (isOpen) {
      setNotes(session?.notes || '');
      setProofUrl(session?.proofUrl || '');
      setSubmitting(false);
      setUrlError('');
    }
  }, [isOpen, session?.id]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  const validateUrl = (url) => {
    if (!url.trim()) return true; // optional
    try { new URL(url.trim()); return true; } catch { return false; }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!session || !contractId) return;

    if (proofUrl && !validateUrl(proofUrl)) {
      setUrlError('Please enter a valid URL (e.g. https://github.com/...)');
      return;
    }

    setSubmitting(true);
    try {
      await completeSession(session.id, contractId, notes, proofUrl);

      const newCompleted = completedSessions + 1;
      const allDone = newCompleted >= totalSessions;

      console.log(`[MarkCompleteModal] Session ${session.sessionNumber} completed. ${newCompleted}/${totalSessions}`);

      if (allDone) {
        showToast?.('success', `🎉 All sessions complete! Contract finished!`);
      } else {
        showToast?.('success', `Session ${session.sessionNumber} marked complete! (${newCompleted}/${totalSessions})`);
      }

      onSuccess?.(session.id);
      onClose();
    } catch (err) {
      console.error('[MarkCompleteModal] Failed to complete session:', err);
      showToast?.('error', 'Failed to mark session complete. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen || !session) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[1000]"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-[1001] flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-[#111113] border border-white/[0.08] rounded-2xl w-full max-w-md shadow-2xl">

              {/* Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.06]">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                    <CheckCircle2 size={14} className="text-emerald-400" />
                  </div>
                  <div>
                    <h2 className="text-[15px] font-semibold text-white font-display">Mark Session Complete</h2>
                    <p className="text-[11px] text-zinc-600 mt-0.5">Session {session.sessionNumber} — {session.topic}</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-zinc-500 hover:text-white hover:bg-white/[0.06] transition-all"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Body */}
              <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">

                {/* Progress hint */}
                <div className="flex items-center gap-2 text-[12px] text-zinc-500 bg-white/[0.02] border border-white/[0.05] rounded-lg px-3 py-2">
                  <CheckCircle2 size={12} className="text-emerald-400" />
                  This will be session {completedSessions + 1} of {totalSessions} completed.
                  {completedSessions + 1 >= totalSessions && (
                    <span className="text-emerald-400 font-medium ml-1">🎉 Final session!</span>
                  )}
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-[12px] text-zinc-500 mb-1.5 flex items-center gap-1.5">
                    <StickyNote size={11} /> Session Notes
                    <span className="text-zinc-700">(optional)</span>
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="What was covered? Key takeaways, challenges, or follow-ups…"
                    rows={4}
                    className="input-field text-[13px] resize-none"
                  />
                </div>

                {/* Proof URL */}
                <div>
                  <label className="block text-[12px] text-zinc-500 mb-1.5 flex items-center gap-1.5">
                    <Link size={11} /> Proof URL
                    <span className="text-zinc-700">(optional)</span>
                  </label>
                  <input
                    type="url"
                    value={proofUrl}
                    onChange={(e) => { setProofUrl(e.target.value); setUrlError(''); }}
                    placeholder="https://github.com/... or Google Drive link"
                    className="input-field text-[13px]"
                  />
                  {urlError && (
                    <p className="text-[11px] text-red-400 mt-1 flex items-center gap-1">
                      <AlertCircle size={10} /> {urlError}
                    </p>
                  )}
                  <p className="text-[11px] text-zinc-700 mt-1">
                    Link to a repo, deployed project, Drive file, or image URL
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-1">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-[13px] text-zinc-500 hover:text-zinc-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex items-center gap-2 btn-primary text-[13px] disabled:opacity-60"
                  >
                    {submitting ? (
                      <><Loader2 size={13} className="animate-spin" /> Saving…</>
                    ) : (
                      <><CheckCircle2 size={13} /> Mark Complete</>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default MarkCompleteModal;
