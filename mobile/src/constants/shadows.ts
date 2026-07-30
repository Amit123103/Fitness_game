import { WarriorRank } from '../store/useUserStore';

export interface ShadowTemplate {
  enemyName: string;
  shadowName: string;
  rank: WarriorRank;
  baseDamage: number;
  manaCost: number;
  ability: string;
  icon: string;
  color: string;
}

export const SHADOW_TEMPLATES: ShadowTemplate[] = [
  {
    enemyName: 'Shadow Slime',
    shadowName: 'SLIME SHADOW',
    rank: 'E',
    baseDamage: 25,
    manaCost: 20,
    ability: 'Viscous Coating: Reduces enemy speed.',
    icon: 'Ghost',
    color: '#00F0FF'
  },
  {
    enemyName: 'Desert Gnoll',
    shadowName: 'GNOLL SHADOW',
    rank: 'D',
    baseDamage: 60,
    manaCost: 35,
    ability: 'Pack Hunt: Increases bonus physical damage.',
    icon: 'Swords',
    color: '#00FF66'
  },
  {
    enemyName: 'Icy Ghost',
    shadowName: 'FROST SHADOW',
    rank: 'C',
    baseDamage: 120,
    manaCost: 45,
    ability: 'Frostbite: Inflicts chill on target.',
    icon: 'Zap',
    color: '#3399FF'
  },
  {
    enemyName: 'Blood Orc',
    shadowName: 'TANK',
    rank: 'B',
    baseDamage: 250,
    manaCost: 50,
    ability: 'Iron Skin: Increases player defense while active.',
    icon: 'Shield',
    color: '#FFCC00'
  },
  {
    enemyName: 'Dread Lich',
    shadowName: 'BERU',
    rank: 'A',
    baseDamage: 500,
    manaCost: 70,
    ability: 'Gluttony: Chance to regenerate HP on attack.',
    icon: 'Bug',
    color: '#FF0055'
  },
  {
    enemyName: 'Shadow Monarch Clone',
    shadowName: 'IGRIS',
    rank: 'S',
    baseDamage: 1200,
    manaCost: 100,
    ability: 'Dominator Touch: Reduces enemy defense by 20%.',
    icon: 'Sword',
    color: '#A020F0'
  }
];
