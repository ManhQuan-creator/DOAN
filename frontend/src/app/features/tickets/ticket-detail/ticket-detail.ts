import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Route, Router } from '@angular/router';
import { IconComponent } from '../../../shared/components/icon/icon';
import { CurrencyVndPipe } from '../../../shared/pipes/currency-vnd-pipe';
import { TicketService } from '../../../core/services/ticket';
import { BookingService } from '../../../core/services/booking';
import { AuthService } from '../../../core/services/auth.service';
import { Seat, Ticket } from '../../../core/models/ticket';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
//CHỌN GHẾ
@Component({
  selector: 'app-ticket-detail',
  standalone: true,
  imports: [CommonModule, IconComponent,TranslateModule, CurrencyVndPipe],
  templateUrl: './ticket-detail.html'
})
export class TicketDetailComponent implements OnInit {
  ticketId = 0;
  ticketName = '';
  ticket: Ticket | null = null;
  seats: Seat[] = [];
  selectedSeatIds: number[] = [];
  calendar = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private ticketService: TicketService,
    private bookingService: BookingService,
    private translateService: TranslateService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.ticketId = +this.route.snapshot.params['id'];
    this.ticketName = this.route.snapshot.params['name'] || '';
    this.calendar = localStorage.getItem('DayData') || this.formatDate(new Date());
    this.loadTicket();
    this.loadSeats();
  }

  loadTicket(): void {
    this.ticketService.getById(this.ticketId).subscribe({
      next: (res) => {
         this.ticket = res.data;
     }
    });
  }

  loadSeats(): void {
    this.ticketService.getSeats(this.ticketId, this.calendar).subscribe({
      next: (res) => { this.seats = res.data; }
    });
  }

  toggleSeat(seat: Seat): void {
    if (seat.booked) return;
    const idx = this.selectedSeatIds.indexOf(seat.id);
    if (idx >= 0) this.selectedSeatIds.splice(idx, 1);
    else this.selectedSeatIds.push(seat.id);
  }

  isSelected(seatId: number): boolean {
    return this.selectedSeatIds.includes(seatId);
  }

  get totalPrice(): number {
    return this.seats
      .filter(s => this.selectedSeatIds.includes(s.id))
      .reduce((sum, s) => sum + s.price, 0);
  }

  get selectedSeats(): Seat[] {
    return this.seats.filter(s => this.selectedSeatIds.includes(s.id));
  }

  book(): void {
    if (this.selectedSeatIds.length === 0) { 
      this.translateService.get('TICKET.SELECT_MIN_1').subscribe(msg => alert(msg));
    return;
    }
  const token = this.authService.getUserToken();
    
    const isLoggedIn = this.authService.isAuthenticated();
     if (!isLoggedIn) {
        this.router.navigate(['/signin']);
        return;
    }
    const request = { 
      ticketId: this.ticketId,
       dateStart: this.calendar,  
        seatIds: this.selectedSeatIds 
      };

      this.bookingService.create(request).subscribe({
        next: (res) => {
           window.location.href = `/user/payment/${res.data.id}`;
        },
        error: (err) => { alert(err.error?.message || 'Đặt chỗ thất bại'); }
      });
  }

  private formatDate(date: Date): string {
    const d = date.getDate().toString().padStart(2, '0');
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    return `${d}/${m}/${date.getFullYear()}`;
  }
}