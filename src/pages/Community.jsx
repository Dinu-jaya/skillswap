import { motion } from 'framer-motion';
import { Users, BookOpen, Video, Globe, Star, Calendar, MapPin, ChevronRight } from 'lucide-react';
import Avatar from '../components/Avatar';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease: [0.25, 0.46, 0.45, 0.94] }
});

const Community = () => {
  const stats = [
    { label: 'Active Members', value: '45,000+', icon: Users, color: 'text-cyan-400' },
    { label: 'Skills Shared', value: '12,500+', icon: BookOpen, color: 'text-violet-400' },
    { label: 'Sessions Completed', value: '150,000+', icon: Video, color: 'text-emerald-400' },
    { label: 'Countries Reached', value: '85+', icon: Globe, color: 'text-amber-400' },
  ];

  const testimonials = [
    {
      name: 'Alex Rivera',
      role: 'Fullstack Developer',
      content: 'I swapped my Node.js knowledge for Figma skills. It was a game-changer for my side projects. The community here is incredibly supportive.',
      rating: 5,
      avatar: 'boy2'
    },
    {
      name: 'Priya Sharma',
      role: 'UI/UX Designer',
      content: 'SkillSwap allowed me to learn React from a pro while I taught them about design systems. Best way to bridge the dev-design gap.',
      rating: 5,
      avatar: 'girl3'
    },
    {
      name: 'Jordan Lee',
      role: 'Content Creator',
      content: 'Finding a mentor for video editing was so easy. I taught public speaking in return, and we both gained valuable new skills.',
      rating: 4,
      avatar: 'boy3'
    }
  ];

  const events = [
    {
      title: 'Weekly Design Jam',
      date: 'May 15, 2024 • 6:00 PM',
      attendees: 124,
      desc: 'Join us for a collaborative design session where we tackle real-world UI challenges in Figma.',
      type: 'Workshop'
    },
    {
      title: 'Coding Sprint Night',
      date: 'May 18, 2024 • 8:00 PM',
      attendees: 89,
      desc: 'A high-energy session for developers to pair up and solve complex algorithm problems together.',
      type: 'Meetup'
    },
    {
      title: 'AI Study Circle',
      date: 'May 20, 2024 • 5:00 PM',
      attendees: 56,
      desc: 'Dive deep into the latest LLM research and discuss practical applications for your projects.',
      type: 'Study Group'
    }
  ];

  return (
    <div className="pt-32 pb-20 px-6 min-h-screen bg-[#09090b]">
      <div className="max-w-6xl mx-auto">
        {/* Hero Section */}
        <motion.div {...fadeUp()} className="text-center mb-24">
          <h1 className="hero-title mb-6">Our Community</h1>
          <p className="text-[17px] leading-relaxed text-zinc-400 mb-10 max-w-2xl mx-auto">
            Meet the passionate learners and mentors building the future of peer-to-peer education.
          </p>
        </motion.div>

        {/* Stats Section */}
        <motion.section {...fadeUp(0.1)} className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-32">
          {stats.map((stat, i) => (
            <div key={stat.label} className="bg-[#111113] border border-white/[0.06] p-8 rounded-2xl text-center group hover:border-white/[0.12] transition-colors">
              <stat.icon size={24} className={`${stat.color} mx-auto mb-4 group-hover:scale-110 transition-transform`} />
              <p className="text-3xl font-bold text-white mb-2 font-display">{stat.value}</p>
              <p className="text-[13px] font-medium text-zinc-500 uppercase tracking-widest">{stat.label}</p>
            </div>
          ))}
        </motion.section>

        {/* Testimonials */}
        <motion.section {...fadeUp(0.2)} className="mb-32">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-semibold text-white font-display mb-4">Stories from the Community</h2>
            <p className="text-zinc-500 text-[15px]">See how SkillSwap is changing the way people learn.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div key={t.name} className="bg-[#111113] border border-white/[0.06] p-8 rounded-2xl flex flex-col hover:bg-white/[0.02] transition-colors">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} className={i < t.rating ? 'text-amber-400 fill-amber-400' : 'text-zinc-700'} />
                  ))}
                </div>
                <p className="text-[14px] leading-relaxed text-zinc-300 mb-8 flex-1 italic">"{t.content}"</p>
                <div className="flex items-center gap-4">
                  <Avatar avatarId={t.avatar} size={40} className="rounded-full bg-zinc-800 border border-white/10" />
                  <div>
                    <p className="text-[14px] font-medium text-white">{t.name}</p>
                    <p className="text-[12px] text-zinc-500">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Community Events */}
        <motion.section {...fadeUp(0.3)} className="mb-20">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-2xl font-semibold text-white font-display mb-2">Community Events</h2>
              <p className="text-zinc-500 text-[14px]">Join live sessions, workshops, and meetups.</p>
            </div>
            <button className="text-[13px] font-medium text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1">
              All Events <ChevronRight size={14} />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {events.map((event, i) => (
              <div key={event.title} className="bg-[#111113] border border-white/[0.06] p-6 rounded-2xl group hover:border-white/[0.12] transition-colors relative overflow-hidden">
                <div className="absolute top-0 right-0 p-3">
                  <span className="text-[10px] font-bold text-cyan-400 bg-cyan-400/10 px-2 py-1 rounded-md border border-cyan-400/20 uppercase tracking-widest">{event.type}</span>
                </div>
                <div className="flex items-center gap-2 text-zinc-500 text-[12px] mb-4">
                  <Calendar size={14} />
                  <span>{event.date}</span>
                </div>
                <h3 className="text-[17px] font-semibold text-white mb-3 font-display">{event.title}</h3>
                <p className="text-[13px] text-zinc-400 mb-6 leading-relaxed">{event.desc}</p>
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/[0.04]">
                  <div className="flex items-center gap-2">
                    <Users size={14} className="text-zinc-500" />
                    <span className="text-[12px] text-zinc-500">{event.attendees} attending</span>
                  </div>
                  <button className="text-[12px] font-medium text-white hover:text-cyan-400 transition-colors">Join Event</button>
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Community Banner */}
        <motion.div {...fadeUp(0.4)} className="bg-gradient-to-r from-violet-500/10 to-cyan-500/10 border border-white/[0.06] rounded-3xl p-12 text-center">
          <h2 className="text-2xl font-semibold text-white mb-4 font-display">Ready to join the collective?</h2>
          <p className="text-zinc-400 mb-8 max-w-lg mx-auto text-[15px]">Share your expertise, learn something new, and be part of a community that values growth and collaboration.</p>
          <button className="px-8 py-3 rounded-full bg-white text-zinc-950 font-semibold text-[14px] hover:bg-zinc-200 transition-colors">Start Your Journey</button>
        </motion.div>
      </div>
    </div>
  );
};

export default Community;
