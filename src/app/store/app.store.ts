// src/app/store/resource/resource.store.ts
import { Inject, Injectable } from '@angular/core';
import { ComponentStore } from '@ngrx/component-store';
import { interval, ObjectUnsubscribedError, Observable, of } from 'rxjs';
import { tap, withLatestFrom, switchMap, catchError, finalize, distinctUntilChanged, map } from 'rxjs/operators';
import { ResourceState, initialResourceState } from './resource.model';
import { StatusState, initialStatusState, ActionType } from './ui.model';
import { GatheringType, BuildingType, Process, ProcessState, initialProcessesState, ProcessType, gatheringTypes, buildingTypes, isBuilding, isGathering } from './processes.model';
import { v4 as uuidv4 } from 'uuid';


export type AppState = {
  resources: ResourceState;
  status: StatusState;
  houses: number;
  processes: ProcessState
}

const initialState: AppState = {
  resources: initialResourceState,
  status: initialStatusState,
  processes: initialProcessesState,
  houses: 0
};

type ValidationSuccess = {
  valid: true;
  update: Partial<ResourceState>;
}

type ValidationFailure = {
  valid: false;
  error: string;
}

type ValidationResult = ValidationSuccess | ValidationFailure;

@Injectable({
  providedIn: 'root'
})
export class AppStore extends ComponentStore<AppState> {

  constructor() {
    super(initialState);
  }

  readonly resources$ = this.select(state => state.resources);
  readonly wood$ = this.select(state => state.resources.wood);
  readonly stone$ = this.select(state => state.resources.stone);
  readonly food$ = this.select(state => state.resources.food);
  readonly houses$ = this.select(state => state.houses);
  readonly isResourceUpdateLoading$ = this.select(state => !!state.status.loading[ActionType.UPDATE_RESOURCES]);
  readonly resourceUpdateError$ = this.select(state => state.status.errors[ActionType.UPDATE_RESOURCES] || null);
  readonly gatheringProcesses$ = this.select(state => state.processes.activeProcesses.filter(p => isGathering(p.type)));
  readonly buildingProcesses$ = this.select(state => state.processes.activeProcesses.filter(p => isBuilding(p.type)));
  readonly activeProcesses$ = this.select(state => state.processes.activeProcesses);

  readonly sortedActiveProcesses$ = this.select(this.activeProcesses$,
    (processes) => [...processes].sort((a, b) => a.endTime - b.endTime));

  readonly visibleProcesses$ = this.select(this.sortedActiveProcesses$,
    (processes) => processes.slice(0, 3));

  readonly hiddenProcessCount$ = this.select(this.sortedActiveProcesses$,
    (processes) => Math.max(0, processes.length - 3));

  readonly canStartGathering$ = this.select(this.gatheringProcesses$,
    (processes) => processes.filter(p => !p.completed).length < 3);


  // UPDATERS
  readonly updateResources = this.updater((state, resourceUpdate: Partial<ResourceState>) => {
    console.log('updateResources state: ', state);
    console.log('updateResources update: ', resourceUpdate);
    return {
      ...state,
      resources: {
        ...state.resources,
        ...resourceUpdate
      }
    };
  });

  readonly updateHouses = this.updater((state) => {
    console.log('updateHouses state: ', state);
    return {
      ...state,
      houses: state.houses + 1
    }
  });

  readonly setLoading = this.updater((state, { action, isLoading }: { action: string, isLoading: boolean }) => ({
    ...state,
    status: {
      ...state.status,
      loading: {
        ...state.status.loading,
        [action]: isLoading
      }
    }
  }));

  readonly setError = this.updater((state, { action, error }: { action: string, error: string | null }) => ({
    ...state,
    status: {
      ...state.status,
      errors: {
        ...state.status.errors,
        [action]: error
      }
    }
  }));

  readonly addProcess = this.updater((state, process: Process) => ({
    ...state,
    processes: {
      ...state.processes,
      activeProcesses: [...state.processes.activeProcesses, process]
    }
  }));

  readonly removeProcess = this.updater((state, id: string) => ({
    ...state,
    processes: {
      ...state.processes,
      activeProcesses: state.processes.activeProcesses.filter(p => p.id !== id)
    }
  }));

  readonly completeProcess = this.updater((state, id: string) => ({
    ...state,
    processes: {
      ...state.processes,
      activeProcesses: state.processes.activeProcesses.map(p =>
        p.id === id ? { ...p, completed: true } : p
      )
    }
  }));



  // EFFECTS

  readonly startBuilding =
    this.effect<{ type: BuildingType, duration: number }>
      (params$ => params$.pipe(
        withLatestFrom(this.buildingProcesses$),
        switchMap(([params, activeProcesses]) => {
          if (activeProcesses.length >= 3) {
            return of({
              valid: false,
              error: 'Maximum number of building processes reached (3)'
            });
          }
          const now = Date.now();
          const process: Process = {
            id: uuidv4(),
            type: params.type,
            amount: undefined,
            startTime: now,
            endTime: now + params.duration,
            completed: false
          };

          this.addProcess(process);
          this.saveState();

          return of({
            valid: true,
            processId: process.id
          });
        })
      )
      );

