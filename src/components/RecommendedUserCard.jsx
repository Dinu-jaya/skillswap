import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, Loader2, Check, Link, Flag } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { sendExchangeRequest, checkExistingRequest } from '../firebase/requestService';
import Avatar from './Avatar';
import ReportModal from './ReportModal';

/**
 * Derives a UI status string from a Firestore request status.
 * 'connect' → can send   'loading' → in-flight   'sent' → pending   'connected' → accepted
 */
const deriveUIStatus = (requestStatus) => {
  if (requestStatus === 'accepted') return 'connected';
  if (requestStatus === 'pending')  return 'sent';
  return 'connect'; // null / rejected → allow (re)send
};

const RecommendedUserCard = ({ user, delay = 0 }) => {
  const { currentUser, userProfile } = useAuth();

  // 'connect' | 'loading' | 'checking' | 'sent' | 'connected'
  const [status, setStatus] = useState('checking');
  const [showReport, setShowReport] = useState(false);

  const isSelf = currentUser?.uid === user?.uid;

  // ── Load real connection state from Firestore on mount ───────────────────
  useEffect(() => {
    if (!currentUser?.uid || !user?.uid) {
      setStatus('connect');
      return;
    }
    // Don't check self
    if (currentUser.uid === user.uid) {
      setStatus('connected');
      return;
    }

    let cancelled = false;
    checkExistingRequest(currentUser.uid, user.uid).then(({ status: reqStatus }) => {
      if (!cancelled) setStatus(deriveUIStatus(reqStatus));
    });

    return () => { cancelled = true; };
  }, [currentUser?.uid, user?.uid]);

  // ── Send handler ──────────────────────────────────────────────────────────
  const handleConnect = async () => {
    if (status !== 'connect' || !currentUser) return;
    setStatus('loading');

    try {
      const senderDetails = {
        uid: currentUser.uid,
        displayName: userProfile?.displayName || userProfile?.name || currentUser.displayName,
        name: userProfile?.name || userProfile?.displayName,
        email: currentUser.email,
        avatar: userProfile?.avatar || null,
      };

      const result = await sendExchangeRequest(
        senderDetails,
        user.uid,
        null,
        'Connection Request',
        user.name || user.displayName || 'User',
        user.avatar || null
      );

      // sendExchangeRequest now returns { alreadyExists, status, requestId }
      setStatus(deriveUIStatus(result.status));
    } catch (err) {
      console.error('Failed to send request:', err);
      setStatus('connect'); // reset on error so user can retry
    }
  };

  // ── Button appearance map ─────────────────────────────────────────────────
  const btnConfig = {
    connect: {
      label: 'Connect',
      icon: <UserPlus size={13} />,
      cls: 'bg-transparent border-white/[0.08] text-zinc-500 hover:border-cyan-400/50 hover:text-cyan-400 hover:bg-cyan-400/[0.06]',
      disabled: false,
    },
    loading: {
      label: 'Sending…',
      icon: <Loader2 size={13} className="animate-spin" />,
      cls: 'bg-transparent border-white/[0.06] text-zinc-600 opacity-60',
      disabled: true,
    },
    checking: {
      label: 'Checking…',
      icon: <Loader2 size={13} className="animate-spin" />,
      cls: 'bg-transparent border-white/[0.06] text-zinc-600 opacity-60',
      disabled: true,
    },
    sent: {
      label: 'Request Sent',
      icon: <Check size={13} />,
      cls: 'bg-amber-500/[0.08] border-amber-500/20 text-amber-400 cursor-default',
      disabled: true,
    },
    connected: {
      label: 'Connected',
      icon: <Check size={13} />,
      cls: 'bg-emerald-500/[0.08] border-emerald-500/20 text-emerald-400 cursor-default',
      disabled: true,
    },
  };

  const btn = btnConfig[status] || btnConfig.connect;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-white/[0.03] transition-colors group"
      >
        <Avatar
          avatarId={user.avatar}
          size={32}
          className="rounded-full bg-zinc-800 border border-white/[0.08]"
        />

        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-medium text-zinc-200 group-hover:text-white transition-colors truncate">
            {user.name || user.displayName}
          </p>
          <p className="muted-text !text-[11px] truncate">{user.role}</p>
          <div className="flex gap-1 mt-1">
            {(user.mutualSkills || []).slice(0, 2).map((skill) => (
              <span
                key={typeof skill === 'string' ? skill : skill.name}
                className="text-[10px] px-1.5 py-0.5 rounded bg-white/[0.04] text-zinc-600 border border-white/[0.05]"
              >
                {typeof skill === 'string' ? skill : skill.name}
              </span>
            ))}
          </div>
        </div>

        <button
          onClick={handleConnect}
          disabled={btn.disabled}
          title={btn.label}
          className={`shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-200 border ${btn.cls}`}
        >
          {btn.icon}
        </button>

        {!isSelf && (
          <button
            onClick={() => setShowReport(true)}
            title="Report user"
            className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center border border-white/[0.06] text-zinc-700 hover:text-red-400 hover:border-red-400/20 hover:bg-red-400/[0.06] transition-all opacity-0 group-hover:opacity-100 duration-200"
          >
            <Flag size={11} />
          </button>
        )}
      </motion.div>

      <AnimatePresence>
        {showReport && (
          <ReportModal
            reportedUser={user}
            onClose={() => setShowReport(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
};


export default RecommendedUserCard;
