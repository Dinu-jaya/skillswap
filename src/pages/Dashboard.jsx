import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp,
  Users,
  ArrowLeftRight,
  Star,
  Code2,
  Palette,
  Megaphone,
  Database,
  Music,
  Globe,
  Camera,
  BookOpen,
  Search,
  SearchX,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { subscribeToTrendingSkills } from '../firebase/skillService';
import { subscribeToIncomingRequests, subscribeToAcceptedRequests, acceptRequest, rejectRequest } from '../firebase/requestService';
import { getAllUsersExcept } from '../firebase/userService';
import { subscribeToActiveContracts } from '../firebase/contractService';
import StatCard from '../components/StatCard';
import TrendingSkillCard from '../components/TrendingSkillCard';
import RequestCard from '../components/RequestCard';
import ActivityTimeline from '../components/ActivityTimeline';
import RecommendedUserCard from '../components/RecommendedUserCard';
import ContractCard from '../components/ContractCard';
import XPWidget from '../components/XPWidget';
import { useNotifications } from '../context/NotificationContext';

// ── Icon map for skill categories ─────────────────────────────────────────────
const CATEGORY_ICONS = {
  Engineering: Code2,
  Design: Palette,
  Marketing: Megaphone,
  'Data Science': Database,
  Creative: Music,
  Web: Globe,
  Photography: Camera,
  Writing: BookOpen,
};

const getGreeting = () => {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return 'Good Morning';
  if (h >= 12 && h < 17) return 'Good Afternoon';
  if (h >= 17 && h < 22) return 'Good Evening';
  return 'Good Night';
};

const fadeUp = (i = 0) => ({
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45, delay: i * 0.07, ease: [0.25, 0.46, 0.45, 0.94] },
});

