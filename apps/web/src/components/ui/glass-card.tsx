"use client";

import * as React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

export interface GlassCardProps extends HTMLMotionProps<"div"> {
  variant?: "light" | "dark" | "default";
  glow?: boolean;
}

export const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, variant = "default", glow, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        whileHover={glow ? { scale: 1.01 } : undefined}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className={cn(
          "rounded-2xl border bg-card/40 backdrop-blur-xl p-6 shadow-glass relative overflow-hidden",
          variant === "light" && "bg-white/5 border-white/10",
          variant === "dark" && "bg-black/35 border-white/5",
          glow && "hover:shadow-glow-hover transition-shadow duration-300",
          className
        )}
        {...props}
      />
    );
  }
);
GlassCard.displayName = "GlassCard";
