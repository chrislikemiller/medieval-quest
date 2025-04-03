import { Component } from '@angular/core';
import { AppStore } from '../store/app.store';
import {
  upgradeHousing,
  SpecializedVillager,
  villager,
} from '../store/models/processes.model';
import { CommonModule } from '@angular/common';
import { HomeButtonComponent } from '../controls/home-button.component';
import { SectionComponent } from '../controls/section.component';
import { ProcessService } from '../services/process.service';

@Component({
  selector: 'app-population',
  imports: [
    CommonModule,
    HomeButtonComponent,
    HomeButtonComponent,
    SectionComponent,
  ],
  template: `<div class="main">
    <div>
      <app-section
        class=""
        sectionTitle="Build house"
        buttonTitle="Go"
        (buttonClicked)="buildHouse()"
        [processes$]="store.buildingProcesses$"
        [isActionEnabled]="(store.canStartBuilding$ | async) ?? false">
      </app-section>
      <app-section
        class=""
        sectionTitle="Recruit people"
        buttonTitle="Go"
        (buttonClicked)="recruitPeople()"
        [processes$]="store.recruitingProcesses$"
        [isActionEnabled]="(store.canStartRecruiting$ | async) ?? false">
      </app-section>
    </div>

    <app-home-button></app-home-button>
  </div>`,
  styles: /*css*/ `
  `,
})
export class PopulationComponent {
  constructor(public store: AppStore, private processService: ProcessService) {}

  buildHouse() {
    this.processService.startProcess(upgradeHousing);
  }

  recruitPeople() {
    this.processService.startProcess(villager);
  }

  trainPeople(personType: SpecializedVillager) {
    this.processService.startProcess(personType);
  }
}
