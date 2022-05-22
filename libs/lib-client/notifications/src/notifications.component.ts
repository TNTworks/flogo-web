import { Observable } from 'rxjs';
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Notification } from './notifications';
import { NotificationsService } from './notifications.service';
import { trigger, transition, style, sequence, animate } from '@angular/animations';

@Component({
  selector: 'flogo-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.less'],
  animations: [
    trigger('notificationAnim', [
      transition(':enter', [
        style({ height: 0, opacity: 0, transform: 'translateY(-1rem)' }),
        sequence([
          animate('100ms ease', style({ height: '*', opacity: 0.2 })),
          animate(
            '200ms cubic-bezier(0.0, 0.0, 0.2, 1)',
            style({ height: '*', opacity: 1, transform: 'translateY(0)' })
          ),
        ]),
      ]),
      transition(':leave', [
        style({ height: '*', opacity: 1, transform: 'translateY(0)' }),
        sequence([
          animate(
            '100ms cubic-bezier(0.4, 0.0, 1, 1)',
            style({ height: '*', opacity: 0.2, transform: 'translateY(-1rem)' })
          ),
          animate(
            '100ms cubic-bezier(0.4, 0.0, 1, 1)',
            style({ height: 0, opacity: 0, transform: 'translateY(-1rem)' })
          ),
        ]),
      ]),
    ]),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificationsComponent {
  notifications$: Observable<Notification[]>;

  constructor(private notificationsService: NotificationsService) {
    this.notifications$ = notificationsService.notifications$;
  }

  close(notification: Notification) {
    this.notificationsService.removeNotification(notification);
  }
}
