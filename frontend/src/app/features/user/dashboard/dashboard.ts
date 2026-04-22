import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../../../shared/components/icon/icon';
import { CurrencyVndPipe } from '../../../shared/pipes/currency-vnd-pipe';
import { BookingService } from '../../../core/services/booking';
import { Booking } from '../../../core/models/booking';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, IconComponent,TranslateModule, CurrencyVndPipe],
  templateUrl: './dashboard.html'
})
export class DashboardComponent implements OnInit {
  bookings: Booking[] = [];
  countBooked = 0;
  countRejected = 0;
  countPending = 0;

  constructor(private bookingService: BookingService) {}

  ngOnInit(): void {
    this.bookingService.getMyBookings().subscribe({
      next: (res) => {
        this.bookings = res.data;
        this.countBooked = this.bookings.filter(b => b.status === 1).length;
        this.countRejected = this.bookings.filter(b => b.status === 2).length;
        this.countPending = this.bookings.filter(b => b.status === 3).length;
      }
    });
  }
}