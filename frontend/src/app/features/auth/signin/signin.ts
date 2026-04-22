import { AfterViewInit, Component, NgZone, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { IconComponent } from '../../../shared/components/icon/icon';
import { AuthService } from '../../../core/services/auth.service';
import { environment } from '../../../../environments/environment';

declare const google:any;

@Component({
  selector: 'app-signin',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, IconComponent],
  templateUrl: './signin.html'
})
export class SigninComponent implements OnInit, AfterViewInit {
  email = '';
  password = '';
  message = '';
  isLoading = false;
  showOtpForm = false;
  googleEmail = '';
  otpCode = '';
  isVerifyingOtp = false;

  constructor(
    private authService: AuthService, 
    private router: Router,
    private ngZone: NgZone
  ){}
  
ngOnInit(): void {}

    ngAfterViewInit(): void {
        this.waitForGoogle();
    }

 private waitForGoogle(retries = 0): void {
    if (retries > 50) {
      console.error('Google GSI script không load được sau 5 giây');
      return;
    }

    if (typeof google !== 'undefined' && google?.accounts?.id) {
      this.initGoogleLogin();
    } else {
      setTimeout(() => this.waitForGoogle(retries + 1), 100);
    }
  }

     private initGoogleLogin(): void {
        try {
            google.accounts.id.initialize({
                client_id: environment.googleClientId,
                callback: (response: any) => this.handleGoogleResponse(response),
                auto_select: false,
                cancel_on_tap_outside: true,
                 ux_mode: 'popup',
            });

            const btnEl = document.getElementById('google-signin-btn');
            if (btnEl) {
                 btnEl.innerHTML = '';
                google.accounts.id.renderButton(btnEl, {
                    theme: 'outline',
                    size: 'large',
                    width: 400,
                    text: 'signin_with',
                    shape: 'rectangular',
                    logo_alignment: 'center'
                });
            }
        } catch (e) {
            console.error('Google init error:', e);
        }
    }

    handleGoogleResponse(response: any): void {
        this.ngZone.run(() => {
            this.isLoading = true;
            this.authService.googleLogin(response.credential).subscribe({
                next: (res) => {
                     const data = res.data as any;
                if (data?.status === 'OTP_REQUIRED')  {
                        this.googleEmail = res.data.email;
                        this.showOtpForm = true;  // Hiện form nhập OTP
                        this.message = res.data.message;
                        this.isLoading = false;
                        return;
                    }
                    this.router.navigate(['/user/dashboard']);
                },
                error: (err) => {
                    this.message = err.error?.message || 'Đăng nhập Google thất bại.';
                    this.isLoading = false;
                }
            });
        });
    }

      verifyGoogleOtp(): void {
        if (!this.otpCode || this.otpCode.length !== 6) {
            this.message = 'Vui lòng nhập mã OTP 6 số';
            return;
        }
        this.isVerifyingOtp = true;
        this.authService.verifyGoogleOtp(this.googleEmail, this.otpCode).subscribe({
            next: (res) => {
                // Lưu token và redirect
                if (res.data.user.role === 'ADMIN') {
                    this.authService.logout();
                    this.message = 'Admin không thể đăng nhập bằng Google';
                    this.isVerifyingOtp = false;
                    return;
                }
                this.router.navigate(['/user/dashboard']);
            },
            error: (err) => {
                this.message = err.error?.message || 'Mã OTP không hợp lệ';
                this.isVerifyingOtp = false;
            }
        });
    }

   goHome(): void{
    this.router.navigate(['/']);
  }
  

  login(): void {
     const emailTrimmed = this.email?.trim();
    const passwordTrimmed = this.password?.trim();

    if (!emailTrimmed || !passwordTrimmed) {
      this.message = 'Vui lòng điền đầy đủ thông tin đăng nhập.';
      return;
    }
    this.isLoading = true;
    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: (res) => {
          // Chặn admin vào trang user
      if (res.data.user.role === 'ADMIN') {
        this.authService.logout();
        this.message = 'Tài khoản admin vui lòng đăng nhập tại trang quản trị.';
        this.isLoading = false;
        return;
      }
        this.router.navigate(['/user/dashboard']);
      },
      error: (err) => {
        this.message = err.error?.message || 'Email hoặc mật khẩu không đúng.';
        this.isLoading = false;
      }
    });
  }

  clearMessage(): void {
    this.message = '';
  }
}