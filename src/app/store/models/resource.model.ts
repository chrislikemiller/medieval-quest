import { villagerGatherFood, VillagerGathering, villagerGatherStone, villagerGatherWood } from "./processes.model";

export type Resources = {
  wood: number;
  stone: number;
  food: number;
}

export function toResourceKey(type : VillagerGathering) : 'wood' | 'stone' | 'food' {
  if (type === villagerGatherWood) return 'wood';
  if (type === villagerGatherFood) return 'food';
  if (type === villagerGatherStone) return 'stone';
  throw new Error(`Unknown type ${type}`);
}

export function canUseResources(current: Resources, toBeConsumed: Partial<Resources>): boolean {
  for (const key in toBeConsumed) {
    var resourceKey = key as keyof Resources
    if (toBeConsumed.hasOwnProperty(resourceKey)) {
      if (current[resourceKey] < (toBeConsumed[resourceKey] ?? 0)) {
        return false;
      }
    }
  }
  return true;
}

export function reduceResources(current: Resources, toBeConsumed: Partial<Resources>): Resources {
  for (const key in toBeConsumed) {
    var resourceKey = key as keyof Resources;
    if (toBeConsumed.hasOwnProperty(resourceKey)) {
      current[resourceKey] -= toBeConsumed[resourceKey] ?? 0;
      if (current[resourceKey] < 0) {
        throw new Error(`Resource ${key} cannot be negative`);
      }
    }
  }
  return current;
}

export function increaseResources(current: Resources, toBeAdded: Partial<Resources>): Resources {
  for (const key in toBeAdded) {
    var resourceKey = key as keyof Resources;
    if (toBeAdded.hasOwnProperty(resourceKey)) {
      current[resourceKey] += toBeAdded[resourceKey] ?? 0;
    }
  }
  return current;
}