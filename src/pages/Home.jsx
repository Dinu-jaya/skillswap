import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Search, Sparkles, Code2, MessageSquare, CheckCircle2, ChevronRight } from 'lucide-react';
import { PrimaryButton, SecondaryButton } from '../components/Button';
import Avatar from '../components/Avatar';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-100px" },
  transition: { duration: 0.6, delay, ease: [0.25, 0.46, 0.45, 0.94] }
});

const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

export default function Home() {
  return (
    <div className="bg-[#09090b] min-h-screen text-zinc-300 font-sans selection:bg-cyan-500/30">
      
      {/* 1. HERO SECTION */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden px-6">
        {/* Subtle background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-cyan-500/10 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          
          {/* Left: Text & CTAs */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="max-w-xl z-10"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] mb-6">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              <span className="small-label !text-zinc-400">Now in public beta</span>
            </div>
            
            <h1 className="hero-title mb-6">
              Learn anything.<br />
              <span className="text-zinc-500">By teaching what you know.</span>
            </h1>
            
            <p className="text-[17px] leading-relaxed text-zinc-400 mb-8 max-w-md">
              Join a curated community of builders, designers, and creators exchanging skills peer-to-peer. No courses, just real collaborative learning.
            </p>
            
            <div className="flex flex-wrap items-center gap-4">
              <PrimaryButton to="/signup" className="group px-6 py-3">
                Start exchanging
                <ArrowUpRight size={16} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </PrimaryButton>
              <SecondaryButton to="/browse" className="px-6 py-3">
                <Search size={16} className="text-zinc-400" />
                Browse skills
              </SecondaryButton>
            </div>
          </motion.div>

          {/* Right: Realistic Preview Panel */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="relative z-10 lg:ml-auto w-full max-w-[500px]"
          >
            {/* The "App Window" */}
            <div className="rounded-2xl border border-white/[0.08] bg-[#111113] p-4 shadow-2xl overflow-hidden relative">
              {/* Header */}
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/[0.04]">
                <p className="section-label">Active Session</p>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[11px] text-zinc-500 font-medium">Live</span>
                </div>
              </div>
              
              {/* Fake Video Call / Collab area */}
              <div className="aspect-video rounded-xl bg-[#09090b] border border-white/[0.04] mb-4 relative flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-900/40 via-[#09090b] to-[#09090b]" />
                <div className="text-center z-10">
                  <div className="w-12 h-12 rounded-full bg-cyan-400/10 border border-cyan-400/20 mx-auto flex items-center justify-center mb-2">
                    <Code2 size={20} className="text-cyan-400" />
                  </div>
                  <p className="text-[13px] text-zinc-300 font-medium">Pair Programming: React Hooks</p>
                  <p className="text-[11px] text-zinc-500">Elena & Marcus</p>
                </div>
              </div>

              {/* Chat / Interaction snippet */}
              <div className="space-y-3">
                <div className="flex gap-3 items-start">
                  <Avatar avatarId="girl2" size={28} className="rounded-full bg-zinc-800 border border-white/10" />
                  <div className="bg-white/[0.04] rounded-lg rounded-tl-none px-3 py-2 border border-white/[0.02]">
                    <p className="text-[12px] text-zinc-300">"So `useEffect` runs after every render by default?"</p>
                  </div>
                </div>
                <div className="flex gap-3 items-start flex-row-reverse">
                  <Avatar avatarId="boy1" size={28} className="rounded-full bg-zinc-800 border border-white/10" />
                  <div className="bg-cyan-400/10 rounded-lg rounded-tr-none px-3 py-2 border border-cyan-400/20">
                    <p className="text-[12px] text-cyan-50">"Exactly! Unless you pass a dependency array."</p>
                  </div>
                </div>
              </div>
            </div>
            

          </motion.div>
          
        </div>
      </section>

      {/* 2. TRUST SECTION */}
      <section className="border-y border-white/[0.04] bg-white/[0.01]">
        <div className="max-w-6xl mx-auto px-6 py-12 md:py-16">
          <p className="text-center section-label mb-8">Trusted by learners worldwide</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 text-center">
            {[
              { value: "4.8k+", label: "Active Learners" },
              { value: "12k+", label: "Hours Exchanged" },
              { value: "350+", label: "Skills Available" },
              { value: "98%", label: "Match Success" }
            ].map((stat, i) => (
              <motion.div key={i} {...fadeUp(i * 0.1)}>
                <p className="text-3xl md:text-4xl font-semibold text-white mb-2 font-display">{stat.value}</p>
                <p className="muted-text">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. HOW IT WORKS */}
      <section id="how-it-works" className="section-padding px-6 relative">
        <div className="max-w-6xl mx-auto">
          <motion.div className="text-center max-w-2xl mx-auto mb-16" {...fadeUp()}>
            <h2 className="text-3xl md:text-4xl font-semibold text-white tracking-tight mb-4 font-display">
              How SkillSwap works
            </h2>
            <p className="body-text !text-[16px]">A radically simple way to expand your knowledge base without spending a dime.</p>
          </motion.div>

          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
            className="grid md:grid-cols-3 gap-8"
          >
            {[
              { 
                icon: Search, 
                title: "Discover Skills", 
                desc: "Search our directory for the exact skill you need, from Advanced Figma to Next.js routing.",
                tag: "Step 1"
              },
              { 
                icon: ArrowUpRight, 
                title: "Offer a Trade", 
                desc: "Send a request proposing what you can teach in return. Mutually beneficial learning.",
                tag: "Step 2"
              },
              { 
                icon: MessageSquare, 
                title: "Learn Together", 
                desc: "Jump into a chat, schedule a video call, and start exchanging knowledge instantly.",
                tag: "Step 3"
              }
            ].map((step, i) => (
              <motion.div 
                key={i}
                variants={itemVariants}
                className="bg-[#111113] border border-white/[0.06] rounded-2xl p-8 hover:bg-white/[0.02] transition-colors"
              >
                <p className="text-[11px] font-medium text-cyan-400 mb-6 uppercase tracking-wider">{step.tag}</p>
                <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mb-6">
                  <step.icon size={18} className="text-zinc-300" />
                </div>
                <h3 style={{ fontFamily: "'DM Sans', sans-serif" }} className="text-xl font-medium text-white mb-3">{step.title}</h3>
                <p className="text-[14px] leading-relaxed text-zinc-400">{step.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 4. FEATURED COMMUNITY */}
      <section id="community" className="section-padding px-6 border-t border-white/[0.04] bg-[#0c0c0e]">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <motion.div className="max-w-xl" {...fadeUp()}>
              <p className="section-label mb-3">The Network</p>
              <h2 className="text-3xl md:text-4xl font-semibold text-white tracking-tight font-display">
                Meet your future mentors.
              </h2>
            </motion.div>
            <motion.div {...fadeUp(0.2)}>
              <Link to="/browse" className="inline-flex items-center gap-2 text-[13px] font-medium text-cyan-400 hover:text-cyan-300 transition-colors">
                View directory <ChevronRight size={14} />
              </Link>
            </motion.div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                name: "Sarah Jenkins",
                role: "Senior Designer",
                avatar: "girl1",
                offers: "UI/UX, Figma",
                wants: "React, CSS",
              },
              {
                name: "David Chen",
                role: "Fullstack Dev",
                avatar: "boy2",
                offers: "Node.js, Postgres",
                wants: "Marketing, SEO",
              },
              {
                name: "Elena Rodriguez",
                role: "Product Manager",
                avatar: "girl2",
                offers: "Product Strategy",
                wants: "Data Analysis",
              }
            ].map((user, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-[#111113] border border-white/[0.06] p-6 rounded-xl flex flex-col group"
              >
                <div className="flex items-center gap-3 mb-4">
                  <Avatar avatarId={user.avatar} size={40} className="rounded-full bg-zinc-800 border border-white/10" />
                  <div>
                    <p className="text-[15px] font-medium text-white font-display">{user.name}</p>
                    <p className="muted-text !text-[12px]">{user.role}</p>
                  </div>
                </div>
                
                <div className="space-y-3 mb-5 flex-1">
                  <div>
                    <p className="small-label mb-1">Offers</p>
                    <p className="text-[13px] text-zinc-300">{user.offers}</p>
                  </div>
                  <div>
                    <p className="small-label mb-1">Wants to learn</p>
                    <p className="text-[13px] text-zinc-300">{user.wants}</p>
                  </div>
                </div>

                <div className="w-full text-center py-2.5 rounded-lg bg-white/[0.03] border border-white/[0.05] text-[12px] font-medium text-zinc-400 group-hover:bg-white/[0.06] group-hover:text-white transition-all cursor-pointer">
                  View Profile
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. TESTIMONIALS */}
      <section className="section-padding px-6 border-t border-white/[0.04]">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div {...fadeUp()} className="mb-12">
            <Sparkles size={24} className="text-violet-400 mx-auto mb-6" />
            <h2 style={{ fontFamily: "'DM Sans', sans-serif" }} className="text-2xl md:text-3xl font-medium text-white leading-relaxed">
              "I taught someone the basics of Next.js, and in return, they helped me redesign my entire portfolio in Figma. It's the most high-leverage learning I've ever experienced."
            </h2>
          </motion.div>
          <motion.div {...fadeUp(0.2)} className="flex items-center justify-center gap-3">
            <Avatar avatarId="boy3" size={32} className="rounded-full bg-zinc-800 border border-white/10" />
            <div className="text-left">
              <p className="text-[14px] font-medium text-white">Tom Nguyen</p>
              <p className="muted-text !text-[12px]">Frontend Engineer</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 6. FINAL CTA */}
      <section className="section-padding px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-cyan-900/10 pointer-events-none" />
        
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <motion.div {...fadeUp()}>
            <h2 className="hero-title !text-4xl md:!text-5xl mb-6">
              Ready to start learning?
            </h2>
            <p className="text-[17px] text-zinc-400 mb-10 max-w-xl mx-auto">
              Join thousands of creators actively exchanging skills. Create your profile in minutes and find your first mentor today.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <PrimaryButton 
                to="/signup" 
                className="w-full sm:w-auto px-8 py-3.5"
              >
                Create free account
              </PrimaryButton>
            </div>
            <p className="mt-6 text-[12px] text-zinc-500">No credit card required. Free forever.</p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.04] py-8 px-6 text-center">
        <p className="text-[13px] text-zinc-600">© 2024 SkillSwap. A conceptual redesign.</p>
      </footer>
    </div>
  );
}
