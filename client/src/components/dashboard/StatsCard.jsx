const StatsCard = ({ title, value, icon, trend, trendValue, color = 'primary' }) => {
  const colors = {
    primary: 'from-primary-500 to-purple-600',
    success: 'from-green-500 to-emerald-600',
    danger: 'from-red-500 to-rose-600',
    warning: 'from-yellow-500 to-orange-500',
    info: 'from-blue-500 to-cyan-600'
  };

  const trendColors = {
    up: 'text-green-500',
    down: 'text-red-500',
    neutral: 'text-gray-500'
  };

  return (
    <div className={`bg-gradient-to-r ${colors[color]} rounded-xl shadow-lg p-6 text-white`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white/70 text-sm font-medium">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
          {trend && (
            <div className={`flex items-center mt-2 ${trendColors[trend]}`}>
              {trend === 'up' && (
                <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              )}
              {trend === 'down' && (
                <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6" />
                </svg>
              )}
              <span className="text-sm bg-white/20 px-2 py-0.5 rounded">
                {trendValue}
              </span>
            </div>
          )}
        </div>
        <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
          {icon}
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
