"use client";

import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect } from "react";

interface AnimatedCounterProps {
  from: number;
  to: number;
  duration?: number;
  suffix?: string;
  className?: string;
}

export default function AnimatedCounter({ 
  from, 
  to, 
  duration = 2, 
  suffix = "", 
  className = "" 
}: AnimatedCounterProps) {
  const count = useMotionValue(from);
  const rounded = useTransform(count, (latest) => {
    // Format numbers with commas for thousands
    const formatted = Math.round(latest).toLocaleString();
    return formatted + suffix;
  });

  useEffect(() => {
    const controls = animate(count, to, {
      duration,
      ease: "easeOut",
      delay: 0, // Start immediately when in view
    });

    return controls.stop;
  }, [count, to, duration]);

  return (
    <motion.div 
      className={className}
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ amount: 0.5, once: true }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <motion.span>{rounded}</motion.span>
    </motion.div>
  );
}
