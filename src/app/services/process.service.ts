import { Injectable, OnDestroy, OnInit } from '@angular/core';
import { AppStore } from '../store/app.store';
import { v4 as uuidv4 } from 'uuid';
import {
  upgradeHousing,
  isBuildingProcess,
  isGatheringProcess,
  Process,
  ProcessType,
  villager,
  VillagerGathering,
  SpecializedVillager,
} from '../store/models/processes.model';
import { RewardsService } from './rewards.service';
import { reduceResources } from '../store/models/resource.model';
import { Subject, interval, switchMap, takeUntil, firstValueFrom } from 'rxjs';
import { Logger } from './logger.service';

@Injectable({
  providedIn: 'root',
})
export class ProcessService implements OnDestroy {
  private destroy$ = new Subject<void>();
  private updateTrigger$ = new Subject<void>();

  constructor(
    private rewardService: RewardsService,
    private store: AppStore,
    private logger: Logger
  ) {
    interval(1000)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.updateTrigger$.next());
    this.store.loadProcessesState();
    this.store.checkCompletedProcesses();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  startProcess(processType: ProcessType): Process {
    this.logger.log('Starting process:', processType);
    const options = this.rewardService.consumeStartingResources(processType);
    this.store.consumeResources(options.consumedMaterials);
    this.occupyPeople(processType, options.occupiedPersons);

    const now = Date.now();
    const process: Process = {
      id: uuidv4(),
      processType: processType,
      startTime: now,
      endTime: now + options.duration,
      completed: false,
    };

    this.store.addProcess(process);
    this.store.saveState();

    return process;
  }

  occupyPeople(processType: ProcessType, occupiedPersons: number) {
    this.logger.log(
      'Occupying people for process:',
      processType,
      occupiedPersons
    );
    if (processType === villager) {
      this.store.startAcquiringPeople(villager, 1);
    } else {
      this.store.occupyPeople(villager, occupiedPersons); // todo cover the rest
    }
  }

  claimReward(process: Process) {
    this.logger.log(
      'Claiming reward for process:',
      process.processType,
      process.id
    );
    const options = this.rewardService.claimRewardResources(
      process.processType
    );

    switch (true) {
      case process.processType === upgradeHousing:
        this.store.updateHouses();
        this.store.returnPeople(villager, options.returningPersons);
        break;
      case isGatheringProcess(process.processType):
        this.store.rewardResources(options.rewardedMaterials);
        this.store.returnPeople(villager, options.returningPersons);
        break;
      case isBuildingProcess(process.processType):
        break;
      case process.processType === villager:
        this.store.finishAcquiringPeople(villager, 1);
        break;
      default:
        throw new Error(
          `Cannot claim reward for type ${process.processType} (id: ${process.id})`
        );
    }
    this.store.removeProcess(process.id);
    this.store.saveState();
  }

  cancelProcess(process: Process) {
    if (process.processType === villager) {
      this.store.cancelAcquiringPeople(villager, 1);
    } else {
      this.logger.log('Cancelling process:', process.processType, process.id);
      const options = this.rewardService.consumeStartingResources(
        process.processType
      );
      this.logger.log('Cancelling process options:', options);
      this.store.rewardResources(options.consumedMaterials);
      this.store.returnPeople(villager, options.occupiedPersons);
    }
    this.store.removeProcess(process.id);
    this.store.saveState();
  }
}
