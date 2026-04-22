import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../../../shared/components/icon/icon';
import { AdminService } from '../../../core/services/admin';
import { UserInfo } from '../../../core/models/user';

@Component({
  selector: 'app-locked-users',
  standalone: true,
  imports: [CommonModule, IconComponent],
  templateUrl: './locked-users.html' 
})
export class LockedUsersComponent implements OnInit {
  users: UserInfo[] = [];
  constructor(private adminService: AdminService) {}

  ngOnInit(): void { 
    this.load();
    }

    load(): void{
      this.adminService.getLockedUsers().subscribe({ 
      next: (r) =>
         { this.users = r.data; }
     }); 
    }
     unlock(id: number): void {
    this.adminService.unlockUser(id).subscribe({ 
      next: () =>
         { this.load(); 
         }
         });
  }
}