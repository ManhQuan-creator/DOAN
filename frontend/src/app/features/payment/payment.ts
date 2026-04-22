
import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { IconComponent } from '../../shared/components/icon/icon';
import { CurrencyVndPipe } from '../../shared/pipes/currency-vnd-pipe';
import { BookingService } from '../../core/services/booking';
import { Booking } from '../../core/models/booking';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../../core/models/api-response';
import { AuthService } from '../../core/services/auth.service';
import { UserService } from '../../core/services/user.service';

@Component({
    selector: 'app-payment',
    standalone: true,
    imports: [CommonModule, FormsModule, IconComponent, TranslateModule, CurrencyVndPipe],
    templateUrl: './payment.html'
})
export class PaymentComponent implements OnInit,OnDestroy{
    bookingId = 0;
    booking: Booking | null = null;
    selectedPayment = 1;
    isPaymentLoading = false;
    paymentSuccess = false;
    isExpired = false;           //  booking đã hết hạn
    remainingSeconds = 120;     //  2 phút 
    countdownDisplay = '02:00'; //  hiển thị đếm ngược
    userPhone = '';
    hasPhone = false;
    phoneInput = '';
    phoneError = '';
    //vnpay
    vnpayResult: string | null = null;

    private countdownTimer: any;
     private clientReceiveTime: number = 0; 


    paymentOptions = [
        // { id: 1, name: 'ZaloPay', value: 'ZALOPAY' },
        { id: 1, name: 'ATM', value: 'ATM' },
        { id: 2, name: 'QR Code', value: 'QR' }
    ];

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private bookingService: BookingService,
        private translateService: TranslateService,
        private http: HttpClient,
        private userService: UserService,
        private authService: AuthService
    ) {}
    ngOnInit(): void {
        this.bookingId = +this.route.snapshot.params['id'];
          // Kiểm tra kết quả VNPay callback
    const vnpayParam = this.route.snapshot.queryParams['vnpay'];
    if (vnpayParam === 'success') {
      this.vnpayResult = 'success';
      this.paymentSuccess = true;
    } else if (vnpayParam === 'failed') {
      this.vnpayResult = 'failed';
    }
        this.bookingService.getById(this.bookingId).subscribe({
            next: (res) => { 
                this.clientReceiveTime = Date.now();
                this.booking = res.data; 
                this.userPhone = res.data.passengerPhone || '';
                this.hasPhone = !!(this.userPhone && this.userPhone.trim());
                if (res.data.paymentStatus === 1) {
                this.paymentSuccess = true;
        } else if (res.data.status === 2) {
                this.isExpired = true;
        } else {
                this.initCountdown();
        }
            },
             error: () => {
                alert('Không tìm thấy ghế hoặc ghế đã hết hạn.');
                this.router.navigate(['/buytickets']);
            }
        });
    }

     ngOnDestroy(): void {
        this.clearCountdown();
    }
        goToBuyTickets(): void {
    this.router.navigate(['/buytickets']);
}

        goToHistory(): void {
    this.router.navigate(['/user/booked-ticket/history']);
}

