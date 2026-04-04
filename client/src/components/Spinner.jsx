import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

const Spinner = ({ className, size = 'md', color = 'blue' }) => {
  const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };

  const colors = {
    blue: 'border-blue-600 border-t-transparent',
    white: 'border-white border-t-transparent',
    slate: 'border-slate-800 border-t-transparent',
  };

  return (
    <div
      className={twMerge(
        "rounded-full animate-spin flex-shrink-0",
        sizes[size],
        colors[color],
        className
      )}
    />
  );
};

export default Spinner;
