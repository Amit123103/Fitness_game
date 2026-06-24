import { create } from 'zustand';
import { WarriorRank, Shadow } from './useUserStore';

interface Entity {
  id: string;
  name: string;
  maxHp: number;
  hp: number;
  maxMana: number;
  mana: number;
  attack: number;
  defense: number;
  rank: WarriorRank;
}

interface BattleState {
  player: Entity | null;
  enemy: Entity | null;
  turn: 'PLAYER' | 'ENEMY';
  isBattleOver: boolean;
  isDefending: boolean;
  canExtract: boolean;
  summonedShadows: Shadow[];
  winner: string | null;
  battleLog: string[];
  currentRank: WarriorRank;
  
  initBattle: (playerStats: any, rank: WarriorRank) => void;
  playerAttack: () => void;
  playerDefend: () => void;
  playerSkill: (skill: any) => void;
  summonShadow: (shadow: Shadow) => void;
  extractShadowAttempt: () => boolean;
  enemyAttack: () => void;
  calculateRewards: () => { xp: number; coins: number };
  resetBattle: () => void;
}

const MONSTER_DATABASE: Record<WarriorRank, any> = {
  'E': { name: 'Shadow Slime', hp: 50, attack: 10, defense: 5 },
  'D': { name: 'Desert Gnoll', hp: 150, attack: 25, defense: 15 },
  'C': { name: 'Icy Ghost', hp: 400, attack: 55, defense: 40 },
  'B': { name: 'Blood Orc', hp: 1200, attack: 150, defense: 110 },
  'A': { name: 'Dread Lich', hp: 3500, attack: 450, defense: 350 },
  'S': { name: 'Shadow Monarch Clone', hp: 10000, attack: 1200, defense: 900 },
};

