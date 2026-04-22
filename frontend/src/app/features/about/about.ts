import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../../shared/components/icon/icon';
import { FaqComponent } from '../faq/faq';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, TranslateModule,IconComponent, FaqComponent],
  templateUrl: './about.html'
})
export class AboutComponent {
  benefitKeys = [
    'ABOUT.ABOUT_7',
    'ABOUT.ABOUT_8',
    'ABOUT.ABOUT_9',
    'ABOUT.ABOUT_10',
    'ABOUT.ABOUT_11',
    'ABOUT.ABOUT_12'
  ];
}