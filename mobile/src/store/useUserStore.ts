import { create } from 'zustand';
import api from '../services/api';

interface UserStats {
  strength: number;
  stamina: number;
  speed: number;
  defense: number;
  mana: number;
  maxMana: number;
  level: number;
  xp: number;
}

export interface Shadow {
  id: string;
  name: string;
  rank: WarriorRank;
  level: number;
  baseDamage: number;
  ability: string;
  manaCost: number;
  icon: string;
}

interface QuestTask {
  current: number;
  goal: number;
}

interface DailyQuest {
  pushups: QuestTask;
  pullups: QuestTask; // Renamed from squats
  running: QuestTask; // in meters
}

export type WarriorRank = 'E' | 'D' | 'C' | 'B' | 'A' | 'S';

interface SystemSettings {
  haptics: boolean;
  sounds: boolean;
  theme: 'CYAN' | 'RED' | 'PURPLE';
  themeMode: 'DARK' | 'LIGHT' | 'NATURAL';
  notifications: boolean;
  privacyMode: boolean;
}

interface UserState {
  userId: string | null;
  name: string;
  profileImage: string | null;
  bio: string;
  rank: WarriorRank;
  titles: string[];
  currentTitle: string;
  stats: UserStats;
  coins: number;
  skillPoints: number;
  unlockedSkills: Record<string, number>; // id -> level
  shadowArmy: Shadow[];
  dailyQuest: DailyQuest;
  questCompleted: boolean;
  isPenaltyActive: boolean;
  lastQuestDate: string | null;
  systemSettings: SystemSettings;
  setUserId: (id: string | null) => void;
  updateProfile: (profile: Partial<{ name: string; profileImage: string | null; bio: string }>) => void;
  updateSettings: (settings: Partial<SystemSettings>) => void;
  equipTitle: (title: string) => void;
  updateStats: (newStats: Partial<UserStats>) => void;
  addXP: (amount: number) => void;
  addCoins: (amount: number) => void;
  unlockSkill: (skillId: string) => void;
  upgradeSkill: (skillId: string) => void;
  extractShadow: (shadow: Shadow) => void;
  upgradeShadow: (shadowId: string) => void;
  consumeMana: (amount: number) => boolean;
  updateQuestProgress: (type: keyof DailyQuest, amount: number) => void;
  updateQuestGoal: (type: keyof DailyQuest, goal: number) => void;
  completeQuest: () => void;
  triggerPenalty: () => void;
  resetQuest: () => void;
}

const calculateRank = (level: number): WarriorRank => {
  if (level >= 90) return 'S';
  if (level >= 60) return 'A';
  if (level >= 40) return 'B';
  if (level >= 25) return 'C';
  if (level >= 10) return 'D';
  return 'E';
};

const syncWithServer = async (stateData: Partial<UserState>) => {
  try {
    const payload: any = {};
    if (stateData.stats) payload.stats = stateData.stats;
    if (stateData.coins !== undefined) payload.coins = stateData.coins;
    
    if (Object.keys(payload).length > 0) {
      await api.post('/users/stats/update', payload);
    }
  } catch (error) {
    console.warn('Background sync failed:', error);
  }
};

