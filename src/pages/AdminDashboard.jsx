import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  Users,
  Flag,
  LifeBuoy,
  Ban,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Send,
  X,
  ChevronDown,
  RefreshCw,
  Clock,
  Eye,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Avatar from '../components/Avatar';
import {
  subscribeToUsers,
  subscribeToReports,
  subscribeToIssues,
  banUser,
  unbanUser,
  sendWarning,
  updateReportStatus,
  updateIssueStatus,
} from '../firebase/moderationService';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatTime = (ts) => {
  if (!ts?.toDate) return '—';
  const d = ts.toDate();
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const StatusBadge = ({ status }) => {
  const styles = {
    pending:    'bg-amber-400/10 text-amber-400 border-amber-400/20',
    resolved:   'bg-emerald-400/10 text-emerald-400 border-emerald-400/20',
    dismissed:  'bg-zinc-700/30 text-zinc-500 border-zinc-700/30',
    open:       'bg-cyan-400/10 text-cyan-400 border-cyan-400/20',
    closed:     'bg-zinc-700/30 text-zinc-500 border-zinc-700/30',
  };
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border ${styles[status] || styles.pending}`}>
      {status}
    </span>
  );
};

// ─── Warning Modal ─────────────────────────────────────────────────────────────
const WarnModal = ({ user, onClose, onSend }) => {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!message.trim()) return;
    setSending(true);
    await onSend(user.uid || user.id, message.trim());
    setSending(false);
    onClose();
  };

  const name = user?.displayName || user?.name || user?.email || 'User';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[90] bg-black/75 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.18 }}
        className="w-full max-w-md bg-[#111113] border border-white/[0.08] rounded-2xl p-6 shadow-2xl"
      >
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <AlertTriangle size={14} className="text-amber-400" />
            </div>
            <div>
              <p className="text-[14px] font-semibold text-white">Send Warning</p>
              <p className="text-[11px] text-zinc-600">To: {name}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-zinc-600 hover:text-zinc-300 transition-colors">
            <X size={16} />
          </button>
        </div>

        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
          autoFocus
          placeholder="Write the warning message…"
          className="w-full text-[13px] px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-zinc-300 placeholder:text-zinc-700 focus:outline-none focus:border-amber-400/30 transition-all resize-none mb-4"
        />

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 bg-white/[0.03] border border-white/[0.08] text-zinc-400 text-[13px] font-medium rounded-xl hover:bg-white/[0.06] transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            disabled={sending || !message.trim()}
            className="flex-1 py-2.5 bg-amber-500/90 hover:bg-amber-500 disabled:opacity-40 text-white text-[13px] font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
          >
            {sending ? (
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send size={13} />
            )}
            {sending ? 'Sending…' : 'Send Warning'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ─── Stat Card ─────────────────────────────────────────────────────────────────
const AdminStatCard = ({ icon: Icon, label, value, accent }) => (
  <div className="glass-card p-5 flex items-center gap-4">
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${accent}`}>
      <Icon size={16} />
    </div>
    <div>
      <p className="text-2xl font-semibold text-white" style={{ fontFamily: "'DM Sans', sans-serif" }}>{value}</p>
      <p className="text-[11px] text-zinc-600 font-medium uppercase tracking-wider">{label}</p>
    </div>
  </div>
);

