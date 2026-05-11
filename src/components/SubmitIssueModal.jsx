import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, LifeBuoy, CheckCircle } from 'lucide-react';
import { submitIssue } from '../firebase/moderationService';
import { useAuth } from '../context/AuthContext';

/**
 * SubmitIssueModal — lets a user submit a help/issue request to admins.
 * Props:
 *   onClose: () => void
 */
const SubmitIssueModal = ({ onClose }) => {
  const { currentUser } = useAuth();
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!subject.trim()) e.subject = 'Subject is required.';
    if (!description.trim()) e.description = 'Description is required.';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    try {
      setSubmitting(true);
      setErrors({});
      await submitIssue(currentUser.uid, subject.trim(), description.trim());
      setSubmitted(true);
    } catch (err) {
      console.error('[SubmitIssueModal] failed:', err);
      setErrors({ general: 'Failed to submit. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

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
              <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center">
                <LifeBuoy size={14} className="text-violet-400" />
              </div>
              <div>
                <h3 className="text-[15px] font-semibold text-white" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                  Submit an Issue
                </h3>
                <p className="text-[11px] text-zinc-600">Our team will get back to you</p>
              </div>
            </div>
            <button onClick={onClose} className="text-zinc-600 hover:text-zinc-300 transition-colors">
              <X size={18} />
            </button>
          </div>

          {submitted ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 rounded-full bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={22} className="text-violet-400" />
              </div>
              <p className="text-[15px] font-semibold text-white mb-1">Issue Submitted!</p>
              <p className="text-[13px] text-zinc-500 mb-6">
                The admin team has been notified and will review your issue.
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
              {/* Subject */}
              <div>
                <label className="block text-[11px] font-bold text-zinc-600 uppercase tracking-widest mb-2">
                  Subject
                </label>
                <input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Brief summary of the issue…"
                  className="w-full text-[13px] px-4 py-2.5 bg-white/[0.03] border border-white/[0.08] rounded-xl text-zinc-300 placeholder:text-zinc-700 focus:outline-none focus:border-violet-400/30 transition-all"
                />
                {errors.subject && <p className="text-[11px] text-red-400 mt-1">{errors.subject}</p>}
              </div>

              {/* Description */}
              <div>
                <label className="block text-[11px] font-bold text-zinc-600 uppercase tracking-widest mb-2">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={5}
                  placeholder="Describe the issue in detail, steps to reproduce, etc…"
                  className="w-full text-[13px] px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-zinc-300 placeholder:text-zinc-700 focus:outline-none focus:border-violet-400/30 transition-all resize-none"
                />
                {errors.description && <p className="text-[11px] text-red-400 mt-1">{errors.description}</p>}
              </div>

              {errors.general && (
                <p className="text-[12px] text-red-400 bg-red-500/[0.08] border border-red-500/20 rounded-lg px-3 py-2">
                  {errors.general}
                </p>
              )}

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
                  className="flex-1 py-2.5 bg-violet-500/90 hover:bg-violet-500 disabled:opacity-50 text-white text-[13px] font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <LifeBuoy size={13} />
                  )}
                  {submitting ? 'Submitting…' : 'Submit Issue'}
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SubmitIssueModal;
