import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IconComponent } from '../../../shared/components/icon/icon';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  templateUrl: './forgot-password.html'
})
export class ForgotPasswordComponent {
  email = '';
  message = '';
  isSearching = false;

  constructor(private authService: AuthService, private router: Router) {}

  submit(): void {
    if (!this.email) return;
    this.isSearching = true;
    this.authService.forgotPassword(this.email).subscribe({
      next: () => {
        this.message = 'Đã gửi email hướng dẫn đặt lại mật khẩu.';
        this.isSearching = false;
      },
      error: (err) => {
        this.message = err.error?.message || 'Đã xảy ra lỗi.';
        this.isSearching = false;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/signin']);
  }
}