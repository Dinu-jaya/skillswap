import { motion } from 'framer-motion';

const typeColors = {
  exchange: 'bg-cyan-400',
  badge: 'bg-amber-400',
  skill: 'bg-violet-400',
  connect: 'bg-emerald-400',
};

const ActivityTimeline = ({ activities }) => {
  return (
    <div className="relative pl-4">
      {/* Vertical line */}
      <div className="absolute left-[7px] top-0 bottom-0 w-px bg-white/[0.06]" />

      <div className="space-y-5">
        {activities.map((activity, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35, delay: index * 0.08 }}
            className="relative flex items-start gap-3"
          >
            {/* Dot */}
            <div
              className={`absolute -left-4 top-1.5 w-[7px] h-[7px] rounded-full shrink-0 ${
                typeColors[activity.type] || 'bg-zinc-600'
              }`}
            />

            {/* Content */}
            <div className="min-w-0">
              <p className="text-[13px] text-zinc-300 leading-snug">
                {activity.action}{' '}
                <span className="text-white font-medium">{activity.target}</span>
              </p>
              <time className="small-label !text-[10px] !normal-case !tracking-normal mt-0.5 block">{activity.time}</time>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ActivityTimeline;
