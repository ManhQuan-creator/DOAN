import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { IconComponent } from '../../../../shared/components/icon/icon';
import { ChatService } from '../../../../core/services/chat';
import { Chat } from '../../../../core/models/chat';
import { TranslateModule } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { WebSocketService } from '../../../../core/services/websocket';

@Component({
  selector: 'app-support-ticket',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule,IconComponent],
  templateUrl: './support-ticket.html'
})
export class SupportTicketComponent implements OnInit,OnDestroy {
  chats: Chat[] = [];
   private wsSubscriptions: Subscription[] = [];

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
        this.wsSubscriptions.forEach(s => s.unsubscribe());
        this.wsSubscriptions = [];

        this.chats.forEach(chat => {
            const sub = this.wsService.subscribeChatStatus(chat.id).subscribe({
                next: (data: any) => {
                    const targetChat = this.chats.find(c => c.id === data.chatId);
                    if (targetChat) {
                        targetChat.status = data.status;
                        targetChat.statusName = data.statusName;
                        targetChat.lastMessage = data.lastMessage;
                    }
                }
            });
            this.wsSubscriptions.push(sub);
        });
    }

    ngOnDestroy(): void {
        this.wsSubscriptions.forEach(s => s.unsubscribe());
        this.chats.forEach(chat => {
            this.wsService.unsubscribeChatStatus(chat.id);
        });
    }
}