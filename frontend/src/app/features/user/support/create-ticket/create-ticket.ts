import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IconComponent } from '../../../../shared/components/icon/icon';
import { ChatService } from '../../../../core/services/chat';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-create-ticket',
  standalone: true,
  imports: [CommonModule, FormsModule,TranslateModule, IconComponent],
  templateUrl: './create-ticket.html'
})
export class CreateTicketComponent {
  description = '';
  priority = 1;
  message = '';

  constructor(private chatService: ChatService, private router: Router) {}

  submit(): void {
    if (!this.description || !this.message) {
       alert('Vui lòng điền đầy đủ thông tin vào tất cả các trường.');
        return; 
      }
    this.chatService.create({ 
      description: this.description, 
      priority: this.priority,
       message: this.message
       })
      .subscribe({
        next: () => {
           alert('Đã tạo phiếu hỗ trợ!');
            this.router.navigate(['/user/support-ticket']); 
          },
        error: (err) => { 
          alert(err.error?.message || 'Không thể tạo vé.'); }
      });
  }
}