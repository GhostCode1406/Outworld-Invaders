import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { Auth } from '../../Services/auth/auth';
import { AudioService } from '../../Services/audio/audio';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar {
  private authService = inject(Auth);
  private router = inject(Router);
  private audio = inject(AudioService);

  readonly currentUser = this.authService.currentUser;
  readonly isLoggedIn = this.authService.isLoggedIn;
  readonly muted = signal(this.audio.isMuted());

  toggleMute(): void {
  const newMuted = !this.muted();
  this.audio.setMuted(newMuted);
  this.muted.set(newMuted);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}