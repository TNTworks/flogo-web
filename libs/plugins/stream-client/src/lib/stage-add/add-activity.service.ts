import { Injectable, InjectionToken, Injector } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal, PortalInjector } from '@angular/cdk/portal';
import { Observable } from 'rxjs';

import { StreamActions, StreamSelectors, FlogoStreamState } from '../core/state';
import { StageAddComponent, STAGEADD_OPTIONS } from './stage-add.component';
import { Activity, StageAddOptions } from './core/stage-add-options';
import { createStageAddAction } from './models/stage-add-action-creator';

@Injectable()
export class AddActivityService {
  shouldKeepPopoverActive: boolean;
  popoverReference: OverlayRef;

  private installedActivities$: Observable<Activity[]>;
  private contentPortal: ComponentPortal<StageAddComponent>;
  private parentId: string;

  constructor(
    private store: Store<FlogoStreamState>,
    private injector: Injector,
    private overlay: Overlay
  ) {}

  startSubscriptions() {
    this.installedActivities$ = this.store.pipe(
      select(StreamSelectors.getInstalledActivities)
    );
  }

  cancel() {
    this.close();
    this.store.dispatch(new StreamActions.CancelCreateStage(this.parentId));
  }

  closeAndDestroy() {
    if (this.popoverReference) {
      this.popoverReference.dispose();
      this.popoverReference = null;
    }
  }

  open(attachTo: HTMLElement, parentId: string) {
    this.parentId = parentId;
    const positionStrategy = this.overlay
      .position()
      .flexibleConnectedTo(attachTo)
      .withPositions([
        { originX: 'end', originY: 'top', overlayX: 'start', overlayY: 'top' },
        { originX: 'start', originY: 'top', overlayX: 'end', overlayY: 'top' },
        {
          originX: 'end',
          originY: 'bottom',
          overlayX: 'start',
          overlayY: 'bottom',
        },
        {
          originX: 'start',
          originY: 'bottom',
          overlayX: 'end',
          overlayY: 'bottom',
        },
      ]);
    if (!this.contentPortal) {
      const customTokens = this.createInjectorTokens();
      const injector = new PortalInjector(this.injector, customTokens);
      this.contentPortal = new ComponentPortal(StageAddComponent, null, injector);
    }
    if (!this.popoverReference) {
      this.popoverReference = this.overlay.create();
    }
    if (!this.popoverReference.hasAttached()) {
      this.popoverReference.attach(this.contentPortal);
    }
    positionStrategy.attach(this.popoverReference);
    positionStrategy.apply();
  }

  close() {
    if (this.popoverReference && this.popoverReference.hasAttached()) {
      this.popoverReference.detach();
    }
    if (this.contentPortal && this.contentPortal.isAttached) {
      this.contentPortal.detach();
    }
  }

  private createInjectorTokens(): WeakMap<
    InjectionToken<StageAddOptions>,
    StageAddOptions
  > {
    const stageAddOptions: StageAddOptions = {
      activities$: this.installedActivities$,
      selectActivity: (ref: string) => this.selectedActivity(ref),
      updateActiveState: (isOpen: boolean) => (this.shouldKeepPopoverActive = isOpen),
      cancel: () => this.cancel(),
    };
    return new WeakMap<InjectionToken<StageAddOptions>, StageAddOptions>().set(
      STAGEADD_OPTIONS,
      stageAddOptions
    );
  }

  private selectedActivity(ref: string) {
    createStageAddAction(this.store, { ref }).subscribe(
      (action: StreamActions.StageItemCreated) => {
        this.store.dispatch(action);
      }
    );
  }
}
