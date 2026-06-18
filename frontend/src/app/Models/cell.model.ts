export type CellType = 'grass' | 'path';

export interface Cell {
  type: CellType;
  row: number;
  col: number;
}
