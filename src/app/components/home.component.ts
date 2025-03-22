import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [CommonModule, RouterLink],
  template: `<div>
    <nav class="top-nav">
      <a routerLink="/population" class="nav-item button-theme"> Population </a>
      <a routerLink="/gathering" class="nav-item button-theme"> Gathering </a>
      <a routerLink="/buildings" class="nav-item button-theme"> Buildings </a>
    </nav>
  </div>`,
  styles: [
    `
      .top-nav {
        display: grid;
        gap: 1rem;
      }
      .nav-item {
        cursor: pointer;
        text-decoration: none;
        text-align: center;
        align-content: center;
        padding: 1rem;
        margin: 0.5rem;
      }
    `,
  ],
})
export class HomeComponent {}
