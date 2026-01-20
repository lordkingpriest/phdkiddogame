
import React, { useState, useEffect, useRef } from 'react';
import { WorldData, WorldType, Difficulty, SessionHistory, BibleRegion } from '../types';
import { BIBLE_REGIONS } from '../constants';
import { 
  generateSpellingPuzzles, 
  generateMathPuzzles, 
  generateScramblePuzzles, 
  generateDiscoveryPuzzles, 
  generateBiblePuzzles,
  generateCategorizedPuzzles,
  speakText 
} from '../services/geminiService';

const CORRECT_FEEDBACK = [
  "✅ Correct! Great job!",
  "🌟 That’s right!",
  "🎉 Well done! You got it!",
  "👍 Yes! Keep going!",
  "✨ Brilliant discovery!"
];

const INCORRECT_FEEDBACK = [
  "❌ Not quite. Try again!",
  "😊 Oops! Let’s give it another try.",
  "Almost! Have another go.",
  "That’s okay—keep trying!"
];

interface GameHostProps {
  world: WorldData;
  difficulty: Difficulty;
  history: SessionHistory;
  onBack: () => void;
  onComplete: (stars: number, session: Partial<SessionHistory>, perf: 'up' | 'down' | 'stay') => void;
}

const GameHost: React.FC<GameHostProps> = ({ world, difficulty, history, onBack, onComplete }) => {
  const [puzzles, setPuzzles] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [answerStatus, setAnswerStatus] = useState<'correct' | 'incorrect' | null>(null);
  const [feedbackText, setFeedbackText] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [mistakes, setMistakes] = useState(0);
  const [timeLeft, setTimeLeft] = useState(300);
  const [maxTime] = useState(300);
  
  // Bible Specific State
  const [bibleRegionIndex, setBibleRegionIndex] = useState(0);
  const [showRegionIntro, setShowRegionIntro] = useState(false);

  const currentRegion = BIBLE_REGIONS[bibleRegionIndex];
  const timerRef = useRef<number | null>(null);

  const fetchContent = async (overrideRegion?: BibleRegion) => {
    setLoading(true);
    setMistakes(0);
    setAttempts(0);
    setShowHint(false);
    setCurrentIndex(0);
    setTimeLeft(maxTime);
    
    let data: any[] = [];
    try {
      if (world.type === WorldType.ALPHABET_FOREST) {
        data = await generateSpellingPuzzles(difficulty, history.usedWords, 5);
      } else if (world.type === WorldType.NUMBER_VALLEY) {
        data = await generateMathPuzzles(difficulty, history.usedNumbers, 5);
      } else if (world.type === WorldType.PUZZLE_PLAYGROUND) {
        data = await generateScramblePuzzles(difficulty, history.usedWords, 5);
      } else if (world.type === WorldType.DISCOVERY_ISLAND) {
        data = await generateDiscoveryPuzzles(difficulty, history.usedFacts, 5);
      } else if (world.type === WorldType.BIBLE_ADVENTURE) {
        data = await generateBiblePuzzles(overrideRegion || currentRegion, difficulty, 5);
      } else if (
        world.type === WorldType.WORLD_EXPLORER_COVE || 
        world.type === WorldType.SCIENCE_LAB_QUEST || 
        world.type === WorldType.CREATIVE_CASTLE || 
        world.type === WorldType.LOGIC_TIME_TOWER ||
        world.type === WorldType.BUSINESS_MONEY_WISDOM
      ) {
        data = await generateCategorizedPuzzles(world.name, world.description, difficulty, 5);
      }
    } catch (e) {
      console.error("Content fetch failed", e);
    }
    
    setPuzzles(data);
    setLoading(false);
    if (data.length > 0) {
      const first = data[0];
      const introMsg = world.type === WorldType.BIBLE_ADVENTURE 
        ? `Let's explore ${currentRegion.name}! ${first.question}`
        : (first.question || first.hint || `Can you find the word ${first.word}?`);
      speakText(introMsg);
    }
  };

  useEffect(() => {
    if (world.type === WorldType.BIBLE_ADVENTURE) {
      setShowRegionIntro(true);
      speakText(`Welcome to the ${currentRegion.name}! This part of our adventure is about ${currentRegion.theme}. Are you ready?`);
    } else {
      fetchContent();
    }
    
    timerRef.current = window.setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [world]);

  const startRegion = () => {
    setShowRegionIntro(false);
    fetchContent();
  };

  const handleChoice = (selected: any) => {
    if (answerStatus === 'correct') return;
    const current = puzzles[currentIndex];
    let isCorrect = false;

    if (world.type === WorldType.NUMBER_VALLEY) {
      isCorrect = selected === current.answer;
    } else if (world.type === WorldType.ALPHABET_FOREST) {
      isCorrect = selected.toLowerCase() === current.word.toLowerCase();
    } else if (world.type === WorldType.PUZZLE_PLAYGROUND) {
      isCorrect = selected.toLowerCase() === current.correct.toLowerCase();
    } else {
      isCorrect = selected === current.answer;
    }

    if (isCorrect) {
      const msg = CORRECT_FEEDBACK[Math.floor(Math.random() * CORRECT_FEEDBACK.length)];
      setAnswerStatus('correct');
      setFeedbackText(msg);
      speakText(msg);
      
      setTimeout(() => {
        if (currentIndex < puzzles.length - 1) {
          setCurrentIndex(prev => prev + 1);
          setAnswerStatus(null);
          setFeedbackText("");
          setAttempts(0);
          setShowHint(false);
          const next = puzzles[currentIndex + 1];
          speakText(next.question || next.hint || "Ready for the next one?");
        } else {
          if (world.type === WorldType.BIBLE_ADVENTURE && bibleRegionIndex < BIBLE_REGIONS.length - 1) {
            const nextIdx = bibleRegionIndex + 1;
            setBibleRegionIndex(nextIdx);
            setShowRegionIntro(true);
            setAnswerStatus(null);
            setFeedbackText("");
            speakText(`Great job! You've finished this part! Now let's go to ${BIBLE_REGIONS[nextIdx].name}!`);
          } else {
            const usedWords = (world.type === WorldType.ALPHABET_FOREST || world.type === WorldType.PUZZLE_PLAYGROUND) ? puzzles.map(p => p.word || p.correct) : [];
            const performance = mistakes === 0 ? 'up' : mistakes > 4 ? 'down' : 'stay';
            onComplete(earnedStars(), { usedWords }, performance);
          }
        }
      }, 2000);
    } else {
      const msg = INCORRECT_FEEDBACK[Math.floor(Math.random() * INCORRECT_FEEDBACK.length)];
      setAnswerStatus('incorrect');
      setFeedbackText(msg);
      setMistakes(prev => prev + 1);
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      
      speakText(msg);

      if (newAttempts >= 2) {
        setShowHint(true);
      }

      setTimeout(() => setAnswerStatus(null), 1500);
    }
  };

  const earnedStars = () => {
    if (world.type === WorldType.BIBLE_ADVENTURE) return 25;
    return 10;
  };

  if (showRegionIntro) {
    return (
      <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center p-4 md:p-8 text-center">
        <div className="bg-white p-8 md:p-16 rounded-[2.5rem] md:rounded-[4rem] shadow-2xl border-8 border-amber-50 w-full max-w-2xl transform transition-all animate-in fade-in zoom-in overflow-y-auto max-h-[90vh]">
          <div className="text-7xl md:text-[10rem] mb-6 md:mb-10 drop-shadow-lg">{currentRegion.icon}</div>
          <h2 className="text-3xl md:text-5xl font-playful text-amber-600 mb-4 md:mb-6 uppercase tracking-wider">{currentRegion.name}</h2>
          <p className="text-lg md:text-2xl text-stone-500 mb-8 md:mb-12 font-medium italic">"{currentRegion.theme}"</p>
          <div className="bg-amber-50 p-6 md:p-8 rounded-2xl md:rounded-3xl mb-8 md:mb-12 border-2 border-amber-100">
             <p className="text-stone-600 font-bold uppercase tracking-widest text-[10px] mb-4">Upcoming Missions</p>
             <div className="flex flex-wrap justify-center gap-2">
                {currentRegion.missions.map(m => (
                  <span key={m} className="bg-white px-3 py-1.5 md:px-4 md:py-2 rounded-xl text-[10px] md:text-sm font-bold text-amber-700 shadow-sm border border-amber-100">{m}</span>
                ))}
             </div>
          </div>
          <button 
            onClick={startRegion}
            className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-4 md:py-6 px-8 md:px-12 rounded-2xl md:rounded-3xl text-xl md:text-3xl shadow-2xl transition-all active:scale-95 font-playful tracking-widest"
          >
            Start Mission
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-stone-50 p-6">
        <div className="w-16 h-16 md:w-20 md:h-20 border-8 border-stone-200 border-t-amber-500 rounded-full animate-spin mb-6"></div>
        <p className="text-2xl md:text-3xl font-playful text-stone-400 animate-pulse text-center">Preparing the next discovery...</p>
      </div>
    );
  }

  const current = puzzles[currentIndex];

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col items-center">
      <div className="fixed top-0 left-0 w-full h-1 md:h-2 bg-stone-200 z-[200]">
        <div 
          className={`h-full transition-all duration-1000 ease-linear ${timeLeft < 30 ? 'bg-rose-500 animate-pulse' : 'bg-emerald-400'}`}
          style={{ width: `${(timeLeft / maxTime) * 100}%` }}
        />
      </div>

      <header className="w-full max-w-5xl px-4 py-8 md:px-6 md:py-10 flex items-center justify-between gap-4 mt-4">
        <button onClick={onBack} className="bg-white px-4 py-2 md:px-6 md:py-3 rounded-xl md:rounded-2xl font-bold text-stone-500 shadow-sm border border-stone-100 hover:bg-stone-100 transition-all active:scale-90 flex items-center gap-2 text-sm md:text-base">
          <span>🗺️</span> <span className="hidden sm:inline">Map</span>
        </button>
        <div className="bg-white px-4 py-2 md:px-8 md:py-3 rounded-full shadow-lg border-2 border-stone-100 flex items-center gap-2 md:gap-3 flex-shrink min-w-0">
          <span className="text-xl md:text-2xl">{world.icon}</span>
          <span className="font-playful text-sm md:text-xl text-stone-800 uppercase tracking-widest truncate">
            {world.type === WorldType.BIBLE_ADVENTURE ? `${currentRegion.name}` : world.name}
          </span>
        </div>
        <div className="bg-stone-900 text-white px-4 py-2 md:px-6 md:py-3 rounded-xl md:rounded-2xl font-bold shadow-xl font-playful text-sm md:text-base whitespace-nowrap">
          {currentIndex + 1} / {puzzles.length}
        </div>
      </header>

      <main className="flex-grow w-full max-w-4xl px-4 pb-12 md:pb-20">
        <div className={`relative bg-white rounded-[2rem] md:rounded-[3.5rem] shadow-[0_30px_60px_rgba(0,0,0,0.06)] p-6 md:p-16 flex flex-col items-center justify-center min-h-[450px] md:min-h-[500px] border-8 transition-all duration-500 ${
          answerStatus === 'correct' ? 'border-emerald-400 scale-[1.01]' : 
          answerStatus === 'incorrect' ? 'border-rose-400 animate-shake' : 
          'border-stone-50'
        }`}>
          
          {answerStatus === 'correct' && (
            <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-emerald-500/10 backdrop-blur-[2px] rounded-[1.5rem] md:rounded-[3rem]">
              <div className="text-8xl md:text-[12rem] animate-bounce mb-4">✨</div>
              <p className="text-2xl md:text-4xl font-playful text-emerald-600 animate-pulse px-4 text-center">{feedbackText}</p>
            </div>
          )}
          
          {answerStatus === 'incorrect' && (
            <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-rose-500/5 backdrop-blur-[1px] rounded-[1.5rem] md:rounded-[3rem]">
              <div className="text-7xl md:text-[10rem] mb-4">😊</div>
              <p className="text-xl md:text-3xl font-playful text-rose-500 px-4 text-center">{feedbackText}</p>
            </div>
          )}

          {showHint && answerStatus === null && (
            <div className="absolute top-4 right-4 md:top-10 md:right-10 z-[60] animate-bounce bg-yellow-400 text-yellow-900 px-4 py-2 md:px-6 md:py-3 rounded-xl md:rounded-2xl shadow-xl border-2 border-yellow-200 font-bold flex items-center gap-2 text-xs md:text-base">
              💡 Hint: {current.hint || "Look closely!"}
            </div>
          )}

          {world.type === WorldType.ALPHABET_FOREST && (
            <div className="w-full text-center">
              <h3 className="text-lg md:text-3xl font-semibold text-stone-600 mb-8 md:mb-12 italic leading-tight px-4">"{current.hint}"</h3>
              <div className="flex justify-center flex-wrap gap-2 md:gap-3 mb-10 md:mb-16">
                {current.pattern.split('').map((char: string, i: number) => (
                  <div key={i} className={`w-10 h-14 md:w-20 md:h-24 rounded-xl md:rounded-2xl flex items-center justify-center text-2xl md:text-6xl font-playful border-b-4 md:border-b-8 shadow-inner transition-all ${char === '_' ? 'bg-stone-50 border-stone-200 text-stone-300' : 'bg-emerald-50 border-emerald-200 text-emerald-600'}`}>
                    {char === '_' ? '?' : char}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 sm:grid-cols-9 md:grid-cols-10 gap-1 md:gap-2">
                {"ABCDEFGHIJKLMNOPQRSTUVWXYZ".split('').map(letter => (
                  <button 
                    key={letter}
                    onClick={() => handleChoice(current.word.toLowerCase().includes(letter.toLowerCase()) ? current.word : 'wrong')} 
                    className="aspect-square bg-white border border-stone-100 hover:border-emerald-400 hover:bg-emerald-50 rounded-lg md:rounded-xl text-sm md:text-xl font-bold transition-all active:scale-90 shadow-sm text-stone-700"
                  >
                    {letter}
                  </button>
                ))}
              </div>
            </div>
          )}

          {world.type === WorldType.NUMBER_VALLEY && (
            <div className="text-center w-full">
              <div className="text-5xl md:text-[9rem] mb-8 md:mb-12 animate-wiggle drop-shadow-xl">{current.visualItems}</div>
              <h3 className="text-3xl md:text-6xl font-playful text-indigo-600 mb-10 md:mb-16">{current.question}</h3>
              <div className="flex flex-wrap gap-4 md:gap-6 justify-center">
                {current.options.map((opt: number) => (
                  <button 
                    key={opt}
                    onClick={() => handleChoice(opt)}
                    className="w-20 h-20 md:w-32 md:h-32 bg-indigo-500 hover:bg-indigo-600 text-white rounded-2xl md:rounded-[2rem] text-3xl md:text-6xl font-playful shadow-2xl transition-all active:scale-95 flex items-center justify-center hover:rotate-3"
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {world.type === WorldType.PUZZLE_PLAYGROUND && (
            <div className="text-center w-full">
               <div className="text-6xl md:text-8xl mb-6 md:mb-8">🧩</div>
               <h3 className="text-xl md:text-3xl font-playful text-fuchsia-600 mb-4 md:mb-6 italic">"{current.hint}"</h3>
               <div className="flex justify-center flex-wrap gap-2 md:gap-3 mb-10 md:mb-16 px-4">
                 {current.scrambled.split('').map((c: string, i: number) => (
                   <div key={i} className="w-12 h-12 md:w-20 md:h-20 bg-fuchsia-50 text-fuchsia-600 rounded-xl md:rounded-2xl border-2 md:border-4 border-fuchsia-100 flex items-center justify-center text-xl md:text-4xl font-bold" style={{animationDelay: `${i*0.1}s`}}>
                     {c.toUpperCase()}
                   </div>
                 ))}
               </div>
               <button onClick={() => handleChoice(current.correct)} className="bg-fuchsia-600 hover:bg-fuchsia-700 text-white px-8 py-4 md:px-16 md:py-6 rounded-2xl md:rounded-[2rem] text-xl md:text-3xl font-playful shadow-2xl transition-all active:scale-95 uppercase tracking-widest">
                 Unlock Glyph
               </button>
            </div>
          )}

          {(puzzles.length > 0 && 
            (world.type === WorldType.DISCOVERY_ISLAND || 
             world.type === WorldType.BIBLE_ADVENTURE || 
             world.type === WorldType.WORLD_EXPLORER_COVE || 
             world.type === WorldType.SCIENCE_LAB_QUEST || 
             world.type === WorldType.CREATIVE_CASTLE || 
             world.type === WorldType.LOGIC_TIME_TOWER ||
             world.type === WorldType.BUSINESS_MONEY_WISDOM)) && (
            <div className="text-center w-full max-w-2xl px-2">
              <div className="text-7xl md:text-9xl mb-6 md:mb-10 animate-wiggle drop-shadow-lg">{current.helperEmoji || world.icon}</div>
              <p className="text-[10px] md:text-xs font-black uppercase tracking-[0.5em] text-amber-500 mb-2 md:mb-4">{current.category || world.name}</p>
              <h3 className="text-xl md:text-4xl font-semibold text-stone-700 mb-8 md:mb-12 leading-snug px-2">{current.question}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-5 w-full">
                {current.options.map((opt: string) => (
                  <button 
                    key={opt}
                    onClick={() => handleChoice(opt)}
                    className={`p-4 md:p-8 bg-white border-2 md:border-4 rounded-xl md:rounded-[2.5rem] text-sm md:text-xl font-bold transition-all active:scale-95 text-stone-600 shadow-lg text-left sm:text-center ${
                      showHint && opt === current.answer ? 'border-amber-400 ring-4 ring-amber-100 animate-pulse' : 'border-stone-50'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 md:mt-12 flex justify-center gap-4 md:gap-6">
          <button 
            onClick={() => speakText(current.question || current.hint || "Let's find the answer together!")}
            className="bg-white hover:bg-stone-50 px-6 py-3 md:px-10 md:py-5 rounded-full shadow-xl border border-stone-100 flex items-center gap-2 md:gap-4 transition-all hover:scale-105 active:scale-95 group"
          >
            <span className="text-xl md:text-3xl group-hover:scale-125 transition-transform">🔊</span> <span className="font-bold text-stone-600 uppercase tracking-widest text-[10px] md:text-sm">Listen</span>
          </button>
        </div>
      </main>
    </div>
  );
};

export default GameHost;
