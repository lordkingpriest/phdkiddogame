
import React, { useState, useEffect, useRef } from 'react';
import { PageState, Difficulty, WorldType, WorldData, SessionHistory } from './types';
import { APP_TITLE, AUTHOR_NAME, WORLDS } from './constants';
import { generateBookCover, speakText } from './services/geminiService';
import BookCover from './components/BookCover';
import WorldMap from './components/WorldMap';
import GameHost from './components/GameHost';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<PageState>(PageState.COVER);
  const [selectedWorld, setSelectedWorld] = useState<WorldData | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.EASY);
  
  // Local Persistence initialization
  const [stars, setStars] = useState<number>(() => {
    const saved = localStorage.getItem('explorer_stars');
    return saved ? parseInt(saved, 10) : 0;
  });

  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('explorer_darkmode');
    return saved === 'true';
  });
  
  const [coverImageUrl, setCoverImageUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isMusicEnabled, setIsMusicEnabled] = useState<boolean>(false);
  
  const [history, setHistory] = useState<SessionHistory>(() => {
    const saved = localStorage.getItem('explorer_history');
    return saved ? JSON.parse(saved) : { usedWords: [], usedNumbers: [], usedFacts: [] };
  });
  
  const [consecutiveCorrect, setConsecutiveCorrect] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Sync state to local storage
  useEffect(() => { localStorage.setItem('explorer_stars', stars.toString()); }, [stars]);
  useEffect(() => { localStorage.setItem('explorer_history', JSON.stringify(history)); }, [history]);
  useEffect(() => { localStorage.setItem('explorer_darkmode', isDarkMode.toString()); }, [isDarkMode]);

  useEffect(() => {
    const fetchCover = async () => {
      setIsLoading(true);
      try {
        const url = await generateBookCover(APP_TITLE, AUTHOR_NAME);
        setCoverImageUrl(url);
      } catch (e) {
        console.error("Cover failed", e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCover();
  }, []);

  const toggleMusic = () => {
    if (!audioRef.current) return;
    if (isMusicEnabled) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(() => console.warn("Music blocked"));
    }
    setIsMusicEnabled(!isMusicEnabled);
  };

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  const startJourney = () => {
    setCurrentPage(PageState.WORLD_MAP);
    speakText(`Hi! My name is Batsi! Welcome to PhD Kids! Let's learn and have fun together! I am so excited to be your guide. Pick a world to begin!`);
  };

  const enterWorld = (world: WorldData) => {
    setSelectedWorld(world);
    setCurrentPage(PageState.GAME_ACTIVE);
    speakText(`Entering ${world.name}. You're doing amazing already. Let's explore together!`);
  };

  const handleGameComplete = (earnedStars: number, newUsedItems: Partial<SessionHistory>, performance: 'up' | 'down' | 'stay') => {
    setStars(prev => prev + earnedStars);
    
    setHistory(prev => ({
      usedWords: [...new Set([...prev.usedWords, ...(newUsedItems.usedWords || [])])].slice(-50),
      usedNumbers: [...new Set([...prev.usedNumbers, ...(newUsedItems.usedNumbers || [])])].slice(-50),
      usedFacts: [...new Set([...prev.usedFacts, ...(newUsedItems.usedFacts || [])])].slice(-50),
    }));

    if (performance === 'up') {
      const next = consecutiveCorrect + 1;
      setConsecutiveCorrect(next);
      if (next >= 3 && difficulty === Difficulty.EASY) setDifficulty(Difficulty.MEDIUM);
      if (next >= 6 && difficulty === Difficulty.MEDIUM) setDifficulty(Difficulty.HARD);
    } else if (performance === 'down') {
      setConsecutiveCorrect(0);
      if (difficulty === Difficulty.HARD) setDifficulty(Difficulty.MEDIUM);
      else if (difficulty === Difficulty.MEDIUM) setDifficulty(Difficulty.EASY);
    }
    setCurrentPage(PageState.SUCCESS);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-stone-950 text-emerald-500 p-6">
        <div className="relative w-16 h-16 md:w-24 md:h-24 mb-10">
          <div className="absolute inset-0 border-4 border-emerald-500/20 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <h2 className="font-playful text-2xl md:text-5xl text-center mb-4 tracking-wider animate-pulse uppercase">Opening {APP_TITLE}...</h2>
        <p className="text-stone-400 font-medium tracking-widest uppercase text-[10px]">Told by {AUTHOR_NAME}</p>
      </div>
    );
  }

  return (
    <div className={`min-h-screen relative transition-colors duration-500 ${isDarkMode ? 'bg-stone-950 text-stone-100' : 'bg-stone-50 text-stone-900'} selection:bg-emerald-200 overflow-x-hidden`}>
      <audio ref={audioRef} src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" loop />
      
      {currentPage !== PageState.COVER && (
        <div className="fixed top-4 left-4 right-4 md:top-6 md:left-6 md:right-6 z-[150] flex items-center justify-between pointer-events-none">
          <div className={`${isDarkMode ? 'bg-stone-900/90 border-stone-800' : 'bg-white/80 border-stone-100'} backdrop-blur-md px-4 py-2 md:px-6 md:py-3 rounded-2xl md:rounded-3xl shadow-2xl flex items-center gap-2 md:gap-4 border-2 pointer-events-auto`}>
            <span className="text-2xl md:text-3xl filter drop-shadow-sm">✨</span>
            <div className="flex flex-col">
              <span className={`text-[8px] md:text-[9px] font-black uppercase tracking-tighter ${isDarkMode ? 'text-stone-500' : 'text-stone-400'}`}>Stars</span>
              <span className={`font-playful text-xl md:text-2xl leading-none ${isDarkMode ? 'text-stone-200' : 'text-stone-800'}`}>{stars}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2 md:gap-4 pointer-events-auto">
            <button 
              onClick={toggleDarkMode}
              className={`${isDarkMode ? 'bg-stone-900/90 border-stone-800' : 'bg-white/80 border-stone-100'} backdrop-blur-md p-3 md:p-4 rounded-full shadow-2xl border-2 text-xl md:text-2xl hover:scale-110 active:scale-95 transition-all`}
            >
              {isDarkMode ? "☀️" : "🌙"}
            </button>
            <button 
              onClick={toggleMusic}
              className={`${isDarkMode ? 'bg-stone-900/90 border-stone-800' : 'bg-white/80 border-stone-100'} backdrop-blur-md p-3 md:p-4 rounded-full shadow-2xl border-2 text-xl md:text-2xl hover:scale-110 active:scale-95 transition-all`}
            >
              {isMusicEnabled ? "🎶" : "🔇"}
            </button>
            {currentPage !== PageState.WORLD_MAP && (
               <button 
               onClick={() => setCurrentPage(PageState.WORLD_MAP)}
               className="bg-stone-900 text-white p-3 md:p-4 rounded-full shadow-2xl text-xl md:text-2xl hover:scale-110 active:scale-95 transition-all"
             >
               🗺️
             </button>
            )}
          </div>
        </div>
      )}

      {currentPage === PageState.COVER && <BookCover imageUrl={coverImageUrl} onStart={startJourney} />}

      {currentPage === PageState.WORLD_MAP && <WorldMap onSelectWorld={enterWorld} />}

      {currentPage === PageState.GAME_ACTIVE && selectedWorld && (
        <GameHost 
          world={selectedWorld} 
          difficulty={difficulty} 
          history={history}
          onBack={() => setCurrentPage(PageState.WORLD_MAP)}
          onComplete={handleGameComplete}
        />
      )}

      {currentPage === PageState.SUCCESS && (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8 text-center bg-stone-900 animate-in fade-in zoom-in">
          <div className={`p-8 md:p-16 rounded-[2.5rem] md:rounded-[4rem] shadow-[0_50px_100px_rgba(0,0,0,0.5)] border-8 w-full max-w-lg transition-all ${isDarkMode ? 'bg-stone-900 border-stone-800' : 'bg-white border-emerald-50'}`}>
            <h2 className="text-4xl md:text-6xl font-playful text-emerald-600 mb-6 md:mb-8 uppercase">Brilliant!</h2>
            <div className="text-7xl md:text-9xl mb-8 md:text-10 transform rotate-12">🏆</div>
            <p className={`text-lg md:text-2xl mb-8 md:mb-12 font-medium leading-relaxed ${isDarkMode ? 'text-stone-400' : 'text-stone-500'}`}>Batsi says: You did it! You're doing amazing. Keep going!</p>
            <button 
              onClick={() => setCurrentPage(PageState.WORLD_MAP)}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 md:py-6 px-8 md:px-12 rounded-2xl md:rounded-3xl text-xl md:text-2xl shadow-2xl transition-all active:scale-95 font-playful tracking-widest"
            >
              Next Adventure
            </button>
          </div>
        </div>
      )}

      <footer className={`fixed bottom-4 left-4 md:bottom-6 md:left-6 opacity-20 text-[8px] md:text-[10px] pointer-events-none font-bold tracking-[0.3em] uppercase hidden md:block ${isDarkMode ? 'text-stone-600' : 'text-stone-900'}`}>
        &copy; {AUTHOR_NAME}
      </footer>
    </div>
  );
};

export default App;
