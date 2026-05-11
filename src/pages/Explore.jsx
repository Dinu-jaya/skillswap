import { motion } from 'framer-motion';
import { Search, Code2, Palette, Brain, Video, Mic2, Layout, Camera, Music, Star, ChevronRight } from 'lucide-react';
import { PrimaryButton } from '../components/Button';
import Avatar from '../components/Avatar';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease: [0.25, 0.46, 0.45, 0.94] }
});

const Explore = () => {
  const categories = [
    { icon: Code2, name: 'Web Development', desc: 'React, Next.js, Backend, and more.', mentors: 1240 },
    { icon: Palette, name: 'UI/UX Design', desc: 'Figma, Prototyping, User Research.', mentors: 850 },
    { icon: Brain, name: 'Machine Learning', desc: 'Python, Neural Networks, AI.', mentors: 420 },
    { icon: Video, name: 'Video Editing', desc: 'Premiere Pro, After Effects, Davinci.', mentors: 310 },
    { icon: Mic2, name: 'Public Speaking', desc: 'Presentation skills, Storytelling.', mentors: 215 },
    { icon: Layout, name: 'Graphic Design', desc: 'Photoshop, Illustrator, Branding.', mentors: 560 },
    { icon: Camera, name: 'Photography', desc: 'Lighting, Editing, Composition.', mentors: 180 },
    { icon: Music, name: 'Music Production', desc: 'DAWs, Sound Design, Mixing.', mentors: 245 },
  ];

  const featuredMentors = [
    { 
      name: 'Sarah Chen', 
      skill: 'Senior React Developer', 
      rating: 4.9, 
      bio: 'Helping developers master modern frontend architectures and performance optimization.',
      avatar: 'girl1'
    },
    { 
      name: 'Marcus Thorne', 
      skill: 'Lead UI Designer', 
      rating: 5.0, 
      bio: 'Design system specialist with a passion for clean, accessible, and functional interfaces.',
      avatar: 'boy1'
    },
    { 
      name: 'Elena Rodriguez', 
      skill: 'Fullstack Architect', 
      rating: 4.8, 
      bio: 'Deep expertise in Node.js, GraphQL, and scaling distributed systems for global traffic.',
      avatar: 'girl2'
    }
  ];

  return (
    <div className="pt-32 pb-20 px-6 min-h-screen bg-[#09090b]">
      <div className="max-w-6xl mx-auto">
        {/* Hero Section */}
        <motion.div {...fadeUp()} className="text-center mb-16">
          <h1 className="hero-title mb-6">Explore Knowledge</h1>
          <p className="text-[17px] leading-relaxed text-zinc-400 mb-10 max-w-2xl mx-auto">
            Discover a world of peer-to-peer learning. Connect with experts across 350+ skills and start your collaborative journey today.
          </p>
          
          {/* Search Bar UI */}
          <div className="max-w-xl mx-auto relative group">
            <div className="absolute inset-0 bg-cyan-500/10 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative flex items-center bg-[#111113] border border-white/[0.08] rounded-2xl px-5 py-4 focus-within:border-cyan-400/40 transition-all">
              <Search className="text-zinc-500 mr-4" size={20} />
              <input 
                type="text" 
                placeholder="Search for skills, mentors, or topics..." 
                className="bg-transparent border-none outline-none text-white w-full text-[15px] placeholder:text-zinc-600"
              />
              <div className="hidden sm:flex items-center gap-2 px-2 py-1 rounded-md bg-white/[0.04] border border-white/[0.08] ml-4">
                <span className="text-[10px] font-bold text-zinc-500">⌘ K</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Categories Grid */}
        <motion.section {...fadeUp(0.1)} className="mb-24">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-semibold text-white font-display">Browse Categories</h2>
            <button className="text-[13px] font-medium text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1">
              View All <ChevronRight size={14} />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {categories.map((cat, i) => (
              <motion.div 
                key={cat.name}
                whileHover={{ y: -4 }}
                className="p-6 rounded-2xl border border-white/[0.06] bg-[#111113] hover:bg-white/[0.02] hover:border-white/[0.12] transition-all group cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <cat.icon size={20} className="text-cyan-400" />
                </div>
                <h3 className="text-[16px] font-medium text-white mb-2 font-display">{cat.name}</h3>
                <p className="text-[13px] text-zinc-500 mb-4 leading-relaxed">{cat.desc}</p>
                <p className="text-[11px] font-bold text-zinc-600 uppercase tracking-widest">{cat.mentors} Mentors</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Popular Mentors */}
        <motion.section {...fadeUp(0.2)}>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-semibold text-white font-display">Popular This Week</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredMentors.map((mentor, i) => (
              <div 
                key={mentor.name}
                className="bg-[#111113] border border-white/[0.06] p-6 rounded-2xl flex flex-col group hover:border-white/[0.12] transition-colors"
              >
                <div className="flex items-center gap-4 mb-4">
                  <Avatar 
                    avatarId={mentor.avatar} 
                    size={48} 
                    className="rounded-full bg-zinc-800 border border-white/10 group-hover:scale-105 transition-transform" 
                  />
                  <div>
                    <p className="text-[15px] font-medium text-white font-display">{mentor.name}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <Star size={12} className="text-amber-400 fill-amber-400" />
                      <span className="text-[12px] font-medium text-zinc-400">{mentor.rating}</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3 mb-6 flex-1">
                  <div>
                    <p className="text-[12px] font-bold text-cyan-400/80 uppercase tracking-widest mb-1">{mentor.skill}</p>
                    <p className="text-[13px] text-zinc-400 leading-relaxed">{mentor.bio}</p>
                  </div>
                </div>

                <PrimaryButton className="w-full py-2.5 rounded-xl bg-white text-zinc-950 text-[13px] hover:bg-zinc-200">
                  Connect
                </PrimaryButton>
              </div>
            ))}
          </div>
        </motion.section>
      </div>
    </div>
  );
};

export default Explore;
