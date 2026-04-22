import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconComponent } from '../../../shared/components/icon/icon';
import { CurrencyVndPipe } from '../../../shared/pipes/currency-vnd-pipe';
import { BookingService } from '../../../core/services/booking';
import { Booking } from '../../../core/models/booking';
import { TranslateModule,TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-ticket-search',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent, TranslateModule,CurrencyVndPipe],
  templateUrl: './ticket-search.html'
})
export class TicketSearchComponent {
  searchTerm = '';
  result: Booking | null = null;
  isSearching = false;
  showDetail = false;

  constructor(
    private bookingService: BookingService,
     private translateService: TranslateService
  ) {}

  search(): void {
     if (!this.searchTerm) {
      this.translateService.get('TICKET_SEARCH.ENTER_CODE').subscribe(msg => alert(msg));
      return; 
    }
    this.isSearching = true;
    this.bookingService.search(this.searchTerm).subscribe({
      next: (res) => { this.result = res.data; this.isSearching = false; },
      error: () => { 
        this.result = null;
          this.translateService.get('TICKET_SEARCH.NOT_FOUND').subscribe(msg => alert(msg));
         this.isSearching = false; }
    });
  }
}