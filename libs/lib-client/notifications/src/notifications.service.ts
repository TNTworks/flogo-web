import { Injectable } from '@angular/core';
import { BehaviorSubject, timer, Observable, Subscription } from 'rxjs';
import { Router, NavigationStart } from '@angular/router';
import { filter, take, takeUntil } from 'rxjs/operators';
import { Notification, NotificationMessage } from './notifications';

const keepPersistableOnly = (notifications: Notification[]) =>
  notifications.filter(n => n.persistAfterNavigation);
const DEFAULT_TIMEOUT = 4500;

@Injectable({
  providedIn: 'root',
})
export class NotificationsService {
  private notificationsSource = new BehaviorSubject([]);
  private routeChange$: Observable<any>;
  private navigationSubscription: Subscription;

  constructor(private router: Router) {
    this.routeChange$ = router.events.pipe(
      filter(event => event instanceof NavigationStart)
    );
    this.navigationSubscription = this.routeChange$.subscribe(() => this.onNavigation());
  }

  get notifications$() {
    return this.notificationsSource.asObservable();
  }

  success(message: NotificationMessage, timeout = DEFAULT_TIMEOUT) {
    this.addNotification({ type: 'success', message }, timeout);
  }

  error(message: NotificationMessage, timeout = DEFAULT_TIMEOUT) {
    this.addNotification({ type: 'error', message }, timeout);
  }

  removeNotification(notification: Notification) {
    this.updateNotifications(current => current.filter(n => n !== notification));
  }

  destroy() {
    this.navigationSubscription.unsubscribe();
  }

  private addNotification(notification: Notification, timeout?: number) {
    this.updateNotifications((current: Notification[]) => [notification, ...current]);
    if (timeout) {
      this.waitAndRemove(notification, timeout);
    }
  }

  private waitAndRemove(notification: Notification, waitMs: number) {
    const operators = [take(1)];
    if (!notification.persistAfterNavigation) {
      // in case route changes before timeout, notification should be removed by route cleaner
      operators.push(takeUntil(this.getNextRouteChange()));
    }
    timer(waitMs)
      // @ts-ignore https://github.com/ReactiveX/rxjs/issues/3989
      .pipe(...operators)
      .subscribe(() => this.removeNotification(notification));
  }

  private getNextRouteChange() {
    return this.routeChange$.pipe(take(1));
  }

  private onNavigation() {
    this.updateNotifications(keepPersistableOnly);
  }

  private updateNotifications(
    update: (currentNotifications: Notification[]) => Notification[]
  ) {
    const currentNotifications = this.notificationsSource.getValue();
    const nextNotifications = update(currentNotifications);
    if (nextNotifications !== currentNotifications) {
      this.notificationsSource.next(nextNotifications);
    }
  }
}
