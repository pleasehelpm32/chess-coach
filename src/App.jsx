// src/App.jsx
import React, { useState, useEffect } from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';
import TutorPanel from './components/TutorPanel';
import GameControls from './components/GameControls';
import StockfishWrapper from './utils/StockfishWrapper';

// Define difficulty levels and their corresponding Stockfish settings
const DIFFICULTY_LEVELS = {
  EASY: { depth: 5, skillLevel: 3 },
  MEDIUM: { depth: 10, skillLevel: 10 },
  HARD: { depth: 15, skillLevel: 18 }
};

function App() {
  const [game, setGame] = useState(new Chess());
  const [orientation, setOrientation] = useState('white');
  const [moveHistory, setMoveHistory] = useState([]);
  const [computerDifficulty, setComputerDifficulty] = useState('MEDIUM');
  const [isComputerThinking, setIsComputerThinking] = useState(false);
  const [engine] = useState(() => new StockfishWrapper());

  // Handle computer moves
  useEffect(() => {
    if (game.isGameOver() || isComputerThinking) return;

    // If it's computer's turn (black)
    if (game.turn() === 'b') {
      setIsComputerThinking(true);
      const settings = DIFFICULTY_LEVELS[computerDifficulty];
      
      // Configure engine based on difficulty
      engine.sendCommand(`setoption name Skill Level value ${settings.skillLevel}`);
      
      // Get computer move
      engine.onMessage = (message) => {
        const analysis = StockfishWrapper.parseAnalysis(message);
        if (analysis?.bestMove) {
          makeMove(analysis.bestMove);
          setIsComputerThinking(false);
        }
      };

      engine.evaluatePosition(game.fen(), settings.depth);
    }
  }, [game, computerDifficulty, isComputerThinking]);

  function makeMove(move) {
    const gameCopy = new Chess(game.fen());
    
    try {
      const result = gameCopy.move(move);
      if (result) {
        setGame(gameCopy);
        setMoveHistory([...moveHistory, result]);
        return true;
      }
    } catch (error) {
      return false;
    }
  }

  function onDrop(sourceSquare, targetSquare) {
    // Only allow moves when it's player's turn and computer is not thinking
    if (game.turn() === 'b' || isComputerThinking) return false;

    const move = {
      from: sourceSquare,
      to: targetSquare,
      promotion: 'q' // always promote to queen for simplicity
    };

    return makeMove(move);
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Chess Tutor</h1>
          
          {/* Difficulty Selector */}
          <div className="flex items-center gap-4">
            <label className="font-medium text-gray-700">Computer Level:</label>
            <select
              value={computerDifficulty}
              onChange={(e) => setComputerDifficulty(e.target.value)}
              className="p-2 border rounded bg-white"
              disabled={isComputerThinking}
            >
              <option value="EASY">Easy (ELO ~1000)</option>
              <option value="MEDIUM">Medium (ELO ~1500)</option>
              <option value="HARD">Hard (ELO ~2000)</option>
            </select>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Chess Board */}
          <div className="lg:col-span-2">
            <div className="bg-white p-4 rounded-lg shadow">
              <Chessboard 
                position={game.fen()}
                onPieceDrop={onDrop}
                boardOrientation={orientation}
              />
            </div>
            <GameControls 
              game={game}
              setGame={setGame}
              setMoveHistory={setMoveHistory}
              disabled={isComputerThinking}
            />
          </div>

          {/* Tutor Panel */}
          <div className="lg:col-span-1">
            <TutorPanel 
              game={game}
              moveHistory={moveHistory}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;