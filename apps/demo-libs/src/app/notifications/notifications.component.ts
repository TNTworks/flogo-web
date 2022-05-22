import { Component } from '@angular/core';
import { NotificationsService } from '@flogo-web/lib-client/notifications';

@Component({
  selector: 'demo-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.less'],
})
export class NotificationsComponent {
  constructor(private notificationsService: NotificationsService) {}

  showSuccess() {
    this.notificationsService.success('Woohoo! :D');
  }

  showError() {
    this.notificationsService.error(`Oh no :'(`);
  }

  showMany() {
    this.notificationsService.success('First');
    this.notificationsService.error('Middle');
    this.notificationsService.success('Last');
  }

  showWithTimeout(timeoutMs) {
    this.notificationsService.success(`I will dissapear in ${timeoutMs} ms`, timeoutMs);
  }
}
