import { Component, inject } from '@angular/core';
import { Game as GameService } from '../../../Services/game/game';
import { Auth } from '../../../Services/auth/auth';

@Component({
  selector: 'app-game-over',
  imports: [],
  templateUrl: './game-over.html',
  styleUrl: './game-over.css'
})
export class GameOver {
  private gameService = inject(GameService);
  private authService = inject(Auth);

  readonly gameStatus = this.gameService.gameStatus;
  readonly currentWave = this.gameService.currentWave;
  readonly killCount = this.gameService.killCount;
  readonly gold = this.gameService.gold;
  readonly isLoggedIn = this.authService.isLoggedIn;

  finalScore(): number {
    return this.gameService.computeFinalScore();
  }

  resetGame(): void {
    this.gameService.resetGame();
  }
}