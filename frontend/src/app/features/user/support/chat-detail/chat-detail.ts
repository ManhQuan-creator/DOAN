import { Component, OnInit, ViewChild, ElementRef, AfterViewChecked, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { IconComponent } from '../../../../shared/components/icon/icon';
import { ChatService } from '../../../../core/services/chat';
import { Chat, ChatMessage } from '../../../../core/models/chat';
import { Subscription } from 'rxjs';
import { WebSocketService } from '../../../../core/services/websocket';

@Component({
  selector: 'app-chat-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, IconComponent],
  templateUrl: './chat-detail.html'
})
export class ChatDetailComponent implements OnInit,OnDestroy,AfterViewChecked {
  @ViewChild('messagesEnd') messagesEnd!: ElementRef;

  chatId = 0;
  chat: Chat | null = null;
  messages: ChatMessage[] = [];
  newMessage = '';
  description = '';
  private wsSub: Subscription | null = null;
  private statusSub: Subscription | null = null;
  private shouldScroll = false; //// Flag để chỉ scroll khi có tin nhắn mới
 
  constructor(private route: ActivatedRoute,
     private chatService: ChatService,
     private wsService: WebSocketService,
     private cdr: ChangeDetectorRef
    ) {}

  ngOnInit(): void {
    this.chatId = +this.route.snapshot.params['id'];
    this.description = this.route.snapshot.params['name'] || '';
    this.loadMessages();
     // Kết nối WebSocket và subscribe
        this.wsService.connect();
        this.wsSub = this.wsService.subscribeChatMessages(this.chatId).subscribe({
            next: (msg: ChatMessage) => {
                // Tránh duplicate nếu message đã có
                const exists = this.messages.some(m => m.id === msg.id);
                if (!exists) {
                    this.messages.push(msg);
                    this.shouldScroll= true;
                    this.cdr.detectChanges();
                }
            }
        });
        this.statusSub = this.wsService.subscribeChatStatus(this.chatId).subscribe({
            next: (data: any) => {
                if (this.chat) {
                    this.chat.status = data.status;
                    this.chat.statusName = data.statusName;
                }
                this.cdr.detectChanges();
            }
        });
    }
       ngAfterViewChecked(): void {
     if (this.shouldScroll) {
      this.scrollToBottom();
      this.shouldScroll = false;
    }
  }
  ngOnDestroy(): void{
      if (this.wsSub) {
            this.wsSub.unsubscribe();
        }
        this.wsService.unsubscribeChatMessages(this.chatId);
  }
   loadMessages(): void {
    this.chatService.getChat(this.chatId).subscribe({
      next: (res) => {
        this.chat = res.data;
        this.messages = res.data.messages || [];
        this.shouldScroll = true;
      }
    });
  }
   send(): void {
    if (!this.newMessage.trim()) 
      return;

    this.chatService.sendMessage(this.chatId, this.newMessage).subscribe({
      next: (res) => {
         // WebSocket sẽ push message, nhưng thêm trực tiếp để UI nhanh .some trả về true nếu tìm 1 ptu trùng id
                const exists = this.messages.some(m => m.id === res.data.id);
    //thêm khi chưa tồn tại trong list
                if(!exists){
                   this.messages.push(res.data);
                   this.shouldScroll = true;
                }
        this.newMessage = '';
      }
    });
  }
   private scrollToBottom(): void {
    try {
      this.messagesEnd?.nativeElement?.scrollIntoView({ behavior: 'smooth' });
    } catch (err) {}
  }
  }