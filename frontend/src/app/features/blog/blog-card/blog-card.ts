import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

interface BlogPost {
  id: number;
  titleKey: string;
  contentKey: string;
  image: string;
  path: string;
  date: string;
}
@Component({
  selector: 'app-blog-card',
  imports: [CommonModule, RouterLink],
  standalone: true,
  templateUrl: './blog-card.html',
  styleUrl: './blog-card.css',
})
export class BlogCard {
 @Input() post!: BlogPost;
}
