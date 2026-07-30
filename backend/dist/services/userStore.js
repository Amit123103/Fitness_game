// In-memory fallback database for dev testing and when Supabase is offline or unconfigured
const memoryUsers = new Map();
// Pre-seed default test user
const defaultTestUser = {
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
export const saveUserToMemory = (user) => {
    memoryUsers.set(user.uid, user);
    if (user.email) {
        memoryUsers.set(user.email.toLowerCase(), user);
    }
};
export const getUserFromMemory = (idOrEmail) => {
    if (!idOrEmail)
        return undefined;
    return memoryUsers.get(idOrEmail) || memoryUsers.get(idOrEmail.toLowerCase());
};
export const updateUserInMemory = (uid, updates) => {
    const existing = getUserFromMemory(uid);
    if (existing) {
        const updated = { ...existing, ...updates };
        saveUserToMemory(updated);
        return updated;
    }
    return undefined;
};
//# sourceMappingURL=userStore.js.map