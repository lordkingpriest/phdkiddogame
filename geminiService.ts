
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { PuzzleItem, Difficulty, MathItem, DiscoveryItem, ScrambleItem, BibleRegion } from "../types";

// Local Fallback Data for Quota Resilience
const FALLBACK_SPELLING: Record<Difficulty, PuzzleItem[]> = {
  [Difficulty.EASY]: [
    { id: 101, word: "APPLE", pattern: "A_PLE", hint: "A sweet red fruit" },
    { id: 102, word: "BIRD", pattern: "B_RD", hint: "Something that flies" },
    { id: 103, word: "CAT", pattern: "C_T", hint: "A furry pet that meows" }
  ],
  [Difficulty.MEDIUM]: [
    { id: 201, word: "FOREST", pattern: "F_R_ST", hint: "A place with many trees" },
    { id: 202, word: "WIZARD", pattern: "W_Z_RD", hint: "Someone who does magic" },
    { id: 203, word: "GLYPH", pattern: "GL_PH", hint: "An ancient symbol" }
  ],
  [Difficulty.HARD]: [
    { id: 301, word: "EXPLORER", pattern: "E_PL_R_R", hint: "Someone traveling new places" },
    { id: 302, word: "MAGICAL", pattern: "M_G_C_L", hint: "Full of enchantment" },
    { id: 303, word: "DISCOVERY", pattern: "D_S_OV_RY", hint: "Finding something new" }
  ]
};

const FALLBACK_MATH: Record<Difficulty, MathItem[]> = {
  [Difficulty.EASY]: [{ id: 401, question: "1 + 2", answer: 3, options: [2, 3, 4], visualItems: "🍎 🍎🍎" }],
  [Difficulty.MEDIUM]: [{ id: 402, question: "5 + 5", answer: 10, options: [8, 10, 12], visualItems: "🖐️ 🖐️" }],
  [Difficulty.HARD]: [{ id: 403, question: "12 + 8", answer: 20, options: [18, 20, 22], visualItems: "🔢" }]
};

const FALLBACK_BUSINESS_WISDOM: DiscoveryItem[] = [
  { id: 1, category: "Foundations of Wealth", question: "Which one helps us grow food?", answer: "Fruit", options: ["Gold", "Fruit", "Water"], helperEmoji: "🍎" },
  { id: 2, category: "Foundations of Wealth", question: "Which one gives life to people, plants, and animals?", answer: "Water", options: ["Onyx", "Water", "Resin"], helperEmoji: "💧" },
  { id: 3, category: "Foundations of Wealth", question: "Which one is a shiny metal people value?", answer: "Gold", options: ["Fruit", "Gold", "Water"], helperEmoji: "💰" },
  { id: 4, category: "Foundations of Wealth", question: "Which one can be used for fuel or energy?", answer: "Resin", options: ["Resin", "Onyx", "Fruit"], helperEmoji: "🔥" },
  { id: 5, category: "Foundations of Wealth", question: "Which one is a hard stone like diamonds?", answer: "Onyx", options: ["Water", "Gold", "Onyx"], helperEmoji: "💎" },
  { id: 6, category: "Kingdom Laws", question: "What does “Be Fruitful” mean?", answer: "Create something helpful and sell the solution", options: ["Play all day", "Create something helpful and sell the solution", "Wait for money"], helperEmoji: "📈" },
  { id: 7, category: "Kingdom Laws", question: "What does “Multiply” mean?", answer: "Make the same good product again", options: ["Make the same good product again", "Stop working", "Spend money"], helperEmoji: "✨" },
  { id: 8, category: "Kingdom Laws", question: "What does “Replenish” mean?", answer: "Share and distribute products", options: ["Hide products", "Share and distribute products", "Break products"], helperEmoji: "🌍" },
  { id: 9, category: "Kingdom Laws", question: "What does “Subdue” mean in business?", answer: "Control and manage your work well", options: ["Control and manage your work well", "Be mean", "Stop helping"], helperEmoji: "🛠️" },
  { id: 10, category: "Secret Principles", question: "What is the secret principle of success?", answer: "Look for people’s needs and help them", options: ["Show off", "Look for people’s needs and help them", "Keep everything"], helperEmoji: "🤝" },
  { id: 11, category: "Secret Principles", question: "What is the secret principle of wealth power?", answer: "Seed power (small things grow big)", options: ["Luck", "Seed power (small things grow big)", "Waiting"], helperEmoji: "🌱" },
  { id: 12, category: "Laws of Money", question: "Does money respond to wishes only?", answer: "No, it responds to agreements and work", options: ["Yes", "No, it responds to agreements and work", "Sometimes"], helperEmoji: "📜" },
  { id: 13, category: "Laws of Money", question: "What helps money grow?", answer: "Intelligence and learning", options: ["Crying", "Intelligence and learning", "Sleeping"], helperEmoji: "🧠" },
  { id: 14, category: "Laws of Money", question: "Is money just a promise?", answer: "No, it is an agreement (covenant)", options: ["Yes", "No, it is an agreement (covenant)", "A toy"], helperEmoji: "🤝" },
  { id: 15, category: "Money Rules", question: "Should you spend all your money at once?", answer: "No, save some", options: ["Yes", "No, save some", "Always"], helperEmoji: "🏦" },
  { id: 16, category: "Money Rules", question: "Is it good to borrow money you can’t pay back?", answer: "No", options: ["Yes", "No", "Maybe"], helperEmoji: "🚫" },
  { id: 17, category: "Money Rules", question: "What is a good way to make money?", answer: "Selling snacks or helping neighbors", options: ["Waiting", "Selling snacks or helping neighbors", "Showing off"], helperEmoji: "🍿" },
  { id: 18, category: "Money Rules", question: "How should we act when we have money?", answer: "Be humble and wise", options: ["Show off", "Be humble and wise", "Laugh at others"], helperEmoji: "🦉" },
  { id: 19, category: "Money Rules", question: "Should we chase money?", answer: "No, work hard and be generous", options: ["Yes", "No, work hard and be generous", "Always"], helperEmoji: "💖" },
  { id: 20, category: "Hidden Money", question: "Who gives money?", answer: "People", options: ["Trees", "People", "Toys"], helperEmoji: "👥" },
  { id: 21, category: "Hidden Money", question: "How do skills help make money?", answer: "People pay for useful skills", options: ["They don’t", "People pay for useful skills", "Only adults"], helperEmoji: "🎨" },
  { id: 22, category: "Hidden Money", question: "Where is money found in problems?", answer: "Solving problems helps people pay you", options: ["Problems are bad", "Solving problems helps people pay you", "Ignore problems"], helperEmoji: "🧩" },
  { id: 23, category: "Hidden Money", question: "How can products and services make money?", answer: "By selling helpful things or actions", options: ["By hiding them", "By selling helpful things or actions", "By breaking them"], helperEmoji: "📦" },
  { id: 24, category: "Hidden Money", question: "How do ideas make money?", answer: "Useful ideas help people and earn money", options: ["Ideas stay in your head", "Useful ideas help people and earn money", "Ideas disappear"], helperEmoji: "💡" }
];

