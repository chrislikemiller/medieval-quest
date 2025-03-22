import { Inject, Injectable } from '@angular/core';
import { ComponentStore } from '@ngrx/component-store';
import { interval, Observable, of } from 'rxjs';
import {
  tap,
  withLatestFrom,
  switchMap,
  catchError,
  map,
  take,
} from 'rxjs/operators';
import {
  canUseResources,
  Resources,
  toResourceKey,
  useResources,
} from './models/resource.model';
import {
  BuildingType,
  Process,
  ProcessState,
  ProcessType,
  isBuildingProcess,
  isGatheringProcess,
  isPopulationProcess,
  PersonType,
  recruitVillager,
  ProcessOptions,
  VillagerGatheringType,
  villagerGatherWood,
  villagerGatherFood,
  villagerGatherStone,
  trainFarmer,
  trainHunter,
  trainMiner,
} from './models/processes.model';
import { v4 as uuidv4 } from 'uuid';
import { AppState, initialState } from './models/app.model';
import { ValidationResult } from './models/validation.model';
import { Population, totalPopulation } from './models/population.model';
import { PersistenceService } from '../services/persistence.interface.service';
import { AuthService } from '../services/auth.service';
import { Logger } from '../services/logger.service';

@Injectable({
  providedIn: 'root',
})
export class AppStore extends ComponentStore<AppState> {
  constructor(
    @Inject('PersistenceService')
    private persistenceService: PersistenceService,
    private logger: Logger,
    private authService: AuthService
  ) {
    super(initialState);

    this.authService.currentLoggedInUser.subscribe((currentUser) => {
      this.logger.info('store update on login change, logged in?', currentUser);
      if (currentUser !== '') {
        this.loadAppState(currentUser);
      }
    });
  }

  UNIT_MODIFIER = 1;
  MAX_PROCESSES = 10;
  MAX_VISIBLE_PROCESSES = 3;

  readonly username$ = this.select((state) => state.username);
  readonly error$ = this.select((state) => state.error);
  readonly resources$ = this.select((state) => state.resources);
  readonly wood$ = this.select((state) => state.resources.wood);
  readonly stone$ = this.select((state) => state.resources.stone);
  readonly food$ = this.select((state) => state.resources.food);
  readonly houses$ = this.select((state) => state.houses);
  readonly population$ = this.select((state) =>
    totalPopulation(state.population)
  );
  readonly villagers$ = this.select((state) => state.population.villagers);
  readonly farmers$ = this.select((state) => state.population.farmers);
  readonly hunters$ = this.select((state) => state.population.hunters);
  readonly gatheringProcesses$ = this.select((state) =>
    state.processes.activeProcesses.filter((p) => isGatheringProcess(p.options))
  );
  readonly woodProcesses$ = this.gatheringProcesses$.pipe(
    map((processes) =>
      processes.filter((p) => p.options.type === villagerGatherWood)
    )
  );
  readonly foodProcesses$ = this.gatheringProcesses$.pipe(
    map((processes) =>
      processes.filter((p) => p.options.type === villagerGatherFood)
    )
  );
  readonly stoneProcesses$ = this.gatheringProcesses$.pipe(
    map((processes) =>
      processes.filter((p) => p.options.type === villagerGatherStone)
    )
  );
  readonly buildingProcesses$ = this.select((state) =>
    state.processes.activeProcesses.filter((p) => isBuildingProcess(p.options))
  );
  
  readonly recruitingProcesses$ = this.select(state => state.processes.activeProcesses.filter(p => p.options.type === recruitVillager));

  readonly trainingProcesses$ = this.select((state) =>
    state.processes.activeProcesses.filter((p) =>
      isPopulationProcess(p.options)
    )
  );
  readonly activeProcesses$ = this.select(
    (state) => state.processes.activeProcesses
  );

  readonly sortedActiveProcesses$ = this.select(
    this.activeProcesses$,
    (processes) => [...processes].sort((a, b) => a.endTime - b.endTime)
  );

