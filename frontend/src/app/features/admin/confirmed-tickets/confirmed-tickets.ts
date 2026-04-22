import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../../../shared/components/icon/icon';
import { CurrencyVndPipe } from '../../../shared/pipes/currency-vnd-pipe';
import { AdminService } from '../../../core/services/admin';
import { Booking } from '../../../core/models/booking';

@Component({
  selector: 'app-confirmed-tickets',
  standalone: true,
  imports: [CommonModule, IconComponent, CurrencyVndPipe],
  templateUrl: './confirmed-tickets.html'
})
export class ConfirmedTicketsComponent implements OnInit {
  bookings: Booking[] = [];
  constructor(private adminService: AdminService) {}
  ngOnInit(): void {
     this.adminService.getConfirmed()
     .subscribe({ next: (r) => {
       this.bookings = r.data;  
      }
     });
     }
}