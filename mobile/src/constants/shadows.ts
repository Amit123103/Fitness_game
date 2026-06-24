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
    enemyName: 'Shadow Monarch Clone',
    shadowName: 'IGRIS',
    rank: 'S',
    baseDamage: 1200,
    manaCost: 100,
    ability: 'Dominator Touch: Reduces enemy defense by 20%.',
    icon: 'Sword',
    color: '#A020F0'
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
    enemyName: 'Blood Orc',
    shadowName: 'TANK',
    rank: 'B',
    baseDamage: 250,
    manaCost: 50,
    ability: 'Iron Skin: Increases player defense while active.',
    icon: 'Shield',
    color: '#FFCC00'
  }
];
