import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, Input } from '@angular/core';

@Component({
  selector: 'popup-base',
  imports: [CommonModule],
  template: `<div
    class="popup"
    *ngIf="isVisible"
    #popup
    [class.show]="isVisible"
    [class.hide]="!isVisible">
    <h4>{{ title }}</h4>
    <ng-content></ng-content>
  </div>`,
  styles: [
    `
      .popup {
        background-color: beige;
        position: fixed;
        animation: shadow-pop-bl 0.3s cubic-bezier(0.47, 0, 0.745, 0.715) both;
        padding: 0.5rem;
        opacity: 0;
        pointer-events: none;

        h4 {
          font-weight: 500;
        }
      }

      .popup.show {
        opacity: 1;
        pointer-events: auto;
      }

      .popup.hide {
        opacity: 0;
        pointer-events: none;
      }

      @keyframes shadow-pop-bl {
        0% {
          box-shadow: 0 0 #3e3e3e, 0 0 #3e3e3e, 0 0 #3e3e3e, 0 0 #3e3e3e,
            0 0 #3e3e3e, 0 0 #3e3e3e, 0 0 #3e3e3e, 0 0 #3e3e3e;
          transform: translateX(0) translateY(0);
        }
        100% {
          box-shadow: -1px 1px #3e3e3e, -2px 2px #3e3e3e, -3px 3px #3e3e3e,
            -4px 4px #3e3e3e, -5px 5px #3e3e3e, -6px 6px #3e3e3e,
            -7px 7px #3e3e3e, -8px 8px #3e3e3e;
          transform: translateX(8px) translateY(-8px);
        }
      }
    `,
  ],
})
export class PopupBaseComponent {
  @Input() title = '';

  isVisible = false;
  private ignoreDocumentClick = false;

  constructor(private elementRef: ElementRef) {}

  public togglePopup() {
    this.ignoreDocumentClick = true;
    this.isVisible = !this.isVisible;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (this.ignoreDocumentClick) {
      this.ignoreDocumentClick = false;
      return;
    }
    const clickedInside = this.elementRef.nativeElement.contains(event.target);
    if (!clickedInside) {
      this.isVisible = false;
    }
  }
}
