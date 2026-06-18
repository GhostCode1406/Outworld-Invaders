import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Api } from '../api/api';
import { Auth } from '../auth/auth';

export interface LeaderboardEntry {
  id: number;
  username: string;
  wave: number;
  points: number;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class Score {
  private api = inject(Api);
  private authService = inject(Auth);

  getLeaderboard(): Observable<LeaderboardEntry[]> {
    return this.api.get<LeaderboardEntry[]>('/scores');
  }

  submitScore(wave: number, points: number): Observable<any> {
    const token = this.authService.getToken();
    if (!token) {
      throw new Error('Cannot submit score without being logged in');
    }
    return this.api.post('/scores', { wave, points }, token);
  }
}