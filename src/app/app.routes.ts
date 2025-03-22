import { Routes } from '@angular/router';
import { PopulationComponent } from './components/population.component';
import { GatheringComponent } from './components/gathering.component';
import { BuildingsComponent } from './components/buildings.component';
import { HomeComponent } from './components/home.component';
import { AuthGuard } from './auth/auth.guard';
import { LoginComponent } from './auth/login.component';
import { RegisterComponent } from './auth/register.component';
import { AuthNegateGuard } from './auth/auth-negate.guard';
import { VillagerGatheringComponent } from './components/villager-gathering.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent, canActivate: [AuthNegateGuard] },
  { path: 'register', component: RegisterComponent , canActivate: [AuthNegateGuard]},
  { path: '', component: HomeComponent, canActivate: [AuthGuard] },
  { path: 'population', component: PopulationComponent, canActivate: [AuthGuard] },
  { path: 'gathering', component: GatheringComponent, canActivate: [AuthGuard] },
  { path: 'buildings', component: BuildingsComponent, canActivate: [AuthGuard] },
  { path: 'villager-gathering', component: VillagerGatheringComponent, canActivate: [AuthGuard] },
  { path: '**', redirectTo: '' },
];