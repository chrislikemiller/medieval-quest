import { Inject, Injectable, OnInit } from '@angular/core';
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
  reduceResources,
  increaseResources,
} from './models/resource.model';
import {
  GatheringBuilding,
  Process,
  ProcessType,
  isBuildingProcess,
  isGatheringProcess,
  isPopulationProcess,
  SpecializedVillager,
  villager,
  VillagerGathering,
  villagerGatherWood,
  villagerGatherFood,
  villagerGatherStone,
  farmer,
  hunter,
  miner,
  farmerFarmsFood,
  People,
  upgradeHousing,
} from './models/processes.model';
import { v4 as uuidv4 } from 'uuid';
import { AppState, initialState } from './models/app.model';
import { ValidationResult } from './models/validation.model';
import { PersistenceService } from '../services/persistence.interface.service';
import { AuthService } from '../services/auth.service';
import { Logger } from '../services/logger.service';
import { Consuming } from '../services/consuming-rewarding/consuming';
import { PeopleState } from './models/population.model';

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
    this.authService.currentLoggedInUser.subscribe(currentUser => {
      this.logger.info('store update on login change, logged in?', currentUser);
      if (currentUser !== '') {
        this.loadAppState(currentUser);
      }
    });

    this.resetStateForDebug();
  }

  resetStateForDebug() {
    this.persistenceService.saveAppState(initialState);
  }

  UNIT_MODIFIER = 1;
  MAX_PROCESSES = 10;
  MAX_VISIBLE_PROCESSES = 3;

  readonly username$ = this.select(state => state.username);

  readonly error$ = this.select(state => state.error);

  readonly resources$ = this.select(state => state.resources);

  readonly wood$ = this.select(state => state.resources.wood);

  readonly stone$ = this.select(state => state.resources.stone);

  readonly food$ = this.select(state => state.resources.food);

  readonly housing$ = this.select(state => state.buildingLevelState.housing);

  readonly populationCount$ = this.select(state =>
    Object.values(state.population).reduce(
      (sum, people) => sum + this.sumPeople(people),
      0
    )
  );

  readonly villagers$ = this.select(state =>
    this.sumPeople(state.population[villager])
  );

  readonly farmers$ = this.select(state =>
    this.sumPeople(state.population[farmer])
  );

  readonly hunters$ = this.select(state =>
    this.sumPeople(state.population[hunter])
  );

  readonly gatheringProcesses$ = this.select(state =>
    state.processes.filter(p => isGatheringProcess(p.processType))
  );

  readonly buildingLevels$ = this.select(state => state.buildingLevelState);

  readonly isFarmingAvailable$ = this.select(
    state => state.buildingLevelState.farming > 0
  );

  readonly farmingProcesses$ = this.select(state =>
    state.processes.filter(p => p.processType === farmerFarmsFood)
  );

  readonly woodProcesses$ = this.gatheringProcesses$.pipe(
    map(processes =>
      processes.filter(p => p.processType === villagerGatherWood)
    )
  );

  readonly foodProcesses$ = this.gatheringProcesses$.pipe(
    map(processes =>
      processes.filter(p => p.processType === villagerGatherFood)
    )
  );

  readonly stoneProcesses$ = this.gatheringProcesses$.pipe(
    map(processes =>
      processes.filter(p => p.processType === villagerGatherStone)
    )
  );

  readonly buildingProcesses$ = this.select(state =>
    state.processes.filter(p => p.processType === upgradeHousing)
  );

  readonly recruitingProcesses$ = this.select(state =>
    state.processes.filter(p => p.processType === villager)
  );

  readonly trainingProcesses$ = this.select(state =>
    state.processes.filter(p => isPopulationProcess(p.processType))
  );
  readonly activeProcesses$ = this.select(state => state.processes);

  readonly sortedActiveProcesses$ = this.select(state =>
    [...state.processes].sort((a, b) => a.endTime - b.endTime)
  );

  readonly visibleProcesses$ = this.select(
    this.sortedActiveProcesses$,
    processes => processes.slice(0, this.MAX_VISIBLE_PROCESSES)
  );

  readonly hiddenProcessCount$ = this.select(
    this.sortedActiveProcesses$,
    processes => Math.max(0, processes.length - this.MAX_VISIBLE_PROCESSES)
  );

  readonly canStartProcess$ = this.select(
    state =>
      state.processes.filter(p => !p.completed).length < this.MAX_PROCESSES
  );

  readonly canStartRecruiting$ = this.select(
    this.canStartProcess$,
    this.resources$,
    this.populationCount$,
    this.housing$,
    (canStartProcess, resources, population, houses) =>
      canStartProcess &&
      canUseResources(resources, { food: 10 }) &&
      population < houses
  );

  readonly canStartBuilding$ = this.select(
    this.canStartProcess$,
    this.arePeopleAvailable(villager, 1),
    this.resources$,
    this.buildingLevels$,
    (canStartProcess, arePeopleAvailable, resources, buildingLevels) =>
      canStartProcess &&
      arePeopleAvailable &&
      canUseResources(
        resources,
        Consuming.buildHouseResources[buildingLevels.housing].consumedMaterials // todo replace to accomodate backend
      )
  );

  arePeopleAvailable(people: People, count: number) {
    return this.select(
      this.state$,
      this.canStartProcess$,
      (state, canStart) => {
        return canStart && state.population[people].available >= count;
      }
    );
  }

  readonly canStartTraining$ = this.select(
    this.state$,
    this.canStartProcess$,
    (state, canStartProcess) =>
      canStartProcess && state.population[villager].available > 0
  );

  readonly canVillagerStartGathering$ = this.select(
    this.state$,
    this.canStartProcess$,
    (state, canStartProcess) =>
      canStartProcess && state.population[villager].available > 0
  );

  readonly canStartFarming$ = this.select(
    this.state$,
    this.canStartProcess$,
    (state, canStartProcess) =>
      canStartProcess && state.population[farmer].available > 0
  );

  readonly canStartHunting$ = this.select(
    this.state$,
    this.canStartProcess$,
    (state, canStartProcess) =>
      canStartProcess && state.population[hunter].available > 0
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

  consumeResources = this.updater(
    (state, toBeConsumed: Partial<Resources>) => ({
      ...state,
      resources: reduceResources(state.resources, toBeConsumed),
    })
  );

  rewardResources = this.updater((state, toBeRewarded: Partial<Resources>) => ({
    ...state,
    resources: increaseResources(state.resources, toBeRewarded),
  }));

  startAcquiringPeople(people: People, acquireCount: number) {
    return this.startAcquiringPeopleInner({
      people: people,
      count: acquireCount,
    });
  }

  private startAcquiringPeopleInner = this.updater(
    (state, params: { people: People; count: number }) => ({
      ...state,
      population: {
        ...state.population,
        [params.people]: {
          ...state.population[params.people],
          acquiring: state.population[params.people].acquiring + params.count,
        },
      },
    })
  );

  finishAcquiringPeople(peopleType: People, occupyCount: number) {
    return this.finishAcquiringPeopleInner({
      people: peopleType,
      count: occupyCount,
    });
  }

  private finishAcquiringPeopleInner = this.updater(
    (state, params: { people: People; count: number }) => ({
      ...state,
      population: {
        ...state.population,
        [params.people]: {
          ...state.population[params.people],
          available: state.population[params.people].available + params.count,
          acquiring: state.population[params.people].occupied - params.count,
        },
      },
    })
  );

  occupyPeople(peopleType: People, occupyCount: number) {
    return this.occupyPeopleInner({ people: peopleType, count: occupyCount });
  }

  private occupyPeopleInner = this.updater(
    (state, params: { people: People; count: number }) => ({
      ...state,
      population: {
        ...state.population,
        [params.people]: {
          ...state.population[params.people],
          available: state.population[params.people].available - params.count,
          occupied: state.population[params.people].occupied + params.count,
        },
      },
    })
  );

  returnPeople(people: People, returnedPeopleCount: number) {
    return this.returnPeopleInner({
      people: people,
      count: returnedPeopleCount,
    });
  }

  private returnPeopleInner = this.updater(
    (state, params: { people: People; count: number }) => ({
      ...state,
      population: {
        ...state.population,
        [params.people]: {
          ...state.population[params.people],
          available: state.population[params.people].available + params.count,
          occupied: state.population[params.people].occupied - params.count,
        },
      },
    })
  );

  readonly updateHouses = this.updater(state => ({
    ...state,
    buildingLevelState: {
      ...state.buildingLevelState,
      housing: state.buildingLevelState.housing + 1,
    },
  }));

  readonly setError = this.updater((state, error: string | null) => ({
    ...state,
    error: error,
  }));

  clearError() {
    return this.setError(null);
  }

  addProcess = this.updater((state, process: Process) => ({
    ...state,
    processes: [...state.processes, process],
  }));

  removeProcess = this.updater((state, id: string) => ({
    ...state,
    processes: state.processes.filter(p => p.id !== id),
  }));

  completeProcess = this.updater((state, id: string) => ({
    ...state,
    processes: state.processes.map(p =>
      p.id === id ? { ...p, completed: true } : p
    ),
  }));

  // EFFECTS

  readonly cancelProcess = this.effect<string>(processId$ =>
    processId$.pipe(
      tap(id => {
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
    this.effect<void>(trigger$ =>
      trigger$.pipe(
        tap(() => {
          const processState = this.get().processes;
          this.logger.info('loadProcessesState', processState);
          const now = Date.now();
          const updatedProcesses = processState.map(process => ({
            ...process,
            completed: process.completed || now >= process.endTime,
          }));

          this.patchState({
            processes: updatedProcesses,
          });
        })
      )
    );
  }

  readonly checkCompletedProcesses = this.effect<void>(trigger$ =>
    trigger$.pipe(
      switchMap(() => interval(1000)),
      withLatestFrom(this.activeProcesses$),
      tap(kv => {
        const now = Date.now();
        let updated = false;
        const processes = kv[1];
        processes.forEach(process => {
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
    resourceUpdate$ =>
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
        catchError(err =>
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

  sumPeople(people: PeopleState): number {
    return people.available + people.occupied + people.acquiring;
  }
}
