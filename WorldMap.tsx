
import React from 'react';
import { WorldData, WorldType } from '../types';
import { WORLDS } from '../constants';

interface WorldMapProps {
  onSelectWorld: (world: WorldData) => void;
}

const WorldMap: React.FC<WorldMapProps> = ({ onSelectWorld }) => {
  return (
    <div className="min-h-screen py-24 md:py-32 px-4 md:px-8 flex flex-col items-center justify-center max-w-7xl mx-auto">
      <h2 className="text-3xl md:text-5xl font-playful text-blue-600 mb-10 md:mb-16 text-center animate-wiggle px-4">
        Where do you want to learn today?
      </h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 w-full">
        {WORLDS.map((world) => (
          <button
            key={world.type}
            onClick={() => onSelectWorld(world)}
            className={`group relative p-6 md:p-8 rounded-[2rem] md:rounded-[3rem] text-white bg-gradient-to-br ${world.color} shadow-xl hover:shadow-2xl transition-all hover:scale-[1.03] active:scale-95 text-left flex flex-col min-h-[260px] md:h-[320px] overflow-hidden`}
          >
            <div className="text-5xl md:text-7xl mb-4 group-hover:scale-110 transition-transform duration-500 drop-shadow-lg">{world.icon}</div>
            <h3 className="text-2xl md:text-3xl font-playful mb-3 md:mb-4">{world.name}</h3>
            <p className="opacity-90 font-semibold text-sm md:text-base leading-snug line-clamp-3">{world.description}</p>
            
            <div className="mt-auto flex justify-end">
              <span className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-xl text-[10px] md:text-sm uppercase tracking-widest font-bold border border-white/20">
                Enter ➜
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default WorldMap;
