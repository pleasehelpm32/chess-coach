// src/components/TutorPanel.jsx
import React, { useState, useEffect } from 'react';
import OpenAIWrapper from '../utils/OpenAIWrapper';

function TutorPanel({ game, moveHistory, lastMove, orientation }) {
  const [moves, setMoves] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState(null);
  const [llm] = useState(() => new OpenAIWrapper(process.env.REACT_APP_OPENAI_API_KEY));

  useEffect(() => {
    const analyzePosition = async () => {
      if (!game || !lastMove) return;

      const lastMoveColor = moveHistory[moveHistory.length - 1]?.color;
      const isOpponentMove = (orientation === 'white' && lastMoveColor === 'b') ||
                           (orientation === 'black' && lastMoveColor === 'w');

      if (!isOpponentMove) return;

      try {
        setIsAnalyzing(true);
        setError(null);
        
        const validMoves = await llm.analyzePosition(
          game.fen(),
          `${lastMove.from}-${lastMove.to}`
        );

        if (Array.isArray(validMoves) && validMoves.length > 0) {
          setMoves(validMoves);
        } else {
          setError("No valid moves found. Please try again.");
          setMoves([]);
        }
      } catch (error) {
        console.error('Error getting analysis:', error);
        setError("Error analyzing position. Please try again.");
        setMoves([]);
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
          ) : error ? (
            <div className="text-center text-red-500">{error}</div>
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
            onClick={async () => {
              setIsAnalyzing(true);
              setError(null);
              setMoves([]);
              
              const lastMove = moveHistory[moveHistory.length - 1];
              if (lastMove) {
                try {
                  const validMoves = await llm.analyzePosition(
                    game.fen(),
                    `${lastMove.from}-${lastMove.to}`
                  );
                  
                  if (Array.isArray(validMoves) && validMoves.length > 0) {
                    setMoves(validMoves);
                  } else {
                    setError("No valid moves found. Please try again.");
                  }
                } catch (error) {
                  console.error('Error getting analysis:', error);
                  setError("Error analyzing position. Please try again.");
                } finally {
                  setIsAnalyzing(false);
                }
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