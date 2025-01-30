// src/components/DifficultySlider.jsx
import React from 'react';

function DifficultySlider({ value, onChange, disabled }) {
  // Convert ELO to Stockfish skill level (0-20)
  const eloToSkillLevel = (elo) => {
    // Map ELO 500-2000 to skill level 0-20
    return Math.round((elo - 500) / 75);
  };

  // Convert skill level to ELO
  const skillLevelToElo = (level) => {
    return Math.round(500 + (level * 75));
  };

  const handleChange = (e) => {
    const elo = parseInt(e.target.value);
    const skillLevel = eloToSkillLevel(elo);
    onChange({
      elo: elo,
      skillLevel: skillLevel
    });
  };

  return (
    <div className="w-full bg-white p-4 rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-2">
        <span className="font-medium text-gray-700">Computer Strength:</span>
        <span className="text-sm font-medium text-blue-600">{value.elo} ELO</span>
      </div>
      <input
        type="range"
        min="500"
        max="2000"
        step="50"
        value={value.elo}
        onChange={handleChange}
        disabled={disabled}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
      />
      <div className="flex justify-between text-xs text-gray-500 mt-1">
        <span>Beginner</span>
        <span>Intermediate</span>
        <span>Advanced</span>
      </div>
    </div>
  );
}

export default DifficultySlider;