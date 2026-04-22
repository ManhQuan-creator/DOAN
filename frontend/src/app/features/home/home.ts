import { Component, OnDestroy, OnInit,HostListener, Host } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { IconComponent } from '../../shared/components/icon/icon';

interface LocationItem {
  id: number;
  name: string;
}

interface Amenity {
  id: number;
  titleKey: string;
  icon: string;
}
interface BC {
  id: number;
  name: string;
  avatar: string;
  rating: number;
  comment: string;
}
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, TranslateModule, IconComponent],
  templateUrl: './home.html'
})
export class HomeComponent implements OnInit,OnDestroy {
  selectedDiemDi = '';
  selectedDiemDen = '';
  showDiemDiDropdown = false;
  showDiemDenDropdown = false;
  calendar = '';
  rawDate='';
  minDate='';

  diemDi: LocationItem[] = [];
  diemDen: LocationItem[] = [];
  amenities: Amenity[] = [];
  bC:BC[]=[];
  currentSlide = 0;
  autoSlide: any;

  constructor(private translate: TranslateService) {}

  ngOnInit(): void {
     const today = new Date();
    this.rawDate = this.toISODate(today);
    this.minDate = this.rawDate;
    this.calendar = this.formatDate(today);
    this.buildLocations();
    this.amenities = [
      { id: 1, titleKey: 'HOME.AMENITY_WIFI', icon: 'wifi' },
      { id: 2, titleKey: 'HOME.AMENITY_PILLOW', icon: 'pillow' },
      { id: 3, titleKey: 'HOME.AMENITY_WATER', icon: 'water' },
      { id: 4, titleKey: 'HOME.AMENITY_DRINK', icon: 'drink' }
    ];
      this.bC = [
      {
        id: 1,
        name: 'Nguyễn Văn A',
        avatar: 'assets/feedback/avt.jpg',
        rating: 5,
        comment: 'Phiệt Học đã giúp chuyến đi của tôi trở nên vô cùng thoải mái. Quá trình đặt vé rất dễ dàng, xe sạch sẽ và đúng giờ. Rất đáng để giới thiệu!'
      },
      {
        id: 2,
        name: 'Trần Thị B',
        avatar: 'assets/feedback/avt.jpg',
        rating: 5,
        comment: 'Tôi rất hài lòng với dịch vụ của Phiệt Học. Nhân viên thân thiện, xe chạy đúng giờ và giá cả hợp lý. Chắc chắn sẽ sử dụng lại!'
      },
      {
        id: 3,
        name: 'Lê Minh C',
        avatar: 'assets/feedback/avt.jpg',
        rating: 4,
        comment: 'Dịch vụ đặt vé online rất tiện lợi, không cần phải ra bến xe. Xe Limousine rất thoải mái, có wifi và nước uống miễn phí. Tuyệt vời!'
      }
    ];
       this.startAutoSlide();
  }
  onDateChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.value) {
      this.rawDate = input.value;
      const parts = input.value.split('-');
      this.calendar = `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
  }

  private formatDate(date: Date): string {
    const d = date.getDate().toString().padStart(2, '0');
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    return `${d}/${m}/${date.getFullYear()}`;
  }

  private toISODate(date: Date): string {
    const d = date.getDate().toString().padStart(2, '0');
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    return `${date.getFullYear()}-${m}-${d}`;
  }
  openDatePicker(input: HTMLInputElement): void {
  try {
    input.showPicker();
  } catch {
    input.focus();
    input.click();
  }
}
  @HostListener('document:click',['$event'])
  onDocumentClick(event:Event):void{
    const target =event.target as HTMLElement;
     // Nếu click ngoài vùng dropdown thì đóng
  if (!target.closest('.relative')) {
    this.showDiemDiDropdown = false;
    this.showDiemDenDropdown = false;
  }
  }
    nextSlide(): void {
    this.currentSlide = (this.currentSlide + 1) % this.bC.length;
  }
   prevSlide(): void {
    this.currentSlide = (this.currentSlide - 1 + this.bC.length) % this.bC.length;
  }

  goToSlide(index: number): void {
    this.currentSlide = index;
    this.resetAutoSlide();
  }

  startAutoSlide(): void {
    this.autoSlide = setInterval(() => {
      this.nextSlide();
    }, 5000); // 5s
  }

  resetAutoSlide(): void {
    clearInterval(this.autoSlide);
    this.startAutoSlide();
  }

  getStars(rating: number): number[] {
    return Array(rating).fill(0);
  }

  getEmptyStars(rating: number): number[] {
    return Array(5 - rating).fill(0);
  }
   ngOnDestroy(): void {
    if (this.autoSlide) {
      clearInterval(this.autoSlide);
    }
  }

  selectDiemDi(item: LocationItem): void {
  this.selectedDiemDi = item.name === 'All' ? '' : item.name;
  this.showDiemDiDropdown = false;
}

selectDiemDen(item: LocationItem): void {
  this.selectedDiemDen = item.name === 'All' ? '' : item.name;
  this.showDiemDenDropdown = false;
}
  search(): void {
    const diemDi = (this.selectedDiemDi === 'All' || this.selectedDiemDi === 'Tất cả') 
    ? '' : this.selectedDiemDi;
  const diemDen = (this.selectedDiemDen === 'All' || this.selectedDiemDen === 'Tất cả') 
    ? '' : this.selectedDiemDen;
   localStorage.setItem('searchData', JSON.stringify({
    diemDi: diemDi,
    diemDen: diemDen
  }));
  localStorage.setItem('DayData', this.calendar);
  window.location.href = '/buytickets';
  }

  private buildLocations(): void {
    const locations = [
    'All', 'Hà Nội', 'Thái Nguyên', 'Thái Bình', 
    'Hà Nam', 'Nam Định', 'Bắc Giang', 'Hồ Chí Minh', 'Hải Phòng'
  ];
    this.diemDi = locations.map((name, i) => ({ id: i, name }));
    this.diemDen = locations.map((name, i) => ({ id: i, name }));
  }
}