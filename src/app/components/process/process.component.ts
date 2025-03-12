// src/app/components/process/process.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { interval, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppStore } from '../../store/app.store';
import { GatheringType, Process, ProcessState } from '../../store/processes.model';
// import { Process, GatheringType } from '../../store/gathering.model';

@Component({
  selector: 'app-process',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './process.component.html',
  styleUrl: './process.component.scss'
})
export class ProcessComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private updateTrigger$ = new Subject<void>();

  constructor(public store: AppStore) { }

  ngOnInit() {
    interval(1000)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.updateTrigger$.next());
    this.store.loadState();
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
  }

  cancelProcess(processId: string) {
    this.store.cancelGathering(processId);
  }
}