  readonly visibleProcesses$ = this.select(
    this.sortedActiveProcesses$,
    (processes) => processes.slice(0, this.MAX_VISIBLE_PROCESSES)
  );

  readonly hiddenProcessCount$ = this.select(
    this.sortedActiveProcesses$,
    (processes) => Math.max(0, processes.length - this.MAX_VISIBLE_PROCESSES)
  );

  readonly canStartProcess$ = this.select(
    this.activeProcesses$,
    (processes) =>
      processes.filter((p) => !p.completed).length < this.MAX_PROCESSES
  );

  readonly canStartRecruiting$ = this.select(
    this.canStartProcess$,
    this.resources$,
    this.select((state) => totalPopulation(state.population) < state.houses),
    (canStartProcess, resources, canPeopleFitInHouses) =>
      canStartProcess &&
      canUseResources(resources, { food: 10 }) &&
      canPeopleFitInHouses
  );

  readonly canStartBuilding$ = this.select(
    this.canStartProcess$,
    this.resources$,
    (canStartProcess, resources) =>
      canStartProcess && canUseResources(resources, { wood: 10, stone: 10 })
  );

  readonly canStartTraining$ = this.select(
    this.canStartProcess$,
    this.villagers$,
    (canStartProcess, villagers) => canStartProcess && villagers > 0
  );

  readonly canVillagerStartGathering$ = this.select(
    this.canStartProcess$,
    this.villagers$,
    (canStartProcess, villagers) => canStartProcess && villagers > 0
  );

  readonly canStartFarming$ = this.select(
    this.canStartProcess$,
    this.farmers$,
    (canStartProcess, farmers) => canStartProcess && farmers > 0
  );

  readonly canStartHunting$ = this.select(
    this.canStartProcess$,
    this.hunters$,
    (canStartProcess, hunters) => canStartProcess && hunters > 0
  );

  readonly updateUsername = this.updater((state, username: string) => {
    return {
      ...state,
      username: username,
    };
  });

  readonly updateResources = this.updater(
    (state, resourceUpdate: Partial<Resources>) => {
      return {
        ...state,
        resources: {
          ...state.resources,
          ...resourceUpdate,
        },
      };
    }
  );

  readonly updateHouses = this.updater((state) => {
    return {
      ...state,
      houses: state.houses + 1,
    };
  });

  updateVillagers() {
    this.updater((state, unitModifier: number) => ({
      ...state,
      population: {
        ...state.population,
        willBeVillagers: state.population.willBeVillagers - unitModifier,
        villagers: state.population.villagers + unitModifier,
      },
    }))(this.UNIT_MODIFIER);
    this.saveState();
  }

  updateTrainedPeople(personType: PersonType) {
    this.updater((state, personType: PersonType) => {
      return {
        ...state,
        population: this.doTraining(state.population, personType),
      };
    })(personType);
    this.saveState();
  }

  doTraining(population: Population, personType: PersonType): Population {
    switch (personType) {
      case recruitVillager:
        throw new Error('You cannot train people to be villagers');
      case trainFarmer:
        return {
          ...population,
          farmers: population.farmers + this.UNIT_MODIFIER,
        };
      case trainHunter:
        return {
          ...population,
          hunters: population.hunters + this.UNIT_MODIFIER,
        };
      case trainMiner:
        return {
          ...population,
          hunters: population.miners + this.UNIT_MODIFIER,
        };
    }
  }

  readonly setError = this.updater((state, error: string | null) => ({
    ...state,
    error: error,
  }));

  clearError() {
    return this.setError(null);
  }
  addProcess(process: Process) {
    this.updater((state, process: Process) => ({
      ...state,
      processes: {
        ...state.processes,
        activeProcesses: [...state.processes.activeProcesses, process],
      },
    }))(process);
    this.saveState();
  }

  removeProcess(id: string) {
    this.updater((state, id: string) => ({
      ...state,
      processes: {
        ...state.processes,
        activeProcesses: state.processes.activeProcesses.filter(
          (p) => p.id !== id
        ),
      },
    }))(id);
    this.saveState();
  }

