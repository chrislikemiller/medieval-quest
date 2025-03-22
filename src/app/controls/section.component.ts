import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, input } from '@angular/core';
import { Observable } from 'rxjs';
import { Process } from '../store/models/processes.model';
import { AppStore } from '../store/app.store';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

@Component({
  selector: 'app-section',
  imports: [CommonModule, BrowserAnimationsModule],
  animations: [
    trigger('routeAnimations', [
      transition('* <=> *', [
        // Set a common starting style for enter and leave
        query(
          ':enter, :leave',
          [style({ position: 'absolute', width: '100%' })],
          { optional: true }
        ),
        // Fade out the old component
        query(
          ':leave',
          [style({ opacity: 1 }), animate('300ms', style({ opacity: 0 }))],
          { optional: true }
        ),
        // Fade in the new component
        query(
          ':enter',
          [style({ opacity: 0 }), animate('300ms', style({ opacity: 1 }))],
          { optional: true }
        ),
      ]),
    ]),
  ],
  template: /*html*/ `
    <div class="section">
      <div class="section-icon">
        <ng-content></ng-content>
      </div>
      <div class="title">{{ sectionTitle() }}</div>
      <div class="processes" *ngIf="processes$() | async as processes">
        <div *ngFor="let process of processes">
          <div
            class="progress-bar"
            [style.width]="getProgressPercentage(process) + '%'"></div>

          <button
            *ngIf="process.completed"
            class="btn-claim"
            (click)="claimReward(process.id)">
            <svg
              class="svg-icon"
              fill="#fff"
              viewBox="0 0 14 14"
              fill="none"
              xmlns="http://www.w3.org/2000/svg">
              <path
                d="M1 7L5.5 11.5L14 3"
                stroke="#fff"
                stroke-linecap="square" />
            </svg>
            <div class="time-remaining">Claim</div>
          </button>

          <button
            *ngIf="!process.completed"
            class="btn-cancel"
            (click)="cancelProcess(process.id)">
            <svg
              class="svg-icon"
              fill="#fff"
              viewBox="-4 -8 36 36"
              id="cross"
              data-name="Flat Color"
              xmlns="http://www.w3.org/2000/svg"
              class="icon flat-color">
              <path
                id="primary"
                d="M13.41,12l6.3-6.29a1,1,0,1,0-1.42-1.42L12,10.59,5.71,4.29A1,1,0,0,0,4.29,5.71L10.59,12l-6.3,6.29a1,1,0,0,0,0,1.42,1,1,0,0,0,1.42,0L12,13.41l6.29,6.3a1,1,0,0,0,1.42,0,1,1,0,0,0,0-1.42Z"></path>
            </svg>
            <div class="time-remaining" *ngIf="!process.completed">
              {{ getTimeRemaining(process) }}
            </div>
          </button>
        </div>
      </div>
      <div>
        <button
          (click)="buttonClicked.emit()"
          [disabled]="!isActionEnabled()"
          class="nav-button button-theme">
          {{ buttonTitle() }}
        </button>
      </div>
    </div>
  `,
  styles: [
    /*css*/ `
      @use '../styles/variables' as vars;

      * {
        box-sizing: border-box;
      }

      .section {
        height: 5rem;
        display: grid;
        grid-template-columns: auto 1fr 1fr auto;
        align-items: center;
        padding: 1rem;
        margin: 0.5rem;
        border: 2px solid vars.$dark-accent;
        border-radius: 1rem;
      }

      .section-icon {
      }

      .title {
        padding-inline: 2rem;
        font-size: large;
      }

      .processes {
        display: flex;
        flex-direction: column;
        min-width: 2rem;
        max-width: 5rem;
        gap: 12px;
        margin-top: 10px;
      }

      .progress-bar {
        margin: 0.5rem;
        display: flex;
        flex: 1;
        height: 12px;
        background-color: #e9ecef;
        border: 1px solid black;
        border-radius: 6px;
        overflow: hidden;
        background-color: #007bff;
        transition: width 1.1s ease-in-out;
      }

      .btn-claim,
      .btn-cancel {
        display: flex;
        margin: 0.5rem;
        width: 5rem;
        height: 2rem;
        border: none;
        border-radius: 4px;
        font-weight: 500;
        justify-content: center;
        align-items: center;
        cursor: pointer;
        .time-remaining {
          justify-content: center;
          align-items: center;
          width: 2rem;
        }
        .svg-icon {
          justify-content: center;
          align-items: center;
          width: 1.2rem;
          height: 1.2rem;
          padding-right: 4px;
        }
      }
      .btn-claim {
        background-color: #28a745;
        color: white;
      }
      .btn-cancel {
        background-color: #dc3545;
        color: white;
      }
      .more-processes {
        text-align: center;
        padding: 8px;
        font-style: italic;
        color: #666;
      }
    `,
  ],
})
export class SectionComponent {
  @Output() buttonClicked: EventEmitter<void>;

  readonly sectionTitle = input.required<string>();
  readonly buttonTitle = input.required<string>();
  readonly processes$ = input.required<Observable<Process[]>>();
  readonly isActionEnabled = input<boolean>(true);

  constructor(private store: AppStore) {
    this.buttonClicked = new EventEmitter<void>();
  }

  getProgressPercentage(process: Process): number {
    if (process.completed) return 100;

    const now = Date.now();
    const total = process.endTime - process.startTime;
    const elapsed = now - process.startTime;

    return Math.min(100, Math.max(0, (elapsed / total) * 100));
  }

  getTimeRemaining(process: Process): string {
    if (process.completed) return 'Done';

    const now = Date.now();
    const remaining = Math.max(0, process.endTime - now);

    if (remaining === 0) return 'Done';

    const minutes = Math.floor(remaining / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);

    // Format as mm:ss
    return `${minutes.toString().padStart(2, '0')}:${seconds
      .toString()
      .padStart(2, '0')}`;
  }

  claimReward(processId: string) {
    this.store.claimReward(processId);
    this.store.saveState();
  }

  cancelProcess(processId: string) {
    this.store.cancelGathering(processId);
  }
}
