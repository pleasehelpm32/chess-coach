// src/components/TutorPanel.jsx
import React, { useState, useEffect } from 'react';
import OpenAIWrapper from '../utils/OpenAIWrapper';

function TutorPanel({ game, moveHistory }) {
  const [analysis, setAnalysis] = useState("Analyzing position...");
  const [llm] = useState(() => new OpenAIWrapper(process.env.REACT_APP_OPENAI_API_KEY));
  
  useEffect(() => {
    const analyzeCurrentPosition = async () => {
      if (!game) return;

      const lastMove = moveHistory.length > 0 ? 
        moveHistory[moveHistory.length - 1] : null;
      
      try {
        const analysis = await llm.analyzePosition(
          game.fen(),
          lastMove ? `${lastMove.from}-${lastMove.to}` : null
        );
        setAnalysis(analysis);
      } catch (error) {
        console.error('Error getting analysis:', error);
        setAnalysis("Couldn't analyze position. Please try again.");
      }
    };

    analyzeCurrentPosition();
  }, [game, moveHistory, llm]);

  return (
    <div className="bg-white p-4 rounded-lg shadow h-full">
      <h2 className="text-xl font-semibold mb-4">Chess Coach</h2>
      <div className="space-y-4">
        <div className="p-3 bg-gray-50 rounded">
          <h3 className="font-medium mb-2">Position Analysis</h3>
          <p className="text-gray-600 whitespace-pre-line">
            {analysis}
          </p>
        </div>
        
        <div className="p-3 bg-gray-50 rounded">
          <h3 className="font-medium mb-2">Need Help?</h3>
          <button 
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            onClick={() => setAnalysis("Analyzing position...")}
          >
            Get New Suggestion
          </button>
        </div>
      </div>
    </div>
  );
}

export default TutorPanel;