import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconComponent } from '../../../shared/components/icon/icon';
import { UserService } from '../../../core/services/user.service';
import { AuthService } from '../../../core/services/auth.service';
import { UserInfo, UpdateProfileRequest } from '../../../core/models/user';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  templateUrl: './profile.html'
})
export class ProfileComponent implements OnInit {
  user: UserInfo | null = null;
  nameValue = '';
  phoneValue = '';
  addressValue = '';
  emailValue = '';
  zipcodeValue = '';
  cityValue = '';
  countryValue = 'vietnam';
  countryCode = '84+';
  error = '';
  success = '';

  countryOptions = [
    { value: 'vietnam', label: 'Vietnam', code: '84+' },
    { value: 'usa', label: 'USA', code: '29+' },
    { value: 'japan', label: 'Japan', code: '81+' },
    { value: 'korea', label: 'Korea', code: '82+' }
  ];

  constructor(
    private userService: UserService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.user = this.authService.getCurrentUser();
    if (this.user) {
      this.nameValue = this.user.name || '';
      this.phoneValue = this.user.phone || '';
      this.addressValue = this.user.address || '';
      this.emailValue = this.user.email;
      this.zipcodeValue = this.user.zipcode || '';
      this.cityValue = this.user.city || '';
      this.countryValue = this.user.country || 'vietnam';
      this.countryCode = this.user.countryCode || '84+';
    }
  }

  onCountryChange(): void {
    const found = this.countryOptions.find(o => o.value === this.countryValue);
    this.countryCode = found?.code || '';
  }

 get avatarUrl(): string {
    if (this.user?.imageUrl) {
        // Nếu là URL relative từ server
        if (this.user.imageUrl.startsWith('/uploads/')) {
            return `${environment.apiUrl.replace('/api', '')}${this.user.imageUrl}`;
        }
        // Nếu là data:image base64 (backward compatible)
        if (this.user.imageUrl.startsWith('data:')) {
            return this.user.imageUrl;
        }
        return this.user.imageUrl;
    }
    const name = this.user?.name || '?';
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=30fd4f&color=fff`;
}

  save(): void {
    if (this.phoneValue && this.phoneValue.length !== 10) {
      this.error = 'Phone must be 10 digits';
      return;
    }
    const data: UpdateProfileRequest = {
      name: this.nameValue,
      phone: this.phoneValue,
      address: this.addressValue,
      country: this.countryValue,
      countryCode: this.countryCode,
      zipcode: this.zipcodeValue,
      city: this.cityValue 
    };
    this.userService.updateProfile(data).subscribe({
      next: (res) => { 
        this.authService.updateStoredUser(res.data);
        this.success = 'Hồ sơ đã được cập nhật thành công.';
        this.error = '';
      },
      error: (err) => { this.error = err.error?.message || 'Cập nhật thất bại'; }
    });
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
        const file = input.files[0];
        
        // Validate client
        if (!file.type.startsWith('image/')) {
            this.error = 'Chỉ chấp nhận file ảnh';
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            this.error = 'File phải nhỏ hơn 5MB';
            return;
        }
        
        this.userService.uploadAvatar(file).subscribe({
            next: (res) => {
                this.authService.updateStoredUser(res.data);
                this.user = res.data;
                this.success = 'Avatar updated successfully';
                this.error = '';
      
                input.value = '';
            },
            error: (err) => { 
                this.error = err.error?.message || 'Upload failed: ' + err.status;
                console.error('Lỗi tải lên:', err);
            }
        });
    }
}

  logout(): void {
    this.authService.logout();
  }
}