  completeProcess(id: string) {
    this.updater((state, id: string) => ({
      ...state,
      processes: {
        ...state.processes,
        activeProcesses: state.processes.activeProcesses.map((p) =>
          p.id === id ? { ...p, completed: true } : p
        ),
      },
    }))(id);
    this.saveState();
  }

  // EFFECTS

  readonly startTraining = this.effect<{ type: PersonType; duration: number }>(
    (params$) =>
      params$.pipe(
        withLatestFrom(this.canStartProcess$),
        switchMap(([params, canStart]) => {
          if (!canStart) {
            return of({
              valid: false,
              error: 'Maximum number of processes reached',
            });
          }

          const options = {
            type: params.type as PersonType,
            consumedMaterials: { food: 10 },
            trainedVillager: this.UNIT_MODIFIER,
          };
          const now = Date.now();
          const process: Process = {
            id: uuidv4(),
            options: options,
            startTime: now,
            endTime: now + params.duration,
            completed: false,
          };

          this.deductResources(options);
          this.addProcess(process);
          this.saveState();

          return of({
            valid: true,
            processId: process.id,
          });
        })
      )
  );

  readonly startBuilding = this.effect<{
    type: BuildingType;
    duration: number;
  }>((params$) =>
    params$.pipe(
      withLatestFrom(this.canStartProcess$),
      switchMap(([params, canStart]) => {
        if (!canStart) {
          return of({
            valid: false,
            error: 'Maximum number of processes reached',
          });
        }
        const options = {
          type: params.type as BuildingType,
          consumedMaterials: { wood: 10, stone: 10 },
        };
        const now = Date.now();
        const process: Process = {
          id: uuidv4(),
          options: options,
          startTime: now,
          endTime: now + params.duration,
          completed: false,
        };

        this.deductResources(options);
        this.addProcess(process);
        this.saveState();

        return of({
          valid: true,
          processId: process.id,
        });
      })
    )
  );

  private deductResources(options: ProcessOptions) {
    // todo, write updaters instead of this.get

    if (isBuildingProcess(options)) {
      if (canUseResources(this.get().resources, options.consumedMaterials)) {
        // it's nested because of type guards
        this.updateResources(
          useResources(this.get().resources, options.consumedMaterials)
        );
      } else {
        throw new Error('Not enough resources to build');
      }
    } else if (isPopulationProcess(options)) {
      if (canUseResources(this.get().resources, options.consumedMaterials)) {
        this.updateResources(
          useResources(this.get().resources, options.consumedMaterials)
        );
        if (options.type === recruitVillager) {
          this.get().population.willBeVillagers += options.trainedVillager;
        } else {
          this.get().population.villagers -= options.trainedVillager;
        }
      }
    } else if (isGatheringProcess(options)) {
      this.get().population.villagers -= options.occupiedVillager;
    } else {
      throw new Error('Invalid process type');
    }
  }

  readonly startGathering = this.effect<{
    type: ProcessType;
    duration: number;
    amount: number;
  }>((params$) =>
    params$.pipe(
      withLatestFrom(this.canStartProcess$),
      switchMap(([params, canStart]) => {
        if (!canStart) {
          return of({
            valid: false,
            error: 'Maximum number of gathering processes reached',
          });
        }

        const options = {
          type: params.type as VillagerGatheringType,
          amount: params.amount,
          occupiedVillager: this.UNIT_MODIFIER,
        };
        const now = Date.now();
        const process: Process = {
          id: uuidv4(),
          options: options,
          startTime: now,
          endTime: now + params.duration,
          completed: false,
        };

        this.deductResources(options);
        this.addProcess(process);
        this.saveState();

        return of({
          valid: true,
          processId: process.id,
        });
      })
    )
  );

