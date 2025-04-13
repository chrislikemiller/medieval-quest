import { Component } from '@angular/core';
import { GatheringBuilding } from '../store/models/processes.model';
import { AppStore } from '../store/app.store';
import { CommonModule } from '@angular/common';
import { HomeButtonComponent } from '../controls/home-button.component';
import { SectionComponent } from '../controls/section.component';
import { ProcessService } from '../services/process.service';

@Component({
  selector: 'app-buildings',
  imports: [
    CommonModule,
    HomeButtonComponent,
    HomeButtonComponent,
    SectionComponent,
  ],
  template: `<div class="main">
    <div>
      <!-- Build farm -->
      <app-section
        sectionTitle="Farms"
        buttonTitle="Build"
        [isActionEnabled]="true"
        processType="buildFarm"
        (buttonClicked)="buildBuilding('buildFarm')">
      </app-section>

      <!-- Build mine -->
      <app-section
        sectionTitle="Mine"
        buttonTitle="Build"
        [isActionEnabled]="true"
        processType="buildMine"
        (buttonClicked)="buildBuilding('buildMine')">
      </app-section>
    </div>
    <app-home-button></app-home-button>
  </div>`,
  styles: [
    `
      @use '../styles/variables.scss' as vars;
    `,
  ],
})
export class BuildingsComponent {
  constructor(public store: AppStore, private processService: ProcessService) {}

  buildBuilding(buildingType: GatheringBuilding) {
    this.processService.startProcess(buildingType);
  }
}
