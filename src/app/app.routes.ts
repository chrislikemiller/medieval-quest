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
import { animation } from '@angular/animations';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [AuthNegateGuard],
    data: { animation: 'login', level: 0 },
  },
  {
    path: 'register',
    component: RegisterComponent,
    canActivate: [AuthNegateGuard],
    data: { animation: 'register', level: 1 },
  },
  {
    path: '',
    component: HomeComponent,
    canActivate: [AuthGuard],
    data: { animation: 'home', level: 2 },
  },
  {
    path: 'population',
    component: PopulationComponent,
    canActivate: [AuthGuard],
    data: { animation: 'population', level: 3 },
  },
  {
    path: 'gathering',
    component: GatheringComponent,
    canActivate: [AuthGuard],
    data: { animation: 'gathering', level: 3 },
  },
  {
    path: 'buildings',
    component: BuildingsComponent,
    canActivate: [AuthGuard],
    data: { animation: 'buildings', level: 3 },
  },
  {
    path: 'villager-gathering',
    component: VillagerGatheringComponent,
    canActivate: [AuthGuard],
    data: { animation: 'villager-gathering', level: 4 },
  },
  { path: 'home', redirectTo: '' },
  { path: '**', redirectTo: '' },
];
