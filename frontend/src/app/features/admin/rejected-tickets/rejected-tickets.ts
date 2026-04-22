import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../../../shared/components/icon/icon';
import { CurrencyVndPipe } from '../../../shared/pipes/currency-vnd-pipe';
import { AdminService } from '../../../core/services/admin';
import { Booking } from '../../../core/models/booking';

@Component({
  selector: 'app-rejected-tickets',
  standalone: true,
  imports: [CommonModule, IconComponent, CurrencyVndPipe],
  templateUrl: './rejected-tickets.html'
})
export class RejectedTicketsComponent implements OnInit {
  bookings: Booking[] = [];
  constructor(private adminService: AdminService) {}
  ngOnInit(): void { this.adminService.getRejected().subscribe({ next: (r) => { this.bookings = r.data; } }); }
  delete(id: number): void {
    this.adminService.deleteBooking(id).subscribe({ next: () => { this.bookings = this.bookings.filter(b => b.id !== id); } });
  }
}