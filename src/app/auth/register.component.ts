import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { AppStore } from '../store/app.store';

@Component({
  selector: 'app-register',
  imports: [CommonModule, FormsModule],
  template: `
    <div class="login-form">
      <h2>Register</h2>
      <input class="textbox-theme" type="text" placeholder="Username" [(ngModel)]="username" />
      <input class="textbox-theme" type="password" placeholder="Password" [(ngModel)]="password" />
      <button class="button-theme" (click)="register()">Register</button>
    </div>
  `,
  styles: [
    `
      .login-form {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }

      .error-message {
        color: red;
      }
    `,
  ],
})
export class RegisterComponent {
  passwordValidationRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]).{8,}$/;
  username = '';
  password = '';
  error = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private store: AppStore,
  ) {}

  async register() {
    this.error = `
    ${this.validateUsername(this.username)}
    ${this.validatePassword(this.username)}
    `;
    if (this.error.length > 0) {
      this.store.setError(this.error);
      return;
    }

    const register$ = await this.authService.register(
      this.username,
      this.password,
    );
    register$.subscribe((isSuccess) => {
      if (isSuccess) {
        this.router.navigate(['/login']);
      } else {
        this.store.setError('Username already exists');
      }
    });
  }

  validateUsername(username: string): string {
    if (/^[a-zA-Z0-9]+$/.test(username)) {
      return '';
    }
    return 'Username must contain only letters and numbers.';
  }

  validatePassword(password: string): string {
    if (this.passwordValidationRegex.test(password)) {
      return '';
    }
    return 'Password must contain 8 characters, one uppercase, one lowercase, one number, and one special character.';
  }
}