const Dashboard = () => {
  const { currentUser, userProfile } = useAuth();
  const { notifications } = useNotifications();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  // ── Real Firestore data ────────────────────────────────────────────────────
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [acceptedRequests, setAcceptedRequests] = useState([]);
  const [trendingSkills, setTrendingSkills] = useState([]);
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [activeContracts, setActiveContracts] = useState([]);

  // Incoming pending requests
  useEffect(() => {
    if (!currentUser?.uid) return;
    const unsub = subscribeToIncomingRequests(currentUser.uid, setIncomingRequests);
    return () => unsub();
  }, [currentUser?.uid]);

  // Accepted requests (for Completed Exchanges + Connections count)
  useEffect(() => {
    if (!currentUser?.uid) return;
    const unsub = subscribeToAcceptedRequests(currentUser.uid, setAcceptedRequests);
    return () => unsub();
  }, [currentUser?.uid]);

  // Trending skills
  useEffect(() => {
    const unsub = subscribeToTrendingSkills(setTrendingSkills);
    return () => unsub();
  }, []);

  // Suggested users (all users except self)
  useEffect(() => {
    if (!currentUser?.uid) return;
    getAllUsersExcept(currentUser.uid)
      .then((users) => setSuggestedUsers(users.slice(0, 4)))
      .finally(() => setLoadingUsers(false));
  }, [currentUser?.uid]);

  // Active contracts
  useEffect(() => {
    if (!currentUser?.uid) return;
    const unsub = subscribeToActiveContracts(currentUser.uid, setActiveContracts);
    return () => unsub();
  }, [currentUser?.uid]);

  // ── Computed stats ─────────────────────────────────────────────────────────
  const skillsOfferedCount = userProfile?.skillsOffered?.length ?? 0;
  const activeRequestsCount = incomingRequests.length;
  const completedExchanges = acceptedRequests.length;
  const uniquePeers = new Set(
    acceptedRequests.map((r) =>
      r.senderId === currentUser?.uid ? r.receiverId : r.senderId
    )
  );
  const connectionsCount = uniquePeers.size;

  const stats = [
    {
      label: 'Skills Offered',
      value: String(skillsOfferedCount),
      icon: Star,
      colorClass: 'text-amber-400',
      bgClass: 'bg-amber-400/[0.08]',
    },
    {
      label: 'Active Requests',
      value: String(activeRequestsCount),
      icon: ArrowLeftRight,
      colorClass: 'text-cyan-400',
      bgClass: 'bg-cyan-400/[0.08]',
    },
    {
      label: 'Completed Exchanges',
      value: String(completedExchanges),
      icon: TrendingUp,
      colorClass: 'text-violet-400',
      bgClass: 'bg-violet-400/[0.08]',
    },
    {
      label: 'Connections',
      value: String(connectionsCount),
      icon: Users,
      colorClass: 'text-emerald-400',
      bgClass: 'bg-emerald-400/[0.08]',
    },
  ];

  // ── Activity timeline derived from notifications ───────────────────────────
  const recentActivity = notifications.slice(0, 4).map((n) => {
    const typeMap = { request: 'connect', accept: 'exchange', message: 'connect', connect: 'connect' };
    return {
      action: n.name,
      target: n.message,
      time: n.createdAt
        ? new Date(n.createdAt.toMillis()).toLocaleDateString()
        : 'recently',
      type: typeMap[n.type] || 'connect',
    };
  });

  // ── Request handlers ───────────────────────────────────────────────────────
  const handleAccept = async (requestId) => {
    const req = incomingRequests.find((r) => r.id === requestId);
    if (!req || !currentUser) return;
    try {
      await acceptRequest(requestId, currentUser, req);
    } catch (err) {
      console.error('Failed to accept request:', err);
    }
  };

  const handleReject = async (requestId) => {
    try {
      await rejectRequest(requestId);
    } catch (err) {
      console.error('Failed to reject request:', err);
    }
  };

  // ── Search filtering ───────────────────────────────────────────────────────
  const q = searchQuery.toLowerCase();

  const filteredSkills = trendingSkills.filter(
    (s) =>
      s.title?.toLowerCase().includes(q) ||
      s.category?.toLowerCase().includes(q)
  );

  const filteredRequests = incomingRequests.filter(
    (r) =>
      r.senderName?.toLowerCase().includes(q) ||
      r.skillTitle?.toLowerCase().includes(q)
  );

  const filteredUsers = suggestedUsers.filter(
    (u) =>
      (u.displayName || u.name || '').toLowerCase().includes(q) ||
      (u.bio || '').toLowerCase().includes(q)
  );

  // Normalise requests for RequestCard (expects .user, .skill, .time, .status)
  const normaliseRequest = (r) => ({
    id: r.id,
    user: r.senderName || 'Unknown',
    skill: r.skillTitle || 'Skill Exchange',
    avatar: r.senderAvatar || null,
    time: r.createdAt
      ? new Date(r.createdAt.toMillis()).toLocaleDateString()
      : '',
    status: 'Pending',
  });

  // Normalise users for RecommendedUserCard (expects .name, .role, .mutualSkills, .avatar)
  const normaliseUser = (u) => ({
    uid: u.uid || u.id,
    name: u.displayName || u.name || 'Unknown',
    role: u.bio || 'SkillSwap Member',
    avatar: u.avatar || null,
    mutualSkills: (u.skillsOffered || []).slice(0, 2),
  });

  const displayName =
    userProfile?.displayName ||
    userProfile?.name ||
    currentUser?.displayName ||
    currentUser?.email?.split('@')[0] ||
    'Explorer';

  return (
    <div className="page-container">

      {/* ── Hero ───────────────────────────────────────────── */}
      <motion.section className="section-spacing" {...fadeUp(0)}>
        <p className="section-label mb-4">Your workspace</p>
        <h1 className="page-title mb-4">
          {getGreeting()},<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-cyan-400 to-violet-400">
            {displayName}.
          </span>
        </h1>
        <p className="page-description mb-7">
          You have{' '}
          <span className="text-zinc-300 font-medium">
            {activeRequestsCount} pending exchange{activeRequestsCount !== 1 ? 's' : ''}
          </span>{' '}
          and{' '}
          <span className="text-zinc-300 font-medium">
            {skillsOfferedCount} skill{skillsOfferedCount !== 1 ? 's' : ''}
          </span>{' '}
          ready to share.
        </p>

        {/* Search */}
        <div className="relative max-w-xs group">
          <Search
            size={14}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-cyan-400 transition-colors"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search skills, people, requests…"
            className="w-full pl-9 pr-4 py-2.5 bg-white/[0.04] border border-white/[0.07] rounded-xl focus:outline-none focus:border-cyan-400/30 focus:bg-white/[0.05] transition-all text-[13px] text-zinc-300 placeholder:text-zinc-600"
          />
        </div>
      </motion.section>

      {/* ── Stats grid ─────────────────────────────────────── */}
      <motion.section className="section-spacing" {...fadeUp(1)}>
        <p className="section-label mb-4">Overview</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-white/[0.05] rounded-xl overflow-hidden border border-white/[0.05]">
          {stats.map((stat, i) => (
            <StatCard key={i} {...stat} />
          ))}
        </div>
      </motion.section>

      {/* ── Active Contracts ────────────────────────────────── */}
      {activeContracts.length > 0 && (
        <motion.section className="section-spacing" {...fadeUp(2)}>
          <div className="flex items-baseline justify-between mb-5">
            <div>
              <p className="section-label mb-1">In progress</p>
              <h2 className="section-title">Active Contracts</h2>
            </div>
            <button
              onClick={() => navigate('/contracts')}
              className="text-[11px] text-zinc-600 hover:text-cyan-400 transition-colors flex items-center gap-0.5"
            >
              View all <ChevronRight size={11} />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeContracts.slice(0, 4).map((contract, i) => (
              <ContractCard
                key={contract.id}
                contract={contract}
                currentUserId={currentUser?.uid}
                delay={i * 0.06}
                compact={true}
                loading={{}}
                onAccept={() => {}}
                onReject={() => {}}
                onCancel={() => {}}
              />
            ))}
          </div>
        </motion.section>
      )}

      {/* ── Main layout: 8 + 4 ─────────────────────────────── */}
      <div className="layout-grid">

        {/* Left: Trending + Requests (8 cols) */}
        <div className="lg:col-span-8 space-y-16">

          {/* Trending Skills */}
          <motion.section {...fadeUp(2)}>
            <div className="flex items-baseline justify-between mb-5">
              <div>
                <p className="section-label mb-1">What's growing</p>
                <h2 className="section-title">Trending Skills</h2>
              </div>
              <button
                onClick={() => navigate('/browse')}
                className="text-[11px] text-zinc-600 hover:text-cyan-400 transition-colors flex items-center gap-0.5"
              >
                View all <ChevronRight size={11} />
              </button>
            </div>

            {filteredSkills.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {filteredSkills.map((skill, i) => {
                  // Attach a matching icon from category
                  const IconComponent = CATEGORY_ICONS[skill.category] || Code2;
                  return (
                    <TrendingSkillCard
                      key={skill.id}
                      skill={{ ...skill, name: skill.title, icon: IconComponent, requests: skill.requestsCount }}
                      delay={i * 0.06}
                    />
                  );
                })}
              </div>
            ) : trendingSkills.length === 0 ? (
              <div className="py-14 text-center border border-white/[0.05] rounded-xl">
                <p className="text-sm text-zinc-600">No skills added yet.</p>
                <button
                  onClick={() => navigate('/browse')}
                  className="mt-2 text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  Add the first skill →
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-14 text-zinc-700">
                <SearchX className="w-7 h-7 mb-2 opacity-50" />
                <p className="text-sm">No skills match "{searchQuery}"</p>
              </div>
            )}
          </motion.section>

          {/* Exchange Requests */}
          <motion.section {...fadeUp(3)}>
            <div className="flex items-baseline justify-between mb-5">
              <div>
                <p className="section-label mb-1">Awaiting you</p>
                <h2 className="section-title">Exchange Requests</h2>
              </div>
              <button
                onClick={() => navigate('/requests')}
                className="text-[11px] text-zinc-600 hover:text-cyan-400 transition-colors flex items-center gap-0.5"
              >
                All requests <ChevronRight size={11} />
              </button>
            </div>

            {filteredRequests.length > 0 ? (
              <div className="border border-white/[0.06] rounded-xl overflow-hidden divide-y divide-white/[0.04]">
                <AnimatePresence>
                  {filteredRequests.map((req, i) => (
                    <RequestCard
                      key={req.id}
                      request={normaliseRequest(req)}
                      delay={i * 0.05}
                      onAccept={() => handleAccept(req.id)}
                      onReject={() => handleReject(req.id)}
                    />
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              <div className="py-12 text-center text-zinc-700 text-sm border border-white/[0.05] rounded-xl">
                {searchQuery
                  ? `No requests match "${searchQuery}"`
                  : 'No active requests right now.'}
              </div>
            )}
          </motion.section>
        </div>

        {/* Right: XP + People + Activity (4 cols) */}
        <div className="lg:col-span-4 space-y-14">

          {/* XP Progression Widget */}
          <motion.section {...fadeUp(3)}>
            <p className="section-label mb-4">Your progression</p>
            <XPWidget />
          </motion.section>

          {/* Recommended People */}
          <motion.section {...fadeUp(4)}>
            <div className="flex items-baseline justify-between mb-5">
              <div>
                <p className="section-label mb-1">Suggested for you</p>
                <h2 className="section-title">People</h2>
              </div>
              <button
                onClick={() => navigate('/browse')}
                className="text-[11px] text-zinc-600 hover:text-cyan-400 transition-colors flex items-center gap-0.5"
              >
                Browse <ChevronRight size={11} />
              </button>
            </div>

            {loadingUsers ? (
              <div className="py-10 flex justify-center">
                <div className="w-5 h-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : filteredUsers.length > 0 ? (
              <div className="space-y-0.5">
                {filteredUsers.map((user, i) => (
                  <RecommendedUserCard
                    key={user.uid || user.id}
                    user={normaliseUser(user)}
                    delay={i * 0.06}
                  />
                ))}
              </div>
            ) : (
              <div className="py-10 text-center text-zinc-700 text-sm">
                {searchQuery ? `No people match "${searchQuery}"` : 'No other users yet.'}
              </div>
            )}
          </motion.section>

          {/* Activity Timeline */}
          <motion.section {...fadeUp(5)}>
            <p className="section-label mb-1">Recent activity</p>
            <h2 className="section-title mb-6">Timeline</h2>
            {recentActivity.length > 0 ? (
              <ActivityTimeline activities={recentActivity} />
            ) : (
              <p className="text-sm text-zinc-700">No activity yet.</p>
            )}
          </motion.section>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
