import { Component } from '@angular/core';
import { BuildingType } from '../../store/processes.model';
import { AppStore } from '../../store/app.store';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-buildings',
  imports: [],
  templateUrl: './buildings.component.html',
  styleUrl: './buildings.component.scss'
})
export class BuildingsComponent {

  // private destroy$ = new Subject<void>();
  constructor(public store: AppStore) { }

  // ngOnInit() {
  //   this.store.resourceUpdateError$.pipe(
  //     takeUntil(this.destroy$)
  //   ).subscribe(error => {
  //     if (error) {
  //       setTimeout(() => { this.dismissError(); }, 5000);
  //     }
  //   });
  // }

  // ngOnDestroy() {
  //   this.destroy$.next();
  //   this.destroy$.complete();
  // }

  buildBuilding(buildingType: BuildingType) {

    this.store.startBuilding({
      type: buildingType,
      duration: 2000
    });
  }


}
