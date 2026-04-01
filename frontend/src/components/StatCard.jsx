import { motion } from 'framer-motion';
import { FiTrendingUp, FiTrendingDown, FiMinus } from 'react-icons/fi';

const StatCard = ({ icon: Icon, title, value, color, delay = 0, trend, trendLabel, subtitle }) => {
  const trendPositive = trend > 0;
  const trendNeutral = trend === 0 || trend === undefined;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={{ scale: 1.03, y: -4 }}
      className={`${color} rounded-2xl p-6 cursor-pointer shadow-lg hover:shadow-xl transition-shadow`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium opacity-80 uppercase tracking-wide">{title}</p>
          <p className="text-4xl font-bold mt-2 mb-1">{value}</p>
          {subtitle && <p className="text-xs opacity-70">{subtitle}</p>}
        </div>
        <div className="bg-white/20 rounded-xl p-3">
          <Icon className="text-2xl" />
        </div>
      </div>
      {trend !== undefined && (
        <div className="mt-4 flex items-center gap-1.5">
          <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${
            trendNeutral ? 'bg-white/20' : trendPositive ? 'bg-white/20' : 'bg-white/20'
          }`}>
            {trendNeutral ? <FiMinus size={12} /> : trendPositive ? <FiTrendingUp size={12} /> : <FiTrendingDown size={12} />}
            <span>{trendNeutral ? '0%' : `${trendPositive ? '+' : ''}${trend}%`}</span>
          </div>
          <span className="text-xs opacity-70">{trendLabel || 'vs last month'}</span>
        </div>
      )}
    </motion.div>
  );
};

export default StatCard;
