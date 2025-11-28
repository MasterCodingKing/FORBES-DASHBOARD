const Card = ({
  children,
  title,
  subtitle,
  headerAction,
  className = '',
  bodyClassName = '',
  gradient = false,
  borderColor
}) => {
  const baseStyles = 'bg-white rounded-xl shadow-lg overflow-hidden';
  const gradientStyles = gradient ? 'bg-gradient-to-r from-primary-500 to-purple-600 text-white' : '';
  const borderStyles = borderColor ? `border-l-4 border-${borderColor}` : '';

  return (
    <div className={`${baseStyles} ${gradientStyles} ${borderStyles} ${className}`}>
      {(title || headerAction) && (
        <div className={`px-6 py-4 border-b ${gradient ? 'border-white/20' : 'border-gray-200'} flex items-center justify-between`}>
          <div>
            {title && (
              <h3 className={`text-lg font-semibold ${gradient ? 'text-white' : 'text-gray-800'}`}>
                {title}
              </h3>
            )}
            {subtitle && (
              <p className={`text-sm ${gradient ? 'text-white/70' : 'text-gray-500'}`}>
                {subtitle}
              </p>
            )}
          </div>
          {headerAction && (
            <div>{headerAction}</div>
          )}
        </div>
      )}
      <div className={`p-6 ${bodyClassName}`}>
        {children}
      </div>
    </div>
  );
};

export default Card;
