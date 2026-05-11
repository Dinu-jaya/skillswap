import { motion } from 'framer-motion';
import { Search, Users, MessageSquare, Zap, ArrowRight, CheckCircle2 } from 'lucide-react';
import { PrimaryButton } from '../components/Button';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease: [0.25, 0.46, 0.45, 0.94] }
});

const HowItWorks = () => {
  const steps = [
    {
      icon: Search,
      title: '1. Discover Skills',
      desc: 'Browse our extensive directory of mentors or use the search to find the exact skill you want to learn. From coding to creative arts, the possibilities are endless.',
      color: 'bg-cyan-500/10 text-cyan-400'
    },
    {
      icon: Users,
      title: '2. Connect with Learners',
      desc: 'Found a skill you like? Propose a swap. Offer to teach something you’re an expert in. Our platform facilitates mutually beneficial connections.',
      color: 'bg-violet-500/10 text-violet-400'
    },
    {
      icon: MessageSquare,
      title: '3. Exchange Knowledge',
      desc: 'Once a swap is accepted, jump into our secure workspace. Use video calls, chat, and shared docs to collaborate in real-time.',
      color: 'bg-emerald-500/10 text-emerald-400'
    },
    {
      icon: Zap,
      title: '4. Grow Together',
      desc: 'Complete your sessions and track your progress. Earn reputation points, unlock new mentor levels, and build your professional network.',
      color: 'bg-amber-500/10 text-amber-400'
    }
  ];

  return (
    <div className="pt-32 pb-20 px-6 min-h-screen bg-[#09090b]">
      <div className="max-w-6xl mx-auto">
        {/* Hero Section */}
        <motion.div {...fadeUp()} className="text-center mb-24">
          <h1 className="hero-title mb-6">How SkillSwap Works</h1>
          <p className="text-[17px] leading-relaxed text-zinc-400 mb-10 max-w-2xl mx-auto">
            A radically simple way to expand your knowledge base without spending a dime. Learn from the best by teaching what you know.
          </p>
        </motion.div>

        {/* Steps Flow */}
        <div className="relative mb-32">
          {/* Vertical line for mobile, horizontal for desktop (optional) */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-px bg-white/[0.06] -translate-y-1/2 z-0" />
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 relative z-10">
            {steps.map((step, i) => (
              <motion.div 
                key={step.title}
                {...fadeUp(i * 0.1)}
                className="bg-[#111113] border border-white/[0.06] p-8 rounded-2xl relative group hover:border-white/[0.12] transition-colors"
              >
                <div className={`w-12 h-12 rounded-xl ${step.color} border border-current/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <step.icon size={24} />
                </div>
                <h3 className="text-xl font-semibold text-white mb-4 font-display">{step.title}</h3>
                <p className="text-[14px] leading-relaxed text-zinc-400">{step.desc}</p>
                
                {i < steps.length - 1 && (
                  <div className="hidden lg:flex absolute top-1/2 -right-4 -translate-y-1/2 w-8 h-8 rounded-full bg-[#09090b] border border-white/[0.06] items-center justify-center text-zinc-500 z-20">
                    <ArrowRight size={14} />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Values/Features Section */}
        <motion.div {...fadeUp(0.4)} className="grid md:grid-cols-2 gap-16 items-center mb-32">
          <div>
            <h2 className="text-3xl font-semibold text-white mb-6 font-display">Why choose Peer-to-Peer?</h2>
            <div className="space-y-6">
              {[
                { title: 'Learn by Doing', desc: 'Active learning through collaboration is 10x more effective than passive video courses.' },
                { title: 'Zero Cost', desc: 'No subscriptions or hidden fees. Your currency is your knowledge.' },
                { title: 'Networking', desc: 'Build real relationships with other professionals in your field.' }
              ].map((item, i) => (
                <div key={i} className="flex gap-4">
                  <div className="mt-1">
                    <CheckCircle2 size={18} className="text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="text-[15px] font-medium text-white mb-1">{item.title}</h4>
                    <p className="text-[14px] text-zinc-500">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="absolute inset-0 bg-cyan-500/20 blur-[100px] rounded-full" />
            <div className="relative p-1 rounded-3xl bg-gradient-to-br from-white/[0.08] to-transparent">
              <div className="bg-[#111113] rounded-[22px] overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=800" 
                  alt="Collaboration" 
                  className="w-full h-auto opacity-80"
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Final CTA Banner */}
        <motion.div 
          {...fadeUp(0.5)}
          className="relative rounded-3xl overflow-hidden p-12 text-center"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/10 to-violet-500/10" />
          <div className="absolute inset-0 border border-white/[0.08] rounded-3xl" />
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-semibold text-white mb-6 font-display">Start Your Skill Journey Today</h2>
            <p className="text-zinc-400 mb-10 max-w-xl mx-auto text-[17px]">
              Join our growing community of thousands of learners. Create your profile and find your first mentor in minutes.
            </p>
            <PrimaryButton to="/signup" className="px-10 py-4 text-[15px]">
              Join SkillSwap Now
            </PrimaryButton>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default HowItWorks;
