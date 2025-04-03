import { Injectable } from '@angular/core';
import {
    CanActivate,
    ActivatedRouteSnapshot,
    RouterStateSnapshot,
    Router,
    GuardResult,
    MaybeAsync,
} from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, take } from 'rxjs/operators';
import { Logger } from '../services/logger.service';


@Injectable({
    providedIn: 'root',
})
export class AuthGuard implements CanActivate {
    constructor(private authService: AuthService, private router: Router, private logger: Logger) {
    }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): MaybeAsync<GuardResult> {
        return this.authService.currentLoggedInUser.pipe(take(1), map(currentUser => {
            this.logger.info("auth guard, current user: ", currentUser);
            if (currentUser) {
                return true;
            }
            this.router.navigate(['/login']);
            return false;
        }));
    }

}