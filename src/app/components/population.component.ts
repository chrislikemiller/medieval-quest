import { Component, ViewChild } from '@angular/core';
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
        #houseSection
        class=""
        sectionTitle="Build house"
        buttonTitle="Go"
        processType="upgradeHousing"
        (buttonClicked)="buildHouse(houseSection)"
        [isActionEnabled]="(store.canStartBuilding$ | async) ?? false">
      </app-section>
      <app-section
        #recruitSection
        class=""
        sectionTitle="Recruit people"
        buttonTitle="Go" 
        processType="villager"
        (buttonClicked)="recruitPeople(recruitSection)"
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

  buildHouse(section: SectionComponent) {
    const process = this.processService.startProcess(upgradeHousing);
    section.setProcess(process);
  }

  recruitPeople(section: SectionComponent) {
    const process = this.processService.startProcess(villager);
    section.setProcess(process);
  }

  trainPeople(personType: SpecializedVillager, section: SectionComponent) {
    const process = this.processService.startProcess(personType);
    section.setProcess(process);
  }
}
