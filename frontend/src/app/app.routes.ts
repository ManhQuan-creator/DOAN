import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  // Public
  { path: '', loadComponent: () => import('./features/home/home').then(m => m.HomeComponent) },
  { path: 'about', loadComponent: () => import('./features/about/about').then(m => m.AboutComponent) },
  { path: 'faqs', loadComponent: () => import('./features/faq/faq').then(m => m.FaqComponent) },
  { path: 'contact', loadComponent: () => import('./features/contact/contact').then(m => m.ContactComponent) },
  { path: 'blog', loadComponent: () => import('./features/blog/blog-list/blog-list').then(m => m.BlogListComponent) },
  { path: 'blog/:path', loadComponent: () => import('./features/blog/blog-detail/blog-detail').then(m => m.BlogDetailComponent) },
  { path: 'buytickets', loadComponent: () => import('./features/tickets/ticket-list/ticket-list').then(m => m.TicketListComponent) },
  { path: 'buytickets/:id/:name', loadComponent: () => import('./features/tickets/ticket-detail/ticket-detail').then(m => m.TicketDetailComponent) },
  { path: 'ticket-search', loadComponent: () => import('./features/tickets/ticket-search/ticket-search').then(m => m.TicketSearchComponent) },

  // Auth
  { path: 'signin', loadComponent: () => import('./features/auth/signin/signin').then(m => m.SigninComponent) },
  { path: 'signup', loadComponent: () => import('./features/auth/signup/signup').then(m => m.SignupComponent) },
  { path: 'forgot-password', loadComponent: () => import('./features/auth/forgot-password/forgot-password').then(m => m.ForgotPasswordComponent) },

  // User (protected)
  { path: 'user/dashboard', loadComponent: () => import('./features/user/dashboard/dashboard').then(m => m.DashboardComponent), canActivate: [authGuard] },
  { path: 'user/profile/profile-setting/:id', loadComponent: () => import('./features/user/profile/profile').then(m => m.ProfileComponent), canActivate: [authGuard] },
  { path: 'user/booked-ticket/history', loadComponent: () => import('./features/user/booking-history/booking-history').then(m => m.BookingHistoryComponent), canActivate: [authGuard] },
  { path: 'user/change-password', loadComponent: () => import('./features/user/change-password/change-password').then(m => m.ChangePasswordComponent), canActivate: [authGuard] },
  { path: 'user/buytickets', loadComponent: () => import('./features/tickets/ticket-list/ticket-list').then(m => m.TicketListComponent), canActivate: [authGuard] },
  { path: 'user/buytickets/:id/:name', loadComponent: () => import('./features/tickets/ticket-detail/ticket-detail').then(m => m.TicketDetailComponent), canActivate: [authGuard] },
  { path: 'user/ticket/createnew', loadComponent: () => import('./features/user/support/create-ticket/create-ticket').then(m => m.CreateTicketComponent), canActivate: [authGuard] },
  { path: 'user/support-ticket', loadComponent: () => import('./features/user/support/support-ticket/support-ticket').then(m => m.SupportTicketComponent), canActivate: [authGuard] },
  { path: 'user/support/chat', loadComponent: () => import('./features/user/support/chat-list/chat-list').then(m => m.ChatListComponent), canActivate: [authGuard] },
  { path: 'user/support/chat/:id/:name', loadComponent: () => import('./features/user/support/chat-detail/chat-detail').then(m => m.ChatDetailComponent), canActivate: [authGuard] },
  { path: 'user/information-user/:id/:name', loadComponent: () => import('./features/user/information/information').then(m => m.InformationComponent), canActivate: [authGuard] },
  { path: 'user/payment/:id', loadComponent: () => import('./features/payment/payment').then(m => m.PaymentComponent) },
  // Admin
 // Admin login - path riêng
{ path: 'admin-login', loadComponent: () => import('./features/admin/admin-signin/admin-signin').then(m => m.AdminSigninComponent) },

// Admin layout
{
  path: 'admin',
  loadComponent: () => import('./features/admin/admin-layout/admin-layout').then(m => m.AdminLayoutComponent),
  canActivate: [adminGuard],
  children: [
    { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    { path: 'dashboard', loadComponent: () => import('./features/admin/admin-dashboard/admin-dashboard').then(m => m.AdminDashboardComponent) },
    { path: 'statistics', loadComponent: () => import('./features/admin/admin-statistics/admin-statistics').then(m => m.AdminStatisticsComponent) },
    { path: 'manage-tickets', loadComponent: () => import('./features/admin/ticket-management/ticket-management').then(m => m.TicketManagementComponent) },
    { path: 'booked-tickets', loadComponent: () => import('./features/admin/booked-tickets/booked-tickets').then(m => m.BookedTicketsComponent) },
    { path: 'booked-tickets/pending', loadComponent: () => import('./features/admin/pending-tickets/pending-tickets').then(m => m.PendingTicketsComponent) },
    { path: 'booked-tickets/confirmed', loadComponent: () => import('./features/admin/confirmed-tickets/confirmed-tickets').then(m => m.ConfirmedTicketsComponent) },
    { path: 'booked-tickets/rejected', loadComponent: () => import('./features/admin/rejected-tickets/rejected-tickets').then(m => m.RejectedTicketsComponent) },
    { path: 'users', loadComponent: () => import('./features/admin/user-accounts/user-accounts').then(m => m.UserAccountsComponent) },
    { path: 'users/account-active', loadComponent: () => import('./features/admin/active-users/active-users').then(m => m.ActiveUsersComponent) },
    { path: 'users/account-locked', loadComponent: () => import('./features/admin/locked-users/locked-users').then(m => m.LockedUsersComponent) },
    { path: 'support', loadComponent: () => import('./features/admin/admin-support/admin-support').then(m => m.AdminSupportComponent) },
    { path: 'support/chat/:id/:name', loadComponent: () => import('./features/admin/admin-chat/admin-chat').then(m => m.AdminChatComponent) }
  ]
},

  // Policy
  { path: 'viserbus/policy/privacy-policy', loadComponent: () => import('./features/policy/privacy-policy/privacy-policy').then(m => m.PrivacyPolicyComponent) },
  { path: 'viserbus/policy/terms-of-service', loadComponent: () => import('./features/policy/terms-of-service/terms-of-service').then(m => m.TermsOfServiceComponent) },
  { path: 'viserbus/policy/ticket-policy', loadComponent: () => import('./features/policy/ticket-policy/ticket-policy').then(m => m.TicketPolicyComponent) },
  { path: 'viserbus/policy/refund-policy', loadComponent: () => import('./features/policy/refund-policy/refund-policy').then(m => m.RefundPolicyComponent) },

  // 404
  { path: '**', loadComponent: () => import('./page-not-found/page-not-found').then(m => m.PageNotFoundComponent) }
];