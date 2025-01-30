// src/utils/OpenAIWrapper.js
import { Chess } from 'chess.js';

class OpenAIWrapper {
  constructor(apiKey) {
    this.apiKey = apiKey;
  }

  isMoveLegal(fen, move) {
    const chess = new Chess(fen);
    try {
      const result = chess.move(move, { sloppy: true });
      return result !== null;
    } catch (e) {
      return false;
    }
  }

  async analyzePosition(fen, lastMove) {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [{
          role: "system",
          content: "You are a chess engine assistant. Analyze positions and suggest the top 3 best legal moves, ranked by strength. Verify all moves are legal and possible with the pieces on the board."
        }, {
          role: "user",
          content: `Current position (FEN notation): ${fen}
            ${lastMove ? `Last move played: ${lastMove}` : ''}
            Analyze this position and suggest the top 3 best legal moves.
            Verify each move is legal and possible.
            
            Format your response exactly like this:
            Move 1: [move] - [brief explanation]
            Move 2: [move] - [brief explanation]
            Move 3: [move] - [brief explanation]
            
            Keep explanations concise and tactical.`
        }],
        temperature: 0.3,
        max_tokens: 150
      })
    });

    const data = await response.json();
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Invalid response from OpenAI API');
    }

    const content = data.choices[0].message.content;
    const moves = content.match(/Move \d: (.+)$/gm);
    
    if (moves) {
      // Validate each suggested move
      for (const moveText of moves) {
        const moveMatch = moveText.match(/Move \d: ([A-Za-z0-9]+)/);
        if (moveMatch && moveMatch[1]) {
          const suggestedMove = moveMatch[1].trim();
          if (!this.isMoveLegal(fen, suggestedMove)) {
            return "Invalid move detected in suggestions. Please try getting a new analysis.";
          }
        }
      }
    }

    return content;
  }
}

export default OpenAIWrapper;