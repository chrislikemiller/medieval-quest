import { Routes } from '@angular/router';
import { PopulationComponent } from './components/population/population.component';
import { GatheringComponent } from './components/gathering/gathering.component';
import { SettingsComponent } from './components/settings/settings.component';
import { BuildingsComponent } from './components/buildings/buildings.component';

export const routes: Routes = [
  { path: '', redirectTo: '/population', pathMatch: 'full' },
  { path: 'population', component: PopulationComponent },
  { path: 'gathering', component: GatheringComponent },
  { path: 'buildings', component: BuildingsComponent},
  { path: 'settings', component: SettingsComponent },
];