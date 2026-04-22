import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { IconComponent } from '../icon/icon';
import { AuthService } from '../../../core/services/auth.service';
import { UserInfo } from '../../../core/models/user';
import { environment } from '../../../../environments/environment';

interface NavItem {
  id: number;
  nameKey: string;
  path: string;
  icon: string;
  sub?: { id: string; nameKey: string; path: string }[];
}

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, TranslateModule, IconComponent],
  templateUrl: './header.html'
})
export class HeaderComponent implements OnInit, OnDestroy {
  language: 'vi' | 'en' = 'vi';
  isLanguageOpen = false;
  isMenuOpen = false;
  openSubId: number | null = null;
  currentUser: UserInfo | null = null;
  isUserPath = false;
  private sub!: Subscription;

  navbar: NavItem[] = [];
  dashboardNav: NavItem[] = [];

  constructor(
    private translate: TranslateService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.sub = this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.buildNav(); //rebuild nav khi user thay doi
    });
    this.router.events.subscribe(() => {
      this.isUserPath = this.router.url.startsWith('/user/');
    });
    this.buildNav();
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  changeLanguage(lang: 'vi' | 'en'): void {
    this.language = lang;
    this.translate.use(lang);
    this.isLanguageOpen = false;
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  toggleSub(id: number): void {
    this.openSubId = this.openSubId === id ? null : id;
  }

  logout(): void {
    this.authService.logout();
    this.isMenuOpen = false;
  }

  navigateHome(): void {
    this.router.navigate(this.isUserPath ? ['/'] : ['/user/dashboard']);
  }

 get avatarUrl(): string {
    if (this.currentUser?.imageUrl) {
        if (this.currentUser.imageUrl.startsWith('/uploads/')) {
            return `${environment.apiUrl.replace('/api', '')}${this.currentUser.imageUrl}`;
        }
        if (this.currentUser.imageUrl.startsWith('data:')) {
            return this.currentUser.imageUrl;
        }
        return this.currentUser.imageUrl;
    }
    const name = this.currentUser?.name || '?';
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=30fd4f&color=fff`;
}

  private buildNav(): void {
    this.navbar = [
      { id: 1, nameKey: 'HEADER.HOME', path: '/', icon: 'home' },
      { id: 2, nameKey: 'HEADER.ABOUT', path: '/about', icon: 'about' },
      { id: 3, nameKey: 'HEADER.FAQS', path: '/faqs', icon: 'faqs' },
      { id: 4, nameKey: 'HEADER.BLOG', path: '/blog', icon: 'blog' },
      { id: 5, nameKey: 'HEADER.CONTACT', path: '/contact', icon: 'contact' },
      { id: 6, nameKey: 'HEADER.TICKET_SEARCH', path: '/ticket-search', icon: 'search' }
    ];

    this.dashboardNav = [
      { id: 1, nameKey: 'HEADER.DASHBOARD', path: '/user/dashboard', icon: 'Dashboard' },
      { id: 2, nameKey: 'HEADER.BOOKING', path: '/user/buytickets', icon: 'ticket', sub: [
        { id: '1', nameKey: 'HEADER.BUY_TICKET', path: '/user/buytickets' },
        { id: '2', nameKey: 'HEADER.BOOKING_HISTORY', path: '/user/booked-ticket/history' }
      ]},
      { id: 3, nameKey: 'HEADER.SUPPORT', path: '/user/ticket/createnew', icon: 'support', sub: [
        { id: '1', nameKey: 'HEADER.CREATE_NEW', path: '/user/ticket/createnew' },
        { id: '2', nameKey: 'HEADER.TICKETS', path: '/user/support-ticket' },
        { id: '3', nameKey: 'HEADER.CHAT', path: '/user/support/chat' }
      ]},
      { id: 4, nameKey: 'Profile', path: '/user/profile/profile-setting/' + (this.currentUser?.id || ''), icon: 'user', sub: [
        { id: '1', nameKey: 'Profile', path: '/user/profile/profile-setting/' + (this.currentUser?.id || '') },
        { id: '2', nameKey: 'Change Password', path: '/user/change-password' }
      ]}
    ];
  }
}