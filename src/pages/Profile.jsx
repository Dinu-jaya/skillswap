import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit2, Check, X, Plus, Camera, ChevronDown, LifeBuoy, Flag } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { updateUserProfile } from '../firebase/userService';
import { subscribeToAcceptedRequests } from '../firebase/requestService';
import { SecondaryButton } from '../components/Button';
import Avatar from '../components/Avatar';
import { avatarPresets } from '../utils/avatarMap';
import { SKILL_CATEGORIES, SKILL_LEVELS, normalizeSkillArray } from '../utils/skillUtils';
import SubmitIssueModal from '../components/SubmitIssueModal';
import ReportModal from '../components/ReportModal';

const fadeUp = (i = 0) => ({
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, delay: i * 0.07 },
});

const formatJoinDate = (ts) => {
  if (!ts?.toDate) return '';
  return ts.toDate().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
};

// ─── Level badge colours ───────────────────────────────────────────────────────
const LEVEL_STYLE = {
  Beginner:     'bg-emerald-400/[0.08] text-emerald-400 border-emerald-400/[0.18]',
  Intermediate: 'bg-violet-400/[0.08] text-violet-400 border-violet-400/[0.18]',
  Advanced:     'bg-amber-400/[0.08]   text-amber-400  border-amber-400/[0.18]',
};

const CATEGORY_STYLE = 'bg-white/[0.04] text-zinc-500 border-white/[0.07]';

