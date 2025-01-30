// src/utils/StockfishWrapper.js
class StockfishWrapper {
  constructor() {
    this.stockfish = new Worker('/stockfish.js');
    this.isReady = false;
    this.onMessage = null;

    this.stockfish.onmessage = (event) => {
      const message = event.data;
      
      if (message === 'uciok') {
        this.isReady = true;
        // Reduce MultiPV to just get top move
        this.sendCommand('setoption name MultiPV value 1');
        // Lower skill level slightly for faster analysis
        this.sendCommand('setoption name Skill Level value 8');
        // Set a lower maximum time for each analysis
        this.sendCommand('setoption name Move Overhead value 100');
      }
      
      if (this.onMessage) {
        this.onMessage(message);
      }
    };

    this.init();
  }

  init() {
    this.sendCommand('uci');
    this.sendCommand('isready');
  }

  sendCommand(cmd) {
    this.stockfish.postMessage(cmd);
  }

  evaluatePosition(fen) {
    // Stop any ongoing analysis
    this.sendCommand('stop');
    // Set position
    this.sendCommand('position fen ' + fen);
    // Use movetime instead of depth for faster results
    // Only analyze for 100ms
    this.sendCommand('go movetime 100');
  }

  stop() {
    this.sendCommand('stop');
  }

  quit() {
    this.sendCommand('quit');
    this.stockfish.terminate();
  }

  static parseAnalysis(output) {
    if (typeof output !== 'string') return null;
    
    // Look for both bestmove direct output and info strings
    const bestMoveMatch = output.match(/^bestmove\s+(\S+)/);
    if (bestMoveMatch) {
      return {
        depth: 1,
        score: 0,
        bestMove: bestMoveMatch[1],
        line: bestMoveMatch[1]
      };
    }

    const infoMatch = output.match(/info depth (\d+) seldepth \d+ score (cp|mate) (-?\d+).*?pv (\S+)/);
    if (!infoMatch) return null;

    const [, depth, type, score, moves] = infoMatch;
    const firstMove = moves.split(' ')[0];
    
    return {
      depth: parseInt(depth),
      score: type === 'cp' ? parseInt(score) / 100 : `Mate in ${Math.abs(parseInt(score))}`,
      bestMove: firstMove,
      line: moves
    };
  }
}

export default StockfishWrapper;