
import { WorldData, WorldType, BibleRegion } from './types';

export const APP_TITLE = "PhD Kids";
export const AUTHOR_NAME = "Batsirayi Brandon Mutadzakupa";

export const BIBLE_REGIONS: BibleRegion[] = [
  { id: 1, name: "Genesis Garden", theme: "Beginnings & God’s creation", missions: ["Creation Days Quest", "Garden Match", "Adam & Eve Choice", "Noah’s Ark Builder", "Rainbow Promise"], icon: "🌱" },
  { id: 2, name: "Promise Plains", theme: "Faith & God’s promises", missions: ["Star Counting Faith", "Family Tree Match", "Joseph’s Coat Colors", "Forgiveness Choice"], icon: "⭐" },
  { id: 3, name: "Freedom Desert", theme: "God rescues His people", missions: ["Baby Moses River Path", "Plagues Sorting", "Red Sea Maze Escape", "Ten Commandments Match"], icon: "🏜️" },
  { id: 4, name: "Courage & Kings Valley", theme: "Bravery & leadership", missions: ["Jericho Wall Rhythm", "David & Goliath Aim", "King Solomon Wisdom", "Build the Temple"], icon: "🏔️" },
  { id: 5, name: "Prophets Path", theme: "Listening to God", missions: ["Jonah’s Journey Map", "Big Fish Rescue", "Daniel’s Lions Trust", "Fire from Heaven"], icon: "🐳" },
  { id: 6, name: "Bethlehem Town", theme: "Jesus is born", missions: ["Nativity Scene Builder", "Angel Message Match", "Shepherd Path Maze", "Gift Match"], icon: "🌟" },
  { id: 7, name: "Jesus’ Journey", theme: "Love, kindness, miracles", missions: ["Parable Matching", "Kindness Choice", "Miracle Memory Cards", "Follow Jesus Path"], icon: "❤️" },
  { id: 8, name: "Rescue Hill", theme: "Hope & victory", missions: ["Timeline Match", "Empty Tomb Discovery", "Hope Message Puzzle", "Celebration Star Quest"], icon: "✝️" },
  { id: 9, name: "Early Church City", theme: "Sharing love & faith", missions: ["Pentecost Flame Match", "Map of Paul’s Journeys", "Help the Church Game", "Letter Puzzle"], icon: "🔥" },
  { id: 10, name: "Heavenly Kingdom", theme: "Hope & God’s forever kingdom", missions: ["Victory Crown Collection", "Light vs Darkness Sorting", "New Heaven Puzzle", "God Wins Celebration"], icon: "👑" }
];

export const WORLDS: WorldData[] = [
  {
    type: WorldType.BIBLE_ADVENTURE,
    name: "Bible Adventure Land",
    icon: "📖",
    color: "from-amber-100 to-yellow-300",
    themeColors: ["#fffbeb", "#fef3c7", "#fff7ed"],
    description: "A MEGA QUEST through the greatest stories ever told!"
  },
  {
    type: WorldType.BUSINESS_MONEY_WISDOM,
    name: "Business & Money Wisdom",
    icon: "👑",
    color: "from-yellow-400 to-amber-600",
    themeColors: ["#fefce8", "#fef9c3", "#fef3c7"],
    description: "Laws of business, wealth, and money! Learn to grow and help others!"
  },
  {
    type: WorldType.WORLD_EXPLORER_COVE,
    name: "World Explorer Cove",
    icon: "🌍",
    color: "from-cyan-400 to-blue-600",
    themeColors: ["#ecfeff", "#cffafe", "#e0f2fe"],
    description: "Geography & Culture: Flags, animals, and global facts!"
  },
  {
    type: WorldType.SCIENCE_LAB_QUEST,
    name: "Science Lab Quest",
    icon: "🔬",
    color: "from-lime-400 to-green-600",
    themeColors: ["#f7fee7", "#ecfccb", "#f0fdf4"],
    description: "Discover animals, plants, weather, and space mysteries!"
  },
  {
    type: WorldType.CREATIVE_CASTLE,
    name: "Creative Castle",
    icon: "🎨",
    color: "from-rose-400 to-pink-600",
    themeColors: ["#fff1f2", "#ffe4e6", "#fdf2f8"],
    description: "Art & Creativity: Colors, shapes, and musical rhythm!"
  },
  {
    type: WorldType.LOGIC_TIME_TOWER,
    name: "Logic & Time Tower",
    icon: "🕒",
    color: "from-indigo-400 to-violet-600",
    themeColors: ["#eef2ff", "#e0e7ff", "#f5f3ff"],
    description: "Logic & Life Skills: Patterns, time, and daily sequences!"
  },
  {
    type: WorldType.ALPHABET_FOREST,
    name: "Alphabet Forest",
    icon: "🌳",
    color: "from-emerald-400 to-green-600",
    themeColors: ["#f0fdf4", "#dcfce7", "#ecfdf5"],
    description: "Find the missing letters to heal the ancient trees."
  },
  {
    type: WorldType.NUMBER_VALLEY,
    name: "Number Valley",
    icon: "🔢",
    color: "from-blue-400 to-indigo-600",
    themeColors: ["#eff6ff", "#dbeafe", "#e0f2fe"],
    description: "Solve the riddles of the counting stones."
  },
  {
    type: WorldType.PUZZLE_PLAYGROUND,
    name: "Puzzle Playground",
    icon: "🧩",
    color: "from-fuchsia-500 to-purple-700",
    themeColors: ["#faf5ff", "#f3e8ff", "#fdf4ff"],
    description: "Unscramble the whispers of the wind."
  },
  {
    type: WorldType.DISCOVERY_ISLAND,
    name: "Discovery Island",
    icon: "🏝️",
    color: "from-amber-400 to-orange-600",
    themeColors: ["#fffbeb", "#fef3c7", "#fff7ed"],
    description: "Uncover the secrets of the animals and stars."
  }
];

export const FEEDBACK_PHRASES = [
  "Brilliant discovery!",
  "The glyphs are glowing!",
  "You're a master explorer!",
  "Pure magic!",
  "The forest thanks you!",
  "Incredible work!",
  "You've found it!"
];
