import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import {Chart,registerables} from'chart.js';
import { DashboardStats } from '../../../core/models/chat';
import { AdminService } from '../../../core/services/admin';


Chart.register(...registerables);
//thống kê
@Component({
  selector: 'app-admin-statistics',
  standalone: true,
  imports: [CommonModule],
   templateUrl: './admin-statistics.html'
})
export class AdminStatisticsComponent implements OnInit,AfterViewInit {
  @ViewChild('bookingChart') bookingChartRef !: ElementRef<HTMLCanvasElement>;
  @ViewChild('userChart') userChartRef !: ElementRef<HTMLCanvasElement>;
    @ViewChild('revenueChart') revenueChartRef !: ElementRef<HTMLCanvasElement>;
    stats: DashboardStats | null =null;
    constructor(
      private adminService: AdminService
    ){}
    ngOnInit(): void {
        this.adminService.getStats().subscribe({
          next: (res)=>{
            this.stats = res.data;
            setTimeout(()=> this.createCharts(),100);
          }
        });
    }
    ngAfterViewInit(): void {}
     
    createCharts(): void{
        if (!this.stats) return;
           this.createBookingChart();
           this.createUserChart();
           this.createRevenueChart();
    }
    createBookingChart(): void {
    if (!this.bookingChartRef || !this.stats) return;
    new Chart(this.bookingChartRef.nativeElement, {
      type: 'bar',
      data: {
        labels: ['Đã xác nhận', 'Đã từ chối', 'Đang chờ'],
        datasets: [{
          label: 'Số lượng vé',
          data: [
            this.stats.confirmedBookings,
            this.stats.rejectedBookings,
            this.stats.pendingBookings
          ],
          backgroundColor: ['#22c55e', '#ef4444', '#eab308'],
          borderRadius: 8
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: true, position: 'top' }
        },
        scales: {
          y: { beginAtZero: true, ticks: { stepSize: 1 } }
        }
      }
    });
  }

  
  createUserChart(): void {
    if (!this.userChartRef || !this.stats) return;
    new Chart(this.userChartRef.nativeElement, {
      type: 'doughnut',
      data: {
        labels: ['Đang hoạt động', 'Đã khóa'],
        datasets: [{
          data: [this.stats.activeUsers, this.stats.lockedUsers],
          backgroundColor: ['#22c55e', '#ef4444'],
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: true, position: 'bottom' }
        }
      }
    });
  }

    createRevenueChart(): void {
    if (!this.revenueChartRef || !this.stats) return;
    new Chart(this.revenueChartRef.nativeElement, {
      type: 'bar',
      data: {
        labels: ['Tổng vé', 'Tổng đặt', 'Xác nhận', 'Từ chối', 'Đang chờ'],
        datasets: [{
          label: 'Doanh thu (VNĐ)',
          data: [
            this.stats.totalTickets * 500000,
            this.stats.totalBookings * 600000,
            this.stats.totalRevenue,
            this.stats.rejectedBookings * 300000,
            this.stats.pendingBookings * 400000
          ],
          backgroundColor: ['#3b82f6', '#f97316', '#22c55e', '#ef4444', '#eab308'],
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: true, position: 'top' }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: (value) => {
                const num = Number(value);
                if (num >= 1000000) return (num / 1000000).toFixed(1) + ' Tr';
                if (num >= 1000) return (num / 1000).toFixed(0) + 'K';
                return num.toString();
              }
            }
          }
        }
      }
    });
  }
}