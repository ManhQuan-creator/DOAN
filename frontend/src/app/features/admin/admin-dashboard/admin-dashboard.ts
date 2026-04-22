import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { IconComponent } from '../../../shared/components/icon/icon';
import { CurrencyVndPipe } from '../../../shared/pipes/currency-vnd-pipe';
import { AdminService } from '../../../core/services/admin';
import { DashboardStats } from '../../../core/models/chat';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, IconComponent, CurrencyVndPipe],
  templateUrl: './admin-dashboard.html'
})
export class AdminDashboardComponent implements OnInit {
  stats: DashboardStats | null = null;

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.adminService.getStats().subscribe({
      next: (res) => { this.stats = res.data; }
    });
  }
}