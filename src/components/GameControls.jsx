// src/components/GameControls.jsx
import React from 'react';
import { Chess } from 'chess.js';

function GameControls({ game, setGame, setMoveHistory, disabled }) {
  const resetGame = () => {
    setGame(new Chess());
    setMoveHistory([]);
  };

  return (
    <div className="mt-4 flex gap-4">
      <button
        onClick={resetGame}
        className={`px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors ${
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        disabled={disabled}
      >
        New Game
      </button>
      <button
        onClick={() => {
          const gameCopy = new Chess(game.fen());
          gameCopy.undo();
          setGame(gameCopy);
          setMoveHistory(prev => prev.slice(0, -1));
        }}
        className={`px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors ${
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        disabled={disabled}
      >
        Undo Move
      </button>
    </div>
  );
}

export default GameControls;