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

export const calculateDifficulty = (
  playerStats: PlayerStats,
  history: any[] // Historical performance data
): EnemyStats => {
  // Simple AI logic: 
  // If player average completion time is low, increase enemy stats.
  // If player is losing consistently, decrease enemy stats.

  const baselineLevel = Math.floor((playerStats.strength + playerStats.stamina) / 10) + 1;
  
  return {
    health: 100 * baselineLevel,
    damage: 10 * baselineLevel,
    speed: 5 + (playerStats.speed / 20),
  };
};

export const recommendWorkout = (playerStats: PlayerStats): string => {
  const stats = [
    { name: 'Strength', value: playerStats.strength, workout: 'Pushups' },
    { name: 'Stamina', value: playerStats.stamina, workout: 'Plank' },
    { name: 'Speed', value: playerStats.speed, workout: 'Running' },
  ];

  // Recommend the workout for the lowest stat
  const lowest = stats.reduce((prev, curr) => (prev.value < curr.value ? prev : curr));
  
  return `Your ${lowest.name} is lagging. Try some ${lowest.workout} to power up!`;
};
