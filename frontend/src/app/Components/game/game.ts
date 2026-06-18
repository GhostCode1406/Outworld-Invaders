import { Component, OnInit, inject, effect } from '@angular/core';
import { Grid } from '../grid/grid';
import { Hud } from '../hud/hud';
import { Game as GameService } from '../../Services/game/game';
import { Auth } from '../../Services/auth/auth';
import { Score } from '../../Services/score/score';
import { GameOver } from '../game-over/game-over/game-over';
import { Shop } from '../shop/shop';

@Component({
  selector: 'app-game',
  imports: [Grid, Hud, GameOver, Shop],
  templateUrl: './game.html',
  styleUrl: './game.css',
  })
  export class Game implements OnInit {
    
  private gameService = inject(GameService);
  private authService = inject(Auth);
  private scoreService = inject(Score);

  private hasSubmitted = false;

  constructor() {
  effect(() => {
    const status = this.gameService.gameStatus();

    // Reset du flag quand une nouvelle partie commence
    if (status === 'idle' || status === 'playing') {
      this.hasSubmitted = false;
    }

    // Soumission quand la partie se termine
    if ((status === 'won' || status === 'lost') && !this.hasSubmitted) {
      this.hasSubmitted = true;
      this.submitScore();
    }
  });
}

  ngOnInit(): void {
    this.gameService.startGameLoop();
  }

  private submitScore(): void {
    if (!this.authService.isLoggedIn()) {
      console.log('Score non soumis : utilisateur non connecté');
      return;
    }

    const wave = this.gameService.currentWave();
    const points = this.gameService.computeFinalScore();

    this.scoreService.submitScore(wave, points).subscribe({
      next: () => console.log('✅ Score soumis avec succès'),
      error: err => console.error('❌ Erreur soumission score', err)
    });
  }
}