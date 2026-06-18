import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Game } from './Components/game/game';
import { Leaderboard } from './pages/leaderboard/leaderboard';
import { Login } from './pages/login/login';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'game', component: Game },
  { path: 'leaderboard', component: Leaderboard },
  { path: 'login', component: Login },
  { path: '**', redirectTo: '' }   // route fallback (404 → accueil)
];