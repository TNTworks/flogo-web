import { Subject } from 'rxjs';
import { take, switchMap, tap } from 'rxjs/operators';
import { Router, NavigationStart } from '@angular/router';
import { async, fakeAsync, tick, flush } from '@angular/core/testing';

import { NotificationsService } from './notifications.service';

describe('NotificationsService', () => {
  let notificationsService: NotificationsService;
  let fakeRouter: Partial<Router>;
  const takeOneEmission = () => notificationsService.notifications$.pipe(take(1));
  beforeEach(() => {
    fakeRouter = { events: new Subject() };
    notificationsService = new NotificationsService(fakeRouter as Router);
  });
  afterEach(() => notificationsService.destroy());

  it('Adds success notifications', async(() => {
    notificationsService.success('this was successful', 0);
    takeOneEmission().subscribe(n =>
      expect(n).toEqual([{ type: 'success', message: 'this was successful' }])
    );
  }));

  it('Adds error notifications', async(() => {
    notificationsService.error('this was an error', 0);
    takeOneEmission().subscribe(n =>
      expect(n).toEqual([{ type: 'error', message: 'this was an error' }])
    );
  }));

  it('New notifications are prepended', async(() => {
    notificationsService.success('first notification', 0);
    notificationsService.success('second notification', 0);
    takeOneEmission().subscribe(n =>
      expect(n).toEqual([
        { type: 'success', message: 'second notification' },
        { type: 'success', message: 'first notification' },
      ])
    );
  }));

  it('Automatically removes notifications when time specified', fakeAsync(() => {
    notificationsService.success('first notification', 0);
    notificationsService.success('second notification', 20);
    notificationsService.success('third notification', 0);
    takeOneEmission()
      .pipe(
        tap(n => {
          expect(n).toEqual([
            { type: 'success', message: 'third notification' },
            { type: 'success', message: 'second notification' },
            { type: 'success', message: 'first notification' },
          ]);
          tick(30);
        }),
        switchMap(() => takeOneEmission())
      )
      .subscribe(n =>
        expect(n).toEqual([
          { type: 'success', message: 'third notification' },
          { type: 'success', message: 'first notification' },
        ])
      );
  }));

  it('Allows to manually remove notifications', async(() => {
    notificationsService.success('first notification', 0);
    notificationsService.success('this one will be removed', 0);
    notificationsService.error('another notification', 0);
    takeOneEmission()
      .pipe(
        tap(notifications => notificationsService.removeNotification(notifications[1])),
        switchMap(() => takeOneEmission())
      )
      .subscribe(n =>
        expect(n).toEqual([
          { type: 'error', message: 'another notification' },
          { type: 'success', message: 'first notification' },
        ])
      );
  }));

  it('Automatically removes notifications on route change', fakeAsync(() => {
    notificationsService.success('first notification', 0);
    notificationsService.success('second notification', 0);
    notificationsService.error('third notification', 0);
    const routerEvents = fakeRouter.events as Subject<any>;
    takeOneEmission()
      .pipe(
        tap(() => {
          routerEvents.next(new NavigationStart(0, 'something'));
          flush();
        }),
        switchMap(() => takeOneEmission())
      )
      .subscribe(n => expect(n).toEqual([]));
  }));
});
