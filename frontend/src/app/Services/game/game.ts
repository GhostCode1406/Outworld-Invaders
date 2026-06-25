import { inject, Injectable, signal } from '@angular/core';
import { Cell } from '../../Models/cell.model';
import { Tower } from '../../Models/tower.model';
import { Enemy } from '../../Models/enemy.model';
import { TOWER_TYPES, TowerKind } from '../../Models/tower-type.model';
import { AudioService } from '../audio/audio';

@Injectable({
  providedIn: 'root'
})
export class Game {
  // Audio
  private audioService = inject(AudioService);
  // État du joueur
  readonly gold = signal(100);
  readonly life = signal(20);
  readonly currentWave = signal(0);
  readonly gameStatus = signal<'idle' | 'playing' | 'won' | 'lost'>('idle');

  // Dimensions de la grille
  readonly rows = 8;
  readonly cols = 12;

  // Signal contenant la grille — réactif !
  readonly grid = signal<Cell[][]>(this.createInitialGrid());

  // Crée une grille avec un chemin prédéfini
  private createInitialGrid(): Cell[][] {
    const grid: Cell[][] = [];

    for (let row = 0; row < this.rows; row++) {
      const currentRow: Cell[] = [];
      for (let col = 0; col < this.cols; col++) {
        currentRow.push({
          type: this.isPathCell(row, col) ? 'path' : 'grass',
          row,
          col
        });
      }
      grid.push(currentRow);
    }

    return grid;
  }

  // Définit où est le chemin (Customisable)
  private isPathCell(row: number, col: number): boolean {
    // Chemin en forme de S simple
    if (row === 2 && col >= 0 && col <= 5) return true;
    if (col === 5 && row >= 2 && row <= 5) return true;
    if (row === 5 && col >= 5 && col <= 11) return true;
    return false;
  }

  // Statistiques pour le calcul du score
  readonly killCount = signal(0);

  // Score final calculé
  computeFinalScore(): number {
  // Formule : kills * 10 + vague atteinte * 100 + or restant
  return this.killCount() * 10 + this.currentWave() * 100 + this.gold();
  }

  // Signal contenant les tours placées
  readonly towers = signal<Tower[]>([]);

  // Tente de placer une tour. Retourne true si succès.
  private nextTowerId = 0;
  readonly TOWER_COST = 25;

  readonly selectedTowerKind = signal<TowerKind>('archer');

  selectTowerKind(kind: TowerKind): void {
  this.selectedTowerKind.set(kind);
  }

  placeTower(row: number, col: number): boolean {
  const cell = this.grid()[row][col];
  if (cell.type === 'path') return false;

  const exists = this.towers().some(t => t.row === row && t.col === col);
  if (exists) return false;

  // Récupère le type sélectionné
  const kind = this.selectedTowerKind();
  const type = TOWER_TYPES[kind];

  if (this.gold() < type.cost) return false;

  const newTower: Tower = {
    id: this.nextTowerId++,
    kind,
    row, col,
    damage: type.damage,
    range: type.range,
    fireRate: type.fireRate,
    lastFireTime: 0
  };

  this.towers.update(towers => [...towers, newTower]);
  this.gold.update(g => g - type.cost);
  this.audioService.play('place-tower');
  return true;
}

  // Chemin ordonné : liste de {row, col} du début à la fin

  readonly path: { row: number; col: number }[] = [
    // Ligne horizontale (row 2, col 0→5)

    { row: 2, col: 0 }, { row: 2, col: 1 }, { row: 2, col: 2 },
    { row: 2, col: 3 }, { row: 2, col: 4 }, { row: 2, col: 5 },
    // Descente (col 5, row 3→5)

    { row: 3, col: 5 }, { row: 4, col: 5 }, { row: 5, col: 5 },
    // Ligne horizontale (row 5, col 6→11)

    { row: 5, col: 6 }, { row: 5, col: 7 }, { row: 5, col: 8 },
    { row: 5, col: 9 }, { row: 5, col: 10 }, { row: 5, col: 11 },
  ];

