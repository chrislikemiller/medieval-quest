import { Component, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { AppStore } from '../store/app.store';
import { VillagerGathering } from '../store/models/processes.model';
import { HomeButtonComponent } from '../controls/home-button.component';
import { SectionComponent } from '../controls/section.component';
import { Router } from '@angular/router';
import { ProcessService } from '../services/process.service';

@Component({
  selector: 'app-gathering',
  standalone: true,
  imports: [CommonModule, HomeButtonComponent, SectionComponent],
  template: `<div class="main">
    <div class="gathering-container">
        <!-- Villager gathering -->
        <app-section
          sectionTitle="Villager gathering"
          buttonTitle="Navigate"
          [isActionEnabled]="true"
          route="/villager-gathering"
          processType="villager-gathering"
          (buttonClicked)="onVillagerGatheringClick()">
        </app-section>
        <!-- Farming -->
        <app-section
          sectionTitle="Farming"
          buttonTitle="Go"
          [isActionEnabled]="(store.isFarmingAvailable$ | async) ?? false"
          route="farming"
          processType="farming"
          (buttonClicked)="onFarmingClick()">
        </app-section>
        <!-- Quarry -->
        <app-section
          sectionTitle="Quarry"
          buttonTitle="Go"
          [isActionEnabled]="true"
          route="home"
          processType="quarry"
          (buttonClicked)="onQuarryClick()">
        </app-section>
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
  constructor(
    public store: AppStore, 
    private router: Router,
    private processService: ProcessService,
    private ngZone: NgZone
  ) {}

  onVillagerGatheringClick() {
    // Handle villager gathering action or navigation
    this.router.navigate(['/villager-gathering']);
  }

  onFarmingClick() {
    // Handle farming action or navigation
    this.router.navigate(['farming']);
  }

  onQuarryClick() {
    // Handle quarry action or navigation
    this.router.navigate(['home']);
  }
}
