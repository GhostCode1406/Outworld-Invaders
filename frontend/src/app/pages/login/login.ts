import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Auth } from '../../Services/auth/auth';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  private authService = inject(Auth);
  private router = inject(Router);

  username = '';
  password = '';
  mode = signal<'login' | 'register'>('login');
  errorMessage = signal<string>('');
  isLoading = signal<boolean>(false);

  toggleMode(): void {
    this.mode.update(m => m === 'login' ? 'register' : 'login');
    this.errorMessage.set('');
  }

  submit(): void {
    if (!this.username || !this.password) {
      this.errorMessage.set('Tous les champs sont obligatoires');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    if (this.mode() === 'login') {
      this.authService.login(this.username, this.password).subscribe({
        next: () => {
          this.isLoading.set(false);
          this.router.navigate(['/']);
        },
        error: err => {
          this.isLoading.set(false);
          this.errorMessage.set(err.error?.error || 'Erreur de connexion');
        }
      });
    } else {
      this.authService.register(this.username, this.password).subscribe({
        next: () => {
          // Auto-login après register
          this.authService.login(this.username, this.password).subscribe({
            next: () => {
              this.isLoading.set(false);
              this.router.navigate(['/']);
            }
          });
        },
        error: err => {
          this.isLoading.set(false);
          this.errorMessage.set(err.error?.error || "Erreur lors de l'inscription");
        }
      });
    }
  }
}