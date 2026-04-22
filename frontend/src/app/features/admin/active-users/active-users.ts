import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../../../shared/components/icon/icon';
import { AdminService } from '../../../core/services/admin';
import { UserInfo } from '../../../core/models/user';

@Component({
  selector: 'app-active-users',
  standalone: true,
  imports: [CommonModule, IconComponent],
  templateUrl: './active-users.html'
})
export class ActiveUsersComponent implements OnInit {
  users: UserInfo[] = [];
  constructor(private adminService: AdminService) {}
  ngOnInit(): void {
    this.load();
  }
  load(): void{
     this.adminService.getActiveUsers().subscribe({
       next: (r) =>
         { this.users = r.data; }
       }); 
  }
     lock(id: number): void {
    this.adminService.lockUser(id).subscribe({
       next: () => { this.load(); } 
      });
  }
}