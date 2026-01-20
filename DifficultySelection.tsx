
import React from 'react';
import { Difficulty } from '../types';

interface DifficultySelectionProps {
  onSelect: (difficulty: Difficulty) => void;
}

const DifficultySelection: React.FC<DifficultySelectionProps> = ({ onSelect }) => {
  const levels = [
    {
      id: Difficulty.EASY,
      label: 'Easy Peasy',
      description: 'Short words with only 1 missing letter. Great for beginners!',
      color: 'bg-green-100 border-green-300 text-green-800',
      btnColor: 'bg-green-500 hover:bg-green-600',
      icon: '🌱'
    },
    {
      id: Difficulty.MEDIUM,
      label: 'Getting Smarter',
      description: 'Medium words with 2 missing letters. A nice challenge!',
      color: 'bg-yellow-100 border-yellow-300 text-yellow-800',
      btnColor: 'bg-yellow-500 hover:bg-yellow-600',
      icon: '🌿'
    },
    {
      id: Difficulty.HARD,
      label: 'Word Wizard',
      description: 'Longer words with many missing letters. Only for the brave!',
      color: 'bg-red-100 border-red-300 text-red-800',
      btnColor: 'bg-red-500 hover:bg-red-600',
      icon: '🌳'
    }
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-blue-50">
      <h2 className="text-4xl md:text-5xl font-playful text-blue-600 mb-4 text-center">
        Choose Your Challenge!
      </h2>
      <p className="text-gray-600 text-lg mb-12 text-center max-w-lg">
        How many runaway letters can you find today? Pick a level to start your quest!
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl w-full">
        {levels.map((level) => (
          <div 
            key={level.id}
            className={`flex flex-col items-center p-8 rounded-[2.5rem] border-4 shadow-xl transition-all hover:scale-105 ${level.color}`}
          >
            <div className="text-6xl mb-4 animate-bounce" style={{ animationDuration: '3s' }}>
              {level.icon}
            </div>
            <h3 className="text-2xl font-playful mb-3">{level.label}</h3>
            <p className="text-center mb-8 flex-grow italic opacity-80">
              {level.description}
            </p>
            <button
              onClick={() => onSelect(level.id)}
              className={`w-full py-4 rounded-2xl text-white font-bold text-xl shadow-lg transition-all active:scale-95 ${level.btnColor}`}
            >
              Select
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DifficultySelection;
