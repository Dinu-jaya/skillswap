import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';

const TrendingSkillCard = ({ skill, delay = 0 }) => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      onClick={() => navigate('/browse')}
      className="group cursor-pointer p-5 rounded-xl border border-white/[0.06] bg-[#111113] hover:border-white/[0.11] hover:bg-[#141416] transition-all duration-200"
    >
      <div className="flex items-start justify-between mb-3">
        <span className="section-label">{skill.category}</span>
        <ArrowUpRight
          size={14}
          className="text-zinc-700 group-hover:text-cyan-400 transition-colors duration-200 mt-0.5"
        />
      </div>

      <h3 className="text-[15px] font-semibold text-zinc-100 mb-1 group-hover:text-white transition-colors font-display">
        {skill.name}
      </h3>

      <div className="flex flex-wrap gap-1.5 mb-4">
        {skill.tags?.map((tag) => (
          <span
            key={tag}
            className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-white/[0.04] text-zinc-500 border border-white/[0.05]"
          >
            {tag}
          </span>
        ))}
      </div>

      <p className="muted-text !text-[12px]">
        <span className="text-zinc-300 font-semibold">{skill.requests}</span> active requests
      </p>
    </motion.div>
  );
};

export default TrendingSkillCard;
