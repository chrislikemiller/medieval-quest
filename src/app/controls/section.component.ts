import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, input, signal } from '@angular/core';
import { Process } from '../store/models/processes.model';
import { AppStore } from '../store/app.store';
import { RouterModule } from '@angular/router';
import { ProcessService } from '../services/process.service';
import { CircleProgressComponent } from './circle-progress.component';

@Component({
  selector: 'app-section',
  imports: [CommonModule, RouterModule, CircleProgressComponent],
  templateUrl: './section.component.html',
  styleUrls: ['./section.component.scss'],
})
export class SectionComponent {
  @Output() buttonClicked: EventEmitter<void>;

  readonly sectionTitle = input.required<string>();
  readonly buttonTitle = input.required<string>();
  readonly isActionEnabled = input.required<boolean>();
  readonly route = input<string>();
  readonly processType = input.required<string>();

  // Replace processes$ with a signal
  activeProcess = signal<Process | null>(null);

  constructor(private store: AppStore, private processService: ProcessService) {
    this.buttonClicked = new EventEmitter<void>();
  }

  completeProcess(process: Process) {
    this.processService.claimReward(process);
    this.activeProcess.set(null);
  }

  cancelProcess(process: Process) {
    this.processService.cancelProcess(process);
    // The activeProcess is set to null here, but let's make sure it happens immediately
    this.activeProcess.set(null);
  }

  handleProcessCancel(processId: string) {
    const process = this.activeProcess();
    if (process && process.id === processId) {
      this.cancelProcess(process);
      this.activeProcess.set(null); // Ensure the active process is set to null
    }
  }

  handleProcessComplete(processId: string) {
    const process = this.activeProcess();
    if (process && process.id === processId) {
      this.completeProcess(process);
    }
  }

  handleButtonClick() {
    if (this.activeProcess() === null) {
      // Only emit if we don't have an active process
      this.buttonClicked.emit();
    }
  }

  // Method to set the process when it's created
  setProcess(process: Process) {
    this.activeProcess.set(process);
  }
}