export const useBattleStore = create<BattleState>((set, get) => ({
  player: null,
  enemy: null,
  turn: 'PLAYER',
  isBattleOver: false,
  isDefending: false,
  canExtract: false,
  summonedShadows: [],
  winner: null,
  battleLog: ['Awaiting challenge...'],
  currentRank: 'E',

  initBattle: (playerStats, rank) => {
    const enemyData = MONSTER_DATABASE[rank];

    set({
      player: {
        id: 'player',
        name: 'You',
        maxHp: 100 + playerStats.stamina * 5,
        hp: 100 + playerStats.stamina * 5,
        maxMana: playerStats.maxMana,
        mana: playerStats.mana,
        attack: 15 + playerStats.strength * 1.5,
        defense: 10 + playerStats.defense,
        rank: 'E',
      },
      enemy: {
        id: 'enemy',
        name: enemyData.name,
        maxHp: enemyData.hp,
        hp: enemyData.hp,
        maxMana: 100,
        mana: 100,
        attack: enemyData.attack,
        defense: enemyData.defense,
        rank: rank,
      },
      currentRank: rank,
      turn: 'PLAYER',
      isBattleOver: false,
      isDefending: false,
      canExtract: false,
      summonedShadows: [],
      winner: null,
      battleLog: [`Entered ${rank}-Rank Arena. ${enemyData.name} has appeared!`],
    });
  },

  playerAttack: () => {
    const { player, enemy, isBattleOver, turn, summonedShadows } = get();
    if (!player || !enemy || isBattleOver || turn !== 'PLAYER') return;

    // Bonus damage from summoned shadows
    const shadowBonus = summonedShadows.reduce((acc, s) => acc + s.baseDamage, 0);
    const damage = Math.max(5, Math.floor((player.attack + shadowBonus) - enemy.defense * 0.5));
    const newEnemyHp = Math.max(0, enemy.hp - damage);
    
    set({
      enemy: { ...enemy, hp: newEnemyHp },
      battleLog: [...get().battleLog.slice(-5), `You strike ${enemy.name} for ${damage} damage!`],
      isDefending: false,
      turn: 'ENEMY',
    });

    if (newEnemyHp === 0) {
      const highRank = enemy.rank === 'A' || enemy.rank === 'S';
      set({ 
        isBattleOver: true, 
        winner: 'PLAYER', 
        canExtract: highRank,
        battleLog: [...get().battleLog.slice(-5), highRank ? 'ENTITY DEWORMED. EXTRACTION PROTOCOL READY.' : 'CRITICAL VICTORY! Enemy eliminated.'] 
      });
    } else {
      setTimeout(() => get().enemyAttack(), 1000);
    }
  },

  summonShadow: (shadow: Shadow) => {
    const { player, isBattleOver, turn, summonedShadows } = get();
    if (!player || isBattleOver || turn !== 'PLAYER') return;
    if (player.mana < shadow.manaCost) {
      set({ battleLog: [...get().battleLog.slice(-5), `Insufficient Mana to summon ${shadow.name}!`] });
      return;
    }
    if (summonedShadows.some(s => s.id === shadow.id)) {
      set({ battleLog: [...get().battleLog.slice(-5), `${shadow.name} is already deployed!`] });
      return;
    }

    set({
      player: { ...player, mana: player.mana - shadow.manaCost },
      summonedShadows: [...summonedShadows, shadow],
      battleLog: [...get().battleLog.slice(-5), `Shadow Army Response: ${shadow.name} has emerged from the abyss!`],
    });
  },

  extractShadowAttempt: () => {
    const { canExtract, player } = get();
    if (!canExtract || !player) return false;

    // Base 30% chance, increased by mana reserve
    const manaBonus = Math.floor(player.mana / 100);
    const success = (Math.random() * 100) < (30 + manaBonus);

    if (success) {
       set({ battleLog: [...get().battleLog.slice(-5), 'ARISE. The shadow has been claimed.'] });
    } else {
       set({ 
         canExtract: false,
         battleLog: [...get().battleLog.slice(-5), 'The soul has faded into the void. Extraction failed.'] 
       });
    }
    return success;
  },

  playerDefend: () => {
    const { isBattleOver, turn } = get();
    if (isBattleOver || turn !== 'PLAYER') return;

    set({
      isDefending: true,
      battleLog: [...get().battleLog.slice(-5), 'You take a defensive stance. Damage will be reduced.'],
      turn: 'ENEMY',
    });
    
    setTimeout(() => get().enemyAttack(), 1000);
  },

  playerSkill: (skill) => {
    const { player, enemy, isBattleOver, turn, summonedShadows } = get();
    if (!player || !enemy || isBattleOver || turn !== 'PLAYER') return;
    if (player.mana < skill.manaCost) {
      set({ battleLog: [...get().battleLog.slice(-5), 'Insufficient Mana! Select another action.'] });
      return;
    }

    const shadowBonus = summonedShadows.reduce((acc, s) => acc + s.baseDamage * 0.5, 0);
    const damage = Math.floor((player.attack * 1.5) + (skill.manaCost * 2) + shadowBonus);
    const newEnemyHp = Math.max(0, enemy.hp - damage);

    set({
      player: { ...player, mana: player.mana - skill.manaCost },
      enemy: { ...enemy, hp: newEnemyHp },
      battleLog: [...get().battleLog.slice(-5), `You unleash ${skill.name}! Dealing ${damage} mystical damage.`],
      isDefending: false,
      turn: 'ENEMY',
    });

    if (newEnemyHp === 0) {
      const highRank = enemy.rank === 'A' || enemy.rank === 'S';
      set({ 
        isBattleOver: true, 
        winner: 'PLAYER', 
        canExtract: highRank,
        battleLog: [...get().battleLog.slice(-5), highRank ? 'SOUL CAPTURED. EXTRACTION PROTOCOL INITIALIZED.' : `${skill.name} obliterated the enemy!`] 
      });
    } else {
      setTimeout(() => get().enemyAttack(), 1000);
    }
  },

  enemyAttack: () => {
    const { player, enemy, isBattleOver, isDefending } = get();
    if (!player || !enemy || isBattleOver) return;

    let damage = Math.max(1, Math.floor(enemy.attack - player.defense * 0.8));
    if (isDefending) damage = Math.floor(damage * 0.4);

    const newPlayerHp = Math.max(0, player.hp - damage);
    const newPlayerMana = Math.min(player.maxMana, player.mana + 15);

    set({
      player: { ...player, hp: newPlayerHp, mana: newPlayerMana },
      battleLog: [...get().battleLog.slice(-5), `${enemy.name} counters for ${damage} damage.`],
      turn: 'PLAYER',
    });

    if (newPlayerHp === 0) {
      set({ isBattleOver: true, winner: 'ENEMY', battleLog: [...get().battleLog.slice(-5), 'You have succumbed to your injuries. Defeat.'] });
    }
  },

  calculateRewards: () => {
    const { currentRank } = get();
    const rewardsMap: Record<WarriorRank, { xp: number; coins: number }> = {
      'E': { xp: 50, coins: 20 },
      'D': { xp: 150, coins: 100 },
      'C': { xp: 500, coins: 400 },
      'B': { xp: 1500, coins: 1200 },
      'A': { xp: 4500, coins: 4000 },
      'S': { xp: 15000, coins: 15000 },
    };
    return rewardsMap[currentRank];
  },

  resetBattle: () => set({ player: null, enemy: null, isBattleOver: false, winner: null, canExtract: false, summonedShadows: [] }),
}));
