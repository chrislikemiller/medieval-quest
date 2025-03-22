import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { RouterLink } from '@angular/router';
import { AppStore } from '../store/app.store';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="login-form">
      <h2>Login</h2>
      <input type="text" placeholder="Username" [(ngModel)]="username" />
      <input type="password" placeholder="Password" [(ngModel)]="password" />
      <button class="button-theme" (click)="login()">Login</button>
      <p>Don't have an account? <a routerLink="/register">Register</a></p>
    </div>
  `,
  styles: [
    `
      .login-form {
        display: flex;
        flex-direction: column;
        gap: .5rem;
      }

      .error-message {
        color: red;
      }
    `,
  ],
})
export class LoginComponent {
  errorMessage: any;
  username: any;
  password: any;

  constructor(private authService: AuthService, public store: AppStore) {}

  async login() {
    (await this.authService.login(this.username, this.password)).subscribe(
      (isSuccess) => {
        if (!isSuccess) {
          this.store.setError('Invalid credentials');
        }
      },
    );
  }
}
