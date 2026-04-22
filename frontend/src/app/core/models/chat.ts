export interface Chat {
  id: number;
  description: string;
  lastMessage: string | null;
  status: number;
  statusName: string;
  priority: number;
  priorityName: string;
  userName: string;
  createdAt: string;
  updatedAt: string;
  messages?: ChatMessage[];
}

export interface ChatMessage {
  id: number;
  senderType: 'USER' | 'ADMIN';
  message: string;
  createdAt: string;
}

export interface CreateChatRequest {
  description: string;
  priority: number;
  message: string;
}

export interface DashboardStats {
  totalTickets: number;
  totalBookings: number;
  confirmedBookings: number;
  rejectedBookings: number;
  pendingBookings: number;
  totalRevenue: number;
  successRate: number;
  totalUsers: number;
  activeUsers: number;
  lockedUsers: number;
  verifiedUsers: number; 
}