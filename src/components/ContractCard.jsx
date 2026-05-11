import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  CheckCircle2,
  Clock,
  XCircle,
  ChevronRight,
  Users,
  ArrowLeftRight,
  Loader2,
} from 'lucide-react';
import Avatar from './Avatar';

// ── Status config ─────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  pending: {
    label: 'Pending',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    icon: Clock,
  },
  active: {
    label: 'Active',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    icon: CheckCircle2,
  },
  completed: {
    label: 'Completed',
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/20',
    icon: CheckCircle2,
  },
  cancelled: {
    label: 'Cancelled',
    color: 'text-zinc-500',
    bg: 'bg-zinc-800/50',
    border: 'border-zinc-700/30',
    icon: XCircle,
  },
};

/**
 * ContractCard — displays a contract with:
 *  - Both parties & their skills
 *  - Progress bar
 *  - Status badge
 *  - Contextual action buttons
 *
 * Props:
 *  - contract: Firestore contract object
 *  - currentUserId: string
 *  - onAccept, onReject, onCancel: async handlers
 *  - loading: { accept: bool, reject: bool, cancel: bool }
 *  - compact: bool — shows minimal version for Dashboard
 */
const ContractCard = ({
  contract,
  currentUserId,
  onAccept,
  onReject,
  onCancel,
  loading = {},
  compact = false,
  delay = 0,
}) => {
  const navigate = useNavigate();

  const isRequester = contract.requesterId === currentUserId;
  const isPartner = contract.partnerId === currentUserId;

  const peerName = isRequester ? contract.partnerName : contract.requesterName;
  const peerAvatar = isRequester ? contract.partnerAvatar : contract.requesterAvatar;
  const mySkillOffered = isRequester ? contract.requesterSkillOffered : contract.partnerSkillOffered;
  const partnerSkillOffered = isRequester ? contract.partnerSkillOffered : contract.requesterSkillOffered;

  const progress = contract.totalSessions > 0
    ? Math.round((contract.completedSessions / contract.totalSessions) * 100)
    : 0;

  const statusCfg = STATUS_CONFIG[contract.status] || STATUS_CONFIG.pending;
  const StatusIcon = statusCfg.icon;

  const canAccept = contract.status === 'pending' && isPartner;
  const canReject = contract.status === 'pending' && isPartner;
  const canCancel = (contract.status === 'pending' && isRequester) || contract.status === 'active';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="glass-card p-5 hover:border-white/[0.11] transition-all group"
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-cyan-400/[0.08] border border-cyan-400/20 flex items-center justify-center shrink-0">
            <FileText size={15} className="text-cyan-400" />
          </div>
          <div className="min-w-0">
            <p className="text-[13px] font-semibold text-white truncate">
              Exchange with{' '}
              <span className="text-cyan-300">{peerName || 'Unknown'}</span>
            </p>
            <p className="text-[11px] text-zinc-600 mt-0.5">
              {contract.durationWeeks} week{contract.durationWeeks !== 1 ? 's' : ''} ·{' '}
              {contract.totalSessions} session{contract.totalSessions !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {/* Status badge */}
        <span className={`shrink-0 inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full border ${statusCfg.bg} ${statusCfg.color} ${statusCfg.border}`}>
          <StatusIcon size={10} />
          {statusCfg.label}
        </span>
      </div>

      {/* Skills exchange row */}
      {!compact && (
        <div className="flex items-center gap-2 mb-4 p-3 bg-white/[0.02] rounded-lg border border-white/[0.04]">
          <div className="flex-1 min-w-0">
            <p className="text-[10px] text-zinc-600 uppercase tracking-wide mb-0.5">You teach</p>
            <p className="text-[12px] text-zinc-300 font-medium truncate">
              {mySkillOffered || '—'}
            </p>
          </div>
          <ArrowLeftRight size={12} className="text-zinc-700 shrink-0" />
          <div className="flex-1 min-w-0 text-right">
            <p className="text-[10px] text-zinc-600 uppercase tracking-wide mb-0.5">You learn</p>
            <p className="text-[12px] text-zinc-300 font-medium truncate">
              {partnerSkillOffered || '—'}
            </p>
          </div>
        </div>
      )}

      {/* Progress bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] text-zinc-600">Progress</span>
          <span className="text-[11px] font-medium text-zinc-400">
            {contract.completedSessions} / {contract.totalSessions} sessions
          </span>
        </div>
        <div className="w-full h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
          <motion.div
            className={`h-full rounded-full ${
              contract.status === 'completed' ? 'bg-cyan-400' :
              contract.status === 'active'    ? 'bg-emerald-400' :
              'bg-zinc-600'
            }`}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.6, ease: 'easeOut', delay: delay + 0.1 }}
          />
        </div>
        {progress > 0 && (
          <p className="text-[10px] text-zinc-700 mt-1">{progress}% complete</p>
        )}
      </div>

      {/* Action row */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* View sessions button */}
        {(contract.status === 'active' || contract.status === 'completed') && (
          <button
            onClick={() => navigate(`/contracts/${contract.id}/sessions`)}
            className="flex items-center gap-1.5 text-[12px] font-medium text-cyan-400 border border-cyan-400/20 hover:border-cyan-400/40 px-3 py-1.5 rounded-lg bg-cyan-400/[0.06] hover:bg-cyan-400/[0.12] transition-all"
          >
            <FileText size={11} />
            Sessions
            <ChevronRight size={10} />
          </button>
        )}

        {/* Accept (partner only, pending) */}
        {canAccept && (
          <button
            onClick={onAccept}
            disabled={loading.accept}
            className="flex items-center gap-1.5 text-[12px] font-medium text-emerald-400 border border-emerald-400/20 hover:border-emerald-400/40 px-3 py-1.5 rounded-lg bg-emerald-400/[0.06] hover:bg-emerald-400/[0.12] disabled:opacity-50 transition-all"
          >
            {loading.accept ? <Loader2 size={11} className="animate-spin" /> : <CheckCircle2 size={11} />}
            Accept
          </button>
        )}

        {/* Reject (partner only, pending) */}
        {canReject && (
          <button
            onClick={onReject}
            disabled={loading.reject}
            className="flex items-center gap-1.5 text-[12px] font-medium text-zinc-500 hover:text-zinc-300 border border-white/[0.06] hover:border-white/[0.12] px-3 py-1.5 rounded-lg hover:bg-white/[0.03] disabled:opacity-50 transition-all"
          >
            {loading.reject ? <Loader2 size={11} className="animate-spin" /> : <XCircle size={11} />}
            Decline
          </button>
        )}

        {/* Cancel */}
        {canCancel && (
          <button
            onClick={onCancel}
            disabled={loading.cancel}
            className="flex items-center gap-1.5 text-[12px] font-medium text-zinc-600 hover:text-red-400 border border-white/[0.04] hover:border-red-400/20 px-3 py-1.5 rounded-lg hover:bg-red-400/[0.06] disabled:opacity-50 transition-all ml-auto"
          >
            {loading.cancel ? <Loader2 size={11} className="animate-spin" /> : <XCircle size={11} />}
            Cancel
          </button>
        )}

        {/* Compact: view sessions CTA */}
        {compact && contract.status === 'active' && (
          <button
            onClick={() => navigate(`/contracts/${contract.id}/sessions`)}
            className="ml-auto flex items-center gap-1 text-[11px] text-zinc-600 hover:text-cyan-400 transition-colors"
          >
            View <ChevronRight size={11} />
          </button>
        )}
      </div>
    </motion.div>
  );
};

export default ContractCard;
