
import React from 'react';
import { APP_TITLE, AUTHOR_NAME } from '../constants';

interface BookCoverProps {
  imageUrl: string;
  onStart: () => void;
}

const BookCover: React.FC<BookCoverProps> = ({ imageUrl, onStart }) => {
  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-stone-900 p-4 md:p-8 overflow-hidden">
      <div 
        className="absolute inset-0 opacity-40 blur-3xl scale-125 transition-opacity duration-1000"
        style={{ backgroundImage: `url(${imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
      />

      <div className="relative z-10 w-full max-w-[580px] perspective-1000">
        <div className="bg-white rounded-2xl md:rounded-3xl shadow-[0_30px_60px_rgba(0,0,0,0.8)] md:shadow-[0_50px_100px_rgba(0,0,0,0.9)] overflow-hidden transform transition-all hover:scale-[1.01]">
          <div className="h-3 md:h-4 bg-gradient-to-r from-amber-700 via-amber-400 to-amber-800 w-full" />
          
          <div className="relative aspect-[3/4.2] overflow-hidden group">
            <img 
              src={imageUrl} 
              alt={APP_TITLE} 
              className="w-full h-full object-cover transition-transform duration-[20s] group-hover:scale-110"
            />
            
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950/70 via-transparent to-stone-950/40" />
            
            <div className="absolute inset-0 p-6 md:p-12 flex flex-col justify-end items-center text-center">
              <div className="w-16 md:w-20 h-1 md:h-1.5 bg-amber-400 mx-auto mb-4 rounded-full shadow-[0_0_20px_rgba(251,191,36,0.9)] opacity-60" />
            </div>
          </div>

          <div className="p-8 md:p-12 bg-stone-50 flex flex-col items-center">
            <p className="text-stone-600 text-sm md:text-base mb-8 md:mb-10 font-medium italic max-w-xs md:max-w-sm text-center leading-relaxed">
              "Deep within the Forest of Forgotten Dreams, the ancient Glyphs have vanished. Only an explorer with your sharp mind can bring them back."
            </p>
            <button
              onClick={onStart}
              className="group relative w-full bg-stone-900 text-white font-bold py-5 md:py-6 px-8 md:px-12 rounded-2xl md:rounded-3xl text-xl md:text-2xl shadow-[0_20px_40px_rgba(0,0,0,0.3)] transition-all hover:bg-stone-800 active:scale-[0.97] overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              <span className="relative z-10 flex items-center justify-center gap-3 md:gap-4 uppercase tracking-[0.2em] md:tracking-[0.25em] text-xs md:text-lg font-playful">
                Start Quest
                <span className="group-hover:translate-x-3 transition-transform text-xl md:text-2xl">➜</span>
              </span>
            </button>
          </div>
        </div>
        
        <div className="absolute -left-2 md:-left-4 top-8 bottom-8 w-2 md:w-4 bg-black/40 rounded-l-full blur-[2px] md:blur-[3px]" />
      </div>
    </div>
  );
};

export default BookCover;
