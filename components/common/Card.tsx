
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div className={`bg-white p-6 sm:p-8 rounded-xl shadow-lg transition-transform transform hover:scale-[1.02] ${className}`}>
      {children}
    </div>
  );
};
