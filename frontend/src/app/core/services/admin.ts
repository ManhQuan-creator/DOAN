import { Injectable } from '@angular/core';
import { HttpClient,HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response';
import { DashboardStats, Chat, ChatMessage } from '../models/chat';
import { Booking } from '../models/booking';
import { UserInfo } from '../models/user';
import { Ticket, CreateTicketRequest, UpdateTicketRequest } from '../models/ticket';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private api = `${environment.apiUrl}/admin`;

  constructor(private http: HttpClient) {}

  getChatDetail(id: number): Observable<ApiResponse<Chat>> {
    return this.http.get<ApiResponse<Chat>>(`${this.api}/support/chats/${id}`);
}

  getStats(): Observable<ApiResponse<DashboardStats>> {
    return this.http.get<ApiResponse<DashboardStats>>(`${this.api}/dashboard/stats`);
  }

  getChat(id: number): Observable<ApiResponse<Chat>> {
  return this.http.get<ApiResponse<Chat>>(`${environment.apiUrl}/support/chats/${id}`);
}

  // Bookings
  getAllBookings(): Observable<ApiResponse<Booking[]>> {
    return this.http.get<ApiResponse<Booking[]>>(`${this.api}/bookings`);
  }
  getPending(): Observable<ApiResponse<Booking[]>> {
    return this.http.get<ApiResponse<Booking[]>>(`${this.api}/bookings/pending`);
  }
  getConfirmed(): Observable<ApiResponse<Booking[]>> {
    return this.http.get<ApiResponse<Booking[]>>(`${this.api}/bookings/confirmed`);
  }
  getRejected(): Observable<ApiResponse<Booking[]>> {
    return this.http.get<ApiResponse<Booking[]>>(`${this.api}/bookings/rejected`);
  }
  confirmBooking(id: number): Observable<ApiResponse<Booking>> {
    return this.http.put<ApiResponse<Booking>>(`${this.api}/bookings/${id}/confirm`,{});
  }
  rejectBooking(id: number): Observable<ApiResponse<Booking>> {
    return this.http.put<ApiResponse<Booking>>(`${this.api}/bookings/${id}/reject`,{});
  }
  deleteBooking(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.api}/bookings/${id}`);
  }

  // Users
  getAllUsers(): Observable<ApiResponse<UserInfo[]>> {
    return this.http.get<ApiResponse<UserInfo[]>>(`${this.api}/users`);
  }
  getActiveUsers(): Observable<ApiResponse<UserInfo[]>> {
    return this.http.get<ApiResponse<UserInfo[]>>(`${this.api}/users/active`);
  }
  getLockedUsers(): Observable<ApiResponse<UserInfo[]>> {
    return this.http.get<ApiResponse<UserInfo[]>>(`${this.api}/users/locked`);
  }
  lockUser(id: number): Observable<ApiResponse<void>> {
    return this.http.put<ApiResponse<void>>(`${this.api}/users/${id}/lock`, {});
  }
  unlockUser(id: number): Observable<ApiResponse<void>> {
    return this.http.put<ApiResponse<void>>(`${this.api}/users/${id}/unlock`, {});
  }

  // Support
  getAllChats(): Observable<ApiResponse<Chat[]>> {
    return this.http.get<ApiResponse<Chat[]>>(`${this.api}/support/chats`);
  }
  replyChat(id: number, message: string): Observable<ApiResponse<ChatMessage>> {
    return this.http.post<ApiResponse<ChatMessage>>(`${this.api}/support/chats/${id}/messages`, { message });
  }

  // Tickets
  createTicket(data: CreateTicketRequest): Observable<ApiResponse<Ticket>> {
    return this.http.post<ApiResponse<Ticket>>(`${this.api}/tickets`, data);
  }
  updateTicket(id: number, data: UpdateTicketRequest): Observable<ApiResponse<Ticket>> {
    return this.http.put<ApiResponse<Ticket>>(`${this.api}/tickets/${id}`, data);
  }
  deleteTicket(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.api}/tickets/${id}`);
  }
}