  readonly startGathering =
    this.effect<{ type: ProcessType, duration: number, amount: number }>(
      (params$) => params$.pipe(
        withLatestFrom(this.canStartGathering$),
        switchMap(([params, canStart]) => {

          if (!canStart) {
            return of({
              valid: false,
              error: 'Maximum number of gathering processes reached (3)'
            });
          }

          const now = Date.now();
          const process: Process = {
            id: uuidv4(),
            type: params.type,
            amount: params.amount,
            startTime: now,
            endTime: now + params.duration,
            completed: false
          };

          this.addProcess(process);
          this.saveState();

          return of({
            valid: true,
            processId: process.id
          });
        })
      )
    );


  readonly claimReward =
    this.effect<string>(
      processId$ => processId$.pipe(
        withLatestFrom(this.activeProcesses$),
        switchMap(([id, activeProcesses]) => {
          const process = activeProcesses.find(p => p.id === id);
          if (!process || !process.completed) {
            console.log('process failed', process);
            return of({
              valid: false,
              error: 'Process not found or not completed'
            });
          }

          if (isGathering(process.type)) {
            const resourceUpdate: Partial<ResourceState> = {};
            resourceUpdate[process.type] = process.amount;
            this.removeProcess(id);
            this.saveState();
            return of(this.updateResourcesWithValidation(resourceUpdate));
          }
          else if (isBuilding(process.type)) {
            this.removeProcess(id);
            this.saveState();
            return of(this.updateHouses());
          }
          return of({
            valid: false,
            error: 'Invalid process type'
          });
        })
      )
    );

  readonly cancelGathering = this.effect<string>(
    (processId$) => processId$.pipe(
      tap(id => {
        this.removeProcess(id);
        this.saveState();
      })
    )
  );

  private saveState(): void {
    const appState = this.get();
    const appStateJson = JSON.stringify(appState);
    console.log('saveState', appStateJson);
    localStorage.setItem('appStateJson', appStateJson);
  }

  loadState() {
    this.effect<void>(
      (trigger$) => trigger$.pipe(
        tap(() => {
          const storedState = localStorage.getItem('appStateJson');
          console.log('loadState', storedState);
          if (storedState) {
            const state: ProcessState = JSON.parse(storedState);
            console.log('loadState state', state);
            const now = Date.now();
            const updatedProcesses = state.activeProcesses.map(process => ({
              ...process,
              completed: process.completed || now >= process.endTime
            }));

            this.patchState({
              processes: {
                activeProcesses: updatedProcesses
              }
            });
          }
        })
      )
    );
  }

  readonly checkCompletedProcesses = this.effect<void>(
    (trigger$) => trigger$.pipe(
      switchMap(() => interval(1000)),
      withLatestFrom(this.activeProcesses$),
      tap(([_, activeProcesses]) => {
        const now = Date.now();
        let updated = false;

        activeProcesses.forEach(process => {
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


  readonly updateResourcesWithValidation = this.effect<Partial<ResourceState>>(
    (resourceUpdate$) => resourceUpdate$.pipe(
      tap(() => this.setError({ action: ActionType.UPDATE_RESOURCES, error: null })),
      withLatestFrom(this.resources$),
      switchMap(([update, currentResources]) => {
        return this.withLoadingState(
          ActionType.UPDATE_RESOURCES,
          this.validateResourceUpdate(update, currentResources));
      }),
      tap((result: ValidationResult) => {
        console.log('updateResourcesWithValidation is valid?');
        if (result.valid) {
          console.log('valid', result.update);
          this.updateResources(result.update);
        } else {
          console.log('not valid', result.error);
          this.setError({
            action: ActionType.UPDATE_RESOURCES,
            error: result.error
          });
        }
      }),
      catchError(err => {
        this.setError({
          action: ActionType.UPDATE_RESOURCES,
          error: 'An unexpected error occurred: ' + err
        });
        return of(null);
      })
    )
  );

  private withLoadingState<T>(action: string, observable: Observable<T>): Observable<T> {
    return observable.pipe(
      tap({
        subscribe: () => this.setLoading({ action, isLoading: true }),
        next: () => this.setLoading({ action, isLoading: false }),
        error: () => this.setLoading({ action, isLoading: false }),
      })
    );
  }
  private validateResourceUpdate(
    update: Partial<ResourceState>,
    currentResources: ResourceState
  ): Observable<ValidationResult> {
    const newState: Partial<ResourceState> = {
      wood: (currentResources.wood || 0) + (update.wood || 0),
      stone: (currentResources.stone || 0) + (update.stone || 0),
      food: (currentResources.food || 0) + (update.food || 0)
    };
    console.log('validateResourceUpdate newState ', newState);

    // add validations here

    return of({
      valid: true,
      update: newState
    });
  }

  readonly clearErrors = this.effect<string>((action$) => {
    return action$.pipe(
      tap(action => {
        this.setError({ action, error: null });
      })
    );
  });
}

