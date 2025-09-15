import React, { useState, useEffect } from 'react';
import { Pokemon } from '../types';

interface PokemonDisplayProps {
  silhouettePokemon: Pokemon | null;
  correctPokemon: Pokemon | null;
  morphedImageUrl: string | null;
  isRevealed: boolean;
}

const PokemonDisplay: React.FC<PokemonDisplayProps> = ({ silhouettePokemon, correctPokemon, morphedImageUrl, isRevealed }) => {
  // 0: silhouette, 1: revealed
  const [revealStep, setRevealStep] = useState(0);

  useEffect(() => {
    if (isRevealed) {
      setRevealStep(1);
    } else {
      setRevealStep(0);
    }
  }, [isRevealed]);

  const handleDownload = () => {
    if (!correctPokemon || !silhouettePokemon) return;
    const imageUrl = morphedImageUrl || correctPokemon.imageUrl;

    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `${correctPokemon.name}-as-${silhouettePokemon.name}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  if (!silhouettePokemon || !correctPokemon) return null;
  
  const resultImageUrl = morphedImageUrl || correctPokemon.imageUrl;
  const resultAltText = morphedImageUrl ? `A reformed Pokémon: ${correctPokemon.name} in the shape of ${silhouettePokemon.name}` : correctPokemon.name;

  return (
    <div className="relative w-64 h-64 md:w-80 md:h-80 flex items-center justify-center">
      {/* Download Button */}
      {isRevealed && (
        <button
          onClick={handleDownload}
          className="absolute top-2 right-2 z-20 bg-yellow-400 text-blue-900 p-2 rounded-full hover:bg-yellow-300 transition-transform transform hover:scale-110 shadow-lg border-2 border-blue-900"
          aria-label="Download Image"
          title="Download Image"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
        </button>
      )}

      {/* Base image styles */}
      <style>{`
        .base-img {
          position: absolute;
          object-fit: contain;
          max-width: 100%;
          max-height: 100%;
          transition: opacity 0.5s ease-in-out;
        }
      `}</style>
      
      {/* Silhouette Image */}
      <img
        src={silhouettePokemon.imageUrl}
        alt="A mysterious Pokémon"
        className="base-img"
        style={{ 
          filter: 'brightness(0)',
          opacity: revealStep === 0 ? 1 : 0,
        }}
      />
      
      {/* Result Image (Morphed or Original as fallback) */}
       <img
        src={resultImageUrl}
        alt={resultAltText}
        className={`base-img ${revealStep === 1 ? 'animate-reform' : 'opacity-0'}`}
        style={{ opacity: revealStep === 1 ? 1 : 0 }}
      />
    </div>
  );
};

export default PokemonDisplay;