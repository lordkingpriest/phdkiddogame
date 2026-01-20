
import React, { useState, useEffect, useRef } from 'react';
import { PuzzleItem, Difficulty } from '../types';
import { generateSpellingPuzzles, speakText } from '../services/geminiService';

export interface GameStats {
  correct: number;
  incorrect: number;
  totalScore: number;
  timeOut?: boolean;
}

interface ActivityPageProps {
  difficulty: Difficulty;
  onComplete: (stats: GameStats) => void;
  isMusicEnabled: boolean;
  toggleMusic: () => void;
  isDarkMode: boolean;
}

const ordinal = (n: number) => {
  if (n === 1) return "1st";
  if (n === 2) return "2nd";
  if (n === 3) return "3rd";
  return `${n}th`;
};

const getExampleWord = (char: string) => {
  const examples: Record<string, string> = {
    A: 'Apple', B: 'Ball', C: 'Cat', D: 'Dog', E: 'Elephant', F: 'Fish', G: 'Goat', H: 'Hat', I: 'Igloo', J: 'Jam', K: 'Kite', L: 'Lion', M: 'Moon', N: 'Nest', O: 'Octopus', P: 'Pig', Q: 'Queen', R: 'Rabbit', S: 'Sun', T: 'Tiger', U: 'Umbrella', V: 'Van', W: 'Watch', X: 'Xylophone', Y: 'Yo-yo', Z: 'Zebra'
  };
  return examples[char.toUpperCase()] || 'something fun';
};

