import { Injectable, NotFoundException } from '@nestjs/common';
import { NotificationResponseDto } from './dto/notification-response.dto';

interface Notification extends NotificationResponseDto {
  userId: string;
}

@Injectable()
export class NotificationsService {
  // Mock data - replace with actual database implementation
  private notifications: Notification[] = [
    {
      id: '1',
      title: 'Application Status Update',
      message: 'Your scholarship application has been approved!',
      type: 'APPLICATION_UPDATE',
      isRead: false,
      userId: 'current-user',
      createdAt: new Date(),
    },
    {
      id: '2',
      title: 'New Scholarship Available',
      message: 'A new scholarship matching your profile is now available.',
      type: 'SCHOLARSHIP_UPDATE',
      isRead: false,
      userId: 'current-user',
      createdAt: new Date(Date.now() - 86400000), // 1 day ago
    },
    {
      id: '3',
      title: 'Document Upload Required',
      message: 'Please upload your official transcript to complete your application.',
      type: 'REMINDER',
      isRead: true,
      userId: 'current-user',
      createdAt: new Date(Date.now() - 172800000), // 2 days ago
    },
  ];

  async findAll(filters: { unreadOnly?: boolean; limit?: number }): Promise<NotificationResponseDto[]> {
    let filtered = [...this.notifications];

    // Filter by current user (mock - should get from JWT)
    filtered = filtered.filter(notification => notification.userId === 'current-user');

    if (filters.unreadOnly) {
      filtered = filtered.filter(notification => !notification.isRead);
    }

    // Sort by creation date (newest first)
    filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    if (filters.limit) {
      filtered = filtered.slice(0, filters.limit);
    }

    // Return without userId for client
    return filtered.map(({ userId, ...notification }) => notification);
  }

  async getUnreadCount(): Promise<{ count: number }> {
    const unreadCount = this.notifications.filter(
      notification => notification.userId === 'current-user' && !notification.isRead
    ).length;

    return { count: unreadCount };
  }

  async markAsRead(id: string): Promise<NotificationResponseDto> {
    const notification = this.notifications.find(n => n.id === id && n.userId === 'current-user');
    
    if (!notification) {
      throw new NotFoundException(`Notification with ID ${id} not found`);
    }

    notification.isRead = true;
    const { userId, ...result } = notification;
    return result;
  }

  async markAllAsRead(): Promise<{ message: string; count: number }> {
    const userNotifications = this.notifications.filter(
      notification => notification.userId === 'current-user' && !notification.isRead
    );

    userNotifications.forEach(notification => {
      notification.isRead = true;
    });

    return {
      message: 'All notifications marked as read',
      count: userNotifications.length,
    };
  }

  async remove(id: string): Promise<void> {
    const index = this.notifications.findIndex(n => n.id === id && n.userId === 'current-user');
    
    if (index === -1) {
      throw new NotFoundException(`Notification with ID ${id} not found`);
    }

    this.notifications.splice(index, 1);
  }

  // Helper method to create new notifications (not exposed via controller)
  async create(notificationData: Omit<Notification, 'id' | 'createdAt'>): Promise<Notification> {
    const notification: Notification = {
      id: Math.random().toString(36).substr(2, 9),
      ...notificationData,
      createdAt: new Date(),
    };

    this.notifications.push(notification);
    return notification;
  }
}
