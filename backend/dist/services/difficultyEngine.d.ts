/**
 * AI Difficulty Engine (MOCK)
 * Analyzes player performance and adjusts difficulty dynamically.
 */
export interface PlayerStats {
    strength: number;
    stamina: number;
    speed: number;
    defense: number;
}
export interface EnemyStats {
    health: number;
    damage: number;
    speed: number;
}
export declare const calculateDifficulty: (playerStats: PlayerStats, history: any[]) => EnemyStats;
export declare const recommendWorkout: (playerStats: PlayerStats) => string;
//# sourceMappingURL=difficultyEngine.d.ts.map