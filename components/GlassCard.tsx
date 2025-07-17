import { motion } from "framer-motion";
import React from "react";

type MotionDivProps = React.ComponentProps<typeof motion.div>;
type GlassCardProps = {
  children: React.ReactNode;
  className?: string;
} & Omit<MotionDivProps, "className" | "children">;

const GlassCard = ({ children, className = "", ...props }: GlassCardProps) => (
  <motion.div
    className={`backdrop-blur-md bg-white/80 dark:bg-slate-900/80 border border-indigo-100 dark:border-slate-700 rounded-2xl shadow-xl dark:shadow-slate-900/30 p-6 sm:p-8 ${className}`}
    {...props}
  >
    {children}
  </motion.div>
);

export default GlassCard;
