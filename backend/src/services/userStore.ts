export interface UserRecord {
  uid: string;
  email: string;
  password?: string;
  name?: string;
  bio?: string;
  strength: number;
  stamina: number;
  speed: number;
  defense: number;
  level: number;
  xp: number;
  coins: number;
  skillPoints?: number;
  unlockedSkills?: any[];
  shadowArmy?: any[];
  rank?: string;
  currentTitle?: string;
  mana?: number;
  maxMana?: number;
}

// In-memory fallback database for dev testing and when Supabase is offline or unconfigured
const memoryUsers = new Map<string, UserRecord>();

// Pre-seed default test user
const defaultTestUser: UserRecord = {
  uid: 'test-user-123',
  email: 'test@example.com',
  name: 'Awakened Warrior',
  bio: 'Shadow Monarch in training',
  strength: 10,
  stamina: 10,
  speed: 10,
  defense: 10,
  level: 1,
  xp: 0,
  coins: 100,
  skillPoints: 5,
  unlockedSkills: [],
  shadowArmy: [],
  rank: 'E',
  currentTitle: 'THE AWAKENED',
  mana: 100,
  maxMana: 100,
};

memoryUsers.set(defaultTestUser.uid, defaultTestUser);
memoryUsers.set(defaultTestUser.email.toLowerCase(), defaultTestUser);

export const saveUserToMemory = (user: UserRecord) => {
  memoryUsers.set(user.uid, user);
  if (user.email) {
    memoryUsers.set(user.email.toLowerCase(), user);
  }
};

export const getUserFromMemory = (idOrEmail: string): UserRecord | undefined => {
  if (!idOrEmail) return undefined;
  return memoryUsers.get(idOrEmail) || memoryUsers.get(idOrEmail.toLowerCase());
};

export const updateUserInMemory = (uid: string, updates: Partial<UserRecord>) => {
  const existing = getUserFromMemory(uid);
  if (existing) {
    const updated = { ...existing, ...updates };
    saveUserToMemory(updated);
    return updated;
  }
  return undefined;
};
