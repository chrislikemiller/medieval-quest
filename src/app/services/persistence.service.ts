import { Injectable } from "@angular/core";
import { User } from "../store/models/user.model";
import * as bcrypt from 'bcryptjs';
import { PersistenceService } from "./persistence.interface.service";
import { AppState } from "../store/models/app.model";
import { Logger } from "./logger.service";


@Injectable({
    providedIn: 'root'
})
export class MockPersistenceService implements PersistenceService {
    private readonly existingUsersKey: string = "users";
    private readonly currentUserKey: string = "logged-in-user";
    private readonly appStateKey: string = "app-state";
    private users: User[];

    constructor(private logger: Logger) {
        this.users = this.getUsers();
    }

    getAppState(): AppState | undefined {
        const currentUser = this.getCurrentLoggedInUser();
        const userAppStateKey = `${currentUser}:${this.appStateKey}`;
        const resultJson = localStorage.getItem(userAppStateKey);
        if (resultJson) {
            const parsed = JSON.parse(resultJson);
            this.logger.info("getAppstate", parsed);
            return parsed;
        }
        return undefined;
    }

    saveAppState(appState: AppState): boolean {
        try {
            const appStateJson = JSON.stringify(appState);
            const currentUser = this.getCurrentLoggedInUser();
            const userAppStateKey = `${currentUser}:${this.appStateKey}`;
            localStorage.setItem(userAppStateKey, appStateJson);
            this.logger.info('saveAppState', appStateJson);
            return true;
        }
        catch (ex) {
            this.logger.info(ex);
            return false;
        }
    }

    findUser(username: string) {
        return this.users.find(u => u.username === username);
    }

    async isValidUser(username: string, password: string) {
        const user = this.findUser(username);
        if (!user) {
            return false;
        }
        return await bcrypt.compare(password, user.passwordHash)
    }

    async saveUser(username: string, password: string) {
        try {
            const salt: string = await bcrypt.genSalt(10);
            const passwordHash = await bcrypt.hash(password, salt);
            this.users.push({ username, passwordHash, salt })
            this.saveUsers(this.users);
            return true;
        }
        catch (ex) {
            this.logger.info(ex);
            return false;
        }
    }

    setCurrentLoggedInUser(username: string) {
        this.logger.info("setting current user", username);
        localStorage.setItem(this.currentUserKey, username);
    }

    getCurrentLoggedInUser(): string {
        const result = localStorage.getItem(this.currentUserKey) ?? "";
        this.logger.info("current user is ", result);
        return result;
    }

    private getUsers(): User[] {
        const json = localStorage.getItem(this.existingUsersKey) ?? "[]";
        const usersData = JSON.parse(json);
        this.logger.info("getUsers", usersData);
        return usersData ?? [];
    }

    private saveUsers(users: User[]) {
        const json = JSON.stringify(users);
        this.logger.info("saving user ", json);
        localStorage.setItem(this.existingUsersKey, json);
    }

}