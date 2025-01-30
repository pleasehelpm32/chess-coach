// src/components/TutorPanel.jsx
import React, { useState, useEffect } from 'react';
import OpenAIWrapper from '../utils/OpenAIWrapper';
import { Chess } from 'chess.js';

function TutorPanel({ game, moveHistory, lastMove, orientation, onMoveSelect }) {
  const [moves, setMoves] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [llm] = useState(() => new OpenAIWrapper(process.env.REACT_APP_OPENAI_API_KEY));

  const validateMove = (game, moveNotation) => {
    try {
      const chess = new Chess(game.fen());
      const legalMoves = chess.moves();
      return legalMoves.includes(moveNotation);
    } catch (e) {
      return false;
    }
  };
  
  useEffect(() => {
    const analyzePosition = async () => {
      if (!game || !lastMove) return;

      const lastMoveColor = moveHistory[moveHistory.length - 1]?.color;
      const isOpponentMove = (orientation === 'white' && lastMoveColor === 'b') ||
                            (orientation === 'black' && lastMoveColor === 'w');

      if (!isOpponentMove) return;

      try {
        setIsAnalyzing(true);
        const analysis = await llm.analyzePosition(
          game.fen(),
          `${lastMove.from}-${lastMove.to}`
        );
        
        const moveMatches = analysis.match(/Move \d: (.+)$/gm);
        if (moveMatches) {
          const parsedMoves = moveMatches.map(moveText => {
            const [move, ...explanationParts] = moveText.split(' - ');
            const moveNotation = move.replace(/Move \d: /, '').trim();
            const isLegal = validateMove(game, moveNotation);
            return {
              move: moveNotation,
              explanation: explanationParts.join(' - ').trim(),
              isLegal
            };
          }).filter(move => move.isLegal);  // Only keep legal moves
          setMoves(parsedMoves);
        }
      } catch (error) {
        console.error('Error getting analysis:', error);
        setMoves([{ move: "Error analyzing position", explanation: "Please try again" }]);
      } finally {
        setIsAnalyzing(false);
      }
    };

    analyzePosition();
  }, [game, moveHistory, llm, lastMove, orientation]);

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Chess Coach</h2>
      <div className="space-y-4">
        <div className="p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium text-lg mb-3">Recommended Moves</h3>
          {isAnalyzing ? (
            <div className="text-center text-gray-500">Analyzing position...</div>
          ) : moves.length > 0 ? (
            <div className="space-y-3">
              {moves.map((move, index) => (
                <div 
                  key={index}
                  className={`p-3 rounded-md ${
                    index === 0 ? 'bg-blue-800 text-white' :
                    index === 1 ? 'bg-blue-600 text-white' :
                    'bg-blue-300 text-white'
                  }`}
                >
                  <div className="flex items-baseline gap-2">
                    <span className="text-lg font-bold">
                      {move.move}
                    </span>
                    <span className="text-sm opacity-80">#{index + 1}</span>
                  </div>
                  <p className="text-sm mt-1 opacity-90">{move.explanation}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500">Choose your color to start the game!</div>
          )}
        </div>
        
        <div className="p-3 bg-gray-50 rounded">
          <button 
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors w-full"
            onClick={() => {
              setIsAnalyzing(true);
              setMoves([]);
              const lastMove = moveHistory[moveHistory.length - 1];
              if (lastMove) {
                llm.analyzePosition(
                  game.fen(),
                  `${lastMove.from}-${lastMove.to}`
                ).then(analysis => {
                  const moveMatches = analysis.match(/Move \d: (.+)$/gm);
                  if (moveMatches) {
                    const parsedMoves = moveMatches.map(moveText => {
                      const [move, ...explanationParts] = moveText.split(' - ');
                      const moveNotation = move.replace(/Move \d: /, '').trim();
                      const isLegal = validateMove(game, moveNotation);
                      return {
                        move: moveNotation,
                        explanation: explanationParts.join(' - ').trim(),
                        isLegal
                      };
                    }).filter(move => move.isLegal);  // Only keep legal moves
                    setMoves(parsedMoves);
                  }
                }).finally(() => {
                  setIsAnalyzing(false);
                });
              }
            }}
            disabled={isAnalyzing}
          >
            {isAnalyzing ? 'Analyzing...' : 'Get New Analysis'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default TutorPanel;