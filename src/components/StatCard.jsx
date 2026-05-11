import { motion } from 'framer-motion';

const StatCard = ({ label, value, icon: Icon, colorClass, bgClass }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-[#111113] px-6 py-5 flex flex-col gap-1 cursor-default group hover:bg-[#141416] transition-colors"
    >
      <div className={`w-7 h-7 rounded-lg flex items-center justify-center mb-2 ${bgClass} group-hover:scale-105 transition-transform duration-200`}>
        <Icon className={`w-3.5 h-3.5 ${colorClass}`} />
      </div>
      <p className="text-2xl font-semibold text-white tracking-tight font-display">
        {value}
      </p>
      <p className="muted-text !text-[12px]">{label}</p>
    </motion.div>
  );
};

export default StatCard;
