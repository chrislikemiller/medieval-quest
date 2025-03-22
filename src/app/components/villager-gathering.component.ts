import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { AppStore } from '../store/app.store';
import { SectionComponent } from '../controls/section.component';
import { VillagerGatheringType } from '../store/models/processes.model';
import { HomeButtonComponent } from '../controls/home-button.component';

@Component({
  selector: 'villager-gathering',
  standalone: true,
  imports: [CommonModule, SectionComponent, HomeButtonComponent],
  template: `
    <div>
      <div>
        <app-section
          class=""
          sectionTitle="Gather wood"
          buttonTitle="Go"
          (buttonClicked)="gatherResource('villagerGatherWood')"
          [processes$]="store.woodProcesses$"
          [isActionEnabled]="
            (store.canVillagerStartGathering$ | async) ?? false
          ">
        </app-section>
        <app-section
          class=""
          sectionTitle="Gather food"
          buttonTitle="Go"
          [processes$]="store.foodProcesses$"
          (buttonClicked)="gatherResource('villagerGatherFood')"
          [isActionEnabled]="
            (store.canVillagerStartGathering$ | async) ?? false
          ">
        </app-section>
        <app-section
          class=""
          sectionTitle="Gather stone"
          buttonTitle="Go"
          (buttonClicked)="gatherResource('villagerGatherStone')"
          [processes$]="store.stoneProcesses$"
          [isActionEnabled]="
            (store.canVillagerStartGathering$ | async) ?? false
          ">
        </app-section>
      </div>
      <app-home-button></app-home-button>
    </div>
  `,
  styles: ``,
})
export class VillagerGatheringComponent {
  constructor(public store: AppStore) {}

  gatherResource(resourceType: VillagerGatheringType) {
    this.store.startGathering({
      type: resourceType,
      amount: 10,
      duration: 4000,
    });
  }
}
