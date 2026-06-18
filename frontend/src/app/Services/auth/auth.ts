import { Injectable, inject, signal } from '@angular/core';
import { Api } from '../api/api';
import { Observable, tap } from 'rxjs';

interface AuthResponse {
  token: string;
  user: { id: number; username: string };
}

interface User {
  id: number;
  username: string;
}

const TOKEN_KEY = 'td_token';
const USER_KEY = 'td_user';

@Injectable({
  providedIn: 'root'
})
export class Auth {
  private api = inject(Api);

  // État réactif (signals)
  readonly currentUser = signal<User | null>(this.loadStoredUser());
  readonly isLoggedIn = signal<boolean>(!!localStorage.getItem(TOKEN_KEY));

  register(username: string, password: string): Observable<User> {
    return this.api.post<User>('/auth/register', { username, password });
  }

  login(username: string, password: string): Observable<AuthResponse> {
    return this.api.post<AuthResponse>('/auth/login', { username, password }).pipe(
      tap(response => {
        // Stockage du token et du user
        localStorage.setItem(TOKEN_KEY, response.token);
        localStorage.setItem(USER_KEY, JSON.stringify(response.user));
        this.currentUser.set(response.user);
        this.isLoggedIn.set(true);
      })
    );
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.currentUser.set(null);
    this.isLoggedIn.set(false);
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  private loadStoredUser(): User | null {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  }
}