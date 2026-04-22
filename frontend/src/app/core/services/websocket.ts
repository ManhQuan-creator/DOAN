import { Injectable } from '@angular/core';
import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { Subject, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class WebSocketService {
    private client: Client | null = null;
    private messageSubjects = new Map<string, Subject<any>>();
    private bookingCancelledSubject = new Subject<number>();
    private bookingCancelledSubscription: any = null;

     constructor() {
    this.client = new Client({
      webSocketFactory: () => new SockJS(`${environment.apiUrl.replace('/api', '')}/ws`),
      reconnectDelay: 5000,
    });
  }

    connect(): void {
        if (this.client && this.client.connected) return;

        const wsUrl = environment.apiUrl.replace('/api', '') + '/ws';

        this.client = new Client({
            webSocketFactory: () => new SockJS(wsUrl),
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
            debug: (str) => {
                // console.log('STOMP: ' + str);
            }
        });

        this.client.onConnect = () => {
            console.log('WebSocket connected');
            // Re-subscribe tất cả topic đã đăng ký
            this.messageSubjects.forEach((subject, topic) => {
                this.subscribeToTopic(topic);
            });
        };

        this.client.onStompError = (frame) => {
            console.error('STOMP error', frame);
        };

        this.client.activate();
    }

    private subscribeToTopic(topic: string): void {
        if (!this.client || !this.client.connected) return;
        this.client.subscribe(topic, (message: IMessage) => {
            const subject = this.messageSubjects.get(topic);
            if (subject) {
                try {
                    subject.next(JSON.parse(message.body));
                } catch {
                    subject.next(message.body);
                }
            }
        });
    }
     private getOrCreateSubject(topic: string): Observable<any> {
    if (!this.messageSubjects.has(topic)) {
      this.messageSubjects.set(topic, new Subject<any>());
    }
    // Subscribe nếu đã connected
    if (this.client && this.client.connected) {
      this.subscribeToTopic(topic);
    }
    return this.messageSubjects.get(topic)!.asObservable();
  }

    subscribeChatMessages(chatId: number): Observable<any> {
        const topic = `/topic/chat/${chatId}`;
         return this.getOrCreateSubject(topic);
    }

     // thông báo tin nhắn mới cho admin
  subscribeAdminNotifications(): Observable<any> {
    const topic = `/topic/admin/new-message`;
    return this.getOrCreateSubject(topic);
  }

  subscribeChatStatus(chatId: number): Observable<any> {
    const topic = `/topic/chat/${chatId}/status`;
    return this.getOrCreateSubject(topic);
}

unsubscribeChatStatus(chatId: number): void {
    const topic = `/topic/chat/${chatId}/status`;
    this.unsubscribeTopic(topic);
}

// Subscribe tất cả status updates cho user (dùng ở chat-list)
subscribeUserChatsUpdate(): Observable<any> {
    const topic = `/topic/user/chats-update`;
    return this.getOrCreateSubject(topic);
}

  unsubscribeChatMessages(chatId: number): void {
    const topic = `/topic/chat/${chatId}`;
    this.unsubscribeTopic(topic);
  }

  unsubscribeAdminNotifications(): void {
    this.unsubscribeTopic(`/topic/admin/new-message`);
  }

   private unsubscribeTopic(topic: string): void {
    const subject = this.messageSubjects.get(topic);
    if (subject) {
      subject.complete();
      this.messageSubjects.delete(topic);
    }
  }

   subscribeBookingCancelled(): Observable<number> {
        if (this.client && this.client.connected) {
            // Đã connected thì subscribe luôn
            this.bookingCancelled();
        } else {
            // Chưa connected thì chờ onConnect
            // Lưu lại onConnect cũ để không ghi đè
            const previousOnConnect = this.client?.onConnect;
            if (this.client) {
                this.client.onConnect = (frame) => {
                    // Gọi lại onConnect cũ nếu có
                    if (previousOnConnect) previousOnConnect.call(this.client, frame);
                    this.bookingCancelled();
                };
            }
        }
        return this.bookingCancelledSubject.asObservable();
    }
    private bookingCancelled(): void {
        // Tránh subscribe nhiều lần
        if (this.bookingCancelledSubscription) return;
        if (!this.client) return;

        this.bookingCancelledSubscription = this.client.subscribe(
            '/topic/booking-cancelled',
            (msg: IMessage) => {
                const cancelledId = parseInt(msg.body, 10);
                this.bookingCancelledSubject.next(cancelledId);
            }
        );
    }
    unsubscribeBookingCancelled(): void {
        if (this.bookingCancelledSubscription) {
            this.bookingCancelledSubscription.unsubscribe();
            this.bookingCancelledSubscription = null;
        }
    }

    disconnect(): void {
        if (this.client) {
            this.client.deactivate();
            this.client = null;
        }
        this.messageSubjects.forEach(subject => subject.complete());
        this.messageSubjects.clear();
    }
}