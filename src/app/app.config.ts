import { ApplicationConfig, provideZoneChangeDetection, isDevMode, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideState, provideStore } from '@ngrx/store';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { provideEffects } from '@ngrx/effects';
import { MockPersistenceService } from './services/persistence.service';
import { PersistenceService } from './services/persistence.interface.service';
import { InjectionToken } from '@angular/core';
import { LoggerModule, NgxLoggerLevel } from 'ngx-logger';
import { Logger } from './services/logger.service';
import { DatePipe } from '@angular/common';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideStore(),
    provideClientHydration(withEventReplay()),
    provideStoreDevtools({ maxAge: 25, logOnly: !isDevMode() }),
    provideEffects(),
    importProvidersFrom(
      LoggerModule.forRoot({
        level: NgxLoggerLevel.DEBUG,
        serverLogLevel: NgxLoggerLevel.ERROR,
        serverLoggingUrl: '/api/logs',
      })),
    DatePipe,
    { provide: 'PersistenceService', useClass: MockPersistenceService },
  ]
};
