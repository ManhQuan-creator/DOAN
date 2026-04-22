import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Seat } from '../../../core/models/ticket';

@Component({
  selector: 'app-seat-selector',
  imports: [],
  standalone: true,
  templateUrl: './seat-selector.html',
  styleUrl: './seat-selector.css',
})
export class SeatSelector {
 @Input() seats: Seat[] = [];
  @Input() selectedSeatIds: number[] = [];
  @Input() layout: string = '2x2';
  @Input() frontLabel: string = 'Đầu xe';
  @Input() rearLabel: string = 'Cuối xe';
  
  @Output() seatToggled = new EventEmitter<Seat>();

  ngOnInit(): void {}

  toggleSeat(seat: Seat): void {
    if (seat.booked) return;
    this.seatToggled.emit(seat);
  }

  getSeatClass(seat: Seat): string {
    if (seat.booked) {
      return 'bg-[#767676] text-white cursor-not-allowed opacity-70';
    }
    if (this.selectedSeatIds.includes(seat.id)) {
      return 'bg-[#009d05] text-white border-green-600';
    }
    return 'bg-white text-black border-gray-400 hover:border-green-400';
  }

  isSelected(seatId: number): boolean {
    return this.selectedSeatIds.includes(seatId);
  }
}
