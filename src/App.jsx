// src/App.jsx
import React, { useState, useEffect } from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';
import TutorPanel from './components/TutorPanel';
import GameControls from './components/GameControls';
import ColorSelector from './components/ColorSelector';
import DifficultySlider from './components/DifficultySlider'; // Changed from DifficultySelector
import StockfishWrapper from './utils/StockfishWrapper';

function App() {
  const [game, setGame] = useState(new Chess());
  const [orientation, setOrientation] = useState('white');
  const [moveHistory, setMoveHistory] = useState([]);
  const [difficulty, setDifficulty] = useState({ elo: 500, skillLevel: 0 });
  const [isComputerThinking, setIsComputerThinking] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [customSquares, setCustomSquares] = useState({});
  const [lastMove, setLastMove] = useState(null);
  
  const [engine] = useState(() => new StockfishWrapper());

  // Handle game over states
  const [gameOver, setGameOver] = useState({
    isOver: false,
    result: '' // 'checkmate', 'stalemate', 'draw'
  });

  // Reset game state
  const resetGame = () => {
    const newGame = new Chess();
    setGame(newGame);
    setMoveHistory([]);
    setGameStarted(true);
    setCustomSquares({});
    setLastMove(null);
    setGameOver({ isOver: false, result: '' });
    setOrientation('white'); // Reset to white by default
  };

  // Handle color selection
  const handleColorSelect = (color) => {
    const newGame = new Chess();
    setGame(newGame);
    setOrientation(color);
    setGameStarted(true);
    setMoveHistory([]);
    setCustomSquares({});
    setLastMove(null);
    setGameOver({ isOver: false, result: '' });
    
    // If player chose black, trigger computer's first move as white
    if (color === 'black') {
      setIsComputerThinking(true);
      
      engine.sendCommand(`setoption name Skill Level value ${difficulty.skillLevel}`);
      
      engine.onMessage = (message) => {
        const analysis = StockfishWrapper.parseAnalysis(message);
        if (analysis?.bestMove) {
          makeMove(analysis.bestMove);
          setIsComputerThinking(false);
        }
      };

      engine.evaluatePosition(newGame.fen());
    }
  };

  // Show legal moves when a piece is selected
  const highlightLegalMoves = (square) => {
    const moves = game.moves({ square, verbose: true });
    const newSquares = {};
    
    // Add possible move dots
    moves.forEach((move) => {
      newSquares[move.to] = {
        background: 'radial-gradient(circle, rgba(0,0,0,.1) 25%, transparent 25%)',
        borderRadius: '50%'
      };
    });
    
    // Highlight selected square
    newSquares[square] = {
      background: 'rgba(255, 255, 0, 0.4)',
    };
    
    setCustomSquares(newSquares);
  };

  // Handle computer moves
  useEffect(() => {
    if (!gameStarted || game.isGameOver() || isComputerThinking) return;

    const isComputerTurn = (game.turn() === 'b' && orientation === 'white') ||
                          (game.turn() === 'w' && orientation === 'black');

    if (isComputerTurn && !isComputerThinking) {
      setIsComputerThinking(true);
      
      engine.sendCommand(`setoption name Skill Level value ${difficulty.skillLevel}`);
      
      setTimeout(() => {
        engine.onMessage = (message) => {
          const analysis = StockfishWrapper.parseAnalysis(message);
          if (analysis?.bestMove) {
            makeMove(analysis.bestMove);
            setIsComputerThinking(false);
          }
        };

        engine.evaluatePosition(game.fen());
      }, 100);
    }
  }, [game, difficulty, isComputerThinking, orientation, gameStarted]);

  // Check for game over conditions
  useEffect(() => {
    if (game.isGameOver()) {
      let result = '';
      if (game.isCheckmate()) result = 'checkmate';
      else if (game.isStalemate()) result = 'stalemate';
      else if (game.isDraw()) result = 'draw';
      
      setGameOver({ isOver: true, result });
    }
  }, [game]);

  function makeMove(move) {
    const gameCopy = new Chess(game.fen());
    let moveResult;
    
    try {
      if (typeof move === 'string') {
        moveResult = gameCopy.move(move, { sloppy: true });
      } else {
        moveResult = gameCopy.move(move);
      }

      if (moveResult) {
        // Highlight both squares of the most recent move with red
        const newSquares = {
          [moveResult.from]: { background: 'rgba(255, 0, 0, 0.3)' },
          [moveResult.to]: { background: 'rgba(255, 0, 0, 0.3)' }
        };
        setCustomSquares(newSquares);
        setLastMove({ from: moveResult.from, to: moveResult.to });
        
        setGame(gameCopy);
        setMoveHistory(prev => [...prev, moveResult]);
        return true;
      }
    } catch (error) {
      console.error('Move error:', error);
      return false;
    }
    return false;
  }

  function onDrop(sourceSquare, targetSquare) {
    if (!gameStarted) return false;
    
    const isPlayerTurn = (game.turn() === 'w' && orientation === 'white') ||
                        (game.turn() === 'b' && orientation === 'black');
                        
    if (!isPlayerTurn || isComputerThinking) return false;

    // Don't reset squares here anymore to keep the previous move highlighted

    const move = {
      from: sourceSquare,
      to: targetSquare,
      promotion: 'q'
    };

    // Check if move is legal
    const tempGame = new Chess(game.fen());
    const legalMove = tempGame.move(move);
    
    if (!legalMove) return false;
    
    return makeMove(move);
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col gap-4 mb-8">
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold text-gray-800">Chess Coach</h1>
            </div>
            
            <div className="flex flex-col gap-2">
              <DifficultySlider
                value={difficulty}
                onChange={setDifficulty}
                disabled={isComputerThinking}
              />
              
              <ColorSelector 
                onColorSelect={handleColorSelect}
                disabled={isComputerThinking}
              />
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white p-4 rounded-lg shadow relative">
              <Chessboard 
                position={game.fen()}
                onPieceDrop={onDrop}
                onSquareClick={highlightLegalMoves}
                boardOrientation={orientation}
                customSquares={customSquares}
                areArrowsAllowed={true}
                showBoardNotation={true}
                animationDuration={200}
              />
              
              {/* Game Over Overlay */}
              {gameOver.isOver && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  <div className="bg-white p-6 rounded-lg text-center">
                    <h2 className="text-2xl font-bold mb-4">
                      Game Over - {gameOver.result.charAt(0).toUpperCase() + gameOver.result.slice(1)}
                    </h2>
                    <button
                      onClick={resetGame}
                      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      New Game
                    </button>
                  </div>
                </div>
              )}
            </div>
            <GameControls 
              game={game}
              setGame={setGame}
              setMoveHistory={setMoveHistory}
              disabled={isComputerThinking}
              onReset={resetGame}
            />
          </div>

          <div className="lg:col-span-1">
            <TutorPanel 
              game={game}
              moveHistory={moveHistory}
              lastMove={lastMove}
              orientation={orientation}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;