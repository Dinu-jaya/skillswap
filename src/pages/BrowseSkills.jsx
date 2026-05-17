import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Search, ArrowUpRight, Code2, Palette, Megaphone, Database,
  Music, BookOpen, MessageSquare, Users, Sparkles,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { startConversationWithUser } from '../firebase/chatService';
import { subscribeToPublicSkills } from '../firebase/skillService';
import { getUserProfile } from '../firebase/userService';
import Avatar from '../components/Avatar';

const CATEGORIES = ['All', 'Engineering', 'Design', 'Marketing', 'Creative', 'Writing', 'Data Science'];
const LEVELS = ['All levels', 'Beginner', 'Intermediate', 'Advanced'];
const CATEGORY_ICONS = {
  Engineering: Code2, Design: Palette, Marketing: Megaphone,
  'Data Science': Database, Creative: Music,
  Writing: BookOpen,
};

const fadeUp = (i = 0) => ({
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, delay: i * 0.06, ease: [0.25, 0.46, 0.45, 0.94] },
});

// ─── Skill Card ───────────────────────────────────────────────────────────────

const SkillCard = ({ skill, index, currentUser, onMessage, startingChat }) => {
  const isOwn = skill.ownerUid === currentUser?.uid;
  const IconComponent = CATEGORY_ICONS[skill.category] || Code2;

  return (
    <motion.div
      key={skill.id}
      {...fadeUp(index * 0.04 + 0.1)}
      className="group flex flex-col p-5 rounded-xl border border-white/[0.06] bg-[#111113] hover:border-white/[0.11] hover:bg-[#141416] transition-all duration-200"
    >
      {/* Category row */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-1.5">
          <IconComponent size={11} className="text-zinc-600" />
          <span className="section-label">{skill.category}</span>
        </div>
        <ArrowUpRight size={13} className="text-zinc-700 group-hover:text-cyan-400 transition-colors mt-0.5" />
      </div>

      {/* Skill title */}
      <h3
        className="text-[15px] font-semibold text-zinc-100 mb-3 group-hover:text-white transition-colors leading-snug"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        {skill.title}
      </h3>

      {/* Level badge */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-violet-400/[0.07] text-violet-400 border border-violet-400/[0.12]">
          {skill.level}
        </span>
      </div>

      {/* Owner row */}
      <div className="flex items-center gap-2 mt-auto pt-3 border-t border-white/[0.05]">
        <Avatar avatarId={skill.ownerAvatar} avatarUrl={skill.ownerAvatarUrl || null} size={24} className="rounded-full" />
        <span className="text-[12px] text-zinc-400 truncate flex-1">{skill.ownerName}</span>

        {!isOwn ? (
          <button
            onClick={() => onMessage(skill)}
            disabled={startingChat === skill.id}
            className="flex items-center gap-1.5 text-[11px] font-medium text-cyan-400 hover:text-cyan-300 border border-cyan-400/20 hover:border-cyan-400/40 px-2.5 py-1 rounded-lg bg-cyan-400/[0.06] hover:bg-cyan-400/[0.1] disabled:opacity-50 transition-all shrink-0"
          >
            {startingChat === skill.id
              ? <span className="w-3 h-3 border border-cyan-400 border-t-transparent rounded-full animate-spin" />
              : <MessageSquare size={11} />}
            Message
          </button>
        ) : (
          <span className="text-[10px] text-zinc-600 italic shrink-0">Your skill</span>
        )}
      </div>
    </motion.div>
  );
};

// ─── Empty State ──────────────────────────────────────────────────────────────

const EmptyState = ({ hasSkills, onClear, navigate }) => (
  <div className="py-24 text-center">
    <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mx-auto mb-4">
      {hasSkills
        ? <Search size={22} className="text-zinc-700" />
        : <Users size={22} className="text-zinc-700" />}
    </div>
    <p className="text-[14px] font-medium text-zinc-500 mb-1">
      {hasSkills ? 'No skills match your filters' : 'No skills listed yet'}
    </p>
    <p className="text-[12px] text-zinc-700 mb-4">
      {hasSkills
        ? 'Try clearing your search or selecting a different category.'
        : 'Add skills to your profile — they\'ll appear here for the whole community.'}
    </p>
    {hasSkills && (
      <button
        onClick={onClear}
        className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors mr-4"
      >
        Clear filters
      </button>
    )}
    <button
      onClick={() => navigate('/profile')}
      className="text-xs text-violet-400 hover:text-violet-300 transition-colors"
    >
      Go to Profile →
    </button>
  </div>
);

// ─── Main Page ────────────────────────────────────────────────────────────────

const BrowseSkills = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [skills, setSkills] = useState([]);
  const [loadingSkills, setLoadingSkills] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [level, setLevel] = useState('All levels');
  const [startingChat, setStartingChat] = useState(null);

  // ── Real-time subscription to public skills from users collection ──────────
  useEffect(() => {
    const unsub = subscribeToPublicSkills((data) => {
      setSkills(data);
      setLoadingSkills(false);
    });
    return () => unsub();
  }, []);

  // ── Filter logic ───────────────────────────────────────────────────────────
  const filtered = skills.filter((s) => {
    const q = search.toLowerCase();
    const matchSearch =
      s.title?.toLowerCase().includes(q) ||
      s.category?.toLowerCase().includes(q) ||
      s.ownerName?.toLowerCase().includes(q) ||
      (s.tags || []).some((t) => t.toLowerCase().includes(q));
    const matchCat = category === 'All' || s.category === category;
    const matchLevel = level === 'All levels' || s.level === level;
    return matchSearch && matchCat && matchLevel;
  });

  // ── Message owner handler ──────────────────────────────────────────────────
  const handleMessageSkillOwner = async (skill) => {
    if (!currentUser) { navigate('/login'); return; }
    if (!skill.ownerUid) return;
    setStartingChat(skill.id);
    try {
      const ownerProfile = await getUserProfile(skill.ownerUid);
      const chatId = await startConversationWithUser(currentUser, skill.ownerUid, {
        name: ownerProfile?.displayName || ownerProfile?.name || skill.ownerName || 'Skill Owner',
        avatar: ownerProfile?.avatar || skill.ownerAvatar || null,
      });
      if (chatId) navigate('/chat');
    } catch (err) {
      console.error('Failed to start chat:', err);
    } finally {
      setStartingChat(null);
    }
  };

  // ── Category counts (live) ─────────────────────────────────────────────────
  const getCatCount = (cat) =>
    cat === 'All' ? skills.length : skills.filter((s) => s.category === cat).length;

  return (
    <div className="page-container">
      {/* Header */}
      <motion.div className="header-spacing" {...fadeUp(0)}>
        <p className="section-label mb-4">Community knowledge</p>
        <div className="flex items-start justify-between gap-4 mb-4">
          <h1 className="page-title">Discover Skills</h1>
          <div className="flex items-center gap-2 shrink-0 mt-1">
            <div className="flex items-center gap-1.5 text-[11px] text-zinc-600 bg-white/[0.03] border border-white/[0.06] rounded-lg px-2.5 py-1.5">
              <Sparkles size={11} className="text-cyan-400" />
              <span>{skills.length} skills live</span>
            </div>
            <button
              onClick={() => navigate('/profile')}
              className="text-[12px] font-medium text-zinc-950 bg-cyan-400 hover:bg-cyan-300 px-3 py-1.5 rounded-xl transition-all"
            >
              + Add Yours
            </button>
          </div>
        </div>
        <p className="page-description">
          Skills listed by real community members. Update your profile to appear here.
        </p>
      </motion.div>

      {/* Search + Filters */}
      <motion.div className="mb-10 space-y-6" {...fadeUp(1)}>
        <div className="relative w-full max-w-md group">
          <Search
            size={14}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-cyan-400 transition-colors"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search skills, people, categories…"
            className="w-full pl-9 pr-4 py-2.5 bg-white/[0.04] border border-white/[0.07] rounded-xl focus:outline-none focus:border-cyan-400/30 transition-all text-[13px] text-zinc-300 placeholder:text-zinc-600"
          />
        </div>

        {/* Category pills */}
        <div className="flex overflow-x-auto gap-2 pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-none">
          {CATEGORIES.map((cat) => {
            const count = getCatCount(cat);
            return (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`flex items-center gap-1.5 text-[12px] font-medium px-3 py-1.5 rounded-lg border transition-all shrink-0 ${
                  category === cat
                    ? 'bg-cyan-400/10 border-cyan-400/30 text-cyan-400'
                    : 'bg-transparent border-white/[0.07] text-zinc-500 hover:text-zinc-300 hover:border-white/[0.12]'
                }`}
              >
                {cat}
                {!loadingSkills && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    category === cat ? 'bg-cyan-400/20 text-cyan-400' : 'bg-white/[0.05] text-zinc-600'
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}

          <div className="w-px h-6 bg-white/[0.06] mx-1 self-center hidden sm:block shrink-0" />

          {LEVELS.map((lv) => (
            <button
              key={lv}
              onClick={() => setLevel(lv)}
              className={`text-[12px] font-medium px-3 py-1.5 rounded-lg border transition-all shrink-0 ${
                level === lv
                  ? 'bg-violet-400/10 border-violet-400/30 text-violet-400'
                  : 'bg-transparent border-white/[0.07] text-zinc-500 hover:text-zinc-300 hover:border-white/[0.12]'
              }`}
            >
              {lv}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Result count */}
      <motion.p className="muted-text mb-6" {...fadeUp(2)}>
        {loadingSkills
          ? 'Loading community skills…'
          : `${filtered.length} skill${filtered.length !== 1 ? 's' : ''} found`}
      </motion.p>

      {/* Skill grid */}
      {loadingSkills ? (
        <div className="card-grid">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="p-5 rounded-xl border border-white/[0.06] bg-[#111113] animate-pulse">
              <div className="h-3 w-20 bg-white/[0.05] rounded mb-3" />
              <div className="h-4 w-3/4 bg-white/[0.05] rounded mb-2" />
              <div className="h-3 w-1/2 bg-white/[0.04] rounded mb-4" />
              <div className="flex items-center gap-2 mt-auto pt-3 border-t border-white/[0.04]">
                <div className="w-6 h-6 rounded-full bg-white/[0.05]" />
                <div className="h-3 w-24 bg-white/[0.04] rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length > 0 ? (
        <div className="card-grid">
          {filtered.map((skill, i) => (
            <SkillCard
              key={skill.id}
              skill={skill}
              index={i}
              currentUser={currentUser}
              onMessage={handleMessageSkillOwner}
              startingChat={startingChat}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          hasSkills={skills.length > 0}
          onClear={() => { setSearch(''); setCategory('All'); setLevel('All levels'); }}
          navigate={navigate}
        />
      )}
    </div>
  );
};

export default BrowseSkills;
