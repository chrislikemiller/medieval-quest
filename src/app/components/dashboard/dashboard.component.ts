import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppStore } from '../../store/app.store';
import { ProcessComponent } from "../process/process.component";

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, ProcessComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {
  constructor(public store: AppStore) {
  }
}
