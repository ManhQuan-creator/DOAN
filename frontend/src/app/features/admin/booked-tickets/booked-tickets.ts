import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../../../shared/components/icon/icon';
import { CurrencyVndPipe } from '../../../shared/pipes/currency-vnd-pipe';
import { AdminService } from '../../../core/services/admin';
import { Booking } from '../../../core/models/booking';

@Component({
  selector: 'app-booked-tickets',
  standalone: true,
  imports: [CommonModule, IconComponent, CurrencyVndPipe],
  templateUrl: './booked-tickets.html'
})
export class BookedTicketsComponent implements OnInit {
  bookings: Booking[] = [];

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.adminService.getAllBookings().subscribe({
      next: (res) => { this.bookings = res.data; }
    });
  }

  getStatusClass(status: number): string {
    if (status === 1) return 'text-green-600 bg-green-100';
    if (status === 2) return 'text-red-600 bg-red-100';
    return 'text-yellow-600 bg-yellow-100';
  }
}