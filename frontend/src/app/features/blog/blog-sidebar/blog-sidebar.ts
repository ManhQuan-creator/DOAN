import { Component ,Input} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { IconComponent } from '../../../shared/components/icon/icon';
interface LatestPost {
  id: number;
  titleKey: string;
  image: string;
  path: string;
  date: string;
}

@Component({
  selector: 'app-blog-sidebar',
  imports: [CommonModule, RouterLink, IconComponent],
  standalone: true,
  templateUrl: './blog-sidebar.html',
  styleUrl: './blog-sidebar.css',
})
export class BlogSidebar {
 @Input() latestPosts: LatestPost[] = [];
  @Input() currentPath: string = '';
}
