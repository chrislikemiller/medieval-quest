import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { interval, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppStore } from '../store/app.store';
import { VillagerGatheringType, Process, ProcessState } from '../store/models/processes.model';

@Component({
  selector: 'app-process',
  standalone: true,
  imports: [CommonModule],
  template: `<div class="progress-container">
  <div *ngIf="(store.sortedActiveProcesses$ | async)?.length === 0" class="no-processes">
    No active processes
  </div>
  <div class="progress-list">
    <div *ngFor="let process of store.visibleProcesses$ | async" class="progress-item">
      <div class="progress-info">
        <span class="process-type">{{ process.options.type }}</span>
      </div>
      <div class="progress-bar-container">
        <div class="progress-bar" [style.width]="getProgressPercentage(process) + '%'"></div>
      </div>
      <button *ngIf="process.completed" class="btn-claim" (click)="claimReward(process.id)">
        <svg class="svg-icon" fill="#fff" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M1 7L5.5 11.5L14 3" stroke="#fff" stroke-linecap="square"/> </svg>
          <div class="time-remaining">Claim</div>
      </button>
      <button *ngIf="!process.completed" class="btn-cancel" (click)="cancelProcess(process.id)">
        <svg class="svg-icon" fill="#fff" viewBox="-4 -8 36 36" id="cross" data-name="Flat Color" xmlns="http://www.w3.org/2000/svg" class="icon flat-color"><path id="primary" d="M13.41,12l6.3-6.29a1,1,0,1,0-1.42-1.42L12,10.59,5.71,4.29A1,1,0,0,0,4.29,5.71L10.59,12l-6.3,6.29a1,1,0,0,0,0,1.42,1,1,0,0,0,1.42,0L12,13.41l6.29,6.3a1,1,0,0,0,1.42,0,1,1,0,0,0,0-1.42Z">
        </path>
        </svg>
        <div class="time-remaining" *ngIf="!process.completed">
          {{ getTimeRemaining(process) }}
        </div>
      </button>
    </div>
    <div *ngIf="(store.hiddenProcessCount$ | async) ?? 0 > 0" class="more-processes">
      {{ store.hiddenProcessCount$ | async }} more
    </div>
  </div>
</div>`,
  styles: [`.progress-container {
  margin-top: 20px;
}
.no-processes {
  padding: 10px;
  background-color: #f0f0f0;
  border-radius: 4px;
  text-align: center;
  font-style: italic;
  color: #666;
}
.progress-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 10px;
}
.progress-item {
  display: flex;
  align-items: center;
  background-color: #f8f9fa;
  padding: 12px;
  border-radius: 6px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}
.progress-info {
  display: flex;
  flex-direction: column;
}
.process-type {
  font-weight: 500;
}
.process-amount {
  color: #28a745;
  font-weight: 600;
}
.progress-bar-container {
  display: flex;
  flex: 1;
  height: 12px;
  background-color: #e9ecef;
  border: 1px solid black;
  width: 10rem;
  border-radius: 6px;
  overflow: hidden;
  margin: 0 12px;
}
.progress-bar {
  background-color: #007bff;
  transition: width 1.1s ease-in-out;
}
.btn-claim,
.btn-cancel {
  display: flex;
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
}`]
})
export class ProcessComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private updateTrigger$ = new Subject<void>();

  constructor(public store: AppStore) { }

  ngOnInit() {
    interval(1000)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.updateTrigger$.next());
    this.store.loadProcessesState();
    this.store.checkCompletedProcesses();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
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

    // Format as mm:ss
    const minutes = Math.floor(remaining / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);

    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  claimReward(processId: string) {
    this.store.claimReward(processId);
    this.store.saveState();
  }

  cancelProcess(processId: string) {
    this.store.cancelGathering(processId);
  }
}
