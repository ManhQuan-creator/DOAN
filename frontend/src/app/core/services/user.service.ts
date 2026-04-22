import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response';
import { UserInfo, UpdateProfileRequest, ChangePasswordRequest } from '../models/user';

@Injectable({ providedIn: 'root' })
export class UserService {
  private api = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  getProfile(): Observable<ApiResponse<UserInfo>> {
    return this.http.get<ApiResponse<UserInfo>>(`${this.api}/me`);
  }

  updateProfile(data: UpdateProfileRequest): Observable<ApiResponse<UserInfo>> {
    return this.http.put<ApiResponse<UserInfo>>(`${this.api}/me`, data);
  }

  changePassword(data: ChangePasswordRequest): Observable<ApiResponse<void>> {
    return this.http.put<ApiResponse<void>>(`${this.api}/me/password`, data);
  }

  uploadAvatar(file: File): Observable<ApiResponse<UserInfo>> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.put<ApiResponse<UserInfo>>(`${this.api}/me/avatar`, formData);
  }
}