const ActivityPage: React.FC<ActivityPageProps> = ({ difficulty, onComplete, isMusicEnabled, toggleMusic, isDarkMode }) => {
  const [currentPuzzles, setCurrentPuzzles] = useState<PuzzleItem[]>([]);
  const [answers, setAnswers] = useState<Record<number, Record<number, string>>>({});
  const [feedback, setFeedback] = useState<Record<number, boolean>>({});
  const [wrongIndices, setWrongIndices] = useState<Record<number, number[]>>({});
  const [puzzleErrors, setPuzzleErrors] = useState<Record<number, number>>({});
  const [specificHints, setSpecificHints] = useState<Record<number, string>>({});
  const [stats, setStats] = useState<GameStats>({ correct: 0, incorrect: 0, totalScore: 1000 });
  const [isShuffling, setIsShuffling] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [maxTime, setMaxTime] = useState<number>(0);
  const [gameActive, setGameActive] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  
  const audioCtxRef = useRef<AudioContext | null>(null);
  const timerRef = useRef<number | null>(null);

  const getInitialTime = (diff: Difficulty) => {
    switch (diff) {
      case Difficulty.EASY: return 300;
      case Difficulty.MEDIUM: return 240;
      case Difficulty.HARD: return 180;
      default: return 240;
    }
  };

  const fetchPuzzles = async () => {
    setIsShuffling(true);
    setGameActive(false);
    setShowSummary(false);
    try {
      const puzzles = await generateSpellingPuzzles(difficulty, [], 10);
      setCurrentPuzzles(puzzles);
      const initialTime = getInitialTime(difficulty);
      setTimeLeft(initialTime);
      setMaxTime(initialTime);
      setAnswers({});
      setFeedback({});
      setWrongIndices({});
      setPuzzleErrors({});
      setSpecificHints({});
      setStats({ correct: 0, incorrect: 0, totalScore: 1000 });
    } catch (error) {
      console.error("Failed to load puzzles", error);
    } finally {
      setIsShuffling(false);
      setGameActive(true);
    }
  };

  useEffect(() => {
    fetchPuzzles();
  }, [difficulty]);

  useEffect(() => {
    if (gameActive && timeLeft > 0) {
      timerRef.current = window.setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && gameActive) {
      handleTimeUp();
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameActive, timeLeft]);

  const handleTimeUp = () => {
    setGameActive(false);
    setStats(prev => ({ ...prev, timeOut: true }));
    setShowSummary(true);
  };

  const initAudio = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
  };

  const playSuccessSound = () => {
    initAudio();
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.08);
      gain.gain.setValueAtTime(0, now + i * 0.08);
      gain.gain.linearRampToValueAtTime(0.1, now + i * 0.08 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + i * 0.08);
      osc.stop(now + i * 0.08 + 0.4);
    });
  };

  const playErrorSound = () => {
    initAudio();
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(300, now);
    osc.frequency.exponentialRampToValueAtTime(100, now + 0.2);
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.linearRampToValueAtTime(0, now + 0.25);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(now + 0.3);
  };

  const playFanfare = () => {
    initAudio();
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    const now = ctx.currentTime;
    const scale = [523.25, 659.25, 783.99, 1046.50, 1318.51]; 
    scale.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, now + i * 0.1);
      gain.gain.setValueAtTime(0, now + i * 0.1);
      gain.gain.linearRampToValueAtTime(0.05, now + i * 0.1 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + i * 0.1);
      osc.stop(now + i * 0.1 + 0.5);
    });
  };

  const handleInputChange = (puzzleId: number, charIndex: number, value: string) => {
    if (!gameActive) return;
    const char = value.slice(-1).toLowerCase();
    if (char && !/[a-z]/.test(char)) return;

    setWrongIndices(prev => ({
      ...prev,
      [puzzleId]: (prev[puzzleId] || []).filter(idx => idx !== charIndex)
    }));

    setAnswers(prev => ({
      ...prev,
      [puzzleId]: { ...(prev[puzzleId] || {}), [charIndex]: char }
    }));
  };

  const checkPuzzle = (puzzle: PuzzleItem) => {
    if (!gameActive || feedback[puzzle.id]) return;
    
    const userAnswers = answers[puzzle.id] || {};
    const blanks = puzzle.pattern.split('').map((c, i) => c === '_' ? i : -1).filter(i => i !== -1);
    
    const isComplete = blanks.every(idx => userAnswers[idx] && userAnswers[idx].length > 0);
    if (!isComplete) return;

    let isCorrect = true;
    const currentWrong: number[] = [];
    blanks.forEach(idx => {
      if (userAnswers[idx] !== puzzle.word[idx].toLowerCase()) {
        isCorrect = false;
        currentWrong.push(idx);
      }
    });

    if (isCorrect) {
      setFeedback(prev => ({ ...prev, [puzzle.id]: true }));
      setStats(prev => ({ ...prev, correct: prev.correct + 1, totalScore: prev.totalScore + 100 }));
      setWrongIndices(prev => { const next = { ...prev }; delete next[puzzle.id]; return next; });
      setSpecificHints(prev => { const next = { ...prev }; delete next[puzzle.id]; return next; });
      playSuccessSound();
      speakText(`Correct! That word is ${puzzle.word}`);
    } else {
      setPuzzleErrors(prev => ({ ...prev, [puzzle.id]: (prev[puzzle.id] || 0) + 1 }));
      setStats(prev => ({ ...prev, incorrect: prev.incorrect + 1, totalScore: Math.max(0, prev.totalScore - 20) }));
      setWrongIndices(prev => ({ ...prev, [puzzle.id]: currentWrong }));
      
      const firstWrong = currentWrong[0];
      const correctChar = puzzle.word[firstWrong].toUpperCase();
      const hintMsg = `The ${ordinal(firstWrong + 1)} letter starts like ${getExampleWord(correctChar)}.`;
      setSpecificHints(prev => ({ ...prev, [puzzle.id]: hintMsg }));
      
      playErrorSound();
      speakText(hintMsg);
    }
  };

  const shufflePuzzles = () => {
    if (!gameActive) return;
    setIsShuffling(true);
    setTimeout(() => {
      setCurrentPuzzles(prev => [...prev].sort(() => Math.random() - 0.5));
      setIsShuffling(false);
    }, 400);
  };

  const allSolved = currentPuzzles.length > 0 && stats.correct === currentPuzzles.length;

  useEffect(() => {
    if (allSolved && gameActive) {
      setGameActive(false);
      setShowSummary(true);
      playFanfare();
      speakText("Wonderful! You've found all the missing glyphs!");
    }
  }, [allSolved, gameActive]);

  return (
    <div className={`min-h-screen transition-colors duration-500 py-12 px-4 md:px-8 ${isDarkMode ? 'bg-stone-950 text-stone-100' : 'bg-stone-50 text-stone-900'}`}>
      <div className="fixed top-0 left-0 w-full h-3 bg-stone-200 dark:bg-stone-800 z-[100]">
        <div 
          className={`h-full transition-all duration-1000 ease-linear ${timeLeft < 30 ? 'bg-rose-500 animate-pulse' : 'bg-emerald-400'}`}
          style={{ width: `${(timeLeft / maxTime) * 100}%` }}
        />
      </div>

      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-12">
          <div className={`inline-block px-10 py-4 rounded-3xl shadow-xl border-4 mb-6 transition-all ${isDarkMode ? 'bg-stone-900 border-emerald-900/30' : 'bg-white border-emerald-100'}`}>
            <h1 className={`text-4xl md:text-6xl font-playful ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
              🔤 Ancient Spelling
            </h1>
          </div>
          <p className={`text-lg md:text-2xl font-semibold max-w-2xl mx-auto transition-colors ${isDarkMode ? 'text-stone-400' : 'text-stone-500'}`}>
            Restore the broken words to repair the Forest of Forgotten Dreams.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4 md:gap-12 mt-10">
            <div className={`p-4 rounded-2xl shadow-md border min-w-[120px] transition-all ${isDarkMode ? 'bg-stone-900 border-stone-800' : 'bg-white border-stone-100'}`}>
              <span className="text-[10px] font-bold uppercase text-stone-400 block mb-1">Score</span>
              <span className={`text-3xl font-playful ${isDarkMode ? 'text-amber-400' : 'text-amber-600'}`}>
                {stats.totalScore}
              </span>
            </div>
            <div className={`p-4 rounded-2xl shadow-md border min-w-[120px] transition-all ${isDarkMode ? 'bg-stone-900 border-stone-800' : 'bg-white border-stone-100'}`}>
              <span className="text-[10px] font-bold uppercase text-stone-400 block mb-1">Clock</span>
              <span className={`text-3xl font-playful ${timeLeft < 20 ? 'text-rose-500 animate-pulse' : isDarkMode ? 'text-stone-300' : 'text-stone-700'}`}>
                {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
              </span>
            </div>
            <div className={`p-4 rounded-2xl shadow-md border min-w-[120px] transition-all ${isDarkMode ? 'bg-stone-900 border-stone-800' : 'bg-white border-stone-100'}`}>
              <span className="text-[10px] font-bold uppercase text-stone-400 block mb-1">Found</span>
              <span className="text-3xl font-playful text-emerald-500">
                {stats.correct} / {currentPuzzles.length}
              </span>
            </div>
            <div className={`p-4 rounded-2xl shadow-md border min-w-[120px] transition-all ${isDarkMode ? 'bg-stone-900 border-stone-800' : 'bg-white border-stone-100'}`}>
              <span className="text-[10px] font-bold uppercase text-stone-400 block mb-1">Errors</span>
              <span className="text-3xl font-playful text-rose-400">{stats.incorrect}</span>
            </div>
          </div>
        </header>

        {isShuffling ? (
          <div className={`flex flex-col items-center justify-center py-20 rounded-[4rem] border-4 border-dashed transition-all ${isDarkMode ? 'bg-stone-900/50 border-stone-800' : 'bg-white/50 border-stone-200'}`}>
            <div className="w-24 h-24 border-8 border-stone-100 border-t-emerald-500 rounded-full animate-spin mb-8 shadow-inner"></div>
            <h2 className="text-3xl font-playful text-stone-400 animate-pulse text-center">
              Re-shuffling the glyphs...
            </h2>
          </div>
        ) : (
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {currentPuzzles.map((puzzle) => {
              const hasErrors = wrongIndices[puzzle.id] && wrongIndices[puzzle.id].length > 0;
              const perPuzzleErrorCount = puzzleErrors[puzzle.id] || 0;
              return (
                <div 
                  key={puzzle.id}
                  className={`rounded-[2.5rem] p-8 shadow-xl border-4 transition-all duration-500 transform hover:scale-[1.03] ${
                    isDarkMode ? 'bg-stone-900' : 'bg-white'
                  } ${
                    feedback[puzzle.id] === true ? (isDarkMode ? 'border-emerald-700 ring-4 ring-emerald-900/20' : 'border-emerald-400 ring-4 ring-emerald-50') : 
                    hasErrors ? (isDarkMode ? 'border-rose-700 ring-4 ring-rose-900/20' : 'border-rose-300 ring-4 ring-rose-50') : 
                    (isDarkMode ? 'border-stone-800' : 'border-transparent')
                  }`}
                >
                  <div className="flex flex-col h-full">
                    <div className="flex justify-between items-start mb-4">
                      <button 
                        onClick={() => speakText(puzzle.word)}
                        className={`p-3 rounded-2xl transition-all text-2xl shadow-inner active:scale-90 ${isDarkMode ? 'bg-stone-800 hover:bg-emerald-900/40' : 'bg-stone-50 hover:bg-emerald-50'}`}
                        title="Listen"
                      >
                        🔊
                      </button>
                      <div className="flex flex-col items-end">
                        {feedback[puzzle.id] === true && <span className="text-3xl animate-bounce">✨</span>}
                        {perPuzzleErrorCount > 0 && (
                          <span className={`text-[10px] font-bold uppercase py-1 px-3 rounded-full mt-2 ${isDarkMode ? 'bg-rose-900/40 text-rose-400' : 'bg-rose-50 text-rose-500'}`}>
                             {perPuzzleErrorCount} misses
                          </span>
                        )}
                      </div>
                    </div>

                    <p className={`text-xs font-bold uppercase tracking-widest mb-4 italic text-center ${isDarkMode ? 'text-stone-500' : 'text-stone-400'}`}>
                      " {puzzle.hint} "
                    </p>

                    <div className="flex flex-wrap items-center justify-center gap-2 my-6">
                      {puzzle.pattern.split('').map((char, idx) => {
                        const isWrong = wrongIndices[puzzle.id]?.includes(idx);
                        return char === '_' ? (
                          <input
                            key={idx}
                            type="text"
                            maxLength={1}
                            disabled={feedback[puzzle.id] === true || !gameActive}
                            value={answers[puzzle.id]?.[idx] || ''}
                            onChange={(e) => handleInputChange(puzzle.id, idx, e.target.value)}
                            onBlur={() => checkPuzzle(puzzle)}
                            onKeyDown={(e) => { if(e.key === 'Enter') checkPuzzle(puzzle); }}
                            className={`w-11 h-16 text-center text-3xl font-bold border-b-8 focus:outline-none transition-all uppercase rounded-t-lg ${
                              feedback[puzzle.id] === true ? (isDarkMode ? 'text-emerald-400 border-emerald-700 bg-emerald-900/20' : 'text-emerald-600 border-emerald-200 bg-emerald-50') : 
                              isWrong ? (isDarkMode ? 'text-rose-400 border-rose-700 bg-rose-900/20 animate-shake' : 'text-rose-600 border-rose-400 bg-rose-50 animate-shake') : 
                              (isDarkMode ? 'text-stone-200 border-stone-700 bg-stone-800 focus:border-emerald-600' : 'text-stone-700 border-stone-100 bg-stone-50 focus:border-emerald-400')
                            }`}
                          />
                        ) : (
                          <span key={idx} className={`w-8 h-16 flex items-center justify-center text-3xl font-bold uppercase ${isDarkMode ? 'text-stone-300' : 'text-stone-800'}`}>
                            {char}
                          </span>
                        )
                      })}
                    </div>

                    {specificHints[puzzle.id] && (
                      <div className={`text-[11px] font-bold mt-4 text-center p-3 rounded-2xl border animate-in fade-in slide-in-from-top-2 ${isDarkMode ? 'bg-rose-900/20 border-rose-800 text-rose-400' : 'bg-rose-50 border-rose-100 text-rose-500'}`}>
                         💡 {specificHints[puzzle.id]}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </section>
        )}

        <div className="flex flex-wrap justify-center gap-4 md:gap-6 mb-12">
          <button
            onClick={shufflePuzzles}
            disabled={isShuffling || !gameActive}
            className={`font-bold py-5 px-10 rounded-3xl text-xl shadow-xl transition-all active:scale-95 disabled:opacity-50 flex items-center gap-3 ${isDarkMode ? 'bg-amber-600 hover:bg-amber-500 text-white' : 'bg-amber-500 hover:bg-amber-400 text-white'}`}
          >
            🔀 Shuffle Order
          </button>
          <button
            onClick={fetchPuzzles}
            disabled={isShuffling}
            className={`font-bold py-5 px-12 rounded-3xl text-xl shadow-2xl transition-all active:scale-95 disabled:opacity-50 ${isDarkMode ? 'bg-stone-800 hover:bg-stone-700 text-white' : 'bg-stone-900 hover:bg-stone-800 text-white'}`}
          >
            🔄 Reset All
          </button>
          <button
            onClick={toggleMusic}
            className={`font-bold py-5 px-8 rounded-3xl text-xl shadow-lg border-2 transition-all ${isDarkMode ? 'bg-stone-900 border-stone-800 text-stone-300' : 'bg-white border-stone-100 text-stone-600'}`}
          >
            {isMusicEnabled ? "🔊 Music On" : "🔇 Silence"}
          </button>
        </div>
      </div>

      {showSummary && (
        <div className="fixed inset-0 bg-stone-950/95 flex flex-col items-center justify-center z-[200] p-6 text-center backdrop-blur-xl animate-in fade-in zoom-in">
          <div className={`rounded-[4rem] p-12 max-w-md w-full shadow-2xl border-8 transition-all ${isDarkMode ? 'bg-stone-900 border-stone-800' : 'bg-white border-stone-100'}`}>
            <div className="text-9xl mb-10 animate-wiggle">
              {allSolved ? '💎' : '⏳'}
            </div>
            
            <h2 className={`text-5xl font-playful mb-4 ${isDarkMode ? 'text-emerald-400' : 'text-stone-800'}`}>
              {allSolved ? 'Quest Complete!' : "Time Elapsed!"}
            </h2>
            
            <p className={`mb-10 font-semibold text-lg ${isDarkMode ? 'text-stone-400' : 'text-stone-500'}`}>
              {allSolved ? "The forest is healing thanks to you!" : "Every explorer needs a rest. Try again?"}
            </p>

            <div className={`rounded-[2.5rem] p-10 mb-10 border-4 ${isDarkMode ? 'bg-stone-950 border-stone-800' : 'bg-stone-50 border-stone-100'}`}>
              <div className="flex justify-between items-center mb-6">
                <span className="text-stone-400 font-bold uppercase tracking-widest text-xs">Total Score</span>
                <span className={`text-4xl font-playful ${isDarkMode ? 'text-amber-400' : 'text-amber-600'}`}>{stats.totalScore}</span>
              </div>
              <div className="flex justify-between items-center mb-6">
                <span className="text-stone-400 font-bold uppercase tracking-widest text-xs">Glyphs Found</span>
                <span className="text-4xl font-playful text-emerald-600">{stats.correct}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-stone-400 font-bold uppercase tracking-widest text-xs">Missteps</span>
                <span className="text-4xl font-playful text-rose-400">{stats.incorrect}</span>
              </div>
            </div>

            <button
              onClick={() => onComplete(stats)}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-6 px-10 rounded-[2rem] text-2xl shadow-2xl transition-all active:scale-95"
            >
              Collect Rewards
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivityPage;
