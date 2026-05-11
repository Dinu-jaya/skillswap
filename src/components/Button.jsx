import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const buttonBase = "inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-400/40 disabled:opacity-50 disabled:cursor-not-allowed text-[13px] sm:text-[14px]";

const MotionLink = motion(Link);

export const PrimaryButton = ({ children, to, className = '', ...props }) => {
  const styles = `${buttonBase} bg-white text-zinc-950 hover:bg-zinc-200 ${className}`;
  
  if (to) {
    return (
      <MotionLink
        to={to}
        whileHover={{ scale: 0.98 }}
        whileTap={{ scale: 0.96 }}
        className={styles}
        {...props}
      >
        {children}
      </MotionLink>
    );
  }

  return (
    <motion.button
      whileHover={{ scale: 0.98 }}
      whileTap={{ scale: 0.96 }}
      className={styles}
      {...props}
    >
      {children}
    </motion.button>
  );
};

export const SecondaryButton = ({ children, to, className = '', ...props }) => {
  const styles = `${buttonBase} bg-white/[0.04] text-white border border-white/[0.08] hover:bg-white/[0.08] ${className}`;

  if (to) {
    return (
      <MotionLink
        to={to}
        whileHover={{ scale: 0.98 }}
        whileTap={{ scale: 0.96 }}
        className={styles}
        {...props}
      >
        {children}
      </MotionLink>
    );
  }

  return (
    <motion.button
      whileHover={{ scale: 0.98 }}
      whileTap={{ scale: 0.96 }}
      className={styles}
      {...props}
    >
      {children}
    </motion.button>
  );
};