// ─── Add Skill inline form ─────────────────────────────────────────────────────
const AddSkillForm = ({ accentClass, onAdd, placeholder = 'Skill name…' }) => {
  const [name, setName]         = useState('');
  const [category, setCategory] = useState(SKILL_CATEGORIES[0]);
  const [level, setLevel]       = useState(SKILL_LEVELS[1]); // Intermediate default
  const [open, setOpen]         = useState(false);

  const handleAdd = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    onAdd({ name: trimmed, category, level });
    setName('');
    setCategory(SKILL_CATEGORIES[0]);
    setLevel(SKILL_LEVELS[1]);
    setOpen(false);
  };

  return (
    <div className="mt-3 space-y-2">
      {/* Name row with expand toggle */}
      <div className="flex gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          placeholder={placeholder}
          className="flex-1 text-[12px] px-3 py-2 bg-white/[0.03] border border-white/[0.08] rounded-lg text-zinc-300 placeholder:text-zinc-700 focus:outline-none focus:border-cyan-400/30 transition-all"
        />
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="px-2 text-zinc-600 hover:text-zinc-300 transition-colors"
          title="Set category & level"
        >
          <ChevronDown size={14} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
        <button
          type="button"
          onClick={handleAdd}
          disabled={!name.trim()}
          className="p-2 text-zinc-600 hover:text-cyan-400 disabled:opacity-30 transition-colors"
        >
          <Plus size={14} />
        </button>
      </div>

      {/* Expanded metadata row */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="flex gap-2 pt-1">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="flex-1 text-[11px] px-2 py-1.5 bg-white/[0.03] border border-white/[0.08] rounded-lg text-zinc-400 focus:outline-none focus:border-cyan-400/30 transition-all"
              >
                {SKILL_CATEGORIES.map((c) => (
                  <option key={c} value={c} className="bg-zinc-900">{c}</option>
                ))}
              </select>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="flex-1 text-[11px] px-2 py-1.5 bg-white/[0.03] border border-white/[0.08] rounded-lg text-zinc-400 focus:outline-none focus:border-cyan-400/30 transition-all"
              >
                {SKILL_LEVELS.map((l) => (
                  <option key={l} value={l} className="bg-zinc-900">{l}</option>
                ))}
              </select>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── Skill chip (display + edit mode) ─────────────────────────────────────────
const SkillChip = ({ skill, editing, onRemove, accentClass }) => (
  <span className={`inline-flex items-center gap-1.5 text-[12px] font-medium px-3 py-1.5 rounded-lg border ${accentClass} transition-all`}>
    {skill.name}
    <span className={`text-[9px] px-1.5 py-0.5 rounded border ${CATEGORY_STYLE}`}>
      {skill.category}
    </span>
    <span className={`text-[9px] px-1.5 py-0.5 rounded border ${LEVEL_STYLE[skill.level] || LEVEL_STYLE.Intermediate}`}>
      {skill.level}
    </span>
    {editing && (
      <button onClick={() => onRemove(skill.name)} className="ml-0.5 hover:text-red-400 transition-colors">
        <X size={10} />
      </button>
    )}
  </span>
);

// ─── Profile component ─────────────────────────────────────────────────────────
const Profile = () => {
  const { currentUser, userProfile } = useAuth();

  const [isEditing, setIsEditing]     = useState(false);
  const [editName, setEditName]       = useState('');
  const [editBio, setEditBio]         = useState('');
  const [skillsOffered, setSkillsOffered] = useState([]);
  const [skillsWanted, setSkillsWanted]   = useState([]);
  const [nameError, setNameError]     = useState('');
  const [isSaving, setIsSaving]       = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Avatar picker
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [selectedAvatar, setSelectedAvatar]     = useState('');
  const [selectedGender, setSelectedGender]     = useState('male');
  const [isSavingAvatar, setIsSavingAvatar]     = useState(false);

  // Modals
  const [showIssueModal, setShowIssueModal] = useState(false);

  // Stats
  const [acceptedRequests, setAcceptedRequests] = useState([]);

  // ── Sync from live profile ─────────────────────────────────────────────────
  useEffect(() => {
    if (!userProfile) return;
    setEditName(userProfile.displayName || userProfile.name || '');
    setEditBio(userProfile.bio || '');
    // normalizeSkillArray handles both legacy strings AND structured objects
    setSkillsOffered(normalizeSkillArray(userProfile.skillsOffered));
    setSkillsWanted(normalizeSkillArray(userProfile.skillsWanted));
    setSelectedAvatar(userProfile.avatar || '');
    setSelectedGender(userProfile.gender || 'male');
  }, [userProfile]);

  useEffect(() => {
    if (!currentUser?.uid) return;
    const unsub = subscribeToAcceptedRequests(currentUser.uid, setAcceptedRequests);
    return () => unsub();
  }, [currentUser?.uid]);

  // Stats
  const completedExchanges = acceptedRequests.length;
  const uniquePeers = new Set(
    acceptedRequests.map((r) =>
      r.senderId === currentUser?.uid ? r.receiverId : r.senderId
    )
  );
  const connectionsCount = uniquePeers.size;
  const totalSkills = skillsOffered.length + skillsWanted.length;

  const displayName = editName || userProfile?.displayName || userProfile?.name || 'User';
  const displayEmail = currentUser?.email || '';
  const joinDate = formatJoinDate(userProfile?.createdAt);

  // ── Avatar save ────────────────────────────────────────────────────────────
  const handleSaveAvatar = async () => {
    if (!selectedAvatar) return;
    try {
      setIsSavingAvatar(true);
      await updateUserProfile(currentUser.uid, {
        avatar: selectedAvatar,
        gender: selectedGender,
        avatarType: 'preset',
      });
      setShowAvatarPicker(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('[Profile] Failed to save avatar', err);
    } finally {
      setIsSavingAvatar(false);
    }
  };

  // ── Profile save ───────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!editName.trim()) { setNameError('Name cannot be empty.'); return; }
    try {
      setIsSaving(true);
      setNameError('');
      // Always persist structured objects to Firestore
      await updateUserProfile(currentUser.uid, {
        name: editName.trim(),
        displayName: editName.trim(),
        bio: editBio,
        skillsOffered,   // array of { name, category, level }
        skillsWanted,    // array of { name, category, level }
        email: currentUser.email,
      });
      setIsEditing(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('[Profile] Failed to save profile', err);
      setNameError('Failed to save profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditName(userProfile?.displayName || userProfile?.name || '');
    setEditBio(userProfile?.bio || '');
    setSkillsOffered(normalizeSkillArray(userProfile?.skillsOffered));
    setSkillsWanted(normalizeSkillArray(userProfile?.skillsWanted));
    setNameError('');
    setIsEditing(false);
  };

  // ── Skill list helpers ─────────────────────────────────────────────────────
  const addSkillToList = (list, setList) => (skill) => {
    // Prevent duplicate names (case-insensitive)
    if (list.some((s) => s.name.toLowerCase() === skill.name.toLowerCase())) return;
    setList([...list, skill]);
  };

  const removeSkillFromList = (list, setList) => (name) => {
    setList(list.filter((s) => s.name !== name));
  };

  if (!userProfile && !currentUser) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="page-container !max-w-2xl relative">
      {/* Success Toast */}
      {saveSuccess && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-24 left-1/2 -translate-x-1/2 z-[60] bg-emerald-500 text-white px-4 py-2 rounded-full text-xs font-bold shadow-lg flex items-center gap-2"
        >
          <Check size={14} /> Profile saved successfully!
        </motion.div>
      )}

      {/* Header */}
      <motion.div className="header-spacing" {...fadeUp(0)}>
        <p className="section-label mb-4">Your identity</p>
        <h1 className="page-title">Profile</h1>
      </motion.div>

      {/* Avatar + Name */}
      <motion.div className="flex items-start gap-5 mb-10" {...fadeUp(1)}>
        <div className="relative group shrink-0">
          <Avatar avatarId={userProfile?.avatar} size={64} className="rounded-2xl" />
          <button
            onClick={() => setShowAvatarPicker(true)}
            className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Camera size={16} className="text-white" />
          </button>
        </div>

        <div className="flex-1 min-w-0">
          {isEditing ? (
            <div>
              <input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full text-[22px] font-semibold text-white bg-transparent border-b border-white/20 focus:outline-none focus:border-cyan-400/50 pb-1 mb-1 transition-colors"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
                placeholder="Your name"
              />
              {nameError && <p className="text-[11px] text-red-400 mt-1">{nameError}</p>}
            </div>
          ) : (
            <h2 className="text-[22px] font-semibold text-white mb-0.5" style={{ fontFamily: "'DM Sans', sans-serif" }}>
              {displayName}
            </h2>
          )}
          <p className="text-[13px] text-zinc-500">{displayEmail}</p>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-cyan-400/[0.08] text-cyan-400 border border-cyan-400/[0.15]">
              Pro Member
            </span>
            {joinDate && (
              <span className="text-[11px] text-zinc-600">Joined {joinDate}</span>
            )}
          </div>
          <button
            onClick={() => setShowAvatarPicker(true)}
            className="mt-3 text-[12px] font-medium text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1.5"
          >
            <Camera size={14} /> Change Avatar
          </button>
        </div>

        <div className="flex items-center gap-2">
          <SecondaryButton
            onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
            disabled={isSaving}
            className={`px-4 py-2 ${isEditing ? 'text-cyan-400 border-cyan-400/30' : ''}`}
          >
            {isSaving ? (
              <div className="w-3.5 h-3.5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mr-1" />
            ) : (
              isEditing ? <Check size={14} /> : <Edit2 size={14} />
            )}
            {isSaving ? 'Saving...' : isEditing ? 'Save' : 'Edit'}
          </SecondaryButton>
          {isEditing && (
            <button onClick={handleCancel} className="text-[12px] text-zinc-600 hover:text-zinc-400 transition-colors px-2">
              Cancel
            </button>
          )}
        </div>
      </motion.div>

      {/* Bio */}
      <motion.div className="mb-10" {...fadeUp(2)}>
        <p className="section-label mb-3">About</p>
        {isEditing ? (
          <textarea
            value={editBio}
            onChange={(e) => setEditBio(e.target.value)}
            rows={4}
            className="w-full text-[14px] text-zinc-300 bg-white/[0.03] border border-white/[0.08] rounded-xl p-4 focus:outline-none focus:border-cyan-400/30 transition-all resize-none leading-relaxed"
            placeholder="Tell the community who you are and what you bring…"
          />
        ) : (
          <p className="text-[14px] text-zinc-400 leading-relaxed">
            {editBio || <span className="text-zinc-700 italic">No bio yet. Click Edit to add one.</span>}
          </p>
        )}
      </motion.div>

      <div className="border-t border-white/[0.06] mb-10" />

      {/* Skills Offered */}
      <motion.div className="mb-10" {...fadeUp(3)}>
        <div className="flex items-center justify-between mb-3">
          <p className="section-label">Skills I offer</p>
          <span className="text-[10px] text-zinc-700">{skillsOffered.length} skill{skillsOffered.length !== 1 ? 's' : ''}</span>
        </div>

        <div className="flex flex-wrap gap-2 mb-1">
          {skillsOffered.map((skill) => (
            <SkillChip
              key={skill.name}
              skill={skill}
              editing={isEditing}
              onRemove={removeSkillFromList(skillsOffered, setSkillsOffered)}
              accentClass="bg-cyan-400/[0.06] text-cyan-400 border-cyan-400/[0.15]"
            />
          ))}
          {skillsOffered.length === 0 && !isEditing && (
            <p className="text-[12px] text-zinc-700 italic">None added yet.</p>
          )}
        </div>

        {isEditing && (
          <AddSkillForm
            placeholder="e.g. React, Figma, Python…"
            onAdd={addSkillToList(skillsOffered, setSkillsOffered)}
          />
        )}
      </motion.div>

      {/* Skills Wanted */}
      <motion.div className="mb-10" {...fadeUp(4)}>
        <div className="flex items-center justify-between mb-3">
          <p className="section-label">Skills I want to learn</p>
          <span className="text-[10px] text-zinc-700">{skillsWanted.length} skill{skillsWanted.length !== 1 ? 's' : ''}</span>
        </div>

        <div className="flex flex-wrap gap-2 mb-1">
          {skillsWanted.map((skill) => (
            <SkillChip
              key={skill.name}
              skill={skill}
              editing={isEditing}
              onRemove={removeSkillFromList(skillsWanted, setSkillsWanted)}
              accentClass="bg-violet-400/[0.06] text-violet-400 border-violet-400/[0.15]"
            />
          ))}
          {skillsWanted.length === 0 && !isEditing && (
            <p className="text-[12px] text-zinc-700 italic">None added yet.</p>
          )}
        </div>

        {isEditing && (
          <AddSkillForm
            placeholder="e.g. Python, Motion Design, Writing…"
            onAdd={addSkillToList(skillsWanted, setSkillsWanted)}
          />
        )}
      </motion.div>

      {/* Activity Stats */}
      <motion.div {...fadeUp(5)}>
        <div className="border-t border-white/[0.06] pt-8">
          <p className="section-label mb-4">Activity</p>
          <div className="grid grid-cols-3 gap-px bg-white/[0.05] rounded-xl overflow-hidden border border-white/[0.05]">
            {[
              { label: 'Exchanges',   value: String(completedExchanges) },
              { label: 'Connections', value: String(connectionsCount) },
              { label: 'Skills',      value: String(totalSkills) },
            ].map((s) => (
              <div key={s.label} className="bg-[#111113] px-5 py-5">
                <p className="text-2xl font-semibold text-white mb-1" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                  {s.value}
                </p>
                <p className="text-[11px] text-zinc-600 font-medium">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Support & Moderation */}
      <motion.div {...fadeUp(6)} className="mt-10 pt-8 border-t border-white/[0.06]">
        <p className="section-label mb-4">Support</p>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setShowIssueModal(true)}
            className="flex items-center gap-2 text-[13px] font-medium px-4 py-2 rounded-xl border bg-violet-400/[0.06] border-violet-400/[0.15] text-violet-400 hover:bg-violet-400/[0.12] transition-all"
          >
            <LifeBuoy size={13} />
            Submit an Issue
          </button>
        </div>
        <p className="text-[11px] text-zinc-700 mt-3">
          Having a problem with the platform? Submit an issue to the admin team.
        </p>
      </motion.div>

      {/* ── Avatar Picker Modal ──────────────────────────────────────────────── */}
      <AnimatePresence>
        {showAvatarPicker && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={(e) => e.target === e.currentTarget && setShowAvatarPicker(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-md bg-[#111113] border border-white/[0.08] rounded-2xl p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-[16px] font-semibold text-white" style={{ fontFamily: "'DM Sans', sans-serif" }}>Choose Avatar</h3>
                <button onClick={() => setShowAvatarPicker(false)} className="text-zinc-600 hover:text-zinc-300 transition-colors">
                  <X size={18} />
                </button>
              </div>

              {/* Preview */}
              <div className="flex justify-center mb-6">
                {(() => {
                  const allPresets = [...avatarPresets.boys, ...avatarPresets.girls];
                  const selectedData = allPresets.find((p) => p.id === selectedAvatar);
                  const accentColor = selectedData?.color || '#22d3ee';
                  return (
                    <div className="relative">
                      <Avatar
                        avatarId={selectedAvatar}
                        size={80}
                        className="rounded-2xl transition-all duration-300"
                        style={{ boxShadow: `0 0 20px ${accentColor}40`, border: `2px solid ${accentColor}60` }}
                      />
                      <div
                        className="absolute inset-0 rounded-2xl animate-pulse opacity-20"
                        style={{ backgroundColor: accentColor, filter: 'blur(15px)' }}
                      />
                    </div>
                  );
                })()}
              </div>

              {/* Gender toggle */}
              <div className="flex gap-2 mb-5">
                {['male', 'female'].map((g) => (
                  <button
                    key={g}
                    onClick={() => {
                      setSelectedGender(g);
                      const first = g === 'male' ? avatarPresets.boys[0].id : avatarPresets.girls[0].id;
                      setSelectedAvatar(first);
                    }}
                    className={`flex-1 py-1.5 rounded-lg text-[12px] font-medium capitalize transition-all border ${
                      selectedGender === g
                        ? 'bg-cyan-400/10 text-cyan-400 border-cyan-400/30'
                        : 'bg-white/[0.03] text-zinc-500 border-white/[0.06] hover:text-zinc-300'
                    }`}
                  >
                    {g === 'male' ? 'Boy Avatars' : 'Girl Avatars'}
                  </button>
                ))}
              </div>

              {/* Avatar grid */}
              <div className="grid grid-cols-4 gap-3 mb-6">
                {(selectedGender === 'male' ? avatarPresets.boys : avatarPresets.girls).map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => setSelectedAvatar(preset.id)}
                    className={`relative rounded-xl overflow-hidden border-2 transition-all duration-300 hover:scale-105 active:scale-95 ${
                      selectedAvatar === preset.id
                        ? 'scale-105 shadow-lg'
                        : 'border-transparent hover:border-white/20 grayscale-[0.3] hover:grayscale-0'
                    }`}
                    style={selectedAvatar === preset.id ? { borderColor: preset.color, boxShadow: `0 0 12px ${preset.color}60` } : {}}
                  >
                    <Avatar avatarId={preset.id} size={68} className="rounded-xl" />
                    {selectedAvatar === preset.id && (
                      <div
                        className="absolute top-1 right-1 w-4 h-4 rounded-full flex items-center justify-center z-10"
                        style={{ backgroundColor: preset.color }}
                      >
                        <Check size={10} className="text-zinc-950" strokeWidth={4} />
                      </div>
                    )}
                  </button>
                ))}
              </div>

              <button
                onClick={handleSaveAvatar}
                disabled={isSavingAvatar || !selectedAvatar}
                className="w-full py-2.5 bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 text-zinc-950 text-[13px] font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                {isSavingAvatar ? (
                  <><div className="w-3.5 h-3.5 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" /> Saving...</>
                ) : (
                  <><Check size={14} /> Apply Avatar</>
                )}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Submit Issue Modal ──────────────────────────────────────────────── */}
      <AnimatePresence>
        {showIssueModal && (
          <SubmitIssueModal onClose={() => setShowIssueModal(false)} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Profile;
