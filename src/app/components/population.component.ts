import { Component } from '@angular/core';
import { AppStore } from '../store/app.store';
import {
  buildHouse,
  PersonType,
  recruitVillager,
} from '../store/models/processes.model';
import { CommonModule } from '@angular/common';
import { HomeButtonComponent } from '../controls/home-button.component';
import { SectionComponent } from '../controls/section.component';

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
  buildHouse() {
    this.store.startBuilding({
      type: buildHouse,
      duration: 5000,
    });
  }
  constructor(public store: AppStore) {}

  recruitPeople() {
    this.store.startTraining({ type: recruitVillager, duration: 2000 });
  }

  trainPeople(personType: PersonType) {
    this.store.startTraining({ type: personType, duration: 2000 });
  }
}
