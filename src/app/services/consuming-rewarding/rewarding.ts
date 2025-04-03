import { Resources } from '../../store/models/resource.model';

export type CompleteProcessOptions = {
  rewardedMaterials: Partial<Resources>;
  returningPersons: number;
};
export class Rewarding {
  static readonly buildHouseResources: {
    readonly [key: number]: CompleteProcessOptions;
  } = {
    0: { rewardedMaterials: {}, returningPersons: 1 },
    1: { rewardedMaterials: {}, returningPersons: 1 },
    2: { rewardedMaterials: {}, returningPersons: 1 },
    3: { rewardedMaterials: {}, returningPersons: 2 },
    4: { rewardedMaterials: {}, returningPersons: 2 },
  };

  static readonly recruitVillagerResources: {
    readonly [key: number]: CompleteProcessOptions;
  } = {
    0: { rewardedMaterials: {}, returningPersons: 0 },
  };

  static readonly villagerWoodGathering: {
    readonly [key: number]: CompleteProcessOptions;
  } = {
    0: { rewardedMaterials: { wood: 10 }, returningPersons: 1 },
  };

  static readonly villagerFoodGathering: {
    readonly [key: number]: CompleteProcessOptions;
  } = {
    0: { rewardedMaterials: { food: 10 }, returningPersons: 1 },
  };

  static readonly villagerStoneGathering: {
    readonly [key: number]: CompleteProcessOptions;
  } = {
    0: { rewardedMaterials: { stone: 10 }, returningPersons: 1 },
  };
}
