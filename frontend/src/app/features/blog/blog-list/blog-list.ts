import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { IconComponent } from '../../../shared/components/icon/icon';
import { TranslateModule } from '@ngx-translate/core';

interface BlogPost {
  id: number;
  titleKey: string;
  contentKey: string;
  image: string;
  path: string;
  date: string;
}

@Component({
  selector: 'app-blog-list',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule,IconComponent],
  templateUrl: './blog-list.html'
})
export class BlogListComponent implements OnInit {
  posts: BlogPost[] = [];

  ngOnInit(): void {
     this.posts = [
      { id: 1, titleKey: 'BLOG.POST1_TITLE', contentKey: 'BLOG.POST1_CONTENT', image: 'assets/blog/anh1.jpg', path: 'Why-Choose-PH', date: '2026-10-02' },
      { id: 2, titleKey: 'BLOG.POST2_TITLE', contentKey: 'BLOG.POST2_CONTENT', image: 'assets/blog/anh3.jpg', path: 'Top-10-Tips', date: '2026-03-04' },
      { id: 3, titleKey: 'BLOG.POST3_TITLE', contentKey: 'BLOG.POST3_CONTENT', image: 'assets/blog/anh2.png', path: 'How-to-Book', date: '2026-02-18' },
      { id: 4, titleKey: 'BLOG.POST4_TITLE', contentKey: 'BLOG.POST4_CONTENT', image: 'assets/blog/anh4.jpg', path: 'Benefits-Online-Booking', date: '2026-10-01' },
      { id: 5, titleKey: 'BLOG.POST5_TITLE', contentKey: 'BLOG.POST5_CONTENT', image: 'assets/blog/anh5.jpg', path: 'Future-Bus-Travel', date: '2026-10-01' },
      { id: 6, titleKey: 'BLOG.POST6_TITLE', contentKey: 'BLOG.POST6_CONTENT', image: 'assets/blog/anh6.jpg', path: 'Choose-Right-Bus', date: '2025-10-07' },
      { id: 7, titleKey: 'BLOG.POST7_TITLE', contentKey: 'BLOG.POST7_CONTENT', image: 'assets/blog/thumb_7.png', path: 'Travel-Etiquette', date: '2025-11-01' },
      { id: 8, titleKey: 'BLOG.POST8_TITLE', contentKey: 'BLOG.POST8_CONTENT', image: 'assets/blog/anh8.jpg', path: 'Scenic-Routes', date: '2026-09-03' }
    ];
  }
}