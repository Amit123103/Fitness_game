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
export declare const saveUserToMemory: (user: UserRecord) => void;
export declare const getUserFromMemory: (idOrEmail: string) => UserRecord | undefined;
export declare const updateUserInMemory: (uid: string, updates: Partial<UserRecord>) => {
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
} | undefined;
//# sourceMappingURL=userStore.d.ts.map