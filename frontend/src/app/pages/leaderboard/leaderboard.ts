import { Component, OnInit, inject, signal } from '@angular/core';
import { Score, LeaderboardEntry } from '../../Services/score/score';

@Component({
  selector: 'app-leaderboard',
  imports: [],
  templateUrl: './leaderboard.html',
  styleUrl: './leaderboard.css'
})
export class Leaderboard implements OnInit {
  private scoreService = inject(Score);

  readonly entries = signal<LeaderboardEntry[]>([]);
  readonly isLoading = signal<boolean>(true);
  readonly errorMessage = signal<string>('');

  ngOnInit(): void {
    this.loadLeaderboard();
  }

  loadLeaderboard(): void {
    this.isLoading.set(true);
    this.scoreService.getLeaderboard().subscribe({
      next: data => {
        this.entries.set(data);
        this.isLoading.set(false);
      },
      error: err => {
        this.errorMessage.set('Impossible de charger le leaderboard');
        this.isLoading.set(false);
      }
    });
  }

  formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('fr-FR', {
      day: '2-digit', month: '2-digit', year: 'numeric'
    });
  }
}