function decode(base64: string) {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
  return bytes;
}

async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
  }
  return buffer;
}

async function withRetry<T>(fn: () => Promise<T>, fallback: T, retries = 2, delay = 1000): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    const errorMsg = error?.message?.toLowerCase() || "";
    if ((errorMsg.includes("429") || errorMsg.includes("quota")) && retries > 0) {
      await new Promise(resolve => setTimeout(resolve, delay));
      return withRetry(fn, fallback, retries - 1, delay * 2);
    }
    return fallback;
  }
}

function speakTextNative(text: string) {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.pitch = 1.1;
  utterance.rate = 0.90; // Slower for kids
  const voices = window.speechSynthesis.getVoices();
  const femaleVoice = voices.find(v => 
    (v.name.toLowerCase().includes('female') || 
     v.name.toLowerCase().includes('google us english') || 
     v.name.toLowerCase().includes('samantha')) && 
    v.lang.startsWith('en')
  ) || voices.find(v => v.lang.startsWith('en')) || voices[0];
  if (femaleVoice) utterance.voice = femaleVoice;
  window.speechSynthesis.speak(utterance);
}

export async function speakText(text: string) {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `You are a warm, friendly, and encouraging female learning guide named Batsi. Voice-over style: Gentle, calm, and caring. Clear pronunciation. Slightly playful and enthusiastic. Tone: Positive and supportive teacher. Speak at a medium-slow pace. Emotionally sound patient and calm. Instruction: ${text}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: { 
          voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Puck' } } 
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      const audioBuffer = await decodeAudioData(decode(base64Audio), audioCtx, 24000, 1);
      const source = audioCtx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioCtx.destination);
      source.start();
    } else {
      throw new Error("No audio data");
    }
  } catch (error) {
    speakTextNative(text);
  }
}

export async function generateBookCover(title: string, author: string): Promise<string> {
  return withRetry(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: `Design a bright, playful, and professional children’s educational book cover titled "${title}". Pixar style. Fun, magical, adventurous. Include a cheerful diverse young explorer child, floating alphabet letters (A, B, C), numbers (1, 2, 3), and simple shapes. Background: A colorful fantasy learning world with forest and island elements. Cute animals or friendly characters (smiling, cartoon-style). Palette: Bright but soft colors (blue, green, yellow, purple). Tone: Safe for schools, inspires curiosity. Front book cover. CLEARLY INCLUDE THE TITLE "${title}" AND THE AUTHOR "Told by ${author}" in a large, rounded, child-friendly font.` }] },
      config: { imageConfig: { aspectRatio: "3:4" } }
    });
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
    }
    throw new Error("Image generation failed");
  }, "https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&q=80&w=800");
}

export async function generateSpellingPuzzles(difficulty: Difficulty, history: string[] = [], count: number = 5): Promise<PuzzleItem[]> {
  return withRetry(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate ${count} spelling puzzles for kids (${difficulty}). Pattern uses '_' for missing letters. Avoid: ${history.join(', ')}.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.INTEGER },
              word: { type: Type.STRING },
              pattern: { type: Type.STRING },
              hint: { type: Type.STRING }
            },
            required: ["id", "word", "pattern", "hint"]
          }
        }
      }
    });
    return JSON.parse(response.text || "[]");
  }, FALLBACK_SPELLING[difficulty]);
}

export async function generateMathPuzzles(difficulty: Difficulty, history: number[] = [], count: number = 5): Promise<MathItem[]> {
  return withRetry(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate ${count} math puzzles (${difficulty}). Use emojis. Avoid: ${history.join(', ')}.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.INTEGER },
              question: { type: Type.STRING },
              answer: { type: Type.NUMBER },
              options: { type: Type.ARRAY, items: { type: Type.NUMBER } },
              visualItems: { type: Type.STRING }
            },
            required: ["id", "question", "answer", "options", "visualItems"]
          }
        }
      }
    });
    return JSON.parse(response.text || "[]");
  }, FALLBACK_MATH[difficulty]);
}

export async function generateBiblePuzzles(region: BibleRegion, difficulty: Difficulty, count: number = 5): Promise<DiscoveryItem[]> {
  return withRetry(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate ${count} kid-friendly bible puzzles for the region "${region.name}" (Theme: ${region.theme}). Missions include: ${region.missions.join(', ')}. Format: Multiple choice trivia questions that teach biblical knowledge and values. Tone: Gentle, hopeful, encouraging. Category should be one of the missions. Include a helpfulEmoji. Difficulty: ${difficulty}.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.INTEGER },
              question: { type: Type.STRING },
              answer: { type: Type.STRING },
              options: { type: Type.ARRAY, items: { type: Type.STRING } },
              category: { type: Type.STRING },
              helperEmoji: { type: Type.STRING }
            },
            required: ["id", "question", "answer", "options", "category", "helperEmoji"]
          }
        }
      }
    });
    return JSON.parse(response.text || "[]");
  }, []);
}

export async function generateCategorizedPuzzles(worldName: string, description: string, difficulty: Difficulty, count: number = 5): Promise<DiscoveryItem[]> {
  if (worldName.includes("Business")) {
    // Return shuffled user-provided questions for the Business world
    return [...FALLBACK_BUSINESS_WISDOM].sort(() => Math.random() - 0.5).slice(0, count);
  }

  return withRetry(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate ${count} multiple-choice educational puzzles for the world "${worldName}". 
      World Description: ${description}. 
      Target Audience: Kids aged 5-9. 
      Difficulty: ${difficulty}.
      Make the questions fun, encouraging, and clear. Category should relate to specific missions like Geography, Animals, Science facts, etc.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.INTEGER },
              question: { type: Type.STRING },
              answer: { type: Type.STRING },
              options: { type: Type.ARRAY, items: { type: Type.STRING } },
              category: { type: Type.STRING },
              helperEmoji: { type: Type.STRING }
            },
            required: ["id", "question", "answer", "options", "category", "helperEmoji"]
          }
        }
      }
    });
    return JSON.parse(response.text || "[]");
  }, []);
}

export async function generateScramblePuzzles(difficulty: Difficulty, history: string[] = [], count: number = 5): Promise<ScrambleItem[]> {
  return withRetry(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate ${count} scramble puzzles (${difficulty}).`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.INTEGER },
              scrambled: { type: Type.STRING },
              correct: { type: Type.STRING },
              hint: { type: Type.STRING }
            },
            required: ["id", "scrambled", "correct", "hint"]
          }
        }
      }
    });
    return JSON.parse(response.text || "[]");
  }, []);
}

export async function generateDiscoveryPuzzles(difficulty: Difficulty, history: string[] = [], count: number = 5): Promise<DiscoveryItem[]> {
  return withRetry(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate ${count} nature trivia questions (${difficulty}).`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.INTEGER },
              question: { type: Type.STRING },
              answer: { type: Type.STRING },
              options: { type: Type.ARRAY, items: { type: Type.STRING } },
              category: { type: Type.STRING },
              helperEmoji: { type: Type.STRING }
            },
            required: ["id", "question", "answer", "options", "category", "helperEmoji"]
          }
        }
      }
    });
    return JSON.parse(response.text || "[]");
  }, []);
}
