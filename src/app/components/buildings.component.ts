import { Component } from '@angular/core';
import { BuildingType } from '../store/models/processes.model';
import { AppStore } from '../store/app.store';
import { CommonModule } from '@angular/common';
import { HomeButtonComponent } from '../controls/home-button.component';
import { SectionComponent } from '../controls/section.component';

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
        [processes$]="store.buildingProcesses$"
        sectionTitle="Farms"
        buttonTitle="Build"
        (buttonClicked)="buildBuilding('buildFarm')">
      </app-section>

      <!-- Build mine -->
      <app-section
        [processes$]="store.buildingProcesses$"
        sectionTitle="Mine"
        buttonTitle="Build"
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
  constructor(public store: AppStore) {}

  buildBuilding(buildingType: BuildingType) {
    this.store.startBuilding({
      type: buildingType,
      duration: 2000,
    });
  }
}
