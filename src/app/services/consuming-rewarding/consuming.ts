import { Resources } from "../../store/models/resource.model";

export type StartProcessOptions = {
  consumedMaterials: Partial<Resources>;
  occupiedPersons: number;
  duration: number;
};

export class Consuming {
  static readonly buildHouseResources: {
    readonly [key: number]: StartProcessOptions;
  } = {
    0: { consumedMaterials: { wood: 0, stone: 0 }, occupiedPersons: 1, duration: 3000 },
    1: { consumedMaterials: { wood: 1, stone: 1 }, occupiedPersons: 1, duration: 3000 },
    2: { consumedMaterials: { wood: 2, stone: 2 }, occupiedPersons: 1, duration: 3000 },
    3: { consumedMaterials: { wood: 3, stone: 3 }, occupiedPersons: 2, duration: 3000 },
    4: { consumedMaterials: { wood: 5, stone: 5 }, occupiedPersons: 2, duration: 3000 },
  };

  static readonly recruitVillagerResources: {
    readonly [key: number]: StartProcessOptions;
  } = {
    0: { consumedMaterials: { food: 10 }, occupiedPersons: 0, duration: 3000 },
  };

  static readonly villagerGathering: {
    readonly [key: number]: StartProcessOptions;
  } = {
    0: { consumedMaterials: {}, occupiedPersons: 1, duration: 3000 },
  };
}
