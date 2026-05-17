import { motion } from 'framer-motion';
import { 
  BookOpen, 
  ArrowLeftRight, 
  FileText, 
  CheckCircle2, 
  Zap, 
  Shield, 
  AlertTriangle, 
  CheckSquare, 
  Award, 
  ArrowRight, 
  Sparkles, 
  Info, 
  Code, 
  Link as LinkIcon, 
  Clock, 
  UserCheck 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 15 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45, delay, ease: [0.25, 0.46, 0.45, 0.94] }
});

const Learn = () => {
  const { userProfile } = useAuth();
  
  const userName = userProfile?.displayName || userProfile?.name || 'Explorer';

  return (
    <div className="page-container max-w-5xl mx-auto space-y-16 pb-12">
      {/* ── Header / Hero Section ────────────────────────────────────────── */}
      <motion.section {...fadeUp(0)} className="text-left space-y-3">
        <div className="flex items-center gap-2 text-cyan-400 font-mono text-[11px] uppercase tracking-widest">
          <Sparkles size={12} />
          <span>SkillSwap Academy</span>
        </div>
        <h1 className="page-title leading-tight">
          How SkillSwap Works
        </h1>
        <p className="page-description max-w-2xl">
          Welcome, <span className="text-cyan-300 font-semibold">{userName}</span>! SkillSwap is a peer-to-peer knowledge network designed around structured, hands-on learning. Here is everything you need to master the platform.
        </p>
      </motion.section>

      {/* ── Section 1: What is SkillSwap & Peer Learning ────────────────────── */}
      <motion.section {...fadeUp(0.1)} className="grid md:grid-cols-2 gap-6">
        <div className="glass-card p-6 border-cyan-500/10 bg-cyan-950/[0.02] flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-cyan-400/[0.08] border border-cyan-400/20 flex items-center justify-center mb-5">
              <BookOpen className="text-cyan-400" size={18} />
            </div>
            <h2 className="text-lg font-semibold text-white mb-3 font-display">
              The Peer-to-Peer Learning Model
            </h2>
            <p className="text-[13px] text-zinc-400 leading-relaxed">
              Passive video courses have a 5% completion rate. SkillSwap replaces passive consumption with active, collaborative exchange. By teaching what you excel at and learning what you need, you reinforce your own expertise while gaining new skills.
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-white/[0.04] text-[11px] text-cyan-400/80 font-medium">
            Active peer learning increases retention rates by up to 75%.
          </div>
        </div>

        <div className="glass-card p-6 border-violet-500/10 bg-violet-950/[0.02] flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-violet-400/[0.08] border border-violet-400/20 flex items-center justify-center mb-5">
              <ArrowLeftRight className="text-violet-400" size={18} />
            </div>
            <h2 className="text-lg font-semibold text-white mb-3 font-display">
              Direct Skill Exchange
            </h2>
            <p className="text-[13px] text-zinc-400 leading-relaxed">
              No money changes hands. Your knowledge is the currency. You negotiate and agree on mutually beneficial exchanges directly with other professionals. You offer mentoring in your prime skills in exchange for customized lessons in theirs.
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-white/[0.04] text-[11px] text-violet-400/80 font-medium">
            Zero cost. High impact. Fully customizable schedules.
          </div>
        </div>
      </motion.section>

      {/* ── Section 2: How Contracts Work (Visual Flow) ─────────────────────── */}
      <motion.section {...fadeUp(0.15)} className="space-y-6">
        <div>
          <p className="section-label mb-1">Structured Learning</p>
          <h2 className="section-title">The Exchange Contract</h2>
          <p className="text-zinc-500 text-[13px] max-w-xl">
            Contracts form the structural backbone of SkillSwap. They enforce mutual commitment and track learning progress automatically.
          </p>
        </div>

        {/* Visual flow chart */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 relative">
          {[
            { step: '1', title: 'Propose', desc: 'Find a user and send an exchange proposal detailing skills and sessions.', color: 'border-white/10 hover:border-cyan-400/30' },
            { step: '2', title: 'Accept', desc: 'Partner reviews proposal, refines terms, and accepts the contract.', color: 'border-white/10 hover:border-emerald-400/30' },
            { step: '3', title: 'Active', desc: 'The exchange contract goes live. Both users gain access to workspace sessions.', color: 'border-white/10 hover:border-violet-400/30' },
            { step: '4', title: 'Sessions', desc: 'Complete lessons sequentially, uploading proof and summaries.', color: 'border-white/10 hover:border-amber-400/30' },
            { step: '5', title: 'Done', desc: 'All sessions are finished! Both gain XP and complete their exchange.', color: 'border-white/10 hover:border-cyan-300/40' },
          ].map((node, i) => (
            <div key={node.title} className={`glass-card p-5 border flex flex-col justify-between relative group transition-all ${node.color}`}>
              <div>
                <span className="text-[10px] font-mono text-zinc-600 block mb-1">STAGE 0{node.step}</span>
                <h3 className="text-sm font-semibold text-white mb-2">{node.title}</h3>
                <p className="text-[12px] text-zinc-500 leading-relaxed">{node.desc}</p>
              </div>
              {i < 4 && (
                <div className="hidden md:flex absolute top-1/2 -right-2.5 -translate-y-1/2 w-5 h-5 rounded-full bg-[#0d0d0f] border border-white/[0.08] items-center justify-center text-zinc-600 group-hover:text-cyan-400 z-10 transition-colors">
                  <ArrowRight size={10} />
                </div>
              )}
            </div>
          ))}
        </div>
      </motion.section>

      {/* ── Section 3: Session Tracking ────────────────────────────────────── */}
      <motion.section {...fadeUp(0.2)} className="grid md:grid-cols-2 gap-8 items-center">
        <div className="space-y-4">
          <p className="section-label mb-1">Classroom Management</p>
          <h2 className="section-title">Verified Session Tracking</h2>
          <p className="text-[13px] text-zinc-400 leading-relaxed">
            Every contract is broken down into structured learning sessions. The teaching partner logs the topic, schedule, and detailed notes inside the shared workspace.
          </p>
          <div className="space-y-3 pt-2">
            <div className="flex gap-3">
              <Clock size={16} className="text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-[13px] font-medium text-white">Custom Scheduling</h4>
                <p className="text-[12px] text-zinc-500">Coordinate dates and lesson times on a per-session basis.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <FileText size={16} className="text-violet-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-[13px] font-medium text-white">Session Summaries</h4>
                <p className="text-[12px] text-zinc-500">Document covered concepts, homework, and learning goals.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <LinkIcon size={16} className="text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-[13px] font-medium text-white">Proof of Resource</h4>
                <p className="text-[12px] text-zinc-500">Attach links to shared code repositories, designs, or files.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="glass-card p-6 border-white/[0.06] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.04]">
            <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest">Active Workspace Mock</span>
            <span className="text-[10px] font-semibold px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded border border-emerald-500/20">Session 3</span>
          </div>
          <div className="space-y-3">
            <div>
              <span className="text-[9px] text-zinc-600 block uppercase">Topic</span>
              <p className="text-xs font-semibold text-white">Introduction to Tailwind CSS Responsive Grids</p>
            </div>
            <div>
              <span className="text-[9px] text-zinc-600 block uppercase">Teacher Notes</span>
              <p className="text-xs text-zinc-400 bg-white/[0.02] p-2.5 rounded border border-white/[0.04] leading-relaxed">
                Reviewed media queries and flexible columns. Assigned practice files inside the repository.
              </p>
            </div>
            <div>
              <span className="text-[9px] text-zinc-600 block uppercase">Resource link</span>
              <div className="flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 transition-colors mt-0.5">
                <Code size={12} />
                <span className="underline font-mono">github.com/skillswap-exchange/grids</span>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* ── Section 4: XP & Level System ────────────────────────────────────── */}
      <motion.section {...fadeUp(0.25)} className="space-y-6">
        <div>
          <p className="section-label mb-1">Reputation Engine</p>
          <h2 className="section-title">XP & Learning Levels</h2>
          <p className="text-zinc-500 text-[13px] max-w-xl">
            Build your professional learning status. As you complete sessions, share helpful files, and execute agreements, your experience grows.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="glass-card p-5 border-white/[0.06] flex flex-col justify-between">
            <div>
              <div className="w-9 h-9 rounded-lg bg-amber-400/[0.08] border border-amber-400/20 flex items-center justify-center mb-4">
                <Award className="text-amber-400" size={16} />
              </div>
              <h3 className="text-sm font-semibold text-white mb-2">XP Progression Model</h3>
              <p className="text-[12px] text-zinc-500 leading-relaxed">
                Experience points (XP) are awarded automatically upon completion of verified exchange activities. Your levels increase based on a quadratic curve representing consistent and persistent learning efforts.
              </p>
            </div>
            <div className="text-[10px] text-amber-400 font-mono mt-4 pt-3 border-t border-white/[0.04]">
              Required XP = Level &times; 100
            </div>
          </div>

          <div className="glass-card p-5 border-white/[0.06] flex flex-col justify-between">
            <div>
              <div className="w-9 h-9 rounded-lg bg-cyan-400/[0.08] border border-cyan-400/20 flex items-center justify-center mb-4">
                <Zap className="text-cyan-400" size={16} />
              </div>
              <h3 className="text-sm font-semibold text-white mb-2">Meaningful Action Rewards</h3>
              <ul className="text-[12px] text-zinc-500 space-y-1.5 list-disc pl-4 leading-relaxed">
                <li><strong className="text-zinc-300">Complete Session</strong>: +50 XP to Teacher</li>
                <li><strong className="text-zinc-300">Submit Proof URL</strong>: +25 XP Bonus</li>
                <li><strong className="text-zinc-300">Complete Contract</strong>: +150 XP to Both</li>
              </ul>
            </div>
            <div className="text-[10px] text-cyan-400 font-mono mt-4 pt-3 border-t border-white/[0.04]">
              Spam-free: XP cannot be gained from trivial actions.
            </div>
          </div>

          <div className="glass-card p-5 border-white/[0.06] flex flex-col justify-between">
            <div>
              <div className="w-9 h-9 rounded-lg bg-violet-400/[0.08] border border-violet-400/20 flex items-center justify-center mb-4">
                <UserCheck className="text-violet-400" size={16} />
              </div>
              <h3 className="text-sm font-semibold text-white mb-2">Rank Progression</h3>
              <div className="space-y-1 text-[11px] font-mono text-zinc-500">
                <div className="flex justify-between"><span className="text-zinc-400">Lv. 1 - 2</span><span>Beginner</span></div>
                <div className="flex justify-between"><span className="text-zinc-400">Lv. 3 - 5</span><span>Learner</span></div>
                <div className="flex justify-between"><span className="text-zinc-400">Lv. 6 - 9</span><span>Collaborator</span></div>
                <div className="flex justify-between"><span className="text-zinc-400">Lv. 10 - 14</span><span>Mentor</span></div>
                <div className="flex justify-between"><span className="text-pink-400">Lv. 15+</span><span className="text-pink-400">Skill Master</span></div>
              </div>
            </div>
            <div className="text-[10px] text-violet-400 font-mono mt-4 pt-3 border-t border-white/[0.04]">
              Elevate your rank for professional network authority.
            </div>
          </div>
        </div>

        {/* Verification banner */}
        <div className="bg-[#111113] border border-white/[0.05] rounded-xl p-4 flex gap-3 items-start">
          <Info className="text-cyan-400 shrink-0 mt-0.5" size={15} />
          <div className="space-y-1">
            <h4 className="text-[12px] font-semibold text-white">Trust & Authenticity Guard</h4>
            <p className="text-[11px] text-zinc-500 leading-relaxed">
              XP is mathematically computed in secure backend cloud triggers. Points are strictly tied to real learning exchanges verified by both partners through completed sessions. Trivial or spam actions will not yield progression benefits.
            </p>
          </div>
        </div>
      </motion.section>

      {/* ── Section 5: Trust & Safety ──────────────────────────────────────── */}
      <motion.section {...fadeUp(0.3)} className="grid md:grid-cols-2 gap-8 items-center">
        <div className="glass-card p-6 border-red-500/10 bg-red-950/[0.01] space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-red-500/[0.08] border border-red-500/20 flex items-center justify-center">
              <Shield className="text-red-400" size={14} />
            </div>
            <h3 className="text-sm font-semibold text-white">Professional Integrity Rules</h3>
          </div>
          <p className="text-[12px] text-zinc-500 leading-relaxed">
            SkillSwap is reserved strictly for collaborative learning, programming, design, and other professional exchanges. To preserve our premium environment, we implement automated filters and an active moderation team.
          </p>
          <div className="space-y-2 border-t border-white/[0.04] pt-3 text-[11px] font-mono text-zinc-500">
            <div className="flex gap-2">
              <AlertTriangle size={12} className="text-amber-400 shrink-0 mt-0.5" />
              <span><strong>Warnings:</strong> Issued automatically upon policy violations or validated spam reports.</span>
            </div>
            <div className="flex gap-2">
              <AlertTriangle size={12} className="text-red-400 shrink-0 mt-0.5" />
              <span><strong>Bans:</strong> Abusive behavior, persistent warnings, or fake session inputs lead to absolute banishment.</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <p className="section-label mb-1">Safety First</p>
          <h2 className="section-title">Trust & Moderation</h2>
          <p className="text-[13px] text-zinc-400 leading-relaxed">
            Need to request assistance? We provide live support and reporting forms. Our moderators review all exchange logs, session proof URLs, and message transcripts flags within 24 hours to enforce our community guidelines and protect active users.
          </p>
          <ul className="text-[12px] text-zinc-500 space-y-1.5 list-disc pl-4">
            <li>Submit issues instantly to admin directly from your profile interface</li>
            <li>Report suspicious users or inappropriate exchange solicitations</li>
            <li>Transparent evaluation process with clear notification warnings</li>
          </ul>
        </div>
      </motion.section>

      {/* ── Section 6: Quick Start Guide ────────────────────────────────────── */}
      <motion.section {...fadeUp(0.35)} className="space-y-6">
        <div>
          <p className="section-label mb-1">Onboarding Checklist</p>
          <h2 className="section-title">Your Quick Start Guide</h2>
          <p className="text-zinc-500 text-[13px] max-w-xl">
            Follow this simple pathway to become an active, high-level member of the SkillSwap community.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { title: 'Complete Profile', desc: 'Upload custom avatar photos and update your bio detailing your goals.', icon: CheckSquare, color: 'text-cyan-400 bg-cyan-400/[0.04]' },
            { title: 'Add Skills Offered', desc: 'List your skills with structured experience levels so learners can locate you.', icon: CheckSquare, color: 'text-violet-400 bg-violet-400/[0.04]' },
            { title: 'Send Swap Request', desc: 'Browse other developers or designers and propose a balanced swap request.', icon: CheckSquare, color: 'text-emerald-400 bg-emerald-400/[0.04]' },
            { title: 'Define the Contract', desc: 'Establish duration weeks and planned session numbers with your partner.', icon: CheckSquare, color: 'text-amber-400 bg-amber-400/[0.04]' },
            { title: 'Track Live Sessions', desc: 'Teach and study sequentially inside the shared active classroom window.', icon: CheckSquare, color: 'text-pink-400 bg-pink-400/[0.04]' },
            { title: 'Boost Learning XP', desc: 'Progress through ranks automatically, proving your verified learning status.', icon: CheckSquare, color: 'text-cyan-300 bg-cyan-300/[0.04]' },
          ].map((item, idx) => (
            <div key={item.title} className="glass-card p-5 border-white/[0.05] flex gap-3 items-start hover:border-white/[0.08] transition-all">
              <div className={`p-1.5 rounded-lg shrink-0 ${item.color}`}>
                <item.icon size={13} />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-mono text-zinc-600 block">STEP 0{idx + 1}</span>
                <h4 className="text-xs font-semibold text-white">{item.title}</h4>
                <p className="text-[11px] text-zinc-500 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.section>

      {/* ── Section 7: LinkedIn vs SkillSwap (Differentiator) ───────────────── */}
      <motion.section {...fadeUp(0.4)} className="space-y-6">
        <div>
          <p className="section-label mb-1">Our Philosophy</p>
          <h2 className="section-title">The SkillSwap Difference</h2>
          <p className="text-zinc-500 text-[13px] max-w-xl">
            Why use SkillSwap instead of traditional professional networks or passive online courses?
          </p>
        </div>

        <div className="glass-card overflow-hidden border-white/[0.06] divide-y divide-white/[0.06]">
          {/* Header */}
          <div className="grid grid-cols-2 bg-white/[0.01] p-4 font-display font-semibold text-sm">
            <div className="text-zinc-400 border-r border-white/[0.04] pr-4">LinkedIn / Traditional</div>
            <div className="text-cyan-400 pl-4">SkillSwap</div>
          </div>
          {/* Row 1 */}
          <div className="grid grid-cols-2 p-4 text-xs">
            <div className="text-zinc-500 border-r border-white/[0.04] pr-4 leading-relaxed">
              Passive networking and scrolling. Empty endorsements given without verifying actual collaborative work.
            </div>
            <div className="text-zinc-300 pl-4 leading-relaxed">
              Active learning transactions. Verification through structured, multi-session peer-to-peer agreements.
            </div>
          </div>
          {/* Row 2 */}
          <div className="grid grid-cols-2 p-4 text-xs">
            <div className="text-zinc-500 border-r border-white/[0.04] pr-4 leading-relaxed">
              Costly subscriptions, certs that are rarely scrutinized, and one-way marketing profiles.
            </div>
            <div className="text-zinc-300 pl-4 leading-relaxed">
              100% free swap framework where the primary currency is mutual expertise, documented repository links, and notes.
            </div>
          </div>
          {/* Row 3 */}
          <div className="grid grid-cols-2 p-4 text-xs">
            <div className="text-zinc-500 border-r border-white/[0.04] pr-4 leading-relaxed">
              Overwhelming noise, advertisements, and superficial connections.
            </div>
            <div className="text-zinc-300 pl-4 leading-relaxed">
              Highly aligned collaborative matching. Dedicated, zero-noise classroom workspace interface with active chat.
            </div>
          </div>
        </div>
      </motion.section>
    </div>
  );
};

export default Learn;
