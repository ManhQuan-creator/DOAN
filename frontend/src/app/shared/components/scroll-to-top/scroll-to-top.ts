import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../icon/icon';

@Component({
  selector: 'app-scroll-to-top',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    <div *ngIf="isVisible">
      <p (click)="scrollToTop()"
         class="fixed py-2 px-3 rounded-[10px] right-5 bottom-10 bg-red-100 z-[300] text-red-500 cursor-pointer">
        <app-icon name="up"></app-icon>
      </p>
    </div>
  `
})
export class ScrollToTop{
  isVisible = false;

  @HostListener('window:scroll')
  onScroll(): void {
    this.isVisible = window.scrollY > 200;
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}