import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { AppStore } from '../store/app.store';
import { VillagerGatheringType } from '../store/models/processes.model';
import { HomeButtonComponent } from '../controls/home-button.component';
import { SectionComponent } from '../controls/section.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-gathering',
  standalone: true,
  imports: [CommonModule, HomeButtonComponent, SectionComponent],
  template: `<div class="main">
    <div class="gathering-container">
      <div class="gathering-actions">
        <!-- Villager gathering -->
        <app-section
          [processes$]="store.gatheringProcesses$"
          sectionTitle="Villager gathering"
          buttonTitle="Go"
          (buttonClicked)="navigate('villager-gathering')"
        >
        </app-section>

        <!-- Farming -->
        <app-section
          [processes$]="store.gatheringProcesses$"
          sectionTitle="Farming"
          buttonTitle="Go"
          (buttonClicked)="navigate('home')"
        >
        </app-section>

        <!-- Quarry-->
        <app-section
          [processes$]="store.gatheringProcesses$"
          sectionTitle="Quarry"
          buttonTitle="Go"
          (buttonClicked)="navigate('home')"
        >
        </app-section>
      </div>
    </div>
    <app-home-button></app-home-button>
  </div>`,
  styles: [
    `
      @use '../styles/variables' as vars;
      .gathering-actions {
        display: flex;
        flex-direction: column;
        button {
        }
      }
    `,
  ],
})
export class GatheringComponent {
  constructor(public store: AppStore, private router: Router) {}

  navigate(navPath: string) {
    this.router.navigate([navPath]);
  }
}
