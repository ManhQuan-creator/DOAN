import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response';
import { Ticket, Seat, TicketFilters } from '../models/ticket';

@Injectable({ providedIn: 'root' })
export class TicketService {
  private api = `${environment.apiUrl}/tickets`;

  constructor(private http: HttpClient) {}

  getAll(filters?: TicketFilters): Observable<ApiResponse<Ticket[]>> {
    let params = new HttpParams();
    if (filters?.departure) params = params.set('departure', filters.departure);
    if (filters?.destination) params = params.set('destination', filters.destination);
    if (filters?.type) params = params.set('type', filters.type);
      if (filters?.date) params = params.set('date', filters.date);
    return this.http.get<ApiResponse<Ticket[]>>(this.api, { params });
  }

  getById(id: number): Observable<ApiResponse<Ticket>> {
    return this.http.get<ApiResponse<Ticket>>(`${this.api}/${id}`);
  }

  getSeats(ticketId: number, date: string): Observable<ApiResponse<Seat[]>> {
    return this.http.get<ApiResponse<Seat[]>>(`${this.api}/${ticketId}/seats`, {
      params: { date }
    });
  }
}