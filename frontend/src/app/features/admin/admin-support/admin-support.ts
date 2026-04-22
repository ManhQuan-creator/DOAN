import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { IconComponent } from '../../../shared/components/icon/icon';
import { AdminService } from '../../../core/services/admin';
import { Chat } from '../../../core/models/chat';
import { WebSocketService } from '../../../core/services/websocket';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-admin-support',
  standalone: true,
  imports: [CommonModule, RouterLink, IconComponent],
   templateUrl: './admin-support.html'
})
export class AdminSupportComponent implements OnInit {
  chats: Chat[] = [];
  //list tn new chua doc
    unreadChatIds = new Set<number>();
      private adminSub: Subscription | null = null;
  constructor(
    private adminService: AdminService,
    private wsService: WebSocketService
  ) {}
  ngOnInit(): void {
     this.adminService.getAllChats().subscribe({
       next: (r) => { 
        this.chats = r.data;
       }
       }); 
         this.wsService.connect();
    this.adminSub = this.wsService.subscribeAdminNotifications().subscribe({
      next: (data: any) => {
        const chatId = data.chatId;
        
        // Đánh dấu có tin nhắn mới
        this.unreadChatIds.add(chatId);
        
        // Cập nhật lastMessage trong danh sách chat
        const chat = this.chats.find(c => c.id === chatId);
        if (chat) {
          chat.lastMessage = data.message;
          // Di chuyển chat này lên đầu
          this.chats = [
            chat,
            ...this.chats.filter(c => c.id !== chatId)
          ];
        } else {
          // Nếu chat chưa có trong list, reload
          this.adminService.getAllChats().subscribe({
            next: (r) => { this.chats = r.data; }
          });
        }
      }
    });
      }
       ngOnDestroy(): void {
    if (this.adminSub) {
      this.adminSub.unsubscribe();
    }
    this.wsService.unsubscribeAdminNotifications();
  }
    markAsRead(chatId: number): void {
    this.unreadChatIds.delete(chatId);
  }

  hasUnread(chatId: number): boolean {
    return this.unreadChatIds.has(chatId);
  }
}