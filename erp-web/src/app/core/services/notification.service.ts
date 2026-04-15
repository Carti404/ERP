import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { apiBaseUrl } from '../environment';

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'INFO' | 'ALERT' | 'SUCCESS';
  category: 'PRODUCTION_ASSIGNED' | 'PRODUCTION_COMPLETED' | 'LEAVE_REQUEST' | 'ATTENDANCE_INCIDENCE' | 'GENERAL';
  isRead: boolean;
  referenceId: string | null;
  createdAt: string;
}

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private readonly http = inject(HttpClient);

  /** Get all notifications for the current user, optionally filtered by category */
  getMyNotifications(category?: string): Observable<AppNotification[]> {
    const url = category
      ? `${apiBaseUrl}/notifications?category=${category}`
      : `${apiBaseUrl}/notifications`;
    return this.http.get<AppNotification[]>(url);
  }

  /** Get unread count */
  getUnreadCount(): Observable<{ count: number }> {
    return this.http.get<{ count: number }>(`${apiBaseUrl}/notifications/unread-count`);
  }

  /** Mark a single notification as read */
  markAsRead(id: string): Observable<AppNotification> {
    return this.http.patch<AppNotification>(`${apiBaseUrl}/notifications/${id}/read`, {});
  }

  /** Mark all notifications as read */
  markAllAsRead(): Observable<any> {
    return this.http.post(`${apiBaseUrl}/notifications/mark-all-read`, {});
  }

  /** Mark all notifications of a specific category as read */
  markByCategoryAsRead(category: string): Observable<any> {
    return this.http.patch(`${apiBaseUrl}/notifications/category/${category}/read`, {});
  }

  /** Delete/clear notifications, optionally filtered by category */
  clearNotifications(category?: string): Observable<any> {
    const url = category
      ? `${apiBaseUrl}/notifications?category=${category}`
      : `${apiBaseUrl}/notifications`;
    return this.http.delete(url);
  }
}
