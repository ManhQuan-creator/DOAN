import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { IconComponent } from '../../../shared/components/icon/icon';
import { TranslateModule } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';

interface BlogPost{
  id: number;
  titleKey: string;
  contentKey: string;
   introKey: string;
  quoteKey: string;
  planKey: string;
  detailTitleKey: string;
  detailKey: string;
  image: string;
  path: string;
  date: string;
}

@Component({
  selector: 'app-blog-detail',
  standalone: true,
  imports: [CommonModule, RouterLink,TranslateModule,IconComponent],
  templateUrl: './blog-detail.html'
})
export class BlogDetailComponent implements OnInit {
 currentPost: BlogPost = {
  id: 0, titleKey: '', contentKey: '', introKey: '', quoteKey: '',
  planKey: '', detailTitleKey: '', detailKey: '', image: '', path: '', date: ''
};
  latestPosts: BlogPost[] = [];

   allPosts: BlogPost[] = [
  { id: 1, titleKey: 'BLOG.POST1_TITLE', contentKey: 'BLOG.POST1_CONTENT', introKey: 'BLOG.POST1_INTRO', quoteKey: 'BLOG.POST1_QUOTE', planKey: 'BLOG.POST1_PLAN', detailTitleKey: 'BLOG.POST1_DETAIL_TITLE', detailKey: 'BLOG.POST1_DETAIL', image: 'assets/blog/anh1.jpg', path: 'Why-Choose-ViserBus', date: '2026-10-02' },
  { id: 2, titleKey: 'BLOG.POST2_TITLE', contentKey: 'BLOG.POST2_CONTENT', introKey: 'BLOG.POST2_INTRO', quoteKey: 'BLOG.POST2_QUOTE', planKey: 'BLOG.POST2_PLAN', detailTitleKey: 'BLOG.POST2_DETAIL_TITLE', detailKey: 'BLOG.POST2_DETAIL', image: 'assets/blog/anh3.jpg', path: 'Top-10-Tips', date: '2026-03-04' },
  { id: 3, titleKey: 'BLOG.POST3_TITLE', contentKey: 'BLOG.POST3_CONTENT', introKey: 'BLOG.POST3_INTRO', quoteKey: 'BLOG.POST3_QUOTE', planKey: 'BLOG.POST3_PLAN', detailTitleKey: 'BLOG.POST3_DETAIL_TITLE', detailKey: 'BLOG.POST3_DETAIL', image: 'assets/blog/anh2.png', path: 'How-to-Book', date: '2026-02-18' },
  { id: 4, titleKey: 'BLOG.POST4_TITLE', contentKey: 'BLOG.POST4_CONTENT', introKey: 'BLOG.POST4_INTRO', quoteKey: 'BLOG.POST4_QUOTE', planKey: 'BLOG.POST4_PLAN', detailTitleKey: 'BLOG.POST4_DETAIL_TITLE', detailKey: 'BLOG.POST4_DETAIL', image: 'assets/blog/anh4.jpg', path: 'Benefits-Online-Booking', date: '2026-10-01' },
  { id: 5, titleKey: 'BLOG.POST5_TITLE', contentKey: 'BLOG.POST5_CONTENT', introKey: 'BLOG.POST5_INTRO', quoteKey: 'BLOG.POST5_QUOTE', planKey: 'BLOG.POST5_PLAN', detailTitleKey: 'BLOG.POST5_DETAIL_TITLE', detailKey: 'BLOG.POST5_DETAIL', image: 'assets/blog/anh5.jpg', path: 'Future-Bus-Travel', date: '2026-10-01' },
  { id: 6, titleKey: 'BLOG.POST6_TITLE', contentKey: 'BLOG.POST6_CONTENT', introKey: 'BLOG.POST6_INTRO', quoteKey: 'BLOG.POST6_QUOTE', planKey: 'BLOG.POST6_PLAN', detailTitleKey: 'BLOG.POST6_DETAIL_TITLE', detailKey: 'BLOG.POST6_DETAIL', image: 'assets/blog/anh6.jpg', path: 'Choose-Right-Bus', date: '2025-10-07' },
  { id: 7, titleKey: 'BLOG.POST7_TITLE', contentKey: 'BLOG.POST7_CONTENT', introKey: 'BLOG.POST7_INTRO', quoteKey: 'BLOG.POST7_QUOTE', planKey: 'BLOG.POST7_PLAN', detailTitleKey: 'BLOG.POST7_DETAIL_TITLE', detailKey: 'BLOG.POST7_DETAIL', image: 'assets/blog/thumb_7.png', path: 'Travel-Etiquette', date: '2026-11-01' },
  { id: 8, titleKey: 'BLOG.POST8_TITLE', contentKey: 'BLOG.POST8_CONTENT', introKey: 'BLOG.POST8_INTRO', quoteKey: 'BLOG.POST8_QUOTE', planKey: 'BLOG.POST8_PLAN', detailTitleKey: 'BLOG.POST8_DETAIL_TITLE', detailKey: 'BLOG.POST8_DETAIL', image: 'assets/blog/anh8.jpg', path: 'Scenic-Routes', date: '2025 -09-03' }
];



  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
     this.route.params.subscribe(params => {
      const path = params['path'];
      this.currentPost = this.allPosts.find(p => p.path === path) || this.allPosts[0];
      this.latestPosts = this.allPosts.filter(p => p.path !== path).slice(0, 5);
      window.scrollTo(0, 0);
    });
  }

  // Method chuyển trang khi bấm sidebar
  goToPost(path: string): void {
    this.router.navigate(['/blog', path]);
  }
  }
