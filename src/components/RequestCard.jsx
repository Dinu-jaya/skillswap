import { useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import Avatar from './Avatar';

const RequestCard = ({ request, delay = 0, onAccept, onReject }) => {
  const [loadingAction, setLoadingAction] = useState(null);

  const handleAction = async (action) => {
    setLoadingAction(action);
    await new Promise((resolve) => setTimeout(resolve, 550));
    if (action === 'accept' && onAccept) onAccept();
    else if (action === 'reject' && onReject) onReject();
    setLoadingAction(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, height: 0, marginTop: 0, paddingTop: 0, paddingBottom: 0 }}
      transition={{ delay, duration: 0.25 }}
      className="flex items-center gap-4 px-5 py-4 hover:bg-white/[0.02] transition-colors"
    >
      {/* Avatar */}
      <Avatar
        avatarId={request.avatar}
        size={32}
        className="rounded-full bg-zinc-800 border border-white/[0.08]"
      />

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-medium text-zinc-200 truncate">{request.user}</p>
        <p className="muted-text !text-[11px] truncate mt-0.5">
          wants to exchange <span className="text-cyan-400/80">{request.skill}</span>
        </p>
      </div>

      {/* Time */}
      <span className="small-label shrink-0 hidden sm:block !normal-case !tracking-normal">{request.time}</span>

      {/* Actions */}
      {request.status === 'Pending' ? (
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => handleAction('accept')}
            disabled={loadingAction !== null}
            className="text-[12px] font-medium text-emerald-400 hover:text-emerald-300 disabled:opacity-40 transition-colors px-2 py-1"
          >
            {loadingAction === 'accept' ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              'Accept'
            )}
          </button>
          <button
            onClick={() => handleAction('reject')}
            disabled={loadingAction !== null}
            className="text-[12px] font-medium text-zinc-600 hover:text-zinc-400 disabled:opacity-40 transition-colors px-2 py-1"
          >
            {loadingAction === 'reject' ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              'Decline'
            )}
          </button>
        </div>
      ) : (
        <span
          className={`text-[11px] font-medium px-2.5 py-1 rounded-full shrink-0 ${
            request.status === 'Accepted'
              ? 'bg-emerald-500/10 text-emerald-400'
              : 'bg-zinc-800 text-zinc-500'
          }`}
        >
          {request.status}
        </span>
      )}
    </motion.div>
  );
};

export default RequestCard;
