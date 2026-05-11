import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Plus,
  Loader2,
  FileText,
  Calendar,
  User,
  Clock,
  CheckCircle2,
  AlertCircle,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import useSessions from '../hooks/useSessions';
import useToast from '../hooks/useToast';
import Toast from '../components/Toast';
import SessionCard from '../components/SessionCard';
import MarkCompleteModal from '../components/MarkCompleteModal';
import { getContractById } from '../firebase/contractService';
import { createSession } from '../firebase/sessionService';

const fadeUp = (i = 0) => ({
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35, delay: i * 0.05 },
});

// ── Add Session Form (inline) ─────────────────────────────────────────────────
const AddSessionForm = ({ onSubmit, onCancel, nextSessionNumber, currentUserId, contract }) => {
  const [topic, setTopic]           = useState('');
  const [taughtBy, setTaughtBy]     = useState(currentUserId);
  const [scheduledAt, setScheduledAt] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState('');

  const isRequester = contract?.requesterId === currentUserId;
  const teacherOptions = [
    { uid: contract?.requesterId, name: contract?.requesterName },
    { uid: contract?.partnerId,   name: contract?.partnerName   },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!topic.trim()) { setError('Topic is required'); return; }
    setSubmitting(true);
    try {
      const teacherObj = teacherOptions.find((t) => t.uid === taughtBy);
      await onSubmit({
        topic: topic.trim(),
        taughtBy,
        taughtByName: teacherObj?.name || 'Unknown',
        scheduledAt,
        sessionNumber: nextSessionNumber,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="bg-[#0e0e10] border border-cyan-400/20 rounded-xl p-5 mb-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-cyan-400/10 flex items-center justify-center">
            <Plus size={12} className="text-cyan-400" />
          </div>
          <p className="text-[13px] font-semibold text-white">
            Add Session {nextSessionNumber}
          </p>
        </div>
        <button onClick={onCancel} className="text-zinc-600 hover:text-zinc-400 transition-colors">
          <X size={14} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-[12px] text-zinc-500 mb-1.5">Topic *</label>
          <input
            type="text"
            value={topic}
            onChange={(e) => { setTopic(e.target.value); setError(''); }}
            placeholder="e.g. Intro to React Hooks, Spanish Verbs Lesson 3…"
            className="input-field text-[13px]"
            autoFocus
          />
          {error && <p className="text-[11px] text-red-400 mt-1 flex items-center gap-1"><AlertCircle size={10} />{error}</p>}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[12px] text-zinc-500 mb-1.5">Taught by</label>
            <select
              value={taughtBy}
              onChange={(e) => setTaughtBy(e.target.value)}
              className="input-field text-[13px]"
            >
              {teacherOptions.map((t) => (
                <option key={t.uid} value={t.uid}>{t.name || t.uid}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[12px] text-zinc-500 mb-1.5">
              <span className="flex items-center gap-1"><Calendar size={10} /> Scheduled at</span>
            </label>
            <input
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              className="input-field text-[13px]"
              style={{ colorScheme: 'dark' }}
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-1">
          <button type="button" onClick={onCancel} className="px-4 py-2 text-[13px] text-zinc-500 hover:text-zinc-300 transition-colors">
            Cancel
          </button>
          <button type="submit" disabled={submitting} className="btn-primary text-[13px] flex items-center gap-2 disabled:opacity-60">
            {submitting ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />}
            Add Session
          </button>
        </div>
      </form>
    </motion.div>
  );
};

// ── Main page ──────────────────────────────────────────────────────────────────
const SessionsPage = () => {
  const { contractId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const { sessions, loading: sessionsLoading } = useSessions(contractId);
  const { toasts, showToast, dismissToast } = useToast();

  const [contract, setContract]         = useState(null);
  const [contractLoading, setContractLoading] = useState(true);
  const [showAddForm, setShowAddForm]   = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [showCompleteModal, setShowCompleteModal] = useState(false);

  // Load contract details
  useEffect(() => {
    if (!contractId) return;
    setContractLoading(true);
    getContractById(contractId)
      .then((c) => {
        setContract(c);
        if (!c) {
          console.warn('[SessionsPage] Contract not found:', contractId);
        } else {
          console.log('[SessionsPage] Contract loaded:', { contractId, status: c.status });
        }
      })
      .catch((err) => {
        console.error('[SessionsPage] Failed to load contract:', err);
      })
      .finally(() => setContractLoading(false));
  }, [contractId]);

  // Re-fetch contract when sessions change (to get updated completedSessions)
  useEffect(() => {
    if (!contractId || sessionsLoading) return;
    getContractById(contractId).then((c) => { if (c) setContract(c); });
  }, [sessions.length, contractId]);

  const isParticipant = contract && (
    contract.requesterId === currentUser?.uid ||
    contract.partnerId === currentUser?.uid
  );
  const isActive = contract?.status === 'active';
  const nextSessionNumber = sessions.length + 1;

  const progress = contract?.totalSessions > 0
    ? Math.round((contract.completedSessions / contract.totalSessions) * 100)
    : 0;

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleAddSession = async (data) => {
    if (!contractId) return;
    try {
      await createSession({ contractId, ...data });
      showToast('success', `Session ${data.sessionNumber} scheduled!`);
      setShowAddForm(false);
      console.log('[SessionsPage] Session created:', data);
    } catch (err) {
      console.error('[SessionsPage] Failed to create session:', err);
      showToast('error', 'Failed to add session. Please try again.');
    }
  };

  const handleMarkComplete = (session) => {
    setSelectedSession(session);
    setShowCompleteModal(true);
  };

  if (contractLoading) {
    return (
      <div className="page-container flex justify-center py-32">
        <Loader2 size={22} className="text-cyan-400 animate-spin" />
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="page-container text-center py-32">
        <FileText size={32} className="mx-auto mb-4 text-zinc-700" />
        <p className="text-zinc-500 text-sm">Contract not found.</p>
        <button onClick={() => navigate('/contracts')} className="mt-4 text-xs text-cyan-400 hover:text-cyan-300 transition-colors">
          ← Back to Contracts
        </button>
      </div>
    );
  }

  const isRequester = contract.requesterId === currentUser?.uid;
  const peerName = isRequester ? contract.partnerName : contract.requesterName;

  return (
    <div className="page-container !max-w-2xl">

      {/* Back button */}
      <motion.button
        {...fadeUp(0)}
        onClick={() => navigate('/contracts')}
        className="flex items-center gap-1.5 text-[12px] text-zinc-600 hover:text-zinc-400 transition-colors mb-8"
      >
        <ArrowLeft size={13} /> Back to Contracts
      </motion.button>

      {/* Contract header */}
      <motion.div {...fadeUp(1)} className="mb-8">
        <p className="section-label mb-3">Session tracking</p>
        <h1 className="text-3xl font-bold text-white font-display mb-2">
          Exchange with{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-violet-400">
            {peerName}
          </span>
        </h1>

        {/* Status + meta */}
        <div className="flex flex-wrap items-center gap-3 mt-4 mb-5">
          <span className={`inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full border ${
            contract.status === 'active'    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
            contract.status === 'completed' ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' :
            contract.status === 'pending'   ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                                              'bg-zinc-800/50 text-zinc-500 border-zinc-700/30'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${
              contract.status === 'active' ? 'bg-emerald-400 animate-pulse' :
              contract.status === 'completed' ? 'bg-cyan-400' : 'bg-zinc-500'
            }`} />
            {contract.status.charAt(0).toUpperCase() + contract.status.slice(1)}
          </span>

          <span className="text-[11px] text-zinc-600 flex items-center gap-1">
            <Clock size={10} /> {contract.durationWeeks} weeks
          </span>
          <span className="text-[11px] text-zinc-600 flex items-center gap-1">
            <CheckCircle2 size={10} /> {contract.completedSessions}/{contract.totalSessions} sessions
          </span>
        </div>

        {/* Skills */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="bg-white/[0.02] border border-white/[0.05] rounded-lg p-3">
            <p className="text-[10px] text-zinc-600 uppercase tracking-wide mb-1">You teach</p>
            <p className="text-[13px] font-medium text-zinc-300">
              {isRequester ? contract.requesterSkillOffered : contract.partnerSkillOffered}
            </p>
          </div>
          <div className="bg-white/[0.02] border border-white/[0.05] rounded-lg p-3">
            <p className="text-[10px] text-zinc-600 uppercase tracking-wide mb-1">You learn</p>
            <p className="text-[13px] font-medium text-zinc-300">
              {isRequester ? contract.partnerSkillOffered : contract.requesterSkillOffered}
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] text-zinc-600">Overall progress</span>
            <span className="text-[11px] font-semibold text-zinc-400">{progress}%</span>
          </div>
          <div className="w-full h-2 bg-white/[0.06] rounded-full overflow-hidden">
            <motion.div
              className={`h-full rounded-full ${
                contract.status === 'completed' ? 'bg-gradient-to-r from-cyan-400 to-violet-400' : 'bg-emerald-400'
              }`}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </div>
          {contract.status === 'completed' && (
            <p className="text-[11px] text-cyan-400 mt-1.5 flex items-center gap-1">
              <CheckCircle2 size={11} /> Contract completed! 🎉
            </p>
          )}
        </div>
      </motion.div>

      {/* Sessions section */}
      <motion.div {...fadeUp(2)}>
        <div className="flex items-baseline justify-between mb-5">
          <div>
            <p className="section-label mb-1">Timeline</p>
            <h2 className="section-title">Sessions</h2>
          </div>

          {/* Add session button (active contracts + participants only) */}
          {isActive && isParticipant && sessions.length < contract.totalSessions && !showAddForm && (
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-1.5 btn-primary text-[12px]"
            >
              <Plus size={13} />
              Add Session
            </button>
          )}
        </div>

        {/* Add session form */}
        <AnimatePresence>
          {showAddForm && (
            <AddSessionForm
              onSubmit={handleAddSession}
              onCancel={() => setShowAddForm(false)}
              nextSessionNumber={nextSessionNumber}
              currentUserId={currentUser?.uid}
              contract={contract}
            />
          )}
        </AnimatePresence>

        {/* Sessions list */}
        {sessionsLoading ? (
          <div className="py-16 flex justify-center">
            <Loader2 size={20} className="text-cyan-400 animate-spin" />
          </div>
        ) : sessions.length > 0 ? (
          <div className="mt-2">
            {sessions.map((session, i) => (
              <SessionCard
                key={session.id}
                session={session}
                isLast={i === sessions.length - 1}
                delay={i * 0.06}
                canMarkComplete={isActive && isParticipant}
                onMarkComplete={handleMarkComplete}
              />
            ))}
          </div>
        ) : (
          <div className="py-16 text-center border border-white/[0.05] rounded-xl">
            <Clock size={28} className="mx-auto mb-3 text-zinc-700" />
            <p className="text-sm text-zinc-500 mb-1">No sessions yet.</p>
            {isActive && isParticipant && (
              <button
                onClick={() => setShowAddForm(true)}
                className="mt-2 text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                Schedule the first session →
              </button>
            )}
            {!isActive && (
              <p className="text-[12px] text-zinc-700 mt-1">
                {contract.status === 'pending'
                  ? 'Sessions can be added once the contract is accepted.'
                  : `This contract is ${contract.status}.`}
              </p>
            )}
          </div>
        )}
      </motion.div>

      {/* Modals */}
      <MarkCompleteModal
        session={selectedSession}
        contractId={contractId}
        isOpen={showCompleteModal}
        onClose={() => { setShowCompleteModal(false); setSelectedSession(null); }}
        onSuccess={() => {}}
        showToast={showToast}
        totalSessions={contract?.totalSessions || 0}
        completedSessions={contract?.completedSessions || 0}
      />

      <Toast toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
};

export default SessionsPage;
