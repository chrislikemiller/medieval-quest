import { Inject, Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { BehaviorSubject, Observable, of } from "rxjs";
import { PersistenceService } from "./persistence.interface.service";
import { Logger } from "./logger.service";


@Injectable({
    providedIn: 'root'
})
export class AuthService {
    public currentLoggedInUser: BehaviorSubject<string>;

    constructor(private router: Router, private logger: Logger,
        @Inject('PersistenceService') private persistenceService: PersistenceService) {
        this.currentLoggedInUser = new BehaviorSubject<string>(this.persistenceService.getCurrentLoggedInUser())
    }

    async login(username: string, password: string) {
        this.logger.info("logging in ", username, password);
        if (await this.persistenceService.isValidUser(username, password)) {
            this.persistenceService.setCurrentLoggedInUser(username);
            this.currentLoggedInUser.next(username);
            this.router.navigate(['/']);
            return of(true);
        }
        return of(false);
    }

    async register(username: string, password: string): Promise<Observable<boolean>> {
        this.logger.info("registering in ", username, password);
        if (this.persistenceService.findUser(username)) {
            return of(false);
        }
        await this.persistenceService.saveUser(username, password);
        return of(true);
    }

    logout(): void {
        this.persistenceService.setCurrentLoggedInUser("");
        this.currentLoggedInUser.next("");
        this.router.navigate(['/login']);
    }

    anyUserLoggedIn(): boolean {
        const result = this.persistenceService.getCurrentLoggedInUser() !== "";
        this.logger.info("anyUserLoggedIn");
        return result;
    }
}