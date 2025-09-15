import React, { useState, useEffect } from 'react';

const AnimatedEllipsis: React.FC = () => {
    const [dots, setDots] = useState('.');

    useEffect(() => {
        const intervalId = setInterval(() => {
            setDots(prevDots => prevDots.length >= 3 ? '.' : prevDots + '.');
        }, 300); // Speed of the animation

        return () => clearInterval(intervalId);
    }, []);

    // Use a fixed-width container to prevent the layout from shifting as dots are added/removed
    return <span className="inline-block w-4 text-left">{dots}</span>;
};


const Loader: React.FC<{ message: string; showEllipsisAnimation?: boolean }> = ({ message, showEllipsisAnimation = false }) => {
  return (
    <div className="flex flex-col items-center justify-center text-center text-white p-8">
      <div className="relative w-24 h-24 animate-spin mb-6">
        <div className="absolute top-0 left-0 w-full h-1/2 bg-red-500 rounded-t-full border-4 border-black"></div>
        <div className="absolute bottom-0 left-0 w-full h-1/2 bg-white rounded-b-full border-4 border-black"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full border-4 border-black flex items-center justify-center">
            <div className="w-4 h-4 bg-white rounded-full border-2 border-black"></div>
        </div>
        <div className="absolute top-1/2 left-0 w-full h-2 bg-black -translate-y-1/2"></div>
      </div>
      <p className="text-xl tracking-wider flex items-center justify-center">
        <span>{message}</span>
        {showEllipsisAnimation && <AnimatedEllipsis />}
      </p>
    </div>
  );
};

export default Loader;