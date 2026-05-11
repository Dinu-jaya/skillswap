import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, FileText, Loader2, ChevronDown, AlertCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { createContract } from '../firebase/contractService';
import { getUserProfile } from '../firebase/userService';

/**
 * CreateContractModal — modal form for proposing a new exchange contract.
 *
 * Props:
 *  - isOpen: bool
 *  - onClose: fn
 *  - onSuccess: fn(contractId) — called after successful creation
 *  - partner: { uid, name, displayName, avatar } — pre-selected partner
 *  - showToast: fn(type, message)
 */
const CreateContractModal = ({ isOpen, onClose, onSuccess, partner, showToast }) => {
  const { currentUser, userProfile } = useAuth();

  // ── Form fields ────────────────────────────────────────────────────────────
  const [requesterSkillOffered, setRequesterSkillOffered] = useState('');
  const [requesterSkillWanted, setRequesterSkillWanted]   = useState('');
  const [partnerSkillOffered, setPartnerSkillOffered]     = useState('');
  const [partnerSkillWanted, setPartnerSkillWanted]       = useState('');
  const [durationWeeks, setDurationWeeks]                 = useState(4);
  const [totalSessions, setTotalSessions]                 = useState(8);

  // ── State ──────────────────────────────────────────────────────────────────
  const [submitting, setSubmitting] = useState(false);
  const [loadingPartner, setLoadingPartner] = useState(false);
  const [partnerProfile, setPartnerProfile] = useState(null);
  const [errors, setErrors] = useState({});

  // ── Auto-fill from current user's profile ─────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;
    const skills = userProfile?.skillsOffered || [];
    const firstSkill = Array.isArray(skills) && skills.length > 0
      ? (typeof skills[0] === 'string' ? skills[0] : skills[0]?.name || '')
      : '';
    setRequesterSkillOffered(firstSkill);
  }, [isOpen, userProfile]);

  // ── Auto-fill from partner's Firestore profile ────────────────────────────
  useEffect(() => {
    if (!isOpen || !partner?.uid) return;
    setLoadingPartner(true);
    setPartnerProfile(null);

    getUserProfile(partner.uid)
      .then((profile) => {
        setPartnerProfile(profile);
        if (profile) {
          // Auto-fill partner's first offered skill
          const offered = profile.skillsOffered || [];
          const firstOffered = Array.isArray(offered) && offered.length > 0
            ? (typeof offered[0] === 'string' ? offered[0] : offered[0]?.name || '')
            : '';
          setPartnerSkillOffered(firstOffered);

          // Auto-fill: partner wants what we offer (symmetric hint)
          const wanted = profile.skillsWanted || [];
          const firstWanted = Array.isArray(wanted) && wanted.length > 0
            ? (typeof wanted[0] === 'string' ? wanted[0] : wanted[0]?.name || '')
            : '';
          setPartnerSkillWanted(firstWanted);

          // Also update requesterSkillWanted from partner's offered
          setRequesterSkillWanted(firstOffered);
        }
      })
      .catch((err) => {
        console.error('[CreateContractModal] Failed to load partner profile:', err);
      })
      .finally(() => setLoadingPartner(false));
  }, [isOpen, partner?.uid]);

  // ── Reset on close ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) {
      setErrors({});
      setSubmitting(false);
    }
  }, [isOpen]);

  // ── Close on Escape ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  // ── Validation ─────────────────────────────────────────────────────────────
  const validate = () => {
    const errs = {};
    if (!requesterSkillOffered.trim()) errs.requesterSkillOffered = 'Required';
    if (!requesterSkillWanted.trim())  errs.requesterSkillWanted  = 'Required';
    if (!partnerSkillOffered.trim())   errs.partnerSkillOffered   = 'Required';
    if (totalSessions < 1 || totalSessions > 52) errs.totalSessions = '1–52 sessions';
    if (durationWeeks < 1 || durationWeeks > 52) errs.durationWeeks = '1–52 weeks';
    return errs;
  };

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    if (!currentUser || !partner?.uid) return;

    setSubmitting(true);
    try {
      const contractId = await createContract({
        requesterId: currentUser.uid,
        requesterName: userProfile?.displayName || userProfile?.name || currentUser.email?.split('@')[0] || 'User',
        requesterAvatar: userProfile?.avatar || null,
        partnerId: partner.uid,
        partnerName: partner.name || partner.displayName || 'Partner',
        partnerAvatar: partner.avatar || null,
        requesterSkillOffered: requesterSkillOffered.trim(),
        requesterSkillWanted: requesterSkillWanted.trim(),
        partnerSkillOffered: partnerSkillOffered.trim(),
        partnerSkillWanted: partnerSkillWanted.trim(),
        durationWeeks: Number(durationWeeks),
        totalSessions: Number(totalSessions),
      });

      console.log('[CreateContractModal] Contract created:', contractId);
      showToast?.('success', `Contract sent to ${partner.name || partner.displayName || 'partner'}!`);
      onSuccess?.(contractId);
      onClose();
    } catch (err) {
      console.error('[CreateContractModal] Failed to create contract:', err);
      showToast?.('error', 'Failed to create contract. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Skill suggestions from profiles ───────────────────────────────────────
  const mySkillOptions = (userProfile?.skillsOffered || []).map((s) =>
    typeof s === 'string' ? s : s?.name || ''
  ).filter(Boolean);

  const partnerSkillOptions = (partnerProfile?.skillsOffered || []).map((s) =>
    typeof s === 'string' ? s : s?.name || ''
  ).filter(Boolean);

  if (!isOpen) return null;

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
            <div className="bg-[#111113] border border-white/[0.08] rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">

              {/* Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.06]">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center">
                    <FileText size={14} className="text-cyan-400" />
                  </div>
                  <div>
                    <h2 className="text-[15px] font-semibold text-white font-display">New Exchange Contract</h2>
                    <p className="text-[11px] text-zinc-600 mt-0.5">
                      with {partner?.name || partner?.displayName || 'partner'}
                    </p>
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
              <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">

                {/* Partner profile loading state */}
                {loadingPartner && (
                  <div className="flex items-center gap-2 text-[12px] text-zinc-500 bg-white/[0.02] border border-white/[0.05] rounded-lg px-3 py-2">
                    <Loader2 size={12} className="animate-spin text-cyan-400" />
                    Loading partner profile for auto-fill…
                  </div>
                )}

                {/* Your skills */}
                <div className="space-y-3">
                  <p className="text-[11px] font-bold text-zinc-600 uppercase tracking-widest">Your side</p>

                  <FieldGroup label="You will teach" error={errors.requesterSkillOffered}>
                    <input
                      type="text"
                      value={requesterSkillOffered}
                      onChange={(e) => { setRequesterSkillOffered(e.target.value); setErrors((p) => ({ ...p, requesterSkillOffered: '' })); }}
                      placeholder="e.g. React, Python, Guitar"
                      className="input-field text-[13px]"
                      list="my-skills-list"
                    />
                    <datalist id="my-skills-list">
                      {mySkillOptions.map((s) => <option key={s} value={s} />)}
                    </datalist>
                  </FieldGroup>

                  <FieldGroup label="You want to learn" error={errors.requesterSkillWanted}>
                    <input
                      type="text"
                      value={requesterSkillWanted}
                      onChange={(e) => { setRequesterSkillWanted(e.target.value); setErrors((p) => ({ ...p, requesterSkillWanted: '' })); }}
                      placeholder="e.g. Design, Spanish, Piano"
                      className="input-field text-[13px]"
                      list="partner-skills-list"
                    />
                    <datalist id="partner-skills-list">
                      {partnerSkillOptions.map((s) => <option key={s} value={s} />)}
                    </datalist>
                  </FieldGroup>
                </div>

                <div className="border-t border-white/[0.05]" />

                {/* Partner skills */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-bold text-zinc-600 uppercase tracking-widest">Partner's side</p>
                    {loadingPartner && <Loader2 size={10} className="animate-spin text-zinc-600" />}
                    {!loadingPartner && partnerSkillOptions.length > 0 && (
                      <span className="text-[10px] text-zinc-600 italic">auto-filled · edit below</span>
                    )}
                  </div>

                  <FieldGroup label={`${partner?.name || 'Partner'} will teach`} error={errors.partnerSkillOffered}>
                    <input
                      type="text"
                      value={partnerSkillOffered}
                      onChange={(e) => { setPartnerSkillOffered(e.target.value); setErrors((p) => ({ ...p, partnerSkillOffered: '' })); }}
                      placeholder="e.g. Design, Spanish, Piano"
                      className="input-field text-[13px]"
                      list="partner-skills-offered-list"
                    />
                    <datalist id="partner-skills-offered-list">
                      {partnerSkillOptions.map((s) => <option key={s} value={s} />)}
                    </datalist>
                  </FieldGroup>

                  <FieldGroup label={`${partner?.name || 'Partner'} wants to learn`}>
                    <input
                      type="text"
                      value={partnerSkillWanted}
                      onChange={(e) => setPartnerSkillWanted(e.target.value)}
                      placeholder="e.g. React, Python, Guitar"
                      className="input-field text-[13px]"
                      list="my-skills-list-2"
                    />
                    <datalist id="my-skills-list-2">
                      {mySkillOptions.map((s) => <option key={s} value={s} />)}
                    </datalist>
                  </FieldGroup>
                </div>

                <div className="border-t border-white/[0.05]" />

                {/* Duration & sessions */}
                <div className="grid grid-cols-2 gap-3">
                  <FieldGroup label="Duration (weeks)" error={errors.durationWeeks}>
                    <input
                      type="number"
                      min={1}
                      max={52}
                      value={durationWeeks}
                      onChange={(e) => { setDurationWeeks(e.target.value); setErrors((p) => ({ ...p, durationWeeks: '' })); }}
                      className="input-field text-[13px]"
                    />
                  </FieldGroup>

                  <FieldGroup label="Total sessions" error={errors.totalSessions}>
                    <input
                      type="number"
                      min={1}
                      max={52}
                      value={totalSessions}
                      onChange={(e) => { setTotalSessions(e.target.value); setErrors((p) => ({ ...p, totalSessions: '' })); }}
                      className="input-field text-[13px]"
                    />
                  </FieldGroup>
                </div>

                {/* Info note */}
                <div className="flex items-start gap-2 bg-cyan-500/[0.05] border border-cyan-500/10 rounded-lg px-3 py-2.5">
                  <AlertCircle size={13} className="text-cyan-500 mt-0.5 shrink-0" />
                  <p className="text-[12px] text-zinc-500 leading-relaxed">
                    Your partner will receive a notification and must accept before sessions can begin.
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
                      <><Loader2 size={13} className="animate-spin" /> Sending…</>
                    ) : (
                      <><FileText size={13} /> Propose Contract</>
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

// ── Sub-component: labelled field with error ───────────────────────────────────
const FieldGroup = ({ label, error, children }) => (
  <div>
    <label className="block text-[12px] text-zinc-500 mb-1.5">{label}</label>
    {children}
    {error && (
      <p className="text-[11px] text-red-400 mt-1 flex items-center gap-1">
        <AlertCircle size={10} />{error}
      </p>
    )}
  </div>
);

export default CreateContractModal;
