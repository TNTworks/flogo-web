import { Injectable, InjectionToken, Injector } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal, PortalInjector } from '@angular/cdk/portal';
import { Observable } from 'rxjs';

import { Resource } from '@flogo-web/core';

import { FlowActions, FlowSelectors, FlowState } from '../core/state';
import { TaskAddComponent, TASKADD_OPTIONS } from './task-add.component';
import { Activity, TaskAddOptions } from './core/task-add-options';
import { createTaskAddAction } from './models/task-add-action-creator';

@Injectable()
export class AddActivityService {
  shouldKeepPopoverActive: boolean;
  popoverReference: OverlayRef;

  private installedActivities$: Observable<Activity[]>;
  private appAndFlowInfo$: TaskAddOptions['appAndFlowInfo$'];
  private contentPortal: ComponentPortal<TaskAddComponent>;
  private parentId: string;

  constructor(
    private store: Store<FlowState>,
    private injector: Injector,
    private overlay: Overlay
  ) {}

  startSubscriptions() {
    this.installedActivities$ = this.store.pipe(
      select(FlowSelectors.getInstalledActivities)
    );
    this.appAndFlowInfo$ = this.store.pipe(select(FlowSelectors.selectAppAndFlowInfo));
  }

  cancel() {
    this.close();
    this.store.dispatch(new FlowActions.CancelCreateItem({ parentId: this.parentId }));
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
      this.contentPortal = new ComponentPortal(TaskAddComponent, null, injector);
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
    InjectionToken<TaskAddOptions>,
    TaskAddOptions
  > {
    const taskAddOptions: TaskAddOptions = {
      activities$: this.installedActivities$,
      appAndFlowInfo$: this.appAndFlowInfo$,
      selectActivity: (ref: string, selectedSubFlow?: Resource) =>
        this.selectedActivity(ref, selectedSubFlow),
      updateActiveState: (isOpen: boolean) => (this.shouldKeepPopoverActive = isOpen),
      cancel: () => this.cancel(),
    };
    return new WeakMap<InjectionToken<TaskAddOptions>, TaskAddOptions>().set(
      TASKADD_OPTIONS,
      taskAddOptions
    );
  }

  private selectedActivity(ref: string, flowData?: Resource) {
    createTaskAddAction(this.store, { ref, flowData }).subscribe(
      (action: FlowActions.TaskItemCreated) => {
        this.store.dispatch(action);
      }
    );
  }
}
