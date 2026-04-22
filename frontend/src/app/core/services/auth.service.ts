import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response';
import { AuthResponse, LoginRequest, RegisterOtpRequest, RegisterRequest, UserInfo } from '../models/user';

export interface GoogleLoginResponse {
  status: string;
  email: string;
  message: string;
  authData?: AuthResponse;
}

@Injectable({ providedIn: 'root' })
export class AuthService {

  private api = environment.apiUrl;

// BehaviorSubject riêng cho user và admin
  private userSubject  = new BehaviorSubject<UserInfo | null>(this.getUser());
  private adminSubject = new BehaviorSubject<UserInfo | null>(this.getAdmin());

  currentUser$  = this.userSubject.asObservable();
  currentAdmin$ = this.adminSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {}

// USER methods 

  login(data: LoginRequest): Observable<ApiResponse<AuthResponse>> {
    return this.http.post<ApiResponse<AuthResponse>>(`${this.api}/auth/login`, data)
      .pipe(tap(res => this.handleUserAuth(res.data)));
  }

  googleLogin(token: string): Observable<ApiResponse<GoogleLoginResponse>>{
    return this.http.post<ApiResponse<GoogleLoginResponse>>(
      `${this.api}/auth/google`,
      {token}
    );
  }

  //  Thêm mới: verify OTP Google → trả JWT → tự lưu token qua tap
  verifyGoogleOtp(email: string, otp: string): Observable<ApiResponse<AuthResponse>> {
    return this.http.post<ApiResponse<AuthResponse>>(
      `${this.api}/auth/google/verify-otp`,
      { email, otp, type: 'GOOGLE_LOGIN' }
    ).pipe(tap(res => this.handleUserAuth(res.data)));
  }

  register(data: RegisterRequest): Observable<ApiResponse<AuthResponse>> {
    return this.http.post<ApiResponse<AuthResponse>>(`${this.api}/auth/register`, data)
      .pipe(tap(res => this.handleUserAuth(res.data)));
  }

  refreshUserToken(): Observable<ApiResponse<AuthResponse>> {
    const token = localStorage.getItem('refreshToken');
    return this.http.post<ApiResponse<AuthResponse>>(`${this.api}/auth/refresh-token`, { refreshToken: token });
  }

  logout(): void {
//   chỉ xóa key của user, không đụng đến admin
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userInfo');
    this.userSubject.next(null);
    this.router.navigate(['/signin']);
  }

  getUserToken(): string | null  { return localStorage.getItem('accessToken'); }
  isAuthenticated(): boolean     { return !!this.getUserToken(); }
  getCurrentUser(): UserInfo | null { return this.userSubject.value; }

  updateStoredUser(user: UserInfo): void {
    localStorage.setItem('userInfo', JSON.stringify(user));
    this.userSubject.next(user);
  }

  forgotPassword(email: string): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.api}/auth/forgot-password`, { email });
  }

//ADMIN methods 

  adminLogin(data: LoginRequest): Observable<ApiResponse<AuthResponse>> {
    return this.http.post<ApiResponse<AuthResponse>>(`${this.api}/auth/admin/login`, data)
      .pipe(tap(res => this.handleAdminAuth(res.data)));
  }

  refreshAdminToken(): Observable<ApiResponse<AuthResponse>> {
    const token = localStorage.getItem('adminRefreshToken');
    return this.http.post<ApiResponse<AuthResponse>>(`${this.api}/auth/refresh-token`, { refreshToken: token });
  }

  adminLogout(): void {
//   chỉ xóa key của admin, không đụng đến user
    localStorage.removeItem('adminAccessToken');
    localStorage.removeItem('adminRefreshToken');
    localStorage.removeItem('adminInfo');
    this.adminSubject.next(null);
    this.router.navigate(['/admin-login']);
  }

  getAdminToken(): string | null  { return localStorage.getItem('adminAccessToken'); }
  isAdminAuthenticated(): boolean { return !!this.getAdminToken(); }
  isAdmin(): boolean {
    const admin = this.getAdmin();
    return admin?.role === 'ADMIN';
  }
  getCurrentAdmin(): UserInfo | null { return this.adminSubject.value; }

//private helpers

  private handleUserAuth(data: AuthResponse): void {
//   chỉ ghi vào key của user
    localStorage.setItem('accessToken',  data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    localStorage.setItem('userInfo',     JSON.stringify(data.user));
    this.userSubject.next(data.user);
  }

  private handleAdminAuth(data: AuthResponse): void {
//   chỉ ghi vào key của admin
    localStorage.setItem('adminAccessToken',  data.accessToken);
    localStorage.setItem('adminRefreshToken', data.refreshToken);
    localStorage.setItem('adminInfo',         JSON.stringify(data.user));
    this.adminSubject.next(data.user);
  }

  private getUser(): UserInfo | null {
    const raw = localStorage.getItem('userInfo');
    return raw ? JSON.parse(raw) as UserInfo : null;
  }

  private getAdmin(): UserInfo | null {
    const raw = localStorage.getItem('adminInfo');
    return raw ? JSON.parse(raw) as UserInfo : null;
  }

  sendOtp(email: string, type: string): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.api}/auth/send-otp`, { email, type });
}

  verifyOtp(email: string, otp: string, type: string): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.api}/auth/verify-otp`, { email, otp, type });
}
//ĐKI với OTP
  sendRegisterOtp(data: RegisterRequest): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(
        `${this.api}/auth/register/send-otp`, data);
}
  registerWithOtp(data: RegisterOtpRequest): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(
        `${this.api}/auth/register/verify-otp`, data
    );
}
adminLoginSendOtp(data: LoginRequest): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(
        `${this.api}/auth/admin/login/send-otp`, data);
}

adminLoginVerifyOtp(email: string, otp: string): Observable<ApiResponse<AuthResponse>> {
    return this.http.post<ApiResponse<AuthResponse>>(
        `${this.api}/auth/admin/login/verify-otp`,
        { email, otp }
    ).pipe(tap(res => this.handleAdminAuth(res.data)));
}
}
