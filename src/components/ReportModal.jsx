import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Flag, ChevronDown } from 'lucide-react';
import { submitReport } from '../firebase/moderationService';
import { useAuth } from '../context/AuthContext';

const REPORT_REASONS = [
  'Harassment or bullying',
  'Spam or misleading content',
  'Inappropriate language',
  'Fake profile / impersonation',
  'Scam or fraud',
  'Other',
];

/**
 * ReportModal — lets a user report another user.
 * Props:
 *   reportedUser: { uid, displayName | name }
 *   onClose: () => void
 */
const ReportModal = ({ reportedUser, onClose }) => {
  const { currentUser } = useAuth();
  const [reason, setReason] = useState(REPORT_REASONS[0]);
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim()) {
      setError('Please provide a description.');
      return;
    }
    try {
      setSubmitting(true);
      setError('');
      await submitReport(
        currentUser.uid,
        reportedUser.uid,
        reason,
        description.trim()
      );
      setSubmitted(true);
    } catch (err) {
      console.error('[ReportModal] submit failed:', err);
      setError('Failed to submit report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const reportedName = reportedUser?.displayName || reportedUser?.name || 'this user';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[80] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 12 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-md bg-[#111113] border border-white/[0.08] rounded-2xl p-6 shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
                <Flag size={14} className="text-red-400" />
              </div>
              <div>
                <h3 className="text-[15px] font-semibold text-white" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                  Report User
                </h3>
                <p className="text-[11px] text-zinc-600">Reporting: {reportedName}</p>
              </div>
            </div>
            <button onClick={onClose} className="text-zinc-600 hover:text-zinc-300 transition-colors">
              <X size={18} />
            </button>
          </div>

          {submitted ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                <Flag size={20} className="text-emerald-400" />
              </div>
              <p className="text-[15px] font-semibold text-white mb-1">Report Submitted</p>
              <p className="text-[13px] text-zinc-500 mb-6">
                Our moderation team will review this report shortly.
              </p>
              <button
                onClick={onClose}
                className="px-6 py-2 bg-white/[0.05] border border-white/[0.08] text-zinc-300 text-[13px] font-medium rounded-xl hover:bg-white/[0.08] transition-all"
              >
                Close
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Reason */}
              <div>
                <label className="block text-[11px] font-bold text-zinc-600 uppercase tracking-widest mb-2">
                  Reason
                </label>
                <div className="relative">
                  <select
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full appearance-none text-[13px] px-4 py-2.5 bg-white/[0.03] border border-white/[0.08] rounded-xl text-zinc-300 focus:outline-none focus:border-red-400/30 transition-all pr-10"
                  >
                    {REPORT_REASONS.map((r) => (
                      <option key={r} value={r} className="bg-[#111113]">{r}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 pointer-events-none" />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-[11px] font-bold text-zinc-600 uppercase tracking-widest mb-2">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  placeholder="Describe what happened in detail…"
                  className="w-full text-[13px] px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-zinc-300 placeholder:text-zinc-700 focus:outline-none focus:border-red-400/30 transition-all resize-none"
                />
                {error && <p className="text-[11px] text-red-400 mt-1">{error}</p>}
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 bg-white/[0.03] border border-white/[0.08] text-zinc-400 text-[13px] font-medium rounded-xl hover:bg-white/[0.06] transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 bg-red-500/90 hover:bg-red-500 disabled:opacity-50 text-white text-[13px] font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Flag size={13} />
                  )}
                  {submitting ? 'Submitting…' : 'Submit Report'}
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ReportModal;
