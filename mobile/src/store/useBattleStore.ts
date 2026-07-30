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
  'S+': { name: 'Kargalgan Demon King', hp: 25000, attack: 3000, defense: 2200 },
  'S++': { name: 'Dragon Sovereign Kamish', hp: 75000, attack: 8500, defense: 6000 },
  'S+++': { name: 'Monarch of Destruction', hp: 200000, attack: 22000, defense: 15000 },
  'INFINITE': { name: 'Absolute Being Void God', hp: 999999, attack: 99999, defense: 50000 },
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
      set({ 
        isBattleOver: true, 
        winner: 'PLAYER', 
        canExtract: true,
        battleLog: [...get().battleLog.slice(-5), 'CRITICAL VICTORY! Shadow entity defeated. EXTRACTION PROTOCOL READY!'] 
      });
    } else {
      setTimeout(() => get().enemyAttack(), 1000);
    }
  },

  summonShadow: (shadow: Shadow) => {
    const { player, isBattleOver, turn, summonedShadows } = get();
    if (!player || isBattleOver || turn !== 'PLAYER') return;
    if (player.mana < shadow.manaCost) {
      set({ battleLog: [...get().battleLog.slice(-5), `Insufficient Mana to deploy ${shadow.name}!`] });
      return;
    }
    if (summonedShadows.some(s => s.id === shadow.id)) {
      set({ battleLog: [...get().battleLog.slice(-5), `${shadow.name} is already deployed in battle!`] });
      return;
    }

    set({
      player: { ...player, mana: player.mana - shadow.manaCost },
      summonedShadows: [...summonedShadows, shadow],
      battleLog: [...get().battleLog.slice(-5), `Shadow Command: ${shadow.name} emerges to support you in battle!`],
    });
  },

  extractShadowAttempt: () => {
    const { canExtract, player } = get();
    if (!canExtract || !player) return false;

    // 70% base success rate + mana bonus
    const manaBonus = Math.floor((player.mana / player.maxMana) * 25);
    const success = (Math.random() * 100) < (70 + manaBonus);

    if (success) {
       set({ 
         canExtract: false,
         battleLog: [...get().battleLog.slice(-5), 'ARISE! The shadow has been claimed into your Shadow Army!'] 
       });
    } else {
       set({ 
         canExtract: false,
         battleLog: [...get().battleLog.slice(-5), 'The entity\'s shadow dissolved into the void. Extraction failed.'] 
       });
    }
    return success;
  },

  playerDefend: () => {
    const { player, isBattleOver, turn } = get();
    if (!player || isBattleOver || turn !== 'PLAYER') return;

    const restoredMana = Math.min(player.maxMana, player.mana + 20);

    set({
      player: { ...player, mana: restoredMana },
      isDefending: true,
      battleLog: [...get().battleLog.slice(-5), 'You take a defensive stance (+20 Mana). Enemy damage reduced!'],
      turn: 'ENEMY',
    });
    
    setTimeout(() => get().enemyAttack(), 1000);
  },

  playerSkill: (skill) => {
    const { player, enemy, isBattleOver, turn, summonedShadows } = get();
    if (!player || !enemy || isBattleOver || turn !== 'PLAYER') return;
    if (player.mana < skill.manaCost) {
      set({ battleLog: [...get().battleLog.slice(-5), 'Insufficient Mana! Select another action or Defend.'] });
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
      set({ 
        isBattleOver: true, 
        winner: 'PLAYER', 
        canExtract: true,
        battleLog: [...get().battleLog.slice(-5), `${skill.name} obliterated the target! EXTRACTION PROTOCOL READY!`] 
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
      'S+': { xp: 45000, coins: 50000 },
      'S++': { xp: 120000, coins: 150000 },
      'S+++': { xp: 350000, coins: 500000 },
      'INFINITE': { xp: 1000000, coins: 1000000 },
    };
    return rewardsMap[currentRank];
  },

  resetBattle: () => set({ player: null, enemy: null, isBattleOver: false, winner: null, canExtract: false, summonedShadows: [] }),
}));
