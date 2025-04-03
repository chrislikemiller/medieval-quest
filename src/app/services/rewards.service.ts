import { Injectable, Signal, signal } from '@angular/core';
import { Resources, reduceResources } from '../store/models/resource.model';
import {
  buildFarm,
  upgradeHousing,
  GatheringBuilding,
  isBuildingProcess,
  isGatheringProcess,
  ProcessType,
  villager,
  VillagerGathering,
  villagerGatherWood,
} from '../store/models/processes.model';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  CompleteProcessOptions,
  Rewarding,
} from './consuming-rewarding/rewarding';
import {
  Consuming,
  StartProcessOptions,
} from './consuming-rewarding/consuming';
import { AppStore } from '../store/app.store';
import { map, Subject, takeUntil } from 'rxjs';
import {
  BuildingLevelState,
  initialBuildingsState,
} from '../store/models/app.model';

@Injectable({ providedIn: 'root' })
export class RewardsService {
  buildingLevels: Signal<BuildingLevelState>;

  constructor(private appStore: AppStore) {
    this.buildingLevels = toSignal(this.appStore.buildingLevels$, {
      initialValue: initialBuildingsState,
    });
  }

  readonly consumedResources: {
    readonly [key in ProcessType]: { readonly [key: number]: StartProcessOptions };
  } = {
    upgradeHousing: Consuming.buildHouseResources,
    villager: Consuming.recruitVillagerResources,
    villagerGatherWood: Consuming.villagerGathering,
    villagerGatherFod: Consuming.villagerGathering,
    villagerGatherStone: Consuming.villagerGathering,
  };

  readonly rewardingResources: {
    readonly [key in ProcessType]: { readonly [key: number]: CompleteProcessOptions };
  } = {
    upgradeHousing: Rewarding.buildHouseResources,
    villager: Rewarding.recruitVillagerResources,
    villagerGatherWood: Rewarding.villagerWoodGathering,
    villagerGatherFod: Rewarding.villagerFoodGathering,
    villagerGatherStone: Rewarding.villagerStoneGathering,
  };

  consumeStartingResources(processType: ProcessType) {
    let level = this.getLevelForProcess(processType);
    return this.consumedResources[processType][level];
  }

  claimRewardResources(processType: ProcessType) {
    let level = this.getLevelForProcess(processType);
    return this.rewardingResources[processType][level];
  }

  getLevelForProcess(processType: ProcessType): number {
    switch (true) {
      case processType === villager:
        return 0;
      case isGatheringProcess(processType):
        return 0;
      case processType === upgradeHousing:
        return this.buildingLevels().housing;
      case isBuildingProcess(processType): {
        switch (processType as GatheringBuilding) {
          case buildFarm:
            return this.buildingLevels().farming;
          default:
            throw new Error(`Invalid process type ${processType}`);
        }
      }
      default:
        throw new Error(`Unknown process type ${processType}`);
    }
  }
}
