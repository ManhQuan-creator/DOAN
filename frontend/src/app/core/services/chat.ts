import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response';
import { Chat, ChatMessage, CreateChatRequest } from '../models/chat';

@Injectable({ providedIn: 'root' })
export class ChatService {
  private api = `${environment.apiUrl}/support`;

  constructor(private http: HttpClient) {}

  create(data: CreateChatRequest): Observable<ApiResponse<Chat>> {
    return this.http.post<ApiResponse<Chat>>(`${this.api}/chats`, data);
  }

  getMyChats(): Observable<ApiResponse<Chat[]>> {
    return this.http.get<ApiResponse<Chat[]>>(`${this.api}/chats`);
  }

  getChat(id: number): Observable<ApiResponse<Chat>> {
    return this.http.get<ApiResponse<Chat>>(`${this.api}/chats/${id}`);
  }

  sendMessage(chatId: number, message: string): Observable<ApiResponse<ChatMessage>> {
    return this.http.post<ApiResponse<ChatMessage>>(
      `${this.api}/chats/${chatId}/messages`, { message }
    );
  }
}