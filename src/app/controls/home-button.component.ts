import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home-button',
  imports: [RouterLink],
  template: `<button class="home-button" routerLink="/">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="24"
      height="24"
      fill="currentColor"
    >
      <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
    </svg>
  </button>`,
  styles: [
    `
      @use '../styles/variables' as vars;
      .home-button {
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 50px;
        height: 50px;
        border: none;
        border-radius: 50%;
        background-color: vars.$secondary-color; /* Blue color */
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        cursor: pointer;
        transition: background-color 0.3s ease, transform 0.2s ease;
      }

      .home-button:hover {
        background-color: vars.$secondary-color-dark;
        transform: scale(1.05); 
      }

      .home-button svg {
        width: 24px;
        height: 24px;
      }
    `,
  ],
})
export class HomeButtonComponent {}
