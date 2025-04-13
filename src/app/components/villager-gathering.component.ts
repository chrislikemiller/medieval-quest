import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { AppStore } from '../store/app.store';
import { SectionComponent } from '../controls/section.component';
import { Process, VillagerGathering } from '../store/models/processes.model';
import { HomeButtonComponent } from '../controls/home-button.component';
import { ProcessService } from '../services/process.service';

@Component({
  selector: 'villager-gathering',
  standalone: true,
  imports: [CommonModule, SectionComponent, HomeButtonComponent],
  template: `
    <div>
      <div>
        <app-section
          #woodSection
          class=""
          sectionTitle="Gather wood"
          buttonTitle="Go"
          processType="villagerGatherWood"
          (buttonClicked)="gatherResource('villagerGatherWood', woodSection)"
          [isActionEnabled]="(store.canVillagerStartGathering$ | async) ?? false">
        </app-section>
        <app-section
          #foodSection
          class=""
          sectionTitle="Gather food"
          buttonTitle="Go"
          processType="villagerGatherFood"
          (buttonClicked)="gatherResource('villagerGatherFood', foodSection)"
          [isActionEnabled]="(store.canVillagerStartGathering$ | async) ?? false">
        </app-section>
        <app-section
          #stoneSection
          class=""
          sectionTitle="Gather stone"
          buttonTitle="Go"
          processType="villagerGatherStone"
          (buttonClicked)="gatherResource('villagerGatherStone', stoneSection)"
          [isActionEnabled]="(store.canVillagerStartGathering$ | async) ?? false">
        </app-section>
      </div>
      <app-home-button></app-home-button>
    </div>
  `,
  styles: ``,
})
export class VillagerGatheringComponent {
  constructor(public store: AppStore, private processService: ProcessService) {}

  gatherResource(resourceType: VillagerGathering, section: SectionComponent) {
    // Start the process and get the created process object
    const process = this.processService.startProcess(resourceType);
    // Pass the process to the section component
    section.setProcess(process);
  }
}
