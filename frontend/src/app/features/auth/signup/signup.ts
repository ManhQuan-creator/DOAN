import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { IconComponent } from '../../../shared/components/icon/icon';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, IconComponent],
  templateUrl: './signup.html'
})
export class SignupComponent {
  firstname = '';
  lastname = '';
  email = '';
  password = '';
  confirmPassword = '';
  otp='';
  agreePolicy = false; 
  message = '';
  isLoading = false;
  isSendingOtp = false;
  otpSent = false;      
  otpVerified = false;
  registerSuccess = false;

  constructor(private authService: AuthService, private router: Router) {}
  
  goHome(): void{
    this.router.navigate(['/']);
  }
  
    sendOtp(): void {
        if (!this.firstname || !this.lastname || !this.email || !this.password) {
            this.message = 'Vui lòng điền đầy đủ thông tin.';
            return;
        }
        if (this.password.length < 10) {
            this.message = 'Mật khẩu phải có trên 10 ký tự.';
            return;
        }
        if (this.password !== this.confirmPassword) {
            this.message = 'Mật khẩu không khớp.';
            return;
        }
        if (!this.agreePolicy) {
            this.message = 'Vui lòng đồng ý với điều khoản.';
            return;
        }

        this.isSendingOtp = true;
        this.authService.sendRegisterOtp({
            firstname: this.firstname,
            lastname: this.lastname,
            email: this.email,
            password: this.password
        }).subscribe({
            next: () => {
                this.otpSent = true;
                this.message = '';
                this.isSendingOtp = false;
            },
            error: (err) => {
                this.message = err.error?.message || 'Gửi OTP thất bại.';
                this.isSendingOtp = false;
            }
        });
    }

  signup(): void {
     if (!this.otp || this.otp.length !== 6) {
            this.message = 'Vui lòng nhập mã OTP 6 số.';
            return;
        }
    this.isLoading = true;
        this.authService.registerWithOtp({
            firstname: this.firstname,
            lastname: this.lastname,
            email: this.email,
            password: this.password,
            otp: this.otp
        }).subscribe({
            next: () => {
               this.registerSuccess = true;
               this.isLoading= false;
               setTimeout(() => {
                    this.router.navigate(['/signin']);
                }, 2000);
            },
            error: (err) => {
                this.message = err.error?.message || 'Đăng ký thất bại.';
                this.isLoading = false;
            }
        });
  }
   resendOtp(): void {
        this.otpSent = false;
        this.otp = '';
        this.sendOtp();
    }
     goToSignin(): void {
        this.router.navigate(['/signin']);
    }
}