export const useUserStore = create<UserState>((set, get) => ({
  userId: null,
  name: 'Sun Jin-Woo',
  profileImage: null,
  bio: 'Searching for the truth behind the system...',
  rank: 'E',
  titles: ['Beginner Warrior', 'The Awakened'],
  currentTitle: 'Beginner Warrior',
  stats: {
    strength: 10,
    stamina: 10,
    speed: 10,
    defense: 10,
    mana: 100,
    maxMana: 100,
    level: 1,
    xp: 0,
  },
  coins: 100,
  skillPoints: 0,
  unlockedSkills: {},
  shadowArmy: [],
  dailyQuest: {
    pushups: { current: 0, goal: 100 },
    pullups: { current: 0, goal: 100 },
    running: { current: 0, goal: 10000 },
  },
  questCompleted: false,
  isPenaltyActive: false,
  lastQuestDate: null,
  systemSettings: {
    haptics: true,
    sounds: true,
    theme: 'CYAN',
    themeMode: 'DARK',
    notifications: true,
    privacyMode: false,
  },
  
  setUserId: (id) => set({ userId: id }),

  updateProfile: (profile) => set((state) => ({
    ...state,
    ...profile
  })),

  updateSettings: (settings) => set((state) => ({
    systemSettings: { ...state.systemSettings, ...settings }
  })),

  equipTitle: (title) => set({ currentTitle: title }),
  
  updateStats: (newStats) => set((state) => {
    const updatedStats = { ...state.stats, ...newStats };
    syncWithServer({ stats: updatedStats });
    return { stats: updatedStats };
  }),

  updateQuestProgress: (type, amount) => set((state) => {
    const updatedQuest = { ...state.dailyQuest };
    updatedQuest[type].current += amount;
    return { dailyQuest: updatedQuest };
  }),

  updateQuestGoal: (type, goal) => set((state) => {
    const updatedQuest = { ...state.dailyQuest };
    updatedQuest[type].goal = goal;
    return { dailyQuest: updatedQuest };
  }),

  completeQuest: () => set((state) => {
    // Check for Secret Gift (Over-completion)
    const isOverachieved = 
      state.dailyQuest.pushups.current > state.dailyQuest.pushups.goal ||
      state.dailyQuest.pullups.current > state.dailyQuest.pullups.goal ||
      state.dailyQuest.running.current > state.dailyQuest.running.goal;

    if (isOverachieved) {
      const updatedStats = { ...state.stats, xp: state.stats.xp + 2000 };
      const updatedCoins = state.coins + 500;
      syncWithServer({ stats: updatedStats, coins: updatedCoins });
      return { 
        questCompleted: true, 
        coins: updatedCoins,
        stats: updatedStats
      };
    }

    const updatedCoins = state.coins + 200;
    syncWithServer({ coins: updatedCoins });
    return { questCompleted: true, coins: updatedCoins };
  }),

  triggerPenalty: () => set((state) => {
    const updatedCoins = Math.max(0, state.coins - 500);
    syncWithServer({ coins: updatedCoins });
    return {
      isPenaltyActive: true,
      coins: updatedCoins,
    };
  }),

  resetQuest: () => set((state) => ({
    dailyQuest: {
      pushups: { current: 0, goal: state.dailyQuest.pushups.goal },
      pullups: { current: 0, goal: state.dailyQuest.pullups.goal },
      running: { current: 0, goal: state.dailyQuest.running.goal },
    },
    questCompleted: false,
    isPenaltyActive: false,
    lastQuestDate: new Date().toDateString(),
  })),
  
  addXP: (amount) => set((state) => {
    const totalXP = state.stats.xp + amount;
    const requiredXP = state.stats.level * 1000;
    
    if (totalXP >= requiredXP) {
      const newLevel = state.stats.level + 1;
      const newMaxMana = state.stats.maxMana + 20;
      const updatedStats = {
        ...state.stats,
        xp: totalXP - requiredXP,
        level: newLevel,
        strength: state.stats.strength + 2,
        stamina: state.stats.stamina + 2,
        speed: state.stats.speed + 2,
        defense: state.stats.defense + 2,
        maxMana: newMaxMana,
        mana: newMaxMana, // Full mana on level up
      };
      syncWithServer({ stats: updatedStats });
      
      return {
        skillPoints: state.skillPoints + 1,
        rank: calculateRank(newLevel),
        stats: updatedStats
      };
    }
    
    const updatedStats = { ...state.stats, xp: totalXP };
    syncWithServer({ stats: updatedStats });
    return {
      stats: updatedStats
    };
  }),
  
  addCoins: (amount) => set((state) => {
    const newCoins = state.coins + amount;
    syncWithServer({ coins: newCoins });
    return { coins: newCoins };
  }),
  
  unlockSkill: (skillId) => set((state) => {
    if (state.skillPoints <= 0) return state;
    return {
      skillPoints: state.skillPoints - 1,
      unlockedSkills: { ...state.unlockedSkills, [skillId]: 1 }
    };
  }),
  
  upgradeSkill: (skillId) => set((state) => {
    const currentLevel = state.unlockedSkills[skillId] || 0;
    if (state.skillPoints <= 0 || currentLevel === 0 || currentLevel >= 10) return state;
    
    return {
      skillPoints: state.skillPoints - 1,
      unlockedSkills: { ...state.unlockedSkills, [skillId]: currentLevel + 1 }
    };
  }),

  consumeMana: (amount) => {
    const { stats } = get();
    if (stats.mana < amount) return false;
    
    const newMana = stats.mana - amount;
    const updatedStats = { ...stats, mana: newMana };
    syncWithServer({ stats: updatedStats });

    set((state) => ({
      stats: updatedStats
    }));
    return true;
  },

  extractShadow: (shadow) => set((state) => {
    const newCoins = state.coins + 1000; // Bounty for legendary extraction
    syncWithServer({ coins: newCoins });
    return {
      shadowArmy: [...state.shadowArmy, shadow],
      coins: newCoins,
    };
  }),

  upgradeShadow: (shadowId) => set((state) => {
    const shadow = state.shadowArmy.find(s => s.id === shadowId);
    if (!shadow || state.skillPoints < 2) return state;

    return {
      skillPoints: state.skillPoints - 2,
      shadowArmy: state.shadowArmy.map(s => 
        s.id === shadowId ? { ...s, level: s.level + 1, baseDamage: s.baseDamage + 50 } : s
      )
    };
  }),
}));
