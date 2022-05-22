import { isEmpty } from 'lodash';
import { of } from 'rxjs';
import { tap, take, switchMap, catchError, filter, map } from 'rxjs/operators';

import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Action, Store } from '@ngrx/store';

import {
  AppResourceService,
  ContributionsService,
  ResourceService,
} from '@flogo-web/lib-client/core';
import { LanguageService } from '@flogo-web/lib-client/language';
import { NotificationsService } from '@flogo-web/lib-client/notifications';
import {
  ConfirmationModalService,
  ConfirmationResult,
} from '@flogo-web/lib-client/confirmation';

import {
  FlogoStreamState,
  Init,
  RevertName,
  StreamActionType,
  StreamStoreState,
} from './state';
import * as streamSelectors from './state/stream.selectors';
import { generateStateFromResource, generateResourceFromState } from './models';

@Injectable()
export class StreamService {
  previousStream = null;
  constructor(
    private translate: LanguageService,
    private confirmationModal: ConfirmationModalService,
    private contribService: ContributionsService,
    private resourceService: ResourceService,
    private notifications: NotificationsService,
    private appResourceService: AppResourceService,
    private router: Router,
    private store: Store<StreamStoreState>
  ) {}

  /* streams-plugin-todo: Replace any with API resource interface of Stream */
  loadStream(resource: any) {
    return this.contribService.listContribs().then(contributions => {
      this.previousStream = resource;
      /* streams-plugin-todo: need to process only app name and app id in app object in designer page */
      this.store.dispatch(
        new Init(generateStateFromResource(resource, contributions) as FlogoStreamState)
      );
    });
  }

  listStreamsByName(appId, name) {
    return this.resourceService.listResourcesWithName(name, appId);
  }

  saveStreamName() {
    return this.store.select(streamSelectors.selectStreamState).pipe(
      take(1),
      switchMap(state => {
        return this.listStreamsByName(state.app.id, state.name).pipe(
          switchMap(streams => {
            const results = streams || [];
            if (!isEmpty(results)) {
              if (results[0].id === state.id) {
                return;
              }
              /* streams-plugin-todo: create reusable method for success/error notifications */
              this.notifications.error({
                key: 'STREAMS.DESIGNER:ERROR-STREAM-NAME-EXISTS',
                params: { value: state.name },
              });
              this.store.dispatch(new RevertName(this.previousStream.name));
              return of(false);
            } else {
              const updatedStream = generateResourceFromState(state);
              return this.resourceService.updateResource(state.id, updatedStream).pipe(
                tap(() => {
                  this.previousStream = updatedStream;
                  this.notifications.success({
                    key: 'STREAMS.DESIGNER:SUCCESS-UPDATE-STREAM',
                    params: { value: 'name' },
                  });
                })
              );
            }
          }),
          catchError(() => {
            this.notifications.error({
              key: 'STREAMS.DESIGNER:ERROR-UPDATE-STREAM',
              params: { value: 'name' },
            });
            return of(false);
          })
        );
      })
    );
  }

  saveStream(action?: Action) {
    return this.store.select(streamSelectors.selectStreamState).pipe(
      take(1),
      switchMap(state => {
        const updatedStream = generateResourceFromState(state);
        return this.resourceService.updateResource(state.id, updatedStream).pipe(
          tap(() => {
            this.previousStream = updatedStream;
            if (action && action.type === StreamActionType.ChangeDescription) {
              this.notifications.success({
                key: 'STREAMS.DESIGNER:SUCCESS-UPDATE-STREAM',
                params: { value: 'description' },
              });
            }
          }),
          catchError(() => {
            if (action.type === StreamActionType.ChangeDescription) {
              this.notifications.error({
                key: 'STREAMS.DESIGNER:ERROR-UPDATE-STREAM',
                params: { value: 'description' },
              });
            }
            return of(false);
          })
        );
      })
    );
  }

  getDeleteStageConfirmation(itemId) {
    return this.translate
      .get(['STREAMS.DESIGNER:CONFIRM-STAGE-DELETE', 'MODAL:CONFIRM-DELETION'])
      .pipe(
        switchMap(
          translations =>
            this.confirmationModal.openModal({
              title: translations['MODAL:CONFIRM-DELETION'],
              textMessage: translations['STREAMS.DESIGNER:CONFIRM-STAGE-DELETE'],
            }).result
        ),
        filter(result => result === ConfirmationResult.Confirm),
        map(() => itemId)
      );
  }

  deleteStream(stream) {
    this.translate
      .get(['STREAMS.DELETE-STREAM:CONFIRM_DELETE', 'MODAL:CONFIRM-DELETION'], {
        streamName: stream.name,
      })
      .pipe(
        switchMap(
          translation =>
            this.confirmationModal.openModal({
              title: translation['MODAL:CONFIRM-DELETION'],
              textMessage: translation['STREAMS.DELETE-STREAM:CONFIRM_DELETE'],
            }).result
        ),
        filter(result => result === ConfirmationResult.Confirm),
        switchMap(() => this.appResourceService.deleteResource(stream.id))
      )
      .subscribe(
        () => {
          this.navigateToApp(stream.app.id);
          this.notifications.success({
            key: 'STREAMS.DELETE-STREAM:SUCCESS-MESSAGE-STREAM-DELETED',
          });
        },
        err => {
          console.error(err);
          this.notifications.error({
            key: 'STREAMS.DELETE-STREAM:ERROR-MESSAGE-DELETE-STREAM',
            params: err,
          });
        }
      );
  }

  navigateToApp(appId) {
    this.router.navigate(['/apps', appId]);
  }
}
