import { Component, OnInit ,HostListener} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { IconComponent } from '../../../shared/components/icon/icon';
import { TicketService } from '../../../core/services/ticket';
import { Ticket } from '../../../core/models/ticket';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-ticket-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink,TranslateModule, IconComponent],
  templateUrl: './ticket-list.html'
})
export class TicketListComponent implements OnInit {
  allTickets: Ticket[]=[];

  tickets: Ticket[] = [];
  isLoading = true;

  //search bar
    selectedDeparture = '';
  selectedDestination = '';
  calendar = '';
  rawDate = '';
  minDate = '';
  showDepDropdown = false;
  showDestDropdown = false;

  // Sidebar filters
  departures: string[] = [];
  destinations: string[] = [];
  routes: string[] = [];
  timeSlots: string[] = [];
  selectedRoutes: string[] = [];
  selectedTimeSlots: string[] = [];

  constructor(
    private ticketService: TicketService
  ) {}

  ngOnInit(): void {
  const today = new Date();
  this.rawDate = this.toISODate(today);
  this.minDate = this.rawDate;
  this.calendar = this.formatDate(today);

  // Load search data from localStorage (from home page)
  const searchData = localStorage.getItem('searchData');
  if (searchData) {
    try {
      const data = JSON.parse(searchData);
      this.selectedDeparture = data.diemDi || '';
      this.selectedDestination = data.diemDen || '';
    } catch (e) {
      console.error('Error parsing searchData', e);
    }
    localStorage.removeItem('searchData');
  }
  const dayData = localStorage.getItem('DayData');
  if (dayData) {
    this.calendar = dayData;
    const parts = dayData.split('/');
    if (parts.length === 3) {
      this.rawDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    localStorage.removeItem('DayData');
  }

  this.loadTickets();
}
  loadTickets(): void {
    this.isLoading = true;
    this.ticketService.getAll().subscribe({
      next: (res) => {
        this.allTickets = res.data;
        this.buildFilters();
        this.applyFilters();
        this.isLoading = false;
      },
      error: () => { this.isLoading = false; }
    });
  }
   buildFilters(): void {
    this.departures = [...new Set(this.allTickets.map(t => t.departure))];
    this.destinations = [...new Set(this.allTickets.map(t => t.destination))];
    this.routes = [...new Set(this.allTickets.map(t => t.departure + ' - ' + t.destination))];
    this.timeSlots = [...new Set(this.allTickets.map(t => t.startTime + ' - ' + t.endTime))];
  }
  
  applyFilters(): void {
  let result = [...this.allTickets];

  // Chỉ filter khi có giá trị thực sự
  if (this.selectedDeparture 
    && this.selectedDeparture !== 'All' 
    && this.selectedDeparture !== 'Tất cả') {
    result = result.filter(t => t.departure === this.selectedDeparture);
  }

  if (this.selectedDestination 
    && this.selectedDestination !== 'All' 
    && this.selectedDestination !== 'Tất cả') {
    result = result.filter(t => t.destination === this.selectedDestination);
  }

  if (this.selectedRoutes.length > 0) {
    result = result.filter(t => 
      this.selectedRoutes.includes(t.departure + ' - ' + t.destination)
    );
  }

  if (this.selectedTimeSlots.length > 0) {
    result = result.filter(t => 
      this.selectedTimeSlots.includes(t.startTime + ' - ' + t.endTime)
    );
  }

  this.tickets = result;
}
    // Search bar methods
  selectDeparture(dep: string): void {
    this.selectedDeparture = dep;
    this.showDepDropdown = false;
    this.applyFilters();
  }

  selectDestination(dest: string): void {
    this.selectedDestination = dest;
    this.showDestDropdown = false;
    this.applyFilters();
  }

  search(): void {
    this.applyFilters();
  }
   resetAll(): void {
    this.selectedDeparture = '';
    this.selectedDestination = '';
    this.selectedRoutes = [];
    this.selectedTimeSlots = [];
    this.applyFilters();
  }
   // Sidebar checkbox
  toggleRoute(route: string): void {
    const idx = this.selectedRoutes.indexOf(route);
    if (idx >= 0) this.selectedRoutes.splice(idx, 1);
    else this.selectedRoutes.push(route);
    this.applyFilters();
  }

  toggleTimeSlot(slot: string): void {
    const idx = this.selectedTimeSlots.indexOf(slot);
    if (idx >= 0) this.selectedTimeSlots.splice(idx, 1);
    else this.selectedTimeSlots.push(slot);
    this.applyFilters();
  }
   onDateChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.value) {
      this.rawDate = input.value;
      const parts = input.value.split('-');
      this.calendar = `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
  }

  openDatePicker(input: HTMLInputElement): void {
    try { input.showPicker(); } catch { input.focus(); input.click(); }
  }
   @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.dep-dropdown')) this.showDepDropdown = false;
    if (!target.closest('.dest-dropdown')) this.showDestDropdown = false;
  }

  getLink(ticket: Ticket): string {
    const name = `${ticket.type} - ${ticket.departure} - ${ticket.destination}`;
    const base = window.location.pathname.startsWith('/user/') ? '/user/buytickets' : '/buytickets';
    return `${base}/${ticket.id}/${name}`;
  }
   private formatDate(date: Date): string {
    const d = date.getDate().toString().padStart(2, '0');
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    return `${d}/${m}/${date.getFullYear()}`;
  }

  private toISODate(date: Date): string {
    const d = date.getDate().toString().padStart(2, '0');
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    return `${date.getFullYear()}-${m}-${d}`;
  }
//check ngày nghỉ
  isOffDay(ticket: Ticket): boolean {
  if (!ticket.offDay) return false;
  const today = this.calendar; // dd/MM/yyyy
  const parts = today.split('/');
  if (parts.length !== 3) return false;

  const date = new Date(+parts[2], +parts[1] - 1, +parts[0]);
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const currentDay = dayNames[date.getDay()];

  return ticket.offDay.toLowerCase() === currentDay.toLowerCase();
}
//lưu ngày chọn ghế
saveSearchDate(): void {
  localStorage.setItem('DayData', this.calendar);
}
}