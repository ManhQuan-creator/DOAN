import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { IconComponent } from '../../../../shared/components/icon/icon';
import { ChatService } from '../../../../core/services/chat';
import { Chat } from '../../../../core/models/chat';
import { Subscription } from 'rxjs';
import { WebSocketService } from '../../../../core/services/websocket';

@Component({
  selector: 'app-chat-list',
  standalone: true,
  imports: [CommonModule, RouterLink, IconComponent],
  templateUrl: './chat-list.html'
})
export class ChatListComponent implements OnInit,OnDestroy {
  chats: Chat[] = [];
  private wsSub: Subscription[] = [];

  constructor(
    private chatService: ChatService,
    private wsService: WebSocketService
  ) {}

  ngOnInit(): void {
    this.chatService.getMyChats().subscribe({
      next: (res) => {
         this.chats = res.data;
        this.subscribeToChatsStatus();
        }
    });
    this.wsService.connect();
  }
  
   private subscribeToChatsStatus(): void {
        // Hủy các subscription cũ trước
        this.wsSub.forEach(s => s.unsubscribe());
        this.wsSub = [];

        // Subscribe status update cho từng chat
        this.chats.forEach(chat => {
            const sub = this.wsService.subscribeChatStatus(chat.id).subscribe({
                next: (data: any) => {
                    // Tìm chat trong danh sách và cập nhật
                    const targetChat = this.chats.find(c => c.id === data.chatId);
                    if (targetChat) {
                        targetChat.status = data.status;
                        targetChat.statusName = data.statusName;
                        targetChat.lastMessage = data.lastMessage;
                    }
                }
            });
            this.wsSub.push(sub);
        });
    }

    ngOnDestroy(): void {
        // Hủy tất cả subscription
        this.wsSub.forEach(s => s.unsubscribe());
        this.chats.forEach(chat => {
            this.wsService.unsubscribeChatStatus(chat.id);
        });
    }
}