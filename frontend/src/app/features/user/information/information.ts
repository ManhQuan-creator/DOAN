import { Component,OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { IconComponent } from '../../../shared/components/icon/icon';
import { UserService } from '../../../core/services/user.service';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-information',
  standalone: true,
  imports: [CommonModule, FormsModule,TranslateModule, IconComponent],
  templateUrl: './information.html'
})
export class InformationComponent implements OnInit{
  ticketId = '';
  userId = '';
  fullName = '';
  phone = '';
  email = '';
  cccd = '';
  birthday = '';
  message = '';
  isLoading = false;
  isMay = true;
  needsInfo = false;
  isLoggedIn = false;


  constructor(private route: ActivatedRoute, private router: Router, private userService: UserService,private authService: AuthService) {
    this.ticketId = this.route.snapshot.params['id'];
    this.userId = this.route.snapshot.params['name'];
    const currentYear = new Date().getFullYear() - 18;
    this.birthday = `${currentYear}-01-01`;
  }
   ngOnInit(): void {
    // Kiểm tra đã đăng nhập chưa
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.isLoggedIn = true;
      // Tự điền thông tin từ profile
      this.fullName = currentUser.name || '';
      this.phone = currentUser.phone || '';
      this.email = currentUser.email || '';
      this.cccd = currentUser.cccd || '';

      // Kiểm tra thiếu thông tin quan trọng không
      this.needsInfo = !currentUser.phone || !currentUser.cccd;

      if (!this.needsInfo) {
        this.autoSubmit();
      }
    }
  }
  // Tự động submit khi đã có đủ thông tin
  autoSubmit(): void {
    this.isLoading = true;
    const updateData: any = {};
    if (this.fullName) updateData.name = this.fullName;
    if (this.phone) updateData.phone = this.phone;
    if (this.cccd) updateData.cccd = this.cccd;

    this.userService.updateProfile(updateData).subscribe({
      next: (res) => {
        this.authService.updateStoredUser(res.data);
        this.router.navigate(['/user/payment', this.ticketId]);
      },
      error: () => {
        this.router.navigate(['/user/payment', this.ticketId]);
      }
    });
  }

  submit(): void {
    if (this.phone.length !== 10) { this.message = 'Phone must be 10 digits'; return; }
    if (this.cccd.length !== 12) { this.message = 'CCCD must be 12 digits'; return; }

    this.isLoading = true;
    this.userService.updateProfile({
      name: this.fullName, phone: this.phone, cccd: this.cccd, birthday: this.birthday
    }).subscribe({
      next: () => { this.router.navigate(['/user/payment', this.ticketId]); },
      error: (err) => { this.message = err.error?.message || 'Failed'; this.isLoading = false; }
    });
    
  }
}