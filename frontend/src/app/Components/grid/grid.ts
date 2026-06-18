import { Component, inject } from '@angular/core';
import { Game } from '../../Services/game/game';
import { TOWER_TYPES } from '../../Models/tower-type.model';

@Component({
  selector: 'app-grid',
  imports: [],
  templateUrl: './grid.html',
  styleUrl: './grid.css',
})
export class Grid {
  private gameService = inject(Game);

  readonly grid = this.gameService.grid;
  readonly towers = this.gameService.towers;
  readonly cols = this.gameService.cols;

  onCellClick(row: number, col: number): void {
    this.gameService.placeTower(row, col);
  }

  // Vérifie si une tour est à cette position (utilisé par le template)
  hasTower(row: number, col: number): boolean {
    return this.towers().some(t => t.row === row && t.col === col);
  }

  readonly enemies = this.gameService.enemies;
  readonly path = this.gameService.path;

  getTowerEmoji(row: number, col: number): string {
  const tower = this.towers().find(t => t.row === row && t.col === col);
  if (!tower) return '';
  return TOWER_TYPES[tower.kind].emoji;
  }

  getTowerCenter(rowOrCol: number): { left: number; top: number } {
  const cellSize = 42;
  const padding = 10;
  const center = padding + rowOrCol * cellSize + 20;
  return { left: center, top: center };
  }

  // Calcule la position en pixels d'un ennemi
  getEnemyPosition(progress: number): { left: number; top: number } {
    const cellSize = 42; // 40px + 2px gap
    const padding = 10;

    // Index entier et fraction
    const i = Math.floor(progress);
    const frac = progress - i;

    const current = this.path[i];
    const next = this.path[Math.min(i + 1, this.path.length - 1)];

    // Interpolation linéaire entre la case actuelle et la suivante
    const col = current.col + (next.col - current.col) * frac;
    const row = current.row + (next.row - current.row) * frac;

    return {
      left: padding + col * cellSize,
      top: padding + row * cellSize
    };
  }

  readonly shots = this.gameService.shots;

  // Convertit des coordonnées (row, col) en pixels
  toPixels(col: number, row: number): { left: number; top: number } {
    const cellSize = 42;
    const padding = 10;
    return {
      left: padding + col * cellSize + 20,
      top: padding + row * cellSize + 20
    };
  }
}
