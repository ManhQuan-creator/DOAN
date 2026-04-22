import { Component, OnInit } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs';
import {  HeaderComponent } from './shared/components/header/header';
import {  FooterComponent} from './shared/components/footer/footer';
import { ScrollToTop} from './shared/components/scroll-to-top/scroll-to-top';

@Component({
  selector: 'app-root', 
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent, FooterComponent, ScrollToTop],
  templateUrl: './app.html'
})
export class AppComponent implements OnInit {
  showHeaderFooter = true;

  private hideOnPaths = [
    '/signin', 
    '/signup', 
    '/admin',
    '/admin-login',
     '/user/payment/',
    '/user/information-user/',
    '/user/support/chat',
     '/forgot-password'
  ];

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event) => {
      const navEnd = event as NavigationEnd;
      this.showHeaderFooter = !this.hideOnPaths.some(
        path => navEnd.urlAfterRedirects === path || navEnd.urlAfterRedirects.startsWith(path)
      );
      window.scrollTo(0, 0);
    });
  }
}