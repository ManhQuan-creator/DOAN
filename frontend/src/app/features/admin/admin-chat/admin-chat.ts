import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { IconComponent } from '../../../shared/components/icon/icon';
import { AdminService } from '../../../core/services/admin';
import { WebSocketService } from '../../../core/services/websocket';
import { Chat, ChatMessage } from '../../../core/models/chat';

@Component({
    selector: 'app-admin-chat',
    standalone: true,
    imports: [CommonModule, FormsModule, IconComponent],
    templateUrl: './admin-chat.html'
})
export class AdminChatComponent implements OnInit, OnDestroy, AfterViewChecked {
    @ViewChild('messagesEnd') messagesEnd!: ElementRef;
    chatId = 0;
    description = '';
    messages: ChatMessage[] = [];
    newMessage = '';
    private wsSub: Subscription | null = null;
    private shouldScroll = false;

    constructor(
        private route: ActivatedRoute,
        private adminService: AdminService,
        private wsService: WebSocketService,
        private cdr: ChangeDetectorRef
    ) {}

    ngOnInit(): void {
        this.chatId = +this.route.snapshot.params['id'];
        this.description = this.route.snapshot.params['name'] || '';

        // Load messages ban đầu
        this.adminService.getChatDetail(this.chatId).subscribe({
            next: (r) => {
                 this.messages = r.data.messages || [];
                  this.shouldScroll = true;
            }
        });

        // WebSocket
        this.wsService.connect();
        this.wsSub = this.wsService.subscribeChatMessages(this.chatId).subscribe({
            next: (msg: ChatMessage) => {
                const exists = this.messages.some(m => m.id === msg.id);
                if (!exists) {
                    this.messages.push(msg);
                     this.shouldScroll = true;
                    this.cdr.detectChanges();
                }
            }
        });
    }

    ngAfterViewChecked(): void {
         if (this.shouldScroll) {
      this.scrollToBottom();
      this.shouldScroll = false;
    }
    }

    ngOnDestroy(): void {
        if (this.wsSub) this.wsSub.unsubscribe();
        this.wsService.unsubscribeChatMessages(this.chatId);
    }

    send(): void {
        if (!this.newMessage.trim()) return;
        this.adminService.replyChat(this.chatId, this.newMessage).subscribe({
            next: (r) => {
                const exists = this.messages.some(m => m.id === r.data.id);
                if (!exists) {
                    this.messages.push(r.data);
                    this.shouldScroll = true;
                }
                this.newMessage = '';
            }
        });
    }
      private scrollToBottom(): void {
    try {
      this.messagesEnd?.nativeElement?.scrollIntoView({ behavior: 'smooth' });
    } catch {}
  }
}