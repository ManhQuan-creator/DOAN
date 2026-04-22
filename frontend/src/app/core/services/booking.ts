import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response';
import { Booking, BookingRequest } from '../models/booking';

@Injectable({ providedIn: 'root' })
export class BookingService {
  private api = `${environment.apiUrl}/bookings`;
  private vnpayApi = `${environment.apiUrl}/vnpay`;

  constructor(private http: HttpClient) {}

  create(data: BookingRequest): Observable<ApiResponse<Booking>> {
    return this.http.post<ApiResponse<Booking>>(this.api, data);
  }
  cancelBooking(id: number): Observable<ApiResponse<void>> {
  return this.http.delete<ApiResponse<void>>(`${this.api}/${id}/cancel`);
}

  getMyBookings(): Observable<ApiResponse<Booking[]>> {
    return this.http.get<ApiResponse<Booking[]>>(`${this.api}/me`);
  }

  getById(id: number): Observable<ApiResponse<Booking>> {
    return this.http.get<ApiResponse<Booking>>(`${this.api}/${id}`);
  }

  search(code: string): Observable<ApiResponse<Booking>> {
    return this.http.get<ApiResponse<Booking>>(`${this.api}/search/${code}`);
  }
   // Tạo URL thanh toán VNPay
  createVnPayPayment(bookingId: number, phone?: string): Observable<ApiResponse<{paymentUrl: string}>> {
    return this.http.post<ApiResponse<{paymentUrl: string}>>(
      `${this.vnpayApi}/create-payment`,
      { bookingId, phone }
    );
  }

  // Kiểm tra user có phone chưa
  checkPhone(): Observable<ApiResponse<{hasPhone: boolean, phone: string}>> {
    return this.http.get<ApiResponse<{hasPhone: boolean, phone: string}>>(
      `${this.vnpayApi}/check-phone`
    );
  }

  // Cập nhật thanh toán thông thường (ATM/QR)
  updatePayment(id: number, method: string): Observable<ApiResponse<Booking>> {
    return this.http.put<ApiResponse<Booking>>(
      `${this.api}/${id}/payment`,
      { paymentMethod: method }
    );
  }
}