  readonly claimReward = this.effect<string>((processId$) =>
    processId$.pipe(
      withLatestFrom(this.activeProcesses$),
      switchMap(([id, activeProcesses]) => {
        const process = activeProcesses.find((p) => p.id === id);
        if (!process || !process.completed) {
          this.logger.info('process failed', process);
          return of({
            valid: false,
            error: 'Process not found or not completed',
          });
        }

        if (isGatheringProcess(process.options)) {
          const resourceUpdate: Partial<Resources> = {};
          resourceUpdate[toResourceKey(process.options.type)] =
            process.options.amount;
          this.removeProcess(id);
          this.get().population.villagers += process.options.occupiedVillager;
          return of(this.updateResourcesWithValidation(resourceUpdate));
        } else if (isBuildingProcess(process.options)) {
          this.removeProcess(id);
          this.saveState();
          return of(this.updateHouses());
        } else if (isPopulationProcess(process.options)) {
          this.removeProcess(id);
          this.saveState();
          if (process.options.type === recruitVillager) {
            return of(this.updateVillagers());
          }
          return of(this.updateTrainedPeople(process.options.type));
        }
        return of({
          valid: false,
          error: 'Invalid process type',
        });
      })
    )
  );

  readonly cancelGathering = this.effect<string>((processId$) =>
    processId$.pipe(
      tap((id) => {
        this.removeProcess(id);
        this.saveState();
      })
    )
  );

  saveState(): void {
    this.persistenceService.saveAppState(this.get());
  }

  private loadAppState(username: string): AppState {
    const appState = this.persistenceService.getAppState();
    this.logger.info('loadAppState', appState);
    if (!appState) {
      this.logger.info('initial state', appState);
      this.setState(initialState);
      this.updateUsername(username);
      this.saveState();
      return initialState;
    }
    this.setState(appState);
    this.updateUsername(username);
    return appState;
  }

  loadProcessesState() {
    this.effect<void>((trigger$) =>
      trigger$.pipe(
        tap(() => {
          const processState = this.get().processes;
          this.logger.info('loadState state', processState);
          const now = Date.now();
          const updatedProcesses = processState.activeProcesses.map(
            (process) => ({
              ...process,
              completed: process.completed || now >= process.endTime,
            })
          );

          this.patchState({
            processes: {
              activeProcesses: updatedProcesses,
            },
          });
        })
      )
    );
  }

  readonly checkCompletedProcesses = this.effect<void>((trigger$) =>
    trigger$.pipe(
      switchMap(() => interval(1000)),
      withLatestFrom(this.activeProcesses$),
      tap(([_, activeProcesses]) => {
        const now = Date.now();
        let updated = false;

        activeProcesses.forEach((process) => {
          if (!process.completed && now >= process.endTime) {
            this.completeProcess(process.id);
            updated = true;
          }
        });

        if (updated) {
          this.saveState();
        }
      })
    )
  );

  readonly updateResourcesWithValidation = this.effect<Partial<Resources>>(
    (resourceUpdate$) =>
      resourceUpdate$.pipe(
        tap(() => this.clearError()),
        withLatestFrom(this.resources$),
        switchMap(([update, currentResources]) =>
          this.validateResourceUpdate(update, currentResources)
        ),
        tap((result: ValidationResult) => {
          this.logger.info('updateResourcesWithValidation is valid?');
          if (result.valid) {
            this.logger.info('valid', result.update);
            this.updateResources(result.update);
          } else {
            this.logger.info('not valid', result.error);
            this.setError(result.error);
          }
        }),
        catchError((err) =>
          of(this.setError('An unexpected error occurred: ' + err))
        )
      )
  );

  private validateResourceUpdate(
    update: Partial<Resources>,
    current: Resources
  ): Observable<ValidationResult> {
    const newState: Partial<Resources> = {
      wood: (current.wood || 0) + (update.wood || 0),
      stone: (current.stone || 0) + (update.stone || 0),
      food: (current.food || 0) + (update.food || 0),
    };
    this.logger.info('validateResourceUpdate newState ', newState);

    // add validations here

    return of({
      valid: true,
      update: newState,
    });
  }
}
