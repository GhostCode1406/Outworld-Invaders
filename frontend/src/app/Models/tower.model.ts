import { TowerKind } from './tower-type.model';

export interface Tower {
  id: number;
  kind: TowerKind;
  row: number;
  col: number;
  damage: number;
  range: number;
  fireRate: number;
  lastFireTime: number;
}