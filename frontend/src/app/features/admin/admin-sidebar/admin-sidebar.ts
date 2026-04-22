import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { IconComponent } from '../../../shared/components/icon/icon';
import { AuthService } from '../../../core/services/auth.service';

interface AdminNav {
  id: number;
  name: string;
  path: string;
  icon: string;
  sub?: { id: string; name: string; path: string }[];
}

@Component({
  selector: 'app-admin-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, IconComponent],
  templateUrl: './admin-sidebar.html'
})
export class AdminSidebarComponent {
  collapsed = false;
  mobileOpen = false;
  openSub: number | null = null;

  nav: AdminNav[] = [
    { id: 1, name: 'Quản Trị', path: '/admin/dashboard', icon: 'dashboard', sub: [
      { id: '1', name: 'Thống Kê', path: '/admin/statistics' }
    ]},
    { id: 2, name: 'Quản Lí Vé', path: '/admin/manage-tickets', icon: 'ticket' },
    { id: 3, name: 'Vé Đã Đặt', path: '/admin/booked-tickets', icon: 'check', sub: [
      { id: '1', name: 'Đang Chờ', path: '/admin/booked-tickets/pending' },
      { id: '2', name: 'Xác Nhận', path: '/admin/booked-tickets/confirmed' },
      { id: '3', name: 'Từ Chối', path: '/admin/booked-tickets/rejected' }
    ]},
    { id: 4, name: 'Tài Khoản User', path: '/admin/users', icon: 'user', sub: [
      { id: '1', name: 'Đang Hoạt Động', path: '/admin/users/account-active' },
      { id: '2', name: 'Đã Khóa', path: '/admin/users/account-locked' }
    ]},
    { id: 5, name: 'Hỗ Trợ Khách Hàng', path: '/admin/support', icon: 'support' }
  ];

  constructor(private authService: AuthService, private router: Router) {}

  toggleSub(id: number, event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.openSub = this.openSub === id ? null : id;
  }

  logout(): void {
      this.authService.adminLogout();
  }

  toggleCollapse(): void {
    this.collapsed = !this.collapsed;
    this.openSub = null;
  }
}