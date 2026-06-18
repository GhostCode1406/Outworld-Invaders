export type TowerKind = 'archer' | 'cannon' | 'lightning';

export interface TowerType {
  kind: TowerKind;
  name: string;
  emoji: string;
  cost: number;
  damage: number;
  range: number;     // en cases
  fireRate: number;  // tirs/sec
  color: string;     // couleur du tir (pour différencier visuellement)
}

export const TOWER_TYPES: Record<TowerKind, TowerType> = {
  archer: {
    kind: 'archer',
    name: 'Archer',
    emoji: '🏹',
    cost: 25,
    damage: 10,
    range: 2.5,
    fireRate: 1.5,
    color: '#ffeb3b'
  },
  cannon: {
    kind: 'cannon',
    name: 'Canon',
    emoji: '💣',
    cost: 75,
    damage: 40,
    range: 4,
    fireRate: 0.5,
    color: '#ff5722'
  },
  lightning: {
    kind: 'lightning',
    name: 'Foudre',
    emoji: '⚡',
    cost: 50,
    damage: 5,
    range: 1.8,
    fireRate: 4,
    color: '#03a9f4'
  }
};