// ─── Users Tab ────────────────────────────────────────────────────────────────
const UsersTab = ({ users, onBan, onUnban, onWarn }) => {
  const [search, setSearch] = useState('');
  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    return (
      (u.name || '').toLowerCase().includes(q) ||
      (u.displayName || '').toLowerCase().includes(q) ||
      (u.email || '').toLowerCase().includes(q)
    );
  });

  return (
    <div>
      {/* Search */}
      <div className="mb-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email…"
          className="w-full text-[13px] px-4 py-2.5 bg-white/[0.03] border border-white/[0.08] rounded-xl text-zinc-300 placeholder:text-zinc-700 focus:outline-none focus:border-cyan-400/30 transition-all max-w-sm"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-white/[0.06]">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b border-white/[0.06]">
              {['User', 'Email', 'Warnings', 'Status', 'Actions'].map((h) => (
                <th key={h} className="text-left text-[10px] font-bold text-zinc-600 uppercase tracking-widest px-4 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center text-zinc-700 py-10 text-[13px]">No users found.</td>
              </tr>
            )}
            {filtered.map((user) => {
              const name = user.displayName || user.name || '—';
              return (
                <tr key={user.id} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                  {/* User */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <Avatar avatarId={user.avatar} size={28} className="rounded-lg shrink-0" />
                      <div>
                        <p className="text-zinc-200 font-medium">{name}</p>
                        {user.isAdmin && (
                          <span className="text-[9px] font-bold text-cyan-400 uppercase tracking-wider">Admin</span>
                        )}
                      </div>
                    </div>
                  </td>
                  {/* Email */}
                  <td className="px-4 py-3 text-zinc-500 max-w-[160px] truncate">{user.email || '—'}</td>
                  {/* Warnings */}
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-[11px] font-bold ${
                      (user.warningCount || 0) > 0
                        ? 'bg-amber-400/10 text-amber-400'
                        : 'bg-white/[0.04] text-zinc-600'
                    }`}>
                      {user.warningCount || 0}
                    </span>
                  </td>
                  {/* Status */}
                  <td className="px-4 py-3">
                    {user.isBanned ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border bg-red-500/10 text-red-400 border-red-500/20">
                        <Ban size={9} /> Banned
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border bg-emerald-400/10 text-emerald-400 border-emerald-400/20">
                        <CheckCircle size={9} /> Active
                      </span>
                    )}
                  </td>
                  {/* Actions */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {!user.isAdmin && (
                        <>
                          <button
                            onClick={() => user.isBanned ? onUnban(user) : onBan(user)}
                            className={`text-[11px] font-medium px-3 py-1 rounded-lg border transition-all ${
                              user.isBanned
                                ? 'bg-emerald-400/10 border-emerald-400/20 text-emerald-400 hover:bg-emerald-400/20'
                                : 'bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20'
                            }`}
                          >
                            {user.isBanned ? 'Unban' : 'Ban'}
                          </button>
                          <button
                            onClick={() => onWarn(user)}
                            className="text-[11px] font-medium px-3 py-1 rounded-lg border bg-amber-400/10 border-amber-400/20 text-amber-400 hover:bg-amber-400/20 transition-all"
                          >
                            Warn
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ─── Reports Tab ──────────────────────────────────────────────────────────────
const ReportsTab = ({ reports, users, onUpdateStatus }) => {
  const getUserName = (uid) => {
    const u = users.find((x) => x.uid === uid || x.id === uid);
    return u?.displayName || u?.name || u?.email || uid?.slice(0, 8) + '…';
  };

  const [filter, setFilter] = useState('all');
  const filtered = filter === 'all' ? reports : reports.filter((r) => r.status === filter);

  return (
    <div>
      {/* Filter */}
      <div className="flex gap-2 mb-5">
        {['all', 'pending', 'resolved', 'dismissed'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`text-[11px] font-semibold uppercase tracking-wider px-3 py-1.5 rounded-lg border transition-all capitalize ${
              filter === f
                ? 'bg-cyan-400/10 border-cyan-400/20 text-cyan-400'
                : 'bg-white/[0.03] border-white/[0.06] text-zinc-600 hover:text-zinc-400'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Cards */}
      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="text-center text-zinc-700 py-12 text-[13px]">No reports found.</div>
        )}
        {filtered.map((report) => (
          <div key={report.id} className="glass-card p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <StatusBadge status={report.status} />
                  <span className="text-[11px] text-zinc-600 flex items-center gap-1">
                    <Clock size={10} /> {formatTime(report.createdAt)}
                  </span>
                </div>
                <p className="text-[13px] text-white font-medium mb-0.5">{report.reason}</p>
                <p className="text-[12px] text-zinc-500 mb-2 line-clamp-2">{report.description}</p>
                <div className="flex gap-4 text-[11px] text-zinc-600">
                  <span>Reporter: <span className="text-zinc-400">{getUserName(report.reporterId)}</span></span>
                  <span>Reported: <span className="text-zinc-400">{getUserName(report.reportedUserId)}</span></span>
                </div>
              </div>
              {report.status === 'pending' && (
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => onUpdateStatus(report.id, 'resolved')}
                    className="flex items-center gap-1.5 text-[11px] font-medium px-3 py-1.5 rounded-lg border bg-emerald-400/10 border-emerald-400/20 text-emerald-400 hover:bg-emerald-400/20 transition-all"
                  >
                    <CheckCircle size={11} /> Resolve
                  </button>
                  <button
                    onClick={() => onUpdateStatus(report.id, 'dismissed')}
                    className="flex items-center gap-1.5 text-[11px] font-medium px-3 py-1.5 rounded-lg border bg-white/[0.03] border-white/[0.06] text-zinc-500 hover:text-zinc-300 transition-all"
                  >
                    <XCircle size={11} /> Dismiss
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Issues Tab ───────────────────────────────────────────────────────────────
const IssuesTab = ({ issues, users, onUpdateStatus }) => {
  const getUserName = (uid) => {
    const u = users.find((x) => x.uid === uid || x.id === uid);
    return u?.displayName || u?.name || u?.email || uid?.slice(0, 8) + '…';
  };

  const [filter, setFilter] = useState('all');
  const filtered = filter === 'all' ? issues : issues.filter((i) => i.status === filter);

  return (
    <div>
      {/* Filter */}
      <div className="flex gap-2 mb-5">
        {['all', 'open', 'closed'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`text-[11px] font-semibold uppercase tracking-wider px-3 py-1.5 rounded-lg border transition-all capitalize ${
              filter === f
                ? 'bg-violet-400/10 border-violet-400/20 text-violet-400'
                : 'bg-white/[0.03] border-white/[0.06] text-zinc-600 hover:text-zinc-400'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Cards */}
      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="text-center text-zinc-700 py-12 text-[13px]">No issues found.</div>
        )}
        {filtered.map((issue) => (
          <div key={issue.id} className="glass-card p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <StatusBadge status={issue.status} />
                  <span className="text-[11px] text-zinc-600 flex items-center gap-1">
                    <Clock size={10} /> {formatTime(issue.createdAt)}
                  </span>
                </div>
                <p className="text-[13px] text-white font-medium mb-0.5">{issue.subject}</p>
                <p className="text-[12px] text-zinc-500 mb-2 line-clamp-2">{issue.description}</p>
                <span className="text-[11px] text-zinc-600">
                  From: <span className="text-zinc-400">{getUserName(issue.userId)}</span>
                </span>
              </div>
              {issue.status === 'open' && (
                <button
                  onClick={() => onUpdateStatus(issue.id, 'closed')}
                  className="flex items-center gap-1.5 text-[11px] font-medium px-3 py-1.5 rounded-lg border bg-violet-400/10 border-violet-400/20 text-violet-400 hover:bg-violet-400/20 transition-all shrink-0"
                >
                  <CheckCircle size={11} /> Close
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Main AdminDashboard ───────────────────────────────────────────────────────
const AdminDashboard = () => {
  const { currentUser } = useAuth();

  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState([]);
  const [issues, setIssues] = useState([]);
  const [warnTarget, setWarnTarget] = useState(null);
  const [actionLoading, setActionLoading] = useState('');
  const [toast, setToast] = useState('');

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  // Real-time subscriptions
  useEffect(() => {
    const unsub1 = subscribeToUsers(setUsers);
    const unsub2 = subscribeToReports(setReports);
    const unsub3 = subscribeToIssues(setIssues);
    return () => { unsub1(); unsub2(); unsub3(); };
  }, []);

  // ── Actions ──────────────────────────────────────────────────────────────────
  const handleBan = async (user) => {
    const name = user.displayName || user.name || 'user';
    setActionLoading(user.id + '_ban');
    try {
      await banUser(user.uid || user.id);
      showToast(`${name} has been banned.`);
    } catch (err) {
      console.error(err);
      showToast('Failed to ban user.');
    } finally {
      setActionLoading('');
    }
  };

  const handleUnban = async (user) => {
    const name = user.displayName || user.name || 'user';
    setActionLoading(user.id + '_unban');
    try {
      await unbanUser(user.uid || user.id);
      showToast(`${name} has been unbanned.`);
    } catch (err) {
      console.error(err);
      showToast('Failed to unban user.');
    } finally {
      setActionLoading('');
    }
  };

  const handleSendWarning = async (uid, message) => {
    try {
      await sendWarning(uid, message);
      showToast('Warning sent successfully.');
    } catch (err) {
      console.error(err);
      showToast('Failed to send warning.');
    }
  };

  const handleUpdateReport = async (reportId, status) => {
    try {
      await updateReportStatus(reportId, status);
      showToast(`Report marked as ${status}.`);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateIssue = async (issueId, status) => {
    try {
      await updateIssueStatus(issueId, status);
      showToast(`Issue marked as ${status}.`);
    } catch (err) {
      console.error(err);
    }
  };

  // ── Stats ─────────────────────────────────────────────────────────────────
  const totalUsers    = users.length;
  const bannedUsers   = users.filter((u) => u.isBanned).length;
  const pendingReports = reports.filter((r) => r.status === 'pending').length;
  const openIssues    = issues.filter((i) => i.status === 'open').length;
  const totalWarnings = users.reduce((acc, u) => acc + (u.warningCount || 0), 0);

  const tabs = [
    { id: 'users',   label: 'Users',   icon: Users,   badge: totalUsers },
    { id: 'reports', label: 'Reports', icon: Flag,    badge: pendingReports > 0 ? pendingReports : null },
    { id: 'issues',  label: 'Issues',  icon: LifeBuoy, badge: openIssues > 0 ? openIssues : null },
  ];

  return (
    <div className="page-container relative">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] bg-[#1a1a1c] border border-white/[0.1] text-zinc-200 px-4 py-2.5 rounded-full text-[13px] font-medium shadow-2xl flex items-center gap-2"
          >
            <CheckCircle size={13} className="text-emerald-400" />
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="header-spacing"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center">
            <Shield size={16} className="text-cyan-400" />
          </div>
          <p className="section-label">Moderation</p>
        </div>
        <h1 className="page-title">Admin Dashboard</h1>
        <p className="page-description mt-2">
          Manage users, review reports, and handle platform issues.
        </p>
      </motion.div>

      {/* Stat Cards */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10"
      >
        <AdminStatCard icon={Users}        label="Total Users"     value={totalUsers}     accent="bg-cyan-400/10 text-cyan-400" />
        <AdminStatCard icon={Ban}          label="Banned"          value={bannedUsers}    accent="bg-red-500/10 text-red-400" />
        <AdminStatCard icon={Flag}         label="Pending Reports" value={pendingReports} accent="bg-amber-400/10 text-amber-400" />
        <AdminStatCard icon={AlertTriangle} label="Total Warnings" value={totalWarnings}  accent="bg-violet-400/10 text-violet-400" />
      </motion.div>

      {/* Tab Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="flex gap-1 mb-6 bg-white/[0.02] border border-white/[0.06] rounded-xl p-1 w-fit"
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 text-[13px] font-medium px-4 py-2 rounded-lg transition-all ${
              activeTab === tab.id
                ? 'bg-white/[0.07] text-white'
                : 'text-zinc-600 hover:text-zinc-300'
            }`}
          >
            <tab.icon size={13} />
            {tab.label}
            {tab.badge != null && (
              <span className={`text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center ${
                activeTab === tab.id
                  ? 'bg-cyan-400/20 text-cyan-400'
                  : 'bg-white/[0.05] text-zinc-600'
              }`}>
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </motion.div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        {activeTab === 'users' && (
          <UsersTab
            users={users}
            onBan={handleBan}
            onUnban={handleUnban}
            onWarn={(user) => setWarnTarget(user)}
          />
        )}
        {activeTab === 'reports' && (
          <ReportsTab
            reports={reports}
            users={users}
            onUpdateStatus={handleUpdateReport}
          />
        )}
        {activeTab === 'issues' && (
          <IssuesTab
            issues={issues}
            users={users}
            onUpdateStatus={handleUpdateIssue}
          />
        )}
      </motion.div>

      {/* Warn Modal */}
      <AnimatePresence>
        {warnTarget && (
          <WarnModal
            user={warnTarget}
            onClose={() => setWarnTarget(null)}
            onSend={handleSendWarning}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminDashboard;
