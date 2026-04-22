import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../../../shared/components/icon/icon';
import { AdminService } from '../../../core/services/admin';
import { UserInfo } from '../../../core/models/user';
import { DashboardStats } from '../../../core/models/chat';

@Component({
  selector: 'app-user-accounts',
  standalone: true,
  imports: [CommonModule, IconComponent],
  templateUrl: './user-accounts.html'
})
export class UserAccountsComponent implements OnInit {
  users: UserInfo[] = [];
  stats: DashboardStats | null = null;

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadData();
  }
  loadData(): void{
     this.adminService.getAllUsers().subscribe({
       next: (r) => 
        { this.users = r.data; } 
      });

    this.adminService.getStats().subscribe({ 
      next: (r) =>
         { this.stats = r.data; } 
    });
  }

  lock(id: number): void {
    this.adminService.lockUser(id).subscribe({
       next: () => 
        { this.loadData(); }
       });
  }

  unlock(id: number): void {
    this.adminService.unlockUser(id).subscribe({
       next: () =>
         { this.loadData(); }
       });
  }
}