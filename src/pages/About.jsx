import { motion } from 'framer-motion';
import { Target, Eye, Heart, TrendingUp, Users, Handshake, Infinity as InfinityIcon, Zap } from 'lucide-react';
import Avatar from '../components/Avatar';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease: [0.25, 0.46, 0.45, 0.94] }
});

const About = () => {
  const team = [
    { name: 'Dr. Sarah Mitchell', role: 'Founder & CEO', bio: 'Former ed-tech researcher with a vision for decentralized peer-to-peer learning networks.', avatar: 'girl1' },
    { name: 'David Kojo', role: 'CTO', bio: 'Systems architect specialized in real-time collaborative environments and secure data exchange.', avatar: 'boy1' },
    { name: 'Elena Vance', role: 'Head of Community', bio: 'Expert in community building and fostering engagement in digital-first educational platforms.', avatar: 'girl2' },
  ];

  const values = [
    { title: 'Collaboration', desc: 'We believe that the best learning happens when we work together toward common goals.', icon: Handshake },
    { title: 'Accessibility', desc: 'Knowledge should be available to everyone, regardless of their background or financial status.', icon: InfinityIcon },
    { title: 'Growth', desc: 'We foster an environment where continuous personal and professional development is the norm.', icon: TrendingUp },
    { title: 'Peer Learning', desc: 'Everyone has something to teach and something to learn. We facilitate that exchange.', icon: Users },
  ];

  return (
    <div className="pt-32 pb-20 px-6 min-h-screen bg-[#09090b]">
      <div className="max-w-6xl mx-auto">
        {/* Hero Section */}
        <motion.div {...fadeUp()} className="text-center mb-24">
          <h1 className="hero-title mb-6">About SkillSwap</h1>
          <p className="text-[17px] leading-relaxed text-zinc-400 mb-10 max-w-2xl mx-auto">
            Redefining education through direct, peer-to-peer knowledge exchange. No gatekeepers, just real people helping each other grow.
          </p>
        </motion.div>

        {/* Mission & Vision */}
        <div className="grid md:grid-cols-2 gap-12 mb-32">
          <motion.div {...fadeUp(0.1)} className="p-10 rounded-3xl border border-white/[0.06] bg-[#111113] relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
              <Target size={80} className="text-cyan-400" />
            </div>
            <h2 className="text-2xl font-semibold text-white mb-4 font-display">Our Mission</h2>
            <p className="text-[15px] leading-relaxed text-zinc-400">
              To democratize access to high-quality mentorship by creating a platform where expertise is the primary currency. We aim to break down the barriers of traditional education and foster a global culture of shared knowledge.
            </p>
          </motion.div>
          <motion.div {...fadeUp(0.2)} className="p-10 rounded-3xl border border-white/[0.06] bg-[#111113] relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
              <Eye size={80} className="text-violet-400" />
            </div>
            <h2 className="text-2xl font-semibold text-white mb-4 font-display">Our Vision</h2>
            <p className="text-[15px] leading-relaxed text-zinc-400">
              A world where every individual has the power to learn any skill they desire from a peer, and where teaching others is recognized as one of the most valuable contributions one can make to society.
            </p>
          </motion.div>
        </div>

        {/* Values Grid */}
        <motion.section {...fadeUp(0.3)} className="mb-32 text-center">
          <h2 className="text-3xl font-semibold text-white mb-12 font-display">Our Core Values</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v, i) => (
              <div key={v.title} className="p-8 rounded-2xl border border-white/[0.06] bg-[#111113] hover:border-white/[0.12] transition-colors">
                <div className="w-12 h-12 rounded-xl bg-white/[0.04] flex items-center justify-center mx-auto mb-6">
                  <v.icon size={24} className="text-zinc-300" />
                </div>
                <h3 className="text-[17px] font-medium text-white mb-3 font-display">{v.title}</h3>
                <p className="text-[13px] text-zinc-500 leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Team Section */}
        <motion.section {...fadeUp(0.4)} className="mb-32">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-semibold text-white mb-4 font-display">Meet the Team</h2>
            <p className="text-zinc-500 text-[15px]">The builders behind the platform.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((member, i) => (
              <div key={member.name} className="group">
                <div className="relative mb-6 rounded-2xl overflow-hidden aspect-square grayscale group-hover:grayscale-0 transition-all duration-500">
                  <Avatar 
                    avatarId={member.avatar} 
                    size={350} 
                    className="w-full h-full object-cover bg-zinc-800"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-1 font-display">{member.name}</h3>
                <p className="text-[13px] text-cyan-400 font-medium mb-3 uppercase tracking-wider">{member.role}</p>
                <p className="text-[14px] text-zinc-500 leading-relaxed">{member.bio}</p>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Why Exist Section */}
        <motion.section {...fadeUp(0.5)} className="mb-32 bg-white/[0.01] border border-white/[0.04] rounded-3xl p-12 md:p-16">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-semibold text-white mb-8 font-display">Why SkillSwap Exists</h2>
            <p className="text-[16px] text-zinc-400 leading-relaxed mb-6">
              In an era where information is abundant but true mentorship is scarce, SkillSwap bridges the gap. We believe that traditional educational models often fail to capture the nuance of practical expertise.
            </p>
            <p className="text-[16px] text-zinc-400 leading-relaxed">
              By facilitating direct peer-to-peer connections, we enable a more agile, relevant, and human-centric way of learning that keeps pace with the rapidly evolving global landscape.
            </p>
          </div>
        </motion.section>

        {/* Final CTA */}
        <motion.div {...fadeUp(0.6)} className="relative rounded-3xl overflow-hidden py-20 px-8 text-center bg-[#111113] border border-white/[0.08]">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-cyan-500/10 blur-[120px] rounded-full pointer-events-none" />
          <h2 className="text-3xl md:text-5xl font-semibold text-white mb-8 font-display tracking-tight">Ready to shape the future of learning?</h2>
          <button className="px-10 py-4 rounded-full bg-cyan-400 text-zinc-950 font-bold text-[15px] hover:bg-cyan-300 transition-colors shadow-[0_0_20px_rgba(34,211,238,0.3)]">
            Join the Movement
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default About;
