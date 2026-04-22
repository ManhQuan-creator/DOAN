import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconComponent } from '../../../shared/components/icon/icon';
import { UserService } from '../../../core/services/user.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  templateUrl: './change-password.html'
})
export class ChangePasswordComponent {
  currentPassword = '';
  newPassword = '';
  confirmPassword = '';
  otp='';
  error = '';
  success = '';
  isLoading = false;
  hasPassword = false;
  otpSent = false;
  otpVerified = false;
  isSendingOtp = false;

  constructor(
    private userService: UserService,
     private authService: AuthService
    ){
    const user = this.authService.getCurrentUser();
    this.hasPassword = user?.type === 1;
  }

   sendOtp(): void {
        const user = this.authService.getCurrentUser();
        if (!user) return;
        
        this.isSendingOtp = true;
        this.authService.sendOtp(user.email, 'CHANGE_PASSWORD').subscribe({
            next: () => {
                this.otpSent = true;
                this.success = 'Mã OTP đã được gửi đến email của bạn';
                this.error = '';
                this.isSendingOtp = false;
            },
            error: (err) => {
                this.error = err.error?.message || 'Gửi OTP thất bại';
                this.isSendingOtp = false;
            }
        });
    }

    verifyOtp(): void {
        const user = this.authService.getCurrentUser();
        if (!user) return;

        this.authService.verifyOtp(user.email, this.otp, 'CHANGE_PASSWORD').subscribe({
            next: () => {
                this.otpVerified = true;
                this.success = 'Xác nhận OTP thành công. Bạn có thể đổi mật khẩu.';
                this.error = '';
            },
            error: (err) => {
                this.error = err.error?.message || 'Mã OTP không hợp lệ';
            }
        });
    }

  submit(): void {
     if (!this.otpVerified) {
            this.error = 'Vui lòng xác nhận OTP trước';
            return;
        }
    if (!this.newPassword || !this.confirmPassword) {
       this.error = 'Vui lòng điền đầy đủ thông tin vào tất cả các trường.';
        return;
       }
    if (this.newPassword.length < 10) {
       this.error = 'Mật khẩu phải có ít nhất 10 ký tự.';
        return; 
      }
    if (this.newPassword !== this.confirmPassword) {
       this.error = 'Mật khẩu không khớp';
        return; 
      }

    this.isLoading = true;
    this.userService.changePassword({
      currentPassword: this.currentPassword || undefined,
      newPassword: this.newPassword,
      confirmPassword: this.confirmPassword
    }).subscribe({
      next: () => {
        this.success = 'Mật khẩu đã được thay đổi thành công.';
        this.error = '';
        this.currentPassword = this.newPassword = this.confirmPassword = this.otp='';
        this.otpSent = false;
        this.otpVerified = false;
        this.isLoading = false;
      },
      error: (err) => {
        this.error = err.error?.message || 'Không thể thay đổi mật khẩu.';
        this.isLoading = false;
      }
    });
  }
}