import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PopupBaseComponent } from './controls/base-popup.component';
import { CommonModule } from '@angular/common';
import { AppStore } from './store/app.store';
import { ProcessComponent } from './components/process.component';
import { AuthService } from './services/auth.service';
import { distinctUntilChanged, Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, PopupBaseComponent, ProcessComponent],
  template: `
    <div class="full-view">
      <div *ngIf="shouldShow" class="header">
        <div
          class="popup-icon"
          (click)="popuppopulation.togglePopup()"
          title="Pop">
          Pop
        </div>
        <div
          class="popup-icon"
          (click)="popupresources.togglePopup()"
          title="Resources">
          Res
        </div>
        <div
          class="popup-icon"
          (click)="popupprocess.togglePopup()"
          title="Processes">
          Proc
        </div>

        <div class="spacer"></div>
        <div style="align-content: center; padding-inline: 1rem;">
          {{ store.username$ | async }}
        </div>

        <div class="logout button-theme" (click)="logout()">Logout</div>
      </div>

      <popup-base class="popup popup-population" #popuppopulation>
        <div class="dashboard-stats">
          <div class="stat-card">
            <div>Houses</div>
            <p>{{ store.houses$ | async }}</p>
          </div>
          <div class="stat-card">
            <div>Population</div>
            <p>{{ store.population$ | async }}</p>
          </div>
          <div class="stat-card">
            <div>Villagers</div>
            <p>{{ store.villagers$ | async }}</p>
          </div>
          <div class="stat-card">
            <div>Farmers</div>
            <p>{{ store.farmers$ | async }}</p>
          </div>
          <div class="stat-card">
            <div>Hunters</div>
            <p>{{ store.hunters$ | async }}</p>
          </div>
        </div>
      </popup-base>

      <popup-base class="popup popup-resources" #popupresources>
        <div class="dashboard-stats">
          <div class="stat-card">
            <div>Wood</div>
            <p>{{ store.wood$ | async }}</p>
          </div>
          <div class="stat-card">
            <div>Stone</div>
            <p>{{ store.stone$ | async }}</p>
          </div>
          <div class="stat-card">
            <div>Food</div>
            <p>{{ store.food$ | async }}</p>
          </div>
        </div>
      </popup-base>

      <popup-base class="popup popup-process" #popupprocess>
        <app-process class="progress-bars"></app-process>
      </popup-base>

      <div
        class="error-message"
        [class.show]="isVisible"
        [class.hide]="!isVisible"
        *ngIf="isVisible">
        <p>{{ errorMessage }}</p>
        <button class="button-theme" (click)="dismissError()">Dismiss</button>
      </div>

      <div class="content">
        <router-outlet></router-outlet>
      </div>
    </div>
  `,
  styles: /*css*/ `
      @use './styles/_variables.scss' as vars;

      * {
        box-sizing: border-box;
      }

      .header {
        background-color: wheat; 
        display: flex;
        gap: .5rem;
        padding: 1rem;
      }

      .popup-icon {
        height: 2rem;
        background-color: beige;
        display: flex;
        justify-content: center;
        align-items: center;
        cursor: pointer;
        border-radius: 5px;
        padding: .5rem;
        transition: all 0.3s;
      }

      .popup {
        position: fixed;
        z-index: 1000;
        margin-inline: 2rem;
      }

      .dashboard-content {
        display: grid;
        grid-template-columns: 1fr 25rem;
        gap: 10px;
        padding: 1rem;
      }

      .progress-bars {
        flex-grow: 1;
      }

      .dashboard-stats {
        display: grid;
        grid-template-columns: 1fr 1fr 1fr 1fr;
        grid-template-rows: 1fr 1fr 1fr 1fr;
        border-radius: 8px;
        background-color: beige;
        box-shadow: 0 8px 8px rgba(0, 0, 0, 0.05);
        gap: 4px;
        padding: 1rem;

        .stat-card {
          border: 1px solid vars.$primary-color;
          border-radius: 8px;
          padding: 4px;
        }

        div {
          color: vars.$secondary-color;
          font-weight: 500;
        }

        p {
          font-weight: 600;
          color: #212529;
          margin: 0;
        }
      }

      .spacer {
        flex-grow: 1;
      }

      .logout {
        padding: 4px;
        align-content: center;
      }

      .error-message {
        border: 2px solid vars.$dark-accent;
        border-radius: 1rem;
        background: adjust-color(#933, $lightness: 15%);
        position: fixed;
        z-index: 1000;
        padding: 1rem;
        margin: 2rem;
        translate: 0 250%;
        width: 50%;
        justify-content: right;
        
        .error-message.show {
          opacity: 1;
        }
        .error-message.hide {
          opacity: 0;
        }        
      }

      .content {
        height: 100vh;
        padding: 1rem;
        background-color: #fffad5;
        background-repeat: no-repeat;
        background-size: cover;
        background-image: url('data:image/svg+xml,%0A%3Csvg%20id%3D%22visual%22%20viewBox%3D%220%200%201960%201540%22%20width%3D%221960%22%20height%3D%221540%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20xmlns%3Axlink%3D%22http%3A%2F%2Fwww.w3.org%2F1999%2Fxlink%22%20version%3D%221.1%22%3E%3Crect%20x%3D%220%22%20y%3D%220%22%20width%3D%221960%22%20height%3D%221540%22%20fill%3D%22%23fffad5%22%3E%3C%2Frect%3E%3Cpath%20d%3D%22M0%201115L46.7%201113.7C93.3%201112.3%20186.7%201109.7%20280%201130.5C373.3%201151.3%20466.7%201195.7%20560%201209.2C653.3%201222.7%20746.7%201205.3%20840%201182.3C933.3%201159.3%201026.7%201130.7%201120%201124.2C1213.3%201117.7%201306.7%201133.3%201400%201162.2C1493.3%201191%201586.7%201233%201680%201233.7C1773.3%201234.3%201866.7%201193.7%201913.3%201173.3L1960%201153L1960%201541L1913.3%201541C1866.7%201541%201773.3%201541%201680%201541C1586.7%201541%201493.3%201541%201400%201541C1306.7%201541%201213.3%201541%201120%201541C1026.7%201541%20933.3%201541%20840%201541C746.7%201541%20653.3%201541%20560%201541C466.7%201541%20373.3%201541%20280%201541C186.7%201541%2093.3%201541%2046.7%201541L0%201541Z%22%20fill%3D%22%23ffc874%22%3E%3C%2Fpath%3E%3Cpath%20d%3D%22M0%201254L46.7%201269C93.3%201284%20186.7%201314%20280%201325.3C373.3%201336.7%20466.7%201329.3%20560%201308.7C653.3%201288%20746.7%201254%20840%201237.3C933.3%201220.7%201026.7%201221.3%201120%201222.7C1213.3%201224%201306.7%201226%201400%201224.3C1493.3%201222.7%201586.7%201217.3%201680%201240.8C1773.3%201264.3%201866.7%201316.7%201913.3%201342.8L1960%201369L1960%201541L1913.3%201541C1866.7%201541%201773.3%201541%201680%201541C1586.7%201541%201493.3%201541%201400%201541C1306.7%201541%201213.3%201541%201120%201541C1026.7%201541%20933.3%201541%20840%201541C746.7%201541%20653.3%201541%20560%201541C466.7%201541%20373.3%201541%20280%201541C186.7%201541%2093.3%201541%2046.7%201541L0%201541Z%22%20fill%3D%22%23fbb54a%22%3E%3C%2Fpath%3E%3Cpath%20d%3D%22M0%201462L46.7%201461.7C93.3%201461.3%20186.7%201460.7%20280%201447.2C373.3%201433.7%20466.7%201407.3%20560%201405C653.3%201402.7%20746.7%201424.3%20840%201415.5C933.3%201406.7%201026.7%201367.3%201120%201346.8C1213.3%201326.3%201306.7%201324.7%201400%201323.8C1493.3%201323%201586.7%201323%201680%201335C1773.3%201347%201866.7%201371%201913.3%201383L1960%201395L1960%201541L1913.3%201541C1866.7%201541%201773.3%201541%201680%201541C1586.7%201541%201493.3%201541%201400%201541C1306.7%201541%201213.3%201541%201120%201541C1026.7%201541%20933.3%201541%20840%201541C746.7%201541%20653.3%201541%20560%201541C466.7%201541%20373.3%201541%20280%201541C186.7%201541%2093.3%201541%2046.7%201541L0%201541Z%22%20fill%3D%22%23f7a10f%22%3E%3C%2Fpath%3E%3C%2Fsvg%3E');
        animation: slideUp 2s ease-in-out;
        background-position: bottom;
      }

      @keyframes slideUp {
        0% {
          background-position: 0 4vh;
        }

        100% {
          background-position: bottom center;
        }
      }
    `,
})
export class AppComponent {
  private destroy$ = new Subject<void>();

  shouldShow: boolean = false;
  title = 'medieval-quest';
  totalPopulation: number = 0;
  isVisible: boolean;
  errorMessage: string | null;

  constructor(public authService: AuthService, public store: AppStore) {
    this.isVisible = false;
    this.errorMessage = null;

    store.population$.subscribe((population) => {
      this.totalPopulation = population;
    });
    authService.currentLoggedInUser
      .pipe(distinctUntilChanged())
      .subscribe((currentUser) => {
        this.shouldShow = currentUser !== '';
      });
  }

  ngOnInit() {
    this.store.error$.pipe(takeUntil(this.destroy$)).subscribe((error) => {
      this.isVisible = error !== null;
      this.errorMessage = error;
      if (error) {
        setTimeout(() => {
          this.dismissError();
        }, 5000);
      }
    });
  }

  ngOnDestroy() {
    this.dismissError();
    this.destroy$.next();
    this.destroy$.complete();
  }

  logout() {
    this.authService.logout();
  }

  dismissError() {
    this.store.clearError();
  }
}
