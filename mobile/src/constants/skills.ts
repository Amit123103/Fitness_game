import { Flame, Zap, Shield, Swords } from 'lucide-react-native';

export const SKILLS_DATA = [
  { 
    id: 'fire_slash', 
    name: 'Fire Slash', 
    description: 'A powerful flaming strike that deals extra damage.',
    icon: Flame, 
    cost: 1, 
    manaCost: 20,
    color: '#FF0055',
    category: 'Attack',
    baseDamage: 25,
  },
  { 
    id: 'dash', 
    name: 'Shadow Dash', 
    description: 'Increase speed temporarily to dodge incoming attacks.',
    icon: Zap, 
    cost: 1, 
    manaCost: 15,
    color: '#00F0FF',
    category: 'Speed',
    baseDamage: 10,
  },
  { 
    id: 'iron_wall', 
    name: 'Iron Wall', 
    description: 'Greatly increase defense for 3 turns.',
    icon: Shield, 
    cost: 2, 
    manaCost: 30,
    color: '#FFD700',
    category: 'Defense',
    baseDamage: 0,
  },
  { 
    id: 'berserk', 
    name: 'Rage Mode', 
    description: 'Sacrifice HP for a massive attack boost.',
    icon: Swords, 
    cost: 3, 
    manaCost: 50,
    color: '#A020F0',
    category: 'Special',
    baseDamage: 50,
  }
];
