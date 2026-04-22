import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconComponent } from '../../shared/components/icon/icon';
import { TranslateModule } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { empty, Subject } from 'rxjs';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule,TranslateModule,IconComponent],
  templateUrl: './contact.html'
})
export class ContactComponent {
  contactName = '';
  contactEmail = '';
  contactSubject = '';
  contactMessage = '';
  isLoading = false;
  successMsg = '';
  errorMsg = '';

  constructor(private http: HttpClient){}


  submit(): void {
    if (!this.contactName || !this.contactEmail || 
        !this.contactSubject || !this.contactMessage) {
      this.errorMsg = 'Vui lòng điền đầy đủ thông tin.';
      return;
    }
    this.isLoading = true;
    this.successMsg ='';
    this.errorMsg='';
    this.http.post(`${environment.apiUrl}/contact`,{
      name: this.contactName,
      email: this.contactEmail,
      subject: this.contactSubject,
      message: this.contactMessage
    }).subscribe({
      next: () => {
        this.isLoading = false;
        this.successMsg = 'Tin nhắn đã được gửi thành công! Chúng tôi sẽ phản hồi sớm nhất.';
    
        this.contactName = '';
        this.contactEmail = '';
        this.contactSubject = '';
        this.contactMessage = '';
      },
       error: (err) => {
        this.isLoading = false;
        this.errorMsg = err.error?.message || 'Có lỗi xảy ra. Vui lòng thử lại sau.';
      }
    });
  }
}