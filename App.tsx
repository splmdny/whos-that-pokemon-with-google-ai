import React, { useState, useCallback, useEffect } from 'react';
import { Pokemon, GameState, ClueType } from './types';
import { morphPokemon, generateClue } from './services/geminiService';
import { useAudio } from './hooks/useAudio';
import Loader from './components/Loader';
import PokemonDisplay from './components/PokemonDisplay';
import { POKEMON_LIST } from './data/pokemonList';

const App: React.FC = () => {
  const [pokemonList] = useState<Pokemon[]>(POKEMON_LIST);
  const [silhouettePokemon, setSilhouettePokemon] = useState<Pokemon | null>(null);
  const [correctPokemon, setCorrectPokemon] = useState<Pokemon | null>(null);
  const [morphedImageUrl, setMorphedImageUrl] = useState<string | null>(null);
  const [userGuess, setUserGuess] = useState('');
  const [gameState, setGameState] = useState<GameState>(GameState.IDLE);
  const [error, setError] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [remainingGuesses, setRemainingGuesses] = useState(3);
  const [clues, setClues] = useState<string[]>([]);

  const playIntroSound = useAudio('https://www.myinstants.com/media/sounds/whos-that-pokemon.mp3');
  const playCorrectSound = useAudio('https://www.myinstants.com/media/sounds/correct-answer-sound-effect.mp3');
  const playWrongSound = useAudio('https://www.myinstants.com/media/sounds/wrong-answer-sound-effect.mp3');

  const startNewRound = useCallback(() => {
    if (pokemonList.length < 2) return;

    let silhouetteIndex = Math.floor(Math.random() * pokemonList.length);
    let correctIndex = Math.floor(Math.random() * pokemonList.length);

    while (silhouetteIndex === correctIndex) {
      correctIndex = Math.floor(Math.random() * pokemonList.length);
    }
    
    setSilhouettePokemon(pokemonList[silhouetteIndex]);
    setCorrectPokemon(pokemonList[correctIndex]);
    setUserGuess('');
    setMorphedImageUrl(null);
    setRemainingGuesses(3);
    setClues([]);
    setGameState(GameState.PLAYING);
    playIntroSound();
  }, [pokemonList, playIntroSound]);

  const handleGuess = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userGuess.trim() || !correctPokemon) return;

    const guessIsCorrect = userGuess.trim().toLowerCase() === correctPokemon.name.toLowerCase();

    const performMorph = async () => {
      if (correctPokemon && silhouettePokemon) {
        try {
          const morphedUrl = await morphPokemon(correctPokemon.imageUrl, silhouettePokemon.imageUrl);
          setMorphedImageUrl(morphedUrl);
        } catch (err: any) {
          console.error("Failed to morph Pokemon:", err);
          setMorphedImageUrl(null); // Fallback to original image if morphing fails
        }
      }
    };

    if (guessIsCorrect) {
      playCorrectSound(); // Play sound immediately for instant feedback
      let points = 0;
      if (remainingGuesses === 3) {
        points = 100;
      } else if (remainingGuesses === 2) {
        points = 50;
      } else { // remainingGuesses === 1
        points = 10;
      }
      setScore(prevScore => prevScore + points);

      setGameState(GameState.MORPHING_CORRECT);
      await performMorph();
      setGameState(GameState.REVEALED_CORRECT);
    } else {
      const newRemainingGuesses = remainingGuesses - 1;
      setRemainingGuesses(newRemainingGuesses);
      playWrongSound();
      setUserGuess('');

      if (newRemainingGuesses > 0) {
        setGameState(GameState.GENERATING_CLUE);
        try {
          // Progressive Clues: Hardest first, easiest last.
          const clueType = newRemainingGuesses === 2 ? ClueType.COLOR : ClueType.EASY_POKEDEX_ENTRY;
          const newClue = await generateClue(correctPokemon.name, clueType);
          setClues(prevClues => [...prevClues, newClue]);
        } catch (err) {
          console.error("Failed to generate clue:", err);
          setClues(prevClues => [...prevClues, "Couldn't think of a clue, but that's not it!"]);
        } finally {
          setGameState(GameState.PLAYING);
        }
      } else {
        setGameState(GameState.MORPHING_WRONG);
        await performMorph();
        setGameState(GameState.REVEALED_WRONG);
      }
    }
  };

  const renderContent = () => {
    if (error) {
        return <div className="text-red-400 text-center bg-red-900 bg-opacity-50 p-4 rounded-lg border border-red-400">{error}</div>
    }

    if (gameState === GameState.IDLE) {
      return (
        <div className="w-full max-w-2xl bg-blue-900 bg-opacity-75 p-4 sm:p-8 rounded-2xl border-4 border-yellow-400 shadow-2xl text-center">
           <h1 className="font-bangers text-5xl sm:text-6xl text-yellow-400 text-center mb-6" style={{ textShadow: '3px 3px 0 #2A75BB' }}>
              Who's That Pokémon?!
           </h1>
           <h2 className="text-white text-xl sm:text-2xl mb-8">(With a Twist!)</h2>
           <button
              onClick={startNewRound}
              className="w-full mt-4 bg-yellow-400 text-blue-900 font-bold py-3 px-4 rounded-lg hover:bg-yellow-300 transition-colors duration-200 border-2 border-blue-900 shadow-lg text-lg"
           >
              Start Game!
           </button>
        </div>
      );
    }

    if (gameState === GameState.LOADING || !silhouettePokemon || !correctPokemon) {
      return <Loader message="Summoning Pokémon..." />;
    }
    
    if (gameState === GameState.MORPHING_CORRECT) {
      return <Loader message="Gotcha! Revealing the true form..." showEllipsisAnimation={true} />;
    }

    if (gameState === GameState.MORPHING_WRONG) {
      return <Loader message="AI is reforming the Pokémon..." />;
    }
    
    if (gameState === GameState.GENERATING_CLUE) {
        return <Loader message="Thinking of a clue..." />;
    }

    const isRevealed = gameState === GameState.REVEALED_CORRECT || gameState === GameState.REVEALED_WRONG;

    return (
      <div className="w-full max-w-2xl bg-blue-900 bg-opacity-75 p-4 sm:p-8 rounded-2xl border-4 border-yellow-400 shadow-2xl">
        <div className="flex justify-between items-center mb-8">
            <p className="text-xl sm:text-2xl text-white">Score: {score}</p>
            <p className="text-xl sm:text-2xl text-white">Guesses: {remainingGuesses}</p>
        </div>
        <h1 className="font-bangers text-5xl sm:text-6xl text-yellow-400 text-center mb-6" style={{ textShadow: '3px 3px 0 #2A75BB' }}>
            Who's That Pokémon?!
        </h1>
        
        <div className="bg-blue-800 p-4 rounded-lg flex justify-center items-center mb-6 min-h-[18rem] md:min-h-[22rem]">
            <PokemonDisplay 
                silhouettePokemon={silhouettePokemon}
                correctPokemon={correctPokemon}
                morphedImageUrl={morphedImageUrl}
                isRevealed={isRevealed}
            />
        </div>

        {clues.length > 0 && !isRevealed && (
            <div className="text-center text-yellow-300 bg-blue-800 p-3 rounded-lg mb-4 border-2 border-yellow-500 space-y-2">
                <p className="text-sm font-bold">HINTS:</p>
                {clues.map((c, index) => (
                    <p key={index} className="text-base">{c}</p>
                ))}
            </div>
        )}

        {isRevealed ? (
            <div className="text-center text-white">
                {gameState === GameState.REVEALED_CORRECT ? (
                    <>
                        <p className="text-md mb-2">The silhouette was {silhouettePokemon?.name}!</p>
                        <p className="text-2xl text-green-400 mb-4">You got it! The answer was {correctPokemon?.name}!</p>
                    </>
                ) : (
                    <p className="text-2xl text-red-400 mb-4">So close! The answer was {correctPokemon?.name}!</p>
                )}
                <button
                    onClick={startNewRound}
                    className="w-full mt-4 bg-yellow-400 text-blue-900 font-bold py-3 px-4 rounded-lg hover:bg-yellow-300 transition-colors duration-200 border-2 border-blue-900 shadow-lg text-lg"
                >
                    Play Again!
                </button>
            </div>
        ) : (
            <form onSubmit={handleGuess}>
                <input
                    type="text"
                    value={userGuess}
                    onChange={(e) => setUserGuess(e.target.value)}
                    placeholder="Enter Pokémon name..."
                    className="w-full p-3 text-center bg-gray-200 text-gray-900 rounded-lg mb-4 border-2 border-gray-400 focus:outline-none focus:ring-4 focus:ring-yellow-400 transition"
                />
                <button
                    type="submit"
                    className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-500 transition-colors duration-200 border-2 border-blue-900 shadow-lg text-lg"
                >
                    Guess!
                </button>
            </form>
        )}
      </div>
    );
  };
  
  return (
    <main 
      className="min-h-screen flex flex-col items-center justify-center p-4"
      style={{
        backgroundColor: '#cc0000', // A vibrant red fallback
        backgroundImage: `
          url('https://upload.wikimedia.org/wikipedia/commons/9/98/International_Pok%C3%A9mon_logo.svg'),
          radial-gradient(circle at center, white 0%, #90caf9 20%, #1976d2 45%, transparent 70%),
          linear-gradient(160deg, #e53935 0%, #d32f2f 100%)
        `,
        backgroundPosition: 'bottom 20px right 20px, center, center',
        backgroundSize: '200px auto, 80vh 80vh, cover',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div className="relative z-10 w-full flex items-center justify-center">
        {renderContent()}
      </div>
    </main>
  );
};

export default App;