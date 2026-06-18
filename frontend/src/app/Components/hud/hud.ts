import { Component, inject } from '@angular/core';
import { Game as GameService } from '../../Services/game/game';

@Component({
  selector: 'app-hud',
  imports: [],
  templateUrl: './hud.html',
  styleUrl: './hud.css',
})
export class Hud {
  private gameService = inject(GameService);

  readonly gold = this.gameService.gold;
  readonly life = this.gameService.life;
  readonly currentWave = this.gameService.currentWave;
  readonly gameStatus = this.gameService.gameStatus;
  readonly towerCost = this.gameService.TOWER_COST;

  startNextWave(): void {
    this.gameService.startNextWave();
  }

  resetGame(): void {
    this.gameService.resetGame();
  }
}