  // Signal des ennemis actifs
  readonly enemies = signal<Enemy[]>([]);

  private nextEnemyId = 0;
  private lastTick = 0;
  private animationFrameId: number | null = null;

  // Démarre la boucle de jeu
  startGameLoop(): void {
    this.lastTick = performance.now();
    const loop = (now: number) => {
      const deltaSeconds = (now - this.lastTick) / 1000;
      this.lastTick = now;
      this.tick(deltaSeconds);
      this.animationFrameId = requestAnimationFrame(loop);
    };
    this.animationFrameId = requestAnimationFrame(loop);
  }

  stopGameLoop(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  private tick(deltaSeconds: number): void {
    if (this.gameStatus() !== 'playing') return; // pause si pas en jeu

    const now = performance.now();

    // Déplace les ennemis et compte ceux qui atteignent la base
    let lifeLost = 0;
    this.enemies.update(enemies => {
      const moved = enemies.map(e => ({ ...e, progress: e.progress + e.speed * deltaSeconds }));
      const survivors = moved.filter(e => {
        if (e.progress >= this.path.length) {
          lifeLost++;
          this.audioService.play('damage');
          return false;
        }
        return true;
      });
      return survivors;
    });

    if (lifeLost > 0) {
      this.life.update(l => Math.max(0, l - lifeLost));
      if (this.life() === 0) this.gameStatus.set('lost');
      this.audioService.play('defeat');
    }

    this.updateTowers(now);
    this.updateWave(deltaSeconds);
  }

  // Configuration des vagues
  private readonly waves = [
    { count: 5, hp: 30, speed: 1.0, interval: 1.0 },
    { count: 8, hp: 40, speed: 1.2, interval: 0.8 },
    { count: 12, hp: 60, speed: 1.4, interval: 0.7 },
    { count: 15, hp: 80, speed: 1.5, interval: 0.6 },
    { count: 20, hp: 100, speed: 1.8, interval: 0.5 },
  ];

  private spawnedInWave = 0;
  private timeSinceLastSpawn = 0;
  private waveCompleted = false;

  // Démarre la prochaine vague
  startNextWave(): void {
    if (this.gameStatus() === 'idle') this.gameStatus.set('playing');
    if (this.currentWave() >= this.waves.length) return;

    this.currentWave.update(w => w + 1);
    this.spawnedInWave = 0;
    this.timeSinceLastSpawn = 0;
    this.waveCompleted = false;
  }

  private updateWave(deltaSeconds: number): void {
    const waveIndex = this.currentWave() - 1;
    if (waveIndex < 0 || waveIndex >= this.waves.length) return;

    const wave = this.waves[waveIndex];

    // Spawn des ennemis
    if (this.spawnedInWave < wave.count) {
      this.timeSinceLastSpawn += deltaSeconds;
      if (this.timeSinceLastSpawn >= wave.interval) {
        this.spawnWaveEnemy(wave.hp, wave.speed);
        this.spawnedInWave++;
        this.timeSinceLastSpawn = 0;
      }
    } else if (!this.waveCompleted && this.enemies().length === 0) {
      // Vague terminée
      this.waveCompleted = true;
      this.gold.update(g => g + 50); // bonus de fin de vague

      if (this.currentWave() >= this.waves.length) {
        this.gameStatus.set('won');
        this.audioService.play('victory');
      }
    }
  }

  private spawnWaveEnemy(hp: number, speed: number): void {
    const enemy: Enemy = {
      id: this.nextEnemyId++,
      hp, maxHp: hp,
      speed,
      progress: 0
    };
    this.enemies.update(enemies => [...enemies, enemy]);
  }

  // Signal des tirs actifs (pour l'affichage temporaire)
  readonly shots = signal<{
    id: number;
    fromX: number; fromY: number;
    toX: number; toY: number;
    createdAt: number;
    color: string;   // 👈 ajout
  }[]>([]);  private nextShotId = 0;

  // Calcule la distance entre une tour et un ennemi (en cases)
  private distance(tower: Tower, enemyRow: number, enemyCol: number): number {
    const dr = tower.row - enemyRow;
    const dc = tower.col - enemyCol;
    return Math.sqrt(dr * dr + dc * dc);
  }

  // Position d'un ennemi en coordonnées (row, col) flottantes
  private getEnemyCoords(enemy: Enemy): { row: number; col: number } {
    const i = Math.floor(enemy.progress);
    const frac = enemy.progress - i;
    const current = this.path[i];
    const next = this.path[Math.min(i + 1, this.path.length - 1)];
    return {
      row: current.row + (next.row - current.row) * frac,
      col: current.col + (next.col - current.col) * frac
    };
  }

  private updateTowers(now: number): void {
    const currentEnemies = this.enemies();
    const damagedEnemies = new Map<number, number>(); // enemyId -> total damage
    const newShots: typeof this.shots extends ReturnType<typeof signal<infer T>> ? T : never = [];

    for (const tower of this.towers()) {
      // Cooldown
      const cooldown = 1000 / tower.fireRate; // en ms
      if (now - tower.lastFireTime < cooldown) continue;

      // Cible la plus proche dans la portée
      let target: Enemy | null = null;
      let bestDistance = Infinity;

      for (const enemy of currentEnemies) {
        const { row, col } = this.getEnemyCoords(enemy);
        const d = this.distance(tower, row, col);
        if (d <= tower.range && d < bestDistance) {
          bestDistance = d;
          target = enemy;
        }
      }

      if (target) {
        // Inflige les dégâts (cumulés si plusieurs tours visent le même)
        damagedEnemies.set(target.id, (damagedEnemies.get(target.id) ?? 0) + tower.damage);
        tower.lastFireTime = now;

        // Enregistre le tir pour l'animation
        const targetCoords = this.getEnemyCoords(target);
        newShots.push({
        id: this.nextShotId++,
        fromX: tower.col,
        fromY: tower.row,
        toX: targetCoords.col,
        toY: targetCoords.row,
        createdAt: now,
        color: TOWER_TYPES[tower.kind].color
});
        this.audioService.play('shoot');
      }
    }

  // Applique les dégâts
  if (damagedEnemies.size > 0) {

  let goldEarned = 0;
  let killsThisTick = 0;

  this.enemies.update(enemies => {
  const updated = enemies.map(e => damagedEnemies.has(e.id)
    ? { ...e, hp: e.hp - damagedEnemies.get(e.id)! }
    : e);

  for (const e of updated) {
    if (e.hp <= 0) {
    goldEarned += 5;
    killsThisTick++;
    this.audioService.play('enemy-die');
    }
  }

  return updated.filter(e => e.hp > 0);
  });

  if (goldEarned > 0) {
    this.gold.update(g => g + goldEarned);
    }
  if (killsThisTick > 0) {
    this.killCount.update(k => k + killsThisTick);
    }    
  }

    // Ajoute les nouveaux tirs et nettoie les vieux (>150ms)
  if (newShots.length > 0 || this.shots().length > 0) {
    this.shots.update(shots =>
      [...shots, ...newShots].filter(s => now - s.createdAt < 150)
      );
    }
  }
  resetGame(): void {
  // Stop la boucle pour éviter les ticks pendant le reset
  this.stopGameLoop();

  // Reset des états du joueur
  this.gold.set(100);
  this.life.set(20);
  this.currentWave.set(0);
  this.gameStatus.set('idle');
  this.killCount.set(0);

  // Reset des entités
  this.towers.set([]);
  this.enemies.set([]);
  this.shots.set([]);

  // Reset des compteurs internes
  this.nextEnemyId = 0;
  this.nextTowerId = 0;
  this.nextShotId = 0;
  this.spawnedInWave = 0;
  this.timeSinceLastSpawn = 0;
  this.waveCompleted = false;

  // Relance la boucle
  this.startGameLoop();
  }
}
