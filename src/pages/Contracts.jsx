import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Plus,
  Loader2,
  CheckCircle2,
  Clock,
  XCircle,
  Zap,
  Search,
  SearchX,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import useContracts from '../hooks/useContracts';
import useToast from '../hooks/useToast';
import Toast from '../components/Toast';
import ContractCard from '../components/ContractCard';
import CreateContractModal from '../components/CreateContractModal';
import { acceptContract, rejectContract, cancelContract } from '../firebase/contractService';
import { subscribeToAcceptedRequests } from '../firebase/requestService';

const TABS = [
  { key: 'active',    label: 'Active',    icon: Zap,           color: 'text-emerald-400' },
  { key: 'pending',   label: 'Pending',   icon: Clock,         color: 'text-amber-400'   },
  { key: 'completed', label: 'Completed', icon: CheckCircle2,  color: 'text-cyan-400'    },
  { key: 'cancelled', label: 'Cancelled', icon: XCircle,       color: 'text-zinc-500'    },
];

const fadeUp = (i = 0) => ({
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35, delay: i * 0.05 },
});

const Contracts = () => {
  const { currentUser, userProfile } = useAuth();
  const navigate = useNavigate();
  const { contracts, loading } = useContracts();
  const { toasts, showToast, dismissToast } = useToast();

  const [activeTab, setActiveTab] = useState('active');
  const [actionLoading, setActionLoading] = useState({});
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [preSelectedPartner, setPreSelectedPartner] = useState(null);
  const [acceptedConnections, setAcceptedConnections] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Load accepted connections for partner selection
  useEffect(() => {
    if (!currentUser?.uid) return;
    const unsub = subscribeToAcceptedRequests(currentUser.uid, (reqs) => {
      setAcceptedConnections(reqs);
    });
    return () => unsub();
  }, [currentUser?.uid]);

  // Filter contracts by active tab and search
  const q = searchQuery.toLowerCase();
  const filtered = contracts.filter((c) => {
    if (c.status !== activeTab) return false;
    if (!q) return true;
    const peerName = c.requesterId === currentUser?.uid ? c.partnerName : c.requesterName;
    return (
      peerName?.toLowerCase().includes(q) ||
      c.requesterSkillOffered?.toLowerCase().includes(q) ||
      c.partnerSkillOffered?.toLowerCase().includes(q)
    );
  });

  const tabCount = (key) => contracts.filter((c) => c.status === key).length;

  // ── Action handlers ────────────────────────────────────────────────────────

  const withLoading = async (contractId, key, fn) => {
    setActionLoading((p) => ({ ...p, [`${contractId}_${key}`]: true }));
    try {
      await fn();
    } catch (err) {
      console.error(`[Contracts] ${key} failed:`, err);
      showToast('error', 'Something went wrong. Please try again.');
    } finally {
      setActionLoading((p) => { const n = { ...p }; delete n[`${contractId}_${key}`]; return n; });
    }
  };

  const handleAccept = (contract) => withLoading(contract.id, 'accept', async () => {
    await acceptContract(contract.id, {
      requesterId: contract.requesterId,
      partnerName: userProfile?.displayName || userProfile?.name || 'Partner',
      partnerAvatar: userProfile?.avatar || null,
    });
    showToast('success', 'Exchange contract is now active!');
    console.log('[Contracts] Contract accepted:', contract.id);
    setActiveTab('active');
  });

  const handleReject = (contract) => withLoading(contract.id, 'reject', async () => {
    await rejectContract(contract.id);
    showToast('info', 'Contract declined.');
    console.log('[Contracts] Contract rejected:', contract.id);
  });

  const handleCancel = (contract) => withLoading(contract.id, 'cancel', async () => {
    await cancelContract(contract.id);
    showToast('info', 'Contract cancelled.');
    console.log('[Contracts] Contract cancelled:', contract.id);
  });

  // Build partner object from accepted request
  const handleOpenCreateModal = () => {
    if (acceptedConnections.length === 0) {
      showToast('info', 'Accept a skill exchange request first to create a contract.');
      return;
    }
    // Default to first connection; user can use the Requests page to pick specific partner
    const req = acceptedConnections[0];
    const peerId = req.senderId === currentUser?.uid ? req.receiverId : req.senderId;
    const peerName = req.senderId === currentUser?.uid ? req.receiverName : req.senderName;
    const peerAvatar = req.senderId === currentUser?.uid ? req.receiverAvatar : req.senderAvatar;
    setPreSelectedPartner({ uid: peerId, name: peerName, avatar: peerAvatar });
    setShowCreateModal(true);
  };

  return (
    <div className="page-container">
      {/* Header */}
      <motion.div className="header-spacing" {...fadeUp(0)}>
        <p className="section-label mb-4">Peer-learning agreements</p>
        <h1 className="page-title mb-3">
          Exchange{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-violet-400">
            Contracts
          </span>
        </h1>
        <p className="page-description mb-6">
          Formalise your skill exchanges with structured session plans and progress tracking.
        </p>

        {/* Header actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleOpenCreateModal}
            className="btn-primary flex items-center gap-2 text-[13px]"
          >
            <Plus size={14} />
            New Contract
          </button>

          {/* Search */}
          <div className="relative group">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-cyan-400 transition-colors" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search contracts…"
              className="pl-9 pr-4 py-2 bg-white/[0.04] border border-white/[0.07] rounded-xl focus:outline-none focus:border-cyan-400/30 text-[13px] text-zinc-300 placeholder:text-zinc-600 w-48"
            />
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div className="flex overflow-x-auto gap-1 mb-8 border-b border-white/[0.06] scrollbar-none pb-px" {...fadeUp(1)}>
        {TABS.map(({ key, label, icon: Icon, color }) => {
          const count = tabCount(key);
          return (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`relative flex items-center gap-1.5 px-4 py-2.5 text-[13px] font-medium transition-colors whitespace-nowrap ${
                activeTab === key ? 'text-white' : 'text-zinc-600 hover:text-zinc-300'
              }`}
            >
              <Icon size={12} className={activeTab === key ? color : 'text-zinc-700'} />
              {label}
              {count > 0 && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/[0.06] text-zinc-500">
                  {count}
                </span>
              )}
              {activeTab === key && (
                <motion.div layoutId="contracts-tab-underline" className="absolute bottom-0 left-0 right-0 h-px bg-cyan-400" />
              )}
            </button>
          );
        })}
      </motion.div>

      {/* Content */}
      {loading ? (
        <div className="py-20 flex justify-center">
          <Loader2 size={22} className="text-cyan-400 animate-spin" />
        </div>
      ) : filtered.length > 0 ? (
        <AnimatePresence mode="popLayout">
          <div className="space-y-4">
            {filtered.map((contract, i) => (
              <ContractCard
                key={contract.id}
                contract={contract}
                currentUserId={currentUser?.uid}
                delay={i * 0.05}
                loading={{
                  accept: !!actionLoading[`${contract.id}_accept`],
                  reject: !!actionLoading[`${contract.id}_reject`],
                  cancel: !!actionLoading[`${contract.id}_cancel`],
                }}
                onAccept={() => handleAccept(contract)}
                onReject={() => handleReject(contract)}
                onCancel={() => handleCancel(contract)}
              />
            ))}
          </div>
        </AnimatePresence>
      ) : (
        <motion.div {...fadeUp(2)} className="py-20 text-center border border-white/[0.05] rounded-xl">
          {searchQuery ? (
            <>
              <SearchX size={28} className="mx-auto mb-3 text-zinc-700" />
              <p className="text-sm text-zinc-600">No {activeTab} contracts match "{searchQuery}"</p>
            </>
          ) : (
            <>
              <FileText size={28} className="mx-auto mb-3 text-zinc-700" />
              <p className="text-sm text-zinc-500 mb-1">No {activeTab} contracts yet.</p>
              {activeTab === 'active' && (
                <p className="text-[12px] text-zinc-700">
                  Accept a pending contract to start tracking sessions.
                </p>
              )}
              {activeTab === 'pending' && (
                <button
                  onClick={handleOpenCreateModal}
                  className="mt-3 text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  Propose your first contract →
                </button>
              )}
            </>
          )}
        </motion.div>
      )}

      {/* Modals */}
      <CreateContractModal
        isOpen={showCreateModal}
        onClose={() => { setShowCreateModal(false); setPreSelectedPartner(null); }}
        onSuccess={(id) => { setActiveTab('pending'); navigate('/contracts'); }}
        partner={preSelectedPartner}
        showToast={showToast}
      />

      <Toast toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
};

export default Contracts;
