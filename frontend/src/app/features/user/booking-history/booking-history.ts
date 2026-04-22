import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../../../shared/components/icon/icon';
import { CurrencyVndPipe } from '../../../shared/pipes/currency-vnd-pipe';
import { BookingService } from '../../../core/services/booking';
import { Booking } from '../../../core/models/booking';

@Component({
  selector: 'app-booking-history',
  standalone: true,
  imports: [CommonModule, IconComponent, CurrencyVndPipe],
  templateUrl: './booking-history.html'
})
export class BookingHistoryComponent implements OnInit {
  bookings: Booking[] = [];
  selectedBooking: Booking | null = null;

  constructor(private bookingService: BookingService) {}

  ngOnInit(): void {
    this.bookingService.getMyBookings().subscribe({
      next: (res) => { this.bookings = res.data; }
    });
  }

  showDetail(booking: Booking): void {
    this.selectedBooking = booking;
  }

  closeDetail(): void {
    this.selectedBooking = null;
  }

  getStatusClass(status: number): string {
    if (status === 1) return 'text-green-600 bg-green-100';
    if (status === 2) return 'text-red-600 bg-red-100';
    return 'text-yellow-600 bg-yellow-100';
  }
}