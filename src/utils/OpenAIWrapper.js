// src/utils/OpenAIWrapper.js
import { Chess } from 'chess.js';

class OpenAIWrapper {
  constructor(apiKey) {
    this.apiKey = apiKey;
  }

  isMoveLegal(chess, move) {
    try {
      // Try the move directly first
      const result = chess.move(move, { sloppy: true });
      if (result) {
        chess.undo(); // Undo the move to maintain position
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  }

  async analyzePosition(fen, lastMove) {
    const chess = new Chess(fen);
    
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
          content: `You are a chess engine assistant. Analyze the position and suggest the best legal moves. 
                   Verify all moves are legal and possible with the pieces on the board.
                   Use standard algebraic notation (e.g., e4, Nf3, O-O).
                   Provide exactly 5 moves to ensure we have enough valid options.`
        }, {
          role: "user",
          content: `Current position (FEN notation): ${fen}
            ${lastMove ? `Last move played: ${lastMove}` : ''}
            Analyze this position and suggest the 5 best legal moves.
            
            Format your response exactly like this:
            Move 1: [move] - [brief explanation]
            Move 2: [move] - [brief explanation]
            Move 3: [move] - [brief explanation]
            Move 4: [move] - [brief explanation]
            Move 5: [move] - [brief explanation]
            
            Use standard algebraic notation and ensure all moves are legal.`
        }],
        temperature: 0.3,
        max_tokens: 250
      })
    });

    const data = await response.json();
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Invalid response from OpenAI API');
    }

    const content = data.choices[0].message.content;
    const moves = content.match(/Move \d: (.+)$/gm);
    
    if (!moves) {
      return "No valid moves found in analysis. Please try again.";
    }

    // Process and validate moves
    const validMoves = moves
      .map(moveText => {
        const [move, ...explanationParts] = moveText.split(' - ');
        const moveNotation = move.replace(/Move \d: /, '').trim();
        const isLegal = this.isMoveLegal(chess, moveNotation);
        
        return {
          move: moveNotation,
          explanation: explanationParts.join(' - ').trim(),
          isLegal
        };
      })
      .filter(move => move.isLegal);

    // Return validated moves or try a simpler analysis if no valid moves
    if (validMoves.length === 0) {
      // If no valid moves found, try a simpler analysis with basic moves
      const basicMoves = chess.moves();
      if (basicMoves.length > 0) {
        return basicMoves.slice(0, 3).map(move => ({
          move,
          explanation: "Basic legal move",
          isLegal: true
        }));
      }
    }

    return validMoves.slice(0, 3); // Return top 3 valid moves
  }
}

export default OpenAIWrapper;