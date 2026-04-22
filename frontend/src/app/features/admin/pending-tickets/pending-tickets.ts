import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../../../shared/components/icon/icon';
import { CurrencyVndPipe } from '../../../shared/pipes/currency-vnd-pipe';
import { AdminService } from '../../../core/services/admin';
import { Booking } from '../../../core/models/booking';
import { Subscription } from 'rxjs';
import { WebSocketService } from '../../../core/services/websocket';

@Component({
  selector: 'app-pending-tickets',
  standalone: true,
  imports: [CommonModule, IconComponent, CurrencyVndPipe],
  templateUrl: './pending-tickets.html'
})
export class PendingTicketsComponent implements OnInit {
  bookings: Booking[] = [];
  private wsSub: Subscription | null= null;

  constructor(
    private adminService: AdminService,
    private wsService: WebSocketService
  ) {}

   get paidCount(): number {
        return this.bookings.filter(b => b.paymentStatus === 1).length;
    }

    get unpaidCount(): number {
        return this.bookings.filter(b => b.paymentStatus !== 1).length;
    }
  ngOnInit(): void {
    this.adminService.getPending().subscribe({
       next: (res) => {
         this.bookings = res.data; } 
        });
         this.wsService.connect();
    this.wsSub = this.wsService.subscribeBookingCancelled().subscribe({
      next: (cancelledId: number) => {
        // Tự động xóa booking khỏi danh sách mà KHÔNG cần reload
        this.bookings = this.bookings.filter(b => b.id !== cancelledId);
        console.log(`Booking ${cancelledId} bị hủy, đã xóa khỏi danh sách`);
      }
    });
  }

  ngOnDestroy(): void {
    if (this.wsSub) {
      this.wsSub.unsubscribe();
    }
    this.wsService.unsubscribeBookingCancelled();
  }
  
  confirm(id: number,booking: Booking): void {
     if (booking.paymentStatus !== 1) {
      alert(' Không thể xác nhận! Vé chưa được thanh toán.');
      return;
    }
      if (!confirm(`Xác nhận vé ${booking.bookingCode}?`)) return;
    this.adminService.confirmBooking(id).subscribe({
      next: () => {
         this.bookings = this.bookings.filter(b =>
           b.id !== id); alert('Đã Xác Nhận');
           },
            error: (err) => {
        alert((err.error?.message || 'Xác nhận thất bại'));
      }
    });
  }

  reject(id: number): void {
    this.adminService.rejectBooking(id).subscribe({
      next: () => {
         this.bookings = this.bookings.filter(b =>
           b.id !== id); alert('Đã Từ Chối');
           }
    });
  }
  //helper ktra có xnhan hay kh
   canConfirm(booking: Booking): boolean {
    return booking.paymentStatus === 1;
  }
}