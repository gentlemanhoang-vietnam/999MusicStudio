
import React from 'react';

interface GlowingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

const GlowingButton: React.FC<GlowingButtonProps> = ({ children, ...props }) => {
  return (
    <button
      {...props}
      className="px-8 py-3 w-full md:w-auto bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold rounded-lg shadow-lg transform transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-[0_0_25px_rgba(79,70,229,0.7)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 disabled:shadow-lg"
    >
      {children}
    </button>
  );
};

export default GlowingButton;
