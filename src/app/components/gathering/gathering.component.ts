import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { AppStore } from '../../store/app.store';
import { ActionType } from '../../store/ui.model';
import { GatheringType } from '../../store/processes.model';

@Component({
  selector: 'app-gathering',
  standalone: true,
  imports: [CommonModule], 
  templateUrl: './gathering.component.html',
  styleUrl: './gathering.component.scss'
})

export class GatheringComponent {
  private destroy$ = new Subject<void>();
  constructor(public store: AppStore) { }

  ngOnInit() {
    this.store.resourceUpdateError$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(error => {
      if (error) {
        setTimeout(() => { this.dismissError(); }, 5000);
      }
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  gatherResource(resourceType: GatheringType) {
    this.store.startGathering({
      type: resourceType,
      amount: 10,
      duration: 4000 
    });
  }

  dismissError() {
    this.store.clearErrors(ActionType.UPDATE_RESOURCES);
  }
}

