
import React, { useState, useEffect } from 'react';

interface ScoreboardProps {
  score: number;
}

export const Scoreboard: React.FC<ScoreboardProps> = ({ score }) => {
    const [animate, setAnimate] = useState(false);

    useEffect(() => {
        if (score > 0) {
            setAnimate(true);
            const timer = setTimeout(() => setAnimate(false), 300);
            return () => clearTimeout(timer);
        }
    }, [score]);

    const animationClass = animate ? 'scale-125 text-yellow-400' : 'scale-100';

    return (
        <div className="flex items-center gap-2 bg-indigo-100 text-indigo-800 font-bold px-4 py-2 rounded-full">
            <span>Score:</span>
            <span className={`transition-transform duration-300 ease-out ${animationClass}`}>{score} 🎯</span>
        </div>
    );
};
