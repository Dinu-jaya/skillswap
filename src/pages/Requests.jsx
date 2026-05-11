import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, MessageSquare, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Avatar from '../components/Avatar';
import { useAuth } from '../context/AuthContext';
import { startConversationWithUser } from '../firebase/chatService';
import CreateContractModal from '../components/CreateContractModal';
import Toast from '../components/Toast';
import useToast from '../hooks/useToast';
import {
  subscribeToIncomingRequests,
  subscribeToSentRequests,
  subscribeToAcceptedRequests,
  acceptRequest,
  rejectRequest,
} from '../firebase/requestService';

const TABS = ['Pending', 'Accepted', 'Sent'];

const fadeUp = (i = 0) => ({
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35, delay: i * 0.05 },
});

// Formats a Firestore Timestamp to a relative string
const formatTime = (ts) => {
  if (!ts?.toMillis) return '';
  const diff = Date.now() - ts.toMillis();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
};

const Requests = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('Pending');
  const [pendingList, setPendingList] = useState([]);
  const [acceptedList, setAcceptedList] = useState([]);
  const [sentList, setSentList] = useState([]);
  const [loading, setLoading] = useState({});
  const [startingChat, setStartingChat] = useState(null);
  const [showCreateContract, setShowCreateContract] = useState(false);
  const [contractPartner, setContractPartner] = useState(null);
  const { toasts, showToast, dismissToast } = useToast();

  // Subscribe to all three request streams
  useEffect(() => {
    if (!currentUser?.uid) return;
    const unsubPending = subscribeToIncomingRequests(currentUser.uid, setPendingList);
    const unsubAccepted = subscribeToAcceptedRequests(currentUser.uid, setAcceptedList);
    const unsubSent = subscribeToSentRequests(currentUser.uid, setSentList);
    return () => { unsubPending(); unsubAccepted(); unsubSent(); };
  }, [currentUser?.uid]);

  const handleAction = async (req, action) => {
    setLoading((prev) => ({ ...prev, [req.id]: action }));
    try {
      if (action === 'accept') {
        await acceptRequest(req.id, currentUser, req);
      } else {
        await rejectRequest(req.id);
      }
    } catch (err) {
      console.error('Failed to process request:', err);
    } finally {
      setLoading((prev) => { const n = { ...prev }; delete n[req.id]; return n; });
    }
  };

  const handleOpenChat = async (req) => {
    if (!currentUser) { navigate('/login'); return; }
    setStartingChat(req.id);
    try {
      // Determine peer: for accepted from sent, peer is receiver; from incoming, peer is sender
      const peerId = req.senderId === currentUser.uid ? req.receiverId : req.senderId;
      const peerName = req.senderId === currentUser.uid ? req.receiverName : req.senderName;
      const peerAvatar = req.senderId === currentUser.uid ? req.receiverAvatar : req.senderAvatar;
      const chatId = await startConversationWithUser(currentUser, peerId, {
        name: peerName || 'User',
        avatar: peerAvatar || null,
      });
      if (chatId) navigate('/chat');
    } catch (err) {
      console.error('Failed to open chat:', err);
    } finally {
      setStartingChat(null);
    }
  };

  const listMap = { Pending: pendingList, Accepted: acceptedList, Sent: sentList };
  const items = listMap[activeTab] || [];

  return (
    <div className="page-container !max-w-3xl">
      {/* Header */}
      <motion.div className="header-spacing" {...fadeUp(0)}>
        <p className="section-label mb-4">Your exchanges</p>
        <h1 className="page-title mb-3">Requests</h1>
        <p className="page-description">Manage incoming and outgoing skill exchanges.</p>
      </motion.div>

      {/* Tabs */}
      <motion.div className="flex gap-1 mb-8 border-b border-white/[0.06]" {...fadeUp(1)}>
        {TABS.map((tab) => {
          const count = listMap[tab]?.length || 0;
          return (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`relative px-4 py-2.5 text-[13px] font-medium transition-colors ${activeTab === tab ? 'text-white' : 'text-zinc-600 hover:text-zinc-300'}`}>
              {tab}
              {count > 0 && (
                <span className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full bg-white/[0.06] text-zinc-500">{count}</span>
              )}
              {activeTab === tab && (
                <motion.div layoutId="requests-tab-underline" className="absolute bottom-0 left-0 right-0 h-px bg-cyan-400" />
              )}
            </button>
          );
        })}
      </motion.div>

      {/* List */}
      <div className="space-y-0">
        {items.length > 0 ? (
          <div className="border border-white/[0.06] rounded-xl overflow-hidden divide-y divide-white/[0.04]">
            <AnimatePresence>
              {items.map((req, i) => {
                // Determine display name/avatar based on perspective
                const isSender = req.senderId === currentUser?.uid;
                const displayName = activeTab === 'Sent'
                  ? (req.receiverName || 'User')
                  : (req.senderName || 'User');
                const displayAvatar = activeTab === 'Sent'
                  ? (req.receiverAvatar || null)
                  : (req.senderAvatar || null);

                return (
                  <motion.div key={req.id}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, height: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="flex items-center gap-4 px-5 py-4 hover:bg-white/[0.02] transition-colors">
                    <Avatar avatarId={displayAvatar} size={32}
                      className="rounded-full bg-zinc-800 border border-white/[0.08] shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-medium text-zinc-200 truncate">{displayName}</p>
                      <p className="text-[11px] text-zinc-600 truncate mt-0.5">
                        {activeTab === 'Sent' ? 'You requested' : 'Requesting'}{' '}
                        <span className="text-cyan-400/80">{req.skillTitle || 'Skill Exchange'}</span>
                      </p>
                    </div>
                    <span className="text-[11px] text-zinc-600 hidden sm:block shrink-0">
                      {formatTime(req.createdAt)}
                    </span>

                    {activeTab === 'Pending' ? (
                      <div className="flex items-center gap-2 shrink-0">
                        <button onClick={() => handleAction(req, 'accept')} disabled={!!loading[req.id]}
                          className="text-[12px] font-medium text-emerald-400 hover:text-emerald-300 disabled:opacity-40 transition-colors px-2 py-1">
                          {loading[req.id] === 'accept' ? <Loader2 size={12} className="animate-spin" /> : 'Accept'}
                        </button>
                        <button onClick={() => handleAction(req, 'reject')} disabled={!!loading[req.id]}
                          className="text-[12px] font-medium text-zinc-600 hover:text-zinc-400 disabled:opacity-40 transition-colors px-2 py-1">
                          {loading[req.id] === 'reject' ? <Loader2 size={12} className="animate-spin" /> : 'Decline'}
                        </button>
                      </div>
                    ) : activeTab === 'Accepted' ? (
                      <div className="flex items-center gap-2 shrink-0">
                        <button onClick={() => handleOpenChat(req)} disabled={startingChat === req.id}
                          className="flex items-center gap-1.5 text-[11px] font-medium text-cyan-400 border border-cyan-400/20 hover:border-cyan-400/40 px-3 py-1.5 rounded-lg bg-cyan-400/[0.06] hover:bg-cyan-400/[0.12] disabled:opacity-50 transition-all shrink-0">
                          {startingChat === req.id
                            ? <span className="w-3 h-3 border border-cyan-400 border-t-transparent rounded-full animate-spin" />
                            : <MessageSquare size={11} />}
                          Message
                        </button>
                        <button
                          onClick={() => {
                            const peerId = req.senderId === currentUser?.uid ? req.receiverId : req.senderId;
                            const peerName = req.senderId === currentUser?.uid ? req.receiverName : req.senderName;
                            const peerAvatar = req.senderId === currentUser?.uid ? req.receiverAvatar : req.senderAvatar;
                            setContractPartner({ uid: peerId, name: peerName, avatar: peerAvatar });
                            setShowCreateContract(true);
                          }}
                          title="Propose an exchange contract"
                          className="flex items-center gap-1.5 text-[11px] font-medium text-violet-400 border border-violet-400/20 hover:border-violet-400/40 px-3 py-1.5 rounded-lg bg-violet-400/[0.06] hover:bg-violet-400/[0.12] transition-all shrink-0"
                        >
                          <FileText size={11} />
                          Contract
                        </button>
                      </div>
                    ) : (
                      <span className={`text-[11px] font-medium px-2.5 py-1 rounded-full shrink-0 ${
                        req.status === 'accepted' ? 'bg-emerald-500/10 text-emerald-400'
                        : req.status === 'rejected' ? 'bg-red-500/10 text-red-400'
                        : 'bg-zinc-800 text-zinc-500'}`}>
                        {req.status === 'accepted' ? 'Accepted' : req.status === 'rejected' ? 'Declined' : 'Pending'}
                      </span>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        ) : (
          <motion.div {...fadeUp(2)} className="py-20 text-center text-zinc-700 border border-white/[0.05] rounded-xl">
            <p className="text-sm">No {activeTab.toLowerCase()} requests.</p>
          </motion.div>
        )}
      </div>

      {/* Create Contract Modal */}
      <CreateContractModal
        isOpen={showCreateContract}
        onClose={() => { setShowCreateContract(false); setContractPartner(null); }}
        onSuccess={() => navigate('/contracts')}
        partner={contractPartner}
        showToast={showToast}
      />

      <Toast toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
};

export default Requests;