validatePhone(): boolean {
    if (this.hasPhone) return true;
    if (!this.phoneInput || this.phoneInput.trim().length !== 10) {
      this.phoneError = 'Vui lòng nhập số điện thoại hợp lệ (10 số)';
      return false;
    }
    if (!/^\d{10}$/.test(this.phoneInput.trim())) {
      this.phoneError = 'Số điện thoại chỉ được chứa chữ số';
      return false;
    }
    this.phoneError = '';
    return true;
  }

  payWithVnPay(): void {
    if (!this.validatePhone()) return;
    
    this.isPaymentLoading = true;
    const phone = this.hasPhone ? undefined : this.phoneInput.trim();

    this.bookingService.createVnPayPayment(this.bookingId, phone).subscribe({
      next: (res) => {
        this.isPaymentLoading = false;
        // Redirect sang VNPay sandbox
        window.location.href = res.data.paymentUrl;
      },
      error: (err) => {
        this.isPaymentLoading = false;
        alert(err.error?.message || 'Không thể tạo thanh toán VNPay');
      }
    });
  }

  cancel(): void {
    if (confirm('Bạn có chắc muốn hủy vé này?')) {
      this.http.delete<any>(
        `${environment.apiUrl}/bookings/${this.bookingId}/cancel`
      ).subscribe({
        next: () => {
          this.clearCountdown();
          this.router.navigate(['/buytickets']);
        },
        error: () => {
          this.clearCountdown();
          this.router.navigate(['/buytickets']);
        }
      });
    }
  }

     // Khởi tạo đồng hồ đếm ngược dựa trên createdAt của booking 
    private initCountdown(): void {
        if (!this.booking) return;

        // Nếu booking đã bị reject hoặc đã thanh toán
        if (this.booking.status === 2) {
            this.isExpired = true;
            return;
        }
        if (this.booking.paymentStatus === 1) {
            this.paymentSuccess = true;
            return;
        }

        // Tính thời gian còn lại từ createdAt
        const createdAt = this.parseDate(this.booking.createdAt);
        if (!createdAt) {
            // Nếu không parse được, bắt đầu từ 2 phút
            this.remainingSeconds = 120;
        } else {
        
            const elapsedMs = this.clientReceiveTime - createdAt.getTime();
            const elapsedSeconds = Math.floor(elapsedMs / 1000);

      // Nếu elapsed âm (do lệch đồng hồ client/server), coi như = 0
            const safeElapsed = Math.max(0, elapsedSeconds);
             this.remainingSeconds = Math.max(0, 120 - safeElapsed);
        }

        if (this.remainingSeconds <= 0) {
            this.handleExpired();
            return;
        }

        this.updateDisplay();
        this.countdownTimer = setInterval(() => {
            this.remainingSeconds--;
            this.updateDisplay();
            if (this.remainingSeconds <= 0) {
                this.clearCountdown();
                this.handleExpired();
            }
        }, 1000);
    }

    private updateDisplay(): void {
        const m = Math.floor(this.remainingSeconds / 60);
        const s = this.remainingSeconds % 60;
        this.countdownDisplay =
            `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }

    private handleExpired(): void {
        this.isExpired = true;
        this.clearCountdown();
         // Xóa booking khi hết hạn
     this.http.delete<any>(
    `${environment.apiUrl}/bookings/${this.bookingId}/cancel`
     ).subscribe({
    next: () => {},
    error: () => {} 
  });
        alert(' Thời hạn thanh toán 2 phút đã hết. Ghế của bạn đã bị từ chối tự động. Vui lòng đặt vé mới.');
    }

    private clearCountdown(): void {
        if (this.countdownTimer) {
            clearInterval(this.countdownTimer);
            this.countdownTimer = null;
        }
    }
   
    private parseDate(dateStr: string): Date | null {
    if (!dateStr) return null;
    try {
      const parts = dateStr.trim().split(' ');
      if (parts.length < 2) return null;

      const datePart = parts[0]; // dd/MM/yyyy
      const timePart = parts[1]; // HH:mm hoặc HH:mm:ss

      const [dd, MM, yyyy] = datePart.split('/');
      const timeParts = timePart.split(':');
      const HH = timeParts[0] || '0';
      const mm = timeParts[1] || '0';
      const ss = timeParts[2] || '0'; 

      const date = new Date(+yyyy, +MM - 1, +dd, +HH, +mm, +ss); 

      // Kiểm tra date hợp lệ
      if (isNaN(date.getTime())) return null;

      return date;
    } catch {
      return null;
    }
  }
    get countdownClass(): string {
        if (this.remainingSeconds > 60) return 'text-green-600'; // > 1 phút
        if (this.remainingSeconds > 30) return 'text-yellow-500'; // >
        return 'text-red-600 animate-pulse'; // <= 2 phút
    }
}