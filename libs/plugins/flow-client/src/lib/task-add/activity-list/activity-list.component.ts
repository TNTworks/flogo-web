import {
  Component,
  ElementRef,
  HostBinding,
  ViewChildren,
  QueryList,
  HostListener,
  Input,
  AfterViewInit,
  OnDestroy,
  OnChanges,
  SimpleChanges,
  EventEmitter,
  Output,
} from '@angular/core';
import { select, Store } from '@ngrx/store';
import { takeUntil } from 'rxjs/operators';
import { ActiveDescendantKeyManager } from '@angular/cdk/a11y';
import { UP_ARROW, DOWN_ARROW, ENTER } from '@angular/cdk/keycodes';
import { SingleEmissionSubject } from '@flogo-web/lib-client/core';

import { Activity } from '../core/task-add-options';
import { ActivityComponent } from './activity.component';
import { FlowState, getTaskInsertType } from '../../core/state';

@Component({
  selector: 'flogo-flow-activity-list',
  templateUrl: './activity-list.component.html',
  styleUrls: ['./activity-list.component.less'],
})
export class ActivityListComponent implements OnChanges, AfterViewInit, OnDestroy {
  @Input() activities: Activity[];
  @Output() selectActivity = new EventEmitter<Activity>();

  @HostBinding('attr.role') role = 'listbox';
  @HostBinding('tabindex') tabIndex = '0';
  @ViewChildren(ActivityComponent)
  optionListItems: QueryList<ActivityComponent>;
  // second list because there's no way to get the component reference and the element ref at the same time
  @ViewChildren(ActivityComponent, { read: ElementRef }) optionListItemsRefs: QueryList<
    ElementRef
  >;

  private isClicking: boolean;
  private keyboardEventsManager: ActiveDescendantKeyManager<ActivityComponent>;
  private destroy$ = SingleEmissionSubject.create();
  isInsertInBetween: boolean;

  constructor(private elementRef: ElementRef, private store: Store<FlowState>) {
    this.store
      .pipe(select(getTaskInsertType), takeUntil(this.destroy$))
      .subscribe(isInBetween => (this.isInsertInBetween = isInBetween));
  }

  ngAfterViewInit() {
    this.keyboardEventsManager = new ActiveDescendantKeyManager(this.optionListItems);
    this.keyboardEventsManager.change.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.ensureCurrentListOptionVisible();
    });
  }

  ngOnChanges({ activities: activitiesChange }: SimpleChanges): void {
    if (activitiesChange && this.keyboardEventsManager) {
      this.keyboardEventsManager.setActiveItem(null);
    }
  }

  ngOnDestroy() {
    this.destroy$.emitAndComplete();
  }

  @HostListener('focus')
  onFocus() {
    if (this.isClicking) {
      this.elementRef.nativeElement.blur();
      return;
    }

    if (!this.keyboardEventsManager.activeItem) {
      this.keyboardEventsManager.setFirstItemActive();
    }
  }

  @HostListener('keydown', ['$event'])
  listKeyDown(event) {
    if (event.keyCode === UP_ARROW || event.keyCode === DOWN_ARROW) {
      this.keyboardEventsManager.onKeydown(event);
      event.preventDefault();
    } else if (event.keyCode === ENTER && this.keyboardEventsManager.activeItem) {
      this.keyboardEventsManager.activeItem.select();
      event.preventDefault();
    }
  }

  @HostListener('mousedown')
  onClickStart() {
    this.isClicking = true;
  }

  @HostListener('mouseup')
  onClickEnd() {
    this.isClicking = false;
  }

  private ensureCurrentListOptionVisible() {
    if (!this.keyboardEventsManager.activeItem) {
      return;
    }

    const list = this.elementRef.nativeElement;
    const listBottom = list.scrollTop + list.clientHeight;

    const currentListItem = this.optionListItemsRefs.toArray()[
      this.keyboardEventsManager.activeItemIndex
    ].nativeElement;
    const currentElementTop = currentListItem.offsetTop - list.offsetTop;
    const currentElementBottom = currentElementTop + currentListItem.clientHeight;

    const isNotVisible =
      currentElementTop < list.scrollTop || currentElementBottom > listBottom;
    if (isNotVisible) {
      currentListItem.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    }
  }
}
