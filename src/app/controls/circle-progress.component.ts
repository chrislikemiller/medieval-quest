import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { interval, Subscription } from 'rxjs';
import { takeWhile } from 'rxjs/operators';
import { Process } from '../store/models/processes.model';

@Component({
  selector: 'app-circle-progress',
  templateUrl: './circle-progress.component.html',
  styleUrls: ['./circle-progress.component.scss'],
  standalone: true,
  imports: [CommonModule],
})
export class CircleProgressComponent implements OnInit, OnDestroy {
  @Input() process!: Process;
  @Output() onComplete = new EventEmitter<string>();
  @Output() onCancel = new EventEmitter<string>();

  progress = 0;
  isComplete = false;
  isAnimating = false;

  private subscription?: Subscription;

  @ViewChild('circleContainer') circleContainer!: ElementRef;

  ngOnInit(): void {
    this.startProgressTimer();
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  startProgressTimer(): void {
    const totalDuration = this.process.endTime - this.process.startTime;
    const startTime = this.process.startTime;
    const endTime = this.process.endTime;

    this.subscription = interval(500)
      .pipe(takeWhile(() => this.progress < 100 && !this.isComplete))
      .subscribe(() => {
        const currentTime = Date.now();

        if (currentTime >= endTime) {
          this.progress = 100;
          this.completeProgress();
        } else if (currentTime >= startTime) {
          this.progress = ((currentTime - startTime) / totalDuration) * 100;
        }
      });
  }

  completeProgress(): void {
    this.isComplete = true;
    this.isAnimating = true;

    // Animation duration
    setTimeout(() => {
      this.isAnimating = false;
    }, 500);

    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  handleClick(): void {
    if (this.isComplete) {
      this.onComplete.emit(this.process.id);
    } else {
      this.onCancel.emit(this.process.id);
      if (this.subscription) {
        this.subscription.unsubscribe();
      }
    }
  }

  // Calculate the stroke-dasharray and stroke-dashoffset for the circle
  get circleCircumference(): number {
    // Circle radius is 4rem/2 - 4px (half the stroke width)
    const radius = 42; // Using the radius from the SVG (42)
    return 2 * Math.PI * radius;
  }

  get circleOffset(): number {
    return (
      this.circleCircumference -
      (this.progress / 100) * this.circleCircumference
    );
  }
}
