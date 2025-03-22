import { Injectable, isDevMode } from '@angular/core';
import { NGXLogger } from 'ngx-logger';
import { NgxLoggerLevel } from 'ngx-logger';

@Injectable({
    providedIn: 'root',
})
export class Logger {
    constructor(private loggerService: NGXLogger) {
        this.loggerService.updateConfig({
            level: isDevMode() ? NgxLoggerLevel.DEBUG : NgxLoggerLevel.WARN,
            //   serverLogLevel: isDevMode() ? NgxLoggerLevel.DEBUG : NgxLoggerLevel.ERROR,
            //   serverLoggingUrl: '/api/logs',
            disableConsoleLogging: false,
            disableFileDetails: true,
            timestampFormat: '[HH:mm:ss]'
        });
    }

    debug(message: any, ...args: any[]) {
        this.loggerService.debug(message, ...args);
    }

    info(message: any, ...args: any[]) {
        this.loggerService.info(message, ...args);
    }

    warn(message: any, ...args: any[]) {
        this.loggerService.warn(message, ...args);
    }

    error(message: any, ...args: any[]) {
        this.loggerService.error(message, ...args);
    }

    log(message: any, ...args: any[]) {
        this.loggerService.log(message, ...args);
    }
}
