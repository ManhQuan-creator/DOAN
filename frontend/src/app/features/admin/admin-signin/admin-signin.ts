import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../../core/models/api-response';
import { AuthResponse } from '../../../core/models/user';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-admin-signin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-signin.html'
})
export class AdminSigninComponent {
  email = '';
  password = '';
  error='';
  otp='';
  isLoading = false;
  isSendingOtp = false;
  otpSent = false;
   constructor(private http: HttpClient,
    private authService: AuthService,
     private router: Router) {}
   
    sendOtp(): void {
        this.error = '';
        if (!this.email?.trim() || !this.password?.trim()) {
            this.error = 'Vui lòng nhập đầy đủ email và mật khẩu.';
            return;
        }

        this.isSendingOtp = true;
        this.authService.adminLoginSendOtp({
            email: this.email,
            password: this.password
        }).subscribe({
            next: () => {
                this.otpSent = true;
                this.isSendingOtp = false;
            },
            error: (err) => {
                this.error = err.error?.message || 'Sai Tài Khoản Hoặc Mật Khẩu';
                this.isSendingOtp = false;
            }
        });
    }

     verifyOtp(): void {
        if (!this.otp || this.otp.length !== 6) {
            this.error = 'Vui lòng nhập mã OTP 6 số.';
            return;
        }

        this.isLoading = true;
        this.authService.adminLoginVerifyOtp(this.email, this.otp).subscribe({
            next: (res) => {
                if (res.data.user.role === 'ADMIN') {
                    this.router.navigate(['/admin/dashboard']);
                } else {
                    this.error = 'Không phải tài khoản admin';
                    this.authService.adminLogout();
                    this.isLoading = false;
                }
            },
            error: (err) => {
                this.error = err.error?.message || 'Mã OTP không hợp lệ';
                this.isLoading = false;
            }
        });
    }

    resendOtp(): void {
        this.otpSent = false;
        this.otp = '';
        this.sendOtp();
    }
}