import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../../shared/components/icon/icon';
import { TranslateModule } from '@ngx-translate/core';

interface FaqItem {
  id: number;
  questionKey: string;
  answerKey: string;
}

@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [CommonModule,TranslateModule, IconComponent],
  templateUrl: './faq.html'
})
export class FaqComponent {
  openId: number | null = null;

  faqs: FaqItem[] = [
    { id: 1, questionKey: 'FAQS.FAQ_3', answerKey: 'FAQS.FAQ_4' },
    { id: 2, questionKey: 'FAQS.FAQ_5', answerKey: 'FAQS.FAQ_6' },
    { id: 3, questionKey: 'FAQS.FAQ_7', answerKey: 'FAQS.FAQ_8' },
    { id: 4, questionKey: 'FAQS.FAQ_9', answerKey: 'FAQS.FAQ_10' },
    { id: 5, questionKey: 'FAQS.FAQ_11', answerKey: 'FAQS.FAQ_12' },
    { id: 6, questionKey: 'FAQS.FAQ_13', answerKey: 'FAQS.FAQ_14' }
  ];

  toggle(id: number): void {
    this.openId = this.openId === id ? null : id;
  }
}
