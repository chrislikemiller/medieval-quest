import { AppState } from "../store/models/app.model";
import { User } from "../store/models/user.model";

export interface PersistenceService {
    findUser(username: string) : User | undefined;
    isValidUser(username: string, password: string): Promise<boolean>;
    saveUser(username: string, password: string) : Promise<boolean>;
    setCurrentLoggedInUser(username:string) : void;
    getCurrentLoggedInUser() : string;

    saveAppState(appState: AppState) : boolean;
    getAppState() : AppState | undefined;
}
