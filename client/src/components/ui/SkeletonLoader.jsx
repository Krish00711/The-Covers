function SkeletonLoader({ className = '', variant = 'default' }) {
  const variants = {
    default: 'h-4 w-full',
    title: 'h-8 w-3/4',
    stat: 'h-12 w-24',
    card: 'h-48 w-full',
    circle: 'h-12 w-12 rounded-full',
  };

  return (
    <div
      className={`animate-pulse bg-primary/10 rounded ${variants[variant]} ${className}`}
    />
  );
}

export default SkeletonLoader;
