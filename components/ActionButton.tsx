
import React from 'react';

interface ActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  Icon?: React.FC<React.SVGProps<SVGSVGElement>>;
}

export const ActionButton: React.FC<ActionButtonProps> = ({ children, Icon, ...props }) => {
  return (
    <button
      {...props}
      className="inline-flex items-center justify-center gap-3 px-8 py-4 font-semibold text-white transition-all duration-300 bg-indigo-600 rounded-lg shadow-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {Icon && <Icon className="w-6 h-6" />}
      <span className="text-lg">{children}</span>
    </button>
  );
};
