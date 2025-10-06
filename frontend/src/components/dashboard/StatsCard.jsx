// src/components/dashboard/StatsCard.jsx
import { TrendingUp, TrendingDown } from 'lucide-react';
import GlassCard from '../ui/GlassCard';

const StatsCard = ({
  title,
  value,
  icon,
  trend,
  color = 'blue',
  loading = false,
  className = ''
}) => {
  const colorClasses = {
    blue: 'from-blue-400/20 to-blue-600/20 border-blue-400/30',
    green: 'from-green-400/20 to-green-600/20 border-green-400/30',
    purple: 'from-purple-400/20 to-purple-600/20 border-purple-400/30',
    orange: 'from-orange-400/20 to-orange-600/20 border-orange-400/30',
    red: 'from-red-400/20 to-red-600/20 border-red-400/30'
  };

  const iconColorClasses = {
    blue: 'text-blue-400',
    green: 'text-green-400',
    purple: 'text-purple-400',
    orange: 'text-orange-400',
    red: 'text-red-400'
  };

  const isPositiveTrend = trend && trend.startsWith('+');

  if (loading) {
    return (
      <GlassCard className={`p-4 ${className}`}>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="w-6 h-6 bg-white/20 rounded"></div>
            <div className="w-12 h-4 bg-white/20 rounded"></div>
          </div>
          <div className="space-y-2">
            <div className="w-16 h-6 bg-white/20 rounded"></div>
            <div className="w-24 h-4 bg-white/20 rounded"></div>
          </div>
        </div>
      </GlassCard>
    );
  }

  return (
    <div className={className}>
      <GlassCard className={`p-4 bg-gradient-to-br ${colorClasses[color]} relative overflow-hidden`}>
        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className={`p-2 bg-white/10 rounded-lg ${iconColorClasses[color]}`}>
              {icon}
            </div>

            {trend && (
              <div className={`flex items-center text-xs font-medium ${
                  isPositiveTrend
                    ? 'text-green-400'
                    : 'text-red-400'
                }`}
              >
                {isPositiveTrend ? (
                  <TrendingUp size={12} className="mr-1" />
                ) : (
                  <TrendingDown size={12} className="mr-1" />
                )}
                {trend}
              </div>
            )}
          </div>

          {/* Content */}
          <div className="space-y-1">
            <div className="text-2xl lg:text-3xl font-bold text-white">
              {typeof value === 'number' && value > 999
                ? value.toLocaleString()
                : value}
            </div>

            <div className="text-sm text-white/70 font-medium">
              {title}
            </div>
          </div>

          {/* Decorative dots */}
          <div className="absolute top-2 right-2 flex space-x-1">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className={`w-1 h-1 ${iconColorClasses[color]} rounded-full opacity-40`}
              />
            ))}
          </div>
        </div>
      </GlassCard>
    </div>
  );
};

export default StatsCard;
