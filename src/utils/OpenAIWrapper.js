// src/utils/OpenAIWrapper.js
class OpenAIWrapper {
  constructor(apiKey) {
    this.apiKey = apiKey;
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
          content: "You are a chess tutor helping a beginner understand their position. Keep explanations concise and focus on immediate tactical opportunities and basic strategic ideas."
        }, {
          role: "user",
          content: `Given this chess position in FEN notation: ${fen}
            ${lastMove ? `The last move was: ${lastMove}` : ''}
            Please provide:
            1. A brief evaluation of the position (1 sentence)
            2. One good move suggestion with a simple explanation why
            3. One key thing to watch out for
            Keep your entire response under 4 sentences total.`
        }],
        temperature: 0.7,
        max_tokens: 150
      })
    });

    const data = await response.json();
    return data.choices[0].message.content;
  }
}

export default OpenAIWrapper;