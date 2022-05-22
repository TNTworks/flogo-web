import { Observable, BehaviorSubject } from 'rxjs';
import { Notification, NotificationMessage } from '../src/notifications';
import { NotificationsService } from '../src/notifications.service';

export class NotificationsServiceMock implements Partial<NotificationsService> {
  notificationsSource = new BehaviorSubject([]);

  destroy(): void {}

  error(message: NotificationMessage, timeout?: number): void {}

  get notifications$(): Observable<any[]> {
    return this.notificationsSource.asObservable();
  }

  removeNotification(notification: Notification): void {}

  success(message: NotificationMessage, timeout?: number): void {}
}
