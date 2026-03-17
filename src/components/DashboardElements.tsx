import React from 'react';
import { motion } from 'motion/react';
import { cn } from '@/src/lib/utils';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
  onClick?: () => void;
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, className, hoverable = true, onClick }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={onClick}
      className={cn(
        "glass-card p-6",
        hoverable && "glass-card-hover",
        onClick && "cursor-pointer",
        className
      )}
    >
      {children}
    </motion.div>
  );
};

interface StatTileProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: 'emerald' | 'indigo' | 'amber' | 'rose';
}

export const StatTile: React.FC<StatTileProps> = ({ label, value, icon, trend, color = 'emerald' }) => {
  const colorClasses = {
    emerald: "text-gym-accent bg-gym-accent/10",
    indigo: "text-gym-secondary bg-gym-secondary/10",
    amber: "text-gym-amber bg-gym-amber/10",
    rose: "text-gym-rose bg-gym-rose/10",
  };

  return (
    <GlassCard className="flex flex-col gap-4">
      <div className="flex justify-between items-start">
        <div className={cn("p-3 rounded-xl", colorClasses[color])}>
          {icon}
        </div>
        {trend && (
          <span className={cn(
            "text-xs font-medium px-2 py-1 rounded-full",
            trend.isPositive ? "text-gym-accent bg-gym-accent/10" : "text-gym-rose bg-gym-rose/10"
          )}>
            {trend.isPositive ? '+' : '-'}{Math.abs(trend.value)}%
          </span>
        )}
      </div>
      <div>
        <p className="text-slate-400 text-sm font-medium uppercase tracking-wider">{label}</p>
        <h3 className="text-3xl font-bold mt-1 tracking-tight">{value}</h3>
      </div>
    </GlassCard